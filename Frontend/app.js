// ─── Configuration ──────────────────────────────────────────────────────────
// Change this if your backend runs on a different port/host
const API_BASE = "http://localhost:8000";

// ─── DOM References ──────────────────────────────────────────────────────────
const dropZone        = document.getElementById("dropZone");
const videoInput      = document.getElementById("videoInput");
const filePreview     = document.getElementById("filePreview");
const fileName        = document.getElementById("fileName");
const fileSize        = document.getElementById("fileSize");
const removeFileBtn   = document.getElementById("removeFile");
const languageSelect  = document.getElementById("languageSelect");
const translateBtn    = document.getElementById("translateBtn");

const uploadCard      = document.getElementById("uploadCard");
const progressCard    = document.getElementById("progressCard");
const resultsCard     = document.getElementById("resultsCard");
const errorBox        = document.getElementById("errorBox");
const errorMsg        = document.getElementById("errorMsg");

const progressBar     = document.getElementById("progressBar");
const progressLabel   = document.getElementById("progressLabel");

const detectedLang    = document.getElementById("detectedLang");
const targetLang      = document.getElementById("targetLang");
const originalText    = document.getElementById("originalText");
const translatedText  = document.getElementById("translatedText");
const srtText         = document.getElementById("srtText");

const copyBtn         = document.getElementById("copyBtn");
const downloadSrtBtn  = document.getElementById("downloadSrtBtn");
const resetBtn        = document.getElementById("resetBtn");

const tabs            = document.querySelectorAll(".tab");
const tabContents     = document.querySelectorAll(".tab-content");

// ─── State ───────────────────────────────────────────────────────────────────
let selectedFile = null;
let srtData = "";

// ─── Load Languages from Backend ─────────────────────────────────────────────
async function loadLanguages() {
  try {
    const res = await fetch(`${API_BASE}/languages`);
    const data = await res.json();
    languageSelect.innerHTML = `<option value="" disabled selected>Choose a language…</option>`;
    data.languages.forEach(lang => {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent = lang;
      languageSelect.appendChild(option);
    });
  } catch (err) {
    languageSelect.innerHTML = `<option value="" disabled selected>Could not load languages</option>`;
    showError("Cannot connect to the backend. Make sure it is running on port 8000.");
  }
}

loadLanguages();

// ─── Drop Zone Events ─────────────────────────────────────────────────────────
dropZone.addEventListener("click", () => videoInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
});

videoInput.addEventListener("change", () => {
  if (videoInput.files[0]) setFile(videoInput.files[0]);
});

removeFileBtn.addEventListener("click", clearFile);

// ─── File Handling ────────────────────────────────────────────────────────────
function setFile(file) {
  const allowed = ["video/mp4", "video/quicktime", "video/x-msvideo",
                   "video/x-matroska", "video/webm", "video/x-flv"];
  if (!allowed.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|mkv|webm|flv)$/i)) {
    showError("Unsupported file type. Please upload a video file (MP4, MOV, AVI, MKV, WEBM).");
    return;
  }

  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);
  filePreview.style.display = "flex";
  dropZone.style.display = "none";
  updateTranslateBtn();
}

function clearFile() {
  selectedFile = null;
  videoInput.value = "";
  filePreview.style.display = "none";
  dropZone.style.display = "block";
  updateTranslateBtn();
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ─── Language Select ──────────────────────────────────────────────────────────
languageSelect.addEventListener("change", updateTranslateBtn);

function updateTranslateBtn() {
  translateBtn.disabled = !(selectedFile && languageSelect.value);
}

// ─── Translation ──────────────────────────────────────────────────────────────
translateBtn.addEventListener("click", startTranslation);

async function startTranslation() {
  if (!selectedFile || !languageSelect.value) return;

  hideError();
  showProgress();
  animateProgress();

  const formData = new FormData();
  formData.append("video", selectedFile);
  formData.append("target_language", languageSelect.value);

  try {
    const response = await fetch(`${API_BASE}/translate`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Translation failed. Please try again.");
    }

    showResults(data);

  } catch (err) {
    hideProgress();
    uploadCard.style.display = "flex";
    showError(err.message || "Something went wrong. Is the backend running?");
  }
}

// ─── Progress Animation ───────────────────────────────────────────────────────
let progressInterval = null;

function animateProgress() {
  const steps = [
    { pct: 15,  label: "Extracting audio from video…",     step: 1 },
    { pct: 40,  label: "Transcribing speech with Whisper…", step: 2 },
    { pct: 75,  label: "Translating with Claude AI…",       step: 3 },
    { pct: 95,  label: "Almost done…",                      step: 4 },
  ];

  let i = 0;
  progressInterval = setInterval(() => {
    if (i < steps.length) {
      const { pct, label, step } = steps[i];
      progressBar.style.width = pct + "%";
      progressLabel.textContent = label;
      activateStep(step);
      i++;
    }
  }, 3000); // advance every 3 seconds
}

function activateStep(n) {
  for (let i = 1; i <= 4; i++) {
    const dot = document.querySelector(`#step${i} .step-dot`);
    if (i < n)       { dot.className = "step-dot done"; }
    else if (i === n) { dot.className = "step-dot active"; }
    else              { dot.className = "step-dot"; }
  }

  // Activate connecting lines
  const lines = document.querySelectorAll(".step-line");
  lines.forEach((line, idx) => {
    line.classList.toggle("done", idx < n - 1);
  });
}

// ─── Show / Hide Sections ─────────────────────────────────────────────────────
function showProgress() {
  uploadCard.style.display = "none";
  progressCard.style.display = "flex";
  resultsCard.style.display = "none";
  progressBar.style.width = "5%";
}

function hideProgress() {
  progressCard.style.display = "none";
  clearInterval(progressInterval);
}

function showResults(data) {
  clearInterval(progressInterval);
  progressBar.style.width = "100%";
  progressLabel.textContent = "Translation complete!";
  activateStep(4);
  document.querySelector("#step4 .step-dot").className = "step-dot done";

  setTimeout(() => {
    hideProgress();

    detectedLang.textContent = data.detected_language.toUpperCase();
    targetLang.textContent   = data.target_language;
    originalText.value        = data.original_transcript;
    translatedText.value      = data.translated_text;
    srtText.value             = data.srt || "(No subtitle segments available)";
    srtData                   = data.srt || "";

    resultsCard.style.display = "flex";
  }, 800);
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
  });
});

// ─── Copy & Download ──────────────────────────────────────────────────────────
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(translatedText.value);
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => { copyBtn.textContent = "📋 Copy Translation"; }, 2000);
  } catch {
    copyBtn.textContent = "❌ Failed";
  }
});

downloadSrtBtn.addEventListener("click", () => {
  if (!srtData) return alert("No subtitle data available.");
  const blob = new Blob([srtData], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "translated_subtitles.srt";
  a.click();
  URL.revokeObjectURL(url);
});

// ─── Reset ────────────────────────────────────────────────────────────────────
resetBtn.addEventListener("click", () => {
  clearFile();
  languageSelect.value = "";
  resultsCard.style.display = "none";
  uploadCard.style.display  = "flex";
  progressBar.style.width   = "0%";
  srtData = "";
  // Reset step dots
  for (let i = 1; i <= 4; i++) {
    document.querySelector(`#step${i} .step-dot`).className = "step-dot";
  }
  document.querySelectorAll(".step-line").forEach(l => l.classList.remove("done"));
});

// ─── Error Helpers ────────────────────────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorBox.style.display = "flex";
}

function hideError() {
  errorBox.style.display = "none";
}
