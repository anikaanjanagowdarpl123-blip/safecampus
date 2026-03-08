// ============================================
// DISASTER DATA - Core Logic
// ============================================
const disasterData = {
  EARTHQUAKE: {
    safety_actions: [
      "DROP to your hands and knees immediately",
      "Take COVER under a sturdy desk or table",
      "HOLD ON until the shaking stops",
      "Stay away from windows and exterior walls",
      "If outdoors, move away from buildings and power lines",
      "After shaking stops, check for injuries and hazards"
    ],
    checklist: [
      "I know the safe spots in every room",
      "Emergency kit is prepared (water, food, flashlight)",
      "I know how to turn off gas and electricity",
      "Family meeting point is decided",
      "Important documents are stored safely"
    ],
    emergency_contacts: [
      { name: "🚔 Police", number: "100" },
      { name: "🚒 Fire Department", number: "101" },
      { name: "🚑 Ambulance", number: "108" },
      { name: "🏥 NDRF Helpline", number: "01124363260" },
      { name: "📞 Disaster Management", number: "1078" }
    ],
    evacuation_search: "open ground OR park near me"
  },
  FIRE: {
    safety_actions: [
      "Activate the nearest fire alarm immediately",
      "Call 101 (Fire Department) right away",
      "Crawl low under smoke to avoid inhaling fumes",
      "Feel doors before opening — if hot, find another exit",
      "Use stairs only, never use elevators",
      "Once outside, move to assembly point and do NOT re-enter"
    ],
    checklist: [
      "I know all fire exit locations",
      "Fire extinguisher location is known to me",
      "I have practiced the fire evacuation drill",
      "Smoke detectors are installed and working",
      "Emergency numbers are saved on my phone"
    ],
    emergency_contacts: [
      { name: "🚒 Fire Department", number: "101" },
      { name: "🚑 Ambulance", number: "108" },
      { name: "🚔 Police", number: "100" },
      { name: "🏥 Burns Emergency", number: "18001801104" },
      { name: "📞 Disaster Management", number: "1078" }
    ],
    evacuation_search: "hospital OR open ground near me"
  },
  FLOOD: {
    safety_actions: [
      "Move immediately to higher ground",
      "Do NOT walk or drive through floodwater",
      "Disconnect all electrical appliances",
      "Store drinking water in clean containers",
      "Follow evacuation orders from authorities",
      "Avoid contact with floodwater — it may be contaminated"
    ],
    checklist: [
      "I know the nearest flood shelter location",
      "Emergency food and water supply is ready (3 days)",
      "Valuables and documents are stored at height",
      "I have a battery-powered radio for updates",
      "Family evacuation plan is discussed and ready"
    ],
    emergency_contacts: [
      { name: "🚔 Police", number: "100" },
      { name: "🚑 Ambulance", number: "108" },
      { name: "🌊 Flood Control Room", number: "1070" },
      { name: "🏥 NDRF Helpline", number: "01124363260" },
      { name: "📞 Disaster Management", number: "1078" }
    ],
    evacuation_search: "high ground OR flood shelter near me"
  },
  CYCLONE: {
    safety_actions: [
      "Move to a designated cyclone shelter immediately",
      "Stay indoors and away from windows and doors",
      "Secure or bring inside all loose outdoor objects",
      "Keep emergency kit ready (torch, food, water, medicines)",
      "Do NOT go outside during the eye of the cyclone",
      "After cyclone passes, watch for fallen power lines"
    ],
    checklist: [
      "I know the nearest cyclone shelter location",
      "Windows and doors are secured properly",
      "Emergency supplies are stocked for 72 hours",
      "I have tracked the cyclone path via weather alerts",
      "Neighbours and family are informed and prepared"
    ],
    emergency_contacts: [
      { name: "🚔 Police", number: "100" },
      { name: "🚒 Fire Department", number: "101" },
      { name: "🚑 Ambulance", number: "108" },
      { name: "🌀 Cyclone Warning Centre", number: "18001801717" },
      { name: "📞 Disaster Management", number: "1078" }
    ],
    evacuation_search: "cyclone shelter OR community hall near me"
  }
};

// ============================================
// CURRENT STATE
// ============================================
let currentSchema = {};
let userLocation = null;

// ============================================
// ON PAGE LOAD - hide GPS action buttons until location detected
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("evacuateBtn").style.display = "none";
  document.getElementById("sosBtn").style.display = "none";
  document.getElementById("gpsStatus").textContent = "Select a disaster type above, then detect your location.";
});

// ============================================
// MAIN FUNCTION - Load Disaster Info
// ============================================
function loadDisaster() {
  const selected = document.getElementById("disasterSelect").value;
  if (!selected) return;

  const data = disasterData[selected];

  renderActions(data.safety_actions);
  renderChecklist(data.checklist);
  renderContacts(data.emergency_contacts);
  buildSchema(selected, data);

  document.getElementById("actionsCard").style.display = "block";
  document.getElementById("checklistCard").style.display = "block";
  document.getElementById("contactsCard").style.display = "block";
  document.getElementById("schemaCard").style.display = "block";
  document.getElementById("gpsCard").style.display = "block";

  // Reset GPS state when disaster changes
  userLocation = null;
  document.getElementById("gpsStatus").textContent = "Click the button below to detect your location.";
  document.getElementById("locateBtn").textContent = "📡 Detect My Location";
  document.getElementById("locateBtn").disabled = false;

  // FIX: Hide evacuate/SOS buttons until location is freshly detected
  document.getElementById("evacuateBtn").style.display = "none";
  document.getElementById("sosBtn").style.display = "none";
}

