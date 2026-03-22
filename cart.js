const SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UgNH99IH4aP0aLN3OhH-Vw_w2-XqO_v';

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

function showOrderSuccess(orderNumber) {
  const box = $('#orderSuccessBox');
  if (!box) return;

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

  box.classList.remove('hidden');
  box.classList.add('show');
  document.body.classList.add('order-submitted');
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  launchSoapBubbles();
}

function launchSoapBubbles() {
  const container = document.createElement('div');
  container.className = 'soap-bubbles-layer';

  for (let i = 0; i < 20; i += 1) {
    const bubble = document.createElement('span');
    bubble.className = 'soap-bubble';
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
    const raw = localStorage.getItem('soap-cart');
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
  localStorage.setItem('soap-cart', JSON.stringify(cart));
}

const state = {
  cart: readCart(),
};

const CUSTOMER_STORAGE_KEY = 'soap-customer-info';

function saveCustomerInfo() {
  const payload = {
    name: $('#customerName')?.value?.trim() || '',
    phone: $('#customerPhone')?.value?.trim() || '',
    city: $('#customerCity')?.value?.trim() || '',
    notes: $('#customerNotes')?.value?.trim() || '',
    urgent: !!$('#isUrgentOrder')?.checked,
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
    if ($('#customerNotes')) $('#customerNotes').value = data.notes || '';
    if ($('#isUrgentOrder')) $('#isUrgentOrder').checked = !!data.urgent;
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
  const customerNotes = $('#customerNotes')?.value?.trim() || '';
  const isUrgent = isUrgentOrderSelected();

  return {
    customerName,
    customerPhone,
    customerCity,
    customerNotes,
    isUrgent,
  };
}

function calculateCartTotal() {
  return state.cart.reduce((s, i) => s + (toSafeNumber(i.price, 0) * toSafeNumber(i.qty, 0)), 0);
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
        <p>${orderSubmittedSuccessfully ? 'تم إرسال طلبك، والسلة فارغة الآن.' : 'السلة فارغة حاليًا.'}</p>
        <a href="./index.html#products" class="btn btn-ghost cart-empty-btn">
          ${orderSubmittedSuccessfully ? 'العودة للمنتجات' : 'ابدأ التسوق'}
        </a>
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
            <input class="qty-input" data-action="set-qty" data-id="${item.id}" type="number" inputmode="numeric" min="1" step="1" value="${item.qty}" aria-label="كمية ${escHtml(item.name)}">
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

  const fields = ['#customerName', '#customerPhone', '#customerCity', '#customerNotes'];
  fields.forEach((selector) => {
    const el = $(selector);
    if (el) el.value = '';
  });

  if ($('#isUrgentOrder')) $('#isUrgentOrder').checked = false;

  updateCartCount();
  renderCartItems();
  renderSummary();
}

function buildOrderPayload(orderNumber) {
  const subtotal = calculateCartTotal();
  const urgentFee = calculateUrgentFee(subtotal);
  const total = subtotal + urgentFee;
  const { customerName, customerPhone, customerCity, customerNotes, isUrgent } = getOrderFormData();

  const notesParts = [];
  if (customerNotes) notesParts.push(customerNotes);
  if (isUrgent) notesParts.push(`طلب مستعجل (+${money(urgentFee)})`);

  return {
    order_number: orderNumber,
    customer_name: customerName || 'طلب من الموقع',
    phone: customerPhone,
    city: customerCity,
    notes: notesParts.join(' | ') || 'لا يوجد',
    items_json: state.cart,
    total,
    status: 'pending',
    source: 'website',
  };
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
    return { ok: true, orderNumber };
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

function buildWhatsAppMessage(orderNumber, customerName, customerPhone, customerCity, customerNotes, isUrgent) {
  const subtotal = calculateCartTotal();
  const urgentFee = calculateUrgentFee(subtotal);
  const grandTotal = subtotal + urgentFee;

  const lines = state.cart
    .map((i, n) =>
      `${n + 1}. ${i.name}\nالكمية: ${i.qty}\nسعر القطعة: ${money(toSafeNumber(i.price, 0))}\nإجمالي المنتج: ${money(toSafeNumber(i.price, 0) * toSafeNumber(i.qty, 0))}`
    )
    .join('\n\n');

  return (
    `مرحبًا، أريد إتمام الطلب:\n\n` +
    `رقم الطلب: ${orderNumber}\n` +
    `الاسم: ${customerName}\n` +
    `الموبايل: ${customerPhone}\n` +
    `المدينة: ${customerCity}\n` +
    `ملاحظات: ${customerNotes || 'لا يوجد'}\n` +
    `حالة الطلب: ${isUrgent ? 'طلب مستعجل' : 'طلب عادي'}\n\n` +
    `المنتجات:\n\n${lines}\n\n` +
    `المجموع الفرعي: ${money(subtotal)}\n` +
    `${isUrgent ? `رسوم الطلب المستعجل: ${money(urgentFee)}\n` : ''}` +
    `الإجمالي الحالي قبل الشحن: ${money(grandTotal)}\n` +
    `الشحن: (+ مصاريف الشحن) ويتم تأكيده حسب المنطقة`
  );
}

async function checkout() {
  if (!state.cart.length) {
    showToast('السلة فارغة');
    return;
  }

  if (isSubmittingOrder || orderSubmittedSuccessfully) return;

  const { customerName, customerPhone, customerCity, customerNotes, isUrgent } = getOrderFormData();

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
    const { orderNumber } = await saveOrderWithUniqueNumber(3);
    const msg = buildWhatsAppMessage(orderNumber, customerName, customerPhone, customerCity, customerNotes, isUrgent);

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
});

function init() {
  updateCartCount();
  loadCustomerInfo();
  renderCartItems();
  renderSummary();
}
document.addEventListener('DOMContentLoaded', init);
