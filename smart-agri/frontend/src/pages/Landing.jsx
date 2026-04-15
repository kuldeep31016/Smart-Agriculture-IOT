// Landing Page — full-screen, no Navbar
// Farmer-friendly hero with green gradient, feature cards, and CTA

import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🌡️', title: 'Live Sensor Monitoring',  desc: 'Real-time Temperature, Humidity & Soil data from IoT sensors' },
  { icon: '☁️', title: 'Cloud Storage',            desc: 'All readings securely stored in Firebase Firestore Cloud' },
  { icon: '🤖', title: 'Gemini AI Brain',          desc: 'Crop prediction, fertilizer & irrigation powered by Gemini 2.0' },
  { icon: '⚠️', title: 'Smart Alerts',             desc: 'Instant anomaly detection with warnings and AI solutions' },
];

const STATS = [
  { label: '3 Sensors',     desc: 'Temp · Humidity · Soil' },
  { label: 'Cloud Powered', desc: 'Firebase Firestore'     },
  { label: 'AI Driven',     desc: 'Gemini 2.0 Flash'       },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a472a] via-[#2d6a4f] to-[#40916c] text-white overflow-hidden">

      {/* ── Navbar strip ────────────────────────────────────────────────────── */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌾</span>
          <span className="text-2xl font-extrabold tracking-wide">AgriSense</span>
        </div>
        <Link
          to="/dashboard"
          className="px-5 py-2 rounded-xl bg-white/15 border border-white/30 text-sm font-semibold hover:bg-white/25 transition-colors"
        >
          Enter Dashboard →
        </Link>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-semibold mb-8">
          Problem Statement 7 · IoT + Cloud + Deep Learning
        </div>

        <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
          🌾 AgriSense
          <br />
          <span className="text-emerald-300">Smart Farming</span> Powered by AI
        </h1>

        <p className="text-xl text-white/80 max-w-2xl mx-auto leading-8 mb-10">
          Real-time IoT monitoring + Gemini AI crop intelligence for modern farmers.
          Know your field. Act smarter. Grow more.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link
            to="/dashboard"
            className="px-8 py-4 rounded-2xl bg-white text-agri-dark font-bold text-lg shadow-xl hover:bg-emerald-50 hover:-translate-y-1 transition-all"
          >
            Enter Dashboard →
          </Link>
          <Link
            to="/ai-assistant"
            className="px-8 py-4 rounded-2xl bg-white/15 border border-white/30 font-bold text-lg hover:bg-white/25 hover:-translate-y-1 transition-all"
          >
            🤖 AI Assistant
          </Link>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-6">
          {STATS.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold">{s.label}</span>
              <span className="text-white/60 text-sm">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-center text-3xl font-extrabold mb-10 text-white">
          Everything your farm needs in one place
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/20 hover:-translate-y-1 transition-all"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-white/70 text-sm leading-6">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Architecture strip ───────────────────────────────────────────────── */}
      <section className="bg-black/20 backdrop-blur py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-4">Data Flow</p>
          <div className="flex flex-wrap justify-center items-center gap-2 text-sm font-semibold">
            {['ESP32 Sensor', '→', 'Python Serial', '→', 'Express Backend', '→', 'Firebase Cloud', '↕', 'React Dashboard', '+', 'Gemini AI'].map((s, i) => (
              <span key={i} className={s === '→' || s === '↕' || s === '+' ? 'text-emerald-400' : 'bg-white/10 px-3 py-1.5 rounded-lg'}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA bottom ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-extrabold mb-4">Ready to monitor your farm?</h2>
        <p className="text-white/70 mb-8 text-lg">Connect your ESP32, start Python, open Dashboard.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/dashboard"    className="px-6 py-3 rounded-xl bg-white text-agri-dark font-bold hover:bg-emerald-50 transition-colors">📊 Dashboard</Link>
          <Link to="/ai-assistant" className="px-6 py-3 rounded-xl bg-white/15 border border-white/30 font-bold hover:bg-white/25 transition-colors">🤖 AI Assistant</Link>
          <Link to="/alerts"       className="px-6 py-3 rounded-xl bg-white/15 border border-white/30 font-bold hover:bg-white/25 transition-colors">⚠️ Alerts</Link>
        </div>
      </section>
    </div>
  );
}
