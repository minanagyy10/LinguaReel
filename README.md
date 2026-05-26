# 🎬 LinguaReel

> AI-powered video translation and dubbing tool — automatically transcribe, translate, and dub videos into multiple languages using Groq's ultra-fast inference API.

---

## 🧰 Tech Stack

### 🤖 AI & Machine Learning
| Technology | Purpose |
|------------|---------|
| [Groq API](https://console.groq.com) | Ultra-fast LLM inference for transcription & translation |
| [Whisper](https://openai.com/research/whisper) (via Groq) | Speech-to-text / automatic speech recognition |
| [LLaMA 3](https://llama.meta.com/) (via Groq) | Language translation |

### 🎞️ Video & Audio Processing
| Technology | Purpose |
|------------|---------|
| [FFmpeg](https://ffmpeg.org/) | Video/audio extraction, encoding, and merging |
| [imageio-ffmpeg](https://pypi.org/project/imageio-ffmpeg/) | Python FFmpeg bindings |
| [llvmlite](https://pypi.org/project/llvmlite/) | LLVM-based audio processing backend |

### 🐍 Core Language & Runtime
| Technology | Purpose |
|------------|---------|
| [Python 3.9+](https://www.python.org/) | Core programming language |
| [python-dotenv](https://pypi.org/project/python-dotenv/) | Environment variable management |

### 🛠️ Dev Tools
| Technology | Purpose |
|------------|---------|
| [Git](https://git-scm.com/) | Version control |
| [GitHub](https://github.com) | Remote repository hosting |
| `venv` | Python virtual environment |

---

## ✨ Features

- 🎙️ Automatic speech recognition from video files
- 🌍 Multi-language translation powered by LLaMA 3 via Groq
- 🔊 Audio dubbing and subtitle generation
- ⚡ Blazing fast inference with Groq's LPU hardware
- 🎞️ FFmpeg-based video/audio extraction and merging
- 📝 SRT subtitle file export

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- [FFmpeg](https://ffmpeg.org/download.html) installed and added to PATH
- A [Groq API key](https://console.groq.com/keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/minanagyy10/LinguaReel.git
   cd LinguaReel
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate        # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   Copy the example env file and fill in your API key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

---

## 🛠️ Usage

```bash
python main.py --input video.mp4 --language es
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--input` | Path to input video file | required |
| `--language` | Target language code (e.g. `es`, `fr`, `ar`, `de`) | `en` |
| `--output` | Output file path | `output.mp4` |
| `--subtitles` | Generate subtitle file (.srt) | `false` |

---

## ⚙️ How It Works

```
Input Video
    │
    ▼
Extract Audio (FFmpeg)
    │
    ▼
Speech Recognition (Whisper via Groq)
    │
    ▼
Translation (LLaMA 3 via Groq)
    │
    ▼
Text-to-Speech / Subtitle Generation
    │
    ▼
Merge Audio + Video (FFmpeg)
    │
    ▼
Output Video
```

---

## 📁 Project Structure

```
LinguaReel/
├── main.py              # Entry point
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variable template
├── .gitignore
└── README.md
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com/keys) |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `groq` | latest | Groq API client |
| `imageio-ffmpeg` | latest | FFmpeg Python bindings |
| `llvmlite` | latest | Audio processing backend |
| `python-dotenv` | latest | Load `.env` variables |

Full list in `requirements.txt`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Mina Nagy** — [@minanagyy10](https://github.com/minanagyy10)
