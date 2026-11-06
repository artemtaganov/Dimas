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
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  unlock() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    try {
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);
    } catch (e) {}
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
      this.init();
      const t = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(160, t);
      osc2.frequency.exponentialRampToValueAtTime(350, t + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(90, t + 0.16);

      gain2.gain.setValueAtTime(0.35, t);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
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

  playJump() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.14);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playCoin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587, now);
    osc.frequency.setValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playCrash() {
    this.playBark();
    this.playBite();
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
  // Mobile Web Audio unlock on first touch / click
  const unlockMobileAudio = () => {
    sound.unlock();
  };
  ['touchstart', 'touchend', 'pointerdown', 'click'].forEach(evt => {
    document.addEventListener(evt, unlockMobileAudio, { passive: true, once: true });
  });

  // Sound toggle button (desktop & mobile)
  const soundBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundStatusText = document.getElementById('soundStatusText');
  const mobileSoundBtn = document.getElementById('mobileSoundBtn');
  const mobileSoundIcon = document.getElementById('mobileSoundIcon');

  function toggleSoundState() {
    sound.unlock();
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

  // Mini-Game event listeners
  initMiniGame();
}

// Mini-Game: Beach Runner (Dimas vs. Quiltro)
class BeachRunner {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width || 640;
    this.height = canvas.height || 270;
    this.groundY = this.height - 40;

    this.state = 'idle'; // 'idle', 'running', 'gameover'
    this.distance = 0;
    this.coins = 0;
    this.pantsHp = 100;
    this.highScore = parseInt(localStorage.getItem('dimas_game_highscore') || '0', 10);

    this.speed = 5.2;
    this.gameSpeed = 5.2;
    this.animFrame = null;
    this.isRunningLoop = false;

    // Player (Dimas)
    this.player = {
      x: 180,
      y: this.groundY - 42,
      width: 36,
      height: 44,
      vy: 0,
      jumpCount: 0,
      maxJumps: 2,
      isGrounded: true,
      legCycle: 0
    };

    // Chaser (Quiltro Dog)
    this.dog = {
      x: 50,
      y: this.groundY - 32,
      width: 38,
      height: 30,
      targetX: 55,
      legCycle: 0
    };

    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.clouds = [
      { x: 40, y: 30, speed: 0.4, size: 30 },
      { x: 260, y: 48, speed: 0.6, size: 38 },
      { x: 480, y: 25, speed: 0.5, size: 32 }
    ];

    this.spawnTimer = 0;
    this.collectibleTimer = 0;
    this.idleTimer = 0;
    this.shoutTimer = 0;
    this.shoutText = '';

    this.loop = this.loop.bind(this);
    this.setupInput();
  }

  initCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width > 50 ? Math.floor(rect.width) : 640;
    const h = rect.height > 50 ? Math.floor(rect.height) : 270;

    this.canvas.width = w;
    this.canvas.height = h;
    this.width = w;
    this.height = h;
    this.groundY = this.height - 40;

    this.player.y = this.groundY - this.player.height;
    this.dog.y = this.groundY - this.dog.height;
  }

  setupInput() {
    this.jumpHandler = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (this.state === 'running') {
        this.jump();
      } else if (this.state === 'idle' || this.state === 'gameover') {
        this.start();
      }
    };

    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        const modal = document.getElementById('gameModal');
        if (modal && modal.classList.contains('open')) {
          e.preventDefault();
          this.jumpHandler(e);
        }
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.jumpHandler(e);
    });

    const jumpBtn = document.getElementById('mobileJumpBtn');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', (e) => {
        this.jumpHandler(e);
      });
      jumpBtn.addEventListener('pointerdown', (e) => {
        this.jumpHandler(e);
      });
    }
  }

  jump() {
    if (this.player.jumpCount < this.player.maxJumps) {
      this.player.vy = -11.2;
      this.player.jumpCount++;
      this.player.isGrounded = false;
      sound.playJump();

      // Jump dust particles
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: this.player.x + 16,
          y: this.groundY - 2,
          vx: (Math.random() - 0.5) * 4 - 2,
          vy: -Math.random() * 2,
          size: Math.random() * 4 + 2,
          color: '#e58e26',
          life: 18
        });
      }
    }
  }

  start() {
    this.state = 'running';
    this.distance = 0;
    this.coins = 0;
    this.pantsHp = 100;
    this.gameSpeed = 5.2;
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.spawnTimer = 45;
    this.dog.x = 55;
    this.dog.targetX = 55;

    const overlay = document.getElementById('gameOverlayMsg');
    if (overlay) overlay.style.display = 'none';

    this.updateHUD();
    sound.playBark();
  }

  startLoop() {
    if (!this.isRunningLoop) {
      this.isRunningLoop = true;
      this.animFrame = requestAnimationFrame(this.loop);
    }
  }

  stopLoop() {
    this.isRunningLoop = false;
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  gameOver() {
    this.state = 'gameover';
    sound.playCrash();

    if (this.distance > this.highScore) {
      this.highScore = Math.floor(this.distance);
      localStorage.setItem('dimas_game_highscore', this.highScore);
    }

    const highScoreEl = document.getElementById('gameHighScore');
    if (highScoreEl) highScoreEl.textContent = this.highScore;

    const statsEl = document.getElementById('gameOverStats');
    if (statsEl) {
      statsEl.textContent = `Димас пробежал: ${Math.floor(this.distance)} м • Съедено эмпанадас: ${this.coins} 🥟`;
    }

    const verdicts = [
      '«Штаны спасти не удалось, но скорость бега была космической!»',
      '«Пёс сыт, штаны в лоскуты, Димас уже на базе в Сантьяго!»',
      '«Спринтерский рывок года! Чили аплодирует стоя!»',
      '«Псина включила режим перехватчика и настигла добычу!»'
    ];
    const verdictEl = document.getElementById('gameOverVerdict');
    if (verdictEl) {
      verdictEl.textContent = verdicts[Math.floor(Math.random() * verdicts.length)];
    }

    const overlay = document.getElementById('gameOverlayMsg');
    if (overlay) overlay.style.display = 'flex';
  }

  updateHUD() {
    const distEl = document.getElementById('gameDistance');
    const coinsEl = document.getElementById('gameCoins');
    const pantsEl = document.getElementById('gamePants');
    const highScoreEl = document.getElementById('gameHighScore');

    if (distEl) distEl.textContent = `${Math.floor(this.distance)} м`;
    if (coinsEl) coinsEl.textContent = `${this.coins} 🥟`;
    if (pantsEl) pantsEl.textContent = `${Math.max(0, this.pantsHp)}% 🩳`;
    if (highScoreEl) highScoreEl.textContent = this.highScore;
  }

  loop() {
    if (!this.isRunningLoop) return;

    if (this.state === 'running') {
      this.updateRunning();
    } else {
      this.updateIdle();
    }

    this.render();
    this.animFrame = requestAnimationFrame(this.loop);
  }

  updateIdle() {
    this.idleTimer++;
    // Subtle bounce on idle
    this.player.legCycle += 0.15;
    this.dog.legCycle += 0.15;
  }

  updateRunning() {
    this.distance += this.gameSpeed * 0.055;
    this.gameSpeed = Math.min(11, 5.2 + this.distance * 0.007);
    this.updateHUD();

    // Gravity
    this.player.vy += 0.62;
    this.player.y += this.player.vy;

    if (this.player.y >= this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height;
      this.player.vy = 0;
      this.player.jumpCount = 0;
      this.player.isGrounded = true;
    }

    this.player.legCycle += 0.28;
    this.dog.legCycle += 0.32;

    // Dog position catch-up logic
    if (this.dog.targetX > 55) {
      this.dog.targetX -= 0.15;
    }
    this.dog.x += (this.dog.targetX - this.dog.x) * 0.08;

    // Shouts
    this.shoutTimer++;
    if (this.shoutTimer > 160) {
      this.shoutTimer = 0;
      const shouts = ['¡Tranquilo, perrito!', '39 км/ч!', 'Спасите штаны!', 'Беги, Димас!'];
      this.shoutText = shouts[Math.floor(Math.random() * shouts.length)];
    }

    // Spawn Obstacles
    this.spawnTimer--;
    if (this.spawnTimer <= 0) {
      const types = [
        { type: 'cactus', w: 26, h: 36, yOff: 36 },
        { type: 'crab', w: 28, h: 22, yOff: 22 },
        { type: 'board', w: 34, h: 32, yOff: 32 }
      ];
      const chosen = types[Math.floor(Math.random() * types.length)];
      this.obstacles.push({
        type: chosen.type,
        x: this.width + 30,
        y: this.groundY - chosen.yOff,
        w: chosen.w,
        h: chosen.h
      });
      this.spawnTimer = Math.floor(Math.random() * 40 + 55 / (this.gameSpeed / 5.2));
    }

    // Spawn Empanadas
    this.collectibleTimer--;
    if (this.collectibleTimer <= 0) {
      this.collectibles.push({
        x: this.width + 40,
        y: this.groundY - Math.random() * 65 - 35,
        w: 24,
        h: 24
      });
      this.collectibleTimer = Math.floor(Math.random() * 110 + 80);
    }

    // Collide obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.gameSpeed;

      if (this.checkCollision(this.player, obs)) {
        this.obstacles.splice(i, 1);
        this.pantsHp -= 35;
        this.dog.targetX += 38;
        sound.playBark();

        // Blood / dust burst
        for (let p = 0; p < 8; p++) {
          this.particles.push({
            x: this.player.x + 16,
            y: this.player.y + 16,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: 5,
            color: '#ff4757',
            life: 20
          });
        }

        if (this.pantsHp <= 0 || this.dog.x >= this.player.x - 24) {
          this.gameOver();
          return;
        }
        continue;
      }

      if (obs.x < -40) {
        this.obstacles.splice(i, 1);
      }
    }

    // Collect items
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      item.x -= this.gameSpeed;

      if (this.checkCollision(this.player, item)) {
        this.collectibles.splice(i, 1);
        this.coins++;
        this.distance += 25;
        sound.playCoin();

        for (let p = 0; p < 6; p++) {
          this.particles.push({
            x: item.x,
            y: item.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: 4,
            color: '#ffa502',
            life: 16
          });
        }
        continue;
      }

      if (item.x < -30) {
        this.collectibles.splice(i, 1);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  checkCollision(a, b) {
    const pad = 6;
    return (
      a.x + pad < b.x + b.w - pad &&
      a.x + a.width - pad > b.x + pad &&
      a.y + pad < b.y + b.h &&
      a.y + a.height > b.y + pad
    );
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Sky & Sunset Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, '#2d142c');
    skyGrad.addColorStop(0.35, '#801336');
    skyGrad.addColorStop(0.7, '#c72c41');
    skyGrad.addColorStop(1, '#ee4540');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Setting Sun
    ctx.fillStyle = '#f9ca24';
    ctx.beginPath();
    ctx.arc(w * 0.72, h * 0.42, 34, 0, Math.PI * 2);
    ctx.fill();

    // 3. Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    this.clouds.forEach(c => {
      if (this.state === 'running') c.x -= c.speed;
      if (c.x < -60) c.x = w + 40;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 0.5, 0, Math.PI * 2);
      ctx.arc(c.x + 14, c.y - 6, c.size * 0.6, 0, Math.PI * 2);
      ctx.arc(c.x + 28, c.y, c.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Coastal Mountains
    ctx.fillStyle = '#511845';
    ctx.beginPath();
    ctx.moveTo(0, this.groundY - 35);
    ctx.lineTo(w * 0.25, this.groundY - 60);
    ctx.lineTo(w * 0.55, this.groundY - 40);
    ctx.lineTo(w * 0.85, this.groundY - 70);
    ctx.lineTo(w, this.groundY - 35);
    ctx.lineTo(w, this.groundY);
    ctx.lineTo(0, this.groundY);
    ctx.fill();

    // 5. Ocean Waves
    ctx.fillStyle = '#1e3799';
    ctx.fillRect(0, this.groundY - 24, w, 24);

    const waveSpeed = this.state === 'running' ? this.gameSpeed : 2;
    const waveOffset = (Date.now() * 0.003 * waveSpeed) % 40;
    ctx.fillStyle = '#4a69bd';
    ctx.beginPath();
    for (let x = -40; x < w + 40; x += 30) {
      ctx.arc(x - waveOffset, this.groundY - 20, 14, 0, Math.PI);
    }
    ctx.fill();

    // Foam line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, this.groundY - 14, w, 2.5);

    // 6. Sandy Beach Ground
    const sandGrad = ctx.createLinearGradient(0, this.groundY - 12, 0, h);
    sandGrad.addColorStop(0, '#f8c291');
    sandGrad.addColorStop(1, '#e58e26');
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, this.groundY - 12, w, h - this.groundY + 12);

    // Beach pebbles & sand streaks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    const streakOffset = (this.distance * 12) % 60;
    for (let x = -60; x < w + 60; x += 55) {
      ctx.fillRect(x - streakOffset, this.groundY + 12, 18, 3);
      ctx.fillRect(x - streakOffset + 25, this.groundY + 24, 12, 2.5);
    }

    // 7. Collectibles (Empanadas)
    this.collectibles.forEach(item => {
      // Golden Empanada graphic
      ctx.save();
      ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(0, 0, 12, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d35400';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });

    // 8. Obstacles
    this.obstacles.forEach(obs => {
      if (obs.type === 'cactus') {
        // Cactus graphic
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(obs.x + 8, obs.y + 4, 10, obs.h - 4);
        ctx.fillRect(obs.x + 2, obs.y + 12, 8, 6);
        ctx.fillRect(obs.x + 2, obs.y + 6, 6, 12);
        ctx.fillRect(obs.x + 16, obs.y + 16, 8, 6);
        ctx.fillRect(obs.x + 18, obs.y + 10, 6, 12);
      } else if (obs.type === 'crab') {
        // Crab graphic
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(obs.x + 14, obs.y + 12, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(obs.x + 2, obs.y + 4, 6, 6);
        ctx.fillRect(obs.x + 20, obs.y + 4, 6, 6);
      } else {
        // Surfboard graphic
        ctx.save();
        ctx.translate(obs.x + 16, obs.y + 16);
        ctx.rotate(-0.35);
        ctx.fillStyle = '#00cec9';
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff7675';
        ctx.fillRect(-6, -4, 12, 8);
        ctx.restore();
      }
    });

    // 9. Quiltro Dog (Chaser)
    this.drawDog(ctx);

    // 10. Dimas (Player)
    this.drawDimas(ctx);

    // 11. Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 12. Idle Prompt Banner
    if (this.state === 'idle') {
      const pulse = Math.sin(this.idleTimer * 0.08) * 0.2 + 0.8;
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * pulse})`;
      const boxW = Math.min(w - 40, 360);
      ctx.fillRect((w - boxW) / 2, 40, boxW, 44);
      ctx.strokeStyle = '#ffa502';
      ctx.lineWidth = 2;
      ctx.strokeRect((w - boxW) / 2, 40, boxW, 44);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ ЖМИ ПРЫЖОК / ТАП ДЛЯ СТАРТА ⚡', w / 2, 68);
      ctx.restore();
    }
  }

  drawDimas(ctx) {
    ctx.save();
    ctx.translate(this.player.x, this.player.y);

    const legAngle = this.player.isGrounded ? Math.sin(this.player.legCycle) * 0.6 : 0.8;

    // Head
    ctx.fillStyle = '#ffbe76';
    ctx.beginPath();
    ctx.arc(18, 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Red Headband
    ctx.fillStyle = '#ff4757';
    ctx.fillRect(10, 5, 16, 4);

    // Sunglasses
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(16, 8, 8, 4);

    // Cyan Torso / Shirt
    ctx.fillStyle = '#00cec9';
    ctx.fillRect(12, 18, 12, 14);

    // Legs & Blue Boardshorts
    ctx.fillStyle = '#0984e3';
    ctx.fillRect(11, 30, 14, 6);

    // Running Legs
    ctx.strokeStyle = '#ffbe76';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Leg 1
    ctx.beginPath();
    ctx.moveTo(14, 34);
    ctx.lineTo(14 + Math.sin(legAngle) * 10, 42);
    ctx.stroke();

    // Leg 2
    ctx.beginPath();
    ctx.moveTo(22, 34);
    ctx.lineTo(22 - Math.sin(legAngle) * 10, 42);
    ctx.stroke();

    // Sweat drop
    if (this.state === 'running') {
      ctx.fillStyle = '#74b9ff';
      ctx.beginPath();
      ctx.arc(30, 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shout speech bubble
    if (this.shoutText && this.state === 'running') {
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      const textW = ctx.measureText(this.shoutText).width;
      ctx.fillRect(-12, -22, textW + 12, 18);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(this.shoutText, -6, -9);
    }

    ctx.restore();
  }

  drawDog(ctx) {
    ctx.save();
    ctx.translate(this.dog.x, this.dog.y);

    const legAngle = Math.sin(this.dog.legCycle) * 0.7;

    // Dog Body
    ctx.fillStyle = '#cd6133';
    ctx.beginPath();
    ctx.ellipse(18, 16, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(28, 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Floppy Ear
    ctx.fillStyle = '#833917';
    ctx.beginPath();
    ctx.ellipse(25, 12, 3, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Snout & Teeth
    ctx.fillStyle = '#cd6133';
    ctx.fillRect(32, 8, 7, 6);
    ctx.fillStyle = '#fff';
    ctx.fillRect(35, 12, 3, 2); // Tooth!

    // Collar
    ctx.fillStyle = '#ff4757';
    ctx.fillRect(23, 11, 4, 6);

    // Wagging Tail
    ctx.strokeStyle = '#cd6133';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(4, 14);
    ctx.lineTo(-4 + Math.sin(this.dog.legCycle * 1.5) * 4, 6);
    ctx.stroke();

    // Running Paws
    ctx.strokeStyle = '#833917';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, 22);
    ctx.lineTo(12 + Math.sin(legAngle) * 8, 28);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(24, 22);
    ctx.lineTo(24 - Math.sin(legAngle) * 8, 28);
    ctx.stroke();

    // Smoke trail behind dog
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-8, 20, 4, 0, Math.PI * 2);
    ctx.arc(-16, 22, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

let beachGame = null;

function initMiniGame() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  beachGame = new BeachRunner(canvas);

  const openBtn = document.getElementById('openGameBtn');
  const mapFloatingBtn = document.getElementById('mapFloatingGameBtn');
  const mobileGameBtn = document.getElementById('mobileGameBtn');
  const closeBtn = document.getElementById('closeGameBtn');
  const restartBtn = document.getElementById('restartGameBtn');
  const modal = document.getElementById('gameModal');

  function openGame() {
    modal.classList.add('open');
    closeMobileSidebar();

    // Re-init canvas size on visible modal and start 60FPS loop immediately
    setTimeout(() => {
      beachGame.initCanvas();
      beachGame.updateHUD();
      beachGame.startLoop();
    }, 60);
  }

  function closeGame() {
    modal.classList.remove('open');
    beachGame.state = 'idle';
    beachGame.stopLoop();
  }

  if (openBtn) openBtn.addEventListener('click', openGame);
  if (mapFloatingBtn) mapFloatingBtn.addEventListener('click', openGame);
  if (mobileGameBtn) mobileGameBtn.addEventListener('click', openGame);
  if (closeBtn) closeBtn.addEventListener('click', closeGame);

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      beachGame.start();
    });
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  loadIncidents();
  initMap();
  renderSidebarList();
  setupEvents();
});
