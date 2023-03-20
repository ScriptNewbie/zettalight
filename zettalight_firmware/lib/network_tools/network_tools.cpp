#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <HTTPUpdateServer.h>
#include <InfluxDbClient.h>
#include <InfluxDbCloud.h>
#include <ArduinoJson.h>

#include "network_tools.h"
#include "FS_tools.h"
#include "database_tools.h"
#include "sms_tools.h"
#include "web.h"
#include "payload_tools.h"


WebServer http_conf_server(80);
WebServer http_server(5000);

HTTPUpdateServer httpUpdater;

String wifi_ssid = "";
String wifi_psk = "";
String ap_psk ="";
bool ap_enabled = true;
const char* host = "zettalight-device";

unsigned long last_reconnect = 0;


void handle_payload_page(){
  if (http_server.method() == HTTP_OPTIONS) {
    http_server.sendHeader("Access-Control-Allow-Origin", "*");
    http_server.sendHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    http_server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    http_server.send(200);
  } else {
    http_server.sendHeader("Access-Control-Allow-Origin", "*");
    http_server.sendHeader("Content-Type", "text/plain");

    if (http_server.hasHeader("Authorization")) {
      if (http_server.header("Authorization").substring(6) == influx_token){
        http_server.send(200, "text/plain", get_payload().c_str());
        update_payload();
      }
      else
        http_server.send(403, "text/plain", "Forbidden");
    } else {
      http_server.send(401, "text/plain", "Unauthorized");
    }
  }
}

String generate_config_payload(){
return "{\"wifiSsid\":\"" + wifi_ssid + "\",\"wifiPsk\":\"" + wifi_psk + "\",\"apPsk\":\"" + ap_psk + "\", \"influxUrl\":\"" + influx_url + "\", \"influxOrg\":\"" + influx_org + "\",\"influxBucket\":\"" + influx_bucket + "\",\"token\":\"" + influx_token + "\", \"phone\":\""+ phone +"\"}";
}
void handle_get_config() {
  http_conf_server.send(200, "text/plain", generate_config_payload().c_str());
}

void handle_change_config(){

  if(http_conf_server.hasArg("plain")){
    StaticJsonDocument<1024> data;
    DeserializationError error = deserializeJson(data, http_conf_server.arg("plain"));

    if (data.containsKey("wifiSsid")) {
      wifi_ssid = data["wifiSsid"].as<String>();
      write_file("/wifi_ssid.txt", wifi_ssid);
    }

    if (data.containsKey("wifiPsk")) {
      wifi_psk = data["wifiPsk"].as<String>();
      write_file("/wifi_psk.txt", wifi_psk);
    }

    if (data.containsKey("apPsk")) {
      ap_psk = data["apPsk"].as<String>();
      write_file("/ap_psk.txt", ap_psk);
    }

    if (data.containsKey("influxUrl")) {
      influx_url = data["influxUrl"].as<String>();
      write_file("/influx_url.txt", influx_url);
    }

    if (data.containsKey("influxOrg")) {
      influx_org = data["influxOrg"].as<String>();
      write_file("/influx_org.txt", influx_org);
    }

    if (data.containsKey("influxBucket")) {
      influx_bucket = data["influxBucket"].as<String>();
      write_file("/influx_bucket.txt", influx_bucket);
    }

    if (data.containsKey("token")) {
      influx_token = data["token"].as<String>();
      write_file("/influx_token.txt", influx_token);
    }

    if (data.containsKey("phone")) {
      phone = data["phone"].as<String>();
      write_file("/phone.txt", phone);
    }
  }

  
  http_conf_server.send(200, "text/plain", generate_config_payload().c_str());

  WiFi.disconnect(true);
  WiFi.begin(wifi_ssid.c_str(), wifi_psk.c_str());
  reinitiate_influx();
}

void handle_config_homepage() {
  http_conf_server.send(200, "text/html", html_markup.c_str());
}

void network_setup(){
  ap_psk = read_file("/ap_psk.txt");
  WiFi.softAP(host, ap_psk.c_str());

  httpUpdater.setup(&http_conf_server);
  http_conf_server.on("/config", HTTP_POST, handle_change_config);
  http_conf_server.on("/", HTTP_GET, handle_config_homepage);
  http_conf_server.on("/config", HTTP_GET, handle_get_config);

  http_server.on("/", HTTP_GET, handle_payload_page);
  http_server.on("/", HTTP_OPTIONS, handle_payload_page);

  http_conf_server.begin();
  http_server.begin();

  if (MDNS.begin(host)) {
    Serial.println("mDNS responder started");
  }
  MDNS.addService("http", "tcp", 80);


  wifi_ssid = read_file("/wifi_ssid.txt");
  wifi_psk = read_file("/wifi_psk.txt");
  initiate_influx_vars();

  WiFi.begin(wifi_ssid.c_str(), wifi_psk.c_str());
  last_reconnect = millis();
}

void handle_network(){
  http_conf_server.handleClient();
  http_server.handleClient();
  if(WiFi.status() == WL_CONNECTED){
    if(ap_enabled) {
      ap_enabled = WiFi.softAPdisconnect(1);
      Serial.print("AP disabled!");
      if(!influx_initiated)
      {
        initiate_influx();
      }
    }
  } else {
    if(last_reconnect + 10000 < millis()){
      WiFi.disconnect(true);
      WiFi.begin(wifi_ssid.c_str(), wifi_psk.c_str());
      last_reconnect = millis();
    }
    if(!ap_enabled) {
      ap_enabled = WiFi.softAP(host, ap_psk.c_str());
      Serial.print("AP enabled!");
    }
  }
}