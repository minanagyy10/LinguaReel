import os
import shutil
import subprocess
import tempfile

from groq import Groq
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv()

app = FastAPI(title="Video Translator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# No local Whisper model needed anymore!
# Groq handles transcription on their fast servers
print("Video Translator API ready!")

SUPPORTED_LANGUAGES = [
    "English",
    "Arabic",
    "French",
    "Spanish",
    "German",
    "Italian",
    "Portuguese",
    "Chinese",
    "Japanese",
    "Russian",
    "Turkish",
    "Korean",
    "Dutch",
    "Polish",
    "Swedish",
    "Hindi",
]


@app.get("/")
def root():
    return {"status": "running", "message": "Video Translator API is live"}


@app.get("/languages")
def get_languages():
    return {"languages": SUPPORTED_LANGUAGES}


@app.post("/translate")
async def translate_video(
    video: UploadFile = File(...),
    target_language: str = Form(...),
):
    if target_language not in SUPPORTED_LANGUAGES:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": f"Unsupported language: {target_language}"},
        )

    allowed_extensions = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv"}
    file_ext = os.path.splitext(video.filename)[1].lower()
    if file_ext not in allowed_extensions:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Unsupported video format. Use mp4, mov, avi, mkv, webm, or flv."},
        )

    with tempfile.TemporaryDirectory() as tmpdir:

        # ── Step 1: Save video ─────────────────────────────────────────────────
        video_path = os.path.join(tmpdir, f"input{file_ext}")
        with open(video_path, "wb") as f:
            shutil.copyfileobj(video.file, f)
        print("Video saved")

        # ── Step 2: Extract audio with FFmpeg ──────────────────────────────────
        audio_path = os.path.join(tmpdir, "audio.mp3")
        try:
            subprocess.run(
                [
                    "ffmpeg",
                    "-i", video_path,
                    "-q:a", "0",
                    "-map", "a",
                    "-ac", "1",       # mono
                    "-ar", "16000",   # 16kHz
                    audio_path,
                    "-y",
                ],
                check=True,
                capture_output=True,
            )
            print("Audio extracted")
        except subprocess.CalledProcessError:
            return JSONResponse(
                status_code=500,
                content={"success": False, "error": "Failed to extract audio. Make sure the video has an audio track."},
            )

        # ── Step 3: Transcribe using Groq Whisper API (FAST — runs on Groq servers) ──
        print("Transcribing with Groq Whisper...")
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

        with open(audio_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=("audio.mp3", audio_file),
                model="whisper-large-v3-turbo",  # Fast + accurate Groq model
                response_format="verbose_json",   # Gives us segments for subtitles
                temperature=0.0,
            )

        original_transcript = transcription.text.strip()
        detected_language   = getattr(transcription, "language", "unknown")
        segments            = getattr(transcription, "segments", []) or []
        print(f"Transcription done! Language: {detected_language}")

        if not original_transcript:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "No speech detected in the video."},
            )

        # ── Step 4: Translate with Groq LLM ───────────────────────────────────
        print(f"Translating to {target_language}...")
        translation_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"You are a professional translator. "
                        f"Translate the following transcript accurately to {target_language}. "
                        f"Preserve the tone and meaning. Return ONLY the translated text — "
                        f"no explanations, no preamble, no extra commentary.\n\n"
                        f"TRANSCRIPT:\n{original_transcript}"
                    ),
                }
            ],
        )
        translated_text = translation_response.choices[0].message.content.strip()
        print("Translation done!")

        # ── Step 5: Build SRT subtitles ────────────────────────────────────────
        srt_content = ""
        if segments:
            print("Generating subtitles...")
            segments_text = "\n".join(
                [f"[{i+1}] {seg['text'].strip()}" for i, seg in enumerate(segments)]
            )

            srt_response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "user",
                        "content": (
                            f"Translate each numbered segment below to {target_language}. "
                            f"Return ONLY the translations in the exact same numbered format [1], [2], etc. "
                            f"No extra text.\n\n{segments_text}"
                        ),
                    }
                ],
            )
            raw = srt_response.choices[0].message.content.strip()

            translated_lines = {}
            for line in raw.split("\n"):
                line = line.strip()
                if line.startswith("[") and "]" in line:
                    bracket_end = line.index("]")
                    try:
                        num  = int(line[1:bracket_end])
                        text = line[bracket_end + 1:].strip()
                        translated_lines[num] = text
                    except ValueError:
                        pass

            srt_parts = []
            for i, seg in enumerate(segments, 1):
                start_time = _seconds_to_srt_time(seg["start"])
                end_time   = _seconds_to_srt_time(seg["end"])
                seg_text   = translated_lines.get(i, seg["text"].strip())
                srt_parts.append(f"{i}\n{start_time} --> {end_time}\n{seg_text}\n")

            srt_content = "\n".join(srt_parts)
            print("Subtitles done!")

    return JSONResponse(
        {
            "success": True,
            "detected_language": detected_language,
            "target_language": target_language,
            "original_transcript": original_transcript,
            "translated_text": translated_text,
            "srt": srt_content,
        }
    )


def _seconds_to_srt_time(seconds: float) -> str:
    h  = int(seconds // 3600)
    m  = int((seconds % 3600) // 60)
    s  = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
