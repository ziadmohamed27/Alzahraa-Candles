const AUTH_SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const AUTH_SUPABASE_ANON_KEY = 'sb_publishable_UgNH99IH4aP0aLN3OhH-Vw_w2-XqO_v';
const AUTH_CART_KEY = 'soap-cart';
const EGYPT_GOVERNORATES = [
  'القاهرة','الجيزة','الإسكندرية','الدقهلية','البحر الأحمر','البحيرة','الفيوم','الغربية','الإسماعيلية','المنوفية','المنيا','القليوبية','الوادي الجديد','السويس','أسوان','أسيوط','بني سويف','بورسعيد','دمياط','الشرقية','جنوب سيناء','كفر الشيخ','مطروح','الأقصر','قنا','شمال سيناء','سوهاج'
];

const authState = {
  client: null,
  user: null,
  profile: null,
  initialized: false,
  ready: null,
};

const auth$ = (selector) => document.querySelector(selector);

function authShowToast(message) {
  const toast = auth$('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(authShowToast._t);
  authShowToast._t = setTimeout(() => toast.classList.remove('show'), 1200);
}

function escapeHtml(value) {
  if (typeof value !== 'string') return String(value ?? '');
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeRedirectPath(value, fallback = './account.html') {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  try {
    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin) return fallback;
    const normalized = `${url.pathname}${url.search}${url.hash}`;
    return normalized.startsWith('/') ? normalized : fallback;
  } catch {
    return fallback;
  }
}

function getRelativeCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const search = window.location.search || '';
  const hash = window.location.hash || '';
  return `./${path}${search}${hash}`;
}

function setFeedback(targetId, message = '', type = '') {
  const box = auth$(targetId);
  if (!box) return;
  if (!message) {
    box.className = 'auth-feedback';
    box.innerHTML = '';
    return;
  }
  box.className = `auth-feedback show ${type || ''}`.trim();
  box.innerHTML = message;
}

function readCartCount() {
  try {
    const raw = localStorage.getItem(AUTH_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return 0;
    return parsed.reduce((sum, item) => sum + Number(item?.qty || 0), 0);
  } catch {
    return 0;
  }
}

function updateSharedCartCount() {
  const count = readCartCount();
  const countEl = auth$('#cartCount');
  if (countEl) countEl.textContent = count;
}

function buildDesktopAuthButton() {
  const slot = auth$('#authNavDesktop');
  if (!slot) return;
  const isLoggedIn = !!authState.user;
  slot.innerHTML = isLoggedIn
    ? `<a class="auth-desktop-link" href="./account.html">حسابي</a>`
    : `<a class="auth-desktop-link" href="./auth.html?redirect=${encodeURIComponent(getRelativeCurrentPage())}">دخول</a>`;
}

function buildMobileAuthLinks() {
  const slot = auth$('#authMenuLinks');
  if (!slot) return;
  if (authState.user) {
    slot.innerHTML = `
      <a href="./account.html">حسابي</a>
      <a href="./my-orders.html">طلباتي</a>
      <button type="button" class="mobile-auth-logout" data-action="logout">تسجيل خروج</button>
    `;
  } else {
    slot.innerHTML = `
      <a href="./auth.html?redirect=${encodeURIComponent(getRelativeCurrentPage())}">تسجيل الدخول / إنشاء حساب</a>
    `;
  }
}

function broadcastAuthState() {
  window.dispatchEvent(new CustomEvent('alzhraa:auth-changed', {
    detail: {
      user: authState.user,
      profile: authState.profile,
      client: authState.client,
    }
  }));
}

async function fetchProfile(userId) {
  if (!authState.client || !userId) return null;
  const { data, error } = await authState.client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[Auth] Failed to fetch profile:', error);
    return null;
  }
  return data || null;
}

