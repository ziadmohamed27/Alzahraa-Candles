const products = [
  {id:1,name:"صابون زيت الزيتون",price:40,weight:"120 جرام",badge:"للبشرة الجافة والحساسة",tag:"أفضل بداية للبشرة الحساسة",bestFor:"البشرة الجافة والحساسة",category:"dry",description:"اختيار لطيف للبشرة الجافة والحساسة يمنح تنظيفًا ناعمًا دون إحساس بالشد بعد الغسيل.",longDescription:"صابون طبيعي غني بزيت الزيتون البكر وفيتامين E، مناسب لمن تبحث عن تنظيف لطيف مع ترطيب يومي مريح للوجه والجسم.",highlights:["ترطيب يومي","لطيف على الحساسة","مناسب للبدء"],benefits:["يساعد على تقليل الإحساس بالجفاف بعد الغسيل","لطيف للاستخدام اليومي","مناسب لمن تريد روتينًا بسيطًا"],usage:"يستخدم يوميًا على البشرة المبللة ثم يشطف بالماء الفاتر.",ingredients:["زيت الزيتون البكر","زيت جوز الهند","ماء","زيت اللافندر"],image:"./images/olive.jpg"},
  {id:2,name:"صابون الفحم النشط",price:45,weight:"120 جرام",badge:"للبشرة الدهنية والمختلطة",tag:"للمسام واللمعة",bestFor:"البشرة الدهنية والمختلطة",category:"oily",description:"يناسب البشرة الدهنية والمختلطة ويساعد على تنظيف المسام وتقليل الإحساس بالدهون الزائدة.",longDescription:"تركيبة بالفحم النباتي النشط مع زيت شجرة الشاي، مناسبة لمن ترغب في تنظيف أعمق وإحساس أوضح بالانتعاش بعد الغسيل.",highlights:["تنظيف أعمق","للدهنية","إحساس منتعش"],benefits:["يساعد على تنظيف الشوائب والزيوت السطحية","مناسب لمنزعجة من اللمعة","يدعم مظهرًا أنظف للمسام"],usage:"يستخدم مرة إلى مرتين يوميًا حسب احتياج البشرة.",ingredients:["فحم نباتي نشط","زيت شجرة الشاي","زيت جوز الهند","مستخلص الألوفيرا"],image:"./images/charcoal.jpg"},
  {id:3,name:"صابون العسل",price:42,weight:"120 جرام",badge:"ترطيب ونعومة يومية",tag:"الأكثر طلبًا",bestFor:"نعومة وترطيب يومي",category:"all",description:"مناسب لمن تريد نعومة ولمسة مرطبة يومية، خاصة إذا كانت البشرة تميل للجفاف أو البهتان.",longDescription:"يجمع بين العسل الطبيعي وزبدة الشيا ليمنح البشرة إحساسًا بالراحة والنعومة بعد الاستخدام اليومي.",highlights:["نعومة واضحة","ترطيب مريح","مناسب يوميًا"],benefits:["يساعد على إبقاء البشرة أكثر نعومة","مناسب للبشرة الباهتة أو المرهقة","خيار يومي دافئ ولطيف"],usage:"يستخدم يوميًا للوجه أو الجسم مع تدليك لطيف ثم شطف بالماء الفاتر.",ingredients:["عسل طبيعي","زبدة الشيا","زيت اللوز الحلو","زيت جوز الهند"],image:"./images/honey.jpg"},
  {id:4,name:"صابون القهوة",price:44,weight:"130 جرام",badge:"تقشير لطيف وتجديد",tag:"للجسم والمناطق الخشنة",bestFor:"تقشير لطيف للجسم",category:"scrub",description:"مناسب لتقشير لطيف للجسم والمناطق الخشنة ويساعد على تحسين ملمس البشرة.",longDescription:"يحتوي على حبيبات قهوة مطحونة بشكل ناعم لتقشير لطيف يساعد على إزالة الخلايا السطحية الجافة وترك ملمس أنعم.",highlights:["تقشير لطيف","للجسم","ملمس أنعم"],benefits:["يساعد على إزالة الخلايا السطحية الجافة","مناسب للمناطق الخشنة","يمنح إحساسًا بالانتعاش بعد الاستحمام"],usage:"يستخدم 2 إلى 3 مرات أسبوعيًا على البشرة الرطبة.",ingredients:["قهوة عربية","زيت جوز الهند","زبدة الكاكاو","سكر قصب"],image:"./images/coffee.jpg"}
];

