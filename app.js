// CARTO API Key provided by user
const CARTO_API_KEY = 'cb1_53hr_1_a8927abd7d355dea1884b30d';

// Coordinates & Data for Chilean dog bite incidents & Base
const INITIAL_INCIDENTS = [
  {
    id: 'santiago_base',
    title: 'Santiago, El Quisco 3260',
    dogName: 'Псины отсутствуют (Периметр чист)',
    coords: [-33.411932, -70.596830],
    danger: 0,
    speed: '0 км/ч (режим максимального чила)',
    damage: '+100 HP, целые джинсы и чилийское вино',
    story: 'Главный командный бункер и база Димаса в Сантьяго: Las Condes, El Quisco 3260. Здесь хранятся запасы пластырей, бинтов, запасные шорты без дырок от клыков и стратегический запас чилийского Писко. Псины сюда не суются!',
    witnesses: 'Консьерж, соседи и курьеры с эмпанадас',
    date: 'Главная база',
    isSafeZone: true,
    isMainBase: true
  },
  {
    id: 'pupuya',
    title: 'Pupuya',
    dogName: 'Дон Кусало де ла Пупуйя',
    coords: [-34.004167, -71.852765],
    danger: 5,
    speed: '39 км/ч (звуковой барьер)',
    damage: '-25 HP, пластырь и успокоительный Писко',
    story: 'На песчаных холмах и дюнах Пупуйи. Пёс коварно притворился спящим бревном, дождался, пока Димас расслабится, и активировал режим перехватчика. Димаса спас высокий забор и акробатический кульбит.',
    witnesses: 'Кайтсерферы вдалеке (думали, это разминка)',
    date: 'Ветреный полдень',
    isSafeZone: false,
    isMainBase: false
  },
  {
    id: 'pichilemu',
    title: 'Pichilemu',
    dogName: 'Эль Чоко Торпедо (Quiltro Costero)',
    coords: [-34.385169, -72.004661],
    danger: 4,
    speed: '34 км/ч',
    damage: '-15 HP, левая штанина в клочья',
    story: 'Димас вальяжно шёл на закате проверять океанский свэлл. Из прибрежных кустов выскочила стая барбосов во главе с Эль Чоко. Димас продемонстрировал спринтерский рывок, которому позавидовал бы Усейн Болт.',
    witnesses: 'Два ошалевших серфера и пеликан',
    date: 'Закат боевой славы',
    isSafeZone: false,
    isMainBase: false
  }
];

// Audio FX synthesizer (Web Audio API)
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playBark() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const now = ctx.currentTime;

    // Dog bark pitch envelope
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);

    // Double bark echo
    setTimeout(() => {
      if (!this.enabled || !this.ctx) return;
      const t = ctx.currentTime;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(160, t);
      osc2.frequency.exponentialRampToValueAtTime(350, t + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(90, t + 0.16);

      gain2.gain.setValueAtTime(0.35, t);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.2);
    }, 120);
  }

  playBite() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    
    // Snapping sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playSiren() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.25);
    osc.frequency.linearRampToValueAtTime(600, now + 0.5);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  }
}

// App State
let incidents = [];
let markersMap = {};
let map = null;
let expeditionRoute = null;
let isAddMode = false;
let pendingCoords = null;
const sound = new SoundFX();

// Load Data from LocalStorage or Default
function loadIncidents() {
  const saved = localStorage.getItem('dimas_dog_incidents');
  if (saved) {
    try {
      incidents = JSON.parse(saved);
      // Remove Matanzas if present from previous sessions
      incidents = incidents.filter(i => i.id !== 'matanzas');

      // Update titles to original without parentheses
      const base = incidents.find(i => i.id === 'santiago_base');
      if (base) {
        base.title = 'Santiago, El Quisco 3260';
      } else {
        incidents.unshift(INITIAL_INCIDENTS[0]);
      }

      const pupuya = incidents.find(i => i.id === 'pupuya');
      if (pupuya) pupuya.title = 'Pupuya';

      const pichilemu = incidents.find(i => i.id === 'pichilemu');
      if (pichilemu) pichilemu.title = 'Pichilemu';

      saveIncidents();
    } catch (e) {
      incidents = [...INITIAL_INCIDENTS];
    }
  } else {
    incidents = [...INITIAL_INCIDENTS];
  }
}

