/* =================================================================
   الزّهراء — script.js
   الواجهة الرئيسية للملابس الإسلامية النسائية
   تعتمد على Supabase: products + product_variants + product_images
   ================================================================= */

const WHATSAPP_NUMBER = '201095314011';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const features = [
  { icon: '🎨', title: 'صور حسب اللون', desc: 'يمكنك ربط كل لون بصوره من قاعدة البيانات، والواجهة تعرض الصور المناسبة عند الاختيار.' },
  { icon: '📏', title: 'مقاسات واضحة', desc: 'كل منتج يمكن أن يحتوي على أكثر من مقاس، ويظهر السعر الفعلي بعد تحديد الاختيار.' },
  { icon: '🧵', title: 'وصف أقرب للواقع', desc: 'يمكنك إضافة وصف الخامة والعناية والمقاس من Supabase ليظهر للعميل بوضوح.' },
  { icon: '🛍️', title: 'سلة مرتبة', desc: 'السلة تحفظ القطعة مع اللون والمقاس والسعر الفعلي بدل الاعتماد على اسم المنتج فقط.' },
];

const trustSignals = [
  { icon: '⚡', title: 'ربط مباشر بقاعدة البيانات', desc: 'إضافة منتج أو صورة أو لون جديد في Supabase ينعكس على المتجر بدون تعديل يدوي في كل بطاقة.' },
  { icon: '💸', title: 'أقل سعر ظاهر بوضوح', desc: 'بطاقة المنتج تعرض أقل سعر متاح بين الخيارات، ثم يتغير السعر داخل صفحة المنتج حسب المقاس واللون.' },
  { icon: '📷', title: 'صور أوضح لكل لون', desc: 'بدل صورة واحدة ثابتة، يمكن لكل لون أن يملك Gallery خاصة به داخل صفحة المنتج.' },
  { icon: '🤝', title: 'طرق طلب مرنة', desc: 'العميل يمكنه الطلب عبر الموقع، وواتساب يظل متاحًا كخيار مساعدة ومتابعة.' },
];

const steps = [
  { title: 'تصفح المنتجات', desc: 'استعرض الفئة المناسبة وابحث بالاسم أو اللون أو الخامة حتى تصل إلى القطعة المناسبة.' },
  { title: 'حدد اللون والمقاس', desc: 'افتح صفحة المنتج واختر اللون والمقاس، وستتغير الصور والسعر حسب الاختيار الفعلي.' },
  { title: 'أكمل الطلب', desc: 'أضف القطعة إلى السلة، ثم راجع بياناتك وأرسل الطلب عبر الموقع أو واتساب حسب الطريقة التي تناسبك.' },
];

const shippingInfo = [
  { label: 'شكل عرض المنتج', value: 'السعر داخل البطاقة = أقل سعر من الخيارات' },
  { label: 'صفحة المنتج', value: 'تعرض اللون والمقاس والصور والسعر الفعلي' },
  { label: 'طريقة الطلب', value: 'سلة مستقلة + حفظ الطلب في Supabase' },
  { label: 'الدعم السريع', value: 'واتساب متاح للسؤال عن الخامة أو المقاس' },
];

const faqs = [
  { q: 'هل السعر الظاهر في الصفحة الرئيسية هو السعر النهائي؟', a: 'البطاقة تعرض أقل سعر متاح للمنتج. عند فتح صفحة المنتج واختيار اللون والمقاس يظهر السعر الفعلي لهذا الاختيار.' },
  { q: 'هل يمكن أن تختلف الصور حسب اللون؟', a: 'نعم، النظام الجديد مبني ليعرض صور اللون المحدد من قاعدة البيانات، وليس صورة ثابتة فقط.' },
  { q: 'هل كل منتج لازم يكون له أكثر من مقاس؟', a: 'لا. يمكنك إنشاء منتج بمقاس واحد أو أكثر من مقاس، والواجهة تتعامل مع ما تضيفه في Supabase.' },
  { q: 'هل لازم أكتب مسار الصورة داخل الكود؟', a: 'لا. الواجهة تقرأ مسارات الصور من قاعدة البيانات. يمكنك وضع رابط مباشر أو مسار ملف داخل Storage bucket، وسيتم جلبه تلقائيًا.' },
  { q: 'ماذا يحدث لو كان لون موجود لكن مخزونه انتهى؟', a: 'يمكنك إيقاف هذا الـ variant أو جعل مخزونه صفرًا، والواجهة ستظهره كغير متاح أو تمنع إضافته حسب الحالة.' },
  { q: 'هل الطلب ما زال يعمل من السلة ولو كنت مسجل دخول؟', a: 'نعم. المسار الحالي ما زال محفوظًا: العميل الضيف يرسل عبر واتساب، والمستخدم المسجل يمكنه إرسال الطلب مباشرة من الموقع.' },
];