const features = [
  {icon:"🌿",title:"مكونات واضحة",desc:"نختار مكونات أقرب للطبيعة لتكون التجربة أبسط وأوضح."},
  {icon:"🤲",title:"صناعة يدوية",desc:"كل قطعة تُقدّم بإحساس عناية واهتمام بالتفاصيل."},
  {icon:"🫧",title:"عناية يومية لطيفة",desc:"خيارات مناسبة للتنظيف اليومي بدون إحساس قاسٍ على البشرة."},
  {icon:"💬",title:"مساعدة قبل الطلب",desc:"يمكنك سؤالنا مباشرة لاختيار النوع الأقرب لاحتياج بشرتك."}
];

const steps = [
  {title:"اختر منتجاتك",desc:"تصفّح المنتجات المناسبة لبشرتك وأضف ما يناسبك إلى السلة بسهولة."},
  {title:"أرسل الطلب عبر واتساب",desc:"عند الضغط على إرسال الطلب سيتم تجهيز رسالة تلقائية تحتوي على تفاصيل السلة."},
  {title:"نؤكد الطلب والتوصيل",desc:"نراجع طلبك معك مباشرة ونحدد العنوان والموعد الأنسب للاستلام أو التوصيل."}
];

const shippingInfo = [
  {label:"مدة التوصيل",value:"من 2 إلى 5 أيام عمل"},
  {label:"مناطق الشحن",value:"متاح لمعظم المحافظات داخل مصر"},
  {label:"طريقة الطلب",value:"طلب مباشر وسريع عبر واتساب"},
  {label:"خدمة العملاء",value:"مساعدة سريعة لاختيار المنتج المناسب"}
];

const faqs = [
  {q:"أي منتج أبدأ به لو كانت بشرتي حساسة؟",a:"غالبًا صابون زيت الزيتون هو البداية الألطف للبشرة الجافة أو الحساسة."},
  {q:"ما الأنسب للبشرة الدهنية أو المختلطة؟",a:"صابون الفحم النشط مناسب أكثر لمن تبحث عن تنظيف أعمق وتقليل الإحساس بالدهون الزائدة."},
  {q:"كيف يتم الطلب؟",a:"اختاري المنتجات، أضيفيها إلى السلة، ثم اضغطي إرسال الطلب عبر واتساب ليصلنا ملخص الطلب مباشرة."},
  {q:"هل الشحن متاح داخل مصر؟",a:"نعم، الشحن متاح لمعظم المحافظات داخل مصر ويتم تأكيد التفاصيل معك حسب المنطقة."},
  {q:"هل يمكنني السؤال قبل الشراء؟",a:"بالتأكيد، يمكنك التواصل معنا مباشرة عبر واتساب لنرشح لك النوع المناسب."}
];

const state = { filter: 'all', cart: JSON.parse(localStorage.getItem('soap-cart') || '[]') };
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
const SUPABASE_ANON_KEY = 'PUT_YOUR_PUBLISHABLE_KEY_HERE';

let supabase = null;

if (
  window.supabase &&
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY !== 'PUT_YOUR_PUBLISHABLE_KEY_HERE'
) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function money(v){ return `${v.toFixed(2)} ج.م`; }

function saveCart(){
  localStorage.setItem('soap-cart', JSON.stringify(state.cart));
  updateCartUI();
}