function saveIncidents() {
  localStorage.setItem('dimas_dog_incidents', JSON.stringify(incidents));
}

// Initialize Leaflet Map
function initMap() {
  if (typeof L === 'undefined') {
    console.warn('Leaflet not loaded yet, retrying in 100ms...');
    setTimeout(initMap, 100);
    return;
  }

  // Initial center between Santiago and Coast
  const centerLat = -33.90;
  const centerLng = -71.30;
  const initialZoom = window.innerWidth <= 768 ? 8 : 9;

  map = L.map('map', {
    zoomControl: true,
    attributionControl: true
  }).setView([centerLat, centerLng], initialZoom);

  // CARTO Voyager with user API key
  const cartoUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`;
  const cartoVoyager = L.tileLayer(cartoUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  });

  // Secondary: OpenStreetMap Standard
  const osmStandard = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });

  // Satellite view: Esri World Imagery
  const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: USGS, GeoEye',
    maxZoom: 18
  });

  cartoVoyager.addTo(map);

  // Layer control
  L.control.layers({
    '🎨 CARTO Voyager (API)': cartoVoyager,
    '🗺️ OpenStreetMap': osmStandard,
    '🛰️ Спутник Чили (Esri)': esriSatellite
  }, null, { position: 'topright' }).addTo(map);

  // Draw tactical retreat & raid route
  drawExpeditionRoute();

  // Ensure Leaflet calculates dimensions correctly
  setTimeout(() => { if (map) map.invalidateSize(); }, 150);
  setTimeout(() => { if (map) map.invalidateSize(); }, 500);
  window.addEventListener('resize', () => { if (map) map.invalidateSize(); });

  // Map click handler for adding incidents
  map.on('click', (e) => {
    if (isAddMode) {
      pendingCoords = [e.latlng.lat, e.latlng.lng];
      sound.playBite();
      openModalWithCoords(pendingCoords);
      disableAddMode();
    }
  });

  renderMarkers();
}

// Draw expedition route connecting Santiago -> Pupuya -> Pichilemu
function drawExpeditionRoute() {
  if (!map) return;
  if (expeditionRoute) {
    map.removeLayer(expeditionRoute);
  }

  const routePoints = [
    [-33.411932, -70.596830], // Santiago (El Quisco 3260)
    [-33.72, -71.25],          // Melipilla highway junction
    [-34.004167, -71.852765], // Pupuya
    [-34.385169, -72.004661]  // Pichilemu
  ];

  expeditionRoute = L.polyline(routePoints, {
    color: '#ff4757',
    weight: 3.5,
    opacity: 0.75,
    dashArray: '8, 8',
    lineCap: 'round'
  }).addTo(map);

  expeditionRoute.bindTooltip('🚗 Тактический маршрут: Santiago ➔ Pupuya ➔ Pichilemu', {
    sticky: true,
    direction: 'top',
    className: 'custom-route-tooltip'
  });
}

// Fit map to show all points
function fitAllBounds() {
  if (!map || incidents.length === 0) return;
  const bounds = L.latLngBounds(incidents.map(i => i.coords));
  map.fitBounds(bounds, {
    padding: window.innerWidth <= 768 ? [40, 40] : [60, 60],
    maxZoom: 12
  });
}

// Custom Marker HTML generator
function createMarkerIcon(incident) {
  let pinClass = 'marker-danger';
  let emoji = '🐕';

  if (incident.isMainBase) {
    pinClass = 'marker-base';
    emoji = '🏰';
  } else if (incident.isSafeZone) {
    pinClass = 'marker-safe';
    emoji = '🛡️';
  } else if (incident.danger >= 5) {
    emoji = '🐺';
  }

  const html = `
    <div class="custom-dog-marker">
      ${!incident.isSafeZone ? '<div class="radar-wave"></div>' : ''}
      <div class="marker-pin ${pinClass}">
        <span class="marker-emoji">${emoji}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'leaflet-dog-icon',
    html: html,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20]
  });
}

