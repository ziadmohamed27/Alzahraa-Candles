/* =================================================================
   الزّهراء — script.js
   يعتمد على Supabase فقط لعرض المنتجات وإدارة عداد السلة في الصفحة الرئيسية
   ================================================================= */

const SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UgNH99IH4aP0aLN3OhH-Vw_w2-XqO_v';

const features = [
  { icon: '🌿', title: 'مكونات واضحة', desc: 'نختار مكونات أقرب للطبيعة لتكون التجربة أبسط وأوضح.' },
  { icon: '🤲', title: 'صناعة يدوية', desc: 'كل قطعة تُقدّم بإحساس عناية واهتمام بالتفاصيل.' },
  { icon: '🫧', title: 'عناية يومية لطيفة', desc: 'خيارات مناسبة للتنظيف اليومي بدون إحساس قاسٍ على البشرة.' },
  { icon: '💬', title: 'مساعدة قبل الطلب', desc: 'يمكنك سؤالنا مباشرة لاختيار النوع الأقرب لاحتياج بشرتك.' },
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
  { q: 'أي منتج أبدأ به لو كانت بشرتي حساسة؟', a: 'غالبًا صابون زيت الزيتون هو البداية الألطف للبشرة الجافة أو الحساسة.' },
  { q: 'ما الأنسب للبشرة الدهنية أو المختلطة؟', a: 'صابون الفحم النشط مناسب أكثر لمن تبحث عن تنظيف أعمق وتقليل الإحساس بالدهون الزائدة.' },
  { q: 'كيف يتم الطلب؟', a: 'اختاري المنتجات، أضيفيها إلى السلة، ثم اضغطي إرسال الطلب عبر واتساب ليصلنا ملخص الطلب مباشرة.' },
  { q: 'هل الشحن متاح داخل مصر؟', a: 'نعم، الشحن متاح لمعظم المحافظات داخل مصر ويتم تأكيد التفاصيل معك حسب المنطقة.' },
  { q: 'هل يمكنني السؤال قبل الشراء؟', a: 'بالتأكيد، يمكنك التواصل معنا مباشرة عبر واتساب لنرشح لك النوع المناسب.' },
];

let supabaseClient = null;
let currentProducts = [];

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function toSafeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function money(v) {
  return `${toSafeNumber(v, 0).toFixed(2)} ج.م`;
}

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
  console.log('[Supabase] client initialized');
})();

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
    price,
    qty,
    name,
    image,
    weight,
  };
}

function readCart() {
  try {
    const raw = window.localStorage ? localStorage.getItem('soap-cart') : null;
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(sanitizeCartItem).filter(Boolean) : [];
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
  cart: readCart(),
};

function updateCartBadge() {
  const totalCount = state.cart.reduce((sum, item) => sum + toSafeNumber(item.qty, 0), 0);
  const countEl = $('#cartCount');
  if (countEl) countEl.textContent = totalCount;
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
    price: toSafeNumber(row.price, 0),
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
    image: row.image ?? '',
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
    <div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:12px;padding:60px 16px;color:var(--muted);font-size:1.05rem">
      <span style="font-size:1.8rem;animation:spin 1s linear infinite">🌿</span>
      <span>جارٍ تحميل المنتجات...</span>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
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

  const list = state.filter === 'all'
    ? currentProducts
    : currentProducts.filter((p) => p.category === state.filter);

  if (!list.length) {
    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 16px;color:var(--muted)">
        <div style="font-size:2.5rem;margin-bottom:14px">🌿</div>
        <p>لا توجد منتجات في هذا التصنيف حالياً.</p>
      </div>
    `;
    return;
  }

  el.innerHTML = list.map((p) => `
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
          ${(p.highlights || []).map((h) => `<span>${escHtml(h)}</span>`).join('')}
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
          <button class="btn btn-ghost view-product" data-id="${p.id}">عرض التفاصيل</button>
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
  const product = currentProducts.find((item) => Number(item.id) === Number(id));
  if (!product) return;

  const found = state.cart.find((item) => Number(item.id) === Number(id));
  if (found) {
    found.qty += 1;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }

  writeCart(state.cart);
  updateCartBadge();
  showToast(`تمت إضافة ${product.name} إلى السلة`);
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
        <p>${escHtml(p.longDescription)}</p>
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
        <div class="hero-actions">
          <button class="btn btn-primary modal-add" data-id="${p.id}" type="button">أضف إلى السلة</button>
          <a class="btn btn-whatsapp" target="_blank" rel="noopener" href="https://wa.me/201095314011">اسأل على واتساب</a>
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
      const wrapper = video.parentElement;
      if (wrapper) {
        wrapper.innerHTML = '<div class="video-fallback">تعذر تحميل الفيديو</div>';
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
    renderFeatures();
    renderSteps();
    renderShipping();
    renderFaq();
    updateCartBadge();
    guardMedia();

    showProductsLoading();

    currentProducts = await loadProducts();
    renderProducts();
  } catch (err) {
    console.error('[Init] Unexpected error:', err);
    showProductsError('تعذر تحميل المنتجات من قاعدة البيانات حاليًا.');
  }
}

document.addEventListener('DOMContentLoaded', init);

window.addEventListener('load', () => {
  const floatingWaBtn = $('#floatingWhatsApp');
  if (floatingWaBtn) {
    floatingWaBtn.addEventListener('click', () => {
      window.open('https://wa.me/201095314011', '_blank');
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
});
