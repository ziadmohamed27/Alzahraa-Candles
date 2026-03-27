const WHATSAPP_NUMBER = '201095314011';
const $ = (selector) => document.querySelector(selector);

const state = {
  product: null,
  selectedColor: '',
  selectedSize: '',
  selectedImageIndex: 0,
};

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function updateCartCount() {
  try {
    const raw = localStorage.getItem('soap-cart');
    const cart = raw ? JSON.parse(raw) : [];
    const count = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0) : 0;
    const el = $('#cartCount');
    if (el) el.textContent = count;
  } catch {}
}

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const slug = params.get('slug');
  return { id: id ? Number(id) : null, slug: slug || '' };
}

function getVariantsForSelectedColor() {
  const variants = Array.isArray(state.product?.variants) ? state.product.variants : [];
  return variants.filter((variant) => String(variant.color_name || '') === String(state.selectedColor || ''));
}

function getSelectedVariant() {
  return getVariantsForSelectedColor().find((variant) => String(variant.size_label || '') === String(state.selectedSize || '')) || null;
}

function getSelectedImages() {
  const images = window.ZahraaCatalog.getImagesForColor(state.product, state.selectedColor);
  return images.length ? images : [];
}

function setSelectedImage(index = 0) {
  const images = getSelectedImages();
  state.selectedImageIndex = Math.min(Math.max(index, 0), Math.max(images.length - 1, 0));

  const mainImage = $('#productMainImage');
  const placeholder = $('#productImagePlaceholder');
  const selected = images[state.selectedImageIndex];

  if (selected?.image_url) {
    mainImage.src = selected.image_url;
    mainImage.alt = state.product?.name || 'منتج';
    mainImage.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    mainImage.removeAttribute('src');
    mainImage.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }

  const thumbs = $('#productGalleryThumbs');
  if (!thumbs) return;
  thumbs.innerHTML = images.map((image, idx) => `
    <button type="button" class="product-thumb ${idx === state.selectedImageIndex ? 'is-active' : ''}" data-action="select-image" data-index="${idx}" aria-label="صورة ${idx + 1}">
      <img src="${window.ZahraaCatalog.escHtml(image.image_url)}" alt="${window.ZahraaCatalog.escHtml(image.alt_text || state.product?.name || 'منتج')}" loading="lazy">
    </button>
  `).join('');
}

function updatePriceAndStock() {
  const variant = getSelectedVariant();
  const priceEl = $('#productLivePrice');
  const compareEl = $('#productComparePrice');
  const stockRow = $('#productStockRow');
  const addBtn = $('#addVariantToCartBtn');
  const priceNote = $('#productPriceNote');
  const colorLabel = $('#selectedColorLabel');
  const sizeLabel = $('#selectedSizeLabel');

  colorLabel.textContent = state.selectedColor || '—';
  sizeLabel.textContent = state.selectedSize || '—';

  if (!variant) {
    priceEl.textContent = 'غير متاح';
    compareEl.classList.add('hidden');
    stockRow.textContent = 'هذا الاختيار غير متاح حاليًا.';
    stockRow.className = 'product-stock-row is-out';
    addBtn.disabled = true;
    priceNote.textContent = 'اختر لونًا ومقاسًا متاحين.';
    return;
  }

  priceEl.textContent = window.ZahraaCatalog.money(variant.price);
  priceNote.textContent = `السعر الحالي لاختيار: ${state.selectedColor || '—'} / ${state.selectedSize || '—'}`;

  if (variant.compare_price && variant.compare_price > variant.price) {
    compareEl.textContent = window.ZahraaCatalog.money(variant.compare_price);
    compareEl.classList.remove('hidden');
  } else {
    compareEl.textContent = '';
    compareEl.classList.add('hidden');
  }

  if ((variant.stock_quantity || 0) > 0) {
    stockRow.textContent = `متاح الآن — المخزون الحالي: ${variant.stock_quantity}`;
    stockRow.className = 'product-stock-row is-in';
    addBtn.disabled = false;
  } else {
    stockRow.textContent = 'نفد هذا الاختيار حاليًا.';
    stockRow.className = 'product-stock-row is-out';
    addBtn.disabled = true;
  }
}

