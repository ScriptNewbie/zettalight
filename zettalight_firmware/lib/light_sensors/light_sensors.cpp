#include <DFRobot_I2C_Multiplexer.h>
#include <Adafruit_Sensor.h>
#include "Adafruit_TSL2591.h"

#include "light_sensors.h"

DFRobot_I2C_Multiplexer I2CMultiplexer(&Wire, 0x70);
Adafruit_TSL2591 tsl = Adafruit_TSL2591(2591); 

unsigned long last_measurement = 0;
light_sensors_values light;

void configure_sensor()
{
  tsl.setGain(TSL2591_GAIN_LOW);    // 1x gain (bright light)
  tsl.setTiming(TSL2591_INTEGRATIONTIME_100MS);
}

float measure_lux(uint8_t sensor)
{
  uint8_t retries = 0;
  float x;
  I2CMultiplexer.selectPort(sensor);
  do {
    ++retries;
    uint32_t lum = tsl.getFullLuminosity();
    uint16_t ir, full;
    ir = lum >> 16;
    full = lum & 0xFFFF;
    x = tsl.calculateLux(full, ir);
    if(x == -1) x = 88000; //Przesycenie
  } while (retries < 4 && x > 88000); //Po za zakresem pomiarowym - potencjalnie błąd, spróbuj ponownie
  return isnan(x) ? 0 : x; //Natężenie = 0
}

void measure(){
  light.sensor0 = measure_lux(0);
  light.sensor1 = measure_lux(1);
  light.sensor2 = measure_lux(2);
  last_measurement = millis();
}

void initiate_light_sensors()
{
    I2CMultiplexer.begin();
    I2CMultiplexer.selectPort(0);
    configure_sensor();
    I2CMultiplexer.selectPort(1);
    configure_sensor();
    I2CMultiplexer.selectPort(2);
    configure_sensor();
    measure();
}

light_sensors_values get_light(bool force){
  if(last_measurement + 5000 < millis() || force)
  {
    measure();
  }
  return light;
};