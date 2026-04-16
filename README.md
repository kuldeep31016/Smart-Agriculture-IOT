# Smart Agriculture IoT + Cloud + Deep Learning System

AgriSense is a smart agriculture monitoring and advisory platform that combines **IoT sensor data**, **cloud storage**, **AI assistance**, and **deep learning forecasting** to help farmers and reviewers understand crop conditions in real time.

The project is designed as a full-stack engineering solution with:

- **IoT layer** for live temperature, humidity, and soil moisture capture
- **Cloud layer** using Firebase Firestore for storage and retrieval
- **AI layer** using Google Gemini for advisory responses
- **Deep learning layer** using TensorFlow.js LSTM forecasting
- **Frontend dashboard** for monitoring, prediction, alerts, and assistant workflows

---

## Project goals

This project demonstrates how modern agriculture software can be built end-to-end:

1. Capture field sensor readings from hardware or a simulated sender
2. Push readings into the cloud in real time
3. Visualize the latest data in a web dashboard
4. Run AI-based agricultural advisory workflows
5. Train a neural network on historical telemetry and forecast future conditions
6. Provide actionable alerts for irrigation, heat stress, and moisture changes

---

## Key features

### IoT and data ingestion

- Reads **temperature**, **humidity**, and **soil moisture**
- Supports real sensor input through Python scripts
- Supports simulated telemetry for demo/testing
- Sends sensor data to the backend API

### Cloud computing

- Stores sensor readings in **Firebase Firestore**
- Fetches live and historical telemetry from the cloud
- Provides a cloud-backed fallback when local demo mode is unavailable

### AI assistant

- Uses **Google Gemini** for agricultural advice
- Supports crop recommendation, fertilizer guidance, irrigation scheduling, disease risk, and chat Q&A
- Includes backend proxy support to keep the API key server-side

### Deep learning forecasting

- Uses **TensorFlow.js** in the frontend
- Trains an **LSTM neural network** on historical readings
- Predicts future temperature, humidity, and soil moisture values
- Visualizes predictions and generates smart alerts

### Dashboard and user experience

- Live sensor cards
- AI assistant page
- Prediction page with charts
- Alerts and farmer insights pages
- Clean navigation and responsive UI

---

## Technology stack

### Frontend

- React
- Vite
- Tailwind CSS
- Firebase Web SDK
- TensorFlow.js
- Recharts
- React Router

### Backend

- Node.js
- Express
- Firebase Admin SDK
- Google Gemini API proxy

### IoT / Python

- Python sensor sender scripts
- ESP32 / DHT11 / soil moisture data ingestion support

---

## System architecture

```mermaid
flowchart LR
	HW[IoT Hardware\nESP32 + sensors] --> PY[Python sender\nmain.py / iot_sender.py]
	PY --> API[Backend API\nExpress]
	API --> FB[(Firebase Firestore)]
	FB --> UI[React Dashboard]
	UI --> AI[Gemini AI Assistant]
	UI --> DL[TensorFlow.js LSTM Forecasting]
	DL --> Alerts[Smart Alerts]
```

### Data flow in simple terms

1. Sensor hardware captures environmental values
2. Python script forwards readings to the backend
3. Backend stores data in Firestore or demo memory store
4. Frontend fetches data from backend / Firestore
5. AI Assistant uses the latest readings to generate recommendations
6. Prediction module trains on history and forecasts future values

---

## Repository structure

```text
README.md
smart-agri/
	iot_sender.py                 # Simulated / real sensor data sender
	backend/
		server.js                    # Active backend entrypoint
		firebase.js                  # Firebase Admin initialization
		routes/
			sensor.js                  # Sensor ingestion + Firestore save/fetch
			gemini.js                  # Gemini API proxy
		src/                         # Alternate modular backend structure
	frontend/
		src/
			pages/
				Dashboard.jsx            # Live dashboard
				AIAssistant.jsx          # Gemini-based advice and chatbot
				Predictions.jsx          # LSTM forecasting page
			services/
				api.js                   # Backend API calls
				firebase.js              # Firebase Web SDK helpers
				gemini.js                # Gemini call wrapper
```

---

## Important modules and what they do

### IoT sender

File: `smart-agri/iot_sender.py`

- Generates or reads sensor values
- Sends JSON payloads to the backend every few seconds
- Useful for demo mode when hardware is not available

### Backend sensor API

File: `smart-agri/backend/routes/sensor.js`

- `POST /api/sensor-data` receives readings
- Stores them in Firebase Firestore when configured
- Falls back to in-memory demo storage when cloud config is unavailable
- `GET /api/sensor-data` returns the latest readings/history

### Firebase cloud layer

Files:

- `smart-agri/backend/firebase.js`
- `smart-agri/frontend/src/services/firebase.js`

Purpose:

- Backend uses Firebase Admin SDK to write/read cloud telemetry
- Frontend uses Firebase Web SDK for direct cloud reads

### Gemini AI layer

Files:

- `smart-agri/backend/routes/gemini.js`
- `smart-agri/frontend/src/services/gemini.js`
- `smart-agri/frontend/src/pages/AIAssistant.jsx`

