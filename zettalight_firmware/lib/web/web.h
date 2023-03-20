#pragma once
#include <Arduino.h>

String html_markup = R"HTML(
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zettalight - urządzenie</title>
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
    />
    <script>
      let token;
      const currentURL = window.location.href;

      async function fetchData() {
        const url = currentURL.slice(0, -1) + ":5000";

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              'Authorization': `Token ${token}`
            }
          });

          if (!response.ok) {
            throw new Error("Request failed with status: " + response.status);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          console.error("Error:", error.message);
          throw error;
        }
      }

      async function handleSubmit(event) {
        event.preventDefault();
        disableForm();
        const elements = document.querySelectorAll(".formData");
        const formData = {}
        elements.forEach((element) => {
          formData[element.name] = element.value;
        });

        const configEndpoint = currentURL + "config";

        try {
          const response = await fetch(configEndpoint, {
            method: "POST",
            body: JSON.stringify(formData),
          });

          enableForm();
          if (response.ok) {
            showResult("Pomyślnie zmieniono konfigurację!", "alert-success");
          } else {
            showResult("Coś poszło nie tak!", "alert-danger");
          }
        } catch (error) {
          enableForm();
          showResult("Coś poszło nie tak!", "alert-danger");
          console.error(error);
        }
      }

      async function handleUpgradeSubmit(event) {
        event.preventDefault();
        
        const url = currentURL + "update";

        const form = event.target;
        const formData = new FormData(form);

        const spiner = document.getElementById("spiner");
        spinner.style.display = "inline-block";

        try {
          const response = await fetch(url, {
            method: form.method,
            body: formData,
          });
          const data = await response.text();
          spinner.style.display = "none";
          if (
            data ===
            '<META http-equiv="refresh" content="15;URL=/">Update Success! Rebooting...'
          ) {
            showUpgradeResult("Udało się!", "alert-success");
          } else {
            showUpgradeResult("Coś poszło nie tak!", "alert-danger");
          }
        } catch (error) {
          showUpgradeResult("Coś poszło nie tak!", "alert-danger");
        }
      }

      function showResult(message, alertClass) {
        const resultContainer = document.getElementById("result-container");
        resultContainer.innerHTML = `
                <div class="alert ${alertClass}" role="alert">
                ${message}
                </div>
            `;
      }

      function showUpgradeResult(message, alertClass) {
        const resultContainer = document.getElementById(
          "upgrade-result-container"
        );
        resultContainer.innerHTML = `
                <div class="alert ${alertClass}" role="alert">
                ${message}
                </div>
            `;
      }

      function populateData(data) {
        if(data.temperatureSensors[0] < 0) alert("error");
        if(data.temperatureSensors[1] < 0) alert("error");
        if(data.temperatureSensors[2] < 0) alert("error");
        document.getElementById("power").textContent = data.powerW;
        document.getElementById("voltage").textContent = data.voltageMv / 1000;
        document.getElementById("current").textContent = data.currentMa / 1000;
        document.getElementById("lightSensor0").textContent = data.lightSensors[0];
        document.getElementById("lightSensor1").textContent = data.lightSensors[1];
        document.getElementById("lightSensor2").textContent = data.lightSensors[2];
        document.getElementById("temperatureSensor0").textContent = data.temperatureSensors[0];
        document.getElementById("temperatureSensor1").textContent = data.temperatureSensors[1];
        document.getElementById("temperatureSensor2").textContent = data.temperatureSensors[2];
        document.getElementById("pwm").textContent = data.pwmDuty;
        document.getElementById("databaseConnection").textContent = data.databaseConnection ? "Połączono" : "Brak połączenia";
        document.getElementById("wifiConnection").textContent = data.wifiConnection ? "Połączono" : "Brak połączenia";
        document.getElementById("databaseConnection").style.color = data.databaseConnection ? "green" : "red";
        document.getElementById("wifiConnection").style.color = data.wifiConnection ? "green" : "red";
        document.getElementById("localIp").textContent = data.localIp;
      }

      function disableForm() {
        const elements = document.querySelectorAll(".formData");
        elements.forEach((element) => {
          element.disabled = true;
        });
        document.getElementById("submit-button").disabled = true;
      }

      function enableForm() {
        const elements = document.querySelectorAll(".formData");
        elements.forEach((element) => {
          element.disabled = false;
        });
        document.getElementById("submit-button").disabled = false;
      }

      function populateFormFields(data) {
        const elements = document.querySelectorAll(".formData");
        elements.forEach((element) => {
          element.value = data[element.name];
        });
      }

      setInterval(async () => {
        if (typeof token !== "undefined") {
          const data = await fetchData();
          populateData(data);
        }
      }, 1200);

      document.addEventListener("DOMContentLoaded", async () => {
        const configEndpoint = currentURL + "config";

        try {
          const response = await fetch(configEndpoint);
          const data = await response.json();
          populateFormFields(data);
          token = data.token;
          enableForm();
        } catch (error) {
          showResult(
            "Coś poszło nie tak! Spróbuj odświeżyć stronę!",
            "alert-danger"
          );
        }
      });
    </script>
  </head>
  <body>
    <div class="container">
      <div class="mt-3 alert alert-danger" role="alert">
        Uwaga! API zwracające aktualny stan instalacji fotowoltaicznej znajduje
        się na porcie 5000. Nigdy nie należy przekierowywać do sieci Internet
        portu 80 na którym dostępna jest ta niezabezpieczona strona
        konfiguracji! Zaleca się by API pracujące na porcie 5000 było wystawione
        do sieci Internet za pośrednictwem serwera reverse proxy!
      </div>
      <div style = "display: flex;">
        <div style="display: inline-block; width: 50%;">
          <h1>Stan instalacji</h1>
          <div class="data-item">Moc: <span id="power">0</span> W</div>
          <div class="data-item">Napięcie: <span id="voltage">0</span> V</div>
          <div class="data-item">
            Natężenie prądu: <span id="current">0</span> A
          </div>
          <div class="data-item">
            Wypełnienie PWM: <span id="pwm">50</span>%
          </div>
          <div class="data-item">Sensory natężenia światła:</div>
          <ul style = "font-family: monospace;">
            <li>0: <span id="lightSensor0">0</span> lx</li>
            <li>1: <span id="lightSensor1">0</span> lx</li>
            <li>2: <span id="lightSensor2">0</span> lx</li>
          </ul>
          <div class="data-item">Czujniki temperatury:</div>
          <ul style = "font-family: monospace;">
            <li>0: <span id="temperatureSensor0">0</span> °C</li>
            <li>1: <span id="temperatureSensor1">0</span> °C</li>
            <li>2: <span id="temperatureSensor2">0</span> °C</li>
          </ul>
      </div>
    
    <div style="display: inline-block;">
      <h1>Stan urządzenia</h1>
      <div class="data-item">Stan połączenia z bazą danych: <span id="databaseConnection"></span></div>
      <div class="data-item">Stan połączenia WiFi: <span id="wifiConnection"></span></div>
      <div class="data-item">Adres IP w sieci lokalnej: <span id="localIp"></span></div>
    </div></div>
      <h1>Konfiguracja</h1>
      <div id="result-container" class="mt-3"></div>
      <form class="mt-4" onsubmit="handleSubmit(event)">
        <div class="form-group">
          <label for="wifiSsid">Nazwa sieci WiFi:</label>
          <input
            disabled
            type="text"
            class="form-control formData"
            id="wifiSsid"
            name="wifiSsid"
            required
          />
        </div>
        <div class="form-group">
          <label for="wifiPsk">Hasło WiFi:</label>
          <input
            disabled
            type="password"
            class="form-control formData"
            id="wifiPsk"
            name="wifiPsk"
            required
            
          />
        </div>
        <div class="form-group">
          <label for="apPsk">Hasło hotspota konfiguracji:</label>
          <input
            disabled
            type="password"
            class="form-control formData"
            id="apPsk"
            name="apPsk"
            required
            
          />
        </div>
        <div class="form-group">
          <label for="influxUrl">Adres bazy danych InfluxDB:</label>
          <input
            placeholder="http://zettalight-database.local:8086"
            disabled
            type="text"
            class="form-control formData"
            id="influxUrl"
            name="influxUrl"
            required
          />
        </div>
        <div class="form-group">
          <label for="influxOrg">InfluxDB - Organizacja:</label>
          <input
            disabled
            type="text"
            class="form-control formData"
            id="influxOrg"
            name="influxOrg"
            required
          />
        </div>
        <div class="form-group">
          <label for="influxBucket">InfluxDB - Koszyk:</label>
          <input
            disabled
            type="text"
            class="form-control formData"
            id="influxBucket"
            name="influxBucket"
            required
          />
        </div>
        <div class="form-group">
          <label for="token">InfluxDB - Token autoryzacji:</label>
          <input
            disabled
            type="password"
            class="form-control formData"
            id="token"
            name="token"
            required
          />
        </div>
        <div class="form-group">
          <label for="phone">Numer telefonu:</label>
          <input
            disabled
            type="text"
            class="form-control formData"
            id="phone"
            name="phone"
          />
        </div>
        <button
          id="submit-button"
          disabled
          type="submit"
          class="btn btn-success"
        >
          Zapisz
        </button>
      </form>
      <h1>
        Aktualizacja firmware
        <div
          id="spinner"
          style="display: none"
          class="spinner-border text-primary"
          role="status"
        >
          <span class="sr-only">Loading...</span>
        </div>
      </h1>
      <div id="upgrade-result-container" class="mt-3"></div>
      <form
        method="POST"
        enctype="multipart/form-data"
        onsubmit="handleUpgradeSubmit(event)"
      >
        <input type="file" accept=".bin,.bin.gz" name="firmware" />
        <input
          class="btn btn-success"
          type="submit"
          value="Aktualizuj Firmware"
        />
      </form>
    </div>
  </body>
</html>
)HTML";