function renderColorOptions() {
  const el = $('#productColorOptions');
  if (!el || !state.product) return;

  const colors = state.product.colors || [];
  el.innerHTML = colors.map((colorName) => {
    const variant = (state.product.variants || []).find((item) => item.color_name === colorName);
    const hex = variant?.color_hex || '';
    return `
      <button type="button" class="product-option-chip color-chip ${colorName === state.selectedColor ? 'is-active' : ''}" data-action="select-color" data-color="${window.ZahraaCatalog.escHtml(colorName)}">
        <span class="color-chip-swatch" style="${hex ? `background:${hex};` : ''}"></span>
        <span>${window.ZahraaCatalog.escHtml(colorName)}</span>
      </button>
    `;
  }).join('');
}

function renderSizeOptions() {
  const el = $('#productSizeOptions');
  if (!el || !state.product) return;
  const variants = getVariantsForSelectedColor();
  const sizes = [...new Set(variants.map((variant) => variant.size_label).filter(Boolean))];

  el.innerHTML = sizes.map((sizeLabel) => `
    <button type="button" class="product-option-chip ${sizeLabel === state.selectedSize ? 'is-active' : ''}" data-action="select-size" data-size="${window.ZahraaCatalog.escHtml(sizeLabel)}">
      ${window.ZahraaCatalog.escHtml(sizeLabel)}
    </button>
  `).join('');
}

