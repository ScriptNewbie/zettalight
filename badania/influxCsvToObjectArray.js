const fs = require('fs');

const influxCsvToObjectArray = (csv) => {
  const objects = [];
  const lines = csv.split("\n");
  const header = lines[0].split(",");
  const timeIndex = header.indexOf("_time");
  const fieldIndex = header.indexOf("_field");
  const valueIndex = header.indexOf("_value");
  lines.shift();
  lines.forEach((line) => {
    const words = line.split(",");
    if (words.length === 9) {
      objects.push({
        time: words[timeIndex],
        field: words[fieldIndex],
        value: words[valueIndex],
      });
    }
  });

  const mergedObjects = {};
  for (const item of objects) {
    const { time, value, field } = item;

    if (time in mergedObjects) {
      mergedObjects[time][field] = value;
    } else {
      mergedObjects[time] = { time, [field]: value };
    }
  }

  const mergedArray = Object.values(mergedObjects);

  const result = mergedArray
    .map((item) => {
      return {
        time: new Date(item.time),
        voltage: parseInt(item.voltageMv) / 1000,
        current: parseInt(item.currentMa) / 1000,
        power: parseInt(item.powerW),
        lightSensor0: parseInt(item.lightSensor0),
        lightSensor1: parseInt(item.lightSensor1),
        lightSensor2: parseInt(item.lightSensor2),
        temperatureSensor0: parseFloat(item.temperatureSensor0),
        temperatureSensor1: parseFloat(item.temperatureSensor1),
        temperatureSensor2: parseFloat(item.temperatureSensor2),
        pwmDuty: parseInt(item.pwmDuty),
      };
    })
    .map((item) => {
      return {
        time: isNaN(item.time.getTime()) ? new Date() : item.time,
        voltage: item.voltage ? item.voltage : 0,
        current: item.current ? item.current : 0,
        power: item.power ? item.power : 0,
        lightSensor0: item.lightSensor0 ? item.lightSensor0 : 0,
        lightSensor1: item.lightSensor1 ? item.lightSensor1 : 0,
        lightSensor2: item.lightSensor2 ? item.lightSensor2 : 0,
        temperatureSensor0: item.temperatureSensor0
          ? item.temperatureSensor0
          : 0,
        temperatureSensor1: item.temperatureSensor1
          ? item.temperatureSensor1
          : 0,
        temperatureSensor2: item.temperatureSensor2
          ? item.temperatureSensor2
          : 0,
        light: (item.lightSensor0 + item.lightSensor1 + item.lightSensor2) / 3,
        temperature:
          (item.temperatureSensor0 +
            item.temperatureSensor1 +
            item.temperatureSensor2) /
          3,
          pwmDuty: item.pwmDuty ? item.pwmDuty : 0
      };
    });
    const filtered = result.filter(item => {
      const date = item.time;
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      return totalMinutes >= 7 * 60 + 30 && totalMinutes <= 18 * 60 + 30; //Wyfiltrowanie tylko z odpowiednich godzin
    });

    return [filtered.filter(item => {
      return item.time < new Date("2023-08-07T00:00:00.000Z");
    }),
    filtered.filter(item => {
      return item.time > new Date("2023-08-07T00:00:00.000Z");
    })]
};

fs.readFile('data.csv', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  const result = influxCsvToObjectArray(data);
  const usableData = result[0];
  const openCircuit = result[1]; 
  fs.writeFile("json_data.txt", JSON.stringify(usableData), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
  });
  fs.writeFile("json_open_data.txt", JSON.stringify(openCircuit), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
  });
});