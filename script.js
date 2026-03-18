/* =================================================================
   عطر الطبيعة — script.js   (v14 fixed)
   ================================================================= */

/* ─────────────────────────────────────────────────────────────────
   1.  CONFIGURATION
       ► Replace SUPABASE_ANON_KEY with your project's anon/public key.
         Dashboard → Project Settings → API → "anon public"
   ───────────────────────────────────────────────────────────────── */
const SUPABASE_URL      = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = 'PUT_YOUR_ANON_KEY_HERE'; // ← paste real key

/* ─────────────────────────────────────────────────────────────────
   2.  STATIC FALLBACK PRODUCTS
       Displayed when Supabase is not configured or the fetch fails.
       Also used by addToCart / openProduct when ids match.
   ───────────────────────────────────────────────────────────────── */
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'صابون زيت الزيتون',
    price: 40,
    weight: '120 جرام',
    badge: 'للبشرة الجافة والحساسة',
    tag: 'أفضل بداية للبشرة الحساسة',
    bestFor: 'البشرة الجافة والحساسة',
    category: 'dry',
    description: 'اختيار لطيف للبشرة الجافة والحساسة يمنح تنظيفًا ناعمًا دون إحساس بالشد بعد الغسيل.',
    longDescription: 'صابون طبيعي غني بزيت الزيتون البكر وفيتامين E، مناسب لمن تبحث عن تنظيف لطيف مع ترطيب يومي مريح للوجه والجسم.',
    highlights: ['ترطيب يومي', 'لطيف على الحساسة', 'مناسب للبدء'],
    benefits: ['يساعد على تقليل الإحساس بالجفاف بعد الغسيل', 'لطيف للاستخدام اليومي', 'مناسب لمن تريد روتينًا بسيطًا'],
    usage: 'يستخدم يوميًا على البشرة المبللة ثم يشطف بالماء الفاتر.',
    ingredients: ['زيت الزيتون البكر', 'زيت جوز الهند', 'ماء', 'زيت اللافندر'],
    image: './images/olive.jpg',
  },
  {
    id: 2,
    name: 'صابون الفحم النشط',
    price: 45,
    weight: '120 جرام',
    badge: 'للبشرة الدهنية والمختلطة',
    tag: 'للمسام واللمعة',
    bestFor: 'البشرة الدهنية والمختلطة',
    category: 'oily',
    description: 'يناسب البشرة الدهنية والمختلطة ويساعد على تنظيف المسام وتقليل الإحساس بالدهون الزائدة.',
    longDescription: 'تركيبة بالفحم النباتي النشط مع زيت شجرة الشاي، مناسبة لمن ترغب في تنظيف أعمق وإحساس أوضح بالانتعاش بعد الغسيل.',
    highlights: ['تنظيف أعمق', 'للدهنية', 'إحساس منتعش'],
    benefits: ['يساعد على تنظيف الشوائب والزيوت السطحية', 'مناسب لمنزعجة من اللمعة', 'يدعم مظهرًا أنظف للمسام'],
    usage: 'يستخدم مرة إلى مرتين يوميًا حسب احتياج البشرة.',
    ingredients: ['فحم نباتي نشط', 'زيت شجرة الشاي', 'زيت جوز الهند', 'مستخلص الألوفيرا'],
    image: './images/charcoal.jpg',
  },
  {
    id: 3,
    name: 'صابون العسل',
    price: 42,
    weight: '120 جرام',
    badge: 'ترطيب ونعومة يومية',
    tag: 'الأكثر طلبًا',
    bestFor: 'نعومة وترطيب يومي',
    category: 'dry',          // ← changed from 'all' so dry filter works by category
    description: 'مناسب لمن تريد نعومة ولمسة مرطبة يومية، خاصة إذا كانت البشرة تميل للجفاف أو البهتان.',
    longDescription: 'يجمع بين العسل الطبيعي وزبدة الشيا ليمنح البشرة إحساسًا بالراحة والنعومة بعد الاستخدام اليومي.',
    highlights: ['نعومة واضحة', 'ترطيب مريح', 'مناسب يوميًا'],
    benefits: ['يساعد على إبقاء البشرة أكثر نعومة', 'مناسب للبشرة الباهتة أو المرهقة', 'خيار يومي دافئ ولطيف'],
    usage: 'يستخدم يوميًا للوجه أو الجسم مع تدليك لطيف ثم شطف بالماء الفاتر.',
    ingredients: ['عسل طبيعي', 'زبدة الشيا', 'زيت اللوز الحلو', 'زيت جوز الهند'],
    image: './images/honey.jpg',
  },
  {
    id: 4,
    name: 'صابون القهوة',
    price: 44,
    weight: '130 جرام',
    badge: 'تقشير لطيف وتجديد',
    tag: 'للجسم والمناطق الخشنة',
    bestFor: 'تقشير لطيف للجسم',
    category: 'scrub',
    description: 'مناسب لتقشير لطيف للجسم والمناطق الخشنة ويساعد على تحسين ملمس البشرة.',
    longDescription: 'يحتوي على حبيبات قهوة مطحونة بشكل ناعم لتقشير لطيف يساعد على إزالة الخلايا السطحية الجافة وترك ملمس أنعم.',
    highlights: ['تقشير لطيف', 'للجسم', 'ملمس أنعم'],
    benefits: ['يساعد على إزالة الخلايا السطحية الجافة', 'مناسب للمناطق الخشنة', 'يمنح إحساسًا بالانتعاش بعد الاستحمام'],
    usage: 'يستخدم 2 إلى 3 مرات أسبوعيًا على البشرة الرطبة.',
    ingredients: ['قهوة عربية', 'زيت جوز الهند', 'زبدة الكاكاو', 'سكر قصب'],
    image: './images/coffee.jpg',
  },
];

