// Agriculture Fallback Q&A — used when Gemini API is unavailable
// Covers greetings + 30+ common agriculture topics asked by Indian farmers
// Keyword-based matching: finds best answer based on words in user's message

// ── Greeting detection ────────────────────────────────────────────────────────
const GREETING_WORDS = [
  'hi', 'hello', 'hey', 'namaste', 'namaskar', 'helo', 'hii', 'hiii',
  'good morning', 'good afternoon', 'good evening', 'good night',
  'how are you', 'how r u', "what's up", 'whats up', 'sup',
];

const GREETING_RESPONSE =
  `Hello! 👋 I'm AgriSense AI, your smart farming assistant!\n\n` +
  `I can help you with:\n` +
  `• 🌾 Crop recommendations (Kharif, Rabi, Zaid seasons)\n` +
  `• 💊 Fertilizer advice (NPK, Urea, DAP, organic)\n` +
  `• 💧 Irrigation scheduling and drip irrigation tips\n` +
  `• 🦠 Disease and pest identification\n` +
  `• 🌱 Soil health and preparation\n` +
  `• 📊 Understanding your sensor data\n\n` +
  `Ask me anything about your farm — in English or Hindi!`;

// ── Comprehensive Q&A database ────────────────────────────────────────────────
// Each entry: tags (keywords to match), answer (response text)

