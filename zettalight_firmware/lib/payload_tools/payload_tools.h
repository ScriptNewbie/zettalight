#pragma once
#include <Arduino.h>
#include "light_sensors.h"
#include "temperature_sensors.h"

extern SemaphoreHandle_t data_semaphore;

extern u_int32_t power;
extern u_int32_t voltage_mv;
extern u_int32_t current_ma;
extern u_int8_t pwm_duty;
extern light_sensors_values light_values;
extern temperature_sensors_values temperature_values;

String get_payload();
void update_payload();