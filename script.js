/* =================================================================
   الزّهراء — script.js
   يعتمد على Supabase للمنتجات + يدعم صور المنتجات من Supabase Storage
   ================================================================= */

const SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UgNH99IH4aP0aLN3OhH-Vw_w2-XqO_v';
const PRODUCT_IMAGES_BUCKET = 'products';
const WHATSAPP_NUMBER = '201095314011';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const features = [
  { icon: '🌿', title: 'مكونات واضحة', desc: 'نختار مكونات أقرب للطبيعة لتكون التجربة أبسط وأوضح.' },
  { icon: '🤲', title: 'صناعة يدوية', desc: 'كل قطعة تُقدّم بإحساس عناية واهتمام بالتفاصيل.' },
  { icon: '🫧', title: 'عناية يومية لطيفة', desc: 'خيارات مناسبة للتنظيف اليومي بدون إحساس قاسٍ على البشرة.' },
  { icon: '💬', title: 'مساعدة قبل الطلب', desc: 'يمكنك سؤالنا مباشرة لاختيار النوع الأقرب لاحتياج بشرتك.' },
];

const trustSignals = [
  { icon: '⚡', title: 'طلب سريع', desc: 'اختيار المنتج ثم إرسال الطلب يتم خلال دقائق من نفس السلة.' },
  { icon: '🧾', title: 'وصف واضح', desc: 'كل نوع موضح بفوائده واستخدامه حتى تقل الحيرة قبل الشراء.' },
  { icon: '🤝', title: 'مساعدة مباشرة', desc: 'لو كنت محتارًا يمكنك سؤالنا على واتساب قبل إتمام الطلب.' },
  { icon: '🚚', title: 'تأكيد قبل التوصيل', desc: 'نراجع معك الطلب والعنوان والخطوات قبل الشحن.' },
];

const confidenceCards = [
  { icon: '✅', title: 'بدون إنشاء حساب', desc: 'تجربة الشراء تبدأ مباشرة من المتجر وتنتهي بتأكيد سريع عبر واتساب.' },
  { icon: '📦', title: 'رقم طلب واضح', desc: 'بعد الإرسال تحصل على رقم طلب واضح يساعدك في المتابعة والرجوع للطلب.' },
  { icon: '💬', title: 'ترشيح قبل الشراء', desc: 'يمكنك سؤالنا عن أنسب نوع لبشرتك قبل إضافة أي منتج للسلة.' },
  { icon: '🕒', title: 'خطوات واضحة', desc: 'الاختيار ثم السلة ثم التأكيد — بدون تعقيد أو خطوات مخفية.' },
];

const selectionProfiles = [
  {
    title: 'لو بشرتك تحتاج بداية ألطف',
    desc: 'ابدأ بخيار يومي هادئ يناسب الاستخدام المتكرر ويشعرك براحة أكثر من البداية.',
    keywords: ['زيت الزيتون', 'olive'],
    fallbackFilter: 'dry',
    label: 'اختيار لطيف'
  },
  {
    title: 'لو تبحث عن نعومة ولمسة مريحة',
    desc: 'خيار مناسب لمن يريد إحساسًا أكثر راحة وترطيبًا في الروتين اليومي.',
    keywords: ['عسل', 'honey'],
    fallbackFilter: 'dry',
    label: 'ترطيب يومي'
  },
  {
    title: 'لو تحتاج تنظيفًا أعمق',
    desc: 'خيار عملي أكثر للبشرة الدهنية أو المختلطة ولمن يفضّل إحساس تنظيف أوضح.',
    keywords: ['فحم', 'charcoal'],
    fallbackFilter: 'oily',
    label: 'تنظيف أعمق'
  },
  {
    title: 'لو تريد انتعاشًا أو تقشيرًا أخف',
    desc: 'ترشيح مناسب لمن يحب إحساسًا أكثر حيوية مع روتين عناية بسيط.',
    keywords: ['قهوة', 'coffee'],
    fallbackFilter: 'scrub',
    label: 'انتعاش وتقشير'
  },
];

const steps = [
  { title: 'اختر منتجاتك', desc: 'تصفّح المنتجات المناسبة لبشرتك وأضف ما يناسبك إلى السلة بسهولة.' },
  { title: 'أرسل الطلب عبر واتساب', desc: 'عند الضغط على إرسال الطلب سيتم تجهيز رسالة تلقائية تحتوي على تفاصيل السلة.' },
  { title: 'نؤكد الطلب والتوصيل', desc: 'نراجع طلبك معك مباشرة ونحدد العنوان والموعد الأنسب للاستلام أو التوصيل.' },
];

const shippingInfo = [
  { label: 'مدة التوصيل', value: 'من 2 إلى 5 أيام عمل' },
  { label: 'مناطق الشحن', value: 'متاح لمعظم المحافظات داخل مصر' },
  { label: 'طريقة الطلب', value: 'طلب مباشر وسريع عبر واتساب' },
  { label: 'خدمة العملاء', value: 'مساعدة سريعة لاختيار المنتج المناسب' },
];

