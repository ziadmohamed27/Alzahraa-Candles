
const SUPABASE_URL = window.__SITE_CONFIG__?.supabaseUrl || 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = window.__SITE_CONFIG__?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaGhmd2RheXN1cGpwZnpzaGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTI4MjAsImV4cCI6MjA4ODkyODgyMH0.Eem_ytvdtd7UnkWaguief7WeaZFbP4vU16gfl4gefls';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ordersList = document.getElementById('ordersList');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const ordersStats = document.getElementById('ordersStats');
const ordersCountLabel = document.getElementById('ordersCountLabel');
const ordersFilteredTotalLabel = document.getElementById('ordersFilteredTotalLabel');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const dateFromInput = document.getElementById('dateFrom');
const cityFilter = document.getElementById('cityFilter');
const dateToInput = document.getElementById('dateTo');
const sortSelect = document.getElementById('sortSelect');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const adminLastUpdated = document.getElementById('adminLastUpdated');

let allOrders = [];
let detailsCache = new Map();
let activeStatFilter = 'all';

const STATUS_MAP = {
  pending: { label: 'قيد المراجعة', className: 'is-pending' },
  confirmed: { label: 'تم التأكيد', className: 'is-confirmed' },
  processing: { label: 'قيد التجهيز', className: 'is-processing' },
  delivered: { label: 'تم التسليم', className: 'is-delivered' },
  cancelled: { label: 'ملغي', className: 'is-cancelled' },
};


const NOTE_PREFIXES = {
  address: 'العنوان:',
  customerNote: 'ملاحظات العميل:',
  orderType: 'نوع الطلب:',
  urgentFee: 'رسوم الطلب المستعجل:',
  shipping: 'الشحن:',
  locationSource: 'مصدر موقع التسليم:',
  locationLink: 'رابط موقع التسليم:',
};

function parseStructuredNotes(rawValue) {
  const raw = String(rawValue || '').replace(/\r/g, '').trim();
  const meta = {
    address: '',
    customerNote: '',
    orderType: '',
    urgentFee: '',
    shipping: '',
    locationSource: '',
    locationLink: '',
    raw,
  };

  if (!raw) return meta;

  const normalized = raw.split('|').map(part => part.trim()).filter(Boolean).join('\n');
  const lines = normalized.split('\n').map(line => line.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.startsWith(NOTE_PREFIXES.address)) meta.address = line.slice(NOTE_PREFIXES.address.length).trim();
    else if (line.startsWith(NOTE_PREFIXES.customerNote)) meta.customerNote = line.slice(NOTE_PREFIXES.customerNote.length).trim();
    else if (line.startsWith(NOTE_PREFIXES.orderType)) meta.orderType = line.slice(NOTE_PREFIXES.orderType.length).trim();
    else if (line.startsWith(NOTE_PREFIXES.urgentFee)) meta.urgentFee = line.slice(NOTE_PREFIXES.urgentFee.length).trim();
    else if (line.startsWith(NOTE_PREFIXES.shipping)) meta.shipping = line.slice(NOTE_PREFIXES.shipping.length).trim();
    else if (line.startsWith(NOTE_PREFIXES.locationSource)) meta.locationSource = line.slice(NOTE_PREFIXES.locationSource.length).trim();
    else if (line.startsWith(NOTE_PREFIXES.locationLink)) meta.locationLink = line.slice(NOTE_PREFIXES.locationLink.length).trim();
  }

  if (!meta.address) {
    const legacyAddress = raw.match(/العنوان\s*:\s*([^|\n]+)/);
    if (legacyAddress) meta.address = legacyAddress[1].trim();
  }

  if (!meta.customerNote) {
    const legacyNote = raw.match(/ملاحظات(?: العميل)?\s*:\s*([^|\n]+)/);
    if (legacyNote) meta.customerNote = legacyNote[1].trim();
    else if (raw && !raw.includes(NOTE_PREFIXES.address)) meta.customerNote = raw;
  }

  if (!meta.orderType && /طلب\s+مستعجل/.test(raw)) meta.orderType = 'طلب مستعجل';
  if (!meta.urgentFee && /\+\d/.test(raw)) {
    const legacyUrgent = raw.match(/\((\+[^)]+)\)/);
    if (legacyUrgent) meta.urgentFee = legacyUrgent[1];
  }
  if (!meta.shipping) meta.shipping = 'يحدد لاحقًا';

  return meta;
}

