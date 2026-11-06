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

  // Mini-Game event listeners
  initMiniGame();
}

// Mini-Game: Beach Runner (Dimas vs. Quiltro)
class BeachRunner {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.groundY = this.height - 42;

    this.state = 'idle'; // 'idle', 'running', 'gameover'
    this.distance = 0;
    this.coins = 0;
    this.pantsHp = 100;
    this.highScore = parseInt(localStorage.getItem('dimas_game_highscore') || '0', 10);

    this.speed = 4.8;
    this.gameSpeed = 4.8;
    this.animFrame = null;

    // Player (Dimas)
    this.player = {
      x: 160,
      y: this.groundY - 38,
      width: 32,
      height: 38,
      vy: 0,
      jumpCount: 0,
      maxJumps: 2,
      isGrounded: true,
      runFrame: 0,
      sweatTimer: 0
    };

    // Chaser (Quiltro Dog)
    this.dog = {
      x: 40,
      y: this.groundY - 30,
      width: 34,
      height: 28,
      targetX: 45,
      runFrame: 0,
      barkTimer: 0
    };

    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.clouds = [
      { x: 50, y: 35, speed: 0.4, size: 28 },
      { x: 280, y: 55, speed: 0.6, size: 36 },
      { x: 500, y: 30, speed: 0.5, size: 32 }
    ];

    this.spawnTimer = 0;
    this.collectibleTimer = 0;
    this.shoutTimer = 0;
    this.shoutText = '';