const faqs = [
  { q: 'كيف أعرف المنتج الأنسب لبشرتي؟', a: 'كل منتج موضح بفائدته الأساسية، ويمكنك أيضًا التواصل معنا عبر واتساب لو كنت محتارًا بين أكثر من خيار.' },
  { q: 'هل أحتاج إلى إنشاء حساب قبل الطلب؟', a: 'لا، لا تحتاج إلى إنشاء حساب. اختَر المنتجات وأضفها للسلة ثم أرسل الطلب عبر واتساب.' },
  { q: 'ما الأنسب للبشرة الدهنية أو المختلطة؟', a: 'غالبًا صابون الفحم النشط هو الخيار الأنسب لمن يبحث عن تنظيف أعمق وتقليل الإحساس بالدهون الزائدة.' },
  { q: 'وأي منتج أبدأ به لو كانت بشرتي حساسة أو جافة؟', a: 'غالبًا صابون زيت الزيتون هو البداية الألطف للاستخدام اليومي للبشرة الجافة أو الحساسة.' },
  { q: 'هل الشحن متاح داخل مصر؟', a: 'نعم، الشحن متاح لمعظم المحافظات داخل مصر ويتم تأكيد التفاصيل معك حسب المنطقة.' },
  { q: 'هل يمكنني السؤال قبل الشراء؟', a: 'بالتأكيد، يمكنك التواصل معنا مباشرة عبر واتساب لنرشح لك النوع الأقرب لاحتياجك.' },
];

let supabaseClient = null;

(function initSupabase() {
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.startsWith('PUT_')) {
    console.error('[Supabase] المفتاح غير صحيح أو غير مضاف.');
    return;
  }

  if (!window.supabase) {
    console.error('[Supabase] مكتبة Supabase لم يتم تحميلها.');
    return;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('[Supabase] client initialized', supabaseClient);
})();

function readCart() {
  try {
    const raw = window.localStorage ? localStorage.getItem('soap-cart') : null;
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
      localStorage.setItem('soap-cart', JSON.stringify(cart));
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
    dry: ['جاف', 'جافة', 'جفاف', 'البشرة الجافة', 'الحساسه', 'الحساسة', 'ترطيب'],
    oily: ['دهني', 'دهنية', 'دهنيه', 'مختلطة', 'مختلطه', 'البشرة الدهنية', 'تنظيف عميق', 'دهون'],
    scrub: ['تقشير', 'مقشر', 'مقشره', 'انتعاش', 'تجديد'],
    normal: ['عادية', 'عاديه', 'البشرة العادية']
  };
  return map[category] || [];
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

  if (!supabaseClient) {
    return value;
  }

  const cleanPath = value.replace(/^\/+/, '');
  const bucketPrefix = `${PRODUCT_IMAGES_BUCKET}/`;
  const normalizedPath = cleanPath.startsWith(bucketPrefix)
    ? cleanPath.slice(bucketPrefix.length)
    : cleanPath;

  const { data } = supabaseClient.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(normalizedPath);

  return data?.publicUrl || '';
}

