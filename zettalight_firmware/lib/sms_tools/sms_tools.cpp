#include "sms_tools.h"
#include "FS_tools.h"
#include "payload_tools.h"

String phone;
bool initiated = false;
void delete_messages();

struct Response {
  bool success;
  String message;
};

void send_command(String command){
  Serial2.print(command.c_str());
}

Response read_response(unsigned int wait_time){
  unsigned long start = millis();
  String response = Serial2.readString();
  bool timeout = false;
  bool success = response.indexOf("OK") != -1 || response[response.length() - 2] == '>';
  bool error = response.indexOf("ERR") != -1;

  while(!success && !error && !timeout){
    timeout = millis() > start + wait_time;
    success = response.indexOf("OK") != -1 || response[response.length() - 2] == '>';
    error = response.indexOf("ERR") != -1;
    response += Serial2.readString();
  }

  return {success, response};
}

 void exec(){
    Serial2.write(26);
  }

bool is_valid_number(const String phoneNumber) {
  for (int i = 1; i < phoneNumber.length(); i++) {
    if (!isDigit(phoneNumber[i])) {
      return false;
    }
  }
  return phoneNumber.startsWith("+48") && phoneNumber.length() == 12;
}

void initiate_sms(){
    phone = read_file("/phone.txt");
    Serial2.begin(4800);
    bool success = false;
    int retry = 0;
    while(!success && retry < 3){ //Autobauding
      ++retry;
      send_command("AT\r");
      String response = read_response(1000).message;
      if(response.indexOf("OK") != -1){
        Serial.print("Setting baudrate!\n");
        send_command("AT+IPR=4800\r");
        Response result = read_response(10000);
        Serial.print(result.success ? "Baud set!\n" : "Error with setting baud!\n");
        if(!result.success) return;
        Serial.print("Setting text mode!\n");
        send_command("AT+CMGF=1\r");
        result = read_response(10000);
        Serial.print(result.success ? "Text mode set!\n" : "Error with setting text mode!\n");
        if(!result.success) return;
        initiated = true;
        success = true;
      }
    }
    delete_messages();
}

void delete_messages(){
    if(!initiated) return initiate_sms();
    Serial.print("Deleting messages!\n");
    send_command("AT+CMGDA=\"DEL ALL\"\n\r");
    Response result = read_response(30000);
    Serial.print(result.success ? "Messages deleted!\n" : "Error while deleting messages!\n");
}

void send_text(String number, String message){
  if(!initiated) return initiate_sms();
  if(is_valid_number(number)){
    Serial.print("Sending SMS!\n");
    send_command("AT+CMGS=\"" + number + "\"\r");
    Serial.print(read_response(5000).success ? "Number set!\n" : "Error while setting number!\n");
    send_command(message + '\r');
    Serial.print(read_response(5000).success ? "Message set!\n" : "Error while setting message!\n");
    exec();
    Response result = read_response(60000);
    Serial.print(result.success ? "Message sent!\n" : "Error while sending message!\n");
  } else Serial.print("Invalid number!\n");
}


void check_sms(){
  if(!initiated) return initiate_sms();
  send_command("AT\r");
  if(!read_response(1000).success) return;
  send_command("AT+CMGL=\"ALL\"\r");
  String sms = read_response(30000).message;
  int is_message = sms.indexOf("CMGL:");
  if(is_message != -1) {
    Serial.print("SMS received!\n");
    sms = sms.substring(is_message);
    int header_end = sms.indexOf("\n");
    if(header_end != -1) {
      String header = sms.substring(0, header_end);
      sms = sms.substring(header_end + 1);
      int sms_end = sms.indexOf("\n");
      if(sms_end != -1) {
        sms = sms.substring(0, sms_end - 1);
        if(header.indexOf(phone) != -1) {
          if(sms == "get") send_sms();
          else send_text(phone, "Command " + sms + " does not exist!");
        } else Serial.print("Not authorized!\n");
      }
    }
    delete_messages();
  }
}

void send_sms(){
  String payload = get_payload();
  send_text(phone, payload);
  /*
  int i = 0;
  String current_sms = "";
  String current_line= "";
  int last_line_begin = 0;
  while(i < payload.length())
  { 
    if(payload[i] != '\n'){
      if (payload[i] != ' ') current_line = current_line + payload[i];
    } else {
      current_line = current_line + '\n';
      String possible = current_sms + current_line;
      current_line = "";
      if(possible.length() < 160){
        last_line_begin = i;
        current_sms = possible;
      } else {
        i = last_line_begin;
        send_text(phone, current_sms.substring(0, current_sms.length() - 1));
        current_sms = "";
      }
    }
    ++i;
  }
send_text(phone, current_sms.substring(0, current_sms.length() - 1));
*/
}