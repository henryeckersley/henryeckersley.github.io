const ATLANTA_CENTER = [-84.388, 33.749];

const shows = [
  {
    id: 'atl-001',
    band: 'Static Summer',
    title: 'Virginia-Highland Garage Set',
    genre: 'Indie Rock',
    neighborhood: 'Virginia-Highland',
    age: 'all',
    price: 8,
    date: 'Fri · 7:30 PM',
    distance: 2.1,
    approxLocation: 'Near N Highland Ave',
    exactLocation: 'Shared after host approval',
    hostNote: 'DIY backyard lights + local food popups.',
    capacity: 70,
    claimed: 45,
    lngLat: [-84.354, 33.779]
  },
  {
    id: 'atl-002',
    band: 'Homework Riot',
    title: 'Decatur Punk Session',
    genre: 'Pop Punk',
    neighborhood: 'Decatur',
    age: '16+',
    price: 12,
    date: 'Sat · 8:00 PM',
    distance: 5.4,
    approxLocation: 'Near Decatur Square',
    exactLocation: 'Shared after host approval',
    hostNote: 'Student bands and short sets every 20 min.',
    capacity: 90,
    claimed: 72,
    lngLat: [-84.296, 33.775]
  },
  {
    id: 'atl-003',
    band: 'Neon Hollow',
    title: 'Little Five Lo-Fi Night',
    genre: 'Dream Pop',
    neighborhood: 'Little Five Points',
    age: 'all',
    price: 5,
    date: 'Sun · 6:30 PM',
    distance: 3.3,
    approxLocation: 'Near Euclid Ave',
    exactLocation: 'Shared after host approval',
    hostNote: 'Smaller room, acoustic first half.',
    capacity: 48,
    claimed: 29,
    lngLat: [-84.349, 33.765]
  },
  {
    id: 'atl-004',
    band: 'Southbound Sleepers',
    title: 'Grant Park Porch Tapes',
    genre: 'Indie Folk',
    neighborhood: 'Grant Park',
    age: '16+',
    price: 10,
    date: 'Sat · 7:00 PM',
    distance: 4.9,
    approxLocation: 'Near Grant Park',
    exactLocation: 'Shared after host approval',
    hostNote: 'Bring blankets, seated setup.',
    capacity: 60,
    claimed: 38,
    lngLat: [-84.372, 33.737]
  },
  {
    id: 'atl-005',
    band: 'Hall Pass Echo',
    title: 'Candler Park Pop-Up',
    genre: 'Alt Pop',
    neighborhood: 'Candler Park',
    age: 'all',
    price: 0,
    date: 'Thu · 6:00 PM',
    distance: 2.7,
    approxLocation: 'Candler Park rec area',
    exactLocation: 'Shared after host approval',
    hostNote: 'Free show sponsored by student arts.',
    capacity: 140,
    claimed: 104,
    lngLat: [-84.340, 33.763]
  },
  {
    id: 'atl-006',
    band: 'Bent Antenna',
    title: 'EAV Late Alt Set',
    genre: 'Alt Rock',
    neighborhood: 'East Atlanta Village',
    age: '21+',
    price: 15,
    date: 'Fri · 9:00 PM',
    distance: 6.6,
    approxLocation: 'Near Flat Shoals',
    exactLocation: 'Shared after host approval + age check',
    hostNote: 'ID check required before final entry details.',
    capacity: 115,
    claimed: 98,
    lngLat: [-84.348, 33.739]
  }
];

const state = {
  radius: 6,
  budget: 20,
  genres: new Set(),
  allAgesOnly: false,
  hide21: false,
  selectedId: null,
  rsvp: JSON.parse(localStorage.getItem('underground-rsvp') || '{}'),
  markers: new Map(),
  map: null,
  mapReady: false,
  extrusionEnabled: true
};

const ui = {
  summaryPill: document.getElementById('summaryPill'),
  radiusPill: document.getElementById('radiusPill'),
  cardRail: document.getElementById('cardRail'),
  genreFilters: document.getElementById('genreFilters'),
  radiusRange: document.getElementById('radiusRange'),
  budgetRange: document.getElementById('budgetRange'),
  radiusValue: document.getElementById('radiusValue'),
  budgetValue: document.getElementById('budgetValue'),
  allAgesOnly: document.getElementById('allAgesOnly'),
  hide21: document.getElementById('hide21'),
  filtersSheet: document.getElementById('filtersSheet'),
  detailSheet: document.getElementById('detailSheet'),
  detailBand: document.getElementById('detailBand'),
  detailContent: document.getElementById('detailContent')
};

function init() {
  buildGenreChips();
  wireUI();
  initMap();
  render();
}

function initMap() {
  state.map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: ATLANTA_CENTER,
    zoom: 11,
    pitch: 50,
    bearing: -12,
    antialias: true
  });

  state.map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

  state.map.on('load', () => {
    state.mapReady = true;
    add3DBuildingsLayer();
    renderMarkers(filteredShows());
  });
}