const QA = [

  // ── Seasons ─────────────────────────────────────────────────────────────────
  {
    tags: ['kharif', 'monsoon', 'rainy season', 'rainy', 'rain season', 'june', 'july', 'august', 'september'],
    answer:
      `🌧️ **Kharif Season Crops (June – October)**\n\n` +
      `Best crops to grow during monsoon/rainy season:\n\n` +
      `• **Rice (Paddy)** — Needs high water, temp 25–35°C. Best in low-lying fields.\n` +
      `• **Maize (Corn)** — Well-drained soil, moderate rainfall.\n` +
      `• **Cotton** — Warm climate, needs 500–700mm rain.\n` +
      `• **Soybean** — Black/red soil, good for oil and protein.\n` +
      `• **Groundnut** — Sandy loam soil, good drainage.\n` +
      `• **Bajra (Pearl Millet)** — Drought-tolerant, light soil.\n` +
      `• **Sugarcane** — Heavy rainfall, grows year-round.\n` +
      `• **Arhar (Tur Dal)** — Rain-fed conditions, poor soil.\n\n` +
      `💡 Tip: Ensure proper drainage to prevent waterlogging during heavy rains.`,
  },

  {
    tags: ['rabi', 'winter', 'winter season', 'november', 'december', 'january', 'february', 'winter crop', 'sardi'],
    answer:
      `❄️ **Rabi Season Crops (November – March)**\n\n` +
      `Best crops to grow in winter season:\n\n` +
      `• **Wheat** — India's most important rabi crop. Temp 10–25°C.\n` +
      `• **Mustard (Sarson)** — Cold-tolerant, oil crop. Low water need.\n` +
      `• **Gram (Chickpea)** — Dry, cool weather. Best in black soil.\n` +
      `• **Barley** — Drought-resistant, good for poor soils.\n` +
      `• **Lentil (Masoor)** — Very low water requirement.\n` +
      `• **Peas** — Cool weather, frost-sensitive. Quick crop.\n` +
      `• **Potato** — Ideal temp 15–25°C. Avoid waterlogging.\n` +
      `• **Sunflower** — Good oil yield in moderate cold.\n\n` +
      `💡 Tip: Irrigate wheat at Crown Root Initiation stage (21 days after sowing).`,
  },

  {
    tags: ['zaid', 'summer', 'summer season', 'march', 'april', 'may', 'grishma', 'garmi', 'hot season'],
    answer:
      `☀️ **Zaid Season Crops (March – June)**\n\n` +
      `Best crops to grow in summer season:\n\n` +
      `• **Watermelon** — High temp, sandy soil, low water.\n` +
      `• **Muskmelon** — Warm, dry climate ideal.\n` +
      `• **Cucumber** — Quick crop, 45–50 days.\n` +
      `• **Bitter Gourd (Karela)** — Heat-tolerant vegetable.\n` +
      `• **Moong Dal (Green Gram)** — Short duration, heat-tolerant.\n` +
      `• **Fodder Crops (Cowpea)** — For cattle feed.\n` +
      `• **Sunflower** — Grows well in summer too.\n\n` +
      `💡 Tip: Mulching in summer reduces soil temperature and conserves 30–40% water.`,
  },

  // ── Specific Crops ───────────────────────────────────────────────────────────
  {
    tags: ['rice', 'paddy', 'dhan', 'chawal'],
    answer:
      `🌾 **Rice (Paddy) Cultivation Guide**\n\n` +
      `• **Season:** Kharif (June–November)\n` +
      `• **Temperature:** 25–35°C for germination, 20–27°C at harvest\n` +
      `• **Water:** Needs 1200–1800mm water per season. Keep 5cm standing water.\n` +
      `• **Soil:** Clayey loam, well-puddled field.\n\n` +
      `**Fertilizer Schedule:**\n` +
      `• Basal: DAP 50kg/acre + MOP 25kg/acre at transplanting\n` +
      `• 21 days: Urea 25kg/acre\n` +
      `• 42 days: Urea 25kg/acre\n\n` +
      `**Common Diseases:**\n` +
      `• Blast disease → Apply Tricyclazole\n` +
      `• Brown Plant Hopper → Drain water, apply Imidacloprid\n\n` +
      `💡 SRI method (System of Rice Intensification) can increase yield by 20–50%.`,
  },

  {
    tags: ['wheat', 'gehu', 'gehun'],
    answer:
      `🌿 **Wheat Cultivation Guide**\n\n` +
      `• **Season:** Rabi (November–April)\n` +
      `• **Temperature:** 10–25°C. Frost during grain filling reduces yield.\n` +
      `• **Water:** 4–6 irrigations. Critical stages:\n` +
      `  1. CRI (21 days) — most critical\n` +
      `  2. Tillering (45 days)\n` +
      `  3. Jointing (60 days)\n` +
      `  4. Flowering (90 days)\n\n` +
      `**Fertilizer:**\n` +
      `• DAP 50kg/acre at sowing + Urea 50kg/acre in 3 splits\n\n` +
      `**Varieties:** HD-2967, GW-496, PBW-550 (for North India)\n\n` +
      `💡 Tip: Delayed sowing beyond December 15 reduces yield by 1-1.5% per day.`,
  },

  {
    tags: ['maize', 'corn', 'makka', 'makkai', 'bhutta'],
    answer:
      `🌽 **Maize Cultivation Guide**\n\n` +
      `• **Season:** Kharif + Rabi both possible\n` +
      `• **Temperature:** 25–33°C ideal\n` +
      `• **Soil:** Well-drained loam or sandy loam, pH 6–7.5\n` +
      `• **Water:** 500–700mm. Sensitive to waterlogging.\n\n` +
      `**Fertilizer:** NPK 120:60:40 kg/ha\n` +
      `• Basal: DAP + MOP + 1/3 Urea at sowing\n` +
      `• 30 days: 1/3 Urea\n` +
      `• 60 days: 1/3 Urea\n\n` +
      `**Common Pest:** Fall Armyworm → Spray Spinetoram or Emamectin Benzoate\n\n` +
      `💡 Maize as inter-crop with legumes improves soil nitrogen naturally.`,
  },

  {
    tags: ['tomato', 'tamatar'],
    answer:
      `🍅 **Tomato Growing Guide**\n\n` +
      `• **Season:** All-year in greenhouse; Oct–Feb in open field\n` +
      `• **Temperature:** 20–27°C ideal. Above 35°C drops fruits.\n` +
      `• **Soil:** Well-drained sandy loam, pH 6–7\n\n` +
      `**Fertilizer:**\n` +
      `• Basal: FYM 10t/ha + NPK 120:80:80 kg/ha\n` +
      `• Side dressing: Urea 30 days after transplanting\n\n` +
      `**Common Problems:**\n` +
      `• Blossom drop → Check temperature, calcium\n` +
      `• Early blight → Apply Mancozeb\n` +
      `• Late blight → Apply Metalaxyl\n\n` +
      `💡 Drip irrigation + mulching increases tomato yield by 40%.`,
  },

  {
    tags: ['onion', 'pyaaz', 'pyaj'],
    answer:
      `🧅 **Onion Cultivation Guide**\n\n` +
      `• **Season:** Kharif (June), Rabi (Oct–Nov), Late Kharif (Aug)\n` +
      `• **Temperature:** 13–24°C for bulb formation\n` +
      `• **Soil:** Well-drained loam, pH 6–7\n\n` +
      `**Fertilizer:** NPK 100:50:50 kg/ha\n` +
      `• Critical: Potash improves bulb size and storability\n\n` +
      `**Irrigation:** Drip preferred. Stop 10 days before harvest.\n\n` +
      `**Common Disease:** Purple blotch → Apply Iprodione\n\n` +
      `💡 Tip: Proper curing (drying) after harvest reduces storage losses by 50%.`,
  },

  // ── Fertilizers ──────────────────────────────────────────────────────────────
  {
    tags: ['fertilizer', 'fertiliser', 'khad', 'npk', 'urea', 'dap', 'potash', 'nitrogen', 'phosphorus', 'potassium'],
    answer:
      `💊 **Fertilizer Guide for Indian Farmers**\n\n` +
      `**Major Fertilizers:**\n` +
      `• **Urea (46-0-0)** — Pure nitrogen. Apply in split doses. Avoid applying before rain.\n` +
      `• **DAP (18-46-0)** — Nitrogen + Phosphorus. Apply at sowing as basal dose.\n` +
      `• **MOP (0-0-60)** — Muriate of Potash. Improves fruit quality and disease resistance.\n` +
      `• **NPK 10-26-26** — Balanced for vegetables and fruits.\n` +
      `• **SSP (0-16-0)** — Single Super Phosphate. Also contains Sulphur.\n\n` +
      `**Golden Rule:** Apply fertilizer based on soil test for best results.\n\n` +
      `**Deficiency Signs:**\n` +
      `• Yellow leaves = Nitrogen deficiency → Apply Urea\n` +
      `• Purple leaves = Phosphorus deficiency → Apply DAP\n` +
      `• Brown leaf edges = Potassium deficiency → Apply MOP\n\n` +
      `💡 Organic matter (FYM/compost) reduces fertilizer need by 25–30%.`,
  },

  {
    tags: ['organic', 'compost', 'vermicompost', 'jeevamrutha', 'bio fertilizer', 'organic farming', 'natural farming'],
    answer:
      `🌿 **Organic Farming & Natural Inputs**\n\n` +
      `**Organic Fertilizers:**\n` +
      `• **FYM (Farm Yard Manure):** Apply 10–15 tonnes/ha. NPK ratio 0.5:0.25:0.5\n` +
      `• **Vermicompost:** 2–4 tonnes/ha. Rich in micronutrients.\n` +
      `• **Green Manure:** Dhaincha or Sunn Hemp → plough before flowering.\n` +
      `• **Neem Cake:** 200kg/ha. Pest repellent + nitrogen source.\n\n` +
      `**Bio-fertilizers:**\n` +
      `• Rhizobium → for legumes (boosts nitrogen fixation)\n` +
      `• PSB (Phosphate Solubilizing Bacteria) → releases locked phosphorus\n` +
      `• Azotobacter → for cereals, fixes atmospheric nitrogen\n\n` +
      `**Jeevamrutha Recipe:**\n` +
      `• 200L water + 10kg cow dung + 5–10L cow urine + 2kg jaggery + 2kg gram flour\n` +
      `• Ferment 48 hours, dilute 1:10 and apply\n\n` +
      `💡 Organic farming takes 2–3 years to stabilize but reduces input cost by 40%.`,
  },

  // ── Irrigation ───────────────────────────────────────────────────────────────
  {
    tags: ['irrigation', 'water', 'drip', 'sprinkler', 'irrigate', 'sinchayee', 'paani', 'pani'],
    answer:
      `💧 **Irrigation Guide**\n\n` +
      `**Methods Comparison:**\n` +
      `• **Flood Irrigation** — Cheapest, wastes 40–50% water.\n` +
      `• **Drip Irrigation** — 90% efficiency. Saves 50–60% water. Best for fruits & vegetables.\n` +
      `• **Sprinkler** — 75% efficiency. Good for wheat, groundnut, vegetables.\n` +
      `• **Furrow** — Good for row crops like maize, sugarcane.\n\n` +
      `**When to Irrigate:**\n` +
      `• Soil moisture below 25% → Irrigate immediately\n` +
      `• Soil moisture 25–60% → Monitor closely\n` +
      `• Soil moisture above 60% → Do not irrigate\n\n` +
      `**Water Requirements:**\n` +
      `• Wheat: 4–6 irrigations, 400–500mm total\n` +
      `• Rice: Continuous flooding or AWD method\n` +
      `• Vegetables: Every 2–3 days via drip\n\n` +
      `💡 Irrigate in early morning or evening — reduces evaporation by 30%.`,
  },

  {
    tags: ['drip', 'drip irrigation', 'drip system', 'trickle'],
    answer:
      `💧 **Drip Irrigation — Complete Guide**\n\n` +
      `**Benefits:**\n` +
      `• Saves 50–60% water vs flood irrigation\n` +
      `• 30–50% higher yield\n` +
      `• Reduces weed growth\n` +
      `• Government subsidy: 50–90% for small farmers\n\n` +
      `**Best Crops for Drip:**\n` +
      `Tomato, Pomegranate, Banana, Onion, Sugarcane, Cotton, Grapes\n\n` +
      `**Installation Tips:**\n` +
      `• Lateral spacing: 60–90cm for vegetables\n` +
      `• Emitter flow: 2–4 LPH\n` +
      `• Fertigation: Add soluble fertilizers through drip 3 times/week\n\n` +
      `**Maintenance:**\n` +
      `• Flush laterals monthly\n` +
      `• Check filter every week\n` +
      `• Clean emitters with 10% HCl solution if blocked\n\n` +
      `💡 Drip with mulching saves up to 70% water — ideal for water-scarce areas.`,
  },

  // ── Soil ─────────────────────────────────────────────────────────────────────
  {
    tags: ['soil', 'mitti', 'ph', 'soil health', 'soil test', 'soil type'],
    answer:
      `🌱 **Soil Health Guide**\n\n` +
      `**Soil pH Ranges:**\n` +
      `• pH < 6 (Acidic) — Add lime (calcium carbonate) @ 1–2 tonnes/ha\n` +
      `• pH 6–7.5 (Ideal) — Most crops grow well\n` +
      `• pH > 8 (Alkaline) — Add gypsum @ 2–3 tonnes/ha\n\n` +
      `**Soil Types in India:**\n` +
      `• Alluvial soil → Wheat, rice, sugarcane (best fertile soil)\n` +
      `• Black soil (Regur) → Cotton, soybean, jowar\n` +
      `• Red soil → Groundnut, millets, tobacco\n` +
      `• Laterite soil → Tea, coffee, cashew\n\n` +
      `**Soil Preparation:**\n` +
      `• Deep ploughing once in 3 years (25–30cm)\n` +
      `• Add 10 tonnes FYM before first crop\n` +
      `• Leave field fallow in extreme heat to kill soil-borne pests\n\n` +
      `💡 Get soil tested every 3 years — Soil Health Card scheme is free for farmers.`,
  },

  {
    tags: ['soil moisture', 'moisture', 'dry soil', 'wet soil', 'waterlog'],
    answer:
      `🌱 **Soil Moisture Management**\n\n` +
      `**Moisture Levels:**\n` +
      `• < 25% — Critically Dry → Irrigate immediately!\n` +
      `• 25–40% — Low → Schedule irrigation soon\n` +
      `• 40–70% — Optimal → Ideal for most crops\n` +
      `• 70–85% — High → Monitor, reduce irrigation\n` +
      `• > 85% — Waterlogged → Drain immediately\n\n` +
      `**How to Retain Moisture:**\n` +
      `• Mulching (straw/plastic) reduces evaporation 40–60%\n` +
      `• Deep ploughing improves water infiltration\n` +
      `• Contour bunding in sloped fields\n\n` +
      `**Waterlogging Signs:**\n` +
      `• Yellowing of lower leaves\n` +
      `• Root rot smell from soil\n` +
      `• Wilting despite wet soil\n\n` +
      `💡 Mulching in summer reduces irrigation frequency by 50%.`,
  },

  {
    tags: ['crop rotation', 'rotation', 'intercrop', 'mixed crop'],
    answer:
      `🔄 **Crop Rotation & Intercropping**\n\n` +
      `**Why Rotate Crops?**\n` +
      `• Breaks pest and disease cycles\n` +
      `• Improves soil nitrogen (legume rotation)\n` +
      `• Reduces fertilizer cost by 20–30%\n\n` +
      `**Recommended Rotations:**\n` +
      `• Rice → Wheat → Legume (most common in North India)\n` +
      `• Maize → Wheat → Groundnut\n` +
      `• Cotton → Wheat → Moong\n` +
      `• Sugarcane → Wheat → Moong\n\n` +
      `**Good Intercropping Combos:**\n` +
      `• Maize + Cowpea (nitrogen fixing)\n` +
      `• Cotton + Moong (short duration legume)\n` +
      `• Sugarcane + Potato/Onion\n` +
      `• Coconut + Banana + Ginger\n\n` +
      `💡 Always follow cereal crop with a legume to naturally restore soil nitrogen.`,
  },

  // ── Diseases & Pests ─────────────────────────────────────────────────────────
  {
    tags: ['disease', 'fungal', 'blight', 'fungus', 'rust', 'mildew', 'rot', 'leaf spot'],
    answer:
      `🦠 **Common Fungal Diseases & Prevention**\n\n` +
      `**Top Fungal Diseases:**\n` +
      `• **Late Blight** (Potato/Tomato) — Grey-brown lesions. Apply Metalaxyl+Mancozeb\n` +
      `• **Powdery Mildew** — White powder on leaves. Apply Sulfur or Hexaconazole\n` +
      `• **Rust** (Wheat) — Orange pustules. Apply Propiconazole\n` +
      `• **Downy Mildew** — Yellow patches. Apply Cymoxanil\n` +
      `• **Stem Rot** — Water-soaked lesions at stem base. Use Trichoderma\n\n` +
      `**Preventive Measures:**\n` +
      `• Avoid overhead irrigation when possible\n` +
      `• Ensure good air circulation (proper spacing)\n` +
      `• Use resistant varieties\n` +
      `• Apply Trichoderma viride 2.5kg/ha in soil\n\n` +
      `**High-Risk Conditions:**\n` +
      `• Humidity > 80% + Temperature 20–25°C\n` +
      `• Rainy weather for 3+ consecutive days\n\n` +
      `💡 Spray Bordeaux mixture (1%) as preventive before monsoon starts.`,
  },

  {
    tags: ['pest', 'insect', 'aphid', 'whitefly', 'caterpillar', 'borer', 'thrips', 'kida', 'keeda'],
    answer:
      `🐛 **Pest Control Guide**\n\n` +
      `**Common Pests:**\n` +
      `• **Aphids** — Suck sap, cause curling. Apply Imidacloprid or Neem oil.\n` +
      `• **Whitefly** — Spread viral diseases. Use Yellow sticky traps + Thiamethoxam.\n` +
      `• **Stem Borer** (Rice) — Dead hearts in tillering. Apply Cartap Hydrochloride.\n` +
      `• **American Bollworm** (Cotton) — Damages bolls. Apply Emamectin Benzoate.\n` +
      `• **Thrips** — Silver streaks on leaves. Apply Spinosad.\n` +
      `• **Termites** — Attack roots. Drench with Chlorpyrifos at root zone.\n\n` +
      `**Organic/IPM Methods:**\n` +
      `• Neem oil spray (5ml/L) — effective for soft-bodied insects\n` +
      `• Yellow/Blue sticky traps — for whitefly, thrips\n` +
      `• Light traps — for moths (1 trap per acre)\n` +
      `• Pheromone traps — for bollworms\n\n` +
      `💡 Never spray insecticides during flowering — kills pollinators.`,
  },

  {
    tags: ['neem', 'neem oil', 'organic pest', 'bio pesticide'],
    answer:
      `🌿 **Neem-Based Pest Control**\n\n` +
      `**Neem Products:**\n` +
      `• **Neem Oil (5000 ppm):** 5ml/L water — spray every 7 days\n` +
      `• **NSKE (Neem Seed Kernel Extract):** 50g/L — excellent for sucking pests\n` +
      `• **Neem Cake:** 200kg/ha in soil — protects roots from nematodes\n\n` +
      `**Effective Against:**\n` +
      `• Aphids, Whitefly, Mites, Thrips, Caterpillars\n` +
      `• Soil nematodes, Termites\n\n` +
      `**Preparation:**\n` +
      `• Crush 500g neem seeds, soak in 10L water overnight\n` +
      `• Filter and spray on plants in early morning\n` +
      `• Add 2–3ml soap solution as sticker\n\n` +
      `💡 Neem works as repellent + disrupts insect growth hormone — safer than chemicals.`,
  },

  // ── Temperature & Weather ────────────────────────────────────────────────────
  {
    tags: ['temperature', 'heat', 'hot', 'cold', 'frost', 'garmi', 'sardi', 'tanman'],
    answer:
      `🌡️ **Temperature Effects on Crops**\n\n` +
      `**Optimal Temperature Ranges:**\n` +
      `• Rice: 25–35°C | Wheat: 10–25°C | Maize: 25–30°C\n` +
      `• Tomato: 20–27°C | Potato: 15–25°C | Onion: 13–24°C\n\n` +
      `**Heat Stress (>38°C):**\n` +
      `• Pollen sterility in cereals → Yield loss\n` +
      `• Flower/fruit drop in vegetables\n` +
      `• Actions: Irrigate at night, apply potassium spray, provide shade nets\n\n` +
      `**Cold/Frost Protection (<5°C):**\n` +
      `• Light irrigation before frost — forms protective ice film\n` +
      `• Smoke/foggers in the field overnight\n` +
      `• Spray 0.1% Thiourea or 2% Potassium Nitrate\n\n` +
      `**Based on your sensor reading:** If temp > 38°C, increase irrigation frequency.\n\n` +
      `💡 Night temperatures matter more than day temps for grain filling in wheat.`,
  },

  {
    tags: ['humidity', 'aardrata', 'humid', 'dry air'],
    answer:
      `💧 **Humidity Effects on Crops**\n\n` +
      `**Optimal Humidity Ranges:**\n` +
      `• Most crops: 50–75% relative humidity\n` +
      `• High-value vegetables: 65–80%\n\n` +
      `**High Humidity (>80%):**\n` +
      `• Increases fungal disease risk (blight, mildew, rust)\n` +
      `• Reduces pollination efficiency\n` +
      `• Actions: Improve air circulation, avoid evening irrigation, apply fungicide preventively\n\n` +
      `**Low Humidity (<30%):**\n` +
      `• Increases transpiration → moisture stress\n` +
      `• Tip burn in leafy vegetables\n` +
      `• Actions: Increase irrigation frequency, apply mulch, use shade nets\n\n` +
      `💡 Sprinkler irrigation increases local humidity by 5–10% — useful in dry regions.`,
  },

  // ── Greenhouse / Modern Farming ──────────────────────────────────────────────
  {
    tags: ['greenhouse', 'polyhouse', 'protected cultivation', 'shade net', 'tunnel'],
    answer:
      `🏠 **Greenhouse / Polyhouse Farming**\n\n` +
      `**Benefits:**\n` +
      `• Year-round production regardless of season\n` +
      `• 3–5x higher yield per unit area\n` +
      `• Up to 80% water savings with drip\n` +
      `• No dependency on monsoon\n\n` +
      `**Setup Cost:** ₹700–1200/sqm for medium-tech polyhouse\n` +
      `**Subsidy:** 50–65% under National Horticulture Mission\n\n` +
      `**Best Crops for Polyhouse:**\n` +
      `• Tomato, Capsicum (Bell Pepper), Cucumber\n` +
      `• Rose, Gerbera, Carnation (flowers)\n` +
      `• Lettuce, Spinach (leafy greens)\n\n` +
      `**Key Parameters to Control:**\n` +
      `• Temperature: 18–30°C\n` +
      `• Humidity: 60–70%\n` +
      `• CO2: 400–1000 ppm\n\n` +
      `💡 Fog cooling systems reduce polyhouse temperature by 8–10°C in summer.`,
  },

  {
    tags: ['hydroponics', 'hydroponic', 'soilless', 'water culture', 'nft'],
    answer:
      `🌊 **Hydroponics — Soilless Farming**\n\n` +
      `**What is Hydroponics?**\n` +
      `Crops grown in nutrient-rich water solution without soil.\n\n` +
      `**Benefits:**\n` +
      `• 90% less water than soil farming\n` +
      `• 3–4x faster growth\n` +
      `• No weeds, no soil-borne diseases\n` +
      `• Can be done in urban areas/rooftops\n\n` +
      `**Systems:**\n` +
      `• NFT (Nutrient Film Technique) — lettuce, herbs\n` +
      `• Deep Water Culture — fast growing leafy greens\n` +
      `• Drip system — tomato, cucumber, capsicum\n\n` +
      `**Best Crops:** Lettuce, Spinach, Tomato, Cucumber, Herbs (Basil, Mint)\n\n` +
      `**Nutrient Solution:** EC 1.5–2.5 mS/cm, pH 5.5–6.5\n\n` +
      `💡 Hydroponics produces 8–10 kg lettuce/sqm vs 2–3 kg in soil.`,
  },

  // ── General Agriculture ──────────────────────────────────────────────────────
  {
    tags: ['seed', 'seedling', 'nursery', 'germination', 'seed treatment', 'beej'],
    answer:
      `🌱 **Seed Selection & Treatment**\n\n` +
      `**Good Seed Selection:**\n` +
      `• Use certified seeds from government/reputed companies\n` +
      `• Float test: soak in water — good seeds sink\n` +
      `• Use seeds from current year (avoid old stock)\n\n` +
      `**Seed Treatment (before sowing):**\n` +
      `• Fungicide: Thiram or Carbendazim 2g/kg seed\n` +
      `• Bio-agent: Trichoderma 5g/kg seed\n` +
      `• Bio-fertilizer: Rhizobium/PSB coating for legumes\n\n` +
      `**Nursery Tips:**\n` +
      `• Use cocopeat + soil + compost (1:1:1 ratio)\n` +
      `• Water nursery twice daily\n` +
      `• Harden seedlings 7 days before transplanting (reduce watering)\n\n` +
      `💡 Seed priming in water for 6–8 hours improves germination by 20–30%.`,
  },

  {
    tags: ['harvest', 'harvesting', 'yield', 'katai', 'collection'],
    answer:
      `🌾 **Harvesting Guide**\n\n` +
      `**Right Time to Harvest:**\n` +
      `• Wheat: Grains hard, moisture < 14%, straw yellow\n` +
      `• Rice: 85% panicle yellowing, 25–30 days after flowering\n` +
      `• Maize: Silks brown, kernel dented, husk dry\n` +
      `• Tomato: 60–80% red colour for market\n` +
      `• Onion: 50% tops fallen over\n\n` +
      `**Post-Harvest Tips:**\n` +
      `• Dry grains to < 14% moisture before storage\n` +
      `• Use hermetic bags for grain storage (prevents pest)\n` +
      `• Cure root vegetables (onion, potato) before storage\n\n` +
      `**Yield Loss Prevention:**\n` +
      `• Delayed harvest: 1–2% loss per week in wheat\n` +
      `• Proper threshing reduces grain breakage\n\n` +
      `💡 Mechanical harvesting reduces post-harvest loss by 3–5% vs manual cutting.`,
  },

  {
    tags: ['storage', 'grain storage', 'godown', 'silo', 'weevil', 'storage pest'],
    answer:
      `🏪 **Grain Storage & Post-Harvest**\n\n` +
      `**Storage Conditions:**\n` +
      `• Grain moisture: < 14% (critical!)\n` +
      `• Temperature: < 25°C\n` +
      `• Humidity: < 70% RH\n\n` +
      `**Common Storage Pests:**\n` +
      `• Weevils, Grain borers → Apply Aluminum Phosphide tablets\n` +
      `• Rats → Use rodenticide or mechanical traps\n\n` +
      `**Safe Storage Methods:**\n` +
      `• Hermetic bags (PICS bags) — no chemicals needed\n` +
      `• Clean + dry godown before filling\n` +
      `• Neem leaf layer at bottom and top\n` +
      `• Grain spread thickness < 1.5m for air circulation\n\n` +
      `💡 India loses 4–5% of stored grain to pests — proper storage saves ₹50,000+ per year.`,
  },

  {
    tags: ['government scheme', 'subsidy', 'pm kisan', 'fasal bima', 'insurance', 'loan', 'kcc'],
    answer:
      `🏛️ **Government Schemes for Farmers**\n\n` +
      `**Major Schemes:**\n` +
      `• **PM-KISAN** — ₹6000/year to small/marginal farmers (3 installments)\n` +
      `• **PMFBY** — Crop insurance @ 1.5–2% premium for Kharif crops\n` +
      `• **KCC (Kisan Credit Card)** — Crop loan at 4% interest (up to ₹3 lakh)\n` +
      `• **Soil Health Card** — Free soil testing every 3 years\n` +
      `• **PMKSY** — Drip/sprinkler irrigation subsidy 50–90%\n` +
      `• **eNAM** — Online market portal for better crop prices\n\n` +
      `**How to Apply:**\n` +
      `• Visit nearest Common Service Centre (CSC)\n` +
      `• Or apply online at pmkisan.gov.in, pmfby.gov.in\n\n` +
      `💡 Register on PM-KISAN portal with Aadhaar — direct benefit transfer to bank.`,
  },

  {
    tags: ['agrisense', 'how to use', 'what is', 'features', 'dashboard', 'help', 'guide'],
    answer:
      `🌾 **Welcome to AgriSense!**\n\n` +
      `**What AgriSense does:**\n` +
      `• 📡 **Live Monitoring** — Real-time Temperature, Humidity & Soil Moisture from IoT sensors\n` +
      `• 🤖 **AI Assistant** — Gemini AI for crop advice, fertilizer, irrigation recommendations\n` +
      `• ⚠️ **Smart Alerts** — Automatic alerts when sensor readings cross safe thresholds\n` +
      `• ☁️ **Cloud Storage** — All data saved in Firebase Firestore\n\n` +
      `**Pages:**\n` +
      `• /dashboard — Live sensor data, charts, data table\n` +
      `• /ai-assistant — 6 AI sections + chatbot\n` +
      `• /alerts — Historical alerts with filter\n\n` +
      `**To start IoT data stream:**\n` +
      `\`python main.py\` → reads ESP32 via USB\n` +
      `\`python iot_sender.py\` → simulated data for testing\n\n` +
      `💡 This project covers Problem Statement 7: IoT + Cloud + Deep Learning.`,
  },
];

