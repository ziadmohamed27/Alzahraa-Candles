const SITE_CONFIG = window.__SITE_CONFIG__ || {};
const SUPABASE_URL = SITE_CONFIG.supabaseUrl || 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = SITE_CONFIG.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaGhmd2RheXN1cGpwZnpzaGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTI4MjAsImV4cCI6MjA4ODkyODgyMH0.Eem_ytvdtd7UnkWaguief7WeaZFbP4vU16gfl4gefls';

const $ = (s) => document.querySelector(s);

function toSafeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function money(v) {
  return `${toSafeNumber(v, 0).toFixed(2)} ج.م`;
}

let supabaseClient = null;
let isSubmittingOrder = false;
let orderSubmittedSuccessfully = false;
let lastSubmittedOrderNumber = '';
const URGENT_RATE = 0.05;
const URGENT_MIN_FEE = 10;
const WHATSAPP_NUMBER = '201095314011';

const ORDER_NOTE_PREFIXES = {
  address: 'العنوان:',
  customerNote: 'ملاحظات العميل:',
  orderType: 'نوع الطلب:',
  urgentFee: 'رسوم الطلب المستعجل:',
  shipping: 'الشحن:',
  locationSource: 'مصدر موقع التسليم:',
  locationLink: 'رابط موقع التسليم:',
};

