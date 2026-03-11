const STORAGE_KEY = 'selectedKanazawaSpot';
const ARRIVAL_DISTANCE_METERS = 150;
const DEFAULT_MAP_CENTER = [36.561325, 136.656205];
const DEFAULT_MAP_ZOOM = 15;
const RENDER_PRESET_STORAGE_KEY = 'selectedMapRenderPreset';
const COLOR_THEME_STORAGE_KEY = 'selectedColorTheme';
const DEFAULT_RENDER_PRESET = 'balanced';
const DEFAULT_COLOR_THEME = 'dark';
const AVAILABLE_COLOR_THEMES = ['dark', 'light'];
const FIXED_RENDER_PRESET = 'balanced';
const FIXED_COLOR_THEME = 'dark';
const RENDER_PRESETS = {
  light: {
    label: '軽量',
    tileLayer: {
      url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      options: { subdomains: 'abcd' }
    },
    mapOptions: {
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
      inertia: false,
      wheelDebounceTime: 70
    },
    tileOptions: {
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 1
    },
    markerStyles: {
      active: { color: '#72808c', fillColor: '#9fb2c3', fillOpacity: 0.9 },
      inactive: { color: '#5b6873', fillColor: '#7f93a3', fillOpacity: 0.68 }
    }
  },
  balanced: {
    label: '標準',
    tileLayer: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      options: { subdomains: 'abcd' }
    },
    mapOptions: {
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      inertia: true,
      wheelDebounceTime: 45
    },
    tileOptions: {
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2
    },
    markerStyles: {
      active: { color: '#4d9fd0', fillColor: '#6dd4ff', fillOpacity: 0.94 },
      inactive: { color: '#5d7082', fillColor: '#8ea2b2', fillOpacity: 0.7 }
    }
  },
  anime: {
    label: 'アニメ重視',
    tileLayer: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      options: { subdomains: 'abcd' }
    },
    mapOptions: {
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      inertia: true,
      wheelDebounceTime: 40
    },
    tileOptions: {
      updateWhenIdle: false,
      updateWhenZooming: true,
      keepBuffer: 3
    },
    markerStyles: {
      active: { color: '#7e78ff', fillColor: '#52cbff', fillOpacity: 0.96 },
      inactive: { color: '#5d7082', fillColor: '#8ea2b2', fillOpacity: 0.7 }
    }
  }
};

const kanazawaMapSpots = [
  {
    name: '金沢駅',
    latlng: [36.578043, 136.648402],
    note: '北陸の玄関口。'
  },
  {
    name: '兼六園',
    latlng: [36.562427, 136.662355],
    note: '金沢を代表する名園。'
  },
  {
    name: '近江町市場',
    latlng: [36.570691, 136.656955],
    note: '海鮮グルメで有名な市場。'
  },
  {
    name: 'ひがし茶屋街',
    latlng: [36.572556, 136.666676],
    note: '歴史ある町並みの観光地。',
    labelDirection: 'right',
    labelOffset: [10, -2]
  },
  {
    name: '武家屋敷',
    latlng: [36.563845, 136.649993],
    note: '長町の土塀が残る武家屋敷エリア。'
  },
  {
    name: '金沢21世紀美術館',
    latlng: [36.560838, 136.65821],
    note: '現代アートで人気の美術館。'
  },
  {
    name: '金沢中央卸売市場',
    latlng: [36.585847, 136.632086],
    note: '新鮮な魚介が集まる中央市場。',
    labelDirection: 'right',
    labelOffset: [12, -1]
  },
  {
    name: '西茶屋街',
    latlng: [36.557656, 136.647448],
    note: '風情ある茶屋建築が残る街並み。',
    labelDirection: 'right',
    labelOffset: [12, -2]
  },
  {
    name: '金沢城',
    latlng: [36.565601, 136.659575],
    note: '加賀藩ゆかりの名城。',
    labelDirection: 'left',
    labelOffset: [-12, -2]
  },
  {
    name: '卯辰山',
    latlng: [36.573001, 136.678089],
    note: '市街地を望む眺望スポット。',
    labelDirection: 'right',
    labelOffset: [12, -2]
  },
  {
    name: 'ヤマト・麴バーク',
    latlng: [36.613637, 136.608189],
    note: '発酵文化を体験できる人気施設。',
    labelDirection: 'right',
    labelOffset: [12, -2]
  },
  {
    name: '妙立寺(忍者寺)',
    latlng: [36.555379, 136.649029],
    note: '仕掛けで知られる寺院。',
    labelDirection: 'right',
    labelOffset: [12, -2]
  }
];