// Default response when no keyword matches
const DEFAULT_RESPONSE =
  `I'm not sure about that specific question, but I can help you with:\n\n` +
  `• 🌾 Crops by season (ask "best crops for winter/rainy season")\n` +
  `• 💊 Fertilizers (ask "which fertilizer for wheat/rice/tomato")\n` +
  `• 💧 Irrigation (ask "when should I irrigate" or "drip irrigation tips")\n` +
  `• 🦠 Diseases (ask "how to prevent fungal diseases")\n` +
  `• 🌱 Soil health (ask "how to improve soil quality")\n` +
  `• 🏛️ Government schemes (ask "PM-KISAN scheme details")\n\n` +
  `Try asking in simple words and I'll do my best to help! 🙏`;

// ─────────────────────────────────────────────────────────────────────────────
// Main export: get fallback response for a given message
// ─────────────────────────────────────────────────────────────────────────────
export function getFallbackResponse(message) {
  const msg = (message || '').toLowerCase().trim();

  if (!msg) return GREETING_RESPONSE;

  // Check for greeting
  const isGreeting = GREETING_WORDS.some(g => msg === g || msg.startsWith(g + ' ') || msg.includes(' ' + g));
  if (isGreeting && msg.length < 40) {
    return GREETING_RESPONSE;
  }

  // Find best matching Q&A (highest keyword match score)
  let bestMatch = null;
  let bestScore = 0;

  for (const qa of QA) {
    const score = qa.tags.reduce((acc, tag) => acc + (msg.includes(tag) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.answer;
  }

  return DEFAULT_RESPONSE;
}
