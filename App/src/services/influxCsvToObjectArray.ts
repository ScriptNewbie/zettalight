interface objectShape {
  time: string;
  value: string;
  field: string;
}

interface MergedObjectShape {
  time: string;
  [key: string]: string;
}

export const influxCsvToObjectArray = (csv: string) => {
  //Getting data
  const objects: objectShape[] = [];
  const lines = csv.split("\n");
  const header = lines[0].split(",");
  const timeIndex = header.indexOf("_time");
  const fieldIndex = header.indexOf("_field");
  const valueIndex = header.indexOf("_value");
  lines.shift();
  lines.forEach((line: string) => {
    const words = line.split(",");
    if (words.length === 9) {
      objects.push({
        time: words[timeIndex],
        field: words[fieldIndex],
        value: words[valueIndex],
      });
    }
  });

  //Merging same dates
  const mergedObjects: { [key: string]: MergedObjectShape } = {};
  for (const item of objects) {
    const { time, value, field } = item;

    if (time in mergedObjects) {
      mergedObjects[time][field] = value;
    } else {
      mergedObjects[time] = { time, [field]: value };
    }
  }

  const mergedArray: MergedObjectShape[] = Object.values(mergedObjects);

  return mergedArray
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
      };
    })
    .map((item) => {
      return {
        ...item,
        light: (item.lightSensor0 + item.lightSensor1 + item.lightSensor2) / 3,
        temperature:
          (item.temperatureSensor0 +
            item.temperatureSensor1 +
            item.temperatureSensor2) /
          3,
      };
    });
};
