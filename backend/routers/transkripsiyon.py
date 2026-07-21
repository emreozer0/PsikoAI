import whisper
import tempfile
from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/transkribe")
async def transkribe(dosya: UploadFile = File(...)):
    model = whisper.load_model("base")
    
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(await dosya.read())
        tmp_path = tmp.name
    
    sonuc = model.transcribe(tmp_path, language="tr")
    
    return {"transkript": sonuc["text"]}