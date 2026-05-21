export default function Landing({ onEnter }) {
    const styles = `
    .landing {
      width: 100%;
      min-height: 100vh;
      overflow-y: auto;
    }

    /* NAV */
    .landing-nav {
  width: 100%;
  padding: 20px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0d9ce;
  position: sticky;
  top: 0;
  background: #f5f0e8;
  z-index: 100;
}

    .nav-logo {
  font-family: 'Samarkan', serif;
  font-size: 32px;
  color: #1a2f1a;
  letter-spacing: 4px;
}

.nav-btn {
  padding: 9px 26px;
  border-radius: 9px;
  border: 1.5px solid #a16207;
  background: transparent;
  color: #a16207;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: box-shadow 0.12s, transform 0.12s, background 0.12s, color 0.12s;
  box-shadow: 4px 4px 0px #a16207;
}
.nav-btn:hover {
  background: #a16207;
  color: #fff;
  box-shadow: 1px 1px 0px #a16207;
  transform: translate(3px, 3px);
}

    /* HERO — dark green */
    .landing-hero {
      width: 100%;
      padding: 100px 24px 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      background: #2d4a1e;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .hero-eyebrow {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #86efac;
      margin-bottom: 24px;
      padding: 6px 16px;
      border: 1px solid rgba(134,239,172,0.3);
      border-radius: 99px;
      background: rgba(134,239,172,0.07);
    }

    .hero-title {
      font-family: 'Samarkan', serif;
      font-size: clamp(56px, 12vw, 96px);
      color: #fef3c7;
      letter-spacing: 10px;
      text-shadow: 0 2px 12px rgba(0,0,0,0.3);
      margin-bottom: 12px;
      line-height: 1;
    }

    .hero-divider {
      width: 80px;
      height: 2px;
      background: #a16207;
      margin: 20px auto;
      border-radius: 2px;
    }

    .hero-sub {
      font-size: 18px;
      color: #bbf7d0;
      max-width: 520px;
      line-height: 1.7;
      margin-bottom: 40px;
      font-weight: 400;
    }

    .hero-cta-row {
      display: flex;
      gap: 14px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
    }

    .hero-cta-primary {
      padding: 14px 40px;
      background: #a16207;
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      letter-spacing: 1px;
        transition: box-shadow 0.12s, transform 0.12s, background 0.12s;
  box-shadow: 5px 5px 0px #7c4a05;
    }
.hero-cta-primary:hover {
  background: #d97706;
  box-shadow: 1px 1px 0px #7c4a05;
  transform: translate(4px, 4px);
}

    .hero-cta-secondary {
      padding: 14px 32px;
      background: transparent;
      color: #bbf7d0;
      font-size: 15px;
      font-weight: 500;
      border: 1.5px solid rgba(187,247,208,0.3);
      border-radius: 10px;
      cursor: pointer;
     transition: box-shadow 0.12s, transform 0.12s, border-color 0.12s, color 0.12s;
  box-shadow: 4px 4px 0px rgba(134, 239, 172, 0.35);
}
.hero-cta-secondary:hover {
  border-color: #bbf7d0;
  color: #fff;
  box-shadow: 1px 1px 0px rgba(134, 239, 172, 0.35);
  transform: translate(3px, 3px);
}

    .hero-stats {
      display: flex;
      gap: 48px;
      margin-top: 64px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .hero-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-number {
      font-size: 28px;
      font-weight: 800;
      color: #fef3c7;
    }

    .stat-label {
      font-size: 12px;
      color: #86efac;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* FEATURES — milk */
    .features-bg {
      background: #f5f0e8;
      border-bottom: 1px solid #e0d9ce;
    }

    .features-bg .section-label { color: #4a7c52; }
    .features-bg .section-title { color: #1a2f1a; }

    .features-bg .feature-card {
      background: #fff;
      border: 1px solid #e5e0d8;
      border-radius: 16px;
      padding: 28px 24px;
      transition: all 0.15s;
    }

    .features-bg .feature-card:hover {
      border-color: #b5c9b7;
      box-shadow: 0 4px 16px rgba(45,74,30,0.08);
    }

    .features-bg .feature-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #f0ebe0;
      border: 1px solid #e0d9ce;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 16px;
    }

    .features-bg .feature-title { color: #1a2f1a; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .features-bg .feature-desc  { color: #4a5a3a; font-size: 14px; line-height: 1.65; }

    /* HOW IT WORKS — dark green */
    .how-section {
      background: #2d4a1e;
      border-top: 1px solid rgba(255,255,255,0.07);
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .steps-row {
      display: flex;
      gap: 0;
      position: relative;
    }

    .steps-row::before {
      content: '';
      position: absolute;
      top: 28px;
      left: 10%;
      right: 10%;
      height: 1px;
      background: rgba(255,255,255,0.1);
    }

    .step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 14px;
      padding: 0 16px;
      position: relative;
    }

    .step-number {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #3d5a3e;
      border: 2px solid rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      color: #fef3c7;
      position: relative;
      z-index: 1;
    }

    .step-title { font-size: 15px; font-weight: 700; color: #fef9c3; }
    .step-desc  { font-size: 13px; color: #a7f3d0; line-height: 1.6; }

    /* LANGUAGES — milk */
    .lang-bg {
      background: #f5f0e8;
      border-bottom: 1px solid #e0d9ce;
    }

    .lang-bg .section-label { color: #4a7c52; }
    .lang-bg .section-title { color: #1a2f1a; }

    .lang-bg .lang-pill {
      padding: 8px 20px;
      border-radius: 99px;
      border: 1px solid #d5cec4;
      background: #fff;
      color: #2d4a1e;
      font-size: 15px;
      transition: all 0.15s;
      cursor: default;
    }

    .lang-bg .lang-pill:hover {
      background: #eee8dc;
      border-color: #b5a898;
    }

    /* BOTTOM CTA — dark green */
    .cta-bg {
      background: #2d4a1e;
      text-align: center;
      padding: 80px 24px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }

    .cta-bg .section-label {
      color: #86efac;
      justify-content: center;
      display: flex;
    }

    .cta-title {
      font-size: 30px;
      font-weight: 800;
      color: #fef3c7;
      margin: 12px 0 28px;
    }

    /* FOOTER */
    .landing-footer {
  width: 100%;
  background: #f5f0e8;
  border-top: 1px solid #e0d9ce;
  padding: 32px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-logo {
  font-family: 'Samarkan', serif;
  font-size: 18px;
  color: #1a2f1a;
  letter-spacing: 3px;
}

.footer-text {
  font-size: 12px;
  color: #8a7f72;
  letter-spacing: 0.5px;
}

    .footer-stack {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
.stack-tag {
  padding: 3px 10px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e0d9ce;
  font-size: 11px;
  color: #4a7c52;
  font-weight: 500;
}

    /* SHARED */
    .landing-section {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 80px 32px;
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 48px;
      line-height: 1.25;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .lang-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-top: 32px;
    }

    @media (max-width: 560px) {
      .features-grid    { grid-template-columns: 1fr; }
      .landing-nav      { padding: 16px 20px; }
      .hero-stats       { gap: 28px; }
      .steps-row        { flex-direction: column; gap: 24px; }
      .steps-row::before { display: none; }
      .landing-footer   { padding: 24px 20px; }
    }
  `;

    const FEATURES = [
        { icon: "📈", title: "Live Mandi Prices", desc: "Real-time crop prices from mandis across India. Know what your harvest is worth before you sell." },
        { icon: "🏛️", title: "Government Schemes", desc: "PM Kisan, crop insurance, subsidies and state schemes — eligibility and how to apply, explained simply." },
        { icon: "🌾", title: "Crop Advisory", desc: "Pest identification, fertilizer dosage, disease control and seasonal crop management guidance." },
        { icon: "⚙️", title: "Farm Technology", desc: "Drip irrigation costs, machinery comparisons, sensor recommendations and equipment subsidies." },
    ];

    const STEPS = [
        { n: "1", title: "Ask in your language", desc: "Type or speak your question in Hindi, Marathi, English or any regional language." },
        { n: "2", title: "AI analyses your query", desc: "Multiple specialist agents fetch live data — mandi rates, weather, schemes — in seconds." },
        { n: "3", title: "Get actionable advice", desc: "A clear answer with sources, tailored to your crop, location and context." },
    ];

    const LANGS = ["हिन्दी", "मराठी", "English", "ਪੰਜਾਬੀ", "ગુજરાતી", "বাংলা", "తెలుగు", "தமிழ்", "ಕನ್ನಡ", "മലയാളം"];
    const STACK = ["Groq", "LangGraph", "RAG", "Qdrant", "Open-Meteo", "Whisper", "gTTS"];

    return (
        <>
            <style>{styles}</style>
            <div className="landing">

                {/* Nav */}
                <nav className="landing-nav">
                    <div className="nav-logo">PITAMBAR</div>
                    <button className="nav-btn" onClick={onEnter}>Open Advisory →</button>
                </nav>

                {/* Hero — dark green */}
                <section className="landing-hero">
                    <div className="hero-eyebrow">AI-Powered · Free · Multilingual</div>
                    <div className="hero-title">PITAMBAR</div>
                    <div className="hero-divider" />
                    <p className="hero-sub">
                        India's farmer advisory AI. Ask about mandi prices, crop diseases,
                        government schemes or farm technology — in your own language.
                    </p>
                    <div className="hero-cta-row">
                        <button className="hero-cta-primary" onClick={onEnter}>Start Advisory</button>
                        <button className="hero-cta-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                            Learn more ↓
                        </button>
                    </div>
                    <div className="hero-stats">
                        {[["4", "Specialist Agents"], ["10+", "Languages"], ["Live", "Mandi Data"], ["Voice", "Support"]].map(([n, l]) => (
                            <div className="hero-stat" key={l}>
                                <span className="stat-number">{n}</span>
                                <span className="stat-label">{l}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features — milk */}
                <section id="features" className="features-bg">
                    <div className="landing-section">
                        <div className="section-label">What Pitambar can do</div>
                        <div className="section-title">Everything a farmer needs to know</div>
                        <div className="features-grid">
                            {FEATURES.map(f => (
                                <div className="feature-card" key={f.title}>
                                    <div className="feature-icon-wrap">{f.icon}</div>
                                    <div className="feature-title">{f.title}</div>
                                    <div className="feature-desc">{f.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* Footer */}
                <footer className="landing-footer">
                    <div className="footer-logo">PITAMBAR</div>
                    <div className="footer-stack">{STACK.map(s => <span className="stack-tag" key={s}>{s}</span>)}</div>
                    <div className="footer-text">Built for Indian farmers · 2025</div>
                </footer>

            </div>
        </>
    );
}