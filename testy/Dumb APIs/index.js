const express = require('express');
const app = express();

const data = {
    powerW: 0,
    voltageMv: 0,
    currentMa: 0,
    lightSensors: [0,0,0],
    temperatureSensors: [0,0,0],
    wifiConnection: false,
    databaseConnection: false,
    pwmDuty: 0
  };

app.get('/', (req, res) => {
  if(req.headers.authorization === "Token sometoken") return res.json(data);
  return res.status(401).json({ error: "Unauthorized" });
});


setInterval(() => {
  data.powerW = data.powerW + 10;
  data.currentMa = data.currentMa + 10;
  data.voltageMv = data.voltageMv + 10;
  data.pwmDuty = (data.pwmDuty + 10) % 110;
}, 3000);

app.listen(5000);