(function initSupabase() {
  if (!window.supabase || !SUPABASE_ANON_KEY) return;
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function escHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showOrderSuccess(orderNumber, isDirect = false) {
  const box = $('#orderSuccessBox');
  if (!box) return;

  if (isDirect) {
    box.innerHTML = `
      <h3>تم تسجيل طلبك بنجاح ✅</h3>
      <p>طلبك وصلنا وسنراجعه ونتواصل معك قريبًا لتأكيد التوصيل.</p>
      <div class="order-success-actions">
        <div class="order-success-number">${escHtml(orderNumber || 'تم حفظ الطلب')}</div>
        <button type="button" class="btn btn-ghost btn-sm" id="copyOrderNumberBtn">نسخ الرقم</button>
        <a href="./my-orders.html" class="btn btn-ghost btn-sm">متابعة طلباتي</a>
        <a href="./index.html#products" class="btn btn-ghost btn-sm">العودة للمتجر</a>
      </div>
      <p>يمكنك متابعة حالة طلبك من صفحة <a href="./my-orders.html" style="color:var(--olive);text-decoration:underline">طلباتي</a>.</p>
    `;
    box.classList.add('is-direct');
  } else {
    box.innerHTML = `
      <h3>تم إرسال طلبك بنجاح ✅</h3>
      <p>احتفظ برقم الطلب للمتابعة، وتم فتح رسالة واتساب الخاصة بالطلب.</p>
      <div class="order-success-actions">
        <div class="order-success-number">${escHtml(orderNumber || 'تم حفظ الطلب')}</div>
        <button type="button" class="btn btn-ghost btn-sm" id="copyOrderNumberBtn">نسخ الرقم</button>
        <a href="./index.html#products" class="btn btn-ghost btn-sm">العودة للمنتجات</a>
      </div>
      <p>سيتم التواصل معك لتأكيد الطلب والتوصيل.</p>
    `;
    box.classList.remove('is-direct');
  }

  box.classList.remove('hidden');
  box.classList.add('show');
  document.body.classList.add('order-submitted');
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  launchCandleGlow();
}

function launchCandleGlow() {
  const container = document.createElement('div');
  container.className = 'candle-glow-layer';

  for (let i = 0; i < 20; i += 1) {
    const bubble = document.createElement('span');
    bubble.className = 'candle-spark';
    const size = 18 + Math.random() * 54;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.animationDelay = `${Math.random() * 0.4}s`;
    bubble.style.animationDuration = `${3.6 + Math.random() * 2.2}s`;
    bubble.style.setProperty('--drift', `${-40 + Math.random() * 80}px`);
    container.appendChild(bubble);
  }

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 6500);
}


function hideOrderSuccess() {
  const box = $('#orderSuccessBox');
  if (!box) return;
  box.classList.add('hidden');
  box.classList.remove('show');
  box.innerHTML = '';
  document.body.classList.remove('order-submitted');
}

function sanitizeCartItem(item) {
  if (!item || typeof item !== 'object') return null;

  const id = toSafeNumber(item.id, NaN);
  const price = toSafeNumber(item.price, NaN);
  const qty = Math.max(1, Math.floor(toSafeNumber(item.qty, 1)));
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  const image = typeof item.image === 'string' ? item.image.trim() : '';
  const weight = typeof item.weight === 'string' ? item.weight.trim() : '';

  if (!Number.isFinite(id) || !Number.isFinite(price) || !name) return null;

  return {
    ...item,
    id,
    name,
    image,
    weight,
    price,
    qty,
  };
}

function readCart() {
  try {
    const raw = localStorage.getItem('candles-cart');
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(sanitizeCartItem)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem('candles-cart', JSON.stringify(cart));
}

const state = {
  cart: readCart(),
};

/* ── Auth state (populated async on DOMContentLoaded) ── */
const authState = {
  session: null,
  profile: null,
};

const DEFAULT_DELIVERY_CENTER = { lat: 30.0444, lng: 31.2357 };
const DELIVERY_MODAL_ZOOM = 16;

const deliveryLocationState = {
  lat: null,
  lng: null,
  mapsLink: '',
  source: '',
};

const deliveryDraftState = {
  lat: null,
  lng: null,
  mapsLink: '',
  source: '',
  label: '',
};

let deliveryMap = null;
let deliveryMarker = null;
let deliverySearchController = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeCoordinate(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Number(n.toFixed(6)) : null;
}

function hasDeliveryLocation() {
  return (Number.isFinite(deliveryLocationState.lat) && Number.isFinite(deliveryLocationState.lng)) || !!String(deliveryLocationState.mapsLink || '').trim();
}

function hasDeliveryDraftLocation() {
  return Number.isFinite(deliveryDraftState.lat) && Number.isFinite(deliveryDraftState.lng);
}

function extractGoogleMapsCoordinates(link) {
  const value = String(link || '').trim();
  if (!value) return { lat: null, lng: null };

  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) {
      const lat = normalizeCoordinate(match[1]);
      const lng = normalizeCoordinate(match[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
  }

  return { lat: null, lng: null };
}

function isGoogleMapsUrl(link) {
  const value = String(link || '').trim();
  return /^(https?:\/\/)?(www\.)?(google\.[^/]+\/maps|maps\.app\.goo\.gl)\//i.test(value);
}

function normalizeGoogleMapsUrl(link) {
  const value = String(link || '').trim();
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function buildMapsLink(lat, lng) {
  const safeLat = normalizeCoordinate(lat);
  const safeLng = normalizeCoordinate(lng);
  if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) return '';
  return `https://www.google.com/maps?q=${safeLat},${safeLng}`;
}

function getLocationSourceLabel(source) {
  const map = {
    current_gps: 'الموقع الحالي',
    map_picker: 'تحديد يدوي من الخريطة',
    map_search: 'بحث داخل الخريطة',
    google_maps_link: 'رابط من خرائط Google',
  };
  return map[source] || 'غير محدد';
}

function getLocationSummary(source, lat, lng, label = '', mapsLink = '') {
  const safeLat = normalizeCoordinate(lat);
  const safeLng = normalizeCoordinate(lng);
  const coords = Number.isFinite(safeLat) && Number.isFinite(safeLng)
    ? `<span dir="ltr">(${safeLat.toFixed(5)}, ${safeLng.toFixed(5)})</span>`
    : '';
  const sourceLabel = getLocationSourceLabel(source);
  const labelText = label ? `<br><strong>${escapeHtml(label)}</strong>` : '';
  const linkText = !coords && mapsLink ? '<br>تم حفظ رابط الموقع من خرائط Google' : '';
  return `تم تحديد موقع التسليم — <strong>${sourceLabel}</strong>${labelText}${coords ? `<br>${coords}` : ''}${linkText}`;
}

function updateDeliveryMarker() {
  if (!deliveryMap) return;

  const activeLat = hasDeliveryDraftLocation() ? deliveryDraftState.lat : deliveryLocationState.lat;
  const activeLng = hasDeliveryDraftLocation() ? deliveryDraftState.lng : deliveryLocationState.lng;

  if (!Number.isFinite(activeLat) || !Number.isFinite(activeLng)) {
    if (deliveryMarker) {
      deliveryMap.removeLayer(deliveryMarker);
      deliveryMarker = null;
    }
    return;
  }

  const latLng = [activeLat, activeLng];
  if (!deliveryMarker) {
    deliveryMarker = window.L.marker(latLng, { draggable: true }).addTo(deliveryMap);
    deliveryMarker.on('dragend', (event) => {
      const point = event.target.getLatLng();
      setDeliveryDraftLocation({ lat: point.lat, lng: point.lng, source: 'map_picker' });
      deliveryMap.setView(point, Math.max(deliveryMap.getZoom(), DELIVERY_MODAL_ZOOM));
    });
  } else {
    deliveryMarker.setLatLng(latLng);
  }
}

function renderDeliveryLocationUi() {
  const statusEl = $('#deliveryLocationStatus');
  const linkEl = $('#deliveryLocationLink');
  const clearBtn = $('#clearLocationBtn');

  if (statusEl) {
    if (hasDeliveryLocation()) {
      statusEl.innerHTML = getLocationSummary(deliveryLocationState.source, deliveryLocationState.lat, deliveryLocationState.lng, '', deliveryLocationState.mapsLink);
      statusEl.classList.add('is-selected');
    } else {
      statusEl.textContent = 'لم يتم تحديد موقع تسليم على الخريطة بعد.';
      statusEl.classList.remove('is-selected');
    }
  }

  if (linkEl) {
    if (deliveryLocationState.mapsLink) {
      linkEl.href = deliveryLocationState.mapsLink;
      linkEl.classList.remove('hidden');
    } else {
      linkEl.href = '#';
      linkEl.classList.add('hidden');
    }
  }

  if (clearBtn) {
    clearBtn.classList.toggle('hidden', !(hasDeliveryLocation() || deliveryLocationState.mapsLink));
  }

  updateDeliveryMarker();
}

function renderDeliveryDraftUi() {
  const statusEl = $('#deliveryMapSelectionStatus');
  if (!statusEl) return;

  if (hasDeliveryDraftLocation()) {
    statusEl.innerHTML = getLocationSummary(deliveryDraftState.source, deliveryDraftState.lat, deliveryDraftState.lng, deliveryDraftState.label || '');
    statusEl.classList.add('is-selected');
  } else {
    statusEl.textContent = 'لم يتم اختيار موقع بعد.';
    statusEl.classList.remove('is-selected');
  }

  updateDeliveryMarker();
}

function setDeliveryLocation({ lat, lng, source = 'map_picker', mapsLink = '' }) {
  const safeLat = normalizeCoordinate(lat);
  const safeLng = normalizeCoordinate(lng);
  const safeLink = String(mapsLink || '').trim();

  if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) {
    deliveryLocationState.lat = null;
    deliveryLocationState.lng = null;
    deliveryLocationState.mapsLink = safeLink;
    deliveryLocationState.source = source || 'google_maps_link';
    const mapsInput = $('#googleMapsLinkInput');
    if (mapsInput) mapsInput.value = deliveryLocationState.mapsLink || '';
    renderDeliveryLocationUi();
    saveCustomerInfo();
    return;
  }

  deliveryLocationState.lat = safeLat;
  deliveryLocationState.lng = safeLng;
  deliveryLocationState.source = source;
  deliveryLocationState.mapsLink = safeLink || buildMapsLink(safeLat, safeLng);

  const mapsInput = $('#googleMapsLinkInput');
  if (mapsInput) mapsInput.value = deliveryLocationState.mapsLink || '';
  renderDeliveryLocationUi();
  saveCustomerInfo();
}


function setDeliveryDraftLocation({ lat, lng, source = 'map_picker', label = '' }) {
  const safeLat = normalizeCoordinate(lat);
  const safeLng = normalizeCoordinate(lng);
  if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) return;

  deliveryDraftState.lat = safeLat;
  deliveryDraftState.lng = safeLng;
  deliveryDraftState.source = source;
  deliveryDraftState.mapsLink = buildMapsLink(safeLat, safeLng);
  deliveryDraftState.label = String(label || '').trim();

  renderDeliveryDraftUi();
}

function syncDeliveryDraftFromSaved() {
  if (hasDeliveryLocation()) {
    deliveryDraftState.lat = deliveryLocationState.lat;
    deliveryDraftState.lng = deliveryLocationState.lng;
    deliveryDraftState.source = deliveryLocationState.source || 'map_picker';
    deliveryDraftState.mapsLink = deliveryLocationState.mapsLink || buildMapsLink(deliveryLocationState.lat, deliveryLocationState.lng);
    deliveryDraftState.label = '';
  } else {
    deliveryDraftState.lat = null;
    deliveryDraftState.lng = null;
    deliveryDraftState.source = 'map_picker';
    deliveryDraftState.mapsLink = '';
    deliveryDraftState.label = '';
  }
}

function clearDeliveryLocation() {
  deliveryLocationState.lat = null;
  deliveryLocationState.lng = null;
  deliveryLocationState.mapsLink = '';
  deliveryLocationState.source = '';
  syncDeliveryDraftFromSaved();
  renderDeliveryLocationUi();
  renderDeliveryDraftUi();
  saveCustomerInfo();
}

function setBodyModalState(isOpen) {
  document.body.classList.toggle('modal-open', isOpen);
}

function isDeliveryModalOpen() {
  return !$('#deliveryLocationModal')?.classList.contains('hidden');
}

function ensureDeliveryMap() {
  const mapEl = $('#deliveryMap');
  if (!mapEl || !window.L) return null;
  if (deliveryMap) return deliveryMap;

  deliveryMap = window.L.map(mapEl, { scrollWheelZoom: true }).setView([
    deliveryDraftState.lat || deliveryLocationState.lat || DEFAULT_DELIVERY_CENTER.lat,
    deliveryDraftState.lng || deliveryLocationState.lng || DEFAULT_DELIVERY_CENTER.lng,
  ], hasDeliveryDraftLocation() || hasDeliveryLocation() ? DELIVERY_MODAL_ZOOM : 6);

  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(deliveryMap);

  deliveryMap.on('click', (event) => {
    setDeliveryDraftLocation({ lat: event.latlng.lat, lng: event.latlng.lng, source: 'map_picker' });
    deliveryMap.setView(event.latlng, Math.max(deliveryMap.getZoom(), DELIVERY_MODAL_ZOOM));
  });

  updateDeliveryMarker();
  return deliveryMap;
}

function resetDeliverySearchUi() {
  const resultsEl = $('#deliveryLocationSearchResults');
  const metaEl = $('#deliveryLocationSearchMeta');
  if (resultsEl) {
    resultsEl.innerHTML = '';
    resultsEl.classList.add('hidden');
  }
  if (metaEl) {
    metaEl.textContent = '';
    metaEl.classList.add('hidden');
  }
}

function openDeliveryLocationModal() {
  const modal = $('#deliveryLocationModal');
  if (!modal) return;
  syncDeliveryDraftFromSaved();
  renderDeliveryDraftUi();
  resetDeliverySearchUi();
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  setBodyModalState(true);

  const map = ensureDeliveryMap();
  if (!map) {
    showToast('تعذر تحميل الخريطة الآن');
    return;
  }

  setTimeout(() => {
    map.invalidateSize();
    const activeLat = deliveryDraftState.lat || deliveryLocationState.lat || DEFAULT_DELIVERY_CENTER.lat;
    const activeLng = deliveryDraftState.lng || deliveryLocationState.lng || DEFAULT_DELIVERY_CENTER.lng;
    const zoom = hasDeliveryDraftLocation() || hasDeliveryLocation() ? DELIVERY_MODAL_ZOOM : 6;
    map.setView([activeLat, activeLng], zoom);
    updateDeliveryMarker();
  }, 80);
}

function closeDeliveryLocationModal() {
  const modal = $('#deliveryLocationModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  setBodyModalState(false);
}

function confirmDeliveryLocationSelection() {
  if (!hasDeliveryDraftLocation()) {
    showToast('حدد موقع التسليم أولًا');
    return;
  }

  setDeliveryLocation({
    lat: deliveryDraftState.lat,
    lng: deliveryDraftState.lng,
    source: deliveryDraftState.source || 'map_picker',
  });
  closeDeliveryLocationModal();
  showToast('تم حفظ موقع التسليم');
}

async function searchDeliveryLocation(query) {
  const safeQuery = String(query || '').trim();
  if (safeQuery.length < 2) {
    showToast('اكتب اسم منطقة أو شارع للبحث');
    return;
  }

  const resultsEl = $('#deliveryLocationSearchResults');
  const metaEl = $('#deliveryLocationSearchMeta');

  if (deliverySearchController) {
    deliverySearchController.abort();
  }
  deliverySearchController = new AbortController();

  if (metaEl) {
    metaEl.textContent = 'جارٍ البحث...';
    metaEl.classList.remove('hidden');
  }
  if (resultsEl) {
    resultsEl.innerHTML = '';
    resultsEl.classList.add('hidden');
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '6');
    url.searchParams.set('accept-language', 'ar');
    url.searchParams.set('countrycodes', 'eg');
    url.searchParams.set('q', safeQuery);

    const res = await fetch(url.toString(), {
      signal: deliverySearchController.signal,
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error('search_failed');
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];

    if (metaEl) {
      metaEl.textContent = list.length ? `تم العثور على ${list.length} نتيجة` : 'لم يتم العثور على نتائج مطابقة';
      metaEl.classList.remove('hidden');
    }

    if (!resultsEl) return;
    resultsEl.innerHTML = '';

    if (!list.length) {
      resultsEl.classList.add('hidden');
      return;
    }

    const fragment = document.createDocumentFragment();
    list.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'delivery-search-result';
      button.innerHTML = `<strong>${escapeHtml(item.name || item.display_name || 'نتيجة بحث')}</strong><span>${escapeHtml(item.display_name || '')}</span>`;
      button.addEventListener('click', () => {
        const lat = Number(item.lat);
        const lng = Number(item.lon);
        setDeliveryDraftLocation({ lat, lng, source: 'map_search', label: item.display_name || item.name || '' });
        const map = ensureDeliveryMap();
        if (map) {
          map.setView([lat, lng], DELIVERY_MODAL_ZOOM);
        }
      });
      fragment.appendChild(button);
    });
    resultsEl.appendChild(fragment);
    resultsEl.classList.remove('hidden');
  } catch (error) {
    if (error?.name === 'AbortError') return;
    if (metaEl) {
      metaEl.textContent = 'تعذر تنفيذ البحث الآن، حاول مرة أخرى';
      metaEl.classList.remove('hidden');
    }
  } finally {
    deliverySearchController = null;
  }
}

