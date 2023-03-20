clear;
data = jsondecode(fileread("json_data.txt"));
pwm = [data.pwmDuty]
voltage = [data.voltage];
voltage = voltage(pwm >= 5 & pwm <= 95);
temperatures = [data.temperatureSensor0];
cellTemperatures = [data.temperatureSensor1; data.temperatureSensor2];
openCircuitData = jsondecode(fileread("json_open_data.txt"));
openVoltages = rmoutliers([openCircuitData.voltage]);

histogram(voltage, 'BinWidth', 1)
xlabel('Napięcie [V]');
ylabel('Liczba wystąpień');

minOpen = min(openVoltages);
maxOpen = max(openVoltages);

leftSide = 0.66 * minOpen;
rightSide = 0.88 * maxOpen;


filteredVoltages = voltage(voltage > leftSide & voltage < rightSide);
figure
histogram(filteredVoltages, 'BinWidth', 0.5)
xlabel('Napięcie [V]');
ylabel('Liczba wystąpień');

alpha = 1 - 0.95; % Poziom istotności (1 - poziom ufności)
n = length(filteredVoltages);
meanVal = mean(filteredVoltages);
median = median(filteredVoltages);
stdDev = std(filteredVoltages);
critical = norminv(1 - alpha/2);

margin = critical * (stdDev / sqrt(n));
confidenceInterval = [meanVal - margin, meanVal + margin];

%Sprawdzenie
tempsDiff = abs(cellTemperatures(1, :) - cellTemperatures(2, :));
maxTempsDiff = max(tempsDiff);
test1 = cellTemperatures(:, tempsDiff > 2);

cellTemperatures = mean(cellTemperatures);
meanCellTemp = mean(cellTemperatures);
minCellTemp = min(cellTemperatures);
maxCellTemp = max(cellTemperatures);

meanTemp = mean(temperatures);
minTemp = min(temperatures);
maxTemp = max(temperatures);

figure
histogram(cellTemperatures, 'BinWidth', 5);
xlabel('Temperatura [°C]');
ylabel('Liczba wystąpień');

figure
histogram(temperatures, 'BinWidth', 5);
xlabel('Temperatura [°C]');
ylabel('Liczba wystąpień');


