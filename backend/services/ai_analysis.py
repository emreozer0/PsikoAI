"""
AI analiz mantığının tamamı burada. Router (routers/analiz.py) bu fonksiyonu
çağırır, kendi mantık taşımaz.
"""
import json
import logging
import time
from pathlib import Path

from groq import Groq, RateLimitError
from pydantic import ValidationError

from core.config import settings
from schemas.formulation_schema import FormulationOutput

logger = logging.getLogger(__name__)

client = Groq(api_key=settings.groq_api_key)

# prompts/healphia_system_prompt.md dosyasını oku
PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "healphia_system_prompt.md"
SYSTEM_PROMPT = PROMPT_PATH.read_text(encoding="utf-8")

MAX_RETRY = 2


def _build_user_message(transkript: str, onceki_formulasyon: dict | None,
                          seans_no: int, seans_tarihi: str) -> str:
    onceki_json = json.dumps(onceki_formulasyon, ensure_ascii=False, indent=2) \
        if onceki_formulasyon else "Yok — bu ilk seans veya önceki onaylı veri bulunamadı."

    return f"""Seans numarası: {seans_no}
Seans tarihi: {seans_tarihi}

Önceki onaylı formülasyon (JSON):
{onceki_json}

Bu seansın transkripti:
{transkript}

Yukarıdaki sistem promptundaki JSON şemasına TAM UYGUN, SADECE geçerli JSON
döndür. Açıklama, markdown kod bloğu (```), veya başka hiçbir metin ekleme —
yanıtın tamamı doğrudan json.loads() ile parse edilebilir olmalı."""


def analyze_session(
    transkript: str,
    onceki_formulasyon: dict | None = None,
    seans_no: int = 1,
    seans_tarihi: str = "",
) -> FormulationOutput:
    """
    Transkripti analiz eder ve şemaya uygun FormulationOutput döner.
    Geçersiz JSON gelirse MAX_RETRY kadar tekrar dener.
    """
    user_message = _build_user_message(transkript, onceki_formulasyon, seans_no, seans_tarihi)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    last_error = None
    for attempt in range(MAX_RETRY + 1):
        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                temperature=0.3,
                messages=messages,
            )
        except RateLimitError as e:
            last_error = e
            logger.warning(f"Deneme {attempt + 1}: rate limit, bekleniyor — {e}")
            time.sleep(3)
            continue

        raw_text = completion.choices[0].message.content.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`").removeprefix("json").strip()

        try:
            parsed = json.loads(raw_text)

            # --- SANİTİZASYON: bildiğimiz alanları modele güvenmek yerine
            # doğrudan koddan set ediyoruz. Model bunları atlasa/yanlış
            # yazsa bile pipeline kırılmasın. ---
            parsed.setdefault("meta", {})
            parsed["meta"]["session_number"] = seans_no
            parsed["meta"]["session_date"] = seans_tarihi

            parsed.setdefault("risk_screening", {})
            if not parsed["risk_screening"].get("flag_type"):
                parsed["risk_screening"]["flag_type"] = ["yok"]
            if parsed["risk_screening"].get("flag_raised") is None:
                parsed["risk_screening"]["flag_raised"] = False
            if parsed["risk_screening"].get("raw_quote_or_paraphrase") is None:
                parsed["risk_screening"]["raw_quote_or_paraphrase"] = ""

            # --- relevant_history KALICILIK MANTIĞI ---
            # Bu alan modelin her seansta yeniden üretmesi gereken bir alan
            # DEĞİL. Model "bu seansta yeni bir şey yok" deyip alanı boş/None
            # bıraksa bile, önceki onaylı formülasyonda bir yaşam tarihi
            # varsa onu koruyoruz — koda güveniyoruz, modele değil.
            new_history = parsed.get("relevant_history")
            prev_history = (onceki_formulasyon or {}).get("relevant_history")
            if (not new_history or not new_history.get("updated_this_session")) and prev_history:
                parsed["relevant_history"] = {
                    **prev_history,
                    "updated_this_session": False,
                }

            return FormulationOutput.model_validate(parsed)
        except (json.JSONDecodeError, ValidationError) as e:
            last_error = e
            logger.warning(f"Deneme {attempt + 1}: geçersiz çıktı — {e}")
            # Modele aynı hatayı kör tekrar ettirmek yerine, ne yanlış gittiğini
            # ve konuşma geçmişini birlikte veriyoruz ki bir sonraki denemede
            # gerçekten düzeltsin.
            messages.append({"role": "assistant", "content": raw_text})
            if isinstance(e, json.JSONDecodeError):
                duzeltme_talebi = (
                    f"Önceki yanıtın geçerli JSON DEĞİLDİ, şu hatayı aldım: {e}. "
                    "Muhtemel sebep: bir string değerin İÇİNE kaçmamış çift tırnak (\") "
                    "koymuş olman (örn. alıntı yaparken). Çift tırnağı SİL veya tek "
                    "tırnak (') kullan. SADECE düzeltilmiş, geçerli JSON'ı yeniden "
                    "üret — açıklama ekleme, markdown kod bloğu kullanma."
                )
            else:
                duzeltme_talebi = (
                    f"Önceki yanıtın JSON şemasına uymuyordu: {e}. Şemadaki alan "
                    "adlarına ve tiplerine tam uyacak şekilde SADECE düzeltilmiş "
                    "JSON'ı yeniden üret."
                )
            messages.append({"role": "user", "content": duzeltme_talebi})
            continue

    raise ValueError(f"Model {MAX_RETRY + 1} denemede de geçerli JSON üretemedi: {last_error}")