/* ─────────────────────────────────────────────────────────────────
   3.  OTHER STATIC DATA
   ───────────────────────────────────────────────────────────────── */
const features = [
  { icon: '🌿', title: 'مكونات واضحة',        desc: 'نختار مكونات أقرب للطبيعة لتكون التجربة أبسط وأوضح.' },
  { icon: '🤲', title: 'صناعة يدوية',          desc: 'كل قطعة تُقدّم بإحساس عناية واهتمام بالتفاصيل.' },
  { icon: '🫧', title: 'عناية يومية لطيفة',    desc: 'خيارات مناسبة للتنظيف اليومي بدون إحساس قاسٍ على البشرة.' },
  { icon: '💬', title: 'مساعدة قبل الطلب',     desc: 'يمكنك سؤالنا مباشرة لاختيار النوع الأقرب لاحتياج بشرتك.' },
];

const steps = [
  { title: 'اختر منتجاتك',             desc: 'تصفّح المنتجات المناسبة لبشرتك وأضف ما يناسبك إلى السلة بسهولة.' },
  { title: 'أرسل الطلب عبر واتساب',    desc: 'عند الضغط على إرسال الطلب سيتم تجهيز رسالة تلقائية تحتوي على تفاصيل السلة.' },
  { title: 'نؤكد الطلب والتوصيل',      desc: 'نراجع طلبك معك مباشرة ونحدد العنوان والموعد الأنسب للاستلام أو التوصيل.' },
];

const shippingInfo = [
  { label: 'مدة التوصيل',    value: 'من 2 إلى 5 أيام عمل' },
  { label: 'مناطق الشحن',    value: 'متاح لمعظم المحافظات داخل مصر' },
  { label: 'طريقة الطلب',    value: 'طلب مباشر وسريع عبر واتساب' },
  { label: 'خدمة العملاء',   value: 'مساعدة سريعة لاختيار المنتج المناسب' },
];

const faqs = [
  { q: 'أي منتج أبدأ به لو كانت بشرتي حساسة؟',          a: 'غالبًا صابون زيت الزيتون هو البداية الألطف للبشرة الجافة أو الحساسة.' },
  { q: 'ما الأنسب للبشرة الدهنية أو المختلطة؟',          a: 'صابون الفحم النشط مناسب أكثر لمن تبحث عن تنظيف أعمق وتقليل الإحساس بالدهون الزائدة.' },
  { q: 'كيف يتم الطلب؟',                                   a: 'اختاري المنتجات، أضيفيها إلى السلة، ثم اضغطي إرسال الطلب عبر واتساب ليصلنا ملخص الطلب مباشرة.' },
  { q: 'هل الشحن متاح داخل مصر؟',                         a: 'نعم، الشحن متاح لمعظم المحافظات داخل مصر ويتم تأكيد التفاصيل معك حسب المنطقة.' },
  { q: 'هل يمكنني السؤال قبل الشراء؟',                    a: 'بالتأكيد، يمكنك التواصل معنا مباشرة عبر واتساب لنرشح لك النوع المناسب.' },
];

