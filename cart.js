const SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UgNH99IH4aP0aLN3OhH-Vw_w2-XqO_v';
const WHATSAPP_NUMBER = '201095314011';
const CUSTOMER_STORAGE_KEY = 'soap-customer-info';
const URGENT_RATE = 0.05;
const URGENT_MIN_FEE = 10;
const ORDER_NOTE_PREFIXES = {
  address: 'العنوان:',
  customerNote: 'ملاحظات العميل:',
  orderType: 'نوع الطلب:',
  urgentFee: 'رسوم الطلب المستعجل:',
  shipping: 'الشحن:',
};

const $ = (s) => document.querySelector(s);

let supabaseClient = null;
let isSubmittingOrder = false;
let orderSubmittedSuccessfully = false;
let lastSubmittedOrderNumber = '';
let activeCheckoutMode = null;
let currentUser = null;
let currentProfile = null;

(function initSupabase() {
  if (!window.supabase || !SUPABASE_ANON_KEY) return;
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();

function toSafeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function money(v) {
  return `${toSafeNumber(v, 0).toFixed(2)} ج.م`;
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1200);
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

function sanitizeCartItem(item) {
  if (!item || typeof item !== 'object') return null;
  const id = toSafeNumber(item.id, NaN);
  const price = toSafeNumber(item.price, NaN);
  const qty = Math.max(1, Math.floor(toSafeNumber(item.qty, 1)));
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  const image = typeof item.image === 'string' ? item.image.trim() : '';
  const weight = typeof item.weight === 'string' ? item.weight.trim() : '';

  if (!Number.isFinite(id) || !Number.isFinite(price) || !name) return null;
  return { ...item, id, price, qty, name, image, weight };
}

function readCart() {
  try {
    const raw = localStorage.getItem('soap-cart');
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeCartItem).filter(Boolean);
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem('soap-cart', JSON.stringify(cart));
}

const state = { cart: readCart() };

function saveCustomerInfo() {
  const payload = {
    name: $('#customerName')?.value?.trim() || '',
    phone: $('#customerPhone')?.value?.trim() || '',
    city: $('#customerCity')?.value?.trim() || '',
    address: $('#customerAddress')?.value?.trim() || '',
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
    if ($('#customerAddress')) $('#customerAddress').value = data.address || '';
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
    showToast('لا يوجد ما يُنسخ');
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      showToast('تم النسخ');
      return;
    }
    const ok = fallbackCopyText(value);
    showToast(ok ? 'تم النسخ' : 'تعذر النسخ');
  } catch {
    const ok = fallbackCopyText(value);
    showToast(ok ? 'تم النسخ' : 'تعذر النسخ');
  }
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

function calculateCartTotal() {
  return state.cart.reduce((s, i) => s + (toSafeNumber(i.price, 0) * toSafeNumber(i.qty, 0)), 0);
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
  return {
    customerName: $('#customerName')?.value?.trim() || '',
    customerPhone: $('#customerPhone')?.value?.trim() || '',
    customerCity: $('#customerCity')?.value?.trim() || '',
    customerAddress: $('#customerAddress')?.value?.trim() || '',
    customerNotes: $('#customerNotes')?.value?.trim() || '',
    isUrgent: isUrgentOrderSelected(),
  };
}

function sanitizeLineBreaks(value) {
  return String(value || '').replace(/\r/g, '').split('\n').map((line) => line.trim()).filter(Boolean).join(' / ');
}

function buildStructuredNotes({ customerAddress, customerNotes, isUrgent, urgentFee }) {
  return [
    `${ORDER_NOTE_PREFIXES.address} ${sanitizeLineBreaks(customerAddress) || 'لا يوجد'}`,
    `${ORDER_NOTE_PREFIXES.customerNote} ${sanitizeLineBreaks(customerNotes) || 'لا يوجد'}`,
    `${ORDER_NOTE_PREFIXES.orderType} ${isUrgent ? 'طلب مستعجل' : 'طلب عادي'}`,
    `${ORDER_NOTE_PREFIXES.urgentFee} ${isUrgent ? money(urgentFee) : money(0)}`,
    `${ORDER_NOTE_PREFIXES.shipping} يضاف لاحقًا حسب المنطقة`,
  ].join('\n');
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

function isDuplicateOrderNumberError(error) {
  const text = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return error?.code === '23505' || (text.includes('duplicate') && text.includes('order_number'));
}

function getFriendlyOrderError(error) {
  if (!error) return 'حدثت مشكلة غير متوقعة أثناء حفظ الطلب';
  if (isDuplicateOrderNumberError(error)) return 'حدث تعارض نادر في رقم الطلب. حاول مرة أخرى';
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

function showOrderSuccess(orderNumber, { openedWhatsApp = false, authenticated = false } = {}) {
  const box = $('#orderSuccessBox');
  if (!box) return;

  const intro = authenticated && !openedWhatsApp
    ? 'تم استلام طلبك بنجاح من الموقع. يمكنك متابعته لاحقًا من صفحة طلباتي.'
    : 'تم إرسال طلبك بنجاح، وتم فتح رسالة واتساب الخاصة بالطلب.';

  const helperActions = authenticated
    ? `<a href="./my-orders.html" class="btn btn-ghost btn-sm">طلباتي</a>`
    : '';

  box.innerHTML = `
    <h3>تم إرسال طلبك بنجاح ✅</h3>
    <p>${intro}</p>
    <div class="order-success-actions">
      <div class="order-success-number">${escHtml(orderNumber || 'تم حفظ الطلب')}</div>
      <button type="button" class="btn btn-ghost btn-sm" id="copyOrderNumberBtn">نسخ الرقم</button>
      ${helperActions}
      <a href="./index.html#products" class="btn btn-ghost btn-sm">العودة للمنتجات</a>
    </div>
    <p>${authenticated && !openedWhatsApp ? 'يمكنك دائمًا استخدام واتساب كخيار إضافي عند الحاجة.' : 'سيتم التواصل معك لتأكيد الطلب والتوصيل.'}</p>
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
  const palette = ['rgba(107,146,40,.38)', 'rgba(215,138,167,.34)', 'rgba(239,215,71,.34)'];

  for (let i = 0; i < 24; i += 1) {
    const bubble = document.createElement('span');
    bubble.className = 'soap-bubble';
    const size = 16 + Math.random() * 56;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.animationDelay = `${Math.random() * 0.45}s`;
    bubble.style.animationDuration = `${3.5 + Math.random() * 2.5}s`;
    bubble.style.setProperty('--drift', `${-42 + Math.random() * 84}px`);
    bubble.style.setProperty('--bubble-color', palette[Math.floor(Math.random() * palette.length)]);
    container.appendChild(bubble);
  }

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 7000);
}

function hideOrderSuccess() {
  const box = $('#orderSuccessBox');
  if (!box) return;
  box.classList.add('hidden');
  box.classList.remove('show');
  box.innerHTML = '';
  document.body.classList.remove('order-submitted');
}

function resetSuccessState() {
  orderSubmittedSuccessfully = false;
  lastSubmittedOrderNumber = '';
  activeCheckoutMode = null;
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
            <input class="qty-input" data-action="set-qty" data-id="${item.id}" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${item.qty}" aria-label="كمية ${escHtml(item.name)}">
            <button data-action="dec" data-id="${item.id}" type="button">-</button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

function renderCartAuthState() {
  const box = $('#cartAuthState');
  if (!box) return;

  if (currentUser) {
    const displayName = currentProfile?.full_name || currentUser.user_metadata?.full_name || currentUser.email;
    box.className = 'cart-auth-state is-auth';
    box.innerHTML = `
      <strong>أهلاً ${escHtml(displayName || '')}</strong>
      <p>يمكنك الآن تأكيد الطلب من الموقع مباشرة بدون واتساب، أو استخدام واتساب كخيار بديل.</p>
      <div class="cart-auth-links">
        <a href="./account.html">حسابي</a>
        <a href="./my-orders.html">طلباتي</a>
      </div>
    `;
    return;
  }

  box.className = 'cart-auth-state';
  box.innerHTML = `
    <strong>لديك حساب؟</strong>
    <p>سجّل الدخول ليتم تعبئة بياناتك تلقائيًا وتتابع طلباتك من الموقع.</p>
    <div class="cart-auth-links">
      <a href="./auth.html?redirect=${encodeURIComponent('./cart.html')}">تسجيل الدخول / إنشاء حساب</a>
    </div>
  `;
}

function renderSummary() {
  const el = $('#cartPageSummary');
  if (!el) return;

  const subtotal = calculateCartTotal();
  const urgentFee = calculateUrgentFee(subtotal);
  const grandTotal = subtotal + urgentFee;
  const totalItems = state.cart.reduce((s, i) => s + toSafeNumber(i.qty, 0), 0);
  const isUrgent = isUrgentOrderSelected();
  const isAuthenticated = !!currentUser;

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

  const isBusy = isSubmittingOrder || orderSubmittedSuccessfully;
  const primaryText = orderSubmittedSuccessfully
    ? 'تم إرسال الطلب'
    : isSubmittingOrder && activeCheckoutMode === 'website'
      ? 'جارٍ تأكيد الطلب...'
      : isAuthenticated
        ? 'تأكيد الطلب من الموقع'
        : 'إرسال الطلب عبر واتساب';

  const secondaryText = orderSubmittedSuccessfully
    ? 'تم إرسال الطلب'
    : isSubmittingOrder && activeCheckoutMode === 'whatsapp'
      ? 'جارٍ تجهيز الرسالة...'
      : 'إرسال عبر واتساب بدلًا من ذلك';

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
      ${isAuthenticated ? `<p class="helper account-helper">بعد التأكيد من الموقع ستظهر الطلبات في صفحة طلباتي، وواتساب يظل خيارًا إضافيًا فقط.</p>` : ''}
    </div>

    <div class="cart-submit-actions ${isAuthenticated ? 'has-two-actions' : ''}">
      <button class="btn ${isAuthenticated ? 'btn-primary' : 'btn-whatsapp'} cart-page-submit" id="checkoutBtn" type="button" ${!state.cart.length || isBusy ? 'disabled' : ''}>
        ${primaryText}
      </button>
      ${isAuthenticated ? `<button class="btn btn-whatsapp cart-page-submit cart-page-submit-secondary" id="checkoutWhatsAppBtn" type="button" ${!state.cart.length || isBusy ? 'disabled' : ''}>${secondaryText}</button>` : ''}
    </div>

    <a href="./index.html#products" class="btn btn-ghost cart-page-back-btn">إكمال التسوق</a>
  `;
}

function persistAndRender() {
  if (state.cart.length) resetSuccessState();
  writeCart(state.cart);
  updateCartCount();
  renderCartItems();
  renderSummary();
}

function clearCartAndForm({ preserveProfileFields = false } = {}) {
  state.cart = [];
  writeCart([]);
  clearCustomerInfo();

  if (!preserveProfileFields) {
    ['#customerName', '#customerPhone', '#customerCity', '#customerAddress', '#customerNotes'].forEach((selector) => {
      const el = $(selector);
      if (el) el.value = '';
    });
    if ($('#isUrgentOrder')) $('#isUrgentOrder').checked = false;
  } else {
    const notes = $('#customerNotes');
    if (notes) notes.value = '';
    if ($('#isUrgentOrder')) $('#isUrgentOrder').checked = false;
  }

  updateCartCount();
  renderCartItems();
  renderSummary();
}

function buildOrderPayload(orderNumber, { viaWhatsApp = false } = {}) {
  const subtotal = calculateCartTotal();
  const urgentFee = calculateUrgentFee(subtotal);
  const total = subtotal + urgentFee;
  const { customerName, customerPhone, customerCity, customerAddress, customerNotes, isUrgent } = getOrderFormData();

  return {
    order_number: orderNumber,
    customer_name: customerName || 'طلب من الموقع',
    customer_email: currentUser?.email || null,
    user_id: currentUser?.id || null,
    phone: customerPhone,
    city: customerCity,
    notes: buildStructuredNotes({ customerAddress, customerNotes, isUrgent, urgentFee }),
    items_json: state.cart,
    total,
    status: 'pending',
    source: currentUser ? (viaWhatsApp ? 'account_whatsapp' : 'account_website') : 'website',
  };
}

async function insertOrderOnce(orderNumber, options = {}) {
  if (!supabaseClient) throw new Error('Supabase client is not ready');
  const payload = buildOrderPayload(orderNumber, options);
  const { error } = await supabaseClient.from('orders').insert([payload]);
  if (error) throw error;
  return { ok: true, orderNumber };
}

async function saveOrderWithUniqueNumber(options = {}, maxRetries = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const orderNumber = generateOrderNumber();
    try {
      return await insertOrderOnce(orderNumber, options);
    } catch (error) {
      lastError = error;
      if (isDuplicateOrderNumberError(error) && attempt < maxRetries) continue;
      throw lastError;
    }
  }
  throw lastError || new Error('تعذر حفظ الطلب');
}

function buildWhatsAppMessage(orderNumber, customerName, customerPhone, customerCity, customerAddress, customerNotes, isUrgent) {
  const subtotal = calculateCartTotal();
  const urgentFee = calculateUrgentFee(subtotal);
  const grandTotal = subtotal + urgentFee;
  const normalizedAddress = sanitizeLineBreaks(customerAddress) || 'لا يوجد';
  const normalizedNotes = sanitizeLineBreaks(customerNotes) || 'لا يوجد';
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
    `حالة الطلب: ${isUrgent ? 'طلب مستعجل' : 'طلب عادي'}\n\n` +
    `المنتجات:\n\n${lines}\n\n` +
    `المجموع الفرعي: ${money(subtotal)}\n` +
    `${isUrgent ? `رسوم الطلب المستعجل: ${money(urgentFee)}\n` : ''}` +
    `الإجمالي الحالي قبل الشحن: ${money(grandTotal)}`
  );
}

async function syncProfileFromForm() {
  if (!currentUser || !window.AlZhraaAuth?.saveProfile) return;
  const { customerName, customerPhone, customerCity, customerAddress } = getOrderFormData();
  const { error, profile } = await window.AlZhraaAuth.saveProfile({
    full_name: customerName,
    phone: customerPhone,
    governorate: customerCity,
    address: customerAddress,
    email: currentUser.email,
  });
  if (!error && profile) currentProfile = profile;
}

async function checkout({ viaWhatsApp = false } = {}) {
  if (!state.cart.length) {
    showToast('السلة فارغة');
    return;
  }

  if (isSubmittingOrder || orderSubmittedSuccessfully) return;

  const { customerName, customerPhone, customerCity, customerAddress, customerNotes, isUrgent } = getOrderFormData();
  if (!customerName || !customerPhone || !customerCity || !customerAddress) {
    showToast('من فضلك املأ الاسم والموبايل والمحافظة والعنوان بالتفصيل');
    return;
  }
  if (!validatePhone(customerPhone)) {
    showToast('اكتب رقم موبايل مصري صحيح');
    return;
  }

  isSubmittingOrder = true;
  activeCheckoutMode = viaWhatsApp ? 'whatsapp' : 'website';
  renderSummary();

  try {
    if (currentUser) await syncProfileFromForm();
    const { orderNumber } = await saveOrderWithUniqueNumber({ viaWhatsApp }, 3);

    if (viaWhatsApp) {
      const msg = buildWhatsAppMessage(orderNumber, customerName, customerPhone, customerCity, customerAddress, customerNotes, isUrgent);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    orderSubmittedSuccessfully = true;
    lastSubmittedOrderNumber = orderNumber;
    clearCartAndForm({ preserveProfileFields: !!currentUser });
    showOrderSuccess(orderNumber, { openedWhatsApp: viaWhatsApp, authenticated: !!currentUser });
    showToast('تم إرسال الطلب بنجاح');
  } catch (err) {
    console.error('[Checkout] failed:', err);
    showToast(getFriendlyOrderError(err));
  } finally {
    isSubmittingOrder = false;
    renderSummary();
  }
}

function applyProfileToForm(profile = null, user = null) {
  if (!user) return;
  const merged = {
    name: profile?.full_name || user?.user_metadata?.full_name || '',
    phone: profile?.phone || '',
    city: profile?.governorate || '',
    address: profile?.address || '',
  };

  if ($('#customerName') && merged.name) $('#customerName').value = merged.name;
  if ($('#customerPhone') && merged.phone) $('#customerPhone').value = merged.phone;
  if ($('#customerCity') && merged.city) $('#customerCity').value = merged.city;
  if ($('#customerAddress') && merged.address) $('#customerAddress').value = merged.address;
  saveCustomerInfo();
}

function syncAuthCustomerState() {
  currentUser = window.AlZhraaAuth?.getUser?.() || null;
  currentProfile = window.AlZhraaAuth?.getProfile?.() || null;
  renderCartAuthState();
  if (currentUser) {
    applyProfileToForm(currentProfile, currentUser);
  }
  renderSummary();
}

async function waitForAuthReady() {
  if (window.AlZhraaAuth?.ready) {
    try { await window.AlZhraaAuth.ready; } catch {}
  }
  syncAuthCustomerState();
}

function initEventBindings() {
  document.addEventListener('input', (e) => {
    if (['customerName','customerPhone','customerCity','customerAddress','customerNotes','isUrgentOrder'].includes(e.target.id)) {
      saveCustomerInfo();
    }
    if (e.target.dataset.action === 'set-qty') {
      const onlyDigits = String(e.target.value || '').replace(/[^0-9]/g, '');
      e.target.value = onlyDigits;
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
    }
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

    const action = e.target.dataset.action;
    if (action) {
      const id = Number(e.target.dataset.id);
      const item = state.cart.find((i) => Number(i.id) === id);
      if (!item) return;
      if (action === 'inc') item.qty += 1;
      else if (action === 'dec') item.qty > 1 ? item.qty -= 1 : state.cart = state.cart.filter((i) => Number(i.id) !== id);
      else if (action === 'remove') state.cart = state.cart.filter((i) => Number(i.id) !== id);
      persistAndRender();
      return;
    }

    if (e.target.id === 'checkoutBtn') {
      checkout({ viaWhatsApp: !currentUser });
      return;
    }

    if (e.target.id === 'checkoutWhatsAppBtn') {
      checkout({ viaWhatsApp: true });
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
      if (lastSubmittedOrderNumber) copyText(lastSubmittedOrderNumber);
    }
  });

  window.addEventListener('alzhraa:auth-changed', () => {
    syncAuthCustomerState();
  });
}

async function init() {
  updateCartCount();
  loadCustomerInfo();
  renderCartItems();
  renderCartAuthState();
  renderSummary();
  initEventBindings();
  await waitForAuthReady();
}

document.addEventListener('DOMContentLoaded', init);
