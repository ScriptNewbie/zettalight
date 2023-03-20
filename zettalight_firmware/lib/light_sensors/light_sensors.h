#pragma once
#include <Arduino.h>

struct light_sensors_values {
    float sensor0;
    float sensor1;
    float sensor2;
};

void initiate_light_sensors();
light_sensors_values get_light(bool force);
