#include <InfluxDbClient.h>
#include "database_tools.h"

InfluxDBClient client;

String influx_url;
String influx_org;
String influx_bucket;
String influx_token;
bool influx_initiated = false;
bool influx_connection_broken = false;
Point point("zettalight");

void influx_sync_time(){
    timeSync("CEST", "pool.ntp.org", "time.nis.gov");
}

void initiate_influx_vars(){
    influx_url = read_file("/influx_url.txt");
    influx_org = read_file("/influx_org.txt");
    influx_bucket = read_file("/influx_bucket.txt");
    influx_token = read_file("/influx_token.txt");
}

void initiate_influx(){
    influx_initiated = true;
    reinitiate_influx();
    influx_sync_time();
}

void reinitiate_influx(){
    client.setConnectionParams(influx_url, influx_org, influx_bucket, influx_token);
    client.setWriteOptions(WriteOptions().writePrecision(WritePrecision::S).bufferSize(480));
}

void influx_write(u_int32_t power, u_int32_t voltage_mv, u_int32_t current_ma, float light_sensor0, float light_sensor1, float light_sensor2, float temperature_sensor0, float temperature_sensor1, float temperature_sensor2, uint8_t pwm_duty){
    influx_sync_time();
    point.clearFields();
    point.addField("powerW", power);
    point.addField("voltageMv", voltage_mv);
    point.addField("currentMa", current_ma);
    point.addField("lightSensor0", light_sensor0);
    point.addField("lightSensor1", light_sensor1);
    point.addField("lightSensor2", light_sensor2);
    point.addField("temperatureSensor0", temperature_sensor0);
    point.addField("temperatureSensor1", temperature_sensor1);
    point.addField("temperatureSensor2", temperature_sensor2);
    point.addField("pwmDuty", pwm_duty);
    point.setTime(WritePrecision::S);
    influx_connection_broken = !client.writePoint(point);
}
