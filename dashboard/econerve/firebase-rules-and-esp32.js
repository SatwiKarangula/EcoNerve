// ============================================================
// FIREBASE REALTIME DATABASE SECURITY RULES
// Copy this into Firebase Console → Realtime Database → Rules
// ============================================================

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


// ============================================================
// ESP32 ARDUINO FIRMWARE
// Upload to ESP32 using Arduino IDE
// Required libraries:
//   - WiFi.h (built-in)
//   - HTTPClient.h (built-in)
//   - ArduinoJson (Library Manager)
//   - FirebaseESP32 (Library Manager) — OR use REST API below
// ============================================================

/*
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── Config ───────────────────────────────────────────────────
const char* SSID     = "YOUR_WIFI_SSID";
const char* PASSWORD = "YOUR_WIFI_PASSWORD";

// Firebase project URL (no trailing slash)
const char* FIREBASE_URL  = "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com";
// Firebase Database secret (legacy) or ID token for auth
const char* FIREBASE_AUTH = "YOUR_DATABASE_SECRET_OR_ID_TOKEN";

// ── Pins ─────────────────────────────────────────────────────
#define MQ135_PIN  34    // Analog pin for MQ-135 (AQI)
#define TDS_PIN    35    // Analog pin for SEN0244 (TDS)

// ── Constants ────────────────────────────────────────────────
#define VREF        3.3   // ESP32 ADC reference voltage
#define ADC_RES     4096  // 12-bit ADC
#define TDS_FACTOR  0.5   // Conversion factor for TDS sensor

// ── AQI Calculation (simplified from MQ-135 raw ADC) ────────
float calculateAQI(int raw) {
  float voltage = (raw / (float)ADC_RES) * VREF;
  // Simplified linear mapping – calibrate for your environment
  float ppm = (voltage - 0.1) * 200.0;  
  if (ppm < 0) ppm = 0;
  // Map to AQI scale (simplified)
  if (ppm < 50)  return ppm * 1.0;
  if (ppm < 100) return 50  + (ppm - 50)  * 1.0;
  if (ppm < 200) return 100 + (ppm - 100) * 0.5;
  return 150 + (ppm - 200) * 0.25;
}

// ── TDS Calculation (SEN0244) ────────────────────────────────
float calculateTDS(int raw) {
  float voltage       = (raw / (float)ADC_RES) * VREF;
  float tdsValue      = (133.42 * pow(voltage, 3)
                        - 255.86 * pow(voltage, 2)
                        + 857.39 * voltage) * TDS_FACTOR;
  return max(0.0f, tdsValue);
}

// ── Send data to Firebase ─────────────────────────────────────
void sendToFirebase(float aqi, float tds, float temperature) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(FIREBASE_URL) + "/sensorData.json?auth=" + FIREBASE_AUTH;

  StaticJsonDocument<200> doc;
  doc["aqi"]         = round(aqi * 10.0) / 10.0;
  doc["tds"]         = round(tds * 10.0) / 10.0;
  doc["temperature"] = round(temperature * 10.0) / 10.0;
  doc["timestamp"]   = millis();  // Replace with NTP time for production

  String payload;
  serializeJson(doc, payload);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(payload);
  
  if (code == 200) {
    Serial.println("✓ Data sent to Firebase");
  } else {
    Serial.println("✗ Firebase error: " + String(code));
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(SSID, PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\n✓ WiFi connected: " + WiFi.localIP().toString());
}

void loop() {
  int mqRaw  = analogRead(MQ135_PIN);
  int tdsRaw = analogRead(TDS_PIN);

  float aqi  = calculateAQI(mqRaw);
  float tds  = calculateTDS(tdsRaw);
  float temp = 28.5;  // Replace with DHT22/DS18B20 reading

  Serial.printf("AQI: %.1f | TDS: %.1f ppm | Temp: %.1f°C\n", aqi, tds, temp);
  sendToFirebase(aqi, tds, temp);

  delay(3000);  // Send every 3 seconds
}
*/
