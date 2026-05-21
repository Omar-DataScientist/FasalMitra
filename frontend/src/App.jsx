import { useState, useEffect, useRef, useCallback } from "react";
import Landing from "./Landing";

const API_BASE = "http://localhost:8000";

const LANGUAGES = [
  { code: "hi", label: "हिन्दी" },
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "bn", label: "বাংলা" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
];

const INTENT_META = {
  market:  { label: "Mandi & Prices",  color: "#b45309", bg: "#fef3c7" },
  policy:  { label: "Govt. Schemes",   color: "#065f46", bg: "#d1fae5" },
  tech:    { label: "Farm Technology", color: "#1e40af", bg: "#dbeafe" },
  crop:    { label: "Crop Advisory",   color: "#166534", bg: "#dcfce7" },
  multi:   { label: "Multi-domain",    color: "#6b21a8", bg: "#f3e8ff" },
  unknown: { label: "Advisory",        color: "#374151", bg: "#f3f4f6" },
};

function generateSessionId() {
  return "farmer-" + Math.random().toString(36).slice(2, 10);
}

function getOrCreateSessionId() {
  let sid = localStorage.getItem("pitambar_session_id");
  if (!sid) {
    sid = generateSessionId();
    localStorage.setItem("pitambar_session_id", sid);
  }
  return sid;
}

function IntentBadge({ intent }) {
  const meta = INTENT_META[intent] || INTENT_META.unknown;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.5,
      color: meta.color,
      background: meta.bg,
      border: `1px solid ${meta.color}33`,
    }}>
      {meta.label}
    </span>
  );
}

function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Sources</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {sources.map((src, i) => (
          <li key={i} style={{ marginBottom: 2 }}>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: "#2563eb",
                wordBreak: "break-all",
                textDecoration: "none",
              }}
            >
              {"↗ "}{src}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AudioPlayer({ audioBase64 }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioBase64) return;
    const blob = b64ToBlob(audioBase64, "audio/mp3");
    const url = URL.createObjectURL(blob);
    audioRef.current = new Audio(url);
    audioRef.current.onended = () => setPlaying(false);
    return () => {
      audioRef.current?.pause();
      URL.revokeObjectURL(url);
    };
  }, [audioBase64]);

  function b64ToBlob(b64, type) {
    const binary = atob(b64);
    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
    return new Blob([buf], { type });
  }

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <button
      onClick={toggle}
      style={{
        marginTop: 10,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 8,
        border: "1px solid #6b7280",
        background: playing ? "#1f2937" : "#f9fafb",
        color: playing ? "#f9fafb" : "#374151",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {playing ? "⏸ Pause" : "▶ Play Response"}
    </button>
  );
}

