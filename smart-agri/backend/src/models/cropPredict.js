function predictCrop(temperature, humidity, moisture) {
  const temp = parseFloat(temperature);
  const hum = parseFloat(humidity);
  const moist = parseFloat(moisture);

  let crop, confidence, irrigation, fertilizer;

  if (temp > 30 && hum > 70 && moist > 60) {
    crop = 'Rice';
    confidence = 92;
    irrigation = 'High irrigation needed — maintain flooded / waterlogged conditions (5–10 cm standing water)';
    fertilizer = 'Apply nitrogen-rich Urea (46-0-0) at 120 kg/ha; split into 3 doses';
  } else if (temp >= 20 && temp <= 30 && hum >= 40 && hum <= 60 && moist >= 40 && moist <= 60) {
    crop = 'Wheat';
    confidence = 88;
    irrigation = 'Moderate irrigation — water every 5–7 days; 4–6 irrigations per season';
    fertilizer = 'Balanced NPK (10-26-26) at sowing + Urea top-dressing at tillering';
  } else if (temp >= 25 && temp <= 35 && hum >= 50 && hum <= 70 && moist >= 30 && moist <= 50) {
    crop = 'Maize';
    confidence = 85;
    irrigation = 'Regular irrigation — water every 3–4 days; critical at silking & grain fill stages';
    fertilizer = 'High phosphorus DAP (18-46-0) at sowing + Urea side-dress at knee-high';
  } else if (temp > 35 && hum < 40 && moist < 30) {
    crop = 'Cotton';
    confidence = 90;
    irrigation = 'Low irrigation — drought-tolerant; irrigate only at critical stages (flowering, boll set)';
    fertilizer = 'Potassium-rich MOP (0-0-60) + moderate nitrogen; avoid excess N (causes vegetative growth)';
  } else if (temp >= 25 && temp <= 35 && moist > 70) {
    crop = 'Sugarcane';
    confidence = 87;
    irrigation = 'Heavy irrigation needed — maintain high soil moisture; drip irrigation at 1.5× pan evaporation';
    fertilizer = 'Nitrogen (300 kg/ha/year) + Potassium (150 kg/ha); apply in 3 splits';
  } else {
    crop = 'Vegetables';
    confidence = 75;
    irrigation = 'Drip irrigation recommended — water daily in small amounts; avoid waterlogging';
    fertilizer = 'Organic compost (10 t/ha) + balanced NPK (19-19-19) every 15 days via fertigation';
  }

  return { crop, confidence, irrigation, fertilizer };
}

module.exports = { predictCrop };
