(function initZahraaCatalog(global) {
  const FALLBACK_SUPABASE_URL = global.__SITE_CONFIG__?.supabaseUrl || 'https://wihhfwdaysupjpfzshfq.supabase.co';
  const FALLBACK_SUPABASE_ANON_KEY = global.__SITE_CONFIG__?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaGhmd2RheXN1cGpwZnpzaGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTI4MjAsImV4cCI6MjA4ODkyODgyMH0.Eem_ytvdtd7UnkWaguief7WeaZFbP4vU16gfl4gefls';
  const PRODUCT_IMAGES_BUCKET = 'products';
  const CATEGORY_ORDER = ['طرح', 'خمارات', 'نقاب', 'إسدالات صلاة'];

  const CATEGORY_ALIASES = {
    'طرحه': 'طرح',
    'طرح': 'طرح',
    'طرحات': 'طرح',
    'طرح وشالات': 'طرح',
    'خمار': 'خمارات',
    'خمارات': 'خمارات',
    'نقاب': 'نقاب',
    'نقابات': 'نقاب',
    'اسدالات صلاة': 'إسدالات صلاة',
    'إسدالات صلاة': 'إسدالات صلاة',
    'اسدال صلاة': 'إسدالات صلاة',
    'إسدال صلاة': 'إسدالات صلاة',
    'اسدالات': 'إسدالات صلاة',
    'إسدالات': 'إسدالات صلاة'
  };

  function escHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function money(value) {
    const n = Number(value || 0);
    return `${n.toFixed(2)} ج.م`;
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeCategory(value) {
    const raw = String(value || '').trim();
    if (!raw) return 'منتجات أخرى';
    return CATEGORY_ALIASES[raw] || raw;
  }

  function compareCategories(a, b) {
    const aIndex = CATEGORY_ORDER.indexOf(a);
    const bIndex = CATEGORY_ORDER.indexOf(b);
    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }
    return a.localeCompare(b, 'ar');
  }

  function createClient() {
    if (global.__zahraaCatalogClient) return global.__zahraaCatalogClient;
    if (!global.supabase || typeof global.supabase.createClient !== 'function') {
      throw new Error('Supabase SDK is not loaded');
    }

    if (typeof global.createAuthClient === 'function') {
      global.__zahraaCatalogClient = global.createAuthClient();
      return global.__zahraaCatalogClient;
    }

    const url = global.AuthConfig?.supabaseUrl || FALLBACK_SUPABASE_URL;
    const key = global.AuthConfig?.supabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY;
    global.__zahraaCatalogClient = global.supabase.createClient(url, key);
    return global.__zahraaCatalogClient;
  }

  function getPublicImageUrl(imagePath) {
    const value = String(imagePath || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;

    let client;
    try {
      client = createClient();
    } catch {
      return value;
    }

    const cleanPath = value.replace(/^\/+/, '');
    const bucketPrefix = `${PRODUCT_IMAGES_BUCKET}/`;
    const normalizedPath = cleanPath.startsWith(bucketPrefix)
      ? cleanPath.slice(bucketPrefix.length)
      : cleanPath;

    const { data } = client.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(normalizedPath);
    return data?.publicUrl || '';
  }

  function toArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((entry) => entry.trim()).filter(Boolean);
      }
    }
    return [];
  }

  function safeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function buildProductUrl(product) {
    const params = new URLSearchParams();
    if (product?.slug) params.set('slug', product.slug);
    if (product?.id != null) params.set('id', String(product.id));
    return `./product.html?${params.toString()}`;
  }

  function imageSort(a, b) {
    return safeNumber(a?.sort_order, 0) - safeNumber(b?.sort_order, 0) || safeNumber(a?.id, 0) - safeNumber(b?.id, 0);
  }

  function variantSort(a, b) {
    return safeNumber(a?.sort_order, 0) - safeNumber(b?.sort_order, 0) || safeNumber(a?.id, 0) - safeNumber(b?.id, 0);
  }

  function normalizeCatalog(productsRows, variantRows, imageRows) {
    const variantsByProduct = new Map();
    const imagesByProduct = new Map();

    (variantRows || []).forEach((row) => {
      if (row?.is_active === false) return;
      const productId = Number(row?.product_id);
      if (!Number.isFinite(productId)) return;
      const entry = {
        id: Number(row.id),
        product_id: productId,
        size_label: String(row.size_label || '').trim(),
        color_name: String(row.color_name || '').trim(),
        color_hex: String(row.color_hex || '').trim(),
        price: safeNumber(row.price, NaN),
        compare_price: safeNumber(row.compare_price, 0),
        stock_quantity: Math.max(0, Math.trunc(safeNumber(row.stock_quantity, 0))),
        sku: String(row.sku || '').trim(),
        sort_order: safeNumber(row.sort_order, 0),
        is_active: row.is_active !== false,
      };
      if (!Number.isFinite(entry.id) || !Number.isFinite(entry.price)) return;
      const list = variantsByProduct.get(productId) || [];
      list.push(entry);
      variantsByProduct.set(productId, list);
    });

    (imageRows || []).forEach((row) => {
      if (row?.is_active === false) return;
      const productId = Number(row?.product_id);
      if (!Number.isFinite(productId)) return;
      const imagePath = String(row.image_path || '').trim();
      if (!imagePath) return;
      const entry = {
        id: Number(row.id),
        product_id: productId,
        color_name: String(row.color_name || '').trim(),
        image_path: imagePath,
        image_url: getPublicImageUrl(imagePath),
        alt_text: String(row.alt_text || '').trim(),
        sort_order: safeNumber(row.sort_order, 0),
        is_active: row.is_active !== false,
      };
      const list = imagesByProduct.get(productId) || [];
      list.push(entry);
      imagesByProduct.set(productId, list);
    });

    return (productsRows || [])
      .map((row) => {
        if (row?.is_active === false) return null;
        const productId = Number(row?.id);
        if (!Number.isFinite(productId)) return null;

        const variants = (variantsByProduct.get(productId) || []).sort(variantSort);
        if (!variants.length) return null;
        const images = (imagesByProduct.get(productId) || []).sort(imageSort);
        const minPrice = Math.min(...variants.map((variant) => variant.price));
        const maxComparePrice = Math.max(0, ...variants.map((variant) => variant.compare_price || 0));
        const colorNames = [...new Set(variants.map((variant) => variant.color_name).filter(Boolean))];
        const sizeLabels = [...new Set(variants.map((variant) => variant.size_label).filter(Boolean))];
        const coverImage = images[0]?.image_url || '';

        return {
          id: productId,
          slug: String(row.slug || '').trim(),
          name: String(row.name || '').trim(),
          category: normalizeCategory(row.category),
          short_description: String(row.short_description || row.description || '').trim(),
          description: String(row.description || '').trim(),
          long_description: String(row.long_description || '').trim(),
          fabric: String(row.fabric || '').trim(),
          care_note: String(row.care_note || '').trim(),
          size_guide: String(row.size_guide || '').trim(),
          sort_order: safeNumber(row.sort_order, 0),
          variants,
          images,
          colors: colorNames,
          sizes: sizeLabels,
          min_price: minPrice,
          compare_price: maxComparePrice,
          cover_image: coverImage,
          product_url: buildProductUrl({ id: productId, slug: row.slug }),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  }

  async function fetchCatalogRows(client) {
    const sb = client || createClient();
    const { data: products, error: productsError } = await sb
      .from('products')
      .select('id, slug, name, category, short_description, description, long_description, fabric, care_note, size_guide, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (productsError) throw productsError;
    const productIds = (products || []).map((product) => Number(product.id)).filter(Number.isFinite);
    if (!productIds.length) return { products: [], variants: [], images: [] };

    const { data: variants, error: variantsError } = await sb
      .from('product_variants')
      .select('id, product_id, size_label, color_name, color_hex, price, compare_price, stock_quantity, sku, sort_order, is_active')
      .in('product_id', productIds)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (variantsError) throw variantsError;

    const { data: images, error: imagesError } = await sb
      .from('product_images')
      .select('id, product_id, color_name, image_path, alt_text, sort_order, is_active')
      .in('product_id', productIds)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (imagesError) throw imagesError;

    return { products, variants, images };
  }

  async function fetchActiveCatalog(client) {
    const rows = await fetchCatalogRows(client);
    return normalizeCatalog(rows.products, rows.variants, rows.images);
  }

  async function fetchProductDetails(options = {}) {
    const sb = options.client || createClient();
    let query = sb
      .from('products')
      .select('id, slug, name, category, short_description, description, long_description, fabric, care_note, size_guide, sort_order, is_active')
      .eq('is_active', true);

    if (options.id != null) {
      query = query.eq('id', options.id);
    } else if (options.slug) {
      query = query.eq('slug', options.slug);
    } else {
      throw new Error('Missing product identifier');
    }

    const { data: product, error } = await query.maybeSingle();
    if (error) throw error;
    if (!product) return null;

    const productId = Number(product.id);
    const { data: variants, error: variantsError } = await sb
      .from('product_variants')
      .select('id, product_id, size_label, color_name, color_hex, price, compare_price, stock_quantity, sku, sort_order, is_active')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (variantsError) throw variantsError;

    const { data: images, error: imagesError } = await sb
      .from('product_images')
      .select('id, product_id, color_name, image_path, alt_text, sort_order, is_active')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (imagesError) throw imagesError;

    return normalizeCatalog([product], variants || [], images || [])[0] || null;
  }

  function getImagesForColor(product, colorName) {
    const allImages = Array.isArray(product?.images) ? product.images : [];
    const normalizedColor = String(colorName || '').trim();
    const colorImages = allImages.filter((image) => String(image.color_name || '').trim() === normalizedColor);
    if (colorImages.length) return colorImages;
    const genericImages = allImages.filter((image) => !String(image.color_name || '').trim());
    return genericImages.length ? genericImages : allImages;
  }

  function buildCartKey(variantId, fallbackId) {
    if (variantId != null && Number.isFinite(Number(variantId))) return `variant-${Number(variantId)}`;
    return `product-${Number(fallbackId)}`;
  }

  function makeCartItem(product, variant, quantity = 1, selectedImage = '') {
    const imageUrl = selectedImage || getImagesForColor(product, variant?.color_name)[0]?.image_url || product?.cover_image || '';
    return {
      cart_key: buildCartKey(variant?.id, product?.id),
      id: Number(product?.id),
      product_id: Number(product?.id),
      variant_id: Number(variant?.id),
      slug: product?.slug || '',
      name: product?.name || '',
      category: product?.category || '',
      price: safeNumber(variant?.price, 0),
      compare_price: safeNumber(variant?.compare_price, 0),
      color_name: variant?.color_name || '',
      size_label: variant?.size_label || '',
      image: imageUrl,
      image_path: getImagesForColor(product, variant?.color_name)[0]?.image_path || '',
      qty: Math.max(1, Math.trunc(safeNumber(quantity, 1))),
    };
  }

  global.ZahraaCatalog = {
    PRODUCT_IMAGES_BUCKET,
    CATEGORY_ORDER,
    normalizeCategory,
    compareCategories,
    escHtml,
    money,
    normalizeText,
    createClient,
    getPublicImageUrl,
    fetchActiveCatalog,
    fetchProductDetails,
    normalizeCatalog,
    getImagesForColor,
    buildProductUrl,
    buildCartKey,
    makeCartItem,
    toArray,
  };
})(window);
