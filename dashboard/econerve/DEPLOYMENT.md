# 🌿 EcoNerve – Deployment & Setup Guide

## 1. Firebase Project Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Create a new project** → name it `econerve`
3. Enable **Realtime Database** → Start in **locked mode**
4. Enable **Authentication** → Sign-in method → Email/Password → Enable
5. Click the `</>` icon to **add a web app** → copy the config object

---

## 2. Connect Firebase to EcoNerve

Open `assets/js/firebase-config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "your-actual-api-key",
  authDomain:        "econerve.firebaseapp.com",
  databaseURL:       "https://econerve-default-rtdb.firebaseio.com",
  projectId:         "econerve",
  storageBucket:     "econerve.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef"
};
```

---

## 3. Apply Security Rules

In Firebase Console → **Realtime Database → Rules**, paste:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read":  "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "sensorData": {
      ".read":  "auth != null",
      ".write": "auth != null"
    }
  }
}
```

Click **Publish**.

---

## 4. ESP32 Firmware

1. Install [Arduino IDE](https://arduino.cc)
2. Add ESP32 board URL: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Install libraries: **ArduinoJson**, **Firebase ESP32 Client**
4. Copy the firmware from `firebase-rules-and-esp32.js` (the commented section)
5. Replace WiFi credentials and Firebase URL
6. Flash to ESP32 via USB

### Wiring
| Sensor | ESP32 Pin |
|--------|-----------|
| MQ-135 AOUT | GPIO 34 |
| SEN0244 A    | GPIO 35 |
| Both VCC     | 3.3V    |
| Both GND     | GND     |

---

## 5. Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# From the econerve/ folder
firebase init hosting
# Select your project, set public dir to ".", SPA: No

# Deploy
firebase deploy --only hosting
```

Your app will be live at: `https://econerve.web.app`

---

## 6. Test Locally

```bash
# Serve locally (no install needed)
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080`

---

## 7. Future Expansion

| Feature | Implementation |
|---------|---------------|
| Push notifications | Firebase Cloud Messaging (FCM) |
| Historical export | CSV download from Analytics page |
| Multiple sensor nodes | Add `deviceId` field to sensorData |
| SMS alerts | Twilio + Firebase Cloud Functions |
| ML prediction | TensorFlow.js in-browser model |
| Map view | Google Maps API with sensor pin markers |
| PWA / offline | Service Worker + manifest.json |
| Admin panel | Role-based access via custom claims |
| CO₂ / particulates | Add MQ-7, PMS5003 sensor modules |
| Humidity | DHT22 module on ESP32 |

---

## Folder Structure

```
econerve/
├── index.html              ← Landing page
├── login.html              ← Authentication
├── signup.html             ← Registration
├── dashboard.html          ← Live IoT dashboard ★
├── analytics.html          ← Historical analytics
├── profile.html            ← User profile
├── settings.html           ← Settings & thresholds
├── firebase.json           ← Hosting config
├── firebase-rules-and-esp32.js  ← DB rules + ESP32 code
└── assets/
    ├── css/
    │   └── style.css       ← Global dark eco theme
    └── js/
        ├── firebase-config.js   ← Firebase init
        ├── auth.js              ← Auth module
        ├── ai-prediction.js     ← AI forecast engine
        └── utils.js             ← Particles, gauge, helpers
```