function add3DBuildingsLayer() {
  const map = state.map;
  const layers = map.getStyle().layers || [];
  const labelLayerId = layers.find((layer) => layer.type === 'symbol')?.id;

  if (!map.getSource('openmaptiles') && !layers.find((l) => l.source === 'openmaptiles')) return;

  const sourceLayerGuess = ['building', 'buildings'];
  let sourceLayer = 'building';
  for (const guess of sourceLayerGuess) {
    if (layers.some((layer) => layer['source-layer'] === guess)) {
      sourceLayer = guess;
      break;
    }
  }

  if (map.getLayer('3d-buildings')) return;

  map.addLayer({
    id: '3d-buildings',
    source: 'openmaptiles',
    'source-layer': sourceLayer,
    type: 'fill-extrusion',
    minzoom: 13,
    paint: {
      'fill-extrusion-color': '#ced8ef',
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
      'fill-extrusion-opacity': 0.65
    }
  }, labelLayerId);
}

function wireUI() {
  document.getElementById('openFiltersBtn').addEventListener('click', () => toggleSheet(ui.filtersSheet, true));
  document.getElementById('closeFiltersBtn').addEventListener('click', () => toggleSheet(ui.filtersSheet, false));
  document.getElementById('applyFiltersBtn').addEventListener('click', () => {
    toggleSheet(ui.filtersSheet, false);
    render();
  });

  document.getElementById('closeDetailBtn').addEventListener('click', () => {
    state.selectedId = null;
    toggleSheet(ui.detailSheet, false);
    render();
  });

  document.getElementById('recenterBtn').addEventListener('click', () => {
    state.map?.easeTo({ center: ATLANTA_CENTER, zoom: 11, pitch: 50, bearing: -12, duration: 700 });
  });

  document.getElementById('toggle3DBtn').addEventListener('click', () => {
    state.extrusionEnabled = !state.extrusionEnabled;
    if (state.mapReady && state.map.getLayer('3d-buildings')) {
      state.map.setLayoutProperty('3d-buildings', 'visibility', state.extrusionEnabled ? 'visible' : 'none');
    }
  });

  ui.radiusRange.addEventListener('input', (event) => {
    state.radius = Number(event.target.value);
    ui.radiusValue.textContent = String(state.radius);
    ui.radiusPill = `${state.radius} mi`;
    render();
  });

  ui.budgetRange.addEventListener('input', (event) => {
    state.budget = Number(event.target.value);
    ui.budgetValue.textContent = String(state.budget);
    render();
  });

  ui.allAgesOnly.addEventListener('change', (event) => {
    state.allAgesOnly = event.target.checked;
    render();
  });

  ui.hide21.addEventListener('change', (event) => {
    state.hide21 = event.target.checked;
    render();
  });

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach((el) => el.classList.remove('active'));
      btn.classList.add('active');

      const panelId = btn.dataset.panel;
      document.querySelectorAll('.panel').forEach((panel) => panel.classList.add('hidden'));
      document.getElementById(panelId).classList.remove('hidden');
    });
  });
}

function buildGenreChips() {
  const genres = [...new Set(shows.map((show) => show.genre))];
  ui.genreFilters.innerHTML = '';

  genres.forEach((genre) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = genre;

    chip.addEventListener('click', () => {
      if (state.genres.has(genre)) {
        state.genres.delete(genre);
        chip.classList.remove('active');
      } else {
        state.genres.add(genre);
        chip.classList.add('active');
      }
      render();
    });

    ui.genreFilters.append(chip);
  });
}

function filteredShows() {
  return shows.filter((show) => {
    const radiusMatch = show.distance <= state.radius;
    const budgetMatch = show.price <= state.budget;
    const genreMatch = state.genres.size === 0 || state.genres.has(show.genre);
    const allAgesMatch = !state.allAgesOnly || show.age === 'all';
    const hide21Match = !state.hide21 || show.age !== '21+';
    return radiusMatch && budgetMatch && genreMatch && allAgesMatch && hide21Match;
  });
}

function render() {
  const visible = filteredShows();
  ui.summaryPill.textContent = `${visible.length} shows in Atlanta area`;
  document.getElementById('radiusPill').textContent = `Radius: ${state.radius} mi`;

  renderCards(visible);
  renderMarkers(visible);

  const selected = visible.find((item) => item.id === state.selectedId);
  if (selected) renderDetails(selected);
  if (state.selectedId && !selected) {
    state.selectedId = null;
    toggleSheet(ui.detailSheet, false);
  }
}

function markerColor(age) {
  if (age === 'all') return '#15a46a';
  if (age === '21+') return '#c23a5f';
  return '#d17f00';
}

