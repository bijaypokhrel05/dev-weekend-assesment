// app.js — Country Compare frontend logic

const input    = document.getElementById('country-input');
const addBtn   = document.getElementById('add-btn');
const clearBtn = document.getElementById('clear-btn');
const errorMsg = document.getElementById('error-msg');
const results  = document.getElementById('results');

const MAX_CARDS = 3;

// Track which country names are currently displayed so we don't add duplicates
const activeCountries = new Set();

// ── Event listeners ──────────────────────────────────────────────────────────

addBtn.addEventListener('click', handleAdd);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAdd();
});

clearBtn.addEventListener('click', () => {
  results.innerHTML = '';
  activeCountries.clear();
  clearError();
});

// ── Core logic ───────────────────────────────────────────────────────────────

async function handleAdd() {
  const raw = input.value.trim();
  clearError();

  // Guard: empty input
  if (!raw) {
    showError('Please type a country name first.');
    return;
  }

  // Guard: only letters, spaces, hyphens, and apostrophes are valid in country names
  // This catches things like SQL injection attempts or random symbols
  if (!/^[a-zA-Z\s\-'.]+$/.test(raw)) {
    showError('Country names can only contain letters, spaces, hyphens, and apostrophes.');
    return;
  }

  // Guard: max 3 cards
  if (activeCountries.size >= MAX_CARDS) {
    showError(`You can compare up to ${MAX_CARDS} countries at a time. Remove one first.`);
    return;
  }

  // Guard: duplicate
  const key = raw.toLowerCase();
  if (activeCountries.has(key)) {
    showError(`"${raw}" is already in the comparison.`);
    return;
  }

  input.value = '';

  // Show a loading skeleton while we wait
  const placeholder = addLoadingCard();

  try {
    const data = await fetchCountry(raw);

    // The API returns an array; pick the first exact or best match
    const country = pickBestMatch(data, raw);

    removePlaceholder(placeholder);
    activeCountries.add(key);
    renderCard(country, key);
  } catch (err) {
    removePlaceholder(placeholder);
    showError(err.message);
  }
}

// ── API call ─────────────────────────────────────────────────────────────────

async function fetchCountry(name) {
  const response = await fetch(`/api/country/${encodeURIComponent(name)}`);
  const json = await response.json();

  if (!response.ok) {
    // Server already gives us a human-readable error message
    throw new Error(json.error || 'Something went wrong. Please try again.');
  }

  return json;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// When the API returns multiple results (e.g. "Georgia" matches the country
// and the US state region), prefer an exact common-name match if one exists.
function pickBestMatch(countries, query) {
  const q = query.toLowerCase();
  const exact = countries.find(
    (c) => c.name.common.toLowerCase() === q || c.name.official.toLowerCase() === q
  );
  return exact || countries[0];
}

function fmt(value) {
  if (value === undefined || value === null || value === '') return '—';
  return value;
}

function formatPopulation(n) {
  if (!n) return '—';
  return n.toLocaleString();
}

function formatArea(n) {
  if (!n) return '—';
  return n.toLocaleString() + ' km²';
}

function formatLanguages(langs) {
  if (!langs) return '—';
  return Object.values(langs).join(', ');
}

function formatCurrencies(curr) {
  if (!curr) return '—';
  return Object.values(curr)
    .map((c) => `${c.name} (${c.symbol || '?'})`)
    .join(', ');
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function showError(msg) {
  errorMsg.textContent = msg;
}

function clearError() {
  errorMsg.textContent = '';
}

function addLoadingCard() {
  const card = document.createElement('div');
  card.className = 'card loading';
  card.innerHTML = `
    <div class="card-inner">
      <div class="card-flag"></div>
      <div class="card-body">
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line long"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line long"></div>
        <div class="skeleton-line medium"></div>
      </div>
    </div>
  `;
  results.appendChild(card);
  return card;
}

function removePlaceholder(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function renderCard(country, key) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.key = key;

  const flagSrc = country.flags?.svg || country.flags?.png || '';
  const flagAlt = `Flag of ${country.name.common}`;

  card.innerHTML = `
    <button class="remove-btn" aria-label="Remove ${country.name.common}" title="Remove">✕</button>
    <div class="card-inner">
      <img class="card-flag" src="${flagSrc}" alt="${flagAlt}" loading="lazy" />
      <div class="card-body">
        <h2>${country.name.common}</h2>
        <table>
          <tr><td>Official name</td><td>${fmt(country.name.official)}</td></tr>
          <tr><td>Capital</td><td>${fmt(country.capital?.[0])}</td></tr>
          <tr><td>Region</td><td>${fmt(country.region)}${country.subregion ? ' / ' + country.subregion : ''}</td></tr>
          <tr><td>Population</td><td>${formatPopulation(country.population)}</td></tr>
          <tr><td>Area</td><td>${formatArea(country.area)}</td></tr>
          <tr><td>Languages</td><td>${formatLanguages(country.languages)}</td></tr>
          <tr><td>Currencies</td><td>${formatCurrencies(country.currencies)}</td></tr>
        </table>
      </div>
    </div>
  `;

  card.querySelector('.remove-btn').addEventListener('click', () => {
    card.remove();
    activeCountries.delete(key);
    clearError();
  });

  results.appendChild(card);
}
