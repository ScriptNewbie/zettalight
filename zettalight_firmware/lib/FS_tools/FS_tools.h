#pragma once
#include <Arduino.h>

void fs_setup();
void write_file(String path, String message);
String read_file(String path);
void fs_format();