function renderMarkers(visible) {
  if (!state.mapReady) return;

  state.markers.forEach((marker) => marker.remove());
  state.markers.clear();

  visible.forEach((show) => {
    const markerEl = document.createElement('button');
    markerEl.style.width = '16px';
    markerEl.style.height = '16px';
    markerEl.style.borderRadius = '999px';
    markerEl.style.border = '2px solid #fff';
    markerEl.style.background = markerColor(show.age);
    markerEl.style.boxShadow = '0 0 0 6px rgba(255,255,255,.35)';
    markerEl.style.cursor = 'pointer';
    markerEl.title = `${show.band} · ${show.neighborhood}`;

    markerEl.addEventListener('click', () => selectShow(show.id));

    const marker = new maplibregl.Marker({ element: markerEl })
      .setLngLat(show.lngLat)
      .addTo(state.map);

    state.markers.set(show.id, marker);
  });
}

function renderCards(visible) {
  ui.cardRail.innerHTML = '';

  if (!visible.length) {
    ui.cardRail.innerHTML = '<article class="show-card"><h3>No shows match</h3><p>Try widening your radius or ticket budget.</p></article>';
    return;
  }

  visible
    .slice()
    .sort((a, b) => a.distance - b.distance)
    .forEach((show) => {
      const card = document.createElement('article');
      card.className = `show-card ${state.selectedId === show.id ? 'active' : ''}`;
      card.innerHTML = `
        <h3>${show.band}</h3>
        <p>${show.title}</p>
        <div class="meta">
          <span class="badge">${show.genre}</span>
          <span class="badge">${show.age === 'all' ? 'All Ages' : show.age}</span>
          <span class="badge">${show.price === 0 ? 'Free' : `$${show.price}`}</span>
          <span class="badge">${show.distance.toFixed(1)} mi</span>
        </div>
        <p>${show.date} · ${show.neighborhood}</p>
      `;

      card.addEventListener('click', () => selectShow(show.id));
      ui.cardRail.append(card);
    });
}

function selectShow(id) {
  state.selectedId = id;
  const show = filteredShows().find((item) => item.id === id) || shows.find((item) => item.id === id);
  if (!show) return;

  state.map?.easeTo({ center: show.lngLat, zoom: 13.6, pitch: 58, bearing: 12, duration: 750 });
  render();
  renderDetails(show);
  toggleSheet(ui.detailSheet, true);
}

function getRsvpStatus(showId) {
  return state.rsvp[showId] || 'none';
}

function setRsvpStatus(showId, status) {
  state.rsvp[showId] = status;
  localStorage.setItem('underground-rsvp', JSON.stringify(state.rsvp));
  render();

  const show = shows.find((item) => item.id === showId);
  if (show && state.selectedId === showId) renderDetails(show);
}

function renderDetails(show) {
  ui.detailBand.textContent = show.band;
  const status = getRsvpStatus(show.id);
  const locationText = status === 'approved'
    ? `${show.exactLocation} (Host approved)`
    : `${show.approxLocation} (Exact address locked)`;

  ui.detailContent.innerHTML = `
    <div class="detail-block">
      <strong>${show.title}</strong>
      <p>${show.date} · ${show.neighborhood}</p>
      <p>${show.age === 'all' ? 'All ages welcome' : `Age ${show.age}`} · ${show.price === 0 ? 'Free' : `$${show.price}`}</p>
      <p>${show.claimed}/${show.capacity} spots claimed</p>
    </div>

    <div class="detail-block">
      <strong>Location privacy</strong>
      <p>${locationText}</p>
      <p>Only approved RSVPs unlock exact location details.</p>
    </div>

    <div class="detail-block">
      <strong>Host note</strong>
      <p>${show.hostNote}</p>
    </div>

    <div class="detail-block">
      <strong>RSVP status</strong>
      <p><span class="status ${status}">${status.toUpperCase()}</span></p>
      <div class="action-row" id="detailActions"></div>
    </div>
  `;

  const actions = document.getElementById('detailActions');
  actions.append(...buildRsvpButtons(show, status));
}

function buildRsvpButtons(show, status) {
  const requestBtn = document.createElement('button');
  requestBtn.className = 'btn primary';
  requestBtn.textContent = status === 'none' ? 'Request RSVP' : 'Refresh request';
  requestBtn.addEventListener('click', () => {
    setRsvpStatus(show.id, 'pending');
    window.setTimeout(() => setRsvpStatus(show.id, 'approved'), 1000);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => setRsvpStatus(show.id, 'none'));

  const msgBtn = document.createElement('button');
  msgBtn.className = 'btn';
  msgBtn.textContent = 'Message host';
  msgBtn.addEventListener('click', () => {
    alert(`Message sent to ${show.band}: "Hey, can I bring one friend if there is space?"`);
  });

  if (status === 'none') return [requestBtn];
  if (status === 'pending') return [requestBtn, cancelBtn];
  return [msgBtn, cancelBtn];
}

function toggleSheet(sheet, open) {
  sheet.classList.toggle('hidden', !open);
  sheet.setAttribute('aria-hidden', String(!open));
}

init();
