/* ============================================
   VISUAL INSPIRATION — script.js
   Core functionality for all pages
   ============================================ */

// ─── CONFIG ───────────────────────────────────
const CONFIG = {
  // Demo key — replace with your own from unsplash.com/oauth/applications
  UNSPLASH_KEY: 'ygOoSuYEyR7iHuBJixAL5H5UrF1vf4yQoKYhzJF93ew',
  BASE_URL: 'https://api.unsplash.com',
  PER_PAGE: 20,
};

// ─── STORAGE HELPERS ──────────────────────────
const Store = {
  get: (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  update: (key, fn, def) => {
    const cur = Store.get(key) ?? def;
    Store.set(key, fn(cur));
    return Store.get(key);
  },
};

// ─── API ──────────────────────────────────────
const API = {
  /**
   * Search photos by keyword
   * @param {string} query
   * @param {number} page
   * @returns {Promise<object[]>}
   */
  async search(query, page = 1) {
    try {
      const url = `${CONFIG.BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${CONFIG.PER_PAGE}&page=${page}&client_id=${CONFIG.UNSPLASH_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.results || [];
    } catch (e) {
      console.warn('Search failed, using demo images', e);
      return getDemoImages(query);
    }
  },

  /**
   * Get random photos
   * @param {number} count
   * @param {string} [topic]
   * @returns {Promise<object[]>}
   */
  async random(count = 12, topic = '') {
    try {
      let url = `${CONFIG.BASE_URL}/photos/random?count=${count}&client_id=${CONFIG.UNSPLASH_KEY}`;
      if (topic) url += `&query=${encodeURIComponent(topic)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Random fetch failed, using demo images', e);
      return getDemoImages(topic || 'inspiration');
    }
  },
};

// ─── DEMO / FALLBACK IMAGES ───────────────────
/**
 * Returns placeholder images using picsum for offline/demo use
 * when Unsplash API key is not configured
 */
function getDemoImages(seed = '') {
  const seeds = [10, 20, 40, 50, 60, 70, 80, 100, 110, 130, 150, 160, 180, 200, 220];
  return seeds.map((s, i) => ({
    id: `demo-${seed}-${i}`,
    urls: {
      regular: `https://picsum.photos/seed/${seed}${s}/800/600`,
      small: `https://picsum.photos/seed/${seed}${s}/400/300`,
      thumb: `https://picsum.photos/seed/${seed}${s}/200/200`,
    },
    alt_description: `${seed} photo ${i + 1}`,
    description: `Beautiful ${seed} image`,
    width: 800, height: [400, 600, 500, 700, 450][i % 5],
    user: {
      name: ['Sophia Chen', 'Alex Rivera', 'Maya Patel', 'James Liu', 'Aria Stone'][i % 5],
      profile_image: { small: `https://i.pravatar.cc/32?img=${s}` },
      links: { html: '#' },
    },
    links: { html: '#', download: '#' },
    likes: Math.floor(Math.random() * 500) + 10,
  }));
}

// ─── CARD BUILDER ─────────────────────────────
/**
 * Creates a masonry card DOM element from an Unsplash photo object
 * @param {object} photo
 * @returns {HTMLElement}
 */
function buildCard(photo) {
  const liked = isLiked(photo.id);
  const saved = isSaved(photo.id);
  const aspectRatio = photo.height / photo.width;

  const card = document.createElement('div');
  card.className = 'img-card';
  card.dataset.id = photo.id;
  card.innerHTML = `
    <img
      src="${photo.urls.small}"
      alt="${photo.alt_description || 'Inspiration image'}"
      loading="lazy"
      style="aspect-ratio: ${photo.width}/${photo.height};"
    />
    <div class="card-overlay">
      <div class="card-actions">
        <button class="card-btn like-btn ${liked ? 'liked' : ''}" title="Like">
          <i class="bi ${liked ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
        <button class="card-btn save-btn ${saved ? 'saved' : ''}" title="Save">
          <i class="bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>
        </button>
        <a href="${photo.links.html}" target="_blank" class="card-btn" title="Open original">
          <i class="bi bi-arrow-up-right"></i>
        </a>
      </div>
      <div class="card-author">
        <img src="${photo.user.profile_image.small}" alt="${photo.user.name}" />
        ${photo.user.name}
      </div>
    </div>
  `;

  // Like button
  card.querySelector('.like-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLike(photo, card.querySelector('.like-btn'));
  });

  // Save button
  card.querySelector('.save-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openSaveModal(photo, card.querySelector('.save-btn'));
  });

  return card;
}

