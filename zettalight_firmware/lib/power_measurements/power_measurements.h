#pragma once
#include <Arduino.h>


#define VOLTAGE_DIVISED 11
#define SAMPLES_PER_CYCLE 1400

struct avg_vals {   
  u_int32_t power;
  u_int32_t voltage_mv;
  u_int32_t current_ma;
};

u_int16_t adc_to_mv(u_int16_t ADC_VAL);
u_int16_t mv_to_mamps(u_int16_t mv);
avg_vals measure_avg_vals(u_int8_t voltage_pin, u_int8_t current_pin);