    this.setupInput();
  }

  setupInput() {
    // Jump trigger
    this.jumpHandler = (e) => {
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
  }

  jump() {
    if (this.player.jumpCount < this.player.maxJumps) {
      this.player.vy = -10.5;
      this.player.jumpCount++;
      this.player.isGrounded = false;
      sound.playJump();

      // Jump dust
      for (let i = 0; i < 4; i++) {
        this.particles.push({
          x: this.player.x + 8,
          y: this.groundY - 2,
          vx: (Math.random() - 0.5) * 3 - 2,
          vy: -Math.random() * 2,
          size: Math.random() * 4 + 2,
          color: '#e0af68',
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
    this.gameSpeed = 4.8;
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.spawnTimer = 40;
    this.dog.x = 45;
    this.dog.targetX = 45;

    document.getElementById('gameOverlayMsg').style.display = 'none';
    document.getElementById('gameStartScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';

    this.updateHUD();
    sound.playBark();

    if (!this.animFrame) {
      this.loop = this.loop.bind(this);
      this.animFrame = requestAnimationFrame(this.loop);
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

    document.getElementById('gameOverStats').textContent = 
      `Димас пробежал: ${Math.floor(this.distance)} м • Съедено эмпанадас: ${this.coins} 🥟`;

    const verdicts = [
      '«Штаны спасти не удалось, но скорость бега была космической!»',
      '«Пёс сыт, штаны в лоскуты, Димас уже на базе в Сантьяго!»',
      '«Спринтерский рывок года! Чили аплодирует стоя!»',
      '«Псина включила режим перехватчика и настигла добычу!»'
    ];
    document.getElementById('gameOverVerdict').textContent = 
      verdicts[Math.floor(Math.random() * verdicts.length)];

    document.getElementById('gameOverlayMsg').style.display = 'flex';
    document.getElementById('gameStartScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'flex';
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
    if (this.state === 'running') {
      this.update();
    }
    this.render();

    this.animFrame = requestAnimationFrame(this.loop);
  }

  update() {
    // Increase distance and difficulty
    this.distance += this.gameSpeed * 0.05;
    this.gameSpeed = Math.min(10.5, 4.8 + this.distance * 0.007);
    this.updateHUD();

    // Gravity & Jump Physics
    this.player.vy += 0.58; // Gravity
    this.player.y += this.player.vy;

    if (this.player.y >= this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height;
      this.player.vy = 0;
      this.player.jumpCount = 0;
      this.player.isGrounded = true;
    }

    // Run animation frames
    this.player.runFrame += 0.25;
    this.dog.runFrame += 0.3;

    // Dog position catch-up logic
    if (this.dog.targetX > 45) {
      this.dog.targetX -= 0.15; // Slowly fallback if safe
    }
    this.dog.x += (this.dog.targetX - this.dog.x) * 0.08;

    // Shouting jokes
    this.shoutTimer++;
    if (this.shoutTimer > 180) {
      this.shoutTimer = 0;
      const shouts = ['¡Tranquilo, perrito!', '39 км/ч!', 'Спасите штаны!', 'Беги, Димас!'];
      this.shoutText = shouts[Math.floor(Math.random() * shouts.length)];
    }

    // Spawn Obstacles (Cactus, Crab, Surfboard)
    this.spawnTimer--;
    if (this.spawnTimer <= 0) {
      const types = [
        { type: 'cactus', emoji: '🌵', w: 26, h: 36, yOff: 36 },
        { type: 'crab', emoji: '🦀', w: 28, h: 22, yOff: 22 },
        { type: 'board', emoji: '🏄‍♂️', w: 32, h: 30, yOff: 30 }
      ];
      const chosen = types[Math.floor(Math.random() * types.length)];
      this.obstacles.push({
        x: this.width + 20,
        y: this.groundY - chosen.yOff,
        w: chosen.w,
        h: chosen.h,
        emoji: chosen.emoji
      });
      // Spawn interval based on current speed
      this.spawnTimer = Math.floor(Math.random() * 45 + 55 / (this.gameSpeed / 4.8));
    }

    // Spawn Collectibles (Empanadas)
    this.collectibleTimer--;
    if (this.collectibleTimer <= 0) {
      this.collectibles.push({
        x: this.width + 30,
        y: this.groundY - Math.random() * 65 - 35,
        w: 24,
        h: 24,
        emoji: '🥟'
      });
      this.collectibleTimer = Math.floor(Math.random() * 120 + 90);
    }

    // Move & collide obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.gameSpeed;

      // Check collision with player
      if (this.checkCollision(this.player, obs)) {
        this.obstacles.splice(i, 1);
        this.pantsHp -= 35;
        this.dog.targetX += 38; // Dog lunges closer!
        sound.playBark();

        // Hit particles
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

        if (this.pantsHp <= 0 || this.dog.x >= this.player.x - 20) {
          this.gameOver();
          return;
        }
        continue;
      }

      if (obs.x < -40) {
        this.obstacles.splice(i, 1);
      }
    }

    // Move & collect items
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      item.x -= this.gameSpeed;

      if (this.checkCollision(this.player, item)) {
        this.collectibles.splice(i, 1);
        this.coins++;
        this.distance += 25; // Bonus boost!
        sound.playCoin();

        // Sparkle particles
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

    // Move particles
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

    // 1. Sky & Chilean Sunset Gradient
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
    ctx.arc(w * 0.72, h * 0.45, 34, 0, Math.PI * 2);
    ctx.fill();

    // 3. Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    this.clouds.forEach(c => {
      c.x -= c.speed;
      if (c.x < -60) c.x = w + 40;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 0.5, 0, Math.PI * 2);
      ctx.arc(c.x + 14, c.y - 6, c.size * 0.6, 0, Math.PI * 2);
      ctx.arc(c.x + 28, c.y, c.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Distant Coastal Cliffs
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

    const waveOffset = (Date.now() * 0.003 * this.gameSpeed) % 40;
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
      ctx.fillRect(x - streakOffset, this.groundY + 14, 18, 3);
      ctx.fillRect(x - streakOffset + 25, this.groundY + 26, 12, 2.5);
    }

    // 7. Collectibles (Empanadas)
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    this.collectibles.forEach(item => {
      ctx.fillText(item.emoji, item.x + item.w / 2, item.y + item.h);
    });

    // 8. Obstacles (Cactus, Crab, Surfboard)
    this.obstacles.forEach(obs => {
      ctx.font = `${obs.h * 0.9}px sans-serif`;
      ctx.fillText(obs.emoji, obs.x + obs.w / 2, obs.y + obs.h - 2);
    });

    // 9. Quiltro Dog (Chaser)
    ctx.save();
    ctx.translate(this.dog.x, this.dog.y);
    ctx.font = '32px sans-serif';
    ctx.fillText('🐕', 16, 26);
    // Smoke dust behind dog
    ctx.font = '16px sans-serif';
    ctx.fillText('💨', -8, 24);
    ctx.restore();

    // 10. Dimas (Player)
    ctx.save();
    ctx.translate(this.player.x, this.player.y);

    ctx.font = '36px sans-serif';
    ctx.fillText('🏃‍♂️', 16, 34);

    // Sweat drop when running
    if (this.state === 'running') {
      ctx.font = '14px sans-serif';
      ctx.fillText('💦', 30, 8);
    }

    // Speech bubble
    if (this.shoutText && this.state === 'running') {
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(-15, -24, ctx.measureText(this.shoutText).width + 12, 18);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(this.shoutText, -9, -11);
    }
    ctx.restore();

    // 11. Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

let beachGame = null;

function initMiniGame() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  beachGame = new BeachRunner(canvas);

  const openBtn = document.getElementById('openGameBtn');
  const mapOpenBtn = document.getElementById('mapOpenGameBtn');
  const closeBtn = document.getElementById('closeGameBtn');
  const startBtn = document.getElementById('startGameBtn');
  const restartBtn = document.getElementById('restartGameBtn');
  const modal = document.getElementById('gameModal');

  function openGame() {
    modal.classList.add('open');
    closeMobileSidebar();
    beachGame.updateHUD();
    beachGame.render();
  }

  function closeGame() {
    modal.classList.remove('open');
    beachGame.state = 'idle';
  }

  if (openBtn) openBtn.addEventListener('click', openGame);
  if (mapOpenBtn) mapOpenBtn.addEventListener('click', openGame);
  if (closeBtn) closeBtn.addEventListener('click', closeGame);

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      beachGame.start();
    });
  }

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
