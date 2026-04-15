import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';

const IMAGES = {
  hero: "/images/hero-bg.jpg",
  tomatoes: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=800&auto=format&fit=crop",
  farmerHands: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=800&auto=format&fit=crop",
  ladyField: "https://images.pexels.com/photos/1405963/pexels-photo-1405963.jpeg?auto=compress&cs=tinysrgb&w=800",
  sprinkler: "https://images.unsplash.com/photo-1586771107445-d3af28357fbb?q=80&w=800&auto=format&fit=crop",
  drone: "https://images.unsplash.com/photo-1563200924-d2eab3a3bfe3?q=80&w=800&auto=format&fit=crop",
  sensor: "https://images.unsplash.com/photo-1615811361528-c14749d27f2c?q=80&w=800&auto=format&fit=crop",
  eco: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200&auto=format&fit=crop",
  oldFarmer: "https://images.unsplash.com/photo-1595166258079-63a2c53a7ac8?q=80&w=800&auto=format&fit=crop",
  smartTech: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=800&auto=format&fit=crop",
  harvest: "https://images.unsplash.com/photo-1534073818389-13824edcd809?q=80&w=800&auto=format&fit=crop",

  fieldChip: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop",
  av1: "https://i.pravatar.cc/100?img=11",
  av2: "https://i.pravatar.cc/100?img=33",
  av3: "https://i.pravatar.cc/100?img=12",
  av4: "https://i.pravatar.cc/100?img=44",
  av5: "https://i.pravatar.cc/100?img=36"
};