async function ensureProfileDefaults(user, profile) {
  if (!authState.client || !user) return profile;
  const payload = {
    id: user.id,
    email: user.email || profile?.email || '',
  };

  const metadataName = String(user.user_metadata?.full_name || '').trim();
  if (metadataName && !(profile?.full_name || '').trim()) {
    payload.full_name = metadataName;
  }

  if (profile?.id) {
    if (!payload.full_name && !payload.email) return profile;
    payload.full_name = payload.full_name || profile.full_name || null;
  }

  const { error } = await authState.client
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.warn('[Auth] Failed to ensure profile defaults:', error);
    return profile;
  }

  return await fetchProfile(user.id);
}

async function syncAuthState() {
  if (!authState.client) {
    buildDesktopAuthButton();
    buildMobileAuthLinks();
    updateSharedCartCount();
    return;
  }

  const { data, error } = await authState.client.auth.getSession();
  if (error) {
    console.warn('[Auth] getSession failed:', error);
  }

  authState.user = data?.session?.user || null;
  authState.profile = authState.user ? await fetchProfile(authState.user.id) : null;

  if (authState.user) {
    authState.profile = await ensureProfileDefaults(authState.user, authState.profile);
  }

  buildDesktopAuthButton();
  buildMobileAuthLinks();
  updateSharedCartCount();
  updateAccountMarkers();
  broadcastAuthState();
}

function updateAccountMarkers() {
  document.body.classList.toggle('is-authenticated', !!authState.user);
  const name = authState.profile?.full_name || authState.user?.user_metadata?.full_name || authState.user?.email || '';
  document.querySelectorAll('[data-auth-name]').forEach((el) => {
    el.textContent = name;
  });
}

async function signOutUser() {
  if (!authState.client) return;
  const { error } = await authState.client.auth.signOut();
  if (error) {
    authShowToast('تعذر تسجيل الخروج');
    return;
  }
  authShowToast('تم تسجيل الخروج');
  const needsRedirect = document.body.dataset.requiresAuth === 'true';
  if (needsRedirect) {
    window.location.href = './auth.html';
    return;
  }
  await syncAuthState();
}

