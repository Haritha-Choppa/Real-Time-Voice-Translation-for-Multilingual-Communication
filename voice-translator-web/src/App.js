import React, { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [language, setLanguage] = useState("hi");
  const [loading, setLoading] = useState(false);

  const languages = {
    en: "English",
    hi: "Hindi",
    te: "Telugu",
    ta: "Tamil",
    kn: "Kannada",
    ml: "Malayalam",
    fr: "French",
    de: "German",
    es: "Spanish",
    ja: "Japanese",
    zh: "Chinese",
    ru: "Russian",
    ar: "Arabic",
    pt: "Portuguese",
    it: "Italian"
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Chrome or Edge browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = async (event) => {
      const speechText = event.results[0][0].transcript;
      setText(speechText);
      await handleTranslate(speechText);
    };
  };

  const handleTranslate = async (inputText = text) => {
    if (!inputText) return;

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, dest: language })
      });

      const data = await response.json();
      setTranslated(data.translated_text);

      if (data.audio_url) {
        const audio = new Audio(data.audio_url);
        audio.play();
      }
    } catch (err) {
      alert("Backend not running!");
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <div className="card">
        <h1>🌍 Real-Time Voice Translator</h1>

        <textarea
          placeholder="Speak or type here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="controls">
          <button className="mic-btn" onClick={startListening}>
            🎤 Speak
          </button>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>

          <button className="translate-btn" onClick={() => handleTranslate()}>
            {loading ? "Translating..." : "Translate"}
          </button>
        </div>

        <div className="output">
          <h3>Translated Text</h3>
          <p>{translated}</p>
        </div>
      </div>
    </div>
  );
}

export default App;