const MAJOR_ROADS = [
  {
    name: '百万石通り',
    type: 'primary',
    points: [
      [36.555379, 136.649029],
      [36.560838, 136.65821],
      [36.565601, 136.659575],
      [36.570691, 136.656955],
      [36.572556, 136.666676]
    ]
  },
  {
    name: '駅前幹線',
    type: 'primary',
    points: [
      [36.577319, 136.647278],
      [36.5765, 136.6524],
      [36.570691, 136.656955]
    ]
  },
  {
    name: '市場アクセス',
    type: 'secondary',
    points: [
      [36.577319, 136.647278],
      [36.5822, 136.6394],
      [36.585847, 136.632086]
    ]
  },
  {
    name: '中心市街回遊',
    type: 'secondary',
    points: [
      [36.557656, 136.647448],
      [36.563845, 136.649993],
      [36.565601, 136.659575]
    ]
  },
  {
    name: '卯辰山アクセス',
    type: 'connector',
    points: [
      [36.570691, 136.656955],
      [36.572556, 136.666676],
      [36.573001, 136.678089]
    ]
  },
  {
    name: '北部アクセス',
    type: 'connector',
    points: [
      [36.585847, 136.632086],
      [36.596, 136.62],
      [36.606, 136.613],
      [36.613637, 136.608189]
    ]
  }
];
const SHOW_MAJOR_ROADS = false;

function getStoredSpot() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    return null;
  }
}

function setStoredSpot(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch (_) {
    // storage unavailable
  }
}

function getStoredRenderPreset() {
  try {
    return localStorage.getItem(RENDER_PRESET_STORAGE_KEY);
  } catch (_) {
    return null;
  }
}

function setStoredRenderPreset(value) {
  try {
    localStorage.setItem(RENDER_PRESET_STORAGE_KEY, value);
  } catch (_) {
    // storage unavailable
  }
}

function getStoredColorTheme() {
  try {
    return localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  } catch (_) {
    return null;
  }
}

function setStoredColorTheme(value) {
  try {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, value);
  } catch (_) {
    // storage unavailable
  }
}

function getRenderPresetConfig() {
  return RENDER_PRESETS[currentRenderPreset] || RENDER_PRESETS[DEFAULT_RENDER_PRESET];
}

function buildCartoNoLabelTile(stylePath) {
  return {
    url: `https://{s}.basemaps.cartocdn.com/${stylePath}/{z}/{x}/{y}{r}.png`,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    options: { subdomains: 'abcd' }
  };
}

function getTileLayerConfigForCurrentTheme(preset) {
  const presetTile = preset.tileLayer || {};
  if (currentColorTheme === 'light') {
    return buildCartoNoLabelTile('light_nolabels');
  }
  if (currentRenderPreset === 'anime') {
    return buildCartoNoLabelTile('dark_nolabels');
  }
  if (currentRenderPreset === 'balanced') {
    return buildCartoNoLabelTile('rastertiles/voyager_nolabels');
  }
  return presetTile;
}

let selectedArea = getStoredSpot() || kanazawaMapSpots[0].name;
let activeSpotIndex = Math.max(
  0,
  kanazawaMapSpots.findIndex(spot => spot.name === selectedArea)
);
let currentRenderPreset = FIXED_RENDER_PRESET;
let currentColorTheme = FIXED_COLOR_THEME;

