from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from googletrans import Translator
from gtts import gTTS
import uuid
import os

app = FastAPI()
translator = Translator()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_FOLDER = os.path.join(BASE_DIR, "audio")
os.makedirs(AUDIO_FOLDER, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend Running"}

@app.post("/translate")
async def translate(data: dict):
    text = data.get("text")
    dest = data.get("dest", "en")

    if not text:
        return {"error": "No text provided"}

    translated = translator.translate(text, dest=dest)

    filename = f"{uuid.uuid4()}.mp3"
    file_path = os.path.join(AUDIO_FOLDER, filename)

    supported_langs = [
        "en","hi","te","ta","kn","ml","mr","bn","gu","pa","ur",
        "ar","fr","de","es","it","pt","ru","ja","ko","zh",
        "nl","tr","sv","pl","id","th","vi"
    ]

    voice_lang = dest if dest in supported_langs else "en"

    tts = gTTS(text=translated.text, lang=voice_lang)
    tts.save(file_path)

    return {
        "translated_text": translated.text,
        "audio_url": f"http://127.0.0.1:8000/audio/{filename}"
    }

@app.get("/audio/{filename}")
def get_audio(filename: str):
    file_path = os.path.join(AUDIO_FOLDER, filename)
    return FileResponse(file_path, media_type="audio/mpeg")