/* ─────────────────────────────────────────────────────────────────
   4.  SUPABASE CLIENT INIT
       Only initialises when a real key is provided.
   ───────────────────────────────────────────────────────────────── */
let supabase = null;

(function initSupabase() {
  const keyMissing = (
    !SUPABASE_ANON_KEY ||
    SUPABASE_ANON_KEY === 'PUT_YOUR_ANON_KEY_HERE' ||
    SUPABASE_ANON_KEY.startsWith('PUT_')
  );

  if (keyMissing) {
    console.info(
      '[Supabase] Anon key is a placeholder. ' +
      'Products will use static fallback data. ' +
      'Replace SUPABASE_ANON_KEY in script.js with your real key to enable live data.'
    );
    return;
  }

  if (!window.supabase) {
    console.error('[Supabase] CDN script did not load. Check network / ad-blocker.');
    return;
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.info('[Supabase] Client initialised ✓');
})();

/* ─────────────────────────────────────────────────────────────────
   5.  CART STORAGE HELPERS
   ───────────────────────────────────────────────────────────────── */
function readCart() {
  try {
    const raw = window.localStorage ? localStorage.getItem('soap-cart') : null;
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[Cart] localStorage unavailable, using memory.', err);
    return [];
  }
}

function writeCart(cart) {
  try {
    if (window.localStorage) localStorage.setItem('soap-cart', JSON.stringify(cart));
  } catch (err) {
    console.warn('[Cart] Could not persist cart.', err);
  }
}

/* ─────────────────────────────────────────────────────────────────
   6.  APP STATE
   ───────────────────────────────────────────────────────────────── */
const state = {
  filter: 'all',
  cart: readCart(),
};

// currentProducts is populated by loadProducts() at init time.
// Starts as the static fallback so renders are safe even if async fails.
let currentProducts = FALLBACK_PRODUCTS.slice();

/* ─────────────────────────────────────────────────────────────────
   7.  DOM HELPERS
   ───────────────────────────────────────────────────────────────── */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const money = (v) => `${Number(v).toFixed(2)} ج.م`;

/* ─────────────────────────────────────────────────────────────────
   8.  SUPABASE — FETCH PRODUCTS
       FIX: This function was entirely missing. Products were never
       fetched from Supabase; only the static array was used.
       Now: tries Supabase first, falls back to FALLBACK_PRODUCTS.
   ───────────────────────────────────────────────────────────────── */
async function loadProducts() {
  // No Supabase client → use fallback immediately
  if (!supabase) {
    console.info('[Products] Using static fallback data (Supabase not configured).');
    return FALLBACK_PRODUCTS;
  }

  try {
    const { data, error } = await supabase
      .from('products')          // ← your Supabase table name
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('[Products] Supabase select error:', error.message, error.details);
      return FALLBACK_PRODUCTS;
    }

    if (!data || data.length === 0) {
      console.warn('[Products] Supabase returned 0 rows — check RLS policy allows anon SELECT. Using fallback.');
      return FALLBACK_PRODUCTS;
    }

    console.info(`[Products] Loaded ${data.length} products from Supabase ✓`);

    // Map Supabase row (snake_case) → JS object (camelCase)
    return data.map((row) => ({
      id:              row.id,
      name:            row.name            ?? '',
      price:           Number(row.price)   || 0,
      weight:          row.weight          ?? '120 جرام',
      badge:           row.badge           ?? '',
      tag:             row.tag             ?? '',
      bestFor:         row.best_for        ?? row.bestFor        ?? '',
      category:        row.category        ?? 'all',
      description:     row.description     ?? '',
      longDescription: row.long_description ?? row.longDescription ?? '',
      highlights:      toArray(row.highlights),
      benefits:        toArray(row.benefits),
      usage:           row.usage           ?? '',
      ingredients:     toArray(row.ingredients),
      image:           row.image           ?? './images/olive.jpg',
    }));

  } catch (err) {
    console.error('[Products] Unexpected fetch error:', err);
    return FALLBACK_PRODUCTS;
  }
}

