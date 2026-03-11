#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// ---------------- WIFI ----------------
#define WIFI_SSID "AIML60"
#define WIFI_PASSWORD "12345678910"

// ---------------- FIREBASE ----------------
#define API_KEY "AIzaSyBtRZpkJXddd55o89GT_0_Y7BgTPsvIexg"
#define DATABASE_URL "https://delhi-aqi-6ed7a-default-rtdb.firebaseio.com/"

// ---------------- SENSOR PINS ----------------
#define MQ135_PIN 34
#define TDS_PIN 35

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// -------- AQI LEVEL CLASSIFICATION --------
String getAQILevel(int aqi) {
  if (aqi <= 50) return "Good";
  else if (aqi <= 100) return "Moderate";
  else if (aqi <= 200) return "Unhealthy";
  else if (aqi <= 300) return "Very Unhealthy";
  else return "Hazardous";
}

// -------- IMPROVED PIECEWISE AQI SCALING --------
int calculateAQI(int raw) {

  if (raw <= 1000)
    return map(raw, 800, 1000, 0, 50);

  else if (raw <= 1500)
    return map(raw, 1000, 1500, 51, 100);

  else if (raw <= 2500)
    return map(raw, 1500, 2500, 101, 200);

  else if (raw <= 3200)
    return map(raw, 2500, 3200, 201, 300);

  else
    return map(raw, 3200, 4095, 301, 500);
}

void setup() {
  Serial.begin(115200);
  delay(2000);

  // WiFi Connection
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");

  // Firebase Setup
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase SignUp OK");
  } else {
    Serial.printf("SignUp Error: %s\n", config.signer.signupError.message.c_str());
  }
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}


void loop() {

  // --------- READ MQ135 ----------
  int airRaw = analogRead(MQ135_PIN);
  int aqi = calculateAQI(airRaw);
  String aqiLevel = getAQILevel(aqi);

  // --------- READ TDS ----------
  int tdsRaw = analogRead(TDS_PIN);
  float voltage = tdsRaw * (3.3 / 4095.0);

  float tdsValue = (133.42 * pow(voltage, 3)
                   - 255.86 * pow(voltage, 2)
                   + 857.39 * voltage) * 0.5;

  if (tdsValue < 0) tdsValue = 0;

  // --------- SERIAL OUTPUT ----------
  Serial.println("----- ENVIRONMENT DATA -----");
  Serial.print("Raw Air: "); Serial.println(airRaw);
  Serial.print("Estimated AQI: "); Serial.print(aqi);
  Serial.print(" ("); Serial.print(aqiLevel); Serial.println(")");
  Serial.print("TDS: "); Serial.print(tdsValue); Serial.println(" ppm");
  Serial.println("-----------------------------\n");

  // --------- FIREBASE UPDATE ----------
  Firebase.RTDB.setInt(&fbdo, "/Environment/RawAir", airRaw);
  Firebase.RTDB.setInt(&fbdo, "/Environment/AQI", aqi);
  Firebase.RTDB.setString(&fbdo, "/Environment/AQI_Level", aqiLevel);
  Firebase.RTDB.setFloat(&fbdo, "/Environment/TDS", tdsValue);

  if (fbdo.httpCode() == 200)
    Serial.println("Data Sent to Firebase ✓\n");
  else {
    Serial.print("Firebase Error: ");
    Serial.println(fbdo.errorReason());
  }

  delay(5000);
}






























/*#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>

// ---------------- WIFI ----------------
#define WIFI_SSID "AirFiber-chaitu"
#define WIFI_PASSWORD "W!r3lessW@ves"

// ---------------- FIREBASE ----------------
#define API_KEY "AIzaSyBtRZpkJXddd55o89GT_0_Y7BgTPsvIexg"
#define DATABASE_URL "https://delhi-aqi-6ed7a-default-rtdb.firebaseio.com"

// ---------------- SENSOR PINS ----------------
#define MQ135_PIN 34
#define DHTPIN 4
#define DHTTYPE DHT11
#define TDS_PIN 35

// ---------------- OBJECTS ----------------
DHT dht(DHTPIN, DHTTYPE);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ---------------- AQI LEVEL FUNCTION ----------------
String getAQILevel(int aqi) {
  if (aqi <= 50) return "Good";
  else if (aqi <= 100) return "Moderate";
  else if (aqi <= 200) return "Unhealthy";
  else if (aqi <= 300) return "Very Unhealthy";
  else return "Hazardous";
}

// ---------------- IMPROVED PIECEWISE AQI SCALING ----------------
int calculateAQI(int raw) {

  if (raw <= 1000)
    return map(raw, 800, 1000, 0, 50);

  else if (raw <= 1500)
    return map(raw, 1000, 1500, 51, 100);

  else if (raw <= 2500)
    return map(raw, 1500, 2500, 101, 200);

  else if (raw <= 3200)
    return map(raw, 2500, 3200, 201, 300);

  else
    return map(raw, 3200, 4095, 301, 500);
}

void setup() {
  Serial.begin(115200);
  delay(2000);

  dht.begin();

  // WiFi Connect
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");

  // Firebase Setup
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {

  // --------- READ MQ135 ----------
  int airRaw = analogRead(MQ135_PIN);
  int aqi = calculateAQI(airRaw);
  String aqiLevel = getAQILevel(aqi);

  // --------- READ DHT11 ----------
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT Error!");
    return;
  }

  // --------- READ TDS ----------
  int tdsRaw = analogRead(TDS_PIN);
  float voltage = tdsRaw * (3.3 / 4095.0);

  float tdsValue = (133.42 * pow(voltage, 3)
                   - 255.86 * pow(voltage, 2)
                   + 857.39 * voltage) * 0.5;

  if (tdsValue < 0) tdsValue = 0;

  // --------- PRINT TO SERIAL ----------
  Serial.println("----- ENVIRONMENT DATA -----");
  Serial.print("Raw Air: "); Serial.println(airRaw);
  Serial.print("Estimated AQI: "); Serial.print(aqi);
  Serial.print(" ("); Serial.print(aqiLevel); Serial.println(")");
  Serial.print("Temperature: "); Serial.print(temperature); Serial.println(" °C");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println(" %");
  Serial.print("TDS: "); Serial.print(tdsValue); Serial.println(" ppm");
  Serial.println("-----------------------------\n");

  // --------- SEND TO FIREBASE ----------
  Firebase.RTDB.setInt(&fbdo, "/Environment/RawAir", airRaw);
  Firebase.RTDB.setInt(&fbdo, "/Environment/AQI", aqi);
  Firebase.RTDB.setString(&fbdo, "/Environment/AQI_Level", aqiLevel);
  Firebase.RTDB.setFloat(&fbdo, "/Environment/Temperature", temperature);
  Firebase.RTDB.setFloat(&fbdo, "/Environment/Humidity", humidity);
  Firebase.RTDB.setFloat(&fbdo, "/Environment/TDS", tdsValue);

  if (fbdo.httpCode() == 200)
    Serial.println("Data Sent to Firebase ✓\n");
  else {
    Serial.print("Firebase Error: ");
    Serial.println(fbdo.errorReason());
  }

  delay(5000);
}*/