function MessageBubble({ entry }) {
  const isUser = entry.role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{
          maxWidth: "72%",
          background: "#3d5a3e",
          color: "#f0fdf4",
          borderRadius: "16px 16px 4px 16px",
          padding: "10px 16px",
          fontSize: 15,
          lineHeight: 1.55,
        }}>
          {entry.text}
        </div>
      </div>
    );
  }

  const { intent, final_response, agents_used, sources, audio_base64, error } = entry;

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
      <div style={{
        maxWidth: "82%",
        background: "#fafaf7",
        border: "1px solid #e5e7eb",
        borderRadius: "16px 16px 16px 4px",
        padding: "14px 18px",
        fontSize: 15,
        lineHeight: 1.65,
        color: "#1f2937",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        {error ? (
          <div style={{ color: "#b91c1c", fontWeight: 500 }}>{"⚠ "}{error}</div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {intent && <IntentBadge intent={intent} />}
              {agents_used && agents_used.length > 0 && (
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  via {agents_used.join(", ")} agent{agents_used.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{final_response}</div>
            <SourceList sources={sources} />
            {audio_base64 && <AudioPlayer audioBase64={audio_base64} />}
          </>
        )}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
      <div style={{
        background: "#fafaf7",
        border: "1px solid #e5e7eb",
        borderRadius: "16px 16px 16px 4px",
        padding: "14px 20px",
        display: "flex",
        gap: 6,
        alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#6b7280",
            animation: "pitambar-bounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function PitambarApp() {
  const [showLanding, setShowLanding] = useState(true);
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("hi");
  const [mode, setMode] = useState("text");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [backendOk, setBackendOk] = useState(null);
  const [sessionId] = useState(getOrCreateSessionId);
  const bottomRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(d => setBackendOk(d.status === "ok"))
      .catch(() => setBackendOk(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // must be after all hooks
  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />;
  }

  const pushMessage = (entry) => {
    setMessages(prev => [...prev, entry]);
  };

  async function sendText() {
    const msg = textInput.trim();
    if (!msg || loading) return;

    pushMessage({ role: "user", text: msg });
    setTextInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, session_id: sessionId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      pushMessage({
  role: "assistant",
  transcription: data.transcription || "",
  whisper_language: data.whisper_language || "",
  whisper_confidence: data.whisper_confidence || 0,

  intent: data.intent,
  final_response: data.final_response || "No response received.",
  agents_used: data.agents_used || [],
  sources: data.sources || [],
  audio_base64: data.audio_base64 || null,
});
    } catch (e) {
      pushMessage({ role: "assistant", error: e.message || "Something went wrong. Is the backend running?" });
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        await sendVoiceBlob(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (e) {
      pushMessage({ role: "assistant", error: "Microphone access denied. Please allow microphone permission." });
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  }

  async function sendVoiceBlob(blob) {
    if (!blob || loading) return;

    pushMessage({ role: "user", text: "🎙 Voice query sent" });
    setLoading(true);

    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      form.append("session_id", sessionId);
      form.append("language", language);

      const res = await fetch(`${API_BASE}/query/voice`, {
        method: "POST",
        body: form,
      });

      if (res.status === 422) {
        throw new Error("Transcription failed. Check that ffmpeg is installed on the server.");
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      pushMessage({
        role: "assistant",
        intent: data.intent,
        final_response: data.final_response || "No response received.",
        agents_used: data.agents_used || [],
        sources: data.sources || [],
        audio_base64: data.audio_base64 || null,
      });
    } catch (e) {
      pushMessage({ role: "assistant", error: e.message || "Voice query failed." });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  }

  function resetSession() {
    localStorage.removeItem("pitambar_session_id");
    window.location.reload();
  }

  const styles = `
    @font-face {
      font-family: 'Samarkan';
      src: url('./fonts/SAMAN___.TTF') format('truetype');
      font-weight: normal;
      font-style: normal;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', 'Segoe UI', sans-serif;
      background: #f0ebe3;
      min-height: 100vh;
    }

    .pitambar-root {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100%;
      background: #fdfcf9;
    }

    .pitambar-header {
      background: linear-gradient(135deg, #2d4a1e 0%, #3d5a3e 60%, #4a7c52 100%);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 3px solid #a16207;
    }

    .pitambar-title {
      font-family: 'Samarkan', serif;
      font-size: 28px;
      color: #fef3c7;
      letter-spacing: 3px;
      text-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }

    .pitambar-subtitle {
      font-size: 11px;
      color: #bbf7d0;
      letter-spacing: 1px;
      margin-top: 2px;
    }

    .status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 6px;
    }

    .pitambar-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px 20px 8px;
      scroll-behavior: smooth;
    }

    .pitambar-input-area {
      border-top: 1px solid #e5e7eb;
      background: #fafaf7;
      padding: 14px 16px;
    }

    .mode-toggle {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
    }

    .mode-btn {
      padding: 5px 14px;
      border-radius: 99px;
      border: 1px solid #d1d5db;
      background: #fff;
      color: #374151;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s;
    }

    .mode-btn.active {
      background: #3d5a3e;
      color: #fff;
      border-color: #3d5a3e;
    }

    .text-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .text-input {
      flex: 1;
      padding: 10px 14px;
      border: 1.5px solid #d1d5db;
      border-radius: 12px;
      font-size: 15px;
      resize: none;
      outline: none;
      background: #fff;
      color: #1f2937;
      line-height: 1.5;
      font-family: inherit;
      transition: border-color 0.15s;
      min-height: 44px;
      max-height: 120px;
    }

    .text-input:focus {
      border-color: #4a7c52;
    }

    .send-btn {
      padding: 10px 20px;
      border-radius: 12px;
      border: none;
      background: #3d5a3e;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      height: 44px;
      transition: background 0.15s;
      white-space: nowrap;
    }

    .send-btn:hover:not(:disabled) {
      background: #2d4a1e;
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .voice-row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .lang-select {
      padding: 8px 10px;
      border: 1.5px solid #d1d5db;
      border-radius: 10px;
      background: #fff;
      font-size: 13px;
      color: #374151;
      outline: none;
      cursor: pointer;
    }

    .record-btn {
      padding: 10px 24px;
      border-radius: 12px;
      border: none;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      height: 44px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s;
      white-space: nowrap;
    }

    .record-btn.idle {
      background: #3d5a3e;
    }

    .record-btn.idle:hover {
      background: #2d4a1e;
    }

    .record-btn.active {
      background: #b91c1c;
    }

    .record-btn.active:hover {
      background: #991b1b;
    }

    .record-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .recording-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #fff;
      animation: pitambar-bounce 1s infinite;
    }

    .recording-label {
      font-size: 13px;
      color: #b91c1c;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #9ca3af;
      gap: 10px;
      padding: 40px 20px;
      text-align: center;
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 4px;
    }

    .empty-state-title {
      font-size: 18px;
      color: #6b7280;
      font-weight: 600;
    }

    .empty-state-sub {
      font-size: 14px;
      color: #9ca3af;
      max-width: 320px;
      line-height: 1.6;
    }

    .suggestion-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-top: 8px;
    }

    .chip {
      padding: 7px 14px;
      border-radius: 99px;
      border: 1px solid #d1d5db;
      background: #fff;
      color: #374151;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .chip:hover {
      border-color: #4a7c52;
      color: #2d4a1e;
      background: #f0fdf4;
    }

    .new-session-btn {
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.3);
      background: transparent;
      color: #bbf7d0;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .new-session-btn:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }

    @keyframes pitambar-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
  `;

  const SUGGESTIONS = [
    "Onion mandi price in Pune today",
    "PM Kisan Samman Nidhi eligibility",
    "Best fertilizer for wheat crop",
    "Drip irrigation cost and subsidy",
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="pitambar-root">

        {/* Header */}
        <div className="pitambar-header">
          <div>
            <div className="pitambar-title">PITAMBAR</div>
            <div className="pitambar-subtitle">किसान सलाहकार · Farmer Advisory AI</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#bbf7d0", display: "flex", alignItems: "center" }}>
              <span
                className="status-dot"
                style={{
                  background: backendOk === null ? "#fbbf24" : backendOk ? "#4ade80" : "#f87171"
                }}
              />
              {backendOk === null ? "Connecting…" : backendOk ? "Online" : "Backend offline"}
            </div>
            <button className="new-session-btn" onClick={resetSession}>
              New session
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="pitambar-messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌾</div>
              <div className="empty-state-title">Namaste, Kisan!</div>
              <div className="empty-state-sub">
                Ask anything about mandi prices, government schemes, crop advice,
                or farm technology. Type below or try a suggestion.
              </div>
              <div className="suggestion-chips">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="chip" onClick={() => setTextInput(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => <MessageBubble key={i} entry={m} />)
          )}
          {loading && <LoadingBubble />}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="pitambar-input-area">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === "text" ? "active" : ""}`}
              onClick={() => setMode("text")}
            >
              ✏️ Text
            </button>
            <button
              className={`mode-btn ${mode === "voice" ? "active" : ""}`}
              onClick={() => setMode("voice")}
            >
              🎙 Voice
            </button>
          </div>

          {mode === "text" ? (
            <div className="text-row">
              <textarea
                className="text-input"
                placeholder="अपना सवाल पूछें… / Ask your question…"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
              />
              <button
                className="send-btn"
                onClick={sendText}
                disabled={loading || !textInput.trim()}
              >
                {loading ? "…" : "Send"}
              </button>
            </div>
          ) : (
            <div className="voice-row">
              <select
                className="lang-select"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>

              <button
                className={`record-btn ${recording ? "active" : "idle"}`}
                onClick={recording ? stopRecording : startRecording}
                disabled={loading}
              >
                {recording ? (
                  <>
                    <span className="recording-dot" />
                    Stop & Send
                  </>
                ) : (
                  "🎙 Start Recording"
                )}
              </button>

              {recording && (
                <span className="recording-label">
                  <span className="recording-dot" style={{ background: "#b91c1c" }} />
                  Recording…
                </span>
              )}
            </div>
          )}

          <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
            Session: {sessionId}
          </div>
        </div>
      </div>
    </>
  );
}