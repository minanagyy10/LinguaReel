# 🎬 LinguaReel

> AI-powered video translation and dubbing tool — translate video speech into multiple languages using Groq's fast inference API.

---

## ✨ Features

- 🎙️ Automatic speech recognition from video files
- 🌍 Multi-language translation
- 🔊 Audio dubbing and subtitle generation
- ⚡ Fast inference powered by Groq API
- 🎞️ FFmpeg-based video/audio processing

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

   Copy the example env file and add your API key:
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
| `--language` | Target language code (e.g. `es`, `fr`, `ar`) | `en` |
| `--output` | Output file path | `output.mp4` |
| `--subtitles` | Generate subtitle file (.srt) | `false` |

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

## 📦 Dependencies

Key packages used:

- [`groq`](https://pypi.org/project/groq/) — Groq API client for fast AI inference
- [`imageio-ffmpeg`](https://pypi.org/project/imageio-ffmpeg/) — FFmpeg bindings for video processing
- [`llvmlite`](https://pypi.org/project/llvmlite/) — LLVM bindings (audio processing)

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