// Generate Popup HTML
function createPopupContent(item) {
  const isBase = item.isMainBase;
  const dangerStars = isBase ? '🛡️ БЕЗОПАСНО' : '🩸'.repeat(item.danger || 1);
  return `
    <div class="popup-container">
      <div class="popup-header">
        <h3>${isBase ? '🏰' : (item.isSafeZone ? '🛡️' : '🚨')} ${item.title}</h3>
        <div class="popup-sub">${isBase ? 'Статус: Главное убежище' : `Пёс: ${item.dogName}`}</div>
      </div>
      <div class="popup-body">
        ${item.story}
      </div>
      <div class="popup-stats-list">
        <div><span>Уровень угрозы:</span> <strong>${dangerStars} ${!isBase ? `(${item.danger}/5)` : ''}</strong></div>
        <div><span>Скорость Димаса:</span> <strong>⚡ ${item.speed}</strong></div>
        <div><span>Экипировка:</span> <strong>${isBase ? '🛡️' : '💔'} ${item.damage}</strong></div>
        ${item.witnesses ? `<div><span>Свидетели:</span> <em>${item.witnesses}</em></div>` : ''}
      </div>
      ${!isBase ? `
      <button class="popup-sound-btn" onclick="triggerBarkSound('${item.id}')">
        🔊 Воспроизвести боевой лай псины
      </button>` : `
      <div style="text-align:center; font-size: 0.76rem; color: #2ed573; margin-top: 8px; font-weight:700;">
        ✅ Территория свободна от собачьего беспредела
      </div>`}
    </div>
  `;
}

// Global hook for popup button
window.triggerBarkSound = function(id) {
  sound.playBark();
};

// Render markers on map
function renderMarkers() {
  Object.values(markersMap).forEach(m => map.removeLayer(m));
  markersMap = {};

  incidents.forEach(item => {
    const icon = createMarkerIcon(item);
    const marker = L.marker(item.coords, { icon: icon }).addTo(map);

    marker.bindPopup(createPopupContent(item), {
      maxWidth: 320,
      className: 'custom-popup-frame'
    });

    marker.on('click', () => {
      if (!item.isSafeZone) {
        sound.playBark();
      }
    });

    markersMap[item.id] = marker;
  });
}

// Render incident list in sidebar
function renderSidebarList() {
  const container = document.getElementById('incidentList');
  if (!container) return;

  container.innerHTML = '';

  incidents.forEach(item => {
    const card = document.createElement('div');
    const isBase = item.isMainBase;
    card.className = `incident-card ${isBase ? 'base-zone' : (item.isSafeZone ? 'safe-zone' : '')}`;
    card.setAttribute('data-id', item.id);

    let badgeClass = 'badge-danger';
    let badgeText = `🩸 Ярость: ${item.danger}/5`;

    if (isBase) {
      badgeClass = 'badge-base';
      badgeText = '🏰 ГЛАВНАЯ БАЗА';
    } else if (item.isSafeZone) {
      badgeClass = 'badge-info';
      badgeText = '🛡️ Безопасная зона';
    }

    card.innerHTML = `
      <div class="incident-top">
        <div class="incident-location">
          <span>${isBase ? '🏰' : (item.isSafeZone ? '🏖️' : '📍')}</span>
          <span>${item.title}</span>
        </div>
        <span class="incident-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="dog-profile">
        <span>${isBase ? '🛡️' : '🐶'}</span> ${item.dogName}
      </div>
      <div class="incident-description">
        ${item.story}
      </div>
      <div class="incident-meta-tags">
        <span class="meta-tag">⚡ <strong>${item.speed}</strong></span>
        <span class="meta-tag">${isBase ? '🛡️' : '💥'} <strong>${item.damage}</strong></span>
      </div>
    `;

    card.addEventListener('click', () => {
      flyToIncident(item.id);
      closeMobileSidebar();
    });

    container.appendChild(card);
  });

  // Update total counts
  const totalCountEl = document.getElementById('totalIncidentsCount');
  if (totalCountEl) {
    const biteCount = incidents.filter(i => !i.isSafeZone).length;
    totalCountEl.textContent = biteCount;
  }
}

// Fly to specific location
function flyToIncident(id) {
  const item = incidents.find(i => i.id === id);
  if (!item || !map) return;

  const targetZoom = item.isMainBase ? 14 : 13;

  map.flyTo(item.coords, targetZoom, {
    animate: true,
    duration: 1.2
  });

  if (!item.isSafeZone) {
    sound.playBark();
  }

  setTimeout(() => {
    if (markersMap[id]) {
      markersMap[id].openPopup();
    }
  }, 1250);
}

// Mobile sidebar drawer handlers
function openMobileSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (sidebar) sidebar.classList.add('mobile-open');
  if (backdrop) backdrop.classList.add('show');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('show');
}