const elements = {
  mapCanvas: document.getElementById('goMap'),
  mapSettingsMenu: document.getElementById('mapSettingsMenu'),
  selectedAreaText: document.getElementById('selectedAreaText'),
  gpsStatusText: document.getElementById('gpsStatusText'),
  openSettingsModalBtn: document.getElementById('openSettingsModalBtn'),
  renderPresetSelect: document.getElementById('renderPresetSelect'),
  colorThemeSelect: document.getElementById('colorThemeSelect'),
  coordinateInput: document.getElementById('coordinateInput'),
  applyCoordinateBtn: document.getElementById('applyCoordinateBtn'),
  enterQuizBtn: document.getElementById('enterQuizBtn'),
  settingsModal: document.getElementById('settingsModal'),
  settingsModalBackdrop: document.getElementById('settingsModalBackdrop'),
  closeSettingsModalBtn: document.getElementById('closeSettingsModalBtn'),
  quizModal: document.getElementById('quizModal'),
  quizModalBackdrop: document.getElementById('quizModalBackdrop'),
  closeQuizModalBtn: document.getElementById('closeQuizModalBtn'),
  quizModalFrame: document.getElementById('quizModalFrame')
};

let mapInstance = null;
let spotLayers = [];
let majorRoadLayers = [];
let userLocationMarker = null;
let userAccuracyCircle = null;
let lastUserPosition = null;
let activeSpotAuraRing = null;
let activeSpotAuraGlow = null;

function updateSelectedAreaText() {
  elements.selectedAreaText.textContent = `選択エリア: ★ ${selectedArea}`;
}

function setGpsStatus(text, state = '') {
  if (!elements.gpsStatusText) return;
  elements.gpsStatusText.textContent = text;
  elements.gpsStatusText.className = `map-gps-status ${state}`.trim();
}

function applyRenderModeClass() {
  document.body.dataset.renderMode = currentRenderPreset;
}

function applyColorTheme(theme, persist = true, refreshMap = true) {
  currentColorTheme = FIXED_COLOR_THEME;
  document.body.dataset.theme = currentColorTheme;
  if (persist) {
    setStoredColorTheme(currentColorTheme);
  }
  if (refreshMap && mapInstance) {
    initKanazawaMap({ preserveView: true });
  }
}

function getMajorRoadPalette() {
  if (currentColorTheme === 'light') {
    return {
      primary: { main: '#d64f6a', glow: '#ff9cb0' },
      secondary: { main: '#2d7ed1', glow: '#8cc6ff' },
      connector: { main: '#3f9a65', glow: '#95e0b0' }
    };
  }
  return {
    primary: { main: '#ff6a82', glow: '#ff7db2' },
    secondary: { main: '#5eb8ff', glow: '#6be2ff' },
    connector: { main: '#6de0a4', glow: '#8ff0bd' }
  };
}

function clearMajorRoadLayers() {
  if (!mapInstance) return;
  majorRoadLayers.forEach(layer => {
    mapInstance.removeLayer(layer);
  });
  majorRoadLayers = [];
}

