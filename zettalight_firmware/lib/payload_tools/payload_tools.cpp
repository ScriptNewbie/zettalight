#include "payload_tools.h"
#include "database_tools.h"
#include <WiFi.h>

String payload;

u_int32_t power = 0;
u_int32_t voltage_mv = 0;
u_int32_t current_ma = 0;
u_int8_t pwm_duty = 50;
light_sensors_values light_values;
temperature_sensors_values temperature_values;
unsigned long last_updated = 0;
SemaphoreHandle_t data_semaphore = xSemaphoreCreateBinary();

void update_payload(){
  light_values = get_light(false);
  temperature_values = get_temperature(false);
  payload = R"({
    "powerW": --power,
    "voltageMv": --voltage_mv,
    "currentMa": --current_ma,
    "lightSensors": [--light_sensor0, --light_sensor1, --light_sensor2],
    "temperatureSensors": [--temperature_sensor0, --temperature_sensor1, --temperature_sensor2],
    "wifiConnection": --wifi_connection,
    "databaseConnection": --database_connection,
    "localIp": "--local_ip",
    "pwmDuty": --pwm_duty
})";

    if(xSemaphoreTake(data_semaphore, portMAX_DELAY)){
        payload.replace("--power", String(power).c_str());
        payload.replace("--voltage_mv", String(voltage_mv).c_str());
        payload.replace("--current_ma", String(current_ma).c_str());
        payload.replace("--pwm_duty", String(pwm_duty).c_str());
        xSemaphoreGive(data_semaphore);
    } else {
        //Na wypadek nieuzyskania dostępu zamień na NaN aby uniknąć błędów z parsowaniem JSONAa. 
        payload.replace("--power", "NaN");
        payload.replace("--voltage_mv", "NaN");
        payload.replace("--current_ma", "NaN");
        payload.replace("--pwm_duty", "NaN");
    }
    payload.replace("--light_sensor0", String(light_values.sensor0,0).c_str());
    payload.replace("--light_sensor1", String(light_values.sensor1,0).c_str());
    payload.replace("--light_sensor2", String(light_values.sensor2,0).c_str());
    payload.replace("--temperature_sensor0", String(temperature_values.sensor0).c_str());
    payload.replace("--temperature_sensor1", String(temperature_values.sensor1).c_str());
    payload.replace("--temperature_sensor2", String(temperature_values.sensor2).c_str());
    payload.replace("--database_connection", (WiFi.status() == WL_CONNECTED && influx_initiated && !influx_connection_broken) ? "true" : "false");
    payload.replace("--wifi_connection", WiFi.status() == WL_CONNECTED ? "true" : "false");
    payload.replace("--local_ip", WiFi.localIP().toString());
}

String get_payload(){
    if(last_updated + 1000 < millis())
    {
        update_payload();
    }
    return payload;
}