async function requestCurrentLocation({ asDraft = false } = {}) {
  if (!navigator.geolocation) {
    showToast('المتصفح لا يدعم تحديد الموقع');
    return;
  }

  showToast('جارٍ تحديد موقعك الحالي...');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords || {};
      if (asDraft) {
        setDeliveryDraftLocation({ lat: latitude, lng: longitude, source: 'current_gps' });
        const map = ensureDeliveryMap();
        if (map) {
          map.setView([deliveryDraftState.lat, deliveryDraftState.lng], DELIVERY_MODAL_ZOOM);
        }
        showToast('تم وضع موقعك الحالي داخل الخريطة');
        return;
      }

      setDeliveryLocation({ lat: latitude, lng: longitude, source: 'current_gps' });
      showToast('تم استخدام موقعك الحالي');
    },
    (error) => {
      const code = error?.code;
      if (code === 1) showToast('تم رفض إذن الوصول للموقع');
      else if (code === 2) showToast('تعذر تحديد الموقع الحالي الآن');
      else if (code === 3) showToast('انتهت مهلة تحديد الموقع، حاول مرة أخرى');
      else showToast('تعذر الحصول على الموقع الحالي');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

async function useCurrentLocation() {
  return requestCurrentLocation({ asDraft: false });
}

function openGoogleMapsPicker() {
  window.open('https://www.google.com/maps/search/?api=1&query=Egypt', '_blank', 'noopener');
}

function applyGoogleMapsLinkFromInput() {
  const input = $('#googleMapsLinkInput');
  const url = normalizeGoogleMapsUrl(input?.value || '');

  if (!url) {
    showToast('الصق رابط الموقع من خرائط Google أولًا');
    return;
  }

  if (!isGoogleMapsUrl(url)) {
    showToast('ألصق رابطًا صحيحًا من خرائط Google');
    return;
  }

  const coords = extractGoogleMapsCoordinates(url);
  setDeliveryLocation({
    lat: coords.lat,
    lng: coords.lng,
    source: 'google_maps_link',
    mapsLink: url,
  });

  if (input) input.value = url;
  showToast('تم حفظ رابط موقع التسليم');
}
/**
 * Initialise Supabase auth client using auth-config.js (loaded before cart.js).
 * Returns null if not available (guest-only mode).
 */
function getAuthClient() {
  if (typeof createAuthClient !== 'function') return null;
  try { return createAuthClient(); } catch { return null; }
}

const CUSTOMER_STORAGE_KEY = 'candles-customer-info';

function saveCustomerInfo() {
  const payload = {
    name: $('#customerName')?.value?.trim() || '',
    phone: $('#customerPhone')?.value?.trim() || '',
    city: $('#customerCity')?.value?.trim() || '',
    address: $('#customerAddress')?.value?.trim() || '',
    notes: $('#customerNotes')?.value?.trim() || '',
    urgent: !!$('#isUrgentOrder')?.checked,
    deliveryLat: hasDeliveryLocation() ? deliveryLocationState.lat : null,
    deliveryLng: hasDeliveryLocation() ? deliveryLocationState.lng : null,
    deliveryMapsLink: deliveryLocationState.mapsLink || '',
    deliveryLocationSource: deliveryLocationState.source || '',
  };
  localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(payload));
}

