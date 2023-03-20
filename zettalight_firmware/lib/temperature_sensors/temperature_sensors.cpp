#include <OneWire.h>
#include <DallasTemperature.h>
#include "temperature_sensors.h"
#include <Arduino.h>

OneWire oneWire(19);
DallasTemperature sensors(&oneWire);

unsigned long last_measurements;
temperature_sensors_values temperature;


float read_temperature(uint8_t sensor){
    uint8_t retries = 0;
    float value;
    do {
        ++retries;
        value = sensors.getTempCByIndex(sensor);
    } while (retries < 4 && value == -127);
    return value;
}

void measure_temperature(){
    sensors.requestTemperatures();
    last_measurements = millis();
    temperature.sensor0 = read_temperature(0);
    temperature.sensor1 = read_temperature(1);
    temperature.sensor2 = read_temperature(2);
};

void initiate_temperature_sensors(){
    sensors.begin();
    measure_temperature();
}

temperature_sensors_values get_temperature(bool force){
    if (last_measurements + 5000 < millis() || force){
        measure_temperature();
    }
    return temperature;
}