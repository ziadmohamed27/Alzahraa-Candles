/* =================================================================
   Alzahraa Candles — script.js
   يعتمد على Supabase للمنتجات + يدعم صور المنتجات من Supabase Storage
   ================================================================= */

const SITE_CONFIG = window.__SITE_CONFIG__ || {};
const SUPABASE_URL = SITE_CONFIG.supabaseUrl || 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = SITE_CONFIG.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaGhmd2RheXN1cGpwZnpzaGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTI4MjAsImV4cCI6MjA4ODkyODgyMH0.Eem_ytvdtd7UnkWaguief7WeaZFbP4vU16gfl4gefls';
const PRODUCT_IMAGES_BUCKET = 'products';
const WHATSAPP_NUMBER = '201095314011';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const features = [
  { icon: '🕯️', title: 'شموع مصنوعة يدويًا', desc: 'كل قطعة تُصب وتُجهز بعناية لتمنحك حضورًا دافئًا وتفاصيل أنيقة.' },
  { icon: '✨', title: 'روائح وهوية واضحة', desc: 'نقدّم وصفًا واضحًا للرائحة والأجواء المناسبة لكل شمعة قبل الشراء.' },
  { icon: '🎁', title: 'مثالية للهدايا', desc: 'خيارات مناسبة للهدايا والديكور واللحظات الهادئة داخل المنزل أو المكتب.' },
  { icon: '💬', title: 'مساعدة قبل الطلب', desc: 'يمكنك مراسلتنا لاختيار الشمعة الأنسب حسب الذوق أو المناسبة أو حجم المكان.' },
];

const trustSignals = [
  { icon: '🌿', title: 'شمع طبيعي نقي', desc: 'شمع صويا 100% — احتراق نظيف بلا دخان ورائحة تدوم.' },
  { icon: '🤲', title: 'كل شمعة تُصب يدويًا', desc: 'لا إنتاج آلي — عناية فردية من الصب للتغليف.' },
  { icon: '🎁', title: 'تغليف جاهز للإهداء', desc: 'مناسبة للتقديم مباشرةً دون الحاجة لأي إضافات.' },
  { icon: '💬', title: 'نساعدك تختار قبل الطلب', desc: 'أخبرنا بالأجواء أو المناسبة وسنرشح الخيار الأنسب.' },
];

const confidenceCards = [
  { icon: '🧪', title: 'تعرّف على الرائحة قبل الشراء', desc: 'وصف دقيق للرائحة والأجواء المناسبة في كل منتج — لا مفاجآت بعد الاستلام.' },
  { icon: '🔄', title: 'نراجع معك قبل الشحن', desc: 'لا يُرسل أي طلب قبل تأكيده معك شخصيًا على واتساب.' },
  { icon: '⭐', title: 'جودة لا تحتاج إثباتًا', desc: 'خامات طبيعية + صب يدوي + مراجعة شخصية — هذا ما يُميز كل قطعة.' },
  { icon: '🎀', title: 'هدية مناسبة حتمًا', desc: 'تغليف أنيق + رائحة منتقاة + لمسة شخصية — هدية كاملة بدون جهد إضافي.' },
];

const selectionProfiles = [
  {
    title: 'أجواء هادئة ودافئة',
    desc: 'مثالية لغرفة النوم أو ركن القراءة أو لحظات الاسترخاء.',
    keywords: ['هادئ', 'calm', 'lavender', 'vanilla', 'soft'],
    fallbackFilter: 'all',
    label: 'هادئة'
  },
  {
    title: 'هدية أنيقة وجاهزة',
    desc: 'تغليف يليق بالإهداء — لأعياد الميلاد والمناسبات والزيارات.',
    keywords: ['هدية', 'gift', 'box', 'luxury'],
    fallbackFilter: 'all',
    label: 'للإهداء'
  },
  {
    title: 'ديكور منزلي راقٍ',
    desc: 'حضور بصري جميل على الطاولة أو الرف أو مدخل المنزل.',
    keywords: ['decor', 'ديكور', 'شكل', 'jar', 'pillar'],
    fallbackFilter: 'all',
    label: 'ديكور'
  },
  {
    title: 'رائحة قوية وواضحة',
    desc: 'لمن يريد حضورًا عطريًا ملحوظًا يملأ المساحة.',
    keywords: ['strong', 'intense', 'عود', 'amber', 'spice'],
    fallbackFilter: 'all',
    label: 'عطر قوي'
  },
];

