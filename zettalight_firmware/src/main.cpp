#include <Arduino.h>
#include <SPI.h>
#include <Ticker.h>
#include <Wire.h>

#include "light_sensors.h"
#include "temperature_sensors.h"
#include "power_measurements.h"
#include "FS_tools.h"
#include "database_tools.h"
#include "sms_tools.h"
#include "network_tools.h"
#include "payload_tools.h"


#define PWM_freq 50
#define PWM1_pin 14
#define PWM2_pin 13
#define PWM1 0
#define PWM2 7
#define PWM_RESOLUTION 20
#define FACTORY_BUTTON !digitalRead(0)

TaskHandle_t mppt_task;

bool pwms_started = false;
int8_t pwm_fill = 50;

const u_int32_t protection_period = (pow(2, PWM_RESOLUTION)/2048);
const u_int32_t max_pwm_value = (int) pow(2, PWM_RESOLUTION)/2 - (protection_period > 1 ? protection_period : 1);
int8_t set_pwms_duty(int8_t percent) 
{
  percent = percent < 100 ? percent : 100;
  percent = percent >   0 ? percent : 1;
  u_int32_t fill = percent * max_pwm_value / 100;
  ledcWrite(PWM1, fill);
  ledcWrite(PWM2, fill);
  return percent;
}

void start_second_pwm(){
  ledcSetup( PWM2, PWM_freq, PWM_RESOLUTION);
  ledcAttachPin(PWM2_pin, PWM2);
  detachInterrupt(digitalPinToInterrupt(PWM1_pin));
  pwms_started = true;
}


void mppt(void * parameter) {
  u_int32_t prev_power;
  u_int8_t direction = 1;
  while(1){
    avg_vals current = measure_avg_vals(36,39);
    if (current.power < prev_power) direction *= -1;
    pwm_fill = set_pwms_duty(pwm_fill + direction);
    prev_power = current.power;
    if (current.voltage_mv == 0) pwm_fill = set_pwms_duty(1);
    if(xSemaphoreTake(data_semaphore, ( TickType_t ) 3)){
      power = current.power / 10;
      voltage_mv = current.voltage_mv;
      current_ma = current.current_ma;
      pwm_duty = pwm_fill;
      xSemaphoreGive(data_semaphore);
    }
  }
}



Ticker database_ticker;
bool database_ticked = true;

Ticker sms_ticker;
bool sms_ticked = false;

void database_task(){
  if(database_ticked && influx_initiated){
    database_ticked = false;
    light_values = get_light(true);
    temperature_values = get_temperature(true);
    if(xSemaphoreTake(data_semaphore, portMAX_DELAY)){
      influx_write(
        power,
        voltage_mv,
        current_ma,
        light_values.sensor0,
        light_values.sensor1,
        light_values.sensor2,
        temperature_values.sensor0,
        temperature_values.sensor1,
        temperature_values.sensor2,
        pwm_duty
        );
      xSemaphoreGive(data_semaphore);
    }
    if(influx_connection_broken) send_sms();
  }
}

void handle_factory_reset(){
  int count = 50;
  while(FACTORY_BUTTON){
    if(!(count % 5) ) {
      String message = "\nHold for " + String(count/5) + " more seconds to factory reset!";
      Serial.print(message.c_str());
      }
    --count;
    if(count == 0) {
      Serial.print("\nFactory reset! Device will reboot!");
      fs_format();
      ESP.restart();
    }
    delay(200);
  }
};

void handle_check_sms(){
  if(sms_ticked){
    sms_ticked = false;
    check_sms();
  }
}

void setup() {
  pinMode(PWM1_pin, OUTPUT);
  pinMode(PWM2_pin, OUTPUT);
  pinMode(FACTORY_BUTTON, INPUT);

  ledcSetup(PWM1, PWM_freq, PWM_RESOLUTION);
  ledcAttachPin(PWM1_pin, PWM1);
  ledcWrite(PWM1, max_pwm_value);

  delay(100);
  attachInterrupt(digitalPinToInterrupt(PWM1_pin), start_second_pwm, FALLING);
  
  Serial.begin(9600);
  Serial.write("Czekam na uruchomienie 2 PWMa");
  while(!pwms_started) { 
    delay(100);
    Serial.write(".");
    }

  pwm_fill = set_pwms_duty(pwm_fill);


  xTaskCreatePinnedToCore(
      mppt, /* Function to implement the task */
      "MPTT", /* Name of the task */
      10000,  /* Stack size in words */
      NULL,  /* Task input parameter */
      0,  /* Priority of the task */
      &mppt_task,  /* Task handle. */
      0);
  
  xSemaphoreGive(data_semaphore);
 
  Wire.begin();
  Wire.setClock(2500); 

  initiate_light_sensors();  
  initiate_temperature_sensors();
  fs_setup();
  network_setup();

 
  database_ticker.attach(180, []() { database_ticked = true; });
  sms_ticker.attach(15, []() { sms_ticked = true; });
  initiate_sms();
}

void loop() {
  handle_network();
  database_task();
  handle_factory_reset();
  handle_check_sms();
}