// Add Mode handlers
function enableAddMode() {
  closeMobileSidebar();
  isAddMode = true;
  document.getElementById('addModeBanner').style.display = 'flex';
  sound.playSiren();
}

function disableAddMode() {
  isAddMode = false;
  document.getElementById('addModeBanner').style.display = 'none';
}

function openModalWithCoords(coords) {
  const modal = document.getElementById('incidentModal');
  modal.classList.add('open');
  document.getElementById('locNameInput').focus();
}

function closeModal() {
  const modal = document.getElementById('incidentModal');
  modal.classList.remove('open');
  pendingCoords = null;
}

// Setup Event Listeners
function setupEvents() {
  // Sound toggle button (desktop & mobile)
  const soundBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundStatusText = document.getElementById('soundStatusText');
  const mobileSoundBtn = document.getElementById('mobileSoundBtn');
  const mobileSoundIcon = document.getElementById('mobileSoundIcon');

  function toggleSoundState() {
    sound.enabled = !sound.enabled;
    const icon = sound.enabled ? '🔊' : '🔇';
    const text = sound.enabled ? 'ВКЛ' : 'ВЫКЛ';

    if (soundIcon) soundIcon.textContent = icon;
    if (soundStatusText) soundStatusText.textContent = text;
    if (mobileSoundIcon) mobileSoundIcon.textContent = icon;

    if (sound.enabled) {
      sound.playBark();
    }
  }

  if (soundBtn) soundBtn.addEventListener('click', toggleSoundState);
  if (mobileSoundBtn) mobileSoundBtn.addEventListener('click', toggleSoundState);

  // Mobile sidebar drawer buttons
  const mobileDrawerBtn = document.getElementById('mobileDrawerBtn');
  const mobileViewListBtn = document.getElementById('mobileViewListBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  if (mobileDrawerBtn) mobileDrawerBtn.addEventListener('click', openMobileSidebar);
  if (mobileViewListBtn) mobileViewListBtn.addEventListener('click', openMobileSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // Add incident buttons (desktop & mobile)
  const addBtn = document.getElementById('addBiteBtn');
  const mobileAddBiteBtn = document.getElementById('mobileAddBiteBtn');
  const cancelAddBtn = document.getElementById('cancelAddBtn');

  if (addBtn) addBtn.addEventListener('click', enableAddMode);
  if (mobileAddBiteBtn) mobileAddBiteBtn.addEventListener('click', enableAddMode);
  if (cancelAddBtn) cancelAddBtn.addEventListener('click', disableAddMode);

  // Quick navigation chips & action buttons
  document.querySelectorAll('.quick-loc-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'fit-all') {
        fitAllBounds();
      } else {
        const id = btn.getAttribute('data-id');
        flyToIncident(id);
      }
      closeMobileSidebar();
    });
  });

  const mobileFitAllBtn = document.getElementById('mobileFitAllBtn');
  if (mobileFitAllBtn) {
    mobileFitAllBtn.addEventListener('click', () => {
      fitAllBounds();
      closeMobileSidebar();
    });
  }

  // Modal close handlers
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);

  // Form submit handler
  const form = document.getElementById('incidentForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const locName = document.getElementById('locNameInput').value.trim();
    const dogName = document.getElementById('dogNameInput').value.trim();
    const danger = parseInt(document.getElementById('dangerLevelInput').value, 10);
    const speed = document.getElementById('speedInput').value.trim() || '30 км/ч';
    const damage = document.getElementById('damageInput').value.trim() || '-10 HP, испуг';
    const story = document.getElementById('storyInput').value.trim() || 'Внезапный инцидент при встрече с чилийской собакой.';

    const newId = 'inc_' + Date.now();
    const coords = pendingCoords || [-34.1, -71.9];

    const newIncident = {
      id: newId,
      title: locName,
      dogName: dogName,
      coords: coords,
      danger: danger,
      speed: speed,
      damage: damage,
      story: story,
      witnesses: 'Очевидцы в шоке',
      date: 'Сегодня',
      isSafeZone: false,
      isMainBase: false
    };

    incidents.unshift(newIncident);
    saveIncidents();
    renderMarkers();
    renderSidebarList();
    closeModal();
    form.reset();

    sound.playBark();
    flyToIncident(newId);
  });
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  loadIncidents();
  initMap();
  renderSidebarList();
  setupEvents();
});
