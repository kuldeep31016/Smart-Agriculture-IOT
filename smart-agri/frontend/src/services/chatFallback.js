// Agriculture Fallback Q&A
// Used when Gemini API is unavailable (quota exceeded, network error, etc.)
// Tone: formal, professional, minimal emojis — like a knowledgeable agronomist

const GREETING_WORDS = [
  'hi', 'hello', 'hey', 'namaste', 'namaskar', 'helo', 'hii', 'hiii',
  'good morning', 'good afternoon', 'good evening', 'good night',
  'how are you', 'how r u', "what's up", 'whats up', 'sup',
];

const GREETING_RESPONSE =
  `Hello! I am AgriSense AI, your smart farming assistant.\n\n` +
  `I can help you with the following topics:\n` +
  `- Crop recommendations by season (Kharif, Rabi, Zaid)\n` +
  `- Fertilizer advice (NPK, Urea, DAP, organic inputs)\n` +
  `- Irrigation scheduling and water management\n` +
  `- Plant disease identification and prevention\n` +
  `- Soil health, pH management, and preparation\n` +
  `- Post-harvest handling and storage\n` +
  `- Government schemes and subsidies\n\n` +
  `Please type your question and I will assist you.`;

const QA = [

  // ── Seasons ──────────────────────────────────────────────────────────────────
  {
    tags: ['kharif', 'monsoon', 'rainy season', 'rainy', 'rain season', 'june', 'july', 'august', 'september'],
    answer:
      `Kharif Season (June – October)\n\n` +
      `Kharif crops are sown at the onset of the monsoon and harvested in autumn. Recommended crops:\n\n` +
      `- Rice (Paddy): Requires standing water and temperatures of 25–35°C.\n` +
      `- Maize: Grows well in well-drained soil with moderate rainfall.\n` +
      `- Cotton: Needs warm climate and 500–700 mm of rainfall.\n` +
      `- Soybean: Suitable for black and red soils.\n` +
      `- Groundnut: Prefers sandy loam soil with good drainage.\n` +
      `- Bajra (Pearl Millet): Drought-tolerant; grows well in light soils.\n` +
      `- Sugarcane: Requires heavy rainfall and a long growing season.\n` +
      `- Arhar (Tur Dal): Well-suited for rain-fed and low-fertility soils.\n\n` +
      `Important: Ensure proper field drainage before sowing to prevent waterlogging during heavy rainfall events.`,
  },

  {
    tags: ['rabi', 'winter', 'winter season', 'november', 'december', 'january', 'february', 'winter crop', 'sardi'],
    answer:
      `Rabi Season (November – March)\n\n` +
      `Rabi crops are sown after the monsoon retreats and harvested in spring. Recommended crops:\n\n` +
      `- Wheat: The most important rabi crop. Optimal temperature: 10–25°C.\n` +
      `- Mustard (Sarson): Cold-tolerant oil crop with low water requirement.\n` +
      `- Gram (Chickpea): Grows well in dry, cool conditions on black soil.\n` +
      `- Barley: Drought-resistant and suitable for poor soils.\n` +
      `- Lentil (Masoor): Very low water requirement; good for small farmers.\n` +
      `- Peas: Requires cool weather; sensitive to frost after flowering.\n` +
      `- Potato: Ideal temperature range is 15–25°C. Avoid waterlogging.\n\n` +
      `Key practice: For wheat, the first irrigation at the Crown Root Initiation (CRI) stage — 21 days after sowing — is the most critical for yield.`,
  },

  {
    tags: ['zaid', 'summer', 'summer season', 'march', 'april', 'may', 'grishma', 'garmi', 'hot season'],
    answer:
      `Zaid Season (March – June)\n\n` +
      `Zaid crops are grown during the short summer period between Rabi harvest and Kharif sowing.\n\n` +
      `- Watermelon: High temperature tolerance; grows well in sandy soil.\n` +
      `- Muskmelon: Prefers warm, dry climate.\n` +
      `- Cucumber: Short duration crop (45–50 days).\n` +
      `- Bitter Gourd (Karela): Heat-tolerant; suitable for summer cultivation.\n` +
      `- Moong Dal (Green Gram): Short duration and heat-tolerant legume.\n` +
      `- Fodder Crops (Cowpea): Grown for livestock feed during summer months.\n\n` +
      `Key practice: Apply mulch (straw or plastic) to reduce soil temperature and conserve 30–40% water during the hot months.`,
  },

  // ── Specific Crops ────────────────────────────────────────────────────────────
  {
    tags: ['rice', 'paddy', 'dhan', 'chawal'],
    answer:
      `Rice (Paddy) Cultivation Guide\n\n` +
      `Season: Kharif (June – November)\n` +
      `Temperature: 25–35°C for germination; 20–27°C at maturity\n` +
      `Water requirement: 1200–1800 mm per season. Maintain 5 cm standing water in field.\n` +
      `Soil: Clayey loam; field should be well-puddled before transplanting.\n\n` +
      `Fertilizer schedule (per acre):\n` +
      `- At transplanting (basal): DAP 50 kg + MOP 25 kg\n` +
      `- At 21 days: Urea 25 kg\n` +
      `- At 42 days: Urea 25 kg\n\n` +
      `Common diseases:\n` +
      `- Blast disease: Apply Tricyclazole 75 WP at 0.6 g/L\n` +
      `- Brown Plant Hopper: Drain water from field; apply Imidacloprid 17.8 SL\n\n` +
      `Note: The SRI (System of Rice Intensification) method can increase yield by 20–50% with less water.`,
  },

  {
    tags: ['wheat', 'gehu', 'gehun'],
    answer:
      `Wheat Cultivation Guide\n\n` +
      `Season: Rabi (November – April)\n` +
      `Temperature: 10–25°C. Frost during grain filling stage significantly reduces yield.\n\n` +
      `Critical irrigation stages:\n` +
      `1. CRI stage (21 days after sowing) — most important\n` +
      `2. Tillering (45 days)\n` +
      `3. Jointing (60 days)\n` +
      `4. Flowering (90 days)\n` +
      `5. Grain filling (105 days)\n\n` +
      `Fertilizer:\n` +
      `- Basal: DAP 50 kg/acre at sowing\n` +
      `- Urea: 50 kg/acre in 3 equal splits at CRI, tillering, and jointing stages\n\n` +
      `Recommended varieties for North India: HD-2967, GW-496, PBW-550\n\n` +
      `Note: Delayed sowing beyond December 15 reduces wheat yield by approximately 1–1.5% per day.`,
  },

  {
    tags: ['tomato', 'tamatar'],
    answer:
      `Tomato Cultivation Guide\n\n` +
      `Season: October–February (open field); year-round in polyhouse\n` +
      `Temperature: 20–27°C is optimal. Above 35°C causes flower and fruit drop.\n` +
      `Soil: Well-drained sandy loam, pH 6.0–7.0\n\n` +
      `Fertilizer (per hectare):\n` +
      `- Basal: FYM 10 tonnes + NPK 120:80:80 kg\n` +
      `- Top dressing: Urea 30 days after transplanting\n\n` +
      `Disease management:\n` +
      `- Blossom drop: Check for temperature stress and calcium deficiency\n` +
      `- Early blight: Apply Mancozeb 75 WP at 2 g/L\n` +
      `- Late blight: Apply Metalaxyl + Mancozeb at 2.5 g/L\n\n` +
      `Note: Drip irrigation combined with plastic mulching increases tomato yield by up to 40%.`,
  },

  // ── Fertilizers ──────────────────────────────────────────────────────────────
  {
    tags: ['fertilizer', 'fertiliser', 'khad', 'npk', 'urea', 'dap', 'potash', 'nitrogen', 'phosphorus', 'potassium'],
    answer:
      `Fertilizer Guide\n\n` +
      `Major fertilizers and their uses:\n\n` +
      `- Urea (46-0-0): Pure nitrogen source. Apply in 2–3 split doses. Avoid application immediately before rainfall.\n` +
      `- DAP (18-46-0): Provides nitrogen and phosphorus. Apply as a basal dose at sowing.\n` +
      `- MOP (0-0-60): Muriate of Potash. Improves fruit quality, disease resistance, and drought tolerance.\n` +
      `- NPK 10-26-26: Balanced formulation for vegetables and fruit crops.\n` +
      `- SSP (0-16-0): Single Super Phosphate. Also supplies sulphur, beneficial for oilseed crops.\n\n` +
      `Visual deficiency symptoms:\n` +
      `- Yellow leaves (lower, older): Nitrogen deficiency → Apply Urea\n` +
      `- Purple or reddish leaves: Phosphorus deficiency → Apply DAP\n` +
      `- Brown or scorched leaf margins: Potassium deficiency → Apply MOP\n\n` +
      `Recommendation: Always conduct a soil test before applying fertilizers to avoid over-application and cost wastage.`,
  },

  {
    tags: ['organic', 'compost', 'vermicompost', 'bio fertilizer', 'organic farming', 'natural farming', 'jeevamrutha'],
    answer:
      `Organic Farming and Natural Inputs\n\n` +
      `Organic fertilizers and their application rates:\n\n` +
      `- FYM (Farm Yard Manure): 10–15 tonnes/ha. NPK approximately 0.5:0.25:0.5.\n` +
      `- Vermicompost: 2–4 tonnes/ha. Rich in micronutrients and beneficial organisms.\n` +
      `- Green Manure (Dhaincha / Sunn Hemp): Plough in before flowering stage.\n` +
      `- Neem Cake: 200 kg/ha. Acts as nitrogen source and pest deterrent.\n\n` +
      `Bio-fertilizers:\n` +
      `- Rhizobium: For legume crops — enhances atmospheric nitrogen fixation.\n` +
      `- PSB (Phosphate Solubilizing Bacteria): Releases locked phosphorus in soil.\n` +
      `- Azotobacter: For cereal crops; fixes atmospheric nitrogen.\n\n` +
      `Jeevamrutha preparation:\n` +
      `Mix 200 L water + 10 kg fresh cow dung + 5–10 L cow urine + 2 kg jaggery + 2 kg gram flour. Ferment for 48 hours, then dilute 1:10 and apply.\n\n` +
      `Note: Transitioning to organic farming typically requires 2–3 seasons for soil to stabilize, but input costs reduce by 40% over time.`,
  },

  // ── Irrigation ────────────────────────────────────────────────────────────────
  {
    tags: ['irrigation', 'water', 'irrigate', 'sinchayee', 'paani', 'pani', 'when to water'],
    answer:
      `Irrigation Guide\n\n` +
      `Irrigation methods and efficiency:\n\n` +
      `- Flood irrigation: Lowest cost, but 40–50% water is wasted.\n` +
      `- Furrow irrigation: Suitable for row crops such as maize and sugarcane.\n` +
      `- Sprinkler irrigation: ~75% efficiency. Good for wheat, groundnut, vegetables.\n` +
      `- Drip irrigation: ~90% efficiency. Saves 50–60% water. Best for fruits and vegetables.\n\n` +
      `When to irrigate (based on soil moisture):\n` +
      `- Below 25%: Irrigate immediately.\n` +
      `- 25–40%: Schedule irrigation within 1–2 days.\n` +
      `- 40–70%: Optimal range — no irrigation needed.\n` +
      `- Above 70%: Do not irrigate; risk of root rot.\n\n` +
      `Water requirement per crop (approximate):\n` +
      `- Wheat: 400–500 mm over 4–6 irrigations\n` +
      `- Rice: 1200–1800 mm (continuous or AWD method)\n` +
      `- Vegetables: 25–35 mm every 2–3 days via drip\n\n` +
      `Tip: Irrigate in early morning or evening to reduce evaporation loss by 25–30%.`,
  },

  {
    tags: ['drip', 'drip irrigation', 'drip system', 'trickle'],
    answer:
      `Drip Irrigation — Complete Guide\n\n` +
      `Benefits:\n` +
      `- Saves 50–60% water compared to flood irrigation.\n` +
      `- Increases crop yield by 30–50%.\n` +
      `- Reduces weed growth significantly.\n` +
      `- Eligible for 50–90% government subsidy (PMKSY scheme) for small and marginal farmers.\n\n` +
      `Best crops for drip irrigation:\n` +
      `Tomato, Pomegranate, Banana, Onion, Sugarcane, Cotton, Grapes, Chilli\n\n` +
      `System specifications:\n` +
      `- Lateral spacing: 60–90 cm for vegetables\n` +
      `- Emitter flow rate: 2–4 litres per hour\n` +
      `- Fertigation: Inject soluble fertilizers through the drip system 3 times per week\n\n` +
      `Maintenance:\n` +
      `- Flush lateral lines once a month.\n` +
      `- Inspect and clean the filter every week.\n` +
      `- Clean blocked emitters with 10% HCl solution.\n\n` +
      `Note: Drip irrigation combined with mulching can reduce water use by up to 70% — especially useful in water-scarce regions.`,
  },

  // ── Soil ──────────────────────────────────────────────────────────────────────
  {
    tags: ['soil', 'mitti', 'ph', 'soil health', 'soil test', 'soil type', 'soil quality'],
    answer:
      `Soil Health and Management\n\n` +
      `Soil pH management:\n` +
      `- pH below 6.0 (Acidic): Apply agricultural lime (calcium carbonate) at 1–2 tonnes/ha.\n` +
      `- pH 6.0–7.5 (Optimal): Suitable for most crops; no amendment needed.\n` +
      `- pH above 8.0 (Alkaline/Sodic): Apply gypsum at 2–3 tonnes/ha.\n\n` +
      `Major soil types and suitable crops in India:\n` +
      `- Alluvial soil: Wheat, rice, sugarcane (most fertile, North Indian plains)\n` +
      `- Black soil (Regur): Cotton, soybean, jowar (Deccan plateau)\n` +
      `- Red soil: Groundnut, millets, tobacco (peninsular India)\n` +
      `- Laterite soil: Tea, coffee, cashew (Western Ghats, Northeast)\n\n` +
      `Best practices:\n` +
      `- Deep ploughing (25–30 cm) once every 3 years breaks hardpan.\n` +
      `- Add 10 tonnes FYM/ha before the first crop of the season.\n` +
      `- Leave the field fallow in peak summer to kill soil-borne pathogens.\n\n` +
      `Note: Soil Health Card testing is free for farmers under the Government of India scheme. Test your soil every 3 years.`,
  },

  {
    tags: ['soil moisture', 'dry soil', 'wet soil', 'waterlog', 'waterlogging'],
    answer:
      `Soil Moisture Management\n\n` +
      `Moisture level interpretation:\n` +
      `- Below 25%: Critically dry. Irrigate immediately to prevent crop stress.\n` +
      `- 25–40%: Low. Schedule irrigation within 24–48 hours.\n` +
      `- 40–70%: Optimal range for most field crops.\n` +
      `- 70–85%: High. Reduce or stop irrigation. Monitor for root issues.\n` +
      `- Above 85%: Waterlogged. Open drainage channels immediately.\n\n` +
      `How to conserve soil moisture:\n` +
      `- Mulching (straw or plastic film) reduces evaporation by 40–60%.\n` +
      `- Deep ploughing improves water infiltration and storage capacity.\n` +
      `- Contour bunding on sloped fields prevents runoff.\n\n` +
      `Signs of waterlogging:\n` +
      `- Yellowing of lower leaves\n` +
      `- Foul smell from the soil (anaerobic decomposition)\n` +
      `- Wilting of plant despite visibly wet soil`,
  },

  {
    tags: ['crop rotation', 'rotation', 'intercrop', 'mixed crop', 'fallow'],
    answer:
      `Crop Rotation and Intercropping\n\n` +
      `Why practice crop rotation:\n` +
      `- Breaks pest and disease cycles that build up under monoculture.\n` +
      `- Legumes in rotation fix atmospheric nitrogen, reducing fertilizer cost by 20–30%.\n` +
      `- Improves soil structure and organic matter content.\n\n` +
      `Recommended rotation sequences:\n` +
      `- Rice → Wheat → Legume (standard rotation in North India)\n` +
      `- Maize → Wheat → Groundnut\n` +
      `- Cotton → Wheat → Moong\n` +
      `- Sugarcane → Wheat → Moong\n\n` +
      `Effective intercropping combinations:\n` +
      `- Maize + Cowpea: Cowpea fixes nitrogen and provides ground cover.\n` +
      `- Cotton + Moong: Moong is harvested before cotton reaches full canopy.\n` +
      `- Sugarcane + Potato or Onion: Efficient use of inter-row space.\n\n` +
      `General rule: Always follow a cereal crop with a legume to naturally replenish soil nitrogen.`,
  },

  // ── Diseases ──────────────────────────────────────────────────────────────────
  {
    tags: ['disease', 'fungal', 'blight', 'fungus', 'rust', 'mildew', 'rot', 'leaf spot', 'infection'],
    answer:
      `Common Fungal Diseases and Management\n\n` +
      `Major fungal diseases:\n\n` +
      `- Late Blight (Potato/Tomato): Grey-brown water-soaked lesions. Apply Metalaxyl + Mancozeb at 2.5 g/L.\n` +
      `- Powdery Mildew: White powdery coating on leaves. Apply Sulfur 80 WP or Hexaconazole 5 EC.\n` +
      `- Rust (Wheat/Soybean): Orange or brown pustules on leaves. Apply Propiconazole 25 EC at 1 ml/L.\n` +
      `- Downy Mildew: Yellow angular patches on upper leaf surface. Apply Cymoxanil + Mancozeb.\n` +
      `- Stem Rot: Water-soaked lesions at stem base. Use Trichoderma viride as soil treatment.\n\n` +
      `Preventive practices:\n` +
      `- Maintain proper plant spacing for air circulation.\n` +
      `- Avoid overhead irrigation; use drip where possible.\n` +
      `- Apply Trichoderma viride 2.5 kg/ha mixed in compost as soil treatment before sowing.\n\n` +
      `High-risk environmental conditions:\n` +
      `Humidity above 80% combined with temperatures of 20–25°C and prolonged leaf wetness create ideal conditions for fungal outbreaks.\n\n` +
      `Preventive spray: Bordeaux mixture (1%) applied before the monsoon season provides broad-spectrum fungal protection.`,
  },

  {
    tags: ['pest', 'insect', 'aphid', 'whitefly', 'caterpillar', 'borer', 'thrips', 'kida', 'keeda', 'bug'],
    answer:
      `Pest Identification and Control\n\n` +
      `Common pests and recommended treatments:\n\n` +
      `- Aphids: Cluster on tender shoots and suck sap, causing leaf curling. Apply Imidacloprid 17.8 SL at 0.5 ml/L or Neem oil 5 ml/L.\n` +
      `- Whitefly: Transmits viral diseases. Use yellow sticky traps + Thiamethoxam 25 WG at 0.3 g/L.\n` +
      `- Stem Borer (Rice): Dead heart symptom during tillering. Apply Cartap Hydrochloride 50 SP.\n` +
      `- Bollworm (Cotton): Damages bolls. Apply Emamectin Benzoate 5 SG at 0.5 g/L.\n` +
      `- Thrips: Causes silver streaking on leaves and fruit scarring. Apply Spinosad 45 SC at 0.3 ml/L.\n` +
      `- Termites: Attack roots and stems at soil level. Drench with Chlorpyrifos 20 EC at root zone.\n\n` +
      `Integrated Pest Management (IPM) approaches:\n` +
      `- Yellow or blue sticky traps for monitoring and mass trapping.\n` +
      `- Light traps (1 per acre) for moth species.\n` +
      `- Pheromone traps for bollworms and fruit borers.\n` +
      `- Neem oil spray (5 ml/L) every 7 days as a preventive measure.\n\n` +
      `Important: Do not apply insecticides during the flowering stage as this harms pollinators and reduces fruit set.`,
  },

  // ── Temperature & Conditions ──────────────────────────────────────────────────
  {
    tags: ['temperature', 'heat stress', 'heat', 'hot', 'cold', 'frost', 'garmi', 'sardi'],
    answer:
      `Temperature Management for Crops\n\n` +
      `Optimal temperature ranges:\n` +
      `- Rice: 25–35°C | Wheat: 10–25°C | Maize: 25–30°C\n` +
      `- Tomato: 20–27°C | Potato: 15–25°C | Onion: 13–24°C\n\n` +
      `Managing heat stress (above 38°C):\n` +
      `- Irrigate in the evening to cool the root zone.\n` +
      `- Apply 0.5% Potassium Nitrate foliar spray to reduce heat stress.\n` +
      `- Use shade nets (30–50% shade intensity) for vegetable crops.\n` +
      `- Avoid any field operations between 11 AM and 3 PM.\n\n` +
      `Frost protection (below 5°C):\n` +
      `- Apply a light irrigation just before an expected frost — the heat released during water freezing protects plants.\n` +
      `- Use frost cloth or straw mulch to cover sensitive crops overnight.\n` +
      `- Spray 0.1% Thiourea or 2% Potassium Nitrate the evening before expected frost.\n\n` +
      `Note: Night temperatures are more critical than daytime temperatures for grain filling in wheat and rice.`,
  },

  {
    tags: ['humidity', 'humid', 'aardrata', 'dry air'],
    answer:
      `Humidity Effects on Crops\n\n` +
      `Optimal relative humidity for most field crops: 50–75%\n\n` +
      `High humidity (above 80%):\n` +
      `- Increases risk of fungal diseases such as blight, rust, and powdery mildew.\n` +
      `- Reduces pollination efficiency and pollen viability.\n` +
      `- Recommended actions: Improve inter-row air circulation, switch to drip irrigation (avoid wetting foliage), apply fungicide preventively.\n\n` +
      `Low humidity (below 30%):\n` +
      `- Increases transpiration rate, leading to moisture stress even when soil is adequately watered.\n` +
      `- Can cause tip burn in leafy vegetables.\n` +
      `- Recommended actions: Increase irrigation frequency, apply mulch, use shade nets during peak afternoon hours.\n\n` +
      `Note: Sprinkler irrigation raises local humidity by 5–10% and can be beneficial in dry, arid regions.`,
  },

  // ── Modern Farming ────────────────────────────────────────────────────────────
  {
    tags: ['greenhouse', 'polyhouse', 'protected cultivation', 'shade net', 'tunnel farming'],
    answer:
      `Greenhouse and Polyhouse Farming\n\n` +
      `Key benefits:\n` +
      `- Year-round crop production, independent of seasons or monsoon.\n` +
      `- 3–5 times higher yield per unit area compared to open-field cultivation.\n` +
      `- Up to 80% water savings when drip irrigation is used inside.\n\n` +
      `Approximate setup cost: Rs. 700–1200 per square meter for medium-tech polyhouse\n` +
      `Government subsidy: 50–65% under the National Horticulture Mission (NHM)\n\n` +
      `Best crops for polyhouse:\n` +
      `- Vegetables: Tomato, Capsicum (Bell Pepper), Cucumber\n` +
      `- Flowers: Rose, Gerbera, Carnation\n` +
      `- Leafy greens: Lettuce, Spinach, Basil\n\n` +
      `Environmental parameters to maintain:\n` +
      `- Temperature: 18–30°C\n` +
      `- Relative humidity: 60–70%\n` +
      `- CO2 concentration: 400–1000 ppm\n\n` +
      `Note: Fog-cooling systems can reduce polyhouse temperature by 8–10°C during summer months.`,
  },

  // ── Government & General ──────────────────────────────────────────────────────
  {
    tags: ['government scheme', 'subsidy', 'pm kisan', 'fasal bima', 'crop insurance', 'kcc', 'loan', 'yojana'],
    answer:
      `Government Schemes for Farmers\n\n` +
      `Major schemes and benefits:\n\n` +
      `- PM-KISAN: Rs. 6000 per year (paid in 3 installments) to small and marginal farmers with less than 2 hectares land.\n` +
      `- PMFBY (Crop Insurance): Premium of 1.5–2% for Kharif crops; government bears remaining cost.\n` +
      `- Kisan Credit Card (KCC): Short-term crop loan at 4% interest (up to Rs. 3 lakh).\n` +
      `- Soil Health Card: Free soil testing every 3 years with crop-wise fertilizer recommendations.\n` +
      `- PMKSY (Irrigation Scheme): 50–90% subsidy on drip and sprinkler irrigation systems.\n` +
      `- eNAM (Electronic Market): Online trading portal for better market price discovery.\n\n` +
      `How to apply:\n` +
      `- Visit your nearest Common Service Centre (CSC) or Krishi Vigyan Kendra (KVK).\n` +
      `- For PM-KISAN: Register at pmkisan.gov.in with Aadhaar number and bank account.\n` +
      `- For PMFBY: Apply through your bank or insurance company before crop sowing deadline.`,
  },

  {
    tags: ['agrisense', 'how to use', 'what is agrisense', 'features', 'help', 'guide', 'about'],
    answer:
      `About AgriSense\n\n` +
      `AgriSense is a smart agriculture monitoring system that combines IoT sensors, cloud storage, and AI to help farmers make better decisions.\n\n` +
      `System components:\n` +
      `- Live Dashboard: Real-time Temperature, Humidity, and Soil Moisture readings from IoT sensors (ESP32 + DHT11).\n` +
      `- AI Assistant: Six AI-powered advisory tools using Google Gemini — crop recommendations, fertilizer advice, irrigation scheduling, disease risk assessment, data trend analysis, and this chatbot.\n` +
      `- Smart Alerts: Automatic detection and notification when any sensor value crosses a safe threshold.\n` +
      `- Cloud Storage: All sensor readings are stored in Firebase Firestore.\n\n` +
      `To start streaming sensor data:\n` +
      `- Real ESP32: Run "python main.py" in the terminal\n` +
      `- Simulated data: Run "python iot_sender.py" in the terminal\n\n` +
      `This project covers Problem Statement 7: IoT + Cloud + Deep Learning based Smart Agriculture.`,
  },

  // ── Seed & Harvest ────────────────────────────────────────────────────────────
  {
    tags: ['seed', 'seedling', 'nursery', 'germination', 'seed treatment', 'beej', 'sowing'],
    answer:
      `Seed Selection and Treatment\n\n` +
      `Selecting good quality seed:\n` +
      `- Use certified seeds from government agencies or reputed companies.\n` +
      `- Float test: Soak seeds in water for 10 minutes. Healthy seeds sink; discard those that float.\n` +
      `- Use seeds from the current season — germination rate declines with age.\n\n` +
      `Seed treatment before sowing:\n` +
      `1. Fungicide treatment: Thiram or Carbendazim at 2 g per kg of seed.\n` +
      `2. Bio-agent treatment: Trichoderma viride at 5 g per kg of seed.\n` +
      `3. Bio-fertilizer coating: Rhizobium or PSB for legume crops.\n\n` +
      `Nursery preparation:\n` +
      `- Use cocopeat + soil + compost in a 1:1:1 ratio for nursery trays.\n` +
      `- Water the nursery twice daily; avoid waterlogging.\n` +
      `- Harden seedlings for 7 days before transplanting by gradually reducing irrigation.\n\n` +
      `Tip: Seed priming — soaking seeds in plain water for 6–8 hours before sowing — can improve germination rate and uniformity by 20–30%.`,
  },

  {
    tags: ['harvest', 'harvesting', 'yield', 'katai', 'collection', 'when to harvest'],
    answer:
      `Crop Harvesting Guide\n\n` +
      `Indicators for correct harvest timing:\n` +
      `- Wheat: Grains are hard and chalky-white; grain moisture below 14%; straw is fully yellow.\n` +
      `- Rice: 80–85% of the panicle has yellowed; approximately 25–30 days after heading.\n` +
      `- Maize: Silks are brown and dry; kernel is dented; husk is dry and papery.\n` +
      `- Tomato: 60–80% surface colour change for market; 90–100% for local sale or processing.\n` +
      `- Onion: 50% or more tops have naturally fallen over.\n\n` +
      `Post-harvest handling:\n` +
      `- Dry all grain crops to below 14% moisture before storage.\n` +
      `- Use hermetic (airtight) storage bags to prevent insect infestation without chemicals.\n` +
      `- Cure root and bulb vegetables (onion, potato, garlic) in a well-ventilated area for 7–10 days before storage.\n\n` +
      `Yield loss factors:\n` +
      `- Delayed wheat harvest: Approximately 1–1.5% yield loss per day after optimum harvest date.\n` +
      `- Improper threshing leads to grain breakage and quality downgrade.`,
  },
];