Purpose:

- Uses Gemini to produce agricultural guidance
- Backend proxy keeps the key private
- Frontend can fall back to direct call if needed in development

### Deep learning forecasting

File: `smart-agri/frontend/src/pages/Predictions.jsx`

Purpose:

- Uses TensorFlow.js LSTM
- Trains on historical sensor readings
- Predicts the next set of temperature, humidity, and moisture values
- Displays forecast charts and smart alerts

### Rule-based crop recommendation

File: `smart-agri/backend/src/models/cropPredict.js`

Purpose:

- Provides a lightweight threshold-based crop suggestion engine
- Useful as a fallback or baseline model
- Not deep learning; it is rule-driven logic

---

## Setup instructions

### 1) Clone and install dependencies

Install backend dependencies:

```bash
cd smart-agri/backend
npm install
```

Install frontend dependencies:

```bash
cd smart-agri/frontend
npm install
```

### 2) Configure environment variables

#### Backend `.env`

Create `smart-agri/backend/.env` with values such as:

```dotenv
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### Frontend `.env`

Create `smart-agri/frontend/.env` with values such as:

```dotenv
VITE_BACKEND_URL=http://localhost:5001
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

> Tip: For production, it is better to keep the Gemini key only in the backend.

### 3) Start the backend

```bash
cd smart-agri/backend
npm run dev
```

### 4) Start the frontend

```bash
cd smart-agri/frontend
npm run dev
```

### 5) Optional: stream sensor data

Use either the real or simulated Python sender:

- `python smart-agri/main.py` for hardware-linked data flow
- `python smart-agri/iot_sender.py` for simulated testing

---

## API overview

### Sensor routes

- `POST /api/sensor-data`
- `GET /api/sensor-data`

### AI routes

- `POST /api/gemini`

### Prediction routes

- `POST /api/predict`

---

## Deep learning explanation

The deep learning part of the project is the **time-series prediction system** in `frontend/src/pages/Predictions.jsx`.

### What it does

- Collects sensor history from Firebase or backend API
- Normalizes the readings
- Builds training sequences of past sensor windows
- Trains an LSTM network
- Predicts future sensor values recursively

### Why LSTM

LSTM is suitable because sensor data is sequential and time-dependent. It learns patterns from past readings and uses those patterns to predict future environmental conditions.

### Output

- Future temperature forecast
- Future humidity forecast
- Future soil moisture forecast
- Smart alerts for dryness, heat stress, and disease risk conditions

---

## Cloud computing explanation

Cloud computing is used through **Firebase Firestore**.

### What happens in the cloud

- Sensor values are saved to a remote Firestore collection
- Dashboard reads historical data from the cloud
- AI and prediction pages use that cloud-stored telemetry as their data source

### Why it matters

- Centralized data storage
- Real-time access from anywhere
- Easy sharing and monitoring
- Demo and production flexibility

---

## Scrum / software engineering planning view

If you need to explain this from a software engineering angle, the project can be described like this:

### Product backlog

- Live sensor ingestion
- Cloud persistence
- AI assistant
- Crop prediction
- Forecasting and alerts
- Responsive dashboard UI

### Sprint-style breakdown

#### Sprint 1: Infrastructure and ingestion

- Setup backend, frontend, and Python sender
- Connect sensor data to backend API

#### Sprint 2: Cloud storage

- Integrate Firebase Firestore
- Store and retrieve readings from the cloud

#### Sprint 3: UI dashboard

- Build live dashboard cards
- Add charts and navigation

#### Sprint 4: AI features

- Add Gemini-based recommendations
- Implement chatbot and advisory sections

#### Sprint 5: Deep learning forecasting

- Add TensorFlow.js model
- Train and test the LSTM forecasting module

#### Sprint 6: Refinement and demo readiness

- Add alerts
- Add fallback logic
- Improve UX and stability

### Roles in the project

- IoT/data ingestion
- Cloud backend
- AI advisory
- Deep learning forecasting
- Frontend visualization

This helps you explain the project as an engineering workflow rather than just a code dump.

---

## Talking points for viva

Use these lines if the teacher asks for a summary:

> “Our project is a smart agriculture system that combines IoT hardware, Firebase cloud storage, Gemini AI, and TensorFlow.js deep learning. The IoT layer collects sensor values, the cloud layer stores and serves the data, the AI layer gives farming advice, and the deep learning module predicts future sensor trends.”

> “The deep learning part is implemented in the Predictions page using an LSTM model trained on historical temperature, humidity, and moisture readings.”

> “The cloud part is implemented using Firebase Firestore through the backend Firebase Admin SDK and the frontend Firebase Web SDK.”

---

## Future improvements

- Add proper user authentication and roles
- Deploy backend and frontend to production
- Add offline sync for sensor data
- Replace demo rules with a trained crop classification model
- Add notification delivery through push or WhatsApp-like integrations
- Add analytics for season-wise comparisons

---

## Notes

- The frontend can work with direct Gemini access, but backend proxy is the safer approach.
- The crop suggestion module in `cropPredict.js` is a rule-based baseline, not a neural network.
- Keep secret keys in environment files and never commit them to source control.

