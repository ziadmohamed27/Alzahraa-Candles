const SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UgNH99IH4aP0aLN3OhH-Vw_w2-XqO_v';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ordersList = document.getElementById('ordersList');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const ordersStats = document.getElementById('ordersStats');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const ordersMeta = document.getElementById('ordersMeta');
const toast = document.getElementById('toast');

let allOrders = [];
let detailsCache = new Map();

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function money(v) {
  const n = Number(v || 0);
  return `${n.toFixed(2)} ج.م`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
}

function statusBadge(status) {
  const safe = String(status || 'pending');
  return `<span class="admin-status-badge ${safe}">${escapeHtml(safe)}</span>`;
}

async function requireAuth() {
  const { data } = await supabaseClient.auth.getUser();
  if (!data.user) {
    window.location.href = './admin-login.html';
  }
}

function renderStats(orders) {
  const counts = { pending:0, confirmed:0, processing:0, delivered:0, cancelled:0 };
  orders.forEach(o => counts[o.status] = (counts[o.status] || 0) + 1);
  const totalSales = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  ordersStats.innerHTML = `
    <div class="admin-stat-card"><span>إجمالي الطلبات</span><strong>${orders.length}</strong></div>
    <div class="admin-stat-card"><span>Pending</span><strong>${counts.pending}</strong></div>
    <div class="admin-stat-card"><span>Confirmed</span><strong>${counts.confirmed}</strong></div>
    <div class="admin-stat-card"><span>Processing</span><strong>${counts.processing}</strong></div>
    <div class="admin-stat-card"><span>Delivered</span><strong>${counts.delivered}</strong></div>
    <div class="admin-stat-card"><span>Cancelled</span><strong>${counts.cancelled}</strong></div>
    <div class="admin-stat-card"><span>إجمالي المبيعات</span><strong>${money(totalSales)}</strong></div>
  `;
}

function renderOrderItems(items) {
  if (!Array.isArray(items) || !items.length) return '<p>لا توجد منتجات.</p>';
  return items.map(item => `
    <div class="admin-item-row">
      <strong>${escapeHtml(item.name || '-')}</strong>
      <span>الكمية: ${escapeHtml(item.qty || 0)}</span>
      <span>سعر القطعة: ${money(item.price || 0)}</span>
      <span>الإجمالي: ${money((Number(item.price)||0) * (Number(item.qty)||0))}</span>
    </div>
  `).join('');
}

function renderDetails(order) {
  return `
    <div class="admin-order-body">
      <div class="admin-order-items">${renderOrderItems(order.items_json)}</div>
      <div class="admin-order-extra">
        <p><strong>ملاحظات:</strong> ${escapeHtml(order.notes || 'لا يوجد')}</p>
        <p><strong>المصدر:</strong> ${escapeHtml(order.source || '-')}</p>
      </div>
    </div>
  `;
}

function renderOrders(orders) {
  if (!orders.length) {
    ordersList.innerHTML = '<div class="admin-empty">لا توجد طلبات مطابقة.</div>';
    ordersMeta.textContent = '';
    return;
  }

  ordersMeta.textContent = `عدد النتائج: ${orders.length}`;

  ordersList.innerHTML = orders.map(order => `
    <article class="admin-order-card" data-id="${order.id}">
      <div class="admin-order-top">
        <div class="admin-order-main">
          <h3>${escapeHtml(order.order_number || '-')}</h3>
          <p><strong>الاسم:</strong> ${escapeHtml(order.customer_name || '-')}</p>
          <p><strong>الهاتف:</strong> ${escapeHtml(order.phone || '-')}</p>
          <p><strong>المدينة:</strong> ${escapeHtml(order.city || '-')}</p>
          ${statusBadge(order.status)}
        </div>

        <div class="admin-order-side">
          <p><strong>الإجمالي:</strong> ${money(order.total)}</p>
          <p><strong>التاريخ:</strong> ${formatDate(order.created_at)}</p>
          <select data-id="${order.id}" class="statusSelect">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>pending</option>
            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>confirmed</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>processing</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>cancelled</option>
          </select>
          <div class="admin-order-actions">
            <button class="btn btn-ghost btn-sm copyOrderBtn" type="button" data-order-number="${escapeHtml(order.order_number || '')}">نسخ الرقم</button>
            <a class="btn btn-ghost btn-sm" target="_blank" href="https://wa.me/2${encodeURIComponent(String(order.phone || '').replace(/\s+/g,''))}">واتساب</a>
          </div>
        </div>
      </div>

      <button class="btn btn-ghost btn-sm admin-order-details-btn" type="button" data-view-details="${order.id}">عرض التفاصيل</button>
      <div class="admin-details-slot" id="details-${order.id}"></div>
    </article>
  `).join('');
}