// Safely convert a value that may be an array, a JSON string, or null
function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; }
    catch { return val.split(',').map(s => s.trim()).filter(Boolean); }
  }
  return [];
}

/* ─────────────────────────────────────────────────────────────────
   9.  SUPABASE — SAVE ORDER
   ───────────────────────────────────────────────────────────────── */
async function saveOrderToSupabase() {
  if (!supabase) return; // silently skip — not configured

  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const payload = {
    customer_name: 'طلب من الموقع',
    phone: '',
    city: '',
    notes: '',
    items_json: state.cart,
    total,
  };

  const { error } = await supabase.from('orders').insert([payload]);
  if (error) console.error('[Orders] Insert error:', error.message, error.details);
}

/* ─────────────────────────────────────────────────────────────────
   10. UI HELPERS
   ───────────────────────────────────────────────────────────────── */
function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

function saveCart() {
  writeCart(state.cart);
  updateCartUI();
}

/* ─────────────────────────────────────────────────────────────────
   11. RENDER FUNCTIONS
   ───────────────────────────────────────────────────────────────── */
function renderFilters() {
  const el = $('#filters');
  if (!el) return;
  const filters = [
    ['all',   'الكل'],
    ['dry',   'للبشرة الجافة'],
    ['oily',  'للبشرة الدهنية'],
    ['scrub', 'تقشير'],
  ];
  el.innerHTML = filters
    .map(([id, label]) => `
      <button class="filter-btn ${state.filter === id ? 'active' : ''}" data-filter="${id}">
        ${label}
      </button>
    `)
    .join('');
}

function showProductsLoading() {
  const el = $('#productGrid');
  if (!el) return;
  el.innerHTML = `
    <div style="grid-column:1/-1;display:flex;align-items:center;
                justify-content:center;gap:12px;padding:60px 16px;
                color:var(--muted);font-size:1.05rem">
      <span style="font-size:1.8rem;animation:spin 1s linear infinite">🌿</span>
      <span>جارٍ تحميل المنتجات...</span>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  `;
}

/* FIX: renderProducts now uses currentProducts (the live/fetched list)
        instead of the old static 'products' const.
   FIX: filter logic no longer hardcodes product id 3.
        Instead it uses the category field directly. */