function showToast(message){
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

function renderFilters(){
  const filters = [['all','الكل'],['dry','للبشرة الجافة'],['oily','للبشرة الدهنية'],['scrub','تقشير']];
  $('#filters').innerHTML = filters.map(([id,label]) => `
    <button class="filter-btn ${state.filter===id?'active':''}" data-filter="${id}">${label}</button>
  `).join('');
}

function renderProducts(){
  const list = state.filter === 'all'
    ? products
    : products.filter(p => p.category === state.filter || (state.filter === 'dry' && p.id === 3));

  $('#productGrid').innerHTML = list.map(p => `
    <article class="card product-card">
      <img
        class="product-image view-product"
        src="${p.image}"
        alt="${p.name}"
        loading="lazy"
        data-id="${p.id}"
        onerror="this.closest('article').classList.add('img-missing')"
      >
      <div class="card-body">
        <div class="badge-row">
          <span class="tag badge">${p.badge}</span>
          <span class="tag best">${p.tag}</span>
        </div>
        <h3 class="product-title">${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="quick-points">${p.highlights.map(h => `<span>${h}</span>`).join('')}</div>
        <div class="meta">
          <div>
            <small>أنسب استخدام</small>
            <strong>${p.bestFor}</strong>
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

function renderFeatures(){
  $('#featureGrid').innerHTML = features.map(f => `
    <article class="feature">
      <div class="icon">${f.icon}</div>
      <h3>${f.title}</h3>
      <p>${f.desc}</p>
    </article>
  `).join('');
}

function renderSteps(){
  $('#steps').innerHTML = steps.map((s,i) => `
    <article class="step-card">
      <div class="step-no">${i+1}</div>
      <div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>
    </article>
  `).join('');
}

function renderShipping(){
  $('#shippingItems').innerHTML = shippingInfo.map(i => `
    <div class="ship-item">
      <span>${i.label}</span>
      <strong>${i.value}</strong>
    </div>
  `).join('');
}

function renderFaq(){
  $('#faqList').innerHTML = faqs.map(f => `
    <div class="faq-item">
      <button class="faq-q">${f.q}<span>＋</span></button>
      <div class="faq-a">${f.a}</div>
    </div>
  `).join('');
}

function addToCart(id){
  const p = products.find(x => x.id === id);
  const found = state.cart.find(i => i.id === id);

  if(found){
    found.qty += 1;
  } else {
    state.cart.push({...p, qty:1});
  }

  saveCart();
  showToast(`تمت إضافة ${p.name} إلى السلة`);
}

function updateCartUI(){
  const totalCount = state.cart.reduce((a,b) => a + b.qty, 0);
  $('#cartCount').textContent = totalCount;

  const itemsBox = $('#cartItems');
  const footer = $('#cartFooter');

  if(!state.cart.length){
    itemsBox.innerHTML = '<div class="empty">السلة فارغة. أضيفي بعض المنتجات أولًا.</div>';
    footer.innerHTML = '';
    return;
  }

  itemsBox.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p>${item.weight}</p>
        <p>${money(item.price)}</p>
        <div class="qty-row">
          <button data-action="inc" data-id="${item.id}">+</button>
          <strong>${item.qty}</strong>
          <button data-action="dec" data-id="${item.id}">-</button>
        </div>
      </div>
      <button class="remove-btn" data-action="remove" data-id="${item.id}">🗑️</button>
    </div>
  `).join('');

  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = state.cart.reduce((s, i) => s + i.qty, 0);
  const shippingText = "يتم تأكيده حسب المنطقة";

  footer.innerHTML = `
    <div class="cart-summary">
      <div class="cart-summary-row">
        <span>عدد القطع</span>
        <strong>${totalItems}</strong>
      </div>
      <div class="cart-summary-row">
        <span>المجموع الفرعي</span>
        <strong class="price">${money(total)}</strong>
      </div>
      <div class="cart-summary-row">
        <span>الشحن</span>
        <strong>${shippingText}</strong>
      </div>
      <div class="cart-summary-row total-row">
        <span>الإجمالي</span>
        <strong class="price">${money(total)}</strong>
      </div>
      <p class="helper">سيتم تجهيز رسالة واتساب تلقائيًا تحتوي على تفاصيل الطلب، ثم نؤكد معك العنوان والشحن.</p>
      <button class="btn btn-whatsapp" id="checkoutBtn">إرسال الطلب عبر واتساب</button>
    </div>
  `;
}

async function saveOrderToSupabase() {
  if (!supabase) {
    console.error('Supabase is not initialized.');
    return false;
  }

  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);

  const payload = {
    customer_name: "طلب من الموقع",
    phone: "",
    city: "",
    notes: "",
    items_json: state.cart,
    total: total
  };

  const { error } = await supabase
    .from('orders')
    .insert([payload]);

  if (error) {
    console.error('Supabase insert error:', error);
    return false;
  }

  return true;
}

async function checkout(){
  if (!state.cart.length) {
    showToast('السلة فارغة');
    return;
  }

  const total = state.cart.reduce((s,i) => s + i.price * i.qty, 0);
  const lines = state.cart.map((i,n) => `${n+1}. ${i.name}\nالكمية: ${i.qty}\nالسعر: ${money(i.price*i.qty)}`).join('\n\n');

  const saved = await saveOrderToSupabase();

  if (!saved) {
    showToast('حصلت مشكلة أثناء حفظ الطلب');
  }

  const msg = `مرحبًا، أريد إتمام طلب المنتجات التالية:\n\n${lines}\n\nالمجموع: ${money(total)}\nالشحن: يتم تأكيده حسب المنطقة`;
  window.open(`https://wa.me/201095314011?text=${encodeURIComponent(msg)}`,'_blank');
}