// ─── LIKE SYSTEM ──────────────────────────────
function getLiked() { return Store.get('vi_liked') || {}; }
function isLiked(id) { return !!getLiked()[id]; }

function toggleLike(photo, btn) {
  const liked = getLiked();
  const wasLiked = !!liked[photo.id];

  if (wasLiked) {
    delete liked[photo.id];
    btn.classList.remove('liked');
    btn.innerHTML = '<i class="bi bi-heart"></i>';
    showToast('Removed from liked');
  } else {
    liked[photo.id] = {
      id: photo.id,
      url: photo.urls.small,
      author: photo.user.name,
      original: photo.urls.regular,
      tags: photo.alt_description || '',
      likedAt: Date.now(),
    };
    btn.classList.add('liked');
    btn.innerHTML = '<i class="bi bi-heart-fill"></i>';
    showToast('♥ Added to likes');
  }
  Store.set('vi_liked', liked);
}

// ─── SAVE / COLLECTIONS SYSTEM ────────────────
function getSaved() { return Store.get('vi_saved') || {}; }
function isSaved(id) { return !!getSaved()[id]; }
function getCollections() { return Store.get('vi_collections') || [{ id: 'default', name: 'My Saves', images: [] }]; }

let _pendingPhoto = null; // photo waiting to be saved

/**
 * Opens the collection picker modal, or creates quick-save
 */
function openSaveModal(photo, btn) {
  _pendingPhoto = photo;
  const saved = getSaved();
  const wasInSaved = !!saved[photo.id];

  if (wasInSaved) {
    // Toggle: remove
    delete saved[photo.id];
    Store.set('vi_saved', saved);
    btn.classList.remove('saved');
    btn.innerHTML = '<i class="bi bi-bookmark"></i>';
    showToast('Removed from saves');
    return;
  }

  const modal = document.getElementById('collectionModal');
  if (modal) {
    renderCollectionList();
    new bootstrap.Modal(modal).show();
  } else {
    // Fallback: save to default
    saveToCollection(photo, 'default');
    btn.classList.add('saved');
    btn.innerHTML = '<i class="bi bi-bookmark-fill"></i>';
  }
}

function saveToCollection(photo, collectionId) {
  // Update saved map
  const saved = getSaved();
  saved[photo.id] = {
    id: photo.id, url: photo.urls.small,
    original: photo.urls.regular,
    author: photo.user.name,
    collectionId,
    savedAt: Date.now(),
  };
  Store.set('vi_saved', saved);

  // Update collection
  const cols = getCollections();
  const col = cols.find(c => c.id === collectionId);
  if (col && !col.images.find(i => i.id === photo.id)) {
    col.images.unshift({ id: photo.id, url: photo.urls.small, author: photo.user.name });
  }
  Store.set('vi_collections', cols);

  showToast('✓ Saved to collection');

  // Update any visible btn
  document.querySelectorAll(`.img-card[data-id="${photo.id}"] .save-btn`).forEach(b => {
    b.classList.add('saved');
    b.innerHTML = '<i class="bi bi-bookmark-fill"></i>';
  });
}

function renderCollectionList() {
  const list = document.getElementById('collectionSelectList');
  if (!list) return;
  const cols = getCollections();
  list.innerHTML = cols.map(col => `
    <div class="collection-select-item" data-id="${col.id}">
      <i class="bi bi-folder2"></i>
      <span>${col.name}</span>
      <span style="margin-left:auto;font-size:0.75rem;color:var(--gray-400)">${col.images.length} images</span>
    </div>
  `).join('') + `
    <div class="collection-select-item" data-id="__new__">
      <i class="bi bi-plus-circle"></i>
      <span>Create new collection…</span>
    </div>
  `;
  list.querySelectorAll('.collection-select-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      if (id === '__new__') {
        const name = prompt('Collection name:');
        if (!name) return;
        const cols = getCollections();
        const newCol = { id: `col_${Date.now()}`, name, images: [] };
        cols.push(newCol);
        Store.set('vi_collections', cols);
        saveToCollection(_pendingPhoto, newCol.id);
      } else {
        saveToCollection(_pendingPhoto, id);
      }
      bootstrap.Modal.getInstance(document.getElementById('collectionModal'))?.hide();
    });
  });
}

// ─── GRID LOADERS ─────────────────────────────
/**
 * Load random images into a grid container (with skeleton removal)
 * @param {string} gridId - element id
 * @param {string} topic
 */