function renderProducts() {
  const el = $('#productGrid');
  if (!el) return;

  const list =
    state.filter === 'all'
      ? currentProducts
      : currentProducts.filter((p) => p.category === state.filter);

  if (list.length === 0) {
    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 16px;color:var(--muted)">
        <div style="font-size:2.5rem;margin-bottom:14px">🌿</div>
        <p>لا توجد منتجات في هذا التصنيف حالياً.</p>
      </div>
    `;
    return;
  }

  el.innerHTML = list
    .map(
      (p) => `
    <article class="card product-card">
      <img
        class="product-image view-product"
        src="${p.image}"
        alt="${escHtml(p.name)}"
        loading="lazy"
        data-id="${p.id}"
        onerror="this.closest('article').classList.add('img-missing')"
      >
      <div class="card-body">
        <div class="badge-row">
          <span class="tag badge">${escHtml(p.badge)}</span>
          <span class="tag best">${escHtml(p.tag)}</span>
        </div>
        <h3 class="product-title">${escHtml(p.name)}</h3>
        <p class="product-desc">${escHtml(p.description)}</p>
        <div class="quick-points">
          ${p.highlights.map((h) => `<span>${escHtml(h)}</span>`).join('')}
        </div>
        <div class="meta">
          <div>
            <small>أنسب استخدام</small>
            <strong>${escHtml(p.bestFor)}</strong>
          </div>
          <div class="price">${money(p.price)}</div>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary add-to-cart" data-id="${p.id}">أضف إلى السلة</button>
          <button class="btn btn-ghost view-product"  data-id="${p.id}">عرض التفاصيل</button>
        </div>
      </div>
    </article>
  `
    )
    .join('');
}

function renderFeatures() {
  const el = $('#featureGrid');
  if (!el) return;
  el.innerHTML = features
    .map(
      (f) => `
    <article class="feature">
      <div class="icon">${f.icon}</div>
      <h3>${escHtml(f.title)}</h3>
      <p>${escHtml(f.desc)}</p>
    </article>
  `
    )
    .join('');
}

function renderSteps() {
  const el = $('#steps');
  if (!el) return;
  el.innerHTML = steps
    .map(
      (s, i) => `
    <article class="step-card">
      <div class="step-no">${i + 1}</div>
      <div>
        <h3>${escHtml(s.title)}</h3>
        <p>${escHtml(s.desc)}</p>
      </div>
    </article>
  `
    )
    .join('');
}

function renderShipping() {
  const el = $('#shippingItems');
  if (!el) return;
  el.innerHTML = shippingInfo
    .map(
      (i) => `
    <div class="ship-item">
      <span>${escHtml(i.label)}</span>
      <strong>${escHtml(i.value)}</strong>
    </div>
  `
    )
    .join('');
}

function renderFaq() {
  const el = $('#faqList');
  if (!el) return;
  el.innerHTML = faqs
    .map(
      (f) => `
    <div class="faq-item">
      <button class="faq-q">${escHtml(f.q)}<span>＋</span></button>
      <div class="faq-a">${escHtml(f.a)}</div>
    </div>
  `
    )
    .join('');
}

/* ─────────────────────────────────────────────────────────────────
   12. CART ACTIONS
   ───────────────────────────────────────────────────────────────── */
/* FIX: uses currentProducts instead of the old static 'products' const */
function addToCart(id) {
  const p = currentProducts.find((x) => x.id === id);
  if (!p) { console.warn(`[Cart] Product id ${id} not found in currentProducts`); return; }

  const found = state.cart.find((i) => i.id === id);
  if (found) {
    found.qty += 1;
  } else {
    state.cart.push({ ...p, qty: 1 });
  }

  saveCart();
  showToast(`تمت إضافة ${p.name} إلى السلة`);
}

function updateCartUI() {
  const totalCount = state.cart.reduce((a, b) => a + b.qty, 0);
  const countEl = $('#cartCount');
  if (countEl) countEl.textContent = totalCount;

  const itemsBox = $('#cartItems');
  const footer   = $('#cartFooter');
  if (!itemsBox || !footer) return;

  if (!state.cart.length) {
    itemsBox.innerHTML = '<div class="empty">السلة فارغة. أضيفي بعض المنتجات أولًا.</div>';
    footer.innerHTML   = '';
    return;
  }

  itemsBox.innerHTML = state.cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${escHtml(item.name)}"
           onerror="this.style.background='#eee';this.removeAttribute('src')">
      <div>
        <h4>${escHtml(item.name)}</h4>
        <p>${escHtml(item.weight)}</p>
        <p>${money(item.price)}</p>
        <div class="qty-row">
          <button data-action="inc"    data-id="${item.id}">+</button>
          <strong>${item.qty}</strong>
          <button data-action="dec"    data-id="${item.id}">-</button>
        </div>
      </div>
      <button class="remove-btn" data-action="remove" data-id="${item.id}">🗑️</button>
    </div>
  `
    )
    .join('');

  const total      = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = state.cart.reduce((s, i) => s + i.qty, 0);

  footer.innerHTML = `
    <div class="cart-summary">
      <div class="cart-summary-row"><span>عدد القطع</span><strong>${totalItems}</strong></div>
      <div class="cart-summary-row">
        <span>المجموع الفرعي</span>
        <strong class="price">${money(total)}</strong>
      </div>
      <div class="cart-summary-row"><span>الشحن</span><strong>يتم تأكيده حسب المنطقة</strong></div>
      <div class="cart-summary-row total-row">
        <span>الإجمالي</span>
        <strong class="price">${money(total)}</strong>
      </div>
      <p class="helper">
        سيتم تجهيز رسالة واتساب تلقائيًا تحتوي على تفاصيل الطلب،
        ثم نؤكد معك العنوان والشحن.
      </p>
      <button class="btn btn-whatsapp" id="checkoutBtn">إرسال الطلب عبر واتساب</button>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────────
   13. CHECKOUT
       FIX: WhatsApp opens immediately — Supabase save runs in
            background (fire-and-forget) without blocking the user
            or showing a false error toast when Supabase is null.
   ───────────────────────────────────────────────────────────────── */
function checkout() {
  if (!state.cart.length) {
    showToast('السلة فارغة');
    return;
  }

  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const lines = state.cart
    .map((i, n) => `${n + 1}. ${i.name}\nالكمية: ${i.qty}\nالسعر: ${money(i.price * i.qty)}`)
    .join('\n\n');

  const msg =
    `مرحبًا، أريد إتمام طلب المنتجات التالية:\n\n${lines}\n\n` +
    `المجموع: ${money(total)}\nالشحن: يتم تأكيده حسب المنطقة`;

  // Open WhatsApp immediately — do NOT wait for Supabase
  window.open(`https://wa.me/201095314011?text=${encodeURIComponent(msg)}`, '_blank');

  // Save to Supabase in the background (doesn't block checkout)
  if (supabase) {
    saveOrderToSupabase().catch((err) =>
      console.error('[Checkout] Background order save failed:', err)
    );
  }
}

