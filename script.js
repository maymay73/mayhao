/* ============================================
   MAYHAO — script.js
   Fashion & Style Visual Platform
   ============================================ */

// ─── CONFIG ───────────────────────────────────
const CONFIG = {
  UNSPLASH_KEY: 'ygOoSuYEyR7iHuBJixAL5H5UrF1vf4yQoKYhzJF93ew',
  BASE_URL: 'https://api.unsplash.com',
  PER_PAGE: 20,
};

// Модные запросы для Unsplash — дают хорошие результаты по моде
const FASHION_QUERIES = [
  'fashion style outfit',
  'street fashion clothing',
  'luxury fashion editorial',
  'model runway fashion',
  'minimalist fashion aesthetic',
  'urban style clothing',
];

// ─── ХРАНИЛИЩЕ ─────────────────────────────────
const Store = {
  get: (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

// ─── API ──────────────────────────────────────
const API = {
  /** Поиск фотографий */
  async search(query, page = 1, orientation = '', color = '') {
    try {
      let url = `${CONFIG.BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${CONFIG.PER_PAGE}&page=${page}&client_id=${CONFIG.UNSPLASH_KEY}`;
      if (orientation) url += `&orientation=${orientation}`;
      if (color) url += `&color=${color}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return { results: data.results || [], total: data.total || 0 };
    } catch (e) {
      console.warn('Search failed, using demo images', e);
      return { results: getDemoImages(query), total: 12 };
    }
  },

  /** Случайные фотографии */
  async random(count = 12, topic = 'fashion style') {
    try {
      const url = `${CONFIG.BASE_URL}/photos/random?count=${count}&query=${encodeURIComponent(topic)}&client_id=${CONFIG.UNSPLASH_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Random fetch failed, demo mode', e);
      return getDemoImages(topic);
    }
  },
};

// ─── DEMO-ИЗОБРАЖЕНИЯ ─────────────────────────
function getDemoImages(seed = 'fashion') {
  const seeds = [10,20,40,50,60,70,80,100,110,130,150,160,180,200,220];
  const names = ['Анна С.','Лея М.','Виктория Р.','Даша К.','Оливия В.'];
  return seeds.map((s, i) => ({
    id: `demo-${seed}-${i}`,
    urls: {
      regular: `https://picsum.photos/seed/${seed}${s}/800/1000`,
      small: `https://picsum.photos/seed/${seed}${s}/400/500`,
      thumb: `https://picsum.photos/seed/${seed}${s}/200/250`,
    },
    alt_description: `${seed} style ${i + 1}`,
    description: `Fashion look ${i + 1}`,
    width: 800, height: [900,1200,800,1100,950][i % 5],
    user: {
      name: names[i % 5],
      profile_image: { small: `https://i.pravatar.cc/32?img=${s}` },
      links: { html: '#' },
    },
    links: { html: '#', download: '#' },
    likes: Math.floor(Math.random() * 800) + 20,
  }));
}

// ─── КАРТОЧКА ИЗОБРАЖЕНИЯ ─────────────────────
const FASHION_LABELS = ['Тренд','Стиль','Образ','Мода','Луки','Бренд'];

function buildCard(photo) {
  const liked = isLiked(photo.id);
  const saved = isSaved(photo.id);
  const label = FASHION_LABELS[Math.floor(Math.random() * FASHION_LABELS.length)];

  const card = document.createElement('div');
  card.className = 'img-card';
  card.dataset.id = photo.id;
  card.innerHTML = `
    <img
      src="${photo.urls.small}"
      alt="${photo.alt_description || 'Модное фото'}"
      loading="lazy"
      style="aspect-ratio:${photo.width}/${photo.height};"
    />
    <div class="card-overlay">
      <div class="card-actions">
        <button class="card-btn like-btn ${liked ? 'liked' : ''}" title="Нравится">
          <i class="bi ${liked ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
        <button class="card-btn save-btn ${saved ? 'saved' : ''}" title="Сохранить">
          <i class="bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>
        </button>
        <a href="${photo.links.html}" target="_blank" class="card-btn" title="Открыть">
          <i class="bi bi-arrow-up-right"></i>
        </a>
      </div>
      <div class="card-meta">
        <div class="card-tag">${label}</div>
        <div class="card-author">
          <img src="${photo.user.profile_image.small}" alt="${photo.user.name}" />
          ${photo.user.name}
        </div>
      </div>
    </div>
  `;

  card.querySelector('.like-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleLike(photo, card.querySelector('.like-btn'));
  });
  card.querySelector('.save-btn').addEventListener('click', e => {
    e.stopPropagation();
    openSaveModal(photo, card.querySelector('.save-btn'));
  });

  return card;
}

// ─── ЛАЙКИ ────────────────────────────────────
function getLiked() { return Store.get('mh_liked') || {}; }
function isLiked(id) { return !!getLiked()[id]; }

function toggleLike(photo, btn) {
  const liked = getLiked();
  const wasLiked = !!liked[photo.id];
  if (wasLiked) {
    delete liked[photo.id];
    btn.classList.remove('liked');
    btn.innerHTML = '<i class="bi bi-heart"></i>';
    showToast('Убрано из понравившихся');
  } else {
    liked[photo.id] = {
      id: photo.id, url: photo.urls.small, author: photo.user.name,
      original: photo.urls.regular, tags: photo.alt_description || '',
      likedAt: Date.now(),
    };
    btn.classList.add('liked');
    btn.innerHTML = '<i class="bi bi-heart-fill"></i>';
    showToast('♥ Добавлено в понравившиеся');
  }
  Store.set('mh_liked', liked);
}

// ─── СОХРАНИТЬ / КОЛЛЕКЦИИ ────────────────────
function getSaved() { return Store.get('mh_saved') || {}; }
function isSaved(id) { return !!getSaved()[id]; }
function getCollections() {
  return Store.get('mh_collections') || [{ id: 'default', name: 'Мои сохранения', images: [] }];
}

let _pendingPhoto = null;

function openSaveModal(photo, btn) {
  _pendingPhoto = photo;
  const saved = getSaved();
  if (saved[photo.id]) {
    delete saved[photo.id];
    Store.set('mh_saved', saved);
    btn.classList.remove('saved');
    btn.innerHTML = '<i class="bi bi-bookmark"></i>';
    showToast('Убрано из сохранений');
    return;
  }
  const modal = document.getElementById('collectionModal');
  if (modal) {
    renderCollectionList();
    new bootstrap.Modal(modal).show();
  } else {
    saveToCollection(photo, 'default');
    btn.classList.add('saved');
    btn.innerHTML = '<i class="bi bi-bookmark-fill"></i>';
  }
}

function saveToCollection(photo, collectionId) {
  const saved = getSaved();
  saved[photo.id] = { id: photo.id, url: photo.urls.small, original: photo.urls.regular, author: photo.user.name, collectionId, savedAt: Date.now() };
  Store.set('mh_saved', saved);

  const cols = getCollections();
  const col = cols.find(c => c.id === collectionId);
  if (col && !col.images.find(i => i.id === photo.id)) {
    col.images.unshift({ id: photo.id, url: photo.urls.small, author: photo.user.name });
  }
  Store.set('mh_collections', cols);
  showToast('✓ Сохранено в коллекцию');

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
      <span style="margin-left:auto;font-size:0.75rem;color:var(--gray-400)">${col.images.length} фото</span>
    </div>
  `).join('') + `
    <div class="collection-select-item" data-id="__new__">
      <i class="bi bi-plus-circle"></i>
      <span>Создать новую коллекцию…</span>
    </div>
  `;
  list.querySelectorAll('.collection-select-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      if (id === '__new__') {
        const name = prompt('Название коллекции:');
        if (!name) return;
        const cols = getCollections();
        const newCol = { id: `col_${Date.now()}`, name, images: [] };
        cols.push(newCol);
        Store.set('mh_collections', cols);
        saveToCollection(_pendingPhoto, newCol.id);
      } else {
        saveToCollection(_pendingPhoto, id);
      }
      bootstrap.Modal.getInstance(document.getElementById('collectionModal'))?.hide();
    });
  });
}

// ─── ЗАГРУЗКА СЕТОК ───────────────────────────
async function loadTrendingGrid(gridId, topic) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const photos = await API.random(12, topic);
  grid.innerHTML = '';
  photos.forEach(p => grid.appendChild(buildCard(p)));
}

async function loadSearchGrid(gridId, query, page = 1, orientation = '', color = '') {
  const grid = document.getElementById(gridId);
  if (!grid) return { results: [], total: 0 };
  if (page === 1) {
    grid.innerHTML = Array(8).fill(0).map((_,i) =>
      `<div class="skeleton-card ${i%3===1?'tall':i%5===4?'wide':''}"></div>`
    ).join('');
  }
  const data = await API.search(query, page, orientation, color);
  if (page === 1) grid.innerHTML = '';
  data.results.forEach(p => grid.appendChild(buildCard(p)));
  return data;
}

// ─── ПОЛОСА ФОТО ──────────────────────────────
async function loadFeaturedStrip() {
  const strip = document.getElementById('featuredStrip');
  if (!strip) return;
  const photos = await API.random(20, 'fashion model style');
  const items = [...photos, ...photos].map(p => {
    const div = document.createElement('div');
    div.className = 'strip-item';
    div.innerHTML = `<img src="${p.urls.thumb || p.urls.small}" alt="" loading="lazy" />`;
    div.addEventListener('click', () => {
      const q = p.alt_description || 'fashion';
      window.location.href = (location.pathname.includes('/pages/') ? '' : 'pages/') + `explore.html?q=${encodeURIComponent(q)}`;
    });
    return div;
  });
  items.forEach(el => strip.appendChild(el));
}

// ─── КАРТОЧКИ НАСТРОЕНИЯ ──────────────────────
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
    card.addEventListener('click', () => {
      const base = location.pathname.includes('/pages/') ? '' : 'pages/';
      window.location.href = `${base}explore.html?q=${encodeURIComponent(q)}`;
    });
  }
}

// ─── НАВБАР: СКРОЛЛ ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('mainNav');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10));
});

// ─── ТОСТ ─────────────────────────────────────
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('viToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ─── ВАЛИДАЦИЯ ФОРМ ───────────────────────────
function setupFormValidation(formId, rules) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    rules.forEach(({ field, validates, message }) => {
      const input = form.querySelector(`[name="${field}"]`);
      const errEl = form.querySelector(`[data-error="${field}"]`);
      if (!input) return;
      const ok = validates(input.value);
      input.classList.toggle('invalid', !ok);
      if (errEl) { errEl.textContent = message; errEl.classList.toggle('show', !ok); }
      if (!ok) valid = false;
    });
    if (valid) form.dispatchEvent(new Event('mh:valid'));
  });
}

// ─── АУТЕНТИФИКАЦИЯ ───────────────────────────
function getUsers() { return Store.get('mh_users') || []; }
function getCurrentUser() { return Store.get('mh_current_user'); }

function registerUser(username, email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) return { error: 'Email уже зарегистрирован' };
  const user = { id: `u_${Date.now()}`, username, email, password, createdAt: Date.now() };
  users.push(user);
  Store.set('mh_users', users);
  Store.set('mh_current_user', { id: user.id, username, email });
  return { ok: true };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { error: 'Неверный email или пароль' };
  Store.set('mh_current_user', { id: user.id, username: user.username, email });
  return { ok: true };
}

function logoutUser() { localStorage.removeItem('mh_current_user'); }

// ─── НАВБАР: СОСТОЯНИЕ АВТОРИЗАЦИИ ───────────
function updateNavAuth() {
  const user = getCurrentUser();
  // Обновляем ссылки "Войти" → имя пользователя
  const signInLinks = document.querySelectorAll('a.btn-ghost[href*="login"]');
  const getStartedLinks = document.querySelectorAll('a.btn-primary-vi[href*="register"]');

  if (user) {
    signInLinks.forEach(a => {
      a.textContent = user.username;
      a.href = (location.pathname.includes('/pages/') ? '' : 'pages/') + 'profile.html';
    });
    getStartedLinks.forEach(a => a.style.display = 'none');
  }
}

document.addEventListener('DOMContentLoaded', updateNavAuth);
