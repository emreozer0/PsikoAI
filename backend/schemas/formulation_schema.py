"""
JSON şemasının Pydantic karşılığı — ESNEK SÜRÜM.

Tasarım ilkesi: Modelin her bölümü zorla doldurması istenmiyor. Transkriptte
kanıt yoksa alan boş/None kalabilir. Bu yüzden neredeyse her şey Optional
veya boş liste varsayılanlı. Amaç: modelin "veri yok ama bir şey yazmalıyım"
baskısıyla uydurma (hallucination) yapmasını önlemek.
"""
from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import date, datetime


class BeliefItem(BaseModel):
    text: str
    intensity: float = Field(ge=0, le=10)
    trigger_context: str = ""
    distortion_tags: list[str] = []


class Meta(BaseModel):
    session_number: int
    session_date: date
    transcript_source_id: Optional[str] = None
    generated_at: Optional[datetime] = None
    model_confidence_note: Optional[str] = None
    # Bu seansta hangi bölümler için yeterli veri BULUNAMADI — şeffaflık için
    sections_with_insufficient_data: list[str] = []


class RiskScreening(BaseModel):
    """S13'ün yerine geçmez, sadece ham işaret iletir."""
    flag_raised: bool = False
    flag_type: Optional[list[Literal[
        "intihar_düşüncesi", "kendine_zarar", "başkasına_zarar",
        "istismar_bildirimi", "madde_kullanımı_artışı", "yok"
    ]]] = None
    raw_quote_or_paraphrase: str = ""


class CognitiveStructure(BaseModel):
    core_beliefs: Optional[list[BeliefItem]] = None
    intermediate_beliefs: Optional[list[BeliefItem]] = None
    automatic_thoughts_this_session: Optional[list[BeliefItem]] = None


class Distortion(BaseModel):
    name: str
    activation_score: float = Field(ge=0, le=10)
    previous_score: Optional[float] = None
    example_quote: str
    status: Literal["birincil", "ikincil", "pasif"]


class DistortionProfile(BaseModel):
    distortions: Optional[list[Distortion]] = None


class ThoughtLogEntry(BaseModel):
    situation_trigger: str
    automatic_thought: str
    emotion: str = ""
    emotion_intensity: Optional[float] = Field(default=None, ge=0, le=10)
    distortion_tags: list[str] = []
    belief_strength: Optional[float] = Field(default=None, ge=0, le=10)


class ViciousCycle(BaseModel):
    """Bu seansta net bir döngü gözlenmediyse tüm nesne None olabilir."""
    trigger: str
    automatic_thought: str
    emotion_body: str
    behavior: str
    self_reinforcement_note: str = ""


class BehavioralAnalysis(BaseModel):
    avoidance_behaviors: list[str] = []
    safety_behaviors: list[str] = []
    functional_behaviors: list[str] = []
    cost_of_avoidance: list[str] = []


class RelevantHistory(BaseModel):
    """
    Yaşam Tarihi (panel bölüm 03). DiaCBT'deki 'Relevant History' bileşenine
    karşılık gelir — erken yaşam örüntüsünün temel inançlarla bağlantısını
    kurar. ÖNEMLİ: Bu alan diğerlerinden farklı davranır — her seansta
    yeniden üretilmez. previous_formulation'dan taşınır ve sadece transkriptte
    GERÇEKTEN YENİ bir geçmiş/yaşam öyküsü bilgisi ortaya çıkarsa güncellenir.
    """
    narrative_text: str
    updated_this_session: bool = False
    source_quote: str = ""


class PsychometricScore(BaseModel):
    """
    Psikometrik Ölçekler (panel bölüm 09). Sadece terapist veya danışan
    transkriptte açıkça bir ölçek adı ve puan telaffuz ettiyse doldurulur
    (örn. "BDI'n 18'e düştü"). Çıkarım YAPILMAZ — modelin puan tahmin etmesi
    YASAK, sadece birebir aktarılan puanlar buraya girer.
    """
    scale_name: str
    score: float
    previous_score: Optional[float] = None
    date_or_session_ref: Optional[str] = None
    source_quote: str = ""


class IntegratedFormulationDraft(BaseModel):
    """
    Bu bölüm için minimum eşik var: yeterli veri yoksa narrative_text
    kısa ve dürüst olmalı ("Bu seans, önceki formülasyonu değiştirecek
    yeni bir örüntü ortaya koymadı" gibi) — dolgu cümlelerle uzatılmamalı.
    """
    narrative_text: str
    priority_treatment_targets: list[str] = []
    requires_therapist_approval: Literal[True] = True


class ScoreDelta(BaseModel):
    metric: str
    previous: Optional[float] = None
    current: Optional[float] = None
    direction: Optional[Literal["iyileşme", "kötüleşme", "sabit"]] = None


class SessionTracking(BaseModel):
    homework_given_this_session: str = ""
    next_session_focus_suggestion: str = ""
    session_summary_for_timeline: str = ""
    score_deltas: list[ScoreDelta] = []


class FormulationOutput(BaseModel):
    """
    Sadece meta, risk_screening ve integrated_formulation_draft ZORUNLU.
    Diğer her şey opsiyonel — model, kanıtı olmayan bölümü boş bırakabilir.
    """
    meta: Meta
    risk_screening: RiskScreening
    integrated_formulation_draft: IntegratedFormulationDraft

    cognitive_structure: Optional[CognitiveStructure] = None
    distortion_profile: Optional[DistortionProfile] = None
    automatic_thought_log: list[ThoughtLogEntry] = []
    vicious_cycle: Optional[ViciousCycle] = None
    behavioral_analysis: Optional[BehavioralAnalysis] = None
    relevant_history: Optional[RelevantHistory] = None
    psychometric_scores: list[PsychometricScore] = []
    session_tracking: Optional[SessionTracking] = None


class FormulasyonRequest(BaseModel):
    danisan_id: int
    seans_id: int
    transkript: str
