const carSelect = document.getElementById("carSelect");
const trackSelect = document.getElementById("trackSelect");
const stintHoursInput = document.getElementById("stintHours");
const stintMinutesInput = document.getElementById("stintMinutes");
const stintCountInput = document.getElementById("stintCount");
const fuelPerLapInput = document.getElementById("fuelPerLap");
const resultDiv = document.getElementById("result");

let cars = [];
let tracks = [];
let fuelData = [];

const CARS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6yz3cfDvz0xZLZLnXPp3O-DbcGEqh1a806qUljoUMa4b1QUJytCWzJH0IDI6rn2PqICBORpMOzQ0c/pub?gid=1197432986&single=true&output=csv";
const TRACKS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6yz3cfDvz0xZLZLnXPp3O-DbcGEqh1a806qUljoUMa4b1QUJytCWzJH0IDI6rn2PqICBORpMOzQ0c/pub?gid=766022458&single=true&output=csv";
const FUEL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6yz3cfDvz0xZLZLnXPp3O-DbcGEqh1a806qUljoUMa4b1QUJytCWzJH0IDI6rn2PqICBORpMOzQ0c/pub?gid=1963502437&single=true&output=csv"

function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim();
    });
    return obj;
  });
}

async function fetchData() {
  const [carsCsv, tracksCsv, fuelCsv] = await Promise.all([
    fetch(CARS_CSV).then(r => r.text()),
    fetch(TRACKS_CSV).then(r => r.text()),
    fetch(FUEL_CSV).then(r => r.text())
  ]);

  cars = parseCSV(carsCsv);
  tracks = parseCSV(tracksCsv);
  fuelData = parseCSV(fuelCsv);

  populateCarSelect();
  populateTrackSelect();
}

function populateCarSelect() {
  cars.forEach(car => {
    const option = document.createElement("option");
    option.value = car["Car Name"];
    option.textContent = `${car["Class"]} | ${car["Car Name"]}`;
    carSelect.appendChild(option);
  });
}

function populateTrackSelect() {
  tracks.forEach(track => {
    const option = document.createElement("option");
    option.value = track["Track Name"];
    option.textContent = track["Track Name"];
    trackSelect.appendChild(option);
  });
}

function getCarIdByName(name) {
  const car = cars.find(c => c["Car Name"] === name);
  return car?.car_id || null;
}

function getTrackIdByName(name) {
  const track = tracks.find(t => t["Track Name"] === name);
  return track?.track_id || null;
}

function updateFuelField() {
  const carId = getCarIdByName(carSelect.value);
  const trackId = getTrackIdByName(trackSelect.value);

  if (!carId || !trackId) {
    fuelPerLapInput.value = "";
    return;
  }

  const match = fuelData.find(
    d => d["car_id"] === carId && d["track_id"] === trackId
  );

  if (!match) {
    fuelPerLapInput.value = "";
    resultDiv.textContent = "⚠️ No fuel data found.";
    return;
  }

  fuelPerLapInput.value = match["fuelPerLap"];
  resultDiv.textContent = "";
}

carSelect.addEventListener("change", updateFuelField);
trackSelect.addEventListener("change", updateFuelField);

function calculateFuel() {
  const carId = getCarIdByName(carSelect.value);
  const trackId = getTrackIdByName(trackSelect.value);
  const hours = parseInt(stintHoursInput.value) || 0;
  const minutes = parseInt(stintMinutesInput.value) || 0;
  const raceSec = (hours * 60 + minutes) * 60;
  const stintCount = parseInt(stintCountInput.value) || 1;
  const addBuffer = document.getElementById("addBuffer").checked;

  if (!carId || !trackId || raceSec === 0) {
    resultDiv.textContent = "Complete all fields.";
    return;
  }

  const match = fuelData.find(
    d => d["car_id"] === carId && d["track_id"] === trackId
  );

  if (!match) {
    resultDiv.textContent = "No data found.";
    return;
  }

  const lapTime = parseFloat(match["lapTime"]);
  const fuelPerLap = parseFloat(match["fuelPerLap"]);

  if (!lapTime || !fuelPerLap) {
    resultDiv.textContent = "Invalid lap time or fuel data.";
    return;
  }

  let totalLaps = raceSec / lapTime;
  if (addBuffer) totalLaps += 1;

  const estimatedLaps = raceSec / lapTime + 1;
  const lapsPerStint = totalLaps / stintCount;
  const fuelPerStint = totalLaps * fuelPerLap / stintCount ;
  const totalFuel = totalLaps * fuelPerLap + fuelPerLap + fuelPerLap / 2;

  resultDiv.innerHTML = `
    <strong>Fuel Estimate:</strong><br>
    • Estimated laps: ${estimatedLaps.toFixed(0)} <br>
    • Laps per Stint: ${lapsPerStint.toFixed(1)}<br>
    • Fuel per Stint: ${fuelPerStint.toFixed(1)} <br>
    • Total Fuel: ${totalFuel.toFixed(1)} <br>
  `;
}

// Toggle menu open/close
document.getElementById("logoButton").addEventListener("click", () => {
  document.getElementById("slideMenu").classList.add("open");
});

document.getElementById("closeMenu").addEventListener("click", () => {
  document.getElementById("slideMenu").classList.remove("open");
});


fetchData();
