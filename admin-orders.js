const SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UgNH99IH4aP0aLN3OhH-Vw_w2-XqO_v';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ordersList = document.getElementById('ordersList');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const ordersStats = document.getElementById('ordersStats');
const ordersCountLabel = document.getElementById('ordersCountLabel');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');

let allOrders = [];
let detailsCache = new Map();

const STATUS_MAP = {
  pending: { label: 'قيد المراجعة', className: 'is-pending' },
  confirmed: { label: 'تم التأكيد', className: 'is-confirmed' },
  processing: { label: 'قيد التجهيز', className: 'is-processing' },
  delivered: { label: 'تم التسليم', className: 'is-delivered' },
  cancelled: { label: 'ملغي', className: 'is-cancelled' },
};

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

function getStatusMeta(status) {
  return STATUS_MAP[status] || { label: status || '-', className: '' };
}

function toWhatsAppLink(phone) {
  const normalized = String(phone || '').replace(/\D/g, '');
  if (!normalized) return '#';
  const e164 = normalized.startsWith('20') ? normalized : normalized.startsWith('0') ? `2${normalized}` : normalized;
  return `https://wa.me/${e164}`;
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
  applyFilters();
}

function renderStats(orders) {
  const totalSales = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const items = [
    { key: 'all', title: 'إجمالي الطلبات', value: orders.length },
    { key: 'pending', title: 'قيد المراجعة', value: orders.filter(o => o.status === 'pending').length },
    { key: 'confirmed', title: 'تم التأكيد', value: orders.filter(o => o.status === 'confirmed').length },
    { key: 'processing', title: 'قيد التجهيز', value: orders.filter(o => o.status === 'processing').length },
    { key: 'delivered', title: 'تم التسليم', value: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', title: 'ملغي', value: orders.filter(o => o.status === 'cancelled').length },
    { key: 'sales', title: 'إجمالي المبيعات', value: money(totalSales) },
  ];

  ordersStats.innerHTML = items.map(item => `
    <article class="admin-stat-card ${item.key === 'sales' ? 'is-sales' : ''}">
      <span>${item.title}</span>
      <strong>${item.value}</strong>
    </article>
  `).join('');
}

function renderOrders(orders) {
  ordersCountLabel.textContent = `عدد النتائج: ${orders.length}`;

  if (!orders.length) {
    ordersList.innerHTML = '<div class="admin-empty">لا توجد طلبات مطابقة.</div>';
    return;
  }

  ordersList.innerHTML = orders.map(order => {
    const status = getStatusMeta(order.status);
    return `
      <article class="admin-order-card" data-order-id="${order.id}">
        <div class="admin-order-grid">
          <div class="admin-order-col admin-order-summary">
            <div class="admin-order-price">الإجمالي: <strong>${money(order.total)}</strong></div>
            <div class="admin-order-date">التاريخ: ${formatDate(order.created_at)}</div>

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
              <button type="button" class="btn btn-ghost copyOrderBtn" data-number="${escapeHtml(order.order_number || '')}">نسخ الرقم</button>
              <a class="btn btn-ghost" href="${toWhatsAppLink(order.phone)}" target="_blank" rel="noopener">واتساب</a>
            </div>
          </div>

          <div class="admin-order-col admin-order-main">
            <h3>${escapeHtml(order.order_number || '-')}</h3>
            <p><strong>الاسم:</strong> ${escapeHtml(order.customer_name || '-')}</p>
            <p><strong>الهاتف:</strong> ${escapeHtml(order.phone || '-')}</p>
            <p><strong>المدينة:</strong> ${escapeHtml(order.city || '-')}</p>
            <p><strong>عدد القطع:</strong> ${getOrderItemsCount(order)}</p>
          </div>

          <div class="admin-order-col admin-order-side">
            <span class="admin-status-badge ${status.className}">${status.label}</span>
            <button type="button" class="btn btn-ghost admin-details-btn" data-id="${order.id}">عرض التفاصيل</button>
          </div>
        </div>

        <div class="admin-order-details hidden" id="details-${order.id}"></div>
      </article>
    `;
  }).join('');
}

function applyFilters() {
  const q = String(searchInput.value || '').trim().toLowerCase();
  const status = statusFilter.value;

  const filtered = allOrders.filter(order => {
    const matchesSearch =
      String(order.order_number || '').toLowerCase().includes(q) ||
      String(order.customer_name || '').toLowerCase().includes(q) ||
      String(order.phone || '').toLowerCase().includes(q);
    const matchesStatus = !status || order.status === status;
    return matchesSearch && matchesStatus;
  });

  renderStats(filtered);
  renderOrders(filtered);
}

function renderDetailsHtml(order) {
  const items = Array.isArray(order.items_json) ? order.items_json : [];
  const itemsCount = getOrderItemsCount(order);
  const itemsHtml = items.length ? items.map(item => {
    const qty = Math.max(0, toSafeInt(item.qty, 0));
    const price = Number(item.price || 0);
    return `
    <div class="admin-detail-item">
      <strong>${escapeHtml(item.name || '-')}</strong>
      <span>الكمية: ${qty}</span>
      <span>سعر القطعة: ${money(price)}</span>
      <span>إجمالي المنتج: ${money(price * qty)}</span>
    </div>
  `;}).join('') : '<div class="admin-empty small">لا توجد تفاصيل منتجات.</div>';

  return `
    <div class="admin-details-grid">
      <div>
        <h4>المنتجات</h4>
        <p><strong>عدد القطع:</strong> ${itemsCount}</p>
        <div class="admin-detail-items">${itemsHtml}</div>
      </div>
      <div>
        <h4>تفاصيل إضافية</h4>
        <p><strong>الملاحظات:</strong> ${escapeHtml(order.notes || 'لا يوجد')}</p>
        <p><strong>المصدر:</strong> ${escapeHtml(order.source || '-')}</p>
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

document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('admin-details-btn')) {
    await toggleDetails(e.target.dataset.id);
    return;
  }

  if (e.target.classList.contains('copyOrderBtn')) {
    await copyText(e.target.dataset.number || '');
    e.target.textContent = 'تم النسخ';
    setTimeout(() => { e.target.textContent = 'نسخ الرقم'; }, 1400);
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

searchInput.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);
refreshBtn.addEventListener('click', loadOrders);
logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = './admin-login.html';
});

(async function init() {
  await requireAuth();
  await loadOrders();
})();