/* ─────────────────────────────────────────────────────────────────
   14. PRODUCT MODAL
   ───────────────────────────────────────────────────────────────── */
/* FIX: uses currentProducts instead of static 'products' const */
function openProduct(id) {
  const p = currentProducts.find((x) => x.id === id);
  if (!p) { console.warn(`[Modal] Product id ${id} not found`); return; }

  const content = $('#productModalContent');
  if (!content) return;

  content.innerHTML = `
    <div class="modal-layout">
      <img src="${p.image}" alt="${escHtml(p.name)}"
           onerror="this.style.background='#eee';this.removeAttribute('src')">
      <div class="modal-info">
        <span class="tag badge">${escHtml(p.badge)}</span>
        <h3 id="modalTitle">${escHtml(p.name)}</h3>
        <div class="price">${money(p.price)}</div>
        <p>${escHtml(p.longDescription)}</p>
        <div class="quick-points">
          ${p.highlights.map((h) => `<span>${escHtml(h)}</span>`).join('')}
        </div>
        <h4>الفوائد</h4>
        <ul class="modal-list">
          ${p.benefits.map((b) => `<li>${escHtml(b)}</li>`).join('')}
        </ul>
        <h4>المكونات</h4>
        <ul class="modal-list">
          ${p.ingredients.map((i) => `<li>${escHtml(i)}</li>`).join('')}
        </ul>
        <h4>طريقة الاستخدام</h4>
        <p>${escHtml(p.usage)}</p>
        <div class="hero-actions">
          <button class="btn btn-primary modal-add" data-id="${p.id}">أضف إلى السلة</button>
          <a class="btn btn-whatsapp" target="_blank" rel="noopener"
             href="https://wa.me/201095314011">اسأل على واتساب</a>
        </div>
      </div>
    </div>
  `;

  const overlay = $('#productModalOverlay');
  if (overlay) overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProduct() {
  const overlay = $('#productModalOverlay');
  if (overlay) overlay.classList.add('hidden');
  if (!$('#cartOverlay')?.classList.contains('hidden')) return;
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────────────────────────
   15. CART SIDEBAR OPEN / CLOSE
   ───────────────────────────────────────────────────────────────── */
function openCart() {
  const overlay = $('#cartOverlay');
  const fab     = $('#floatingWhatsApp');
  if (overlay) overlay.classList.remove('hidden');
  if (fab)     fab.classList.add('hidden-mobile');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const overlay = $('#cartOverlay');
  const fab     = $('#floatingWhatsApp');
  if (overlay) overlay.classList.add('hidden');
  if (fab)     fab.classList.remove('hidden-mobile');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────────────────────────
   16. VIDEO FALLBACK
   ───────────────────────────────────────────────────────────────── */
function guardMedia() {
  $$('video').forEach((video) => {
    video.addEventListener(
      'error',
      () => {
        const poster = video.getAttribute('poster');
        if (poster) {
          video.parentElement.innerHTML = `<img class="video-fallback" src="${poster}" alt="منتج طبيعي">`;
        }
      },
      { once: true }
    );
  });
}

/* ─────────────────────────────────────────────────────────────────
   17. XSS HELPER
   ───────────────────────────────────────────────────────────────── */
function escHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─────────────────────────────────────────────────────────────────
   18. EVENT DELEGATION
   ───────────────────────────────────────────────────────────────── */
document.addEventListener('click', (e) => {
  // Filter tabs
  const filterBtn = e.target.closest('.filter-btn');
  if (filterBtn) {
    state.filter = filterBtn.dataset.filter;
    renderFilters();
    renderProducts();
    return;
  }

  // Add to cart (card + modal)
  const addBtn = e.target.closest('.add-to-cart, .modal-add');
  if (addBtn) {
    addToCart(Number(addBtn.dataset.id));
    if (addBtn.classList.contains('modal-add')) closeProduct();
    return;
  }

  // View product details
  const viewBtn = e.target.closest('.view-product');
  if (viewBtn) {
    openProduct(Number(viewBtn.dataset.id));
    return;
  }

  // Close product modal
  if (
    e.target.id === 'closeProductModal' ||
    e.target.id === 'productModalOverlay'
  ) {
    closeProduct();
    return;
  }

  // Open cart
  if (e.target.closest('#cartToggle')) {
    openCart();
    return;
  }

  // Close cart
  if (e.target.id === 'closeCart' || e.target.id === 'cartOverlay') {
    closeCart();
    return;
  }

  // Checkout
  if (e.target.id === 'checkoutBtn') {
    checkout();
    return;
  }

  // FAQ accordion toggle
  const faqQ = e.target.closest('.faq-q');
  if (faqQ) {
    faqQ.parentElement.classList.toggle('open');
    return;
  }

  // Cart qty inc / dec / remove
  const action = e.target.dataset.action;
  if (action) {
    const id   = Number(e.target.dataset.id);
    const item = state.cart.find((i) => i.id === id);
    if (!item) return;

    if (action === 'inc') {
      item.qty += 1;
    } else if (action === 'dec') {
      if (item.qty > 1) item.qty -= 1;
      else state.cart = state.cart.filter((i) => i.id !== id);
    } else if (action === 'remove') {
      state.cart = state.cart.filter((i) => i.id !== id);
    }

    saveCart();
  }
});

/* ─────────────────────────────────────────────────────────────────
   19. FLOATING WHATSAPP BUTTON
   ───────────────────────────────────────────────────────────────── */
const floatingWaBtn = $('#floatingWhatsApp');
if (floatingWaBtn) {
  floatingWaBtn.addEventListener('click', () =>
    window.open('https://wa.me/201095314011', '_blank')
  );
}

/* ─────────────────────────────────────────────────────────────────
   20. MOBILE MENU
   ───────────────────────────────────────────────────────────────── */
const menuBtn = $('#menuBtn');
if (menuBtn) {
  menuBtn.addEventListener('click', () =>
    $('#mobileMenu')?.classList.toggle('open')
  );
}
$$('.mobile-menu a').forEach((a) =>
  a.addEventListener('click', () => $('#mobileMenu')?.classList.remove('open'))
);

/* ─────────────────────────────────────────────────────────────────
   21. PAGE INIT  (async — waits for Supabase product fetch)
       FIX: init was synchronous; products were rendered from the
            static array only. Now it:
            1. Renders all non-product sections immediately.
            2. Shows a loading indicator in the product grid.
            3. Awaits loadProducts() (Supabase or fallback).
            4. Calls renderProducts() with live data.
   ───────────────────────────────────────────────────────────────── */
async function init() {
  try {
    // Render static sections synchronously — no async needed
    renderFilters();
    renderFeatures();
    renderSteps();
    renderShipping();
    renderFaq();
    updateCartUI();
    guardMedia();

    // Show loading skeleton while products are being fetched
    showProductsLoading();

    // ← THE CRITICAL FIX: actually fetch products from Supabase
    currentProducts = await loadProducts();

    // Now render products with live data (or fallback)
    renderProducts();

  } catch (err) {
    console.error('[Init] Unexpected error:', err);
    // Always guarantee products render — never leave grid empty
    currentProducts = FALLBACK_PRODUCTS;
    try { renderProducts(); } catch (_) { /* nothing more we can do */ }
  }
}

init();