export default function Landing() {
  const sliderRef = useRef(null);
  const farmingRef = useRef(null);
  const [susPracticeIdx, setSusPracticeIdx] = useState(0);

  const scrollFarmingLeft = () => {
    if (farmingRef.current) farmingRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollFarmingRight = () => {
    if (farmingRef.current) farmingRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const FARMING_EASY_CARDS = [
    { label: "Farmer Approach", img: "/images/image8.jpg" },
    { label: "Smart Technology", img: "/images/image9.jpg" },
    { label: "More Yield", img: "/images/image10.jpg" },
    { label: "Resource Management", img: "/images/image11.jpg" },
    { label: "Data Insights", img: "/images/image15.jpg" },
    { label: "Automated Crop", img: "/images/image16.jpg" }
  ];

  const susImages = [
    "/images/image7.jpeg",
    "/images/image12.jpg",
    "/images/image13.jpg",
    "/images/image14.jpg"
  ];

  const nextSusImage = () => {
    setSusPracticeIdx((prev) => (prev + 1) % susImages.length);
  };

  const scrollLeft = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: -1000, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: 1000, behavior: 'smooth' });
  };

  const CAROUSEL_CARDS = [
    { title: "Precision Farming", desc: "GPS-guided equipment and sensors for field management.", img: "/images/image1.jpg" },
    { title: "Smart Irrigation", desc: "Automated logic to reduce water waste and improve yields.", img: "/images/image2.jpg" },
    { title: "Pest Monitoring", desc: "AI-driven early anomaly visual detection and warnings.", img: "/images/image3.jpg" },
    { title: "Crop Analytics", desc: "Deep learning models for predictive harvest planning.", img: "/images/image4.jpg" },
    { title: "Sustainable Yield", desc: "Eco-friendly methods optimized for long-term farm success.", img: "/images/image5.jpg" },
    { title: "Harvest Logistics", desc: "Smart tracking for optimized resource allocation during harvest.", img: "/images/image6.jpg" }
  ];

  return (
    <div className="bg-[#fafafa] text-[#111] font-sans selection:bg-[#fcec90] selection:text-black overflow-x-hidden">

      {/* ── Modern Transparent Navbar ────────────────────────────────────────── */}
      <nav className="absolute top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight">AgriSense</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold opacity-90">
          <Link to="/dashboard" className="hover:text-[#fde047] transition-colors duration-300">Dashboard</Link>
          <Link to="/ai-assistant" className="hover:text-[#fde047] transition-colors duration-300">AI Assistant</Link>
          <Link to="/alerts" className="hover:text-[#fde047] transition-colors duration-300">Alerts</Link>
        </div>
        <Link
          to="/dashboard"
          className="hidden md:inline-flex px-6 py-2.5 rounded-full bg-[#fde047] text-black font-bold text-sm tracking-wide hover:scale-105 transition-transform shadow-md hover:bg-[#facc15]"
        >
          Start Free Trial
        </Link>
      </nav>

      {/* ── Section 1: Hero (Matches Image 1) ─────────────────────────────────── */}
      <style>
        {`
          @keyframes moveHeroForward {
            0% { transform: scale(1) translate(0, 0); }
            100% { transform: scale(1.08) translate(0, 1%); }
          }
          .animate-hero {
            animation: moveHeroForward 30s ease-out infinite alternate;
            will-change: transform;
          }
        `}
      </style>
      <section className="relative w-full h-[100svh] min-h-[700px] flex flex-col justify-end overflow-hidden pb-12 pt-32">
        {/* Background rounded image wrapper */}
        <div className="absolute inset-0 w-full h-full bg-[#1b4332]">
          <img
            src={IMAGES.hero}
            alt="Agricultural Landscape"
            className="w-full h-full object-cover animate-hero saturate-[1.1] contrast-[1.05]"
          />
          {/* Gradient overlays to darken text area */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>
        </div>

        {/* Content container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-end justify-between gap-12">

          <div className="max-w-2xl">
            <h1 className="text-[3.5rem] md:text-[5.5rem] leading-[1.05] font-semibold text-white tracking-tight mb-6">
              Growing Smarter<br />Farming Better.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-medium mb-10 max-w-lg leading-relaxed">
              Empowering farmers with sustainable solutions modern technology and data driven insights
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#fde047] text-black font-semibold text-lg hover:bg-[#facc15] hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(253,224,71,0.3)]"
              >
                Get Started
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
              </Link>
            </div>
          </div>

          {/* Floating feature card on the right */}
          <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-[200px] shadow-xl shrink-0 self-end mb-4 md:mb-0 transform hover:scale-105 transition-transform">
            <img src={IMAGES.tomatoes} className="w-full h-24 object-cover rounded-xl mb-3" alt="Fresh tomatoes" />
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="flex -space-x-2">
                <img src={IMAGES.av1} className="w-6 h-6 rounded-full border border-transparent relative z-30" alt="" />
                <img src={IMAGES.av2} className="w-6 h-6 rounded-full border border-transparent relative z-20" alt="" />
                <img src={IMAGES.av3} className="w-6 h-6 rounded-full border border-transparent relative z-10" alt="" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-[2px] text-[#fde047] drop-shadow-sm mb-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-[10px] text-white/90 font-medium">Trusted by 50K</p>
              </div>
            </div>
            <Link to="/alerts" className="block w-full py-2.5 rounded-lg bg-[#fde047] text-black text-center font-bold text-[11px] hover:bg-[#facc15] transition-colors leading-tight">
              24/7 Tech Support
            </Link>
          </div>

        </div>
      </section>

      {/* ── Section 2: Overview ───────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pb-32">
        <div className="grid lg:grid-cols-[1fr_2.5fr] gap-16 item-start">

          <div className="flex flex-col">
            <div className="flex -space-x-3 mb-4">
              <img src={IMAGES.av1} className="w-10 h-10 rounded-full border-2 border-white" alt="" />
              <img src={IMAGES.av2} className="w-10 h-10 rounded-full border-2 border-white" alt="" />
              <img src={IMAGES.av3} className="w-10 h-10 rounded-full border-2 border-white" alt="" />
              <img src={IMAGES.av4} className="w-10 h-10 rounded-full border-2 border-white" alt="" />
              <img src={IMAGES.av5} className="w-10 h-10 rounded-full border-2 border-white" alt="" />
            </div>
            <p className="text-gray-500 font-medium text-sm mb-4">Trusted by over</p>
            <div className="flex items-baseline gap-2 mb-10">
              <h2 className="text-5xl font-bold tracking-tight">50K+</h2>
              <span className="text-gray-500 font-medium text-sm">Farmer worldwide</span>
            </div>

            <div className="flex gap-4">
              <div className="overflow-hidden rounded-2xl aspect-square w-28 relative shadow-md">
                <img src={IMAGES.farmerHands} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="overflow-hidden rounded-2xl aspect-square w-28 relative shadow-md">
                <img src={IMAGES.ladyField} className="w-full h-full object-cover" alt="" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-[2.75rem] leading-[1.3] font-semibold text-gray-900 tracking-tight">
              We are committed to empowering farmers through <span className="inline-block mx-2 translate-y-2"><div className="w-24 h-11 bg-green-900 rounded-full overflow-hidden border-2 border-white shadow-xl"><img src={IMAGES.fieldChip} className="w-full h-full object-cover opacity-80" alt="" /></div></span> smart sustainable agricultural solutions that <span className="text-gray-400">improve productivity and protect the land.</span>
            </h2>
          </div>
        </div>
      </section>

      {/* ── Section 2.5: Full Width Stats Banner ───────────────────── */}
      <section className="w-full bg-[#112a1f] border-y border-[#1a472a] text-white">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1a472a]">
            {[
              { title: 'Acres Farmed', value: '10K+', sub: 'Supporting efficient farming at scale' },
              { title: 'Yield Improvement', value: '30%', sub: 'Growing more with smarter farming' },
              { title: 'Farmers Trust Us', value: '50K+', sub: 'Proven results farmers trust' },
            ].map((stat, i) => (
              <div key={i} className="px-6 py-10 md:py-12 flex flex-col justify-center items-center text-center hover:bg-[#153426] transition-colors duration-500 group relative">
                <div className="absolute top-6 right-6 text-white/10 group-hover:text-[#fde047] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" /></svg>
                </div>
                <span className="font-bold text-white/70 text-sm mb-4 tracking-wider uppercase">{stat.title}</span>
                <div className="text-4xl md:text-5xl font-semibold tracking-tight leading-none mb-3 text-white">{stat.value}</div>
                <p className="text-white/50 text-sm font-medium max-w-[220px]">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Solutions Carousel ─────────────────── */}
      <section className="bg-white py-24 border-t border-gray-100/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 max-w-md leading-tight">
              Complete Solutions for Modern Agriculture
            </h2>
            <div className="flex gap-4">
              <button
                onClick={scrollLeft}
                className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Scroll left"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={scrollRight}
                className="w-14 h-14 rounded-full bg-[#fde047] text-black flex items-center justify-center hover:bg-[#facc15] shadow-lg transition-colors"
                aria-label="Scroll right"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="relative -mx-6 px-6 lg:mx-0 lg:px-0">
            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-8 pt-4 hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>

              {CAROUSEL_CARDS.map((card, i) => (
                <div key={i} className="min-w-[80vw] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] shrink-0 snap-start bg-white rounded-[2rem] border border-gray-200 overflow-hidden relative group hover:shadow-2xl transition-shadow h-[400px] flex flex-col cursor-pointer">
                  <div className="flex-1 overflow-hidden relative">
                    <img src={card.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute inset-x-0 bottom-0 p-8 pb-10">
                      <h3 className="text-[1.35rem] font-semibold text-white tracking-tight leading-snug mb-3 drop-shadow-sm">
                        {card.title.split(' ').map((word, j) => <span key={j}>{word}<br /></span>)}
                      </h3>
                      <p className="text-white/80 text-sm font-medium line-clamp-2 leading-relaxed opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Section 4: Why Choose Us (Matches Image 4) ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Left Large Card */}
          <div className="rounded-[2.5rem] overflow-hidden relative min-h-[600px] shadow-2xl group">
            {susImages.map((src, i) => (
              <img
                key={src}
                src={src}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${i === susPracticeIdx ? 'opacity-100 z-0' : 'opacity-0 -z-10'} group-hover:scale-105`}
                alt=""
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#28382d]/90 z-0 pointer-events-none"></div>

            <button
              onClick={nextSusImage}
              className="absolute top-8 right-8 w-14 h-14 bg-[#fde047] text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg z-10"
              aria-label="Next slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
            </button>

            <div className="absolute inset-x-0 bottom-0 p-12">
              <h2 className="text-4xl font-semibold text-white mb-4 tracking-tight">Sustainable Practices</h2>
              <p className="text-white/80 font-medium text-lg max-w-md mb-8">Eco-friendly farming solutions that protect soil water and crops.</p>
              <div className="flex flex-wrap gap-4">
                {['Agri-Tech', 'Smart Fields', 'Eco-Farming'].map(tag => (
                  <span key={tag} className="px-6 py-2.5 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white font-medium text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex flex-col">
            <div className="mb-12 pt-4">
              <span className="inline-block px-5 py-2 rounded-full text-white font-semibold text-sm mb-6 bg-[#1a472a] shadow-md">
                Why Choose Us
              </span>
              <h2 className="text-5xl font-semibold text-gray-900 tracking-tight mb-6">Farming Made Easy.</h2>
              <p className="text-gray-500 text-lg leading-relaxed font-medium max-w-lg">
                We provide comprehensive innovative solutions tailored to address the unique challenges faced by modern farmers today.
              </p>

              <div className="flex gap-4 justify-end -mt-16 relative z-10 w-full pr-6">
                <button
                  onClick={scrollFarmingLeft}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={scrollFarmingRight}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#fde047] text-black flex items-center justify-center hover:bg-[#facc15] shadow-sm transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            <div className="relative -mx-6 px-6 lg:mx-0 lg:px-0 mt-6 flex-1 max-w-[100vw]">
              <div
                ref={farmingRef}
                className="flex gap-6 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-8 hide-scrollbar w-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {FARMING_EASY_CARDS.map((card, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-56 md:w-64 min-h-[300px] h-[360px] rounded-3xl overflow-hidden shadow-lg border border-gray-100 group snap-start cursor-pointer">
                    <img
                      src={card.img}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      alt={card.label}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"></div>
                    <div className="absolute inset-x-0 bottom-0 p-5 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10 pointer-events-none">
                      <div className="bg-[#1a472a] text-white rounded-2xl py-3 px-4 text-center font-semibold text-sm shadow-xl">
                        {card.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* ── Section 5: Call to Action ──────────────────────────── */}
      <section className="relative py-32 overflow-hidden bg-[#e0f2fe] rounded-t-[3rem]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-transparent z-10 pointer-events-none"></div>
          <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2670" className="absolute inset-0 w-full h-full object-cover object-bottom" alt="" />
        </div>
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-[2.75rem] md:text-[3.5rem] font-bold text-gray-900 mb-6 tracking-tight leading-[1.1] drop-shadow-sm">
            Smarter Technology. Bigger Yields <br /> Greater Success.
          </h2>
          <p className="text-lg md:text-xl text-gray-800 font-medium mb-12 max-w-2xl mx-auto drop-shadow-md">
            Join thousands of farmers using modern solutions to grow more with less.
          </p>
          <Link to="/dashboard" className="inline-flex items-center gap-3 bg-[#fde047] text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 shadow-2xl hover:bg-[#facc15] transition-all">
            Start Free Trial
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#111] text-white pt-24 pb-12 rounded-t-[2.5rem] -mt-8 relative z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 gap-y-16 mb-16">

            <div className="col-span-1 md:col-span-1">
              <h3 className="text-2xl font-bold mb-6 tracking-tight text-white flex items-center gap-2">
                <span className="text-[#fde047]">🌱</span> AgriSense
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
                Pioneering the future of agriculture with smart sensing, AI predictions, and intelligent resource management.
              </p>
              <div className="flex flex-col gap-3">
                <span className="text-[#fde047] text-sm font-medium cursor-pointer hover:underline">support@agrisense.com</span>
                <span className="text-[#fde047] text-sm font-medium flex items-center gap-2 cursor-pointer hover:underline">
                  +1 (555) 123-4567
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-semibold text-white/90 mb-2">Solutions</h4>
              <Link to="/predictions" className="text-white/50 text-sm hover:text-white transition-colors">Crop Prediction</Link>
              <Link to="/alerts" className="text-white/50 text-sm hover:text-white transition-colors">Smart Irrigation</Link>
              <Link to="/alerts" className="text-white/50 text-sm hover:text-white transition-colors">Disease Detection</Link>
              <Link to="/predictions" className="text-white/50 text-sm hover:text-white transition-colors">Yield Optimization</Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-semibold text-white/90 mb-2">Platform</h4>
              <Link to="/dashboard" className="text-white/50 text-sm hover:text-white transition-colors">Dashboard View</Link>
              <Link to="/ai-assistant" className="text-white/50 text-sm hover:text-white transition-colors">AI Assistant Central</Link>
              <Link to="/alerts" className="text-white/50 text-sm hover:text-white transition-colors">Real-time Weather</Link>
              <Link to="/dashboard" className="text-white/50 text-sm hover:text-white transition-colors">Sensor Analytics</Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-semibold text-white/90 mb-2">Company</h4>
              <Link to="#" className="text-white/50 text-sm hover:text-white transition-colors">About Us</Link>
              <Link to="#" className="text-white/50 text-sm hover:text-white transition-colors">Careers</Link>
              <Link to="#" className="text-white/50 text-sm hover:text-white transition-colors">Farm Blog</Link>
              <Link to="#" className="text-white/50 text-sm hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">© {new Date().getFullYear()} AgriSense Technologies. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="#" className="text-white/40 text-sm hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="#" className="text-white/40 text-sm hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