function drawMajorRoadLayers() {
  if (!mapInstance || typeof window.L === 'undefined') return;
  clearMajorRoadLayers();
  if (!SHOW_MAJOR_ROADS) return;

  if (!mapInstance.getPane('majorRoadGlowPane')) {
    mapInstance.createPane('majorRoadGlowPane');
    mapInstance.getPane('majorRoadGlowPane').style.zIndex = '330';
    mapInstance.getPane('majorRoadGlowPane').style.pointerEvents = 'none';
  }
  if (!mapInstance.getPane('majorRoadPane')) {
    mapInstance.createPane('majorRoadPane');
    mapInstance.getPane('majorRoadPane').style.zIndex = '340';
    mapInstance.getPane('majorRoadPane').style.pointerEvents = 'none';
  }

  const palette = getMajorRoadPalette();
  const isAnimeMode = currentRenderPreset === 'anime';

  MAJOR_ROADS.forEach(road => {
    const roadColors = palette[road.type] || palette.secondary;
    const glowWidth = road.type === 'primary' ? 12 : road.type === 'secondary' ? 9 : 7;
    const lineWidth = road.type === 'primary' ? 6 : road.type === 'secondary' ? 4.5 : 3.5;

    const glowLayer = window.L.polyline(road.points, {
      pane: 'majorRoadGlowPane',
      color: roadColors.glow,
      opacity: isAnimeMode ? 0.35 : 0.22,
      weight: glowWidth,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false
    }).addTo(mapInstance);

    const lineLayer = window.L.polyline(road.points, {
      pane: 'majorRoadPane',
      color: roadColors.main,
      opacity: isAnimeMode ? 0.96 : 0.88,
      weight: lineWidth,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: road.type === 'connector' ? '7 6' : null,
      interactive: false
    }).addTo(mapInstance);

    majorRoadLayers.push(glowLayer, lineLayer);
  });
}

function getSpotMarkerStyle(isActive) {
  const preset = getRenderPresetConfig();
  const modeStyle = isActive ? preset.markerStyles.active : preset.markerStyles.inactive;
  return {
    radius: isActive ? 10 : 7,
    color: modeStyle.color,
    fillColor: modeStyle.fillColor,
    fillOpacity: modeStyle.fillOpacity,
    weight: 2,
    className: 'map-spot-marker'
  };
}

function updateSpotMarkerClasses() {
  spotLayers.forEach((layer, i) => {
    const markerElement = layer.getElement();
    if (!markerElement) return;
    markerElement.classList.add('map-spot-marker');
    markerElement.classList.toggle('is-active', i === activeSpotIndex);
    markerElement.classList.toggle('is-inactive', i !== activeSpotIndex);

    const tooltipElement = layer.getTooltip()?.getElement();
    if (!tooltipElement) return;
    tooltipElement.classList.add('tourist-spot-label');
    tooltipElement.classList.toggle('is-active', i === activeSpotIndex);
    tooltipElement.classList.toggle('is-inactive', i !== activeSpotIndex);
  });
}

function clearActiveSpotAura() {
  if (!mapInstance) return;
  if (activeSpotAuraRing) {
    mapInstance.removeLayer(activeSpotAuraRing);
    activeSpotAuraRing = null;
  }
  if (activeSpotAuraGlow) {
    mapInstance.removeLayer(activeSpotAuraGlow);
    activeSpotAuraGlow = null;
  }
}

function updateActiveSpotAura() {
  if (!mapInstance) return;
  if (currentRenderPreset !== 'anime') {
    clearActiveSpotAura();
    return;
  }

  const activeSpot = kanazawaMapSpots[activeSpotIndex];
  if (!activeSpot) return;

  const zoom = mapInstance.getZoom();
  const ringRadius = Math.max(90, 220 - zoom * 8);
  const glowRadius = Math.max(150, ringRadius * 1.8);

  if (!activeSpotAuraRing) {
    activeSpotAuraRing = window.L.circle(activeSpot.latlng, {
      radius: ringRadius,
      color: '#7fc8ff',
      fillColor: '#7fc8ff',
      fillOpacity: 0.08,
      weight: 2,
      interactive: false,
      className: 'map-spot-aura'
    }).addTo(mapInstance);
  } else {
    activeSpotAuraRing.setLatLng(activeSpot.latlng);
    activeSpotAuraRing.setRadius(ringRadius);
  }

  if (!activeSpotAuraGlow) {
    activeSpotAuraGlow = window.L.circle(activeSpot.latlng, {
      radius: glowRadius,
      color: '#8e80ff',
      fillColor: '#8e80ff',
      fillOpacity: 0.05,
      weight: 1,
      interactive: false,
      className: 'map-spot-aura-soft'
    }).addTo(mapInstance);
  } else {
    activeSpotAuraGlow.setLatLng(activeSpot.latlng);
    activeSpotAuraGlow.setRadius(glowRadius);
  }

  activeSpotAuraGlow.bringToBack();
  activeSpotAuraRing.bringToBack();
}

