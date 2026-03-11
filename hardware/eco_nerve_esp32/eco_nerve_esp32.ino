#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// WiFi credentials
#define WIFI_SSID "AirFiber-chaitu"
#define WIFI_PASSWORD "W!r3lessW@ves"

// Firebase credentials
#define API_KEY "AIzaSyBtRZpkJXddd55o89GT_0_Y7BgTPsvIexg"
#define DATABASE_URL "https://delhi-aqi-6ed7a-default-rtdb.firebaseio.com/"

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

#define MQ135_PIN 34
#define TDS_PIN 35

void setup() {
  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");

  // Firebase configuration
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Required for token generation
  config.token_status_callback = NULL;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // IMPORTANT: Sign up anonymously
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase SignUp OK");
  } else {
    Serial.printf("SignUp Error: %s\n", config.signer.signupError.message.c_str());
  }
}

void loop() {

  int airValue = analogRead(MQ135_PIN);

  int tdsRaw = analogRead(TDS_PIN);
  float voltage = tdsRaw * 3.3 / 4095.0;

  float tdsValue = (133.42 * voltage * voltage * voltage
                    - 255.86 * voltage * voltage
                    + 857.39 * voltage) * 0.5;

  Serial.println("-----");
  Serial.print("Air: ");
  Serial.println(airValue);

  Serial.print("TDS: ");
  Serial.println(tdsValue);

  if (Firebase.ready()) {

    if (Firebase.RTDB.setInt(&fbdo, "/live_logs/air_quality", airValue))
      Serial.println("Air sent");
    else
      Serial.println(fbdo.errorReason());

    if (Firebase.RTDB.setFloat(&fbdo, "/live_logs/tds_ppm", tdsValue))
      Serial.println("TDS sent");
    else
      Serial.println(fbdo.errorReason());
  }

  delay(7000);
}