function loadCustomerInfo() {
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (!data) return;

    if ($('#customerName')) $('#customerName').value = data.name || '';
    if ($('#customerPhone')) $('#customerPhone').value = data.phone || '';
    if ($('#customerCity')) $('#customerCity').value = data.city || '';
    if ($('#customerAddress')) $('#customerAddress').value = data.address || '';
    if ($('#customerNotes')) $('#customerNotes').value = data.notes || '';
    if ($('#isUrgentOrder')) $('#isUrgentOrder').checked = !!data.urgent;

    const savedMapsLink = String(data.deliveryMapsLink || '').trim();
    const hasCoords = Number.isFinite(Number(data.deliveryLat)) && Number.isFinite(Number(data.deliveryLng));

    if (hasCoords) {
      deliveryLocationState.lat = normalizeCoordinate(data.deliveryLat);
      deliveryLocationState.lng = normalizeCoordinate(data.deliveryLng);
      deliveryLocationState.source = String(data.deliveryLocationSource || '').trim();
      deliveryLocationState.mapsLink = String(savedMapsLink || buildMapsLink(data.deliveryLat, data.deliveryLng)).trim();
    } else if (savedMapsLink) {
      const coords = extractGoogleMapsCoordinates(savedMapsLink);
      deliveryLocationState.lat = coords.lat;
      deliveryLocationState.lng = coords.lng;
      deliveryLocationState.source = String(data.deliveryLocationSource || 'google_maps_link').trim();
      deliveryLocationState.mapsLink = savedMapsLink;
    } else {
      deliveryLocationState.lat = null;
      deliveryLocationState.lng = null;
      deliveryLocationState.source = '';
      deliveryLocationState.mapsLink = '';
    }

    renderDeliveryLocationUi();
  } catch {}
}

function clearCustomerInfo() {
  localStorage.removeItem(CUSTOMER_STORAGE_KEY);
}