function buildSpotPopupContent(spot) {
  return `
    <div class="map-popup-card">
      <span class="map-popup-icon" aria-hidden="true">★</span>
      <div class="map-popup-body">
        <strong class="map-popup-title">${spot.name}</strong>
        <p class="map-popup-note">${spot.note}</p>
      </div>
    </div>
  `;
}

function setActiveMapSpot(index, openPopup = true) {
  activeSpotIndex = index;
  selectedArea = kanazawaMapSpots[index].name;
  updateSelectedAreaText();

  spotLayers.forEach((layer, i) => {
    const isActive = i === index;
    layer.setStyle(getSpotMarkerStyle(isActive));
  });
  updateSpotMarkerClasses();
  updateActiveSpotAura();

  if (openPopup) {
    spotLayers[index].openPopup();
  }
}

function getNearestSpotIndex(latlng) {
  let nearestIndex = 0;
  let minDistance = Infinity;

  kanazawaMapSpots.forEach((spot, index) => {
    const dLat = latlng.lat - spot.latlng[0];
    const dLng = latlng.lng - spot.latlng[1];
    const distance = dLat * dLat + dLng * dLng;
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

function calculateDistanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = value => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function formatDistance(distanceMeters) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(2)}km`;
  }
  return `${Math.round(distanceMeters)}m`;
}

function showArrivalQuizPopup(spotName) {
  const shouldStartQuiz = window.confirm(
    `${spotName}に到着しました。\nクイズでポイントがもらえますけどどうしますか？\n\nOK: 開始する\nキャンセル: マップに戻る`
  );

  if (shouldStartQuiz) {
    goToQuizPage();
  }
}

function initKanazawaMap({ preserveView = false } = {}) {
  if (!elements.mapCanvas) return;

  if (typeof window.L === 'undefined') {
    if (elements.enterQuizBtn) {
      elements.enterQuizBtn.disabled = true;
    }
    elements.selectedAreaText.textContent = '地図を読み込めませんでした。ネット接続を確認してください。';
    return;
  }

  const preset = getRenderPresetConfig();
  const previousView = preserveView && mapInstance
    ? {
        center: mapInstance.getCenter(),
        zoom: mapInstance.getZoom()
      }
    : null;

  if (mapInstance) {
    mapInstance.off();
    mapInstance.remove();
    mapInstance = null;
    spotLayers = [];
    majorRoadLayers = [];
    userLocationMarker = null;
    userAccuracyCircle = null;
    activeSpotAuraRing = null;
    activeSpotAuraGlow = null;
  }

  mapInstance = window.L.map(elements.mapCanvas, {
    center: DEFAULT_MAP_CENTER,
    zoom: DEFAULT_MAP_ZOOM,
    minZoom: 3,
    maxZoom: 17,
    ...preset.mapOptions
  });

  const tileLayerConfig = getTileLayerConfigForCurrentTheme(preset);
  window.L.tileLayer(
    tileLayerConfig.url || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: tileLayerConfig.attribution || '&copy; OpenStreetMap contributors',
      ...(tileLayerConfig.options || {}),
      ...preset.tileOptions
    }
  ).addTo(mapInstance);

  drawMajorRoadLayers();

  spotLayers = kanazawaMapSpots.map((spot, index) => {
    const marker = window.L.circleMarker(spot.latlng, getSpotMarkerStyle(false)).addTo(mapInstance);

    marker.bindPopup(buildSpotPopupContent(spot), {
      className: 'map-popup-anime',
      closeButton: false
    });
    marker.bindTooltip(spot.name, {
      permanent: true,
      direction: spot.labelDirection || 'top',
      offset: spot.labelOffset || [0, -14],
      className: 'tourist-spot-label',
      opacity: 1
    });
    marker.on('click', () => {
      setActiveMapSpot(index, true);
    });

    return marker;
  });

  setActiveMapSpot(activeSpotIndex, false);

  mapInstance.on('click', event => {
    const nearestIndex = getNearestSpotIndex(event.latlng);
    setActiveMapSpot(nearestIndex, true);
  });
  mapInstance.on('zoomend', () => {
    updateActiveSpotAura();
  });

  setTimeout(() => {
    mapInstance.invalidateSize();
    if (previousView) {
      mapInstance.setView(previousView.center, previousView.zoom);
    } else {
      mapInstance.setView(kanazawaMapSpots[activeSpotIndex].latlng, DEFAULT_MAP_ZOOM);
    }

    if (lastUserPosition) {
      placeUserLocationMarker(
        lastUserPosition.lat,
        lastUserPosition.lng,
        lastUserPosition.accuracy,
        lastUserPosition.label
      );
    }

    updateSpotMarkerClasses();
    updateActiveSpotAura();
  }, 0);
}

function applyRenderPreset(presetId, showStatus = false) {
  if (!RENDER_PRESETS[FIXED_RENDER_PRESET]) return;

  currentRenderPreset = FIXED_RENDER_PRESET;
  setStoredRenderPreset(currentRenderPreset);
  applyRenderModeClass();
  initKanazawaMap({ preserveView: true });

  if (showStatus) {
    setGpsStatus(`描画設定は「${RENDER_PRESETS[currentRenderPreset].label}」固定です。`, 'success');
  }
}

function placeUserLocationMarker(lat, lng, accuracy = 0, label = '入力座標') {
  if (!mapInstance || typeof window.L === 'undefined') return;
  lastUserPosition = { lat, lng, accuracy, label };

  if (userLocationMarker) {
    mapInstance.removeLayer(userLocationMarker);
  }
  if (userAccuracyCircle) {
    mapInstance.removeLayer(userAccuracyCircle);
  }

  userLocationMarker = window.L.circleMarker([lat, lng], {
    radius: 6,
    color: '#f5f8fa',
    fillColor: '#1da1f2',
    fillOpacity: 1,
    weight: 2,
    className: 'map-user-marker'
  }).addTo(mapInstance);

  userLocationMarker.bindPopup(
    `<div class="map-popup-card">
      <span class="map-popup-icon" aria-hidden="true">◎</span>
      <div class="map-popup-body">
        <strong class="map-popup-title">${label}</strong>
        <p class="map-popup-note">${lat.toFixed(5)}, ${lng.toFixed(5)}</p>
      </div>
    </div>`,
    {
      className: 'map-popup-anime',
      closeButton: false
    }
  );

  userAccuracyCircle = window.L.circle([lat, lng], {
    radius: Math.max(accuracy, 30),
    color: '#1da1f2',
    fillColor: '#1da1f2',
    fillOpacity: 0.12,
    weight: 1
  }).addTo(mapInstance);
}

function parseCoordinateInput(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const values = value.match(/-?\d+(?:\.\d+)?/g);
  if (!values || values.length < 2) {
    return null;
  }

  const lat = Number(values[0]);
  const lng = Number(values[1]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
}

function applyCoordinateInput() {
  if (!elements.coordinateInput) {
    return;
  }

  const rawValue = elements.coordinateInput.value.trim();
  if (!rawValue) {
    setGpsStatus('座標を入力してください。', 'error');
    return;
  }

  const coordinate = parseCoordinateInput(rawValue);
  if (!coordinate) {
    setGpsStatus('座標の形式が正しくありません。例: 36.561325, 136.656205', 'error');
    return;
  }

  const { lat, lng } = coordinate;
  placeUserLocationMarker(lat, lng, 0, '入力座標');

  if (mapInstance) {
    mapInstance.setView([lat, lng], 15);
  }

  const nearestIndex = getNearestSpotIndex({ lat, lng });
  const nearestSpot = kanazawaMapSpots[nearestIndex];
  const distanceMeters = calculateDistanceMeters(
    lat,
    lng,
    nearestSpot.latlng[0],
    nearestSpot.latlng[1]
  );
  setActiveMapSpot(nearestIndex, true);

  if (distanceMeters <= ARRIVAL_DISTANCE_METERS) {
    setGpsStatus(
      `入力座標: ${lat.toFixed(5)}, ${lng.toFixed(5)}（${nearestSpot.name} に到着判定）`,
      'success'
    );
    showArrivalQuizPopup(nearestSpot.name);
    return;
  }

  setGpsStatus(
    `入力座標: ${lat.toFixed(5)}, ${lng.toFixed(5)}（最寄り: ${nearestSpot.name} / 約${formatDistance(distanceMeters)}離れています）`,
    ''
  );
}

function openSettingsModal() {
  if (!elements.settingsModal) return;
  if (elements.mapSettingsMenu) {
    elements.mapSettingsMenu.open = false;
  }
  elements.settingsModal.classList.remove('hidden');
  document.body.classList.add('settings-modal-open');
}

function closeSettingsModal() {
  if (!elements.settingsModal) return;
  elements.settingsModal.classList.add('hidden');
  document.body.classList.remove('settings-modal-open');
}

function closeQuizModal() {
  if (!elements.quizModal) return;
  elements.quizModal.classList.add('hidden');
  document.body.classList.remove('quiz-modal-open');
  if (elements.quizModalFrame) {
    elements.quizModalFrame.src = 'about:blank';
  }
}

function openQuizModal() {
  setStoredSpot(selectedArea);
  if (!elements.quizModal || !elements.quizModalFrame) {
    window.location.href = 'quiz.html';
    return;
  }

  elements.quizModal.classList.remove('hidden');
  document.body.classList.add('quiz-modal-open');
  elements.quizModalFrame.src = 'about:blank';
  elements.quizModalFrame.src = `quiz.html?popup=1&t=${Date.now()}`;
}

function goToQuizPage() {
  openQuizModal();
}

updateSelectedAreaText();
applyColorTheme(currentColorTheme, false, false);
applyRenderModeClass();
initKanazawaMap();
if (elements.renderPresetSelect) {
  elements.renderPresetSelect.value = currentRenderPreset;
  elements.renderPresetSelect.addEventListener('change', event => {
    applyRenderPreset(event.target.value, true);
  });
}
if (elements.colorThemeSelect) {
  elements.colorThemeSelect.value = currentColorTheme;
  elements.colorThemeSelect.addEventListener('change', event => {
    applyColorTheme(event.target.value);
  });
}
if (elements.openSettingsModalBtn) {
  elements.openSettingsModalBtn.addEventListener('click', openSettingsModal);
}
if (elements.coordinateInput) {
  const activeSpot = kanazawaMapSpots[activeSpotIndex];
  elements.coordinateInput.value = `${activeSpot.latlng[0]}, ${activeSpot.latlng[1]}`;
  elements.coordinateInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyCoordinateInput();
    }
  });
}
if (elements.applyCoordinateBtn) {
  elements.applyCoordinateBtn.addEventListener('click', applyCoordinateInput);
}
if (elements.closeSettingsModalBtn) {
  elements.closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
}
if (elements.settingsModalBackdrop) {
  elements.settingsModalBackdrop.addEventListener('click', closeSettingsModal);
}
if (elements.closeQuizModalBtn) {
  elements.closeQuizModalBtn.addEventListener('click', closeQuizModal);
}
if (elements.quizModalBackdrop) {
  elements.quizModalBackdrop.addEventListener('click', closeQuizModal);
}

window.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;

  if (elements.settingsModal && !elements.settingsModal.classList.contains('hidden')) {
    closeSettingsModal();
    return;
  }
  if (elements.quizModal && !elements.quizModal.classList.contains('hidden')) {
    closeQuizModal();
  }
});

window.addEventListener('message', event => {
  if (event.data === 'close-quiz-popup') {
    closeQuizModal();
  }
});