function openProduct(id){
  const p = products.find(x => x.id === id);
  $('#productModalContent').innerHTML = `
    <div class="modal-layout">
      <img src="${p.image}" alt="${p.name}">
      <div class="modal-info">
        <span class="tag badge">${p.badge}</span>
        <h3 id="modalTitle">${p.name}</h3>
        <div class="price">${money(p.price)}</div>
        <p>${p.longDescription}</p>
        <div class="quick-points">${p.highlights.map(h => `<span>${h}</span>`).join('')}</div>
        <h4>الفوائد</h4>
        <ul class="modal-list">${p.benefits.map(b => `<li>${b}</li>`).join('')}</ul>
        <h4>المكونات</h4>
        <ul class="modal-list">${p.ingredients.map(b => `<li>${b}</li>`).join('')}</ul>
        <h4>طريقة الاستخدام</h4>
        <p>${p.usage}</p>
        <div class="hero-actions">
          <button class="btn btn-primary modal-add" data-id="${p.id}">أضف إلى السلة</button>
          <a class="btn btn-whatsapp" target="_blank" rel="noopener" href="https://wa.me/201095314011">اسأل على واتساب</a>
        </div>
      </div>
    </div>
  `;
  $('#productModalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProduct(){
  $('#productModalOverlay').classList.add('hidden');
  if(!$('#cartOverlay').classList.contains('hidden')) return;
  document.body.style.overflow = '';
}

function openCart(){
  $('#cartOverlay').classList.remove('hidden');
  $('#floatingWhatsApp').classList.add('hidden-mobile');
  document.body.style.overflow = 'hidden';
}

function closeCart(){
  $('#cartOverlay').classList.add('hidden');
  $('#floatingWhatsApp').classList.remove('hidden-mobile');
  document.body.style.overflow = '';
}

function guardMedia(){
  $$('video').forEach(video => {
    video.addEventListener('error', () => {
      const poster = video.getAttribute('poster');
      if (poster) {
        video.parentElement.innerHTML = `<img class="video-fallback" src="${poster}" alt="منتج طبيعي">`;
      }
    }, { once:true });
  });
}

document.addEventListener('click', e => {
  const filter = e.target.closest('.filter-btn');
  if(filter){
    state.filter = filter.dataset.filter;
    renderFilters();
    renderProducts();
  }

  const add = e.target.closest('.add-to-cart,.modal-add');
  if(add){
    addToCart(Number(add.dataset.id));
    if(add.classList.contains('modal-add')) closeProduct();
  }

  const view = e.target.closest('.view-product');
  if(view){
    openProduct(Number(view.dataset.id));
  }

  if(e.target.id === 'closeProductModal' || e.target.id === 'productModalOverlay'){
    closeProduct();
  }

  const cartToggle = e.target.closest('#cartToggle');
  if(cartToggle){
    openCart();
  }

  if(e.target.id === 'closeCart' || e.target.id === 'cartOverlay'){
    closeCart();
  }

  if(e.target.id === 'checkoutBtn'){
    checkout();
  }

  const qa = e.target.closest('.faq-q');
  if(qa){
    qa.parentElement.classList.toggle('open');
  }

  const action = e.target.dataset.action;
  if(action){
    const id = Number(e.target.dataset.id);
    const item = state.cart.find(i => i.id === id);
    if(!item) return;

    if(action === 'inc') item.qty += 1;
    if(action === 'dec'){
      if(item.qty > 1) item.qty -= 1;
      else state.cart = state.cart.filter(i => i.id !== id);
    }
    if(action === 'remove'){
      state.cart = state.cart.filter(i => i.id !== id);
    }

    saveCart();
  }
});

$('#floatingWhatsApp').addEventListener('click', () => window.open('https://wa.me/201095314011','_blank'));
$('#menuBtn').addEventListener('click', () => $('#mobileMenu').classList.toggle('open'));
$$('.mobile-menu a').forEach(a => a.addEventListener('click', () => $('#mobileMenu').classList.remove('open')));

renderFilters();
renderProducts();
renderFeatures();
renderSteps();
renderShipping();
renderFaq();
updateCartUI();
guardMedia();