function fallbackCopyText(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

async function copyText(text) {
  const value = String(text || '').trim();
  if (!value) {
    showToast('لا يوجد رقم لنسخه');
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      showToast('تم نسخ رقم الطلب');
      return;
    }

    const ok = fallbackCopyText(value);
    showToast(ok ? 'تم نسخ رقم الطلب' : 'تعذر نسخ رقم الطلب');
  } catch {
    const ok = fallbackCopyText(value);
    showToast(ok ? 'تم نسخ رقم الطلب' : 'تعذر نسخ رقم الطلب');
  }
}

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);

  return `AZ-${y}${m}${d}-${h}${min}-${rand}`;
}

function updateCartCount() {
  const count = state.cart.reduce((s, i) => s + toSafeNumber(i.qty, 0), 0);
  const el = $('#cartCount');
  if (el) el.textContent = count;
}

function validatePhone(phone) {
  const normalized = phone.replace(/\s+/g, '');
  return /^01[0-2,5][0-9]{8}$/.test(normalized);
}


function isUrgentOrderSelected() {
  return !!$('#isUrgentOrder')?.checked;
}

function calculateUrgentFee(baseTotal = calculateCartTotal()) {
  if (!isUrgentOrderSelected()) return 0;
  const percentFee = toSafeNumber(baseTotal, 0) * URGENT_RATE;
  return Math.max(URGENT_MIN_FEE, percentFee);
}

function calculateGrandTotal() {
  const baseTotal = calculateCartTotal();
  return baseTotal + calculateUrgentFee(baseTotal);
}