async function loadTrendingGrid(gridId, topic) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const photos = await API.random(12, topic);
  grid.innerHTML = '';
  photos.forEach(p => grid.appendChild(buildCard(p)));
}

/**
 * Load images into a grid from search results
 */
async function loadSearchGrid(gridId, query, page = 1) {
  const grid = document.getElementById(gridId);
  if (!grid) return [];

  if (page === 1) {
    grid.innerHTML = Array(8).fill('<div class="skeleton-card"></div>').join('');
    // alternate heights
    grid.querySelectorAll('.skeleton-card').forEach((s, i) => {
      if (i % 3 === 1) s.classList.add('tall');
    });
  }

  const photos = await API.search(query, page);
  if (page === 1) grid.innerHTML = '';
  photos.forEach(p => grid.appendChild(buildCard(p)));
  return photos;
}

// ─── FEATURED STRIP ───────────────────────────
async function loadFeaturedStrip() {
  const strip = document.getElementById('featuredStrip');
  if (!strip) return;
  const photos = await API.random(20, 'art design photography');
  // Duplicate for seamless scroll
  const items = [...photos, ...photos].map(p => {
    const div = document.createElement('div');
    div.className = 'strip-item';
    div.innerHTML = `<img src="${p.urls.thumb || p.urls.small}" alt="" loading="lazy" />`;
    div.addEventListener('click', () => window.location.href = `pages/explore.html?q=${encodeURIComponent(p.alt_description || 'art')}`);
    return div;
  });
  items.forEach(el => strip.appendChild(el));
}

// ─── MOOD CARDS ───────────────────────────────
async function loadMoodCards() {
  const cards = document.querySelectorAll('.mood-card');
  for (const card of cards) {
    const q = card.dataset.q;
    const photos = await API.random(1, q);
    if (photos.length) {
      const img = document.createElement('img');
      img.src = photos[0].urls.small;
      img.alt = q;
      card.insertBefore(img, card.firstChild);
    }
    card.addEventListener('click', () => window.location.href = `pages/explore.html?q=${encodeURIComponent(q)}`);
  }
}

// ─── NAVBAR SCROLL EFFECT ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    });
  }
});

// ─── TOAST ────────────────────────────────────
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('viToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ─── FORM VALIDATION ──────────────────────────
/**
 * Attach validation to an auth form
 */
function setupFormValidation(formId, rules) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    rules.forEach(({ field, validates, message }) => {
      const input = form.querySelector(`[name="${field}"]`);
      const errEl = form.querySelector(`[data-error="${field}"]`);
      if (!input) return;

      const ok = validates(input.value);
      input.classList.toggle('invalid', !ok);
      if (errEl) {
        errEl.textContent = message;
        errEl.classList.toggle('show', !ok);
      }
      if (!ok) valid = false;
    });

    if (valid) form.dispatchEvent(new Event('vi:valid'));
  });
}

// ─── AUTH SIMULATION ──────────────────────────
function getUsers() { return Store.get('vi_users') || []; }
function getCurrentUser() { return Store.get('vi_current_user'); }

function registerUser(username, email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) return { error: 'Email already registered' };
  const user = { id: `u_${Date.now()}`, username, email, password, createdAt: Date.now() };
  users.push(user);
  Store.set('vi_users', users);
  Store.set('vi_current_user', { id: user.id, username, email });
  return { ok: true };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { error: 'Invalid email or password' };
  Store.set('vi_current_user', { id: user.id, username: user.username, email });
  return { ok: true };
}

function logoutUser() {
  localStorage.removeItem('vi_current_user');
}

// ─── NAVBAR AUTH STATE ────────────────────────
function updateNavAuth() {
  const user = getCurrentUser();
  const signIn = document.querySelector('a[href*="login"]');
  const getStarted = document.querySelector('a[href*="register"]');
  if (!user || !signIn) return;

  signIn.textContent = user.username || 'Account';
  signIn.href = '#';
  signIn.addEventListener('click', e => {
    e.preventDefault();
    if (confirm('Sign out?')) { logoutUser(); location.reload(); }
  });
  if (getStarted) getStarted.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', updateNavAuth);

// ─── RELATIVE PATH HELPER ─────────────────────
/**
 * Returns correct path prefix based on current depth
 * so assets load correctly from /pages/ subdirectory
 */
function rootPath() {
  return location.pathname.includes('/pages/') ? '../' : './';
}
