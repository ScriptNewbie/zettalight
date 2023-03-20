#include "FS.h"
#include "SPIFFS.h"

void fs_setup(){
  if(!SPIFFS.begin(true)){
    Serial.println("An error occurred while mounting SPIFFS");
    return;
  }
}

void fs_format(){
  SPIFFS.format();
}

String read_file(String path){
  String value = "";
  File file = SPIFFS.open(path.c_str(), "r");
  if(file){
    while(file.available()){
      value += char(file.read());
    }
  }

  file.close();
  return value;
}

void write_file(String path, String message){
  File file = SPIFFS.open(path.c_str(), "w+");
  if(!file){
    Serial.println("Failed to open file for writing");
    return;
  }


  if(file.print(message.c_str())){
    Serial.println("File written");
  } else {
    Serial.println("Write failed");
  }

  file.close();
}