function normalizeQtyValue(value) {
  const parsed = Math.floor(toSafeNumber(String(value ?? '').trim(), NaN));
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

function getOrderFormData() {
  const customerName = $('#customerName')?.value?.trim() || '';
  const customerPhone = $('#customerPhone')?.value?.trim() || '';
  const customerCity = $('#customerCity')?.value?.trim() || '';
  const customerAddress = $('#customerAddress')?.value?.trim() || '';
  const customerNotes = $('#customerNotes')?.value?.trim() || '';
  const isUrgent = isUrgentOrderSelected();

  return {
    customerName,
    customerPhone,
    customerCity,
    customerAddress,
    customerNotes,
    isUrgent,
    deliveryLat: hasDeliveryLocation() ? deliveryLocationState.lat : null,
    deliveryLng: hasDeliveryLocation() ? deliveryLocationState.lng : null,
    deliveryMapsLink: deliveryLocationState.mapsLink || '',
    deliveryLocationSource: deliveryLocationState.source || '',
  };
}

function calculateCartTotal() {
  return state.cart.reduce((s, i) => s + (toSafeNumber(i.price, 0) * toSafeNumber(i.qty, 0)), 0);
}

function sanitizeLineBreaks(value) {
  return String(value || '').replace(/\r/g, '').split('\n').map(line => line.trim()).filter(Boolean).join(' / ');
}

function buildStructuredNotes({ customerAddress, customerNotes, isUrgent, urgentFee, deliveryMapsLink, deliveryLocationSource }) {
  const lines = [
    `${ORDER_NOTE_PREFIXES.address} ${sanitizeLineBreaks(customerAddress) || 'لا يوجد'}`,
    `${ORDER_NOTE_PREFIXES.customerNote} ${sanitizeLineBreaks(customerNotes) || 'لا يوجد'}`,
    `${ORDER_NOTE_PREFIXES.orderType} ${isUrgent ? 'طلب مستعجل' : 'طلب عادي'}`,
    `${ORDER_NOTE_PREFIXES.urgentFee} ${isUrgent ? money(urgentFee) : money(0)}`,
    `${ORDER_NOTE_PREFIXES.shipping} يضاف لاحقًا حسب المنطقة`,
    `${ORDER_NOTE_PREFIXES.locationSource} ${deliveryLocationSource ? getLocationSourceLabel(deliveryLocationSource) : 'غير محدد'}`,
    `${ORDER_NOTE_PREFIXES.locationLink} ${deliveryMapsLink || 'غير محدد'}`,
  ];

  return lines.join('\n');
}

function resetSuccessState() {
  orderSubmittedSuccessfully = false;
  lastSubmittedOrderNumber = '';
  hideOrderSuccess();
}

function renderCartItems() {
  const el = $('#cartPageItems');
  if (!el) return;

  if (!state.cart.length) {
    el.innerHTML = `
      <div class="empty cart-page-empty">
        <div class="cart-empty-icon">🕯️</div>
        <h3 class="cart-empty-title">${orderSubmittedSuccessfully ? 'تم إرسال طلبك بنجاح! 🎉' : 'السلة فارغة حتى الآن'}</h3>
        <p class="cart-empty-sub">${orderSubmittedSuccessfully ? 'شكرًا لطلبك — سنتواصل معك قريبًا للتأكيد.' : 'ابدأ بإضافة شمعتك المفضلة من المتجر.'}</p>
        <a href="./index.html#products" class="btn btn-primary cart-empty-btn">
          ${orderSubmittedSuccessfully ? 'تسوّق مجددًا' : 'استعرض المنتجات'}
        </a>
        ${!orderSubmittedSuccessfully ? `<a href="https://wa.me/201095314011" target="_blank" rel="noopener" class="btn btn-ghost cart-wa-btn">💬 اسألنا على واتساب</a>` : ''}
      </div>
    `;
    return;
  }

  el.innerHTML = state.cart.map((item) => `
    <article class="cart-page-item">
      <div class="cart-page-item-image">
        <img src="${escHtml(item.image || '')}" alt="${escHtml(item.name)}" onerror="this.style.background='#eee';this.removeAttribute('src')">
      </div>

      <div class="cart-page-item-content">
        <div class="cart-page-item-top">
          <div>
            <h3>${escHtml(item.name)}</h3>
            <p>${escHtml(item.weight || '')}</p>
          </div>
          <button class="remove-btn" data-action="remove" data-id="${item.id}" type="button">🗑️</button>
        </div>

        <div class="cart-page-item-bottom">
          <div class="cart-page-item-price">${money(item.price)}</div>

          <div class="qty-row qty-row-lg">
            <button data-action="inc" data-id="${item.id}" type="button">+</button>
            <input class="qty-input" data-action="set-qty" data-id="${item.id}" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${item.qty}" aria-label="كمية ${escHtml(item.name)}">
            <button data-action="dec" data-id="${item.id}" type="button">-</button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

function renderSummary() {
  const el = $('#cartPageSummary');
  if (!el) return;

  const subtotal = calculateCartTotal();
  const urgentFee = calculateUrgentFee(subtotal);
  const grandTotal = subtotal + urgentFee;
  const totalItems = state.cart.reduce((s, i) => s + toSafeNumber(i.qty, 0), 0);
  const isUrgent = isUrgentOrderSelected();
  const isLoggedIn = !!authState.session;

  const itemsSummary = state.cart.length
    ? state.cart.map((item) => `
      <div class="summary-product">
        <div class="summary-product-head">
          <strong>${escHtml(item.name)}</strong>
        </div>
        <div class="summary-product-row">
          <span>سعر القطعة</span>
          <span>${money(item.price)}</span>
        </div>
        <div class="summary-product-row">
          <span>الكمية</span>
          <span>${item.qty}</span>
        </div>
        <div class="summary-product-row summary-product-total">
          <span>إجمالي المنتج</span>
          <span>${money(item.price * item.qty)}</span>
        </div>
      </div>
    `).join('')
    : `<div class="empty">${orderSubmittedSuccessfully ? 'تم إرسال الطلب بنجاح.' : 'لا توجد منتجات في السلة.'}</div>`;

  const checkoutBtnDisabled = !state.cart.length || isSubmittingOrder || orderSubmittedSuccessfully;
  const checkoutBtnText = orderSubmittedSuccessfully
    ? 'تم إرسال الطلب'
    : isSubmittingOrder
      ? 'جارٍ تجهيز الطلب...'
      : 'إرسال الطلب عبر واتساب';

  /* Logged-in notice + direct order button */
  const loggedInNotice = isLoggedIn ? `
    <div class="cart-auth-notice">
      <span>👤</span>
      <span>أنت مسجل الدخول — <a href="./account.html">حسابي</a></span>
    </div>
    <button
      class="btn btn-direct-order cart-page-submit"
      id="directOrderBtn"
      type="button"
      ${checkoutBtnDisabled ? 'disabled' : ''}
    >
      ${orderSubmittedSuccessfully ? 'تم تسجيل الطلب' : isSubmittingOrder ? 'جارٍ تسجيل الطلب...' : '📦 إرسال الطلب مباشرة'}
    </button>
  ` : '';

  el.innerHTML = `
    <h3>ملخص الطلب</h3>

    <div class="summary-products-list">
      ${itemsSummary}
    </div>

    <div class="cart-summary">
      <div class="cart-summary-row">
        <span>عدد القطع</span>
        <strong>${totalItems}</strong>
      </div>
      <div class="cart-summary-row">
        <span>المجموع الفرعي</span>
        <strong class="price">${money(subtotal)}</strong>
      </div>
      ${isUrgent ? `
      <div class="cart-summary-row urgent-row">
        <span>رسوم الطلب المستعجل</span>
        <strong class="price">${money(urgentFee)}</strong>
      </div>` : ''}
      <div class="cart-summary-row shipping-row">
        <span>الشحن</span>
        <strong>(+ مصاريف الشحن)</strong>
      </div>
      <div class="cart-summary-row total-row">
        <span>الإجمالي الحالي قبل الشحن</span>
        <strong class="price">${money(grandTotal)}</strong>
      </div>
    </div>

    <div class="cart-extra-notes">
      <p class="helper shipping-helper">سيتم إضافة قيمة الشحن لاحقًا حسب المنطقة.</p>
      ${isUrgent ? `<p class="helper urgent-helper">تم اختيار طلب مستعجل، وستتم إضافة ${money(urgentFee)} على إجمالي الطلب الحالي.</p>` : ''}
    </div>

    ${loggedInNotice}

    <button
      class="btn btn-whatsapp cart-page-submit"
      id="checkoutBtn"
      type="button"
      ${checkoutBtnDisabled ? 'disabled' : ''}
    >
      ${checkoutBtnText}
    </button>

    <a href="./index.html#products" class="btn btn-ghost cart-page-back-btn">إكمال التسوق</a>
  `;
}

function persistAndRender() {
  if (state.cart.length) {
    resetSuccessState();
  }

  writeCart(state.cart);
  updateCartCount();
  renderCartItems();
  renderSummary();
}

function clearCartAndForm() {
  state.cart = [];
  writeCart([]);
  clearCustomerInfo();

  const fields = ['#customerName', '#customerPhone', '#customerCity', '#customerAddress', '#customerNotes'];
  fields.forEach((selector) => {
    const el = $(selector);
    if (el) el.value = '';
  });

  if ($('#isUrgentOrder')) $('#isUrgentOrder').checked = false;

  clearDeliveryLocation();
  const mapsInput = $('#googleMapsLinkInput');
  if (mapsInput) mapsInput.value = '';

  updateCartCount();
  renderCartItems();
  renderSummary();
}

function buildOrderPayload(orderNumber) {
  const subtotal = calculateCartTotal();
  const urgentFee = calculateUrgentFee(subtotal);
  const total = subtotal + urgentFee;
  const { customerName, customerPhone, customerCity, customerAddress, customerNotes, isUrgent, deliveryLat, deliveryLng, deliveryMapsLink, deliveryLocationSource } = getOrderFormData();

  const payload = {
    order_number: orderNumber,
    customer_name: customerName || 'طلب من الموقع',
    phone: customerPhone,
    city: customerCity,
    notes: buildStructuredNotes({ customerAddress, customerNotes, isUrgent, urgentFee, deliveryMapsLink, deliveryLocationSource }),
    items_json: state.cart,
    delivery_lat: Number.isFinite(deliveryLat) ? deliveryLat : null,
    delivery_lng: Number.isFinite(deliveryLng) ? deliveryLng : null,
    delivery_maps_link: deliveryMapsLink || null,
    delivery_location_source: deliveryLocationSource || null,
    total,
    status: 'pending',
    source: 'website',
  };

  /* Attach account identifiers if user is logged in */
  if (authState.session) {
    payload.user_id = authState.session.user.id;
    payload.customer_email = authState.session.user.email;
  }

  return payload;
}

function isDuplicateOrderNumberError(error) {
  const text = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return error?.code === '23505' || (text.includes('duplicate') && text.includes('order_number'));
}

function getFriendlyOrderError(error) {
  if (!error) return 'حدثت مشكلة غير متوقعة أثناء حفظ الطلب';

  if (isDuplicateOrderNumberError(error)) {
    return 'حدث تعارض نادر في رقم الطلب. حاول مرة أخرى';
  }

  const text = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();

  if (text.includes('supabase client is not ready') || text.includes('cdn') || text.includes('script')) {
    return 'تعذر تهيئة خدمة الطلبات الآن. أعد تحميل الصفحة ثم حاول مرة أخرى';
  }

  if (text.includes('network') || text.includes('fetch') || text.includes('failed to fetch')) {
    return 'تعذر الاتصال بالخدمة الآن. تأكد من الإنترنت ثم حاول مرة أخرى';
  }

  if (text.includes('permission') || text.includes('policy') || text.includes('row-level security')) {
    return 'تعذر حفظ الطلب بسبب إعدادات الصلاحيات في قاعدة البيانات';
  }

  return 'حدثت مشكلة أثناء حفظ الطلب، حاول مرة أخرى بعد قليل';
}

async function insertOrderOnce(orderNumber) {
  if (!supabaseClient) {
    throw new Error('Supabase client is not ready');
  }

  const payload = buildOrderPayload(orderNumber);

  const { error } = await supabaseClient
    .from('orders')
    .insert([payload]);

  if (error) {
    throw error;
  }

  return { ok: true, orderNumber };
}

async function saveOrderWithUniqueNumber(maxRetries = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const orderNumber = generateOrderNumber();

    try {
      return await insertOrderOnce(orderNumber);
    } catch (error) {
      lastError = error;

      if (isDuplicateOrderNumberError(error) && attempt < maxRetries) {
        console.warn(`[Checkout] duplicate order_number on attempt ${attempt}, retrying...`);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('تعذر حفظ الطلب');
}

function buildWhatsAppMessage(orderNumber, customerName, customerPhone, customerCity, customerAddress, customerNotes, isUrgent, deliveryMapsLink, deliveryLocationSource) {
  const subtotal = calculateCartTotal();
  const urgentFee = calculateUrgentFee(subtotal);
  const grandTotal = subtotal + urgentFee;
  const normalizedAddress = sanitizeLineBreaks(customerAddress) || 'لا يوجد';
  const normalizedNotes = sanitizeLineBreaks(customerNotes) || 'لا يوجد';
  const locationBlock = deliveryMapsLink
    ? `مصدر الموقع: ${getLocationSourceLabel(deliveryLocationSource)}\nرابط الموقع: ${deliveryMapsLink}\n`
    : '';

  const lines = state.cart
    .map((i, n) => `${n + 1}. ${i.name}\nالكمية: ${i.qty}\nسعر القطعة: ${money(toSafeNumber(i.price, 0))}\nإجمالي المنتج: ${money(toSafeNumber(i.price, 0) * toSafeNumber(i.qty, 0))}`)
    .join('\n\n');

  return (
    `مرحبًا، أريد إتمام الطلب:\n\n` +
    `رقم الطلب: ${orderNumber}\n` +
    `الاسم: ${customerName}\n` +
    `الموبايل: ${customerPhone}\n` +
    `المحافظة: ${customerCity}\n` +
    `العنوان بالتفصيل: ${normalizedAddress}\n` +
    `ملاحظات العميل: ${normalizedNotes}\n` +
    locationBlock +
    `حالة الطلب: ${isUrgent ? 'طلب مستعجل' : 'طلب عادي'}\n\n` +
    `المنتجات:\n\n${lines}\n\n` +
    `المجموع الفرعي: ${money(subtotal)}\n` +
    `${isUrgent ? `رسوم الطلب المستعجل: ${money(urgentFee)}\n` : ''}` +
    `الإجمالي الحالي قبل الشحن: ${money(grandTotal)}`
  );
}

async function checkout() {
  if (!state.cart.length) {
    showToast('السلة فارغة');
    return;
  }

  if (isSubmittingOrder || orderSubmittedSuccessfully) return;

  const { customerName, customerPhone, customerCity, customerAddress, customerNotes, isUrgent, deliveryLat, deliveryLng, deliveryMapsLink, deliveryLocationSource } = getOrderFormData();

  if (!customerName || !customerPhone || !customerCity || !customerAddress) {
    showToast('من فضلك املأ الاسم والموبايل والمحافظة والعنوان بالتفصيل');
    return;
  }

  if (!validatePhone(customerPhone)) {
    showToast('اكتب رقم موبايل مصري صحيح');
    return;
  }

  isSubmittingOrder = true;
  renderSummary();

  try {
    const { orderNumber } = await saveOrderWithUniqueNumber(3);
    const msg = buildWhatsAppMessage(orderNumber, customerName, customerPhone, customerCity, customerAddress, customerNotes, isUrgent, deliveryMapsLink, deliveryLocationSource);

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');

    orderSubmittedSuccessfully = true;
    lastSubmittedOrderNumber = orderNumber;

    clearCartAndForm();
    showOrderSuccess(orderNumber);
    showToast('تم إرسال الطلب بنجاح');
  } catch (err) {
    console.error('[Checkout] failed:', err);
    showToast(getFriendlyOrderError(err));
  } finally {
    isSubmittingOrder = false;
    renderSummary();
  }
}

document.addEventListener('input', (e) => {
  if (
    e.target.id === 'customerName' ||
    e.target.id === 'customerPhone' ||
    e.target.id === 'customerCity' ||
    e.target.id === 'customerAddress' ||
    e.target.id === 'customerNotes' ||
    e.target.id === 'isUrgentOrder'
  ) {
    saveCustomerInfo();
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'isUrgentOrder') {
    saveCustomerInfo();
    renderSummary();
    return;
  }

  if (e.target.dataset.action === 'set-qty') {
    const id = Number(e.target.dataset.id);
    const item = state.cart.find((i) => Number(i.id) === id);
    if (!item) return;
    item.qty = normalizeQtyValue(e.target.value);
    e.target.value = item.qty;
    persistAndRender();
    return;
  }
});

document.addEventListener('input', (e) => {
  if (e.target.dataset.action !== 'set-qty') return;
  const onlyDigits = String(e.target.value || '').replace(/[^0-9]/g, '');
  e.target.value = onlyDigits;
});

document.addEventListener('focusin', (e) => {
  if (e.target.dataset.action === 'set-qty') {
    requestAnimationFrame(() => e.target.select());
  }
});

document.addEventListener('click', (e) => {
  if (e.target.dataset.action === 'set-qty') {
    requestAnimationFrame(() => e.target.select());
    return;
  }
});

document.addEventListener('click', (e) => {
  const action = e.target.dataset.action;

  if (action) {
    const id = Number(e.target.dataset.id);
    const item = state.cart.find((i) => Number(i.id) === id);
    if (!item) return;

    if (action === 'inc') {
      item.qty += 1;
    } else if (action === 'dec') {
      if (item.qty > 1) item.qty -= 1;
      else state.cart = state.cart.filter((i) => Number(i.id) !== id);
    } else if (action === 'remove') {
      state.cart = state.cart.filter((i) => Number(i.id) !== id);
    }

    persistAndRender();
    return;
  }

  if (e.target.id === 'checkoutBtn') {
    checkout();
    return;
  }

  if (e.target.id === 'clearCartBtn') {
    state.cart = [];
    resetSuccessState();
    persistAndRender();
    showToast('تم تفريغ السلة');
    return;
  }

  if (e.target.id === 'useCurrentLocationBtn') {
    useCurrentLocation();
    return;
  }

  if (e.target.id === 'openGoogleMapsBtn') {
    openGoogleMapsPicker();
    return;
  }

  if (e.target.id === 'applyGoogleMapsLinkBtn') {
    applyGoogleMapsLinkFromInput();
    return;
  }

  if (e.target.id === 'clearLocationBtn') {
    clearDeliveryLocation();
    const mapsInput = $('#googleMapsLinkInput');
    if (mapsInput) mapsInput.value = '';
    showToast('تم مسح موقع التسليم');
    return;
  }

  if (e.target.id === 'copyOrderNumberBtn') {
    const numberEl = document.querySelector('.order-success-number');
    if (numberEl) {
      copyText(numberEl.textContent.trim());
      return;
    }

    if (lastSubmittedOrderNumber) {
      copyText(lastSubmittedOrderNumber);
    }
  }

  /* Direct order button (logged-in users) */
  if (e.target.id === 'directOrderBtn') {
    directCheckout();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target?.id === 'googleMapsLinkInput') {
    event.preventDefault();
    applyGoogleMapsLinkFromInput();
  }
});

/**
 * Direct order for logged-in users — saves to Supabase, no WhatsApp required.
 */
async function directCheckout() {
  if (!state.cart.length) {
    showToast('السلة فارغة');
    return;
  }

  if (isSubmittingOrder || orderSubmittedSuccessfully) return;

  const { customerName, customerPhone, customerCity, customerAddress, customerNotes, isUrgent, deliveryLat, deliveryLng, deliveryMapsLink, deliveryLocationSource } = getOrderFormData();

  if (!customerName || !customerPhone || !customerCity || !customerAddress) {
    showToast('من فضلك املأ الاسم والموبايل والمحافظة والعنوان بالتفصيل');
    return;
  }

  if (!validatePhone(customerPhone)) {
    showToast('اكتب رقم موبايل مصري صحيح');
    return;
  }

  isSubmittingOrder = true;
  renderSummary();

  try {
    const { orderNumber } = await saveOrderWithUniqueNumber(3);

    orderSubmittedSuccessfully = true;
    lastSubmittedOrderNumber = orderNumber;

    clearCartAndForm();
    showOrderSuccess(orderNumber, true /* isDirect */);
    showToast('تم تسجيل طلبك بنجاح');
  } catch (err) {
    console.error('[DirectCheckout] failed:', err);
    showToast(getFriendlyOrderError(err));
  } finally {
    isSubmittingOrder = false;
    renderSummary();
  }
}

/**
 * Pre-fill the order form from saved profile data.
 * Only fills fields that are still empty so the user's in-session edits are preserved.
 */
function prefillFromProfile(profile) {
  if (!profile) return;

  const set = (id, val) => {
    const el = $(id);
    if (el && !el.value && val) el.value = val;
  };

  set('#customerName',    profile.full_name);
  set('#customerPhone',   profile.phone);
  /* governorate maps to the select */
  const govEl = $('#customerCity');
  if (govEl && !govEl.value && profile.governorate) {
    govEl.value = profile.governorate;
  }
  set('#customerAddress', profile.address);
}

function init() {
  updateCartCount();
  loadCustomerInfo();
  const mapsInput = $('#googleMapsLinkInput');
  if (mapsInput && deliveryLocationState.mapsLink) mapsInput.value = deliveryLocationState.mapsLink;
  renderDeliveryLocationUi();
  renderCartItems();
  renderSummary();

  /* Async: resolve auth session and profile, then re-render */
  (async function resolveAuth() {
    const sb = getAuthClient();
    if (!sb) {
      if (typeof renderAccountNav === 'function') await renderAccountNav({ wrapSelector: '#accountNavWrap', session: null });
      return;
    }

    try {
      const { data } = await sb.auth.getSession();
      authState.session = data?.session || null;
    } catch { authState.session = null; }

    if (!authState.session) {
      if (typeof renderAccountNav === 'function') await renderAccountNav({ wrapSelector: '#accountNavWrap', session: null, supabase: sb });
      renderSummary();
      return;
    }

    /* Fetch profile to prefill form */
    try {
      const { data: profile } = await sb
        .from('profiles')
        .select('full_name, phone, governorate, address')
        .eq('id', authState.session.user.id)
        .single();
      authState.profile = profile;
    } catch { authState.profile = null; }

    if (typeof renderAccountNav === 'function') {
      await renderAccountNav({ wrapSelector: '#accountNavWrap', session: authState.session, profile: authState.profile, supabase: sb });
    }

    prefillFromProfile(authState.profile);
    renderSummary(); /* Re-render to show logged-in notice + direct order button */
  })();
}

document.addEventListener('DOMContentLoaded', init);