function applyFilters() {
  const q = (searchInput?.value || '').trim().toLowerCase();
  const status = statusFilter?.value || '';

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

async function loadOrders() {
  ordersList.innerHTML = '<div class="admin-loading">جارٍ تحميل الطلبات...</div>';
  ordersMeta.textContent = '';

  let data = null;
  let error = null;

  const viewRes = await supabaseClient
    .from('orders_dashboard')
    .select('*')
    .order('created_at', { ascending: false });

  data = viewRes.data;
  error = viewRes.error;

  if (error) {
    const fallbackRes = await supabaseClient
      .from('orders')
      .select('id,order_number,customer_name,phone,city,total,status,source,created_at')
      .order('created_at', { ascending: false });

    data = fallbackRes.data;
    error = fallbackRes.error;
  }

  if (error) {
    ordersList.innerHTML = '<div class="admin-empty">فشل تحميل الطلبات.</div>';
    console.error(error);
    return;
  }

  allOrders = Array.isArray(data) ? data : [];
  applyFilters();
}

async function fetchOrderDetails(id) {
  if (detailsCache.has(id)) return detailsCache.get(id);

  const { data, error } = await supabaseClient
    .from('orders')
    .select('id,items_json,notes,source')
    .eq('id', id)
    .single();

  if (error) throw error;
  detailsCache.set(id, data);
  return data;
}

async function copyText(text) {
  const value = String(text || '').trim();
  if (!value) return showToast('لا يوجد رقم لنسخه');

  try {
    await navigator.clipboard.writeText(value);
    showToast('تم نسخ رقم الطلب');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(ok ? 'تم نسخ رقم الطلب' : 'تعذر نسخ الرقم');
  }
}

document.addEventListener('click', async (e) => {
  const copyBtn = e.target.closest('.copyOrderBtn');
  if (copyBtn) {
    copyText(copyBtn.dataset.orderNumber || '');
    return;
  }

  const detailsBtn = e.target.closest('[data-view-details]');
  if (!detailsBtn) return;

  const id = detailsBtn.dataset.viewDetails;
  const slot = document.getElementById(`details-${id}`);
  if (!slot) return;

  if (slot.innerHTML.trim()) {
    slot.innerHTML = '';
    detailsBtn.textContent = 'عرض التفاصيل';
    return;
  }

  detailsBtn.disabled = true;
  detailsBtn.textContent = 'جارٍ التحميل...';
  slot.innerHTML = '<div class="admin-loading">جارٍ تحميل التفاصيل...</div>';

  try {
    const details = await fetchOrderDetails(id);
    slot.innerHTML = renderDetails(details);
    detailsBtn.textContent = 'إخفاء التفاصيل';
  } catch (err) {
    console.error(err);
    slot.innerHTML = '<div class="admin-empty">تعذر تحميل التفاصيل.</div>';
    detailsBtn.textContent = 'عرض التفاصيل';
  } finally {
    detailsBtn.disabled = false;
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
    showToast('فشل تحديث الحالة');
    console.error(error);
    return;
  }

  const order = allOrders.find(o => String(o.id) === String(id));
  if (order) order.status = status;

  applyFilters();
  showToast('تم تحديث الحالة');
});

searchInput?.addEventListener('input', applyFilters);
statusFilter?.addEventListener('change', applyFilters);
refreshBtn?.addEventListener('click', loadOrders);
logoutBtn?.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = './admin-login.html';
});

(async function init() {
  await requireAuth();
  await loadOrders();
})();