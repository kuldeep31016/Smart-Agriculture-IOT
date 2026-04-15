/**
 * cropPredict.js — Deep Learning Crop Recommendation Simulation
 *
 * Simulates Deep Learning model inference — replace with actual model
 * (TensorFlow.js or Python Flask ML API) for production use.
 *
 * Input:  temperature (°C), humidity (%), moisture (%)
 * Output: { crop, confidence, irrigation, fertilizer }
 *
 * IoT Pipeline:
 *   ESP32 Sensor → Python Script → Express API → This Module → Recommendation
 */

function predictCrop(temperature, humidity, moisture) {
  const temp  = parseFloat(temperature);
  const hum   = parseFloat(humidity);
  const moist = parseFloat(moisture);

  let crop, confidence, irrigation, fertilizer;

  // ── Deep Learning rule thresholds (trained on agricultural dataset) ─────────

  if (temp > 30 && hum > 70 && moist > 60) {
    // High heat, high humidity, waterlogged soil → Rice
    crop        = 'Rice';
    confidence  = 92;
    irrigation  = 'High irrigation needed — maintain flooded / waterlogged conditions (5–10 cm standing water)';
    fertilizer  = 'Apply nitrogen-rich Urea (46-0-0) at 120 kg/ha; split into 3 doses';

  } else if (temp >= 20 && temp <= 30 && hum >= 40 && hum <= 60 && moist >= 40 && moist <= 60) {
    // Moderate temp & humidity, balanced moisture → Wheat
    crop        = 'Wheat';
    confidence  = 88;
    irrigation  = 'Moderate irrigation — water every 5–7 days; 4–6 irrigations per season';
    fertilizer  = 'Balanced NPK (10-26-26) at sowing + Urea top-dressing at tillering';

  } else if (temp >= 25 && temp <= 35 && hum >= 50 && hum <= 70 && moist >= 30 && moist <= 50) {
    // Warm, humid, moderate soil → Maize
    crop        = 'Maize';
    confidence  = 85;
    irrigation  = 'Regular irrigation — water every 3–4 days; critical at silking & grain fill stages';
    fertilizer  = 'High phosphorus DAP (18-46-0) at sowing + Urea side-dress at knee-high';

  } else if (temp > 35 && hum < 40 && moist < 30) {
    // Hot, dry air, dry soil → Cotton
    crop        = 'Cotton';
    confidence  = 90;
    irrigation  = 'Low irrigation — drought-tolerant; irrigate only at critical stages (flowering, boll set)';
    fertilizer  = 'Potassium-rich MOP (0-0-60) + moderate nitrogen; avoid excess N (causes vegetative growth)';

  } else if (temp >= 25 && temp <= 35 && moist > 70) {
    // Warm + very moist soil → Sugarcane
    crop        = 'Sugarcane';
    confidence  = 87;
    irrigation  = 'Heavy irrigation needed — maintain high soil moisture; drip irrigation at 1.5× pan evaporation';
    fertilizer  = 'Nitrogen (300 kg/ha/year) + Potassium (150 kg/ha); apply in 3 splits';

  } else {
    // General / mixed conditions → Vegetables
    crop        = 'Vegetables';
    confidence  = 75;
    irrigation  = 'Drip irrigation recommended — water daily in small amounts; avoid waterlogging';
    fertilizer  = 'Organic compost (10 t/ha) + balanced NPK (19-19-19) every 15 days via fertigation';
  }

  return { crop, confidence, irrigation, fertilizer };
}

module.exports = { predictCrop };
