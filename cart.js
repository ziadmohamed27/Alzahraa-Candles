const SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UgNH99IH4aP0aLN3OhH-Vw_w2-XqO_v';

const $ = (s) => document.querySelector(s);
const money = (v) => `${Number(v).toFixed(2)} ج.م`;

let supabaseClient = null;
let isSubmittingOrder = false;

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

function readCart() {
  try {
    const raw = localStorage.getItem('soap-cart');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem('soap-cart', JSON.stringify(cart));
}

const state = {
  cart: readCart(),
};

function updateCartCount() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  const el = $('#cartCount');
  if (el) el.textContent = count;
}

function validatePhone(phone) {
  const normalized = phone.replace(/\s+/g, '');
  return /^01[0-2,5][0-9]{8}$/.test(normalized);
}

function getOrderFormData() {
  const customerName = $('#customerName')?.value?.trim() || '';
  const customerPhone = $('#customerPhone')?.value?.trim() || '';
  const customerCity = $('#customerCity')?.value?.trim() || '';
  const customerNotes = $('#customerNotes')?.value?.trim() || '';

  return {
    customerName,
    customerPhone,
    customerCity,
    customerNotes,
  };
}

function renderCartItems() {
  const el = $('#cartPageItems');
  if (!el) return;

  if (!state.cart.length) {
    el.innerHTML = `
      <div class="empty cart-page-empty">
        السلة فارغة حاليًا. ابدأ بإضافة بعض المنتجات أولًا.
      </div>
    `;
    return;
  }

  el.innerHTML = state.cart.map((item) => `
    <article class="cart-page-item">
      <div class="cart-page-item-image">
        <img src="${item.image}" alt="${escHtml(item.name)}" onerror="this.style.background='#eee';this.removeAttribute('src')">
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
            <strong>${item.qty}</strong>
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

  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = state.cart.reduce((s, i) => s + i.qty, 0);

  el.innerHTML = `
    <h3>ملخص الطلب</h3>

    <div class="cart-summary">
      <div class="cart-summary-row"><span>عدد القطع</span><strong>${totalItems}</strong></div>
      <div class="cart-summary-row"><span>المجموع الفرعي</span><strong class="price">${money(total)}</strong></div>
      <div class="cart-summary-row"><span>الشحن</span><strong>يتم تأكيده حسب المنطقة</strong></div>
      <div class="cart-summary-row total-row"><span>الإجمالي</span><strong class="price">${money(total)}</strong></div>
    </div>

    <p class="helper">
      سيتم تجهيز رسالة واتساب تلقائيًا تحتوي على تفاصيل الطلب، ثم نؤكد معك العنوان والشحن.
    </p>

    <button class="btn btn-whatsapp cart-page-submit" id="checkoutBtn" type="button" ${!state.cart.length ? 'disabled' : ''}>
      ${isSubmittingOrder ? 'جارٍ تجهيز الطلب...' : 'إرسال الطلب عبر واتساب'}
    </button>

    <a href="./index.html#products" class="btn btn-ghost cart-page-back-btn">إكمال التسوق</a>
  `;
}

function persistAndRender() {
  writeCart(state.cart);
  updateCartCount();
  renderCartItems();
  renderSummary();
}

function clearCartAndForm() {
  state.cart = [];
  writeCart([]);
  updateCartCount();
  renderCartItems();
  renderSummary();

  const fields = ['#customerName', '#customerPhone', '#customerCity', '#customerNotes'];
  fields.forEach((selector) => {
    const el = $(selector);
    if (el) el.value = '';
  });
}

async function saveOrderToSupabase() {
  if (!supabaseClient) return;

  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const { customerName, customerPhone, customerCity, customerNotes } = getOrderFormData();

  const payload = {
    customer_name: customerName || 'طلب من الموقع',
    phone: customerPhone,
    city: customerCity,
    notes: customerNotes || 'لا يوجد',
    items_json: state.cart,
    total,
    status: 'pending',
    source: 'website',
  };

  const { error } = await supabaseClient.from('orders').insert([payload]);
  if (error) throw new Error(error.message || 'تعذر حفظ الطلب');
}

async function checkout() {
  if (!state.cart.length) {
    showToast('السلة فارغة');
    return;
  }

  if (isSubmittingOrder) return;

  const { customerName, customerPhone, customerCity, customerNotes } = getOrderFormData();

  if (!customerName || !customerPhone || !customerCity) {
    showToast('من فضلك املأ الاسم والموبايل والمدينة');
    return;
  }

  if (!validatePhone(customerPhone)) {
    showToast('اكتب رقم موبايل مصري صحيح');
    return;
  }

  isSubmittingOrder = true;
  renderSummary();

  try {
    const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
    const lines = state.cart
      .map((i, n) => `${n + 1}. ${i.name}\nالكمية: ${i.qty}\nالسعر: ${money(i.price * i.qty)}`)
      .join('\n\n');

    const msg =
      `مرحبًا، أريد إتمام الطلب:\n\n` +
      `الاسم: ${customerName}\n` +
      `الموبايل: ${customerPhone}\n` +
      `المدينة: ${customerCity}\n` +
      `ملاحظات: ${customerNotes || 'لا يوجد'}\n\n` +
      `المنتجات:\n\n${lines}\n\n` +
      `الإجمالي: ${money(total)}\n` +
      `الشحن: يتم تأكيده حسب المنطقة`;

    await saveOrderToSupabase();

    window.open(`https://wa.me/201095314011?text=${encodeURIComponent(msg)}`, '_blank');

    clearCartAndForm();
    showToast('تم تجهيز الطلب بنجاح');

    setTimeout(() => {
      window.location.href = './index.html#products';
    }, 1800);
  } catch (err) {
    console.error('[Checkout] failed:', err);
    showToast('حدثت مشكلة أثناء حفظ الطلب');
  } finally {
    isSubmittingOrder = false;
    renderSummary();
  }
}

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
    persistAndRender();
    showToast('تم تفريغ السلة');
  }
});

function init() {
  updateCartCount();
  renderCartItems();
  renderSummary();
}

document.addEventListener('DOMContentLoaded', init);