// ============================================
// RENDER SAFETY ACTIONS
// ============================================
function renderActions(actions) {
  const list = document.getElementById("actionsList");
  list.innerHTML = "";
  actions.forEach(action => {
    const li = document.createElement("li");
    li.textContent = action;
    list.appendChild(li);
  });
}

// ============================================
// RENDER CHECKLIST
// ============================================
function renderChecklist(items) {
  const container = document.getElementById("checklistItems");
  container.innerHTML = "";

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "checklist-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "chk" + index;
    checkbox.onchange = updateScore;

    const label = document.createElement("label");
    label.htmlFor = "chk" + index;
    label.textContent = item;

    div.appendChild(checkbox);
    div.appendChild(label);
    container.appendChild(div);
  });

  // FIX: Reset score display properly on each disaster load
  document.getElementById("scoreDisplay").textContent = "0%";
  document.getElementById("statusDisplay").textContent = "Needs Improvement ⚠️";
}

// ============================================
// UPDATE SCORE
// ============================================
function updateScore() {
  const checkboxes = document.querySelectorAll("#checklistItems input[type='checkbox']");
  const total = checkboxes.length;
  if (total === 0) return;

  let checked = 0;
  checkboxes.forEach(cb => { if (cb.checked) checked++; });

  const score = Math.round((checked / total) * 100);
  const status = score >= 60 ? "Prepared ✅" : "Needs Improvement ⚠️";

  document.getElementById("scoreDisplay").textContent = score + "%";
  document.getElementById("statusDisplay").textContent = status;

  currentSchema.preparedness_score = score;
  currentSchema.status = score >= 60 ? "Prepared" : "Needs Improvement";
  document.getElementById("jsonOutput").textContent = JSON.stringify(currentSchema, null, 2);
}

// ============================================
// RENDER EMERGENCY CONTACTS
// ============================================
function renderContacts(contacts) {
  const list = document.getElementById("contactsList");
  list.innerHTML = "";
  contacts.forEach(contact => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="contact-name">${contact.name}</span>
      <div class="contact-buttons">
        <a href="tel:${contact.number}" class="btn-call">📞 Call</a>
        <a href="sms:${contact.number}" class="btn-sms">💬 Message</a>
      </div>
    `;
    list.appendChild(li);
  });
}

// ============================================
// BUILD JSON SCHEMA
// ============================================
function buildSchema(disasterType, data) {
  currentSchema = {
    disaster_type: disasterType,
    preparedness_score: 0,
    safety_actions: data.safety_actions,
    emergency_contacts: data.emergency_contacts,
    user_location: null,
    evacuation_route: null,
    status: "Needs Improvement"
  };

  document.getElementById("jsonOutput").textContent = JSON.stringify(currentSchema, null, 2);
}

// ============================================
// GPS - GET USER LOCATION
// ============================================
function getLocation() {
  const statusEl = document.getElementById("gpsStatus");
  const btn = document.getElementById("locateBtn");

  // FIX: Guard against GPS being used before a disaster is selected
  const selected = document.getElementById("disasterSelect").value;
  if (!selected) {
    statusEl.textContent = "⚠️ Please select a disaster type first before detecting your location.";
    return;
  }

  if (!navigator.geolocation) {
    statusEl.textContent = "❌ Geolocation is not supported by your browser.";
    return;
  }

  statusEl.innerHTML = "📡 Detecting your location...";
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);
      userLocation = { latitude: parseFloat(lat), longitude: parseFloat(lng) };

      statusEl.innerHTML = `
        ✅ <strong>Location Detected!</strong><br>
        📌 Latitude: <strong>${lat}</strong><br>
        📌 Longitude: <strong>${lng}</strong><br>
        🔗 <a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" style="color:#f97316;">View My Location on Map</a>
      `;
      btn.disabled = false;
      btn.textContent = "🔄 Re-detect Location";

      // Update schema
      currentSchema.user_location = userLocation;

      const searchQuery = disasterData[selected].evacuation_search;
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}/@${lat},${lng},15z`;
      currentSchema.evacuation_route = mapsUrl;
      document.getElementById("jsonOutput").textContent = JSON.stringify(currentSchema, null, 2);

      // FIX: Show and wire up evacuate button only after location is known
      const evacuateBtn = document.getElementById("evacuateBtn");
      evacuateBtn.style.display = "inline-block";
      evacuateBtn.onclick = () => window.open(mapsUrl, "_blank");

      // FIX: Show and wire up SOS button only after location is known
      const sosBtn = document.getElementById("sosBtn");
      const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
      const msg = `🆘 EMERGENCY ALERT! I am in a ${selected} situation. My location: ${mapsLink} Please send help immediately!`;
      sosBtn.href = `sms:?body=${encodeURIComponent(msg)}`;
      sosBtn.style.display = "inline-block";
    },
    (error) => {
      let errMsg = "❌ Unable to get location. Please allow location access in your browser.";
      if (error.code === 1) errMsg = "❌ Location access denied. Please enable location permissions in your browser settings.";
      else if (error.code === 2) errMsg = "❌ Location unavailable. Please try again.";
      else if (error.code === 3) errMsg = "❌ Location request timed out. Please try again.";
      statusEl.textContent = errMsg;
      btn.disabled = false;
    }
  );
}