let currentProducts = [];
let catalogClient = null;

const $ = (selector) => document.querySelector(selector);
const money = (value) => window.ZahraaCatalog.money(value);
const escHtml = (value) => window.ZahraaCatalog.escHtml(value);
const normalizeText = (value) => window.ZahraaCatalog.normalizeText(value);

const state = {
  filter: 'all',
  search: '',
  cart: readCart(),
};

function readCart() {
  try {
    const raw = localStorage.getItem('soap-cart');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderFilters() {
  const el = $('#filters');
  if (!el) return;

  const categories = [...new Set(currentProducts.map((product) => product.category).filter(Boolean))]
    .sort(window.ZahraaCatalog.compareCategories);

  const filters = [['all', 'الكل'], ...categories.map((category) => [category, category])];

  el.innerHTML = filters.map(([id, label]) => `
    <button class="filter-btn ${state.filter === id ? 'active' : ''}" data-filter="${escHtml(id)}" type="button">
      ${escHtml(label)}
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

function matchesProductSearch(product, query) {
  if (!query) return true;
  const haystack = normalizeText([
    product.name,
    product.category,
    product.short_description,
    product.description,
    product.long_description,
    product.fabric,
    product.care_note,
    product.size_guide,
    ...(product.colors || []),
    ...(product.sizes || []),
  ].join(' '));

  return haystack.includes(normalizeText(query));
}

function getVisibleProducts() {
  return currentProducts
    .filter((product) => state.filter === 'all' || product.category === state.filter)
    .filter((product) => matchesProductSearch(product, state.search));
}

function renderProducts() {
  const el = $('#productGrid');
  if (!el) return;

  const list = getVisibleProducts();
  if (!list.length) {
    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 16px;color:var(--muted)">
        <div style="font-size:2.5rem;margin-bottom:14px">🧕</div>
        <p>${state.search ? `لا توجد نتائج مطابقة للبحث عن "${escHtml(state.search)}".` : 'لا توجد منتجات متاحة في هذا التصنيف حاليًا.'}</p>
      </div>
    `;
    return;
  }

  el.innerHTML = list.map((product) => {
    const colorCount = product.colors.length;
    const sizeCount = product.sizes.length;
    const helperBits = [];
    if (product.fabric) helperBits.push(product.fabric);
    if (colorCount) helperBits.push(`${colorCount} ${colorCount === 1 ? 'لون' : 'ألوان'}`);
    if (sizeCount) helperBits.push(`${sizeCount} ${sizeCount === 1 ? 'مقاس' : 'مقاسات'}`);

    return `
      <article class="card product-card clothing-product-card">
        <a class="product-card-link" href="${product.product_url}" aria-label="عرض ${escHtml(product.name)}">
          <div class="product-image-wrap">
            ${product.cover_image
              ? `<img class="product-image" src="${escHtml(product.cover_image)}" alt="${escHtml(product.name)}" loading="lazy">`
              : `<div class="product-image product-image-placeholder">${escHtml(product.category || 'الزّهراء')}</div>`}
          </div>
          <div class="card-body">
            <span class="product-skin-pill">${escHtml(product.category || 'منتج')}</span>
            <h3 class="product-title">${escHtml(product.name)}</h3>
            <p class="product-card-copy">${escHtml(product.short_description || product.description || 'عرض واضح للخيارات المتاحة داخل صفحة المنتج.')}</p>
            <div class="product-mini-meta clothing-meta">
              <span class="product-weight">${escHtml(helperBits.join(' · ') || 'المقاس واللون يحددان داخل صفحة المنتج')}</span>
              <div class="price price-from">من ${money(product.min_price)}</div>
            </div>
            <div class="card-actions compact-actions">
              <span class="btn btn-primary">عرض المنتج</span>
              <span class="btn btn-ghost">اختر اللون والمقاس</span>
            </div>
          </div>
        </a>
      </article>
    `;
  }).join('');
}

function renderFeatures() {
  const el = $('#featureGrid');
  if (!el) return;
  el.innerHTML = features.map((item) => `
    <article class="feature">
      <div class="icon">${item.icon}</div>
      <h3>${escHtml(item.title)}</h3>
      <p>${escHtml(item.desc)}</p>
    </article>
  `).join('');
}

function renderSteps() {
  const el = $('#steps');
  if (!el) return;
  el.innerHTML = steps.map((step, index) => `
    <article class="step-card">
      <div class="step-no">${index + 1}</div>
      <div>
        <h3>${escHtml(step.title)}</h3>
        <p>${escHtml(step.desc)}</p>
      </div>
    </article>
  `).join('');
}

function renderShipping() {
  const el = $('#shippingItems');
  if (!el) return;
  el.innerHTML = shippingInfo.map((item) => `
    <div class="ship-item">
      <span>${escHtml(item.label)}</span>
      <strong>${escHtml(item.value)}</strong>
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

function renderFaq() {
  const el = $('#faqList');
  if (!el) return;
  el.innerHTML = faqs.map((faq) => `
    <div class="faq-item">
      <button class="faq-q" type="button">${escHtml(faq.q)}<span>＋</span></button>
      <div class="faq-a">${escHtml(faq.a)}</div>
    </div>
  `).join('');
}

function updateCartUI() {
  const totalCount = state.cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const countEl = $('#cartCount');
  if (countEl) countEl.textContent = totalCount;
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

async function loadProducts() {
  catalogClient = window.ZahraaCatalog.createClient();
  return window.ZahraaCatalog.fetchActiveCatalog(catalogClient);
}

function initMobileMenu() {
  const menuBtn = $('#menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      $('#mobileMenu')?.classList.toggle('open');
    });
  }

  document.querySelectorAll('.mobile-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      $('#mobileMenu')?.classList.remove('open');
    });
  });
}

function initFloatingWhatsapp() {
  const floatingWaBtn = $('#floatingWhatsApp');
  if (!floatingWaBtn) return;
  floatingWaBtn.addEventListener('click', () => {
    window.open(WHATSAPP_LINK, '_blank');
  });
}

function initFaqToggle() {
  document.addEventListener('click', (event) => {
    const filterBtn = event.target.closest('.filter-btn');
    if (filterBtn) {
      state.filter = filterBtn.dataset.filter;
      renderFilters();
      renderProducts();
      return;
    }

    const faqBtn = event.target.closest('.faq-q');
    if (faqBtn) {
      faqBtn.parentElement.classList.toggle('open');
    }
  });
}

async function initAccountNav() {
  if (typeof renderAccountNav !== 'function') return;
  await renderAccountNav({ wrapSelector: '#accountNavWrap', supabase: catalogClient || null });
}

async function init() {
  try {
    bindProductSearch();
    renderFeatures();
    renderSteps();
    renderShipping();
    renderFaq();
    renderTrustStrip();
    updateCartUI();
    showProductsLoading();

    currentProducts = await loadProducts();
    renderFilters();
    renderProducts();
    await initAccountNav();
  } catch (error) {
    console.error('[Storefront] failed to initialize', error);
    showProductsError('تعذر تحميل المنتجات من قاعدة البيانات حاليًا. تأكد من الجداول الجديدة في Supabase ثم أعد المحاولة.');
    await initAccountNav();
  }
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', () => {
  initFloatingWhatsapp();
  initMobileMenu();
  initFaqToggle();
});
