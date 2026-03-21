const SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UgNH99IH4aP0aLN3OhH-Vw_w2-XqO_v';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ordersList = document.getElementById('ordersList');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const dateFromInput = document.getElementById('dateFrom');
const dateToInput = document.getElementById('dateTo');
const sortSelect = document.getElementById('sortSelect');
const ordersStats = document.getElementById('ordersStats');
const ordersCountLabel = document.getElementById('ordersCountLabel');
const adminLastUpdated = document.getElementById('adminLastUpdated');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

let allOrders = [];
let filteredOrders = [];
let detailsCache = new Map();
let isLoadingOrders = false;

const STATUS_MAP = {
  pending: { label: 'قيد المراجعة', className: 'is-pending', priority: 1 },
  confirmed: { label: 'تم التأكيد', className: 'is-confirmed', priority: 2 },
  processing: { label: 'قيد التجهيز', className: 'is-processing', priority: 3 },
  delivered: { label: 'تم التسليم', className: 'is-delivered', priority: 4 },
  cancelled: { label: 'ملغي', className: 'is-cancelled', priority: 5 },
};

async function requireAuth() {
  const { data } = await supabaseClient.auth.getUser();
  if (!data.user) window.location.href = './admin-login.html';
}

function money(v) {
  const n = Number(v || 0);
  return `${n.toFixed(2)} ج.م`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseItems(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeOrder(order) {
  const items = parseItems(order.items_json);
  return {
    ...order,
    total: Number(order.total || 0),
    items_json: items,
  };
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateShort(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-CA');
}

function getStatusMeta(status) {
  return STATUS_MAP[status] || { label: status || '-', className: '', priority: 99 };
}

function toWhatsAppLink(phone) {
  const normalized = String(phone || '').replace(/\D/g, '');
  if (!normalized) return '#';
  const e164 = normalized.startsWith('20')
    ? normalized
    : normalized.startsWith('0')
      ? `2${normalized}`
      : normalized;
  return `https://wa.me/${e164}`;
}

function isDateToday(value) {
  if (!value) return false;
  const d = new Date(value);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isNewOrder(order) {
  if (!order.created_at) return false;
  const diff = Date.now() - new Date(order.created_at).getTime();
  return diff <= 24 * 60 * 60 * 1000;
}

function isOverduePending(order) {
  if (order.status !== 'pending' || !order.created_at) return false;
  const diff = Date.now() - new Date(order.created_at).getTime();
  return diff >= 48 * 60 * 60 * 1000;
}

function getOrderAgeText(order) {
  if (!order.created_at) return '-';
  const diffMs = Date.now() - new Date(order.created_at).getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'منذ يوم';
  return `منذ ${diffDays} أيام`;
}

function getItemsCount(order) {
  return parseItems(order.items_json).reduce((sum, item) => sum + Number(item.qty || 0), 0);
}

function getTodayOrders(orders) {
  return orders.filter((order) => isDateToday(order.created_at));
}

function setLastUpdated() {
  if (!adminLastUpdated) return;
  adminLastUpdated.textContent = `آخر تحديث: ${formatDate(new Date().toISOString())}`;
}

function setLoadingState(isLoading) {
  isLoadingOrders = isLoading;
  if (refreshBtn) {
    refreshBtn.disabled = isLoading;
    refreshBtn.textContent = isLoading ? 'جارٍ التحديث...' : 'تحديث';
  }
}

async function loadOrders() {
  if (isLoadingOrders) return;

  setLoadingState(true);
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
    setLoadingState(false);
    return;
  }

  allOrders = (data || []).map(normalizeOrder);
  detailsCache = new Map();
  setLastUpdated();
  applyFilters();
  setLoadingState(false);
}

function renderStats(orders) {
  const todayOrders = getTodayOrders(orders);
  const todaySales = todayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const overduePending = orders.filter(isOverduePending).length;

  const items = [
    { key: 'all', title: 'إجمالي الطلبات', value: orders.length },
    { key: 'sales', title: 'إجمالي المبيعات', value: money(totalSales), className: 'is-sales' },
    { key: 'today', title: 'طلبات اليوم', value: todayOrders.length, className: 'is-today' },
    { key: 'today-sales', title: 'مبيعات اليوم', value: money(todaySales), className: 'is-today-sales' },
    { key: 'pending', title: 'قيد المراجعة', value: orders.filter(o => o.status === 'pending').length, filterStatus: 'pending' },
    { key: 'confirmed', title: 'تم التأكيد', value: orders.filter(o => o.status === 'confirmed').length, filterStatus: 'confirmed' },
    { key: 'processing', title: 'قيد التجهيز', value: orders.filter(o => o.status === 'processing').length, filterStatus: 'processing' },
    { key: 'delivered', title: 'تم التسليم', value: orders.filter(o => o.status === 'delivered').length, filterStatus: 'delivered' },
    { key: 'overdue', title: 'طلبات متأخرة', value: overduePending, className: 'is-urgent' },
  ];

  ordersStats.innerHTML = items.map((item) => `
    <article
      class="admin-stat-card ${item.className || ''} ${item.filterStatus ? 'is-clickable' : ''}"
      ${item.filterStatus ? `data-status-filter="${item.filterStatus}"` : ''}
    >
      <span>${item.title}</span>
      <strong>${item.value}</strong>
    </article>
  `).join('');
}

function renderDetailsHtml(order) {
  const items = parseItems(order.items_json);
  const itemsHtml = items.length
    ? items.map((item) => {
        const unitPrice = Number(item.price || 0);
        const qty = Number(item.qty || 0);
        const lineTotal = unitPrice * qty;
        return `
          <div class="admin-detail-item">
            <div>
              <strong>${escapeHtml(item.name || '-')}</strong>
              <span>الكمية: ${qty}</span>
            </div>
            <div class="admin-detail-prices">
              <span>سعر القطعة: ${money(unitPrice)}</span>
              <span>إجمالي المنتج: ${money(lineTotal)}</span>
            </div>
          </div>
        `;
      }).join('')
    : '<div class="admin-empty small">لا توجد تفاصيل منتجات.</div>';

  return `
    <div class="admin-details-grid">
      <div>
        <h4>المنتجات داخل الطلب</h4>
        <div class="admin-detail-items">${itemsHtml}</div>
      </div>

      <div class="admin-details-side">
        <h4>ملخص الطلب</h4>
        <div class="admin-info-box">
          <p><strong>رقم الطلب:</strong> ${escapeHtml(order.order_number || '-')}</p>
          <p><strong>الاسم:</strong> ${escapeHtml(order.customer_name || '-')}</p>
          <p><strong>الهاتف:</strong> ${escapeHtml(order.phone || '-')}</p>
          <p><strong>المدينة:</strong> ${escapeHtml(order.city || '-')}</p>
          <p><strong>إجمالي القطع:</strong> ${getItemsCount(order)}</p>
          <p><strong>الإجمالي:</strong> ${money(order.total)}</p>
          <p><strong>التاريخ:</strong> ${formatDate(order.created_at)}</p>
          <p><strong>المصدر:</strong> ${escapeHtml(order.source || '-')}</p>
          <p><strong>الملاحظات:</strong> ${escapeHtml(order.notes || 'لا يوجد')}</p>
        </div>
      </div>
    </div>
  `;
}

async function toggleDetails(id, triggerBtn) {
  const box = document.getElementById(`details-${id}`);
  if (!box) return;

  if (!box.classList.contains('hidden')) {
    box.classList.add('hidden');
    box.innerHTML = '';
    if (triggerBtn) triggerBtn.textContent = 'عرض التفاصيل';
    return;
  }

  box.classList.remove('hidden');
  box.innerHTML = '<div class="admin-empty small">جارٍ تحميل التفاصيل...</div>';
  if (triggerBtn) triggerBtn.textContent = 'إخفاء التفاصيل';

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
    if (triggerBtn) triggerBtn.textContent = 'عرض التفاصيل';
    return;
  }

  const normalized = normalizeOrder(data);
  detailsCache.set(id, normalized);
  box.innerHTML = renderDetailsHtml(normalized);
}

async function copyText(text) {
  const value = String(text || '');
  if (!value.trim()) return;

  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const el = document.createElement('textarea');
    el.value = value;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

function sortOrders(orders) {
  const sortValue = sortSelect?.value || 'newest';
  const sorted = [...orders];

  sorted.sort((a, b) => {
    if (sortValue === 'oldest') {
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    }

    if (sortValue === 'highest_total') {
      return Number(b.total || 0) - Number(a.total || 0);
    }

    if (sortValue === 'lowest_total') {
      return Number(a.total || 0) - Number(b.total || 0);
    }

    if (sortValue === 'pending_first') {
      const statusDiff = getStatusMeta(a.status).priority - getStatusMeta(b.status).priority;
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }

    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return sorted;
}

function renderOrders(orders) {
  ordersCountLabel.textContent = `عدد النتائج: ${orders.length} من أصل ${allOrders.length}`;

  if (!orders.length) {
    ordersList.innerHTML = '<div class="admin-empty">لا توجد طلبات مطابقة للفلاتر الحالية.</div>';
    return;
  }

  ordersList.innerHTML = orders.map((order) => {
    const status = getStatusMeta(order.status);
    const itemsCount = getItemsCount(order);
    const isNew = isNewOrder(order);
    const isOverdue = isOverduePending(order);

    return `
      <article class="admin-order-card ${isOverdue ? 'is-overdue-card' : ''}" data-order-id="${order.id}">
        <div class="admin-order-grid">
          <div class="admin-order-col admin-order-main">
            <div class="admin-order-title-row">
              <h3>${escapeHtml(order.order_number || '-')}</h3>
              <div class="admin-order-badges">
                <span class="admin-status-badge ${status.className}">${status.label}</span>
                ${isNew ? '<span class="admin-meta-chip is-new">جديد</span>' : ''}
                ${isOverdue ? '<span class="admin-meta-chip is-overdue">متأخر</span>' : ''}
              </div>
            </div>

            <div class="admin-order-identity">
              <p><strong>الاسم:</strong> ${escapeHtml(order.customer_name || '-')}</p>
              <p><strong>الهاتف:</strong> ${escapeHtml(order.phone || '-')}</p>
              <p><strong>المدينة:</strong> ${escapeHtml(order.city || '-')}</p>
            </div>

            <div class="admin-order-highlights">
              <span class="admin-meta-chip">عدد القطع: ${itemsCount}</span>
              <span class="admin-meta-chip">العمر: ${getOrderAgeText(order)}</span>
              <span class="admin-meta-chip">التاريخ: ${formatDateShort(order.created_at)}</span>
            </div>
          </div>

          <div class="admin-order-col admin-order-summary">
            <div class="admin-order-price">الإجمالي: <strong>${money(order.total)}</strong></div>
            <div class="admin-order-date">التاريخ الكامل: ${formatDate(order.created_at)}</div>

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
          </div>

          <div class="admin-order-col admin-order-side">
            <div class="admin-order-actions">
              <button type="button" class="btn btn-ghost copyOrderBtn" data-number="${escapeHtml(order.order_number || '')}">نسخ الرقم</button>
              <button type="button" class="btn btn-ghost copyPhoneBtn" data-phone="${escapeHtml(order.phone || '')}">نسخ الهاتف</button>
              <a class="btn btn-ghost" href="${toWhatsAppLink(order.phone)}" target="_blank" rel="noopener">واتساب</a>
              <button type="button" class="btn btn-ghost admin-details-btn" data-id="${order.id}">عرض التفاصيل</button>
            </div>
          </div>
        </div>

        <div class="admin-order-details hidden" id="details-${order.id}"></div>
      </article>
    `;
  }).join('');
}

function applyFilters() {
  const q = String(searchInput?.value || '').trim().toLowerCase();
  const status = statusFilter?.value || '';
  const fromDate = dateFromInput?.value || '';
  const toDate = dateToInput?.value || '';

  const filtered = allOrders.filter((order) => {
    const matchesSearch =
      String(order.order_number || '').toLowerCase().includes(q) ||
      String(order.customer_name || '').toLowerCase().includes(q) ||
      String(order.phone || '').toLowerCase().includes(q);

    const matchesStatus = !status || order.status === status;

    const createdAt = order.created_at ? new Date(order.created_at) : null;
    const matchesFrom = !fromDate || (createdAt && createdAt >= new Date(`${fromDate}T00:00:00`));
    const matchesTo = !toDate || (createdAt && createdAt <= new Date(`${toDate}T23:59:59`));

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  filteredOrders = sortOrders(filtered);
  renderStats(filteredOrders);
  renderOrders(filteredOrders);
}

function clearFilters() {
  if (searchInput) searchInput.value = '';
  if (statusFilter) statusFilter.value = '';
  if (dateFromInput) dateFromInput.value = '';
  if (dateToInput) dateToInput.value = '';
  if (sortSelect) sortSelect.value = 'newest';
  applyFilters();
}

function convertOrdersToCsvRows(orders) {
  const headers = [
    'order_number',
    'customer_name',
    'phone',
    'city',
    'status',
    'total',
    'items_count',
    'created_at',
    'source',
    'notes',
    'items_summary',
  ];

  const rows = orders.map((order) => {
    const items = parseItems(order.items_json);
    const itemsSummary = items.map((item) => `${item.name || '-'} x${item.qty || 0}`).join(' | ');
    return [
      order.order_number || '',
      order.customer_name || '',
      order.phone || '',
      order.city || '',
      order.status || '',
      Number(order.total || 0).toFixed(2),
      getItemsCount(order),
      order.created_at || '',
      order.source || '',
      order.notes || '',
      itemsSummary,
    ];
  });

  return [headers, ...rows];
}

function exportFilteredOrders() {
  if (!filteredOrders.length) {
    alert('لا توجد نتائج حالية لتصديرها.');
    return;
  }

  const rows = convertOrdersToCsvRows(filteredOrders);
  const csv = rows
    .map((row) => row.map((cell) => {
      const value = String(cell ?? '').replace(/"/g, '""');
      return `"${value}"`;
    }).join(','))
    .join('\n');

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateLabel = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `zhraa-orders-${dateLabel}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

document.addEventListener('click', async (e) => {
  const detailsBtn = e.target.closest('.admin-details-btn');
  if (detailsBtn) {
    await toggleDetails(detailsBtn.dataset.id, detailsBtn);
    return;
  }

  const copyOrderBtn = e.target.closest('.copyOrderBtn');
  if (copyOrderBtn) {
    await copyText(copyOrderBtn.dataset.number || '');
    copyOrderBtn.textContent = 'تم النسخ';
    setTimeout(() => { copyOrderBtn.textContent = 'نسخ الرقم'; }, 1400);
    return;
  }

  const copyPhoneBtn = e.target.closest('.copyPhoneBtn');
  if (copyPhoneBtn) {
    await copyText(copyPhoneBtn.dataset.phone || '');
    copyPhoneBtn.textContent = 'تم النسخ';
    setTimeout(() => { copyPhoneBtn.textContent = 'نسخ الهاتف'; }, 1400);
    return;
  }

  const statCard = e.target.closest('[data-status-filter]');
  if (statCard) {
    statusFilter.value = statCard.dataset.statusFilter || '';
    applyFilters();
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

  const found = allOrders.find((order) => String(order.id) === String(id));
  if (found) found.status = status;

  if (detailsCache.has(id)) {
    const cached = detailsCache.get(id);
    cached.status = status;
    detailsCache.set(id, cached);
  }

  applyFilters();
});

searchInput?.addEventListener('input', applyFilters);
statusFilter?.addEventListener('change', applyFilters);
dateFromInput?.addEventListener('change', applyFilters);
dateToInput?.addEventListener('change', applyFilters);
sortSelect?.addEventListener('change', applyFilters);
refreshBtn?.addEventListener('click', loadOrders);
exportCsvBtn?.addEventListener('click', exportFilteredOrders);
clearFiltersBtn?.addEventListener('click', clearFilters);
logoutBtn?.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = './admin-login.html';
});

(async function init() {
  await requireAuth();
  await loadOrders();
})();
