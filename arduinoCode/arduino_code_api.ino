/***************************************************
  This is a library for the Si1145 UV/IR/Visible Light Sensor

  Designed specifically to work with the Si1145 sensor in the
  adafruit shop
  ----> https://www.adafruit.com/products/1777

  These sensors use I2C to communicate, 2 pins are required to  
  interface
  Adafruit invests time and resources providing this open source code,
  please support Adafruit and open-source hardware by purchasing
  products from Adafruit!

  Written by Limor Fried/Ladyada for Adafruit Industries.  
  BSD license, all text above must be included in any redistribution
 ****************************************************/

// Library Inclusions
#include <SPI.h>              // Wireless comms between sensor(s) and Arduino Nano IoT
#include <WiFiNINA.h>         // Used to connect Nano IoT to network
#include <ArduinoJson.h>      // Used for HTTP Request
#include "arduino_secrets.h"  // Used to store private network info
#include <Wire.h>
#include "Adafruit_SI1145.h"

Adafruit_SI1145 uv = Adafruit_SI1145();

///////please enter your sensitive data in the Secret tab/arduino_secrets.h
char ssid[] = SECRET_SSID;    // your network SSID (name)
char pass[] = SECRET_PASS;    // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0;             // your network key index number (needed only for WEP)
int status = WL_IDLE_STATUS;

// Initialize the Wifi client library
WiFiClient client;

// server address:
//char server[] = "jsonplaceholder.typicode.com"; // for public domain server
//IPAddress server(192,168,241,84); // for localhost server (server IP address can be found with ipconfig or ifconfig)
IPAddress server(10,0,0,17);

unsigned long lastConnectionTime = 0;
const unsigned long postingInterval = 10L * 50L; // delay between updates, in milliseconds (10L * 50L is around 1 second between requests)

void setup() {
  Serial.begin(9600);
  delay(5000);
  Serial.println("Adafruit SI1145 test");
 
  if (! uv.begin()) {
    Serial.println("Didn't find Si1145");
    while (1);
  }

  Serial.println("OK!");

  // attempt to connect to Wifi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid); // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    status = WiFi.begin(ssid, pass);
    delay(1000); // wait 1 second for connection
  }

  printWifiStatus(); // you're connected now, so print out the status
}

void loop() {

  StaticJsonDocument<200> doc;

  // if there's incoming data from the net connection, append each character to a variable
  String response = "";
  while (client.available()) {
    char c = client.read();
    response += (c);
  }

  // print out non-empty responses to serial monitor
  if (response != "") {
    Serial.println(response);
  } 
 
  Serial.println("===================");
  Serial.print("Vis: "); Serial.println(uv.readVisible());
  Serial.print("IR: "); Serial.println(uv.readIR());
 
  // Uncomment if you have an IR LED attached to LED pin!
  //Serial.print("Prox: "); Serial.println(uv.readProx());

  float UVindex = uv.readUV();
  // the index is multiplied by 100 so to get the
  // integer index, divide by 100!
  UVindex /= 100.0;  
  Serial.print("UV: ");  Serial.println(UVindex);

  // close any connection before send a new request to free the socket
  client.stop();

  // if there's a successful connection:
  if (client.connect(server, 5000)) {
    Serial.println("connecting...");

    // send the HTTP GET request with the distance as a parameter:
    String request = "GET /?uv=" + String(UVindex) + "&vis=" + String(uv.readVisible()) + "&ir=" + String(uv.readIR())+ " HTTP/1.1";
    client.println(request);

    // set the host as server IP address
    client.println("Host: 10.0.0.17");

    // other request properties
    client.println("User-Agent: ArduinoWiFi/1.1");
    client.println("Connection: close");
    client.println();

    // note the time that the connection was made:
    lastConnectionTime = millis();
  } else {
    Serial.println("connection failed"); // couldn't makek a connection
  }
  
  delay(1000);
}

// connect to wifi network and display status
void printWifiStatus(){
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  IPAddress ip = WiFi.localIP(); // your board's IP on the network
  Serial.print("IP Address: ");
  Serial.println(ip);
  long rssi = WiFi.RSSI(); // received signal strength
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  Serial.println("OK!");
}
