const carSelect = document.getElementById("carSelect");
const trackSelect = document.getElementById("trackSelect");
const stintHoursInput = document.getElementById("stintHours");
const stintMinutesInput = document.getElementById("stintMinutes");
const minPitsInput = document.getElementById("minPits");
const fuelPerLapInput = document.getElementById("fuelPerLap");
const maxFuelInput = document.getElementById("maxFuel")
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

function updateMaxFuel() {
  const carId = getCarIdByName(carSelect.value);

  if (!carId) {
    maxFuelInput.value = "";
    return;
  }

  // Find *any* entry in fuelData that matches the car_id (track_id is ignored)
  const match = fuelData.find(
    d => d["car_id"] === carId
  );

  if (!match || !match["maxFuel"]) {
    maxFuelInput.value = "";
    resultDiv.textContent = "⚠️ No max capacity found.";
    return;
  }

  maxFuelInput.value = match["maxFuel"];
  resultDiv.textContent = "";
}

carSelect.addEventListener("change", updateMaxFuel);

function calculateFuel() {
  const carId = getCarIdByName(carSelect.value);
  const trackId = getTrackIdByName(trackSelect.value);
  const hours = parseInt(stintHoursInput.value) || 0;
  const minutes = parseInt(stintMinutesInput.value) || 0;
  const raceSec = (hours * 60 + minutes) * 60;
  const minPits = parseInt(minPitsInput.value) || 0;
  const addBuffer = document.getElementById("addBuffer").checked;
  const maxFuel = parseFloat(maxFuelInput.value);

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

  const totalFuel = totalLaps * fuelPerLap;

  let estimatedPit;
  let fuelPerStintAuto;

  if (minPits === 0) {
    // Auto-calculate pits based on tank capacity
    if (totalFuel <= maxFuel) {
      estimatedPit = 0;
      fuelPerStintAuto = totalFuel;
    } else {
      estimatedPit = Math.ceil(totalFuel / maxFuel) - 1;
      fuelPerStintAuto = Math.min(maxFuel, totalFuel / (estimatedPit + 1));
    }
  } else {
    // Force at least minPits
    const autoPits = Math.ceil(totalFuel / maxFuel) - 1;
    estimatedPit = Math.max(minPits, autoPits);
    fuelPerStintAuto = Math.min(maxFuel, totalFuel / (estimatedPit + 1));
  }

  const estimatedLaps = raceSec / lapTime;

  resultDiv.innerHTML = `
    <strong>Fuel Estimate:</strong><br>
    • Estimated laps: ${Math.ceil(estimatedLaps)}<br>
    • Estimated pit stops: ${estimatedPit}<br>
    • Laps per Stint: ${Math.ceil(totalLaps / (estimatedPit + 1))}<br>
    • Fuel per Stint: ${Math.ceil(fuelPerStintAuto)}<br>
    • Total Fuel: ${Math.ceil(totalFuel)}<br>
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
