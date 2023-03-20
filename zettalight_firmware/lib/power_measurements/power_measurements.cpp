#include "power_measurements.h"

u_int16_t adc_to_mv(u_int16_t ADC_VAL)
{
  if (ADC_VAL <= 100) return 0;
  if (ADC_VAL <= 3200) return (ADC_VAL * 3300)/4000 + 150;
  if (ADC_VAL <= 3300) return (ADC_VAL * 3300)/4050 + 150;
  if (ADC_VAL <= 3500) return (ADC_VAL * 3300)/4100 + 150;
  return (ADC_VAL * 3300)/4200 + 150;
}

u_int16_t mv_to_mamps(u_int16_t mv)
{
  int16_t amps = (2500 - (int16_t) mv) * 10;
  return amps > 0 ? amps : 0;
}



u_int16_t voltages[SAMPLES_PER_CYCLE];
u_int16_t currents[SAMPLES_PER_CYCLE];

avg_vals measure_avg_vals(u_int8_t voltage_pin, u_int8_t current_pin)
{ 
  u_int32_t voltage_sum = 0;
  u_int32_t current_sum = 0;
  u_int64_t power_sum = 0;

  u_int16_t voltage_in_mv;
  u_int16_t current_in_ma;
  
  for(int i = 0; i < SAMPLES_PER_CYCLE; ++i)
  {
    voltages[i] = analogRead(voltage_pin);
    currents[i] = analogRead(current_pin);
  }
 
  for(int i = 0; i < SAMPLES_PER_CYCLE; ++i)
  {
    voltage_in_mv = adc_to_mv(voltages[i]);
    current_in_ma = mv_to_mamps(adc_to_mv(currents[i]));

    voltage_sum += voltage_in_mv;
    current_sum += current_in_ma;
    power_sum += voltage_in_mv * current_in_ma;
  }

  avg_vals result;
  result.voltage_mv = (voltage_sum/SAMPLES_PER_CYCLE) * VOLTAGE_DIVISED;
  result.current_ma = current_sum/SAMPLES_PER_CYCLE;
  result.power = (power_sum/SAMPLES_PER_CYCLE) * VOLTAGE_DIVISED /100000; //jedna dziesiąta watta
  return result;
}