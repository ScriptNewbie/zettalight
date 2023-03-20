#pragma once

struct temperature_sensors_values {
    float sensor0;
    float sensor1;
    float sensor2;
};

void initiate_temperature_sensors();
temperature_sensors_values get_temperature(bool force);