async function requireAuth() {
  const { data } = await supabaseClient.auth.getUser();
  if (!data.user) window.location.href = './admin-login.html';
}

function money(v) {
  const n = Number(v || 0);
  return `${n.toFixed(2)} ج.م`;
}

function toSafeInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function getOrderItemsCount(order) {
  const direct = [order?.items_count, order?.total_items, order?.itemsCount, order?.qty_total];
  for (const value of direct) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return Math.trunc(parsed);
  }

  const items = Array.isArray(order?.items_json) ? order.items_json : [];
  if (!items.length) return 0;
  return items.reduce((sum, item) => sum + Math.max(0, toSafeInt(item?.qty, 0)), 0);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-EG', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit'
  });
}

function formatShortDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ar-EG', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
}

function getStatusMeta(status) {
  return STATUS_MAP[status] || { label: status || '-', className: '' };
}
function getSortLabel(mode) {
  const map = {
    newest: 'الأحدث أولًا',
    oldest: 'الأقدم أولًا',
    highest_total: 'الأعلى قيمة',
    lowest_total: 'الأقل قيمة',
    pending_first: 'قيد المراجعة أولًا',
  };
  return map[mode] || 'الأحدث أولًا';
}

function getActiveFilterSummary(filteredRows) {
  const search = String(searchInput?.value || '').trim();
  const selectedStatus = statusFilter?.value || '';
  const selectedCity = cityFilter?.value || '';
  const statusLabel = selectedStatus ? getStatusMeta(selectedStatus).label : 'كل الحالات';
  const statLabelMap = {
    all: 'كل الطلبات',
    today: 'طلبات اليوم',
    overdue: 'طلبات تحتاج متابعة',
  };

  return {
    search: search || '—',
    status: statusLabel,
    city: selectedCity || 'كل المحافظات',
    dateFrom: dateFromInput?.value || '—',
    dateTo: dateToInput?.value || '—',
    sort: getSortLabel(sortSelect?.value || 'newest'),
    statCard: statLabelMap[activeStatFilter] || 'كل الطلبات',
    count: filteredRows.length,
    total: filteredRows.reduce((sum, order) => sum + Number(order?.total || 0), 0),
  };
}