async function loadProducts() {
  if (!supabaseClient) {
    throw new Error('Supabase client is not initialized');
  }

  const { data, error } = await supabaseClient
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

function renderFilters() {
  const el = $('#filters');
  if (!el) return;

  const filters = [
    ['all', 'الكل'],
    ['dry', 'للبشرة الجافة'],
    ['oily', 'للبشرة الدهنية'],
    ['scrub', 'تقشير'],
  ];

  el.innerHTML = filters.map(([id, label]) => `
    <button class="filter-btn ${state.filter === id ? 'active' : ''}" data-filter="${id}">
      ${label}
    </button>
  `).join('');
}

function showProductsLoading() {
  const el = $('#productGrid');
  if (!el) return;

  el.innerHTML = `
    <div class="products-loading-state" aria-live="polite">
      <div class="products-loading-soap" aria-hidden="true">
        <span class="products-loading-bubble bubble-one"></span>
        <span class="products-loading-bubble bubble-two"></span>
        <span class="products-loading-bubble bubble-three"></span>
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
  if (!el) {
    console.error('productGrid element not found');
    return;
  }

  const list = getVisibleProducts();

  if (!list.length) {
    const message = state.search
      ? `لا توجد نتائج مطابقة للبحث عن "${escHtml(state.search)}".`
      : 'لا توجد منتجات في هذا التصنيف حالياً.';

    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 16px;color:var(--muted)">
        <div style="font-size:2.5rem;margin-bottom:14px">🌿</div>
        <p>${message}</p>
      </div>
    `;
    return;
  }

  el.innerHTML = list.map((p) => `
    <article class="card product-card view-product" data-id="${p.id}" tabindex="0" role="button" aria-label="عرض تفاصيل ${escHtml(p.name)}">
      <img
        class="product-image"
        src="${p.image}"
        alt="${escHtml(p.name)}"
        loading="lazy"
        onerror="this.closest('article').classList.add('img-missing')"
      >
      <div class="card-body">
        <span class="product-skin-pill">${escHtml(p.bestFor || p.badge || p.tag || '')}</span>
        <h3 class="product-title">${escHtml(p.name)}</h3>
        <div class="product-mini-meta">
          <span class="product-weight">${escHtml(p.weight || '120 جرام')}</span>
          <div class="price">${money(p.price)}</div>
        </div>
        <div class="card-actions compact-actions">
          <button class="btn btn-primary add-to-cart" data-id="${p.id}" type="button">أضف إلى السلة</button>
          <button class="btn btn-ghost view-product" data-id="${p.id}" type="button">عرض التفاصيل</button>
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
    const badge = match
      ? `<div class="selection-match"><span>المنتج المقترح</span><strong>${escHtml(match.name)}</strong><span>${money(match.price)}</span></div>`
      : `<div class="selection-match"><span>تصنيف مقترح</span><strong>${escHtml(profile.label)}</strong><span>استعرض الخيارات المشابهة</span></div>`;

    const primaryAction = match
      ? `<button type="button" class="btn btn-primary guide-product-btn" data-id="${match.id}">عرض المنتج</button>`
      : `<button type="button" class="btn btn-primary guide-filter-btn" data-filter="${profile.fallbackFilter}">استعرض الخيارات</button>`;

    return `
      <article class="selection-card compact-selection-card">
        <span class="selection-kicker">${escHtml(profile.label)}</span>
        <h3>${escHtml(profile.title)}</h3>
        ${badge}
        <div class="selection-actions compact-selection-actions">
          ${primaryAction}
          <button type="button" class="btn btn-ghost guide-filter-btn secondary-guide-btn" data-filter="${profile.fallbackFilter}">
            منتجات مشابهة
          </button>
        </div>
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
  showToast(`تمت إضافة ${p.name} إلى السلة`);
}

function updateCartUI() {
  const totalCount = state.cart.reduce((a, b) => a + b.qty, 0);
  const countEl = $('#cartCount');
  if (countEl) countEl.textContent = totalCount;
}

function openProduct(id) {
  const p = currentProducts.find((x) => Number(x.id) === Number(id));
  if (!p) return;

  const content = $('#productModalContent');
  if (!content) return;

  content.innerHTML = `
    <div class="modal-layout">
      <img src="${p.image}" alt="${escHtml(p.name)}" onerror="this.style.background='#eee';this.removeAttribute('src')">
      <div class="modal-info">
        <span class="tag badge">${escHtml(p.badge)}</span>
        <h3 id="modalTitle">${escHtml(p.name)}</h3>
        <div class="price">${money(p.price)}</div>
        <div class="modal-meta-bar">
          <span>الوزن: ${escHtml(p.weight || '—')}</span>
          <span>أنسب استخدام: ${escHtml(p.bestFor || 'عناية يومية')}</span>
        </div>
        <p>${escHtml(p.longDescription || p.description)}</p>
        <div class="quick-points">
          ${(p.highlights || []).map((h) => `<span>${escHtml(h)}</span>`).join('')}
        </div>
        <h4>الفوائد</h4>
        <ul class="modal-list">
          ${(p.benefits || []).map((b) => `<li>${escHtml(b)}</li>`).join('')}
        </ul>
        <h4>المكونات</h4>
        <ul class="modal-list">
          ${(p.ingredients || []).map((i) => `<li>${escHtml(i)}</li>`).join('')}
        </ul>
        <h4>طريقة الاستخدام</h4>
        <p>${escHtml(p.usage)}</p>
        <div class="modal-help-strip">
          <span>💬 يمكنك السؤال على واتساب قبل الطلب</span>
          <span>🛍️ أضف للسلة ثم أكمل الطلب من صفحة السلة</span>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary modal-add" data-id="${p.id}" type="button">أضف إلى السلة</button>
          <a class="btn btn-whatsapp" target="_blank" rel="noopener" href="${WHATSAPP_LINK}">اسأل على واتساب</a>
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
  document.body.style.overflow = '';
}

function guardMedia() {
  $$('video').forEach((video) => {
    video.addEventListener('error', () => {
      const poster = video.getAttribute('poster');
      if (poster && video.parentElement) {
        video.parentElement.innerHTML = `<img class="video-fallback" src="${poster}" alt="منتج طبيعي">`;
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

  const addBtn = e.target.closest('.add-to-cart, .modal-add');
  if (addBtn) {
    addToCart(Number(addBtn.dataset.id));
    if (addBtn.classList.contains('modal-add')) closeProduct();
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
    faqQ.parentElement.classList.toggle('open');
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

    currentProducts = await loadProducts();
    renderProducts();
    renderSelectionGuide();
  } catch (err) {
    console.error('[Init] Unexpected error:', err);
    showProductsError('تعذر تحميل المنتجات من قاعدة البيانات حاليًا.');
  }
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('keydown', (e) => {
  const card = e.target.closest('.product-card.view-product');
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