const steps = [
  { title: 'اختر الشموع المناسبة', desc: 'تصفّح الشموع وأضف ما يناسب ذوقك أو المناسبة أو المساحة التي تجهزها.' },
  { title: 'أرسل الطلب عبر واتساب', desc: 'عند الضغط على إرسال الطلب سيتم تجهيز رسالة تلقائية تحتوي على تفاصيل السلة.' },
  { title: 'نؤكد الطلب والتوصيل', desc: 'نراجع طلبك معك مباشرة ونحدد العنوان والموعد الأنسب للاستلام أو التوصيل.' },
];

const shippingInfo = [
  { label: 'مدة التوصيل', value: 'من 2 إلى 5 أيام عمل' },
  { label: 'مناطق الشحن', value: 'متاح لمعظم المحافظات داخل مصر' },
  { label: 'طريقة الطلب', value: 'طلب مباشر وسريع عبر واتساب' },
  { label: 'خدمة العملاء', value: 'مساعدة سريعة لاختيار الشمعة المناسبة' },
];

const faqs = [
  { q: 'كيف أختار الشمعة المناسبة؟', a: 'اعتمد على الرائحة والحجم والأجواء التي تريدها، ويمكنك أيضًا التواصل معنا عبر واتساب لو كنت محتارًا بين أكثر من خيار.' },
  { q: 'هل أحتاج إلى إنشاء حساب قبل الطلب؟', a: 'لا، لا تحتاج إلى إنشاء حساب. اختر المنتجات وأضفها للسلة ثم أرسل الطلب عبر واتساب.' },
  { q: 'هل الشموع مناسبة للهدايا؟', a: 'نعم، كثير من منتجات Alzahraa Candles مناسبة كهدايا أنيقة أو لمسات ديكور بسيطة ومميزة.' },
  { q: 'هل الشحن متاح داخل مصر؟', a: 'نعم، الشحن متاح لمعظم المحافظات داخل مصر ويتم تأكيد التفاصيل معك حسب المنطقة.' },
  { q: 'هل يمكنني السؤال قبل الشراء؟', a: 'بالتأكيد، يمكنك التواصل معنا مباشرة عبر واتساب لنرشح لك الخيار الأقرب لذوقك أو للمناسبة التي تجهز لها.' },
  { q: 'هل تختلف الروائح أو الأحجام بين المنتجات؟', a: 'نعم، يمكن أن تختلف الرائحة والحجم والتصميم من منتج لآخر، لذلك نعرض التفاصيل الأساسية لكل شمعة داخل البطاقة وصفحة التفاصيل.' },
];

let catalogPageSupabaseClient = null;

(function initSupabase() {
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.startsWith('PUT_')) {
    console.error('[Supabase] المفتاح غير صحيح أو غير مضاف.');
    return;
  }

  if (!window.supabase) {
    console.error('[Supabase] مكتبة Supabase لم يتم تحميلها.');
    return;
  }

  catalogPageSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('[Supabase] client initialized', catalogPageSupabaseClient);
})();

function readCart() {
  try {
    const raw = window.localStorage ? localStorage.getItem('candles-cart') : null;
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[Cart] localStorage غير متاح.', err);
    return [];
  }
}

function writeCart(cart) {
  try {
    if (window.localStorage) {
      localStorage.setItem('candles-cart', JSON.stringify(cart));
    }
  } catch (err) {
    console.warn('[Cart] تعذر حفظ السلة.', err);
  }
}

const state = {
  filter: 'all',
  search: '',
  cart: readCart(),
};

let currentProducts = [];

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const money = (v) => `${Number(v).toFixed(2)} ج.م`;