function csvText(value, forceText = false) {
  const raw = String(value ?? '');
  const escaped = raw.replace(/"/g, '""');
  if (forceText) return `"=""${escaped}"""`;
  return `"${escaped}"`;
}


function toWhatsAppLink(phone) {
  const normalized = String(phone || '').replace(/\D/g, '');
  if (!normalized) return '#';
  const e164 = normalized.startsWith('20') ? normalized : normalized.startsWith('0') ? `2${normalized}` : normalized;
  return `https://wa.me/${e164}`;
}

function getDeliveryLocationUrl(order, meta = null) {
  const direct = String(order?.delivery_maps_link || '').trim();
  if (direct) return direct;
  const parsed = String(meta?.locationLink || '').trim();
  if (/^https?:\/\//i.test(parsed)) return parsed;
  const lat = Number(order?.delivery_lat);
  const lng = Number(order?.delivery_lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return `https://www.google.com/maps?q=${lat},${lng}`;
  return '';
}

function getDeliveryLocationSourceLabel(order, meta = null) {
  const raw = String(order?.delivery_location_source || meta?.locationSource || '').trim();
  if (!raw) return 'غير محدد';
  if (raw === 'current_gps') return 'الموقع الحالي';
  if (raw === 'map_picker') return 'الخريطة اليدوية';
  if (raw === 'google_maps_link') return 'رابط من خرائط Google';
  return raw;
}

function isToday(value) {
  if (!value) return false;
  const d = new Date(value);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isOverdue(order) {
  const openStatuses = ['pending', 'confirmed', 'processing'];
  if (!openStatuses.includes(order?.status)) return false;
  const createdAt = new Date(order?.created_at || Date.now()).getTime();
  return (Date.now() - createdAt) >= 48 * 60 * 60 * 1000;
}

function updateLastUpdated() {
  if (adminLastUpdated) {
    adminLastUpdated.textContent = `آخر تحديث: ${formatDate(new Date().toISOString())}`;
  }
}

function normalizeCityValue(value) {
  return String(value || '').trim();
}

function populateCityFilter(rows) {
  if (!cityFilter) return;
  const current = cityFilter.value || '';
  const cities = [...new Set(rows.map(o => normalizeCityValue(o.city)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'ar'));

  cityFilter.innerHTML = '<option value="">كل المحافظات</option>' +
    cities.map(city => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`).join('');

  const stillExists = cities.includes(current);
  cityFilter.value = stillExists ? current : '';
}

async function loadOrders() {
  ordersList.innerHTML = '<div class="admin-empty">جارٍ تحميل الطلبات...</div>';

  let data = null;
  let error = null;

  ({ data, error } = await supabaseClient
    .from('orders_dashboard')
    .select('*')
    .order('created_at', { ascending: false }));

  if (error) {
    ({ data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false }));
  }

  if (error) {
    ordersList.innerHTML = '<div class="admin-empty is-error">فشل تحميل الطلبات.</div>';
    return;
  }

  allOrders = data || [];
  populateCityFilter(allOrders);
  updateLastUpdated();
  applyFilters();
}

function buildStats(orders) {
  const totalSales = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const todayOrders = orders.filter(o => isToday(o.created_at));
  const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const overdueOrders = orders.filter(isOverdue);

  return [
    { key: 'all', title: 'إجمالي الطلبات', value: orders.length, filterMode: 'all' },
    { key: 'sales', title: 'إجمالي المبيعات', value: money(totalSales), filterMode: 'all', extraClass: 'is-sales' },
    { key: 'today', title: 'طلبات اليوم', value: todayOrders.length, filterMode: 'today', extraClass: 'is-today' },
    { key: 'today_sales', title: 'مبيعات اليوم', value: money(todaySales), filterMode: 'today', extraClass: 'is-today-sales' },
    { key: 'pending', title: 'قيد المراجعة', value: orders.filter(o => o.status === 'pending').length, filterMode: 'status', status: 'pending' },
    { key: 'confirmed', title: 'تم التأكيد', value: orders.filter(o => o.status === 'confirmed').length, filterMode: 'status', status: 'confirmed' },
    { key: 'processing', title: 'قيد التجهيز', value: orders.filter(o => o.status === 'processing').length, filterMode: 'status', status: 'processing' },
    { key: 'delivered', title: 'تم التسليم', value: orders.filter(o => o.status === 'delivered').length, filterMode: 'status', status: 'delivered' },
    { key: 'overdue', title: 'طلبات تحتاج متابعة', value: overdueOrders.length, filterMode: 'overdue', extraClass: 'is-urgent' },
  ];
}

function renderStats(baseOrders) {
  const items = buildStats(baseOrders);

  ordersStats.innerHTML = items.map(item => {
    const isActive = (item.filterMode === 'status' && statusFilter?.value === item.status) ||
      (item.filterMode === 'today' && activeStatFilter === 'today') ||
      (item.filterMode === 'overdue' && activeStatFilter === 'overdue') ||
      (item.filterMode === 'all' && activeStatFilter === 'all' && !statusFilter?.value);

    const classes = ['admin-stat-card'];
    if (item.extraClass) classes.push(item.extraClass);
    classes.push('is-clickable');
    if (isActive) classes.push('is-active');

    return `
      <button type="button" class="${classes.join(' ')}" data-stat-key="${item.key}" data-filter-mode="${item.filterMode}" ${item.status ? `data-status="${item.status}"` : ''}>
        <span>${item.title}</span>
        <strong>${item.value}</strong>
      </button>
    `;
  }).join('');
}

function renderOrders(orders) {
  if (ordersCountLabel) ordersCountLabel.textContent = `عدد النتائج: ${orders.length} من أصل ${allOrders.length}`;

  if (!orders.length) {
    ordersList.innerHTML = '<div class="admin-empty">لا توجد طلبات مطابقة.</div>';
    return;
  }

  ordersList.innerHTML = orders.map(order => {
    const status = getStatusMeta(order.status);
    const itemsCount = getOrderItemsCount(order);
    const isOrderNew = isToday(order.created_at);
    const overdue = isOverdue(order);
    const orderMeta = parseStructuredNotes(order.notes);

    return `
      <article class="admin-order-card ${overdue ? 'is-overdue-card' : ''}" data-order-id="${order.id}">
        <div class="admin-order-grid">
          <div class="admin-order-col admin-order-summary">
            <div class="admin-order-price">الإجمالي: <strong>${money(order.total)}</strong></div>
            <div class="admin-order-date">${formatDate(order.created_at)}</div>

            <label class="admin-status-control">
              <span>تحديث الحالة</span>
              <select data-id="${order.id}" class="statusSelect">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد المراجعة</option>
                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>تم التأكيد</option>
                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>قيد التجهيز</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
              </select>
            </label>

            <div class="admin-order-actions">
              <a class="btn btn-ghost" href="${toWhatsAppLink(order.phone)}" target="_blank" rel="noopener">واتساب</a>
              <button type="button" class="btn btn-ghost admin-details-btn" data-id="${order.id}">تفاصيل</button>
            </div>
          </div>

          <div class="admin-order-col admin-order-main">
            <div class="admin-order-title-row">
              <h3 class="admin-order-number">
                <span>${escapeHtml(order.order_number || '-')}</span>
                <button type="button" class="admin-inline-copy copyOrderBtn" data-number="${escapeHtml(order.order_number || '')}" aria-label="نسخ رقم الطلب" title="نسخ رقم الطلب">⧉</button>
              </h3>
              <div class="admin-order-badges">
                ${isOrderNew ? '<span class="admin-meta-chip is-new">جديد</span>' : ''}
                ${orderMeta.orderType === 'طلب مستعجل' ? '<span class="admin-meta-chip is-overdue">مستعجل</span>' : ''}
                ${overdue ? '<span class="admin-meta-chip is-overdue">تحتاج متابعة</span>' : ''}
                <span class="admin-status-badge ${status.className}">${status.label}</span>
              </div>
            </div>

            <div class="admin-order-identity">
              <p><strong>الاسم:</strong> <span>${escapeHtml(order.customer_name || '-')}</span></p>
              <p class="admin-copy-field"><strong>الهاتف:</strong> <span class="admin-phone-value" dir="ltr">${escapeHtml(order.phone || '-')}</span><button type="button" class="admin-inline-copy copyPhoneBtn" data-phone="${escapeHtml(order.phone || '')}" aria-label="نسخ الهاتف" title="نسخ الهاتف">⧉</button></p>
              <p><strong>المدينة:</strong> <span>${escapeHtml(order.city || '-')}</span></p>
            </div>

            <div class="admin-order-highlights">
              <span class="admin-meta-chip">${itemsCount} قطعة</span>
              <span class="admin-meta-chip">${formatShortDate(order.created_at)}</span>
              ${orderMeta.address ? `<span class="admin-meta-chip">عنوان محفوظ</span>` : ''}
            </div>
          </div>
        </div>

        <div class="admin-order-details hidden" id="details-${order.id}"></div>
      </article>
    `;
  }).join('');
}

function withinDateRange(order) {
  const created = new Date(order.created_at);
  const from = dateFromInput?.value ? new Date(`${dateFromInput.value}T00:00:00`) : null;
  const to = dateToInput?.value ? new Date(`${dateToInput.value}T23:59:59`) : null;
  if (from && created < from) return false;
  if (to && created > to) return false;
  return true;
}

function sortOrders(orders) {
  const mode = sortSelect?.value || 'newest';
  const arr = [...orders];
  arr.sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime();
    const bTime = new Date(b.created_at || 0).getTime();
    const aTotal = Number(a.total || 0);
    const bTotal = Number(b.total || 0);

    if (mode === 'oldest') return aTime - bTime;
    if (mode === 'highest_total') return bTotal - aTotal;
    if (mode === 'lowest_total') return aTotal - bTotal;
    if (mode === 'pending_first') {
      const aPending = a.status === 'pending' ? 0 : 1;
      const bPending = b.status === 'pending' ? 0 : 1;
      if (aPending !== bPending) return aPending - bPending;
      return bTime - aTime;
    }
    return bTime - aTime;
  });
  return arr;
}

function applyFilters() {
  const q = String(searchInput?.value || '').trim().toLowerCase();
  const status = statusFilter?.value || '';
  const selectedCity = normalizeCityValue(cityFilter?.value || '');

  let filtered = allOrders.filter(order => {
    const meta = parseStructuredNotes(order.notes);
    const matchesSearch =
      String(order.order_number || '').toLowerCase().includes(q) ||
      String(order.customer_name || '').toLowerCase().includes(q) ||
      String(order.phone || '').toLowerCase().includes(q) ||
      String(order.city || '').toLowerCase().includes(q) ||
      String(meta.address || '').toLowerCase().includes(q) ||
      String(meta.customerNote || '').toLowerCase().includes(q);

    const matchesStatus = !status || order.status === status;
    const matchesCity = !selectedCity || normalizeCityValue(order.city) === selectedCity;
    const matchesDate = withinDateRange(order);

    let matchesStat = true;
    if (activeStatFilter === 'today') matchesStat = isToday(order.created_at);
    else if (activeStatFilter === 'overdue') matchesStat = isOverdue(order);

    return matchesSearch && matchesStatus && matchesCity && matchesDate && matchesStat;
  });

  filtered = sortOrders(filtered);

  const filteredTotal = filtered.reduce((sum, order) => sum + Number(order?.total || 0), 0);
  if (ordersFilteredTotalLabel) {
    ordersFilteredTotalLabel.textContent = `إجمالي النتائج: ${money(filteredTotal)}`;
  }

  renderStats(allOrders);
  renderOrders(filtered);
}

function renderDetailsHtml(order) {
  const items = Array.isArray(order.items_json) ? order.items_json : [];
  const itemsCount = getOrderItemsCount(order);
  const meta = parseStructuredNotes(order.notes);
  const deliveryUrl = getDeliveryLocationUrl(order, meta);
  const deliverySourceLabel = getDeliveryLocationSourceLabel(order, meta);
  const itemsHtml = items.length ? items.map(item => {
    const qty = Math.max(0, toSafeInt(item.qty, 0));
    const price = Number(item.price || 0);
    const metaBits = [];
    if (item.color_name) metaBits.push(`اللون: ${escapeHtml(item.color_name)}`);
    if (item.size_label) metaBits.push(`المقاس: ${escapeHtml(item.size_label)}`);
    if (item.weight) metaBits.push(`الوزن: ${escapeHtml(item.weight)}`);
    return `
    <div class="admin-detail-item">
      <div>
        <strong>${escapeHtml(item.name || '-')}</strong>
        <span>الكمية: ${qty}</span>
        ${metaBits.length ? `<span>${metaBits.join(' · ')}</span>` : ''}
      </div>
      <div class="admin-detail-prices">
        <span>سعر القطعة: ${money(price)}</span>
        <span>إجمالي المنتج: ${money(price * qty)}</span>
      </div>
    </div>
  `;}).join('') : '<div class="admin-empty small">لا توجد تفاصيل منتجات.</div>';

  return `
    <div class="admin-details-grid">
      <div>
        <h4>المنتجات</h4>
        <p><strong>عدد القطع:</strong> ${itemsCount}</p>
        <div class="admin-detail-items">${itemsHtml}</div>
      </div>
      <div class="admin-details-side">
        <div class="admin-info-box">
          <h4>بيانات العميل والتوصيل</h4>
          <p><strong>المحافظة:</strong> ${escapeHtml(order.city || '-')}</p>
          <p><strong>العنوان:</strong> ${escapeHtml(meta.address || 'غير مسجل')}</p>
          <p><strong>ملاحظات العميل:</strong> ${escapeHtml(meta.customerNote || 'لا يوجد')}</p>
          <p><strong>مصدر الموقع:</strong> ${escapeHtml(deliverySourceLabel)}</p>
          <p><strong>الموقع على الخريطة:</strong> ${deliveryUrl ? 'متوفر' : 'غير متوفر'}</p>
          ${deliveryUrl ? `<a class="btn btn-ghost btn-sm" href="${escapeHtml(deliveryUrl)}" target="_blank" rel="noopener">فتح الموقع</a>` : ''}
        </div>
        <div class="admin-info-box">
          <h4>ملخص الطلب</h4>
          <p><strong>نوع الطلب:</strong> ${escapeHtml(meta.orderType || 'طلب عادي')}</p>
          <p><strong>رسوم الطلب المستعجل:</strong> ${escapeHtml(meta.urgentFee || money(0))}</p>
          <p><strong>الشحن:</strong> ${escapeHtml(meta.shipping || 'يحدد لاحقًا')}</p>
          <p><strong>إجمالي الطلب الحالي:</strong> ${money(order.total || 0)}</p>
          <p><strong>الحالة الحالية:</strong> ${escapeHtml(getStatusMeta(order.status).label)}</p>
          <p><strong>المصدر:</strong> ${escapeHtml(order.source || '-')}</p>
        </div>
      </div>
    </div>
  `;
}

async function toggleDetails(id) {
  const box = document.getElementById(`details-${id}`);
  if (!box) return;

  if (!box.classList.contains('hidden')) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }

  box.classList.remove('hidden');
  box.innerHTML = '<div class="admin-empty small">جارٍ تحميل التفاصيل...</div>';

  if (detailsCache.has(id)) {
    box.innerHTML = renderDetailsHtml(detailsCache.get(id));
    return;
  }

  const { data, error } = await supabaseClient
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    box.innerHTML = '<div class="admin-empty small is-error">تعذر تحميل تفاصيل الطلب.</div>';
    return;
  }

  detailsCache.set(id, data);
  box.innerHTML = renderDetailsHtml(data);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(String(text || ''));
  } catch {
    const el = document.createElement('textarea');
    el.value = String(text || '');
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

function ensureCopyToast() {
  let toast = document.getElementById('copyToast');
  if (toast) return toast;

  toast = document.createElement('div');
  toast.id = 'copyToast';
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = 'تم النسخ';
  document.body.appendChild(toast);
  return toast;
}

let copyToastTimer = null;
function showCopyToast(message = 'تم النسخ') {
  const toast = ensureCopyToast();
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(copyToastTimer);
  copyToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1000);
}

function exportCurrentViewToCsv() {
  const rows = [...document.querySelectorAll('.admin-order-card')]
    .map(card => {
      const id = card.dataset.orderId;
      return allOrders.find(o => String(o.id) === String(id));
    })
    .filter(Boolean);

  const summary = getActiveFilterSummary(rows);

  const lines = [
    [csvText('ملخص الفلتر الحالي'), csvText('القيمة')].join(','),
    [csvText('البطاقة المحددة'), csvText(summary.statCard)].join(','),
    [csvText('الحالة'), csvText(summary.status)].join(','),
    [csvText('المحافظة'), csvText(summary.city)].join(','),
    [csvText('البحث'), csvText(summary.search)].join(','),
    [csvText('من تاريخ'), csvText(summary.dateFrom)].join(','),
    [csvText('إلى تاريخ'), csvText(summary.dateTo)].join(','),
    [csvText('الترتيب'), csvText(summary.sort)].join(','),
    [csvText('عدد النتائج'), csvText(summary.count)].join(','),
    [csvText('إجمالي النتائج'), csvText(Number(summary.total || 0).toFixed(2))].join(','),
    '',
  ];

  const header = ['رقم الطلب', 'الاسم', 'الهاتف', 'المحافظة', 'العنوان', 'نوع الطلب', 'رسوم الاستعجال', 'الحالة', 'الإجمالي', 'عدد القطع', 'التاريخ', 'ملاحظات العميل', 'مصدر الموقع', 'رابط الموقع'];
  lines.push(header.map(h => csvText(h)).join(','));

  rows.forEach(order => {
    const meta = parseStructuredNotes(order.notes);
    const cols = [
      csvText(order.order_number, true),
      csvText(order.customer_name),
      csvText(order.phone, true),
      csvText(order.city),
      csvText(meta.address),
      csvText(meta.orderType || 'طلب عادي'),
      csvText(meta.urgentFee || money(0)),
      csvText(getStatusMeta(order.status).label),
      csvText(Number(order.total || 0).toFixed(2)),
      csvText(getOrderItemsCount(order)),
      csvText(formatDate(order.created_at)),
      csvText(meta.customerNote),
      csvText(getDeliveryLocationSourceLabel(order, meta)),
      csvText(getDeliveryLocationUrl(order, meta)),
    ];
    lines.push(cols.join(','));
  });

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

document.addEventListener('click', async (e) => {
  const statCard = e.target.closest('.admin-stat-card');
  if (statCard) {
    const mode = statCard.dataset.filterMode;
    const status = statCard.dataset.status || '';
    if (mode === 'status') {
      if (statusFilter) statusFilter.value = status;
      activeStatFilter = 'all';
    } else if (mode === 'today') {
      activeStatFilter = 'today';
      if (statusFilter) statusFilter.value = '';
    } else if (mode === 'overdue') {
      activeStatFilter = 'overdue';
      if (statusFilter) statusFilter.value = '';
    } else {
      activeStatFilter = 'all';
      if (statusFilter && ['all', 'sales'].includes(statCard.dataset.statKey)) statusFilter.value = '';
    }
    applyFilters();
    return;
  }

  if (e.target.classList.contains('admin-details-btn')) {
    await toggleDetails(e.target.dataset.id);
    return;
  }

  if (e.target.classList.contains('copyOrderBtn')) {
    await copyText(e.target.dataset.number || '');
    showCopyToast('تم النسخ');
    return;
  }

  if (e.target.classList.contains('copyPhoneBtn')) {
    await copyText(e.target.dataset.phone || '');
    showCopyToast('تم النسخ');
    return;
  }
});

document.addEventListener('change', async (e) => {
  if (!e.target.classList.contains('statusSelect')) return;
  const id = e.target.dataset.id;
  const status = e.target.value;

  const { error } = await supabaseClient
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    alert('فشل تحديث الحالة');
    return;
  }

  const found = allOrders.find(o => String(o.id) === String(id));
  if (found) found.status = status;
  if (detailsCache.has(id)) {
    const cached = detailsCache.get(id);
    cached.status = status;
    detailsCache.set(id, cached);
  }
  applyFilters();
});

searchInput?.addEventListener('input', applyFilters);
statusFilter?.addEventListener('change', () => {
  activeStatFilter = 'all';
  applyFilters();
});
cityFilter?.addEventListener('change', () => {
  activeStatFilter = 'all';
  applyFilters();
});
dateFromInput?.addEventListener('change', applyFilters);
dateToInput?.addEventListener('change', applyFilters);
sortSelect?.addEventListener('change', applyFilters);
refreshBtn?.addEventListener('click', loadOrders);
clearFiltersBtn?.addEventListener('click', () => {
  if (searchInput) searchInput.value = '';
  if (statusFilter) statusFilter.value = '';
  if (dateFromInput) dateFromInput.value = '';
  if (dateToInput) dateToInput.value = '';
  if (cityFilter) cityFilter.value = '';
  if (sortSelect) sortSelect.value = 'newest';
  activeStatFilter = 'all';
  applyFilters();
});
exportCsvBtn?.addEventListener('click', exportCurrentViewToCsv);
logoutBtn?.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = './admin-login.html';
});

(async function init() {
  await requireAuth();
  await loadOrders();
})();