function fillGovernorateSelect(select) {
  if (!select || select.dataset.ready === 'true') return;
  const current = select.value || '';
  select.innerHTML = [`<option value="">اختر المحافظة</option>`]
    .concat(EGYPT_GOVERNORATES.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`))
    .join('');
  select.value = current;
  select.dataset.ready = 'true';
}

function guardProtectedPage() {
  if (document.body.dataset.requiresAuth !== 'true') return;
  if (authState.user) return;
  const target = getRelativeCurrentPage();
  window.location.replace(`./auth.html?redirect=${encodeURIComponent(target)}`);
}

function getAuthRedirect() {
  const params = new URLSearchParams(window.location.search);
  return safeRedirectPath(params.get('redirect'), './account.html');
}

function activateAuthTab(tabName) {
  document.querySelectorAll('[data-auth-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.authTab === tabName);
  });
  const loginForm = auth$('#loginForm');
  const signupForm = auth$('#signupForm');
  if (loginForm) loginForm.classList.toggle('hidden', tabName !== 'login');
  if (signupForm) signupForm.classList.toggle('hidden', tabName !== 'signup');
}

function initAuthPage() {
  if (document.body.dataset.page !== 'auth') return;

  const params = new URLSearchParams(window.location.search);
  const hasConfirmed = params.get('confirmed') === '1';
  const redirectTarget = getAuthRedirect();

  if (hasConfirmed) {
    setFeedback('#authPageMessage', 'تم تأكيد البريد الإلكتروني. يمكنك الآن تسجيل الدخول لإكمال بياناتك والطلب من الموقع.', 'success');
  }

  if (authState.user) {
    setFeedback('#authPageMessage', 'أنت مسجل دخول بالفعل. يمكنك إكمال بياناتك أو متابعة طلباتك.', 'success');
  }

  document.querySelectorAll('[data-auth-tab]').forEach((btn) => {
    btn.addEventListener('click', () => activateAuthTab(btn.dataset.authTab));
  });

  const loginForm = auth$('#loginForm');
  if (loginForm && !loginForm.dataset.bound) {
    loginForm.dataset.bound = 'true';
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = String(auth$('#loginEmail')?.value || '').trim();
      const password = String(auth$('#loginPassword')?.value || '').trim();
      if (!email || !password) {
        setFeedback('#authPageMessage', 'من فضلك أدخل البريد الإلكتروني وكلمة المرور.', 'error');
        return;
      }

      setFeedback('#authPageMessage', 'جارٍ تسجيل الدخول...', 'info');
      const { error } = await authState.client.auth.signInWithPassword({ email, password });
      if (error) {
        setFeedback('#authPageMessage', error.message.includes('Email not confirmed') ? 'يجب تأكيد البريد الإلكتروني أولاً من الرسالة التي وصلتك.' : 'تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور.', 'error');
        return;
      }

      setFeedback('#authPageMessage', 'تم تسجيل الدخول بنجاح، يتم تحويلك الآن...', 'success');
      window.location.href = redirectTarget;
    });
  }

  const signupForm = auth$('#signupForm');
  if (signupForm && !signupForm.dataset.bound) {
    signupForm.dataset.bound = 'true';
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const fullName = String(auth$('#signupName')?.value || '').trim();
      const email = String(auth$('#signupEmail')?.value || '').trim();
      const password = String(auth$('#signupPassword')?.value || '').trim();

      if (!fullName || !email || password.length < 8) {
        setFeedback('#authPageMessage', 'أدخل الاسم والبريد، واجعل كلمة المرور 8 أحرف أو أكثر.', 'error');
        return;
      }

      setFeedback('#authPageMessage', 'جارٍ إنشاء الحساب...', 'info');
      const emailRedirectTo = `${window.location.origin}${window.location.pathname.replace(/[^/]+$/, 'auth.html')}?confirmed=1&redirect=${encodeURIComponent(redirectTarget)}`;
      const { error } = await authState.client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: { full_name: fullName }
        }
      });

      if (error) {
        setFeedback('#authPageMessage', 'تعذر إنشاء الحساب الآن. جرّب مرة أخرى أو استخدم بريدًا مختلفًا.', 'error');
        return;
      }

      signupForm.reset();
      activateAuthTab('login');
      setFeedback('#authPageMessage', 'تم إنشاء الحساب. راجع بريدك الإلكتروني واضغط رابط التأكيد، ثم عد لتسجيل الدخول.', 'success');
    });
  }
}

function getProfileValue(key, fallback = '') {
  const profileValue = authState.profile?.[key];
  if (profileValue != null && String(profileValue).trim()) return String(profileValue).trim();
  if (key === 'full_name') {
    const meta = authState.user?.user_metadata?.full_name;
    if (meta) return String(meta).trim();
  }
  if (key === 'email') {
    return String(authState.user?.email || '').trim();
  }
  return fallback;
}

function initAccountPage() {
  if (document.body.dataset.page !== 'account') return;
  fillGovernorateSelect(auth$('#accountGovernorate'));

  if (!authState.user) return;

  if (auth$('#accountName')) auth$('#accountName').value = getProfileValue('full_name');
  if (auth$('#accountEmail')) auth$('#accountEmail').value = getProfileValue('email');
  if (auth$('#accountPhone')) auth$('#accountPhone').value = getProfileValue('phone');
  if (auth$('#accountGovernorate')) auth$('#accountGovernorate').value = getProfileValue('governorate');
  if (auth$('#accountAddress')) auth$('#accountAddress').value = getProfileValue('address');

  const form = auth$('#accountForm');
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        id: authState.user.id,
        full_name: String(auth$('#accountName')?.value || '').trim(),
        email: String(authState.user.email || '').trim(),
        phone: String(auth$('#accountPhone')?.value || '').trim(),
        governorate: String(auth$('#accountGovernorate')?.value || '').trim(),
        address: String(auth$('#accountAddress')?.value || '').trim(),
      };

      if (!payload.full_name) {
        setFeedback('#accountMessage', 'من فضلك اكتب الاسم.', 'error');
        return;
      }

      setFeedback('#accountMessage', 'جارٍ حفظ البيانات...', 'info');
      const { error } = await authState.client
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        setFeedback('#accountMessage', 'تعذر حفظ البيانات الآن. تأكد من سياسات RLS الخاصة بـ profiles.', 'error');
        return;
      }

      authState.profile = await fetchProfile(authState.user.id);
      setFeedback('#accountMessage', 'تم حفظ بياناتك بنجاح.', 'success');
      authShowToast('تم الحفظ');
      updateAccountMarkers();
      broadcastAuthState();
    });
  }
}

function mapStatusLabel(status) {
  const key = String(status || '').toLowerCase();
  const map = {
    pending: 'قيد المراجعة',
    new: 'جديد',
    processing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
    completed: 'مكتمل',
  };
  return map[key] || status || 'غير محدد';
}

function orderDateLabel(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

function parseStructuredNotes(notes) {
  const text = String(notes || '').trim();
  const result = {
    address: '',
    customerNote: '',
  };
  if (!text) return result;
  text.split('\n').forEach((line) => {
    const value = line.trim();
    if (value.startsWith('العنوان:')) result.address = value.replace('العنوان:', '').trim();
    if (value.startsWith('ملاحظات العميل:')) result.customerNote = value.replace('ملاحظات العميل:', '').trim();
  });
  return result;
}

function renderOrderItems(items) {
  if (!Array.isArray(items) || !items.length) {
    return '<div class="my-order-empty-details">لا توجد تفاصيل منتجات محفوظة لهذا الطلب.</div>';
  }
  return items.map((item) => `
    <div class="my-order-item-row">
      <strong>${escapeHtml(item.name || 'منتج')}</strong>
      <span>${Number(item.qty || 0)} × ${Number(item.price || 0).toFixed(2)} ج.م</span>
    </div>
  `).join('');
}

async function loadMyOrders() {
  if (document.body.dataset.page !== 'my-orders' || !authState.user) return;
  const list = auth$('#myOrdersList');
  if (!list) return;

  list.innerHTML = '<div class="empty-state">جارٍ تحميل طلباتك...</div>';
  setFeedback('#ordersMessage', '', '');

  const { data, error } = await authState.client
    .from('orders')
    .select('id, order_number, customer_name, customer_email, phone, city, notes, items_json, total, status, source, created_at')
    .eq('user_id', authState.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Orders] Failed to load orders:', error);
    list.innerHTML = '';
    setFeedback('#ordersMessage', 'تعذر تحميل الطلبات من قاعدة البيانات. تأكد من وجود policy تسمح للمستخدم بقراءة طلباته فقط.', 'error');
    return;
  }

  if (!data || !data.length) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>لا توجد طلبات حتى الآن</h3>
        <p>ابدأ أول طلب من السلة، وبعدها ستظهر طلباتك هنا تلقائيًا.</p>
        <a class="btn btn-primary" href="./cart.html">اذهب إلى السلة</a>
      </div>
    `;
    return;
  }

  list.innerHTML = data.map((order) => {
    const parsedNotes = parseStructuredNotes(order.notes);
    const waText = encodeURIComponent(`مرحبًا، أريد متابعة الطلب رقم ${order.order_number || ''}`.trim());
    return `
      <article class="my-order-card">
        <div class="my-order-head">
          <div>
            <span class="my-order-number">${escapeHtml(order.order_number || 'بدون رقم')}</span>
            <h3>${escapeHtml(mapStatusLabel(order.status))}</h3>
          </div>
          <span class="my-order-total">${Number(order.total || 0).toFixed(2)} ج.م</span>
        </div>

        <div class="my-order-meta-grid">
          <div><span>التاريخ</span><strong>${escapeHtml(orderDateLabel(order.created_at))}</strong></div>
          <div><span>المحافظة</span><strong>${escapeHtml(order.city || '—')}</strong></div>
          <div><span>الهاتف</span><strong>${escapeHtml(order.phone || '—')}</strong></div>
          <div><span>الاسم</span><strong>${escapeHtml(order.customer_name || '—')}</strong></div>
        </div>

        <details class="my-order-details">
          <summary>عرض التفاصيل</summary>
          <div class="my-order-details-body">
            <div class="my-order-details-block">
              <h4>المنتجات</h4>
              ${renderOrderItems(order.items_json)}
            </div>
            <div class="my-order-details-block">
              <h4>العنوان</h4>
              <p>${escapeHtml(parsedNotes.address || '—')}</p>
            </div>
            <div class="my-order-details-block">
              <h4>ملاحظات الطلب</h4>
              <p>${escapeHtml(parsedNotes.customerNote || 'لا توجد')}</p>
            </div>
          </div>
        </details>

        <div class="my-order-actions">
          <a class="btn btn-whatsapp" target="_blank" rel="noopener" href="https://wa.me/201095314011?text=${waText}">واتساب</a>
          <button class="btn btn-ghost" type="button" data-copy-order="${escapeHtml(order.order_number || '')}">نسخ رقم الطلب</button>
        </div>
      </article>
    `;
  }).join('');
}