function normalizeArabicSearch(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSkinKeywords(product) {
  const category = String(product?.category || '').toLowerCase();
  const map = {
    calm: ['هادئ', 'هادئة', 'استرخاء', 'راحة', 'soft', 'calm'],
    gift: ['هدية', 'هدايا', 'gift', 'box', 'luxury'],
    decor: ['ديكور', 'decor', 'شكل', 'pillar', 'jar'],
    strong: ['قوية', 'قوي', 'rich', 'intense', 'عود', 'amber', 'spice'],
    all: []
  };

  return [
    ...Object.entries(map)
      .filter(([key, values]) => category === key || values.some((value) => category.includes(String(value).toLowerCase())))
      .flatMap(([, values]) => values),
    category,
  ];
}

function matchesProductSearch(product, query) {
  if (!query) return true;

  const haystack = normalizeArabicSearch([
    product.name,
    product.bestFor,
    product.badge,
    product.tag,
    product.description,
    product.longDescription,
    product.usage,
    ...(product.highlights || []),
    ...(product.benefits || []),
    ...(product.ingredients || []),
    ...getSkinKeywords(product),
  ].join(' '));

  return haystack.includes(normalizeArabicSearch(query));
}

function getVisibleProducts() {
  const byFilter = state.filter === 'all'
    ? currentProducts
    : currentProducts.filter((p) => p.category === state.filter);

  return byFilter.filter((product) => matchesProductSearch(product, state.search));
}


function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function getProductImageUrl(imagePath) {
  const value = String(imagePath || '').trim();
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (!catalogPageSupabaseClient) {
    return value;
  }

  const cleanPath = value.replace(/^\/+/, '');
  const bucketPrefix = `${PRODUCT_IMAGES_BUCKET}/`;
  const normalizedPath = cleanPath.startsWith(bucketPrefix)
    ? cleanPath.slice(bucketPrefix.length)
    : cleanPath;

  const { data } = catalogPageSupabaseClient.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(normalizedPath);

  return data?.publicUrl || '';
}

async function loadProducts() {
  if (!catalogPageSupabaseClient) {
    throw new Error('Supabase client is not initialized');
  }

  const { data, error } = await catalogPageSupabaseClient
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`[Products] Supabase fetch error: ${error.message}`);
  }

  if (!data || !data.length) {
    throw new Error('[Products] No products returned from Supabase');
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name ?? '',
    price: Number(row.price) || 0,
    weight: row.weight ?? '120 جرام',
    badge: row.badge ?? '',
    tag: row.tag ?? '',
    bestFor: row.best_for ?? row.bestFor ?? '',
    category: row.category ?? 'all',
    description: row.description ?? '',
    longDescription: row.long_description ?? row.longDescription ?? '',
    highlights: toArray(row.highlights),
    benefits: toArray(row.benefits),
    usage: row.usage ?? '',
    ingredients: toArray(row.ingredients),
    image_path: row.image ?? '',
    image: getProductImageUrl(row.image ?? ''),
  }));
}

