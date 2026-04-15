import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '📡',
    title: 'Live Farm Monitoring',
    description: 'Track temperature, humidity, and soil moisture in real time from your connected sensors.',
  },
  {
    icon: '🧠',
    title: 'Deep Learning Intelligence',
    description: 'Use AI-assisted crop recommendations to translate field conditions into clear action.',
  },
  {
    icon: '☁️',
    title: 'Cloud Ready Storage',
    description: 'Store readings in Firebase or run in demo mode for a complete offline-friendly experience.',
  },
];

const WORKFLOW = [
  {
    step: '01',
    title: 'Capture',
    description: 'IoT sensors collect field data such as temperature, humidity, and moisture continuously.',
  },
  {
    step: '02',
    title: 'Analyze',
    description: 'The deep learning layer evaluates patterns and compares them against trained crop profiles.',
  },
  {
    step: '03',
    title: 'Recommend',
    description: 'The app suggests the best crop and gives irrigation and fertilizer guidance instantly.',
  },
];

const METRICS = [
  { label: 'Sensor Signals', value: '3' },
  { label: 'AI Recommendations', value: '1 click' },
  { label: 'Monitoring', value: '24/7' },
  { label: 'Cloud Sync', value: 'Firebase' },
];

function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-agri-white via-white to-agri-snow/70" />
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-agri-light/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-agri-medium/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-agri-frost text-sm font-semibold text-agri-medium">
                <span>🌱</span>
                Smart Agriculture Platform
              </div>

              <div className="space-y-5 max-w-2xl">
                <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-agri-dark leading-tight">
                  Build a smarter farm with live data and deep learning.
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-8 max-w-xl">
                  AgriSense combines IoT sensor monitoring, AI crop prediction, and a polished control center so you can understand your field at a glance.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-xl bg-agri-primary text-white font-semibold shadow-lg shadow-agri-primary/20 hover:bg-agri-medium hover:-translate-y-0.5 transition-all"
                >
                  Open Dashboard
                </Link>
                <Link
                  to="/predict"
                  className="px-6 py-3 rounded-xl border border-agri-medium text-agri-primary font-semibold bg-white hover:bg-agri-snow/60 hover:-translate-y-0.5 transition-all"
                >
                  Try Prediction
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {METRICS.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/80 border border-agri-frost p-4 shadow-sm">
                    <p className="text-2xl font-extrabold text-agri-primary">{item.value}</p>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-agri-primary/10 blur-2xl rounded-full" />
              <div className="relative bg-white/90 backdrop-blur-xl border border-agri-frost rounded-[2rem] shadow-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400 font-semibold">Live Intelligence</p>
                    <h2 className="text-2xl font-extrabold text-agri-dark mt-1">Farm Overview</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    Online
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Temp', value: '28.4°C', tone: 'from-red-50 to-red-100' },
                    { label: 'Humidity', value: '61%', tone: 'from-blue-50 to-blue-100' },
                    { label: 'Moisture', value: '47%', tone: 'from-green-50 to-green-100' },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-2xl p-4 bg-gradient-to-br ${item.tone} border border-white shadow-sm`}>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{item.label}</p>
                      <p className="text-3xl font-black text-agri-dark mt-3">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-agri-dark text-white p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-lg">Deep Learning Prediction</p>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/15">92% confidence</span>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-agri-snow/90">
                    <div className="flex justify-between">
                      <span>Suggested crop</span>
                      <span className="font-bold text-white">Rice</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                      <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-agri-light to-emerald-300" />
                    </div>
                    <p>
                      The AI layer interprets field signals, checks crop compatibility, and surfaces the best recommendation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-agri-medium">Features</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-agri-dark">A full farm website, not just a dashboard</h2>
          <p className="mt-4 text-gray-600 leading-7">
            Everything is designed to feel like a modern product experience: clear navigation, strong visuals, and AI in the spotlight.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((item) => (
            <article key={item.title} className="bg-white rounded-3xl border border-agri-frost shadow-sm p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-agri-snow flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold text-agri-dark">{item.title}</h3>
              <p className="mt-3 text-gray-600 leading-7">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Deep Learning */}
      <section id="deep-learning" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-5">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-agri-medium">Deep Learning</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-agri-dark leading-tight">
              Prediction logic powered by an AI-ready intelligence layer.
            </h2>
            <p className="text-gray-600 leading-8">
              The UI is built to showcase deep learning clearly: sensor inputs go into the model, the model analyses patterns, and the app returns a crop recommendation with confidence, irrigation guidance, and fertilizer advice.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Sensor signals from the field',
                'Pattern-aware model inference',
                'Confidence scoring for decisions',
                'Actionable farming recommendations',
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-white border border-agri-frost p-4 shadow-sm text-sm font-semibold text-agri-dark">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-agri-frost shadow-lg p-6 sm:p-8">
            <div className="space-y-4">
              {WORKFLOW.map((item) => (
                <div key={item.step} className="flex gap-4 p-4 rounded-2xl bg-agri-white/70 border border-agri-frost">
                  <div className="w-14 h-14 rounded-2xl bg-agri-primary text-white flex items-center justify-center font-black shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-agri-dark">{item.title}</h3>
                    <p className="mt-1 text-gray-600 leading-7">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="rounded-[2rem] bg-gradient-to-r from-agri-primary to-agri-medium text-white px-6 py-10 sm:px-10 sm:py-12 shadow-2xl">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-agri-snow/90">Ready to explore?</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">
                Explore the dashboard and see deep learning in action.
              </h2>
              <p className="mt-4 text-agri-snow/95 leading-7 max-w-2xl">
                Use the live dashboard for monitoring, then switch to crop prediction for AI-assisted recommendations tailored to your field.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/dashboard"
                className="px-5 py-3 rounded-xl bg-white text-agri-primary font-semibold hover:bg-agri-snow transition-colors"
              >
                Open Dashboard
              </Link>
              <Link
                to="/predict"
                className="px-5 py-3 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Run Prediction
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