// Default response when no keyword matches
const DEFAULT_RESPONSE =
  `I was not able to find a specific answer for that query in my knowledge base.\n\n` +
  `You may try asking about one of the following topics:\n\n` +
  `- Crop selection by season (e.g., "which crops to grow in winter season")\n` +
  `- Fertilizer recommendations (e.g., "how much urea to apply for wheat")\n` +
  `- Irrigation advice (e.g., "when should I irrigate my field")\n` +
  `- Disease and pest management (e.g., "how to treat fungal disease in rice")\n` +
  `- Soil health (e.g., "how to improve acidic soil")\n` +
  `- Government schemes (e.g., "how to apply for PM-KISAN")\n\n` +
  `Please rephrase your question and I will do my best to assist.`;

// ─────────────────────────────────────────────────────────────────────────────
export function getFallbackResponse(message) {
  const msg = (message || '').toLowerCase().trim();
  if (!msg) return GREETING_RESPONSE;

  // Greeting check — only for short messages that are clearly greetings
  const isGreeting = GREETING_WORDS.some(
    g => msg === g || msg.startsWith(g + ' ') || msg.endsWith(' ' + g) || msg === g + '!'
  );
  if (isGreeting && msg.length < 35) {
    return GREETING_RESPONSE;
  }

  // Find best Q&A match by keyword count
  let best = null;
  let topScore = 0;

  for (const qa of QA) {
    const score = qa.tags.reduce((n, tag) => n + (msg.includes(tag) ? 1 : 0), 0);
    if (score > topScore) {
      topScore = score;
      best = qa;
    }
  }

  return best && topScore > 0 ? best.answer : DEFAULT_RESPONSE;
}
