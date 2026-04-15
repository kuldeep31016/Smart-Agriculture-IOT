/**
 * routes/predict.js — AI Crop Recommendation Endpoint
 *
 * Runs the Deep Learning simulation (cropPredict.js) against input sensor
 * values and returns a crop recommendation with irrigation + fertilizer advice.
 *
 * Route:
 *   POST /api/predict
 *   Body: { temperature, humidity, moisture }
 */

const express      = require('express');
const router       = express.Router();
const { predictCrop } = require('../model/cropPredict');

// POST /api/predict
router.post('/predict', (req, res) => {
  try {
    const { temperature, humidity, moisture } = req.body;

    // Validate input
    if (temperature === undefined || humidity === undefined || moisture === undefined) {
      return res.status(400).json({
        error:    'Missing required fields',
        required: ['temperature', 'humidity', 'moisture'],
      });
    }

    const temp  = parseFloat(temperature);
    const hum   = parseFloat(humidity);
    const moist = parseFloat(moisture);

    if (isNaN(temp) || isNaN(hum) || isNaN(moist)) {
      return res.status(400).json({ error: 'All fields must be valid numbers' });
    }

    // ── Run AI inference (Deep Learning simulation) ───────────────────────────
    const result = predictCrop(temp, hum, moist);

    res.json({
      ...result,
      input: { temperature: temp, humidity: hum, moisture: moist },
      model: 'AgriSense DL Simulation v1.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Prediction failed', details: error.message });
  }
});

module.exports = router;