function showToast(message, type = 'default') {
  const toast = $('#toast');
  if (!toast) return;
  if (type === 'added') {
    toast.innerHTML = `<span class="toast-icon">✓</span><span class="toast-copy">${escHtml(message)}</span>`;
  } else {
    toast.textContent = message;
  }
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function addToCartToast(productName) {
  const safeName = String(productName || '').trim();
  const label = safeName ? `تمت إضافة ${safeName} إلى السلة` : 'تمت إضافة المنتج إلى السلة';
  showToast(label, 'added');
}

function saveCart() {
  writeCart(state.cart);
  updateCartUI();
}

function renderFilters() {
  const el = $('#filters');
  if (!el) return;

  const categories = Array.from(new Set(
    currentProducts
      .map((p) => String(p.category || '').trim())
      .filter(Boolean)
  ));

  const filters = [['all', 'الكل'], ...categories.map((category) => [category, category])];

  el.innerHTML = filters.map(([id, label]) => `
    <button class="filter-btn ${state.filter === id ? 'active' : ''}" data-filter="${escHtml(id)}">
      ${escHtml(label)}
    </button>
  `).join('');
}

function showProductsLoading() {
  const el = $('#productGrid');
  if (!el) return;

  el.innerHTML = `
    <div class="products-loading-state" aria-live="polite">
      <div class="products-loading-candle" aria-hidden="true">
        <span class="products-loading-glow bubble-one"></span>
        <span class="products-loading-glow bubble-two"></span>
        <span class="products-loading-glow bubble-three"></span>
      </div>
      <span>جارٍ تحميل المنتجات...</span>
    </div>
  `;
}

function showProductsError(message = 'تعذر تحميل المنتجات حاليًا.') {
  const el = $('#productGrid');
  if (!el) return;

  el.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:48px 16px;color:#b42318">
      <div style="font-size:2.5rem;margin-bottom:14px">⚠️</div>
      <p>${escHtml(message)}</p>
    </div>
  `;
}

function renderProducts() {
  const el = $('#productGrid');
  if (!el) { console.error('productGrid element not found'); return; }

  const list = getVisibleProducts();

  if (!list.length) {
    el.innerHTML = state.search ? `
      <div class="products-empty-state" style="grid-column:1/-1">
        <div class="pes-icon">🔍</div>
        <h3 class="pes-title">لم نجد نتائج لـ «${escHtml(state.search)}»</h3>
        <p class="pes-hint">جرّب: فانيلا · عود · هدية · هادئ · ديكور</p>
        <div class="pes-actions">
          <button class="btn btn-primary" id="pesReset" type="button">عرض جميع المنتجات</button>
          <a href="https://wa.me/201095314011" target="_blank" rel="noopener" class="btn btn-ghost">💬 اسألنا</a>
        </div>
      </div>` : `
      <div class="products-empty-state" style="grid-column:1/-1">
        <div class="pes-icon">🕯️</div>
        <h3 class="pes-title">لا توجد منتجات في هذا التصنيف حالياً</h3>
        <button class="btn btn-primary" id="pesReset" type="button" style="margin-top:16px">عرض الكل</button>
      </div>`;

    document.getElementById('pesReset')?.addEventListener('click', () => {
      state.search = ''; state.filter = 'all';
      const inp = document.getElementById('productSearchInput');
      if (inp) inp.value = '';
      const clearBtn = document.getElementById('productSearchClear');
      if (clearBtn) clearBtn.hidden = true;
      renderFilters(); renderProducts();
    });
    return;
  }

  // Badge priority: badge > tag > bestFor — only meaningful labels
  function getBadge(p) {
    const b = (p.badge || '').trim();
    const t = (p.tag || '').trim();
    if (!b && !t) return '';
    const val = b || t;
    const isSpecial = /best|جديد|new|gift|هدي|مميز|popular/i.test(val);
    return `<span class="card-badge ${isSpecial ? 'card-badge--highlight' : ''}">${escHtml(val)}</span>`;
  }

  // Scent hint + mood tag on card for quick comparison
  function getScentHint(p) {
    const mood = getMoodTag(p);   // may be null — don't show tag if no confident match
    const raw  = (p.bestFor || p.description || '').trim();
    const short = raw.length > 42 ? raw.slice(0, 40).trimEnd() + '…' : raw;
    const moodHtml = mood
      ? `<div class="card-mood-row"><span class="card-mood-tag mood--${mood.theme}">${mood.emoji} ${mood.label}</span></div>`
      : '';
    return moodHtml + (short ? `<p class="card-scent">${escHtml(short)}</p>` : '');
  }

  el.innerHTML = list.map((p) => `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button"
      aria-label="${escHtml(p.name)} — ${money(p.price)} — اضغط لعرض التفاصيل">
      <div class="card-img-wrap">
        <img class="product-image" src="${p.image}" alt="${escHtml(p.name)}"
          loading="lazy" onerror="this.closest('article').classList.add('img-missing')">
        ${getBadge(p)}
      </div>
      <div class="card-body">
        <h3 class="card-name">${escHtml(p.name)}</h3>
        ${getScentHint(p)}
        <div class="card-footer">
          <span class="card-price">${money(p.price)}</span>
          <button class="btn btn-primary btn-sm card-atc" data-id="${p.id}" type="button"
            aria-label="أضف ${escHtml(p.name)} للسلة">
            + أضف للسلة
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderFeatures() {
  const el = $('#featureGrid');
  if (!el) return;

  el.innerHTML = features.map((f) => `
    <article class="feature">
      <div class="icon">${f.icon}</div>
      <h3>${escHtml(f.title)}</h3>
      <p>${escHtml(f.desc)}</p>
    </article>
  `).join('');
}

function renderSteps() {
  const el = $('#steps');
  if (!el) return;

  el.innerHTML = steps.map((s, i) => `
    <article class="step-card">
      <div class="step-no">${i + 1}</div>
      <div>
        <h3>${escHtml(s.title)}</h3>
        <p>${escHtml(s.desc)}</p>
      </div>
    </article>
  `).join('');
}

function renderShipping() {
  const el = $('#shippingItems');
  if (!el) return;

  el.innerHTML = shippingInfo.map((i) => `
    <div class="ship-item">
      <span>${escHtml(i.label)}</span>
      <strong>${escHtml(i.value)}</strong>
    </div>
  `).join('');
}

function renderTrustStrip() {
  const el = $('#trustStrip');
  if (!el) return;

  el.innerHTML = trustSignals.map((item) => `
    <article class="trust-card">
      <div class="trust-icon">${item.icon}</div>
      <div>
        <h3>${escHtml(item.title)}</h3>
        <p>${escHtml(item.desc)}</p>
      </div>
    </article>
  `).join('');
}

function renderConfidenceGrid() {
  const el = $('#confidenceGrid');
  if (!el) return;

  el.innerHTML = confidenceCards.map((item) => `
    <article class="confidence-card">
      <div class="confidence-icon">${item.icon}</div>
      <h3>${escHtml(item.title)}</h3>
      <p>${escHtml(item.desc)}</p>
    </article>
  `).join('');
}

function findProductByKeywords(keywords = []) {
  if (!Array.isArray(keywords) || !currentProducts.length) return null;
  return currentProducts.find((product) => {
    const haystack = [
      product.name,
      product.badge,
      product.tag,
      product.description,
      product.longDescription,
      product.bestFor,
      ...(product.highlights || []),
      ...(product.benefits || []),
    ].join(' ').toLowerCase();

    return keywords.some((keyword) => haystack.includes(String(keyword).toLowerCase()));
  }) || null;
}

function focusProducts(filter = 'all') {
  state.filter = filter;
  renderFilters();
  renderProducts();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSelectionGuide() {
  const el = $('#selectionGrid');
  if (!el) return;

  el.innerHTML = selectionProfiles.map((profile) => {
    const match = findProductByKeywords(profile.keywords);
    const suggestBlock = match
      ? `<div class="sg-suggest">
           <span class="sg-suggest-label">مقترح لك</span>
           <strong class="sg-suggest-name">${escHtml(match.name)}</strong>
           <span class="sg-suggest-price">${money(match.price)}</span>
         </div>`
      : '';

    const cta = match
      ? `<button type="button" class="btn btn-primary guide-product-btn sg-cta" data-id="${match.id}">
           اعرض هذا المنتج →
         </button>`
      : `<button type="button" class="btn btn-primary guide-filter-btn sg-cta" data-filter="${profile.fallbackFilter}">
           استعرض الخيارات →
         </button>`;

    return `
      <article class="selection-card sg-card">
        <div class="sg-top">
          <span class="sg-label">${escHtml(profile.label)}</span>
          <h3 class="sg-title">${escHtml(profile.title)}</h3>
          <p class="sg-desc">${escHtml(profile.desc)}</p>
        </div>
        ${suggestBlock}
        ${cta}
      </article>
    `;
  }).join('');
}

function renderFaq() {
  const el = $('#faqList');
  if (!el) return;

  el.innerHTML = faqs.map((f) => `
    <div class="faq-item">
      <button class="faq-q">${escHtml(f.q)}<span>＋</span></button>
      <div class="faq-a">${escHtml(f.a)}</div>
    </div>
  `).join('');
}

function addToCart(id) {
  const p = currentProducts.find((x) => Number(x.id) === Number(id));
  if (!p) return;

  const found = state.cart.find((i) => Number(i.id) === Number(id));
  if (found) {
    found.qty += 1;
  } else {
    state.cart.push({ ...p, qty: 1 });
  }

  saveCart();
  addToCartToast(p.name);
}

function updateCartUI() {
  const totalCount = state.cart.reduce((a, b) => a + b.qty, 0);
  const countEl = $('#cartCount');
  if (countEl) countEl.textContent = totalCount;
}


/* ─────────────────────────────────────────────────────────────────
   getMoodTag — infers scent family + ambiance from product fields.
   Returns { emoji, label, theme } for visual context.
───────────────────────────────────────────────────────────────── */
function getMoodTag(p) {
  /* Priority: use dedicated fields first, then fall back to description only.
     Each pattern is anchored to avoid false positives on common words.
     Order matters — more specific patterns before general ones.        */

  // Build search sources with descending trust
  const precise = [p.scent, p.bestFor, p.badge, p.tag, p.category]
    .filter(Boolean).join(' ').toLowerCase();
  const full    = (precise + ' ' + (p.description || '') + ' ' + (p.name || ''))
    .toLowerCase();

  // ── 1. Oud / wood / amber — most distinctive, check first ──
  if (/(عود|oud|أمبر|amber|كهرمان|ambergris|بخور|صندل|sandalwood|خشب)/.test(full))
    return { emoji: '🪵', label: 'دافئ وعميق', theme: 'oud' };

  // ── 2. Musk — check precise fields only to avoid false hits ──
  if (/(مسك|musk|موسكي)/.test(precise))
    return { emoji: '🪵', label: 'دافئ وعميق', theme: 'oud' };

  // ── 3. Vanilla / sweet / caramel ──
  if (/(فانيل|vanilla|كراميل|caramel|توفي|toffee|بسكويت|cookie|شوكولا|chocolate|كوكو|cocoa)/.test(full))
    return { emoji: '🍂', label: 'حلو ومريح', theme: 'vanilla' };

  // ── 4. Herbal / fresh — "زهر ليمون" before plain "زهر" to avoid floral mismatch ──
  if (/(لافندر|lavender|نعناع|mint|أعشاب|herbal|زهر الليمون|bergamot|إيكالبتوس|eucalyptus|بابونج|chamomile)/.test(full))
    return { emoji: '🌿', label: 'منعش وهادئ', theme: 'herbal' };

  // ── 5. Citrus ──
  if (/(برتقال|citrus|ليمون الحامض|lemon|lime|grapefruit|يوسفي|tangerine|mandarin)/.test(full))
    return { emoji: '🍊', label: 'منعش وحيوي', theme: 'citrus' };

  // ── 6. Floral — after herbal & citrus to avoid "زهر ليمون" landing here ──
  if (/(ورد|rose|ياسمين|jasmine|بيونيا|peony|زهري|floral|ازهار|زهور|lavanda)/.test(full))
    return { emoji: '🌸', label: 'زهري وناعم', theme: 'floral' };

  // ── 7. Coffee / cozy ──
  if (/(قهوة|coffee|كابتشينو|cappuccino|espresso|latte|لاتيه)/.test(full))
    return { emoji: '☕', label: 'دافئ ومريح', theme: 'vanilla' };

  // ── 8. Calm / relaxation — use precise fields only to avoid description noise ──
  if (/(هادئ|calm|استرخاء|relax|meditation|تأمل|spa)/.test(precise))
    return { emoji: '🕊️', label: 'هادئ ومريح', theme: 'calm' };

  // ── 9. Gift — only from badge/tag/category, never from description ──
  if (/(هدية|gift|إهداء|مناسبة خاصة)/.test(precise))
    return { emoji: '🎁', label: 'مثالي للإهداء', theme: 'gift' };

  // ── Fallback: no tag rather than wrong tag ──
  return null;
}

function openProduct(id) {
  const p = currentProducts.find((x) => Number(x.id) === Number(id));
  if (!p) return;

  const content = $('#productModalContent');
  if (!content) return;

  // Track recently viewed
  try {
    let rv = JSON.parse(localStorage.getItem('candles-rv') || '[]');
    rv = [Number(p.id), ...rv.filter(x => x !== Number(p.id))].slice(0, 6);
    localStorage.setItem('candles-rv', JSON.stringify(rv));
  } catch {}

  const badge = (p.badge || p.tag || '').trim();
  const hasHl  = Array.isArray(p.highlights)  && p.highlights.length;
  const hasBen = Array.isArray(p.benefits)    && p.benefits.length;
  const hasIng = Array.isArray(p.ingredients) && p.ingredients.length;
  const hasUsg = p.usage && p.usage.trim();

  // Compact spec pills — only the most useful 3
  const specPills = [
    p.weight   && `<span class="mspec-pill"><b>⚖️</b> ${escHtml(p.weight)}</span>`,
    p.bestFor  && `<span class="mspec-pill"><b>✦</b> ${escHtml(p.bestFor)}</span>`,
    p.category && `<span class="mspec-pill"><b>🏷️</b> ${escHtml(p.category)}</span>`,
  ].filter(Boolean).join('');

  // Highlights as compact chips
  const hlChips = hasHl
    ? `<div class="modal-hl-chips">${p.highlights.map(h => `<span>✓ ${escHtml(h)}</span>`).join('')}</div>`
    : '';

  // Benefits — closed by default to reduce overwhelm before commit
  const benBlock = hasBen ? `
    <details class="modal-details">
      <summary>✦ الفوائد والإحساس</summary>
      <ul class="modal-list">${p.benefits.map(b => `<li>${escHtml(b)}</li>`).join('')}</ul>
    </details>` : '';

  // Ingredients + Usage collapsed — secondary info
  const secBlock = (hasIng || hasUsg) ? `
    <details class="modal-details">
      <summary>المكونات وطريقة الاستخدام</summary>
      ${hasIng ? `<p class="modal-details-sub">المكونات</p><ul class="modal-list">${p.ingredients.map(i=>`<li>${escHtml(i)}</li>`).join('')}</ul>` : ''}
      ${hasUsg ? `<p class="modal-details-sub">الاستخدام</p><p>${escHtml(p.usage)}</p>` : ''}
    </details>` : '';

  // WhatsApp link prefilled with product name
  const waLink = `${WHATSAPP_LINK}?text=${encodeURIComponent('أريد الاستفسار عن: ' + p.name)}`;

  // Mood tag — may be null if no confident scent match
  const mood = getMoodTag(p);

  // Value chips — quick "why this product" signals (max 3)
  const valueChips = [
    p.bestFor && p.bestFor.trim(),
    /هدي|gift|هدية/i.test([p.badge,p.tag,p.bestFor,p.description].join(' ')) && 'مثالي هدية',
    p.weight && p.weight.trim(),
  ].filter((v, i, arr) => v && arr.indexOf(v) === i).slice(0, 3);

  content.innerHTML = `
    <div class="modal-layout">

      <!-- Image column -->
      <div class="modal-img-wrap">
        <img src="${p.image}" alt="${escHtml(p.name)}"
          onerror="this.style.background='var(--cream-mid)';this.removeAttribute('src')">
        ${badge ? `<span class="modal-badge">${escHtml(badge)}</span>` : ''}
        <!-- Mood bar — only shown if a confident scent match exists -->
        ${mood ? `<div class="modal-mood-bar mood--${mood.theme}">
          <span class="mood-emoji">${mood.emoji}</span>
          <span class="mood-label">${mood.label}</span>
        </div>` : ''}
      </div>

      <!-- Info column — scrollable body + sticky footer CTA -->
      <div class="modal-info">
        <div class="modal-info-scroll">

          <!-- ① Name — clear, immediate -->
          <h3 id="modalTitle" class="modal-name">${escHtml(p.name)}</h3>

          <!-- ② Price + value chips row -->
          <div class="modal-price-chips-row">
            <span class="modal-price">${money(p.price)}</span>
            <div class="modal-value-chips">
              ${valueChips.map(v => `<span class="mvc">${escHtml(v)}</span>`).join('')}
            </div>
          </div>

          <!-- ③ Description — short sensory summary -->
          ${(p.longDescription || p.description) ? `<p class="modal-desc">${escHtml(p.longDescription || p.description)}</p>` : ''}

          <!-- ④ Highlights — scan-friendly proof points -->
          ${hlChips}

          <!-- ⑤ Spec pills — secondary data -->
          ${specPills ? `<div class="modal-spec-pills">${specPills}</div>` : ''}

          <!-- ⑥ Expandable benefits (closed by default — less overwhelm) -->
          ${benBlock}

          <!-- ⑦ Secondary details (collapsed) -->
          ${secBlock}

        </div>

        <!-- ══ STICKY CTA FOOTER — always visible ══ -->
        <div class="modal-cta-footer">
          <!-- Trust micro-copy — quells last-second doubt -->
          <p class="modal-micro-trust">📦 سنتواصل معك لتأكيد الطلب قبل الشحن</p>

          <div class="modal-cta-row">
            <button class="btn btn-primary modal-add modal-add-main" data-id="${p.id}" type="button"
              data-price="${escHtml(money(p.price))}" data-name="${escHtml(p.name)}">
              أضف إلى السلة
            </button>
            <a class="btn btn-wa-compact" target="_blank" rel="noopener" href="${waLink}"
              title="استفسر عن هذا المنتج على واتساب">
              💬
            </a>
          </div>
        </div>

      </div>
    </div>
  `;

  const overlay = $('#productModalOverlay');
  if (overlay) overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Focus the add button for a11y
  setTimeout(() => content.querySelector('.modal-add-main')?.focus(), 80);
}

function closeProduct() {
  const overlay = $('#productModalOverlay');
  if (overlay) overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

function guardMedia() {
  $$('video').forEach((video) => {
    video.addEventListener('error', () => {
      const poster = video.getAttribute('poster');
      if (poster && video.parentElement) {
        video.parentElement.innerHTML = `<img class="video-fallback" src="${poster}" alt="شمعة يدوية">`;
      }
    }, { once: true });
  });
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

function bindProductSearch() {
  const searchInput = $('#productSearchInput');
  const clearBtn = $('#productSearchClear');
  if (!searchInput || !clearBtn) return;

  searchInput.value = state.search || '';
  clearBtn.hidden = !state.search;

  searchInput.addEventListener('input', (event) => {
    state.search = event.target.value.trim();
    clearBtn.hidden = !state.search;
    renderProducts();
  });

  clearBtn.addEventListener('click', () => {
    state.search = '';
    searchInput.value = '';
    clearBtn.hidden = true;
    renderProducts();
    searchInput.focus();
  });
}

document.addEventListener('click', (e) => {
  const filterBtn = e.target.closest('.filter-btn');
  if (filterBtn) {
    state.filter = filterBtn.dataset.filter;
    renderFilters();
    renderProducts();
    return;
  }

  const addBtn = e.target.closest('.add-to-cart, .modal-add, .card-atc');
  if (addBtn) {
    e.stopPropagation();
    const pid = Number(addBtn.dataset.id);
    addToCart(pid);

    // ── Card grid feedback ──
    const card = addBtn.closest('.product-card');
    if (card && !addBtn.classList.contains('modal-add')) {
      card.classList.add('card--added');
      const origText = addBtn.textContent;
      addBtn.textContent = '✓ أُضيف';
      addBtn.disabled = true;
      setTimeout(() => {
        card.classList.remove('card--added');
        addBtn.textContent = origText;
        addBtn.disabled = false;
      }, 1500);
    }

    // ── Modal button: success → next-step (don't close immediately) ──
    if (addBtn.classList.contains('modal-add')) {
      const origLabel = addBtn.textContent.trim();
      addBtn.disabled = true;
      addBtn.classList.add('btn--added');
      addBtn.innerHTML = '<span class="atc-check">✓</span> أُضيف إلى السلة';

      // After 1s show "view cart" as next step
      setTimeout(() => {
        addBtn.innerHTML = '<span class="atc-check">🛍️</span> عرض السلة ←';
        addBtn.classList.remove('btn--added');
        addBtn.classList.add('btn--go-cart');
        addBtn.disabled = false;
        addBtn.onclick = (ev) => {
          ev.stopPropagation();
          closeProduct();
          window.location.href = './cart.html';
        };
      }, 900);

      // Auto-close after 2.8s if no action
      setTimeout(() => {
        if (addBtn.classList.contains('btn--go-cart')) {
          closeProduct();
        }
      }, 2800);
    }
    return;
  }

  const guideProductBtn = e.target.closest('.guide-product-btn');
  if (guideProductBtn) {
    openProduct(Number(guideProductBtn.dataset.id));
    return;
  }

  const guideFilterBtn = e.target.closest('.guide-filter-btn');
  if (guideFilterBtn) {
    focusProducts(guideFilterBtn.dataset.filter || 'all');
    return;
  }

  // Whole card opens modal (unless add-to-cart button was clicked)
  const cardEl = e.target.closest('.product-card[data-id]');
  if (cardEl && !e.target.closest('.card-atc, .wl-btn')) {
    openProduct(Number(cardEl.dataset.id));
    return;
  }

  const viewBtn = e.target.closest('.view-product');
  if (viewBtn) {
    openProduct(Number(viewBtn.dataset.id));
    return;
  }

  if (e.target.id === 'closeProductModal' || e.target.id === 'productModalOverlay') {
    closeProduct();
    return;
  }

  const faqQ = e.target.closest('.faq-q');
  if (faqQ) {
    if (!e.__faqHandled) faqQ.parentElement.classList.toggle('open');
    return;
  }

});

async function init() {
  try {
    renderFilters();
    bindProductSearch();
    renderFeatures();
    renderSteps();
    renderShipping();
    renderFaq();
    renderTrustStrip();
    renderConfidenceGrid();
    updateCartUI();
    guardMedia();

    showProductsLoading();

    // Safety: if loadProducts never resolves/rejects, show error after 10s
    const _safetyTimeout = setTimeout(() => {
      if (!currentProducts.length) {
        showProductsError('انتهت مهلة تحميل المنتجات. تحقق من اتصالك وأعد المحاولة.');
      }
    }, 10000);

    currentProducts = await loadProducts();
    clearTimeout(_safetyTimeout);
    renderProducts();
    renderSelectionGuide();
  } catch (err) {
    console.error('[Init] Unexpected error:', err);
    showProductsError('تعذر تحميل المنتجات من قاعدة البيانات حاليًا.');
  }
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('keydown', (e) => {
  const card = e.target.closest('.product-card[data-id]');
  if (!card) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openProduct(Number(card.dataset.id));
  }
});

window.addEventListener('load', () => {
  const floatingWaBtn = $('#floatingWhatsApp');
  if (floatingWaBtn) {
    floatingWaBtn.addEventListener('click', () => {
      window.open(WHATSAPP_LINK, '_blank');
    });
  }

  const menuBtn = $('#menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      $('#mobileMenu')?.classList.toggle('open');
    });
  }

  $$('.mobile-menu a').forEach((a) => {
    a.addEventListener('click', () => {
      $('#mobileMenu')?.classList.remove('open');
    });
  });

  /* ── Account nav injection ── */
  initAccountNav();
});

/**
 * Checks Supabase auth session and injects account links into
 * #accountNavWrap (next to the cart icon in the header).
 * Uses auth-config.js which is loaded before this script.
 */
async function initAccountNav() {
  if (typeof renderAccountNav === 'function') {
    await renderAccountNav({ wrapSelector: '#accountNavWrap' });
    return;
  }

  const wrap = $('#accountNavWrap');
  if (!wrap) return;
  wrap.innerHTML = `
    <a href="./login.html" class="account-nav-btn is-ghost" aria-label="تسجيل الدخول">
      <span style="font-size:1rem">🔑</span>
      <span class="account-nav-label">دخول</span>
    </a>
  `;
}