async function saveProfile(data = {}) {
  if (!authState.client || !authState.user) return { error: new Error('not-authenticated') };
  const payload = {
    id: authState.user.id,
    full_name: String(data.full_name || '').trim(),
    email: String(data.email || authState.user.email || '').trim(),
    phone: String(data.phone || '').trim(),
    governorate: String(data.governorate || '').trim(),
    address: String(data.address || '').trim(),
  };

  const { error } = await authState.client
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });
  if (error) return { error };

  authState.profile = await fetchProfile(authState.user.id);
  updateAccountMarkers();
  broadcastAuthState();
  return { error: null, profile: authState.profile };
}

function bindGlobalActions() {
  document.addEventListener('click', async (event) => {
    const logoutButton = event.target.closest('[data-action="logout"]');
    if (logoutButton) {
      event.preventDefault();
      await signOutUser();
      return;
    }

    const copyButton = event.target.closest('[data-copy-order]');
    if (copyButton) {
      const value = String(copyButton.dataset.copyOrder || '').trim();
      if (!value) return;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = value;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        authShowToast('تم النسخ');
      } catch {
        authShowToast('تعذر النسخ');
      }
    }
  });

  const refreshBtn = auth$('#refreshOrdersBtn');
  if (refreshBtn && !refreshBtn.dataset.bound) {
    refreshBtn.dataset.bound = 'true';
    refreshBtn.addEventListener('click', () => loadMyOrders());
  }
}

function initAuthHelpers() {
  if (!window.supabase || !AUTH_SUPABASE_ANON_KEY) return;
  if (!authState.client) {
    authState.client = window.supabase.createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_ANON_KEY);
  }

  if (authState.initialized) return;
  authState.initialized = true;

  authState.client.auth.onAuthStateChange(async () => {
    await syncAuthState();
    guardProtectedPage();
    initAuthPage();
    initAccountPage();
    await loadMyOrders();
  });

  authState.ready = (async () => {
    fillGovernorateSelect(auth$('#accountGovernorate'));
    await syncAuthState();
    guardProtectedPage();
    initAuthPage();
    initAccountPage();
    await loadMyOrders();
    bindGlobalActions();
  })();
}

window.AlZhraaAuth = {
  get client() { return authState.client; },
  get ready() { return authState.ready || Promise.resolve(); },
  getUser: () => authState.user,
  getProfile: () => authState.profile,
  saveProfile,
  refresh: async () => {
    await syncAuthState();
    return { user: authState.user, profile: authState.profile };
  },
};

initAuthHelpers();