function updateWhatsappLink() {
  const btn = $('#productWhatsappBtn');
  const variant = getSelectedVariant();
  if (!btn || !state.product) return;

  const lines = [
    'مرحبًا، أريد الاستفسار عن هذا المنتج:',
    `المنتج: ${state.product.name}`,
    state.selectedColor ? `اللون: ${state.selectedColor}` : '',
    state.selectedSize ? `المقاس: ${state.selectedSize}` : '',
    variant ? `السعر الحالي: ${window.ZahraaCatalog.money(variant.price)}` : '',
    window.location.href,
  ].filter(Boolean);

  btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function renderProductPage() {
  const product = state.product;
  if (!product) return;

  document.title = `${product.name} | الزّهراء`;
  $('#productBreadcrumbName').textContent = product.name;
  $('#productName').textContent = product.name;
  $('#productCategoryBadge').textContent = product.category || 'منتج';
  $('#productShortDescription').textContent = product.short_description || product.description || 'الخيارات المتاحة لهذا المنتج تظهر بعد تحديد اللون والمقاس.';
  $('#productFabric').textContent = product.fabric || 'يمكنك إضافة وصف الخامة من جدول products في Supabase.';
  $('#productCare').textContent = product.care_note || 'يمكنك إضافة تعليمات العناية من جدول products في Supabase.';
  $('#productSizeGuide').textContent = product.size_guide || 'يمكنك إضافة إرشاد المقاسات من جدول products في Supabase.';
  $('#productLongDescription').textContent = product.long_description || product.description || 'لا يوجد وصف تفصيلي بعد.';

  renderColorOptions();
  renderSizeOptions();
  setSelectedImage(0);
  updatePriceAndStock();
  updateWhatsappLink();
}

function ensureValidSelection() {
  if (!state.product) return;
  const colors = state.product.colors || [];
  if (!state.selectedColor || !colors.includes(state.selectedColor)) {
    state.selectedColor = colors[0] || '';
  }

  const sizeOptions = [...new Set(getVariantsForSelectedColor().map((variant) => variant.size_label).filter(Boolean))];
  if (!state.selectedSize || !sizeOptions.includes(state.selectedSize)) {
    state.selectedSize = sizeOptions[0] || '';
  }
}

function addSelectedVariantToCart() {
  const variant = getSelectedVariant();
  if (!state.product || !variant) {
    showToast('اختر لونًا ومقاسًا متاحين أولًا');
    return;
  }

  const qtyInput = $('#productQtyInput');
  const qty = Math.max(1, Number(String(qtyInput?.value || '1').replace(/[^0-9]/g, '')) || 1);
  const cartItem = window.ZahraaCatalog.makeCartItem(state.product, variant, qty, getSelectedImages()[state.selectedImageIndex]?.image_url || '');

  try {
    const raw = localStorage.getItem('soap-cart');
    const cart = raw ? JSON.parse(raw) : [];
    const safeCart = Array.isArray(cart) ? cart : [];
    const existing = safeCart.find((item) => String(item.cart_key || '') === String(cartItem.cart_key));
    if (existing) {
      existing.qty = Math.max(1, Number(existing.qty || 1)) + qty;
      existing.price = cartItem.price;
      existing.compare_price = cartItem.compare_price;
      existing.color_name = cartItem.color_name;
      existing.size_label = cartItem.size_label;
      existing.image = cartItem.image;
      existing.image_path = cartItem.image_path;
    } else {
      safeCart.push(cartItem);
    }
    localStorage.setItem('soap-cart', JSON.stringify(safeCart));
    updateCartCount();
    showToast(`تمت إضافة ${state.product.name} إلى السلة`);
  } catch (error) {
    console.error('[ProductPage] failed to save cart item', error);
    showToast('تعذر إضافة المنتج إلى السلة');
  }
}

async function initAccountNav() {
  if (typeof renderAccountNav === 'function') {
    await renderAccountNav({ wrapSelector: '#accountNavWrap' });
  }
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const colorBtn = event.target.closest('[data-action="select-color"]');
    if (colorBtn) {
      state.selectedColor = colorBtn.dataset.color || '';
      ensureValidSelection();
      renderColorOptions();
      renderSizeOptions();
      setSelectedImage(0);
      updatePriceAndStock();
      updateWhatsappLink();
      return;
    }

    const sizeBtn = event.target.closest('[data-action="select-size"]');
    if (sizeBtn) {
      state.selectedSize = sizeBtn.dataset.size || '';
      renderSizeOptions();
      updatePriceAndStock();
      updateWhatsappLink();
      return;
    }

    const imageBtn = event.target.closest('[data-action="select-image"]');
    if (imageBtn) {
      setSelectedImage(Number(imageBtn.dataset.index || 0));
      return;
    }

    if (event.target.id === 'productQtyInc') {
      const input = $('#productQtyInput');
      input.value = Math.max(1, Number(input.value || 1) + 1);
      return;
    }

    if (event.target.id === 'productQtyDec') {
      const input = $('#productQtyInput');
      input.value = Math.max(1, Number(input.value || 1) - 1);
      return;
    }

    if (event.target.id === 'addVariantToCartBtn') {
      addSelectedVariantToCart();
    }
  });

  document.addEventListener('input', (event) => {
    if (event.target.id !== 'productQtyInput') return;
    event.target.value = String(event.target.value || '').replace(/[^0-9]/g, '') || '1';
  });
}

async function init() {
  updateCartCount();
  bindEvents();
  await initAccountNav();

  const identifiers = getProductIdFromUrl();
  try {
    const product = await window.ZahraaCatalog.fetchProductDetails(identifiers);
    if (!product) throw new Error('Product not found');
    state.product = product;
    ensureValidSelection();

    $('#productLoadingState')?.classList.add('hidden');
    $('#productPage')?.classList.remove('hidden');
    renderProductPage();
  } catch (error) {
    console.error('[ProductPage] failed to load product', error);
    $('#productLoadingState')?.classList.add('hidden');
    $('#productErrorState')?.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);
