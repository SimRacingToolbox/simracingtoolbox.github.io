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

const CARS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQX6xlnb4gB3_VdbKT5_bVTt1JL8QjHRwKy_t7VHnjpfDhvYkSUu6_118_MGmNhjZc4y5O1UAr8d5Ob/pub?gid=0&single=true&output=csv";
const TRACKS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQX6xlnb4gB3_VdbKT5_bVTt1JL8QjHRwKy_t7VHnjpfDhvYkSUu6_118_MGmNhjZc4y5O1UAr8d5Ob/pub?gid=1023804714&single=true&output=csv";
const FUEL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQX6xlnb4gB3_VdbKT5_bVTt1JL8QjHRwKy_t7VHnjpfDhvYkSUu6_118_MGmNhjZc4y5O1UAr8d5Ob/pub?gid=1554720188&single=true&output=csv";

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

  console.log("Cars sample:", cars[0]);
  console.log("Tracks sample:", tracks[0]);
  console.log("Fuel sample row:", fuelData[0]);

  populateCarSelect();
  populateTrackSelect();
}

function populateCarSelect() {
  cars.forEach(car => {
    const opt = document.createElement("option");
    opt.value = car["Car Name"];
    opt.textContent = `${car["Class"]} | ${car["Car Name"]}`;
    carSelect.appendChild(opt);
  });
}

function populateTrackSelect() {
  tracks.forEach(tr => {
    const opt = document.createElement("option");
    opt.value = tr["Track Name"];
    opt.textContent = tr["Track Name"];
    trackSelect.appendChild(opt);
  });
}

function getCarIdByName(name) {
  const car = cars.find(c => c["Car Name"] === name);
  return car ? car["car_id"] : null;
}

function getTrackIdByName(name) {
  const tr = tracks.find(t => t["Track Name"] === name);
  return tr ? tr["track_id_variant"] : null;
}

function updateFuelField() {
  const carId = getCarIdByName(carSelect.value);
  const trackId = getTrackIdByName(trackSelect.value);
  if (!carId || !trackId) {
    fuelPerLapInput.value = "";
    return;
  }
  const match = fuelData.find(d =>
    d["car_id"] === carId && d["track_id_variant"] === trackId
  );
  if (!match) {
    fuelPerLapInput.value = "";
    resultDiv.textContent = "⚠️ No fuel data found.";
    return;
  }
  fuelPerLapInput.value = match["fuelPerLap"] || match["fuel/lap"] || "";
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
  if (!carId || !trackId || raceSec === 0) {
    resultDiv.textContent = "Complete all fields.";
    return;
  }
  const match = fuelData.find(d =>
    d["car_id"] === carId && d["track_id_variant"] === trackId
  );
  if (!match) {
    resultDiv.textContent = "No data found.";
    return;
  }
  const lapTime = parseFloat(match["lapTime"] || match["lap_time"]);
  const fuelPerLap = parseFloat(match["fuelPerLap"] || match["fuel/lap"]);
  if (!lapTime || !fuelPerLap) {
    resultDiv.textContent = "Invalid runtime data.";
    return;
  }
  const laps = raceSec / lapTime;
  const total = laps * fuelPerLap / stintCount;
  resultDiv.textContent = `Estimated Fuel: ${total.toFixed(1)} L`;
}

fetchData();
