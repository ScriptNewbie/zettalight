#pragma once

#include <Arduino.h>
#include "FS_tools.h"

extern String influx_url; 
extern String influx_org; 
extern String influx_bucket; 
extern String influx_token;
extern bool influx_initiated;
extern bool influx_connection_broken;

void reinitiate_influx();
void initiate_influx();
void influx_write(u_int32_t power, u_int32_t voltage_mv, u_int32_t current_ma, float light_sensor0, float light_sensor1, float light_sensor2, float temperature_sensor0, float temperature_sensor1, float temperature_sensor2, uint8_t pwm_duty);
void initiate_influx_vars();