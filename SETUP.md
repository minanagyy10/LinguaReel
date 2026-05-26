# 🎬 Video Translator — Setup Guide

## Project Structure

```
video-translator/
├── backend/
│   ├── main.py           ← FastAPI server (all backend logic)
│   ├── requirements.txt  ← Python packages to install
│   └── .env.example      ← Rename to .env and add your API key
│
└── frontend/
    ├── index.html        ← Open this in browser
    ├── style.css         ← Styling (auto-loaded by HTML)
    └── app.js            ← JavaScript logic (auto-loaded by HTML)
```

---

## ✅ Step 1 — Install FFmpeg (one-time system install)

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract and add `bin/` folder to your system PATH

**Mac:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install ffmpeg
```

---

## ✅ Step 2 — Set Up the Backend

### 2a. Create a Python virtual environment
```bash
cd backend
python -m venv venv
```

### 2b. Activate it
- **Windows:** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

### 2c. Install packages
```bash
pip install -r requirements.txt
```

### 2d. Add your API key
Rename `.env.example` to `.env` and paste your Anthropic API key:
```
ANTHROPIC_API_KEY=your_real_key_here
```
Get your key at: https://console.anthropic.com/

### 2e. Start the backend server
```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
Loading Whisper model...
Whisper model loaded!
INFO: Uvicorn running on http://127.0.0.1:8000
```

---

## ✅ Step 3 — Open the Frontend

Just open `frontend/index.html` directly in your browser.
No server needed for the frontend — it's plain HTML.

---

## ✅ Step 4 — Use the App

1. Drag & drop a video (or click to browse)
2. Choose your target language
3. Click **Translate Video**
4. Wait ~30–120 seconds depending on video length
5. View the transcript, translation, and download the `.srt` subtitle file

---

## 🔧 Common Issues

| Problem | Fix |
|---|---|
| "Cannot connect to backend" | Make sure `uvicorn` is running on port 8000 |
| "ffmpeg not found" | Install FFmpeg and add it to PATH |
| "No speech detected" | Make sure the video has an audio track |
| First run is slow | Whisper downloads its model (~150MB) the first time |
| CORS error in browser | Backend has CORS enabled — refresh the page |
