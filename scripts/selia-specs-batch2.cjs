/* ==========================================================================
   The remaining 26 Selia blocks — merchant field specifications.

   `selia-specs.cjs` owns the first 8 blocks and the field builders; this module
   receives those builders so both halves publish exactly the same field shapes.
   Labels, defaults and hints are taken from the editor's own settings panels
   (`chapters-shots/selia/fields.json` + `panel-text.txt`), not invented: the
   panel text is the authority for a repeater's real columns, which the scraped
   control list flattens into anonymous inputs.

   Two conventions are shared with the first 8 blocks:

   1. Every top-level control id is `<prefix>_<key>`, and the reading side uses
      `readValue(data, key, prefix)` so the prefixed id always wins. A short
      alias in the seed can never mask the merchant's edit.
   2. A collection keeps its short id (`slides`, `faqs`, …) and its columns are
      `<collection>.<key>`. `readRows(data, ITEMS, PREFIX)` resolves both the
      short and the prefixed form.

   Every field declared here is consumed by the matching component. That is not
   automatic: `verify-selia.cjs` fails the build on a dead control.
   ========================================================================== */

const DISPLAY = [
  ['كل المتصفحات', 'all'],
  ['سطح المكتب فقط', 'desktop'],
  ['الجوال فقط', 'mobile'],
];
const EFFECT = [
  ['تلاشي', 'fade'],
  ['انزلاق', 'slide'],
];
const LAYOUT = [
  ['شبكة', 'grid'],
  ['شريط متحرك', 'slider'],
];
const RATIO = [
  ['مربع ١:١', 'square'],
  ['٤:٣', '4-3'],
  ['١٦:٩', '16-9'],
  ['٩:١٦', '9-16'],
];
const FIT = [
  ['قصّ لملء الإطار', 'cover'],
  ['إظهار الصورة كاملة', 'contain'],
];
const TYPES = [
  ['أحدث المنتجات', 'latest'],
  ['الأكثر مبيعًا', 'best_selling'],
  ['العروض', 'offers'],
  ['الأعلى تقييمًا', 'top-rated'],
  ['منتجات مختارة', 'selected'],
];
const TAB_STYLE = [
  ['أقراص', 'pills'],
  ['خط سفلي', 'underline'],
  ['بطاقات', 'blocks'],
];
const COLS = [
  ['٢', '2'],
  ['٣', '3'],
  ['٤', '4'],
  ['٥', '5'],
  ['٦', '6'],
];

const D = {
  text: 'النص كما يظهر للزائر. اترك الحقل فارغًا لإخفاء هذا السطر.',
  area: 'نص أطول يظهر تحت العنوان. اتركه فارغًا لإخفائه.',
  color: 'لون من منتقي الألوان. يُستخدم كلون إضافي، ولا يلغي تباين النص مع الخلفية.',
  image: 'ارفع صورة من معرض المتجر. المقاس المذكور في لوحة سيليا هو الأنسب.',
  url: 'رابط كامل يبدأ بـ https. الروابط التي لا تبدأ بـ http أو / يتم تجاهلها.',
  toggle: 'شغّل أو أوقف هذا الخيار. التغيير يظهر فور الحفظ.',
  slider: 'قيمة رقمية بين الحدّين الموضحين.',
  select: 'اختر الشكل المناسب لبقية صفحتك.',
  link: 'اختر تصنيفًا أو منتجًا أو صفحة من متجرك، أو الصق رابطًا خارجيًا.',
  product: 'اختر منتجًا من كتالوج متجرك. الاسم والسعر والصورة تُقرأ منه مباشرة.',
  category: 'اختر تصنيفًا من شجرة تصنيفات متجرك. الاسم والرابط يُقرآن منه.',
};

module.exports = (H) => {
  const { title, description, collection } = H;

  /** A Salla `variable-list` picker, the field shape the editor writes. */
  const picker = (id, label, desc, source, sourcesLabel) => ({
    id,
    type: 'items',
    format: 'variable-list',
    searchable: true,
    source: 'custom',
    required: false,
    label,
    icon: source === 'products' ? 'sicon-shopping-bag' : 'sicon-list',
    description: desc,
    value: null,
    sources: [{ label: sourcesLabel, key: source, value: source }],
  });
  const linkPicker = (id, label, desc = D.link) => picker(id, label, desc, 'links', 'الروابط');
  const productPicker = (id, label, desc = D.product) => picker(id, label, desc, 'products', 'منتجات');
  const categoryPicker = (id, label, desc = D.category) => picker(id, label, desc, 'categories', 'تصنيفات');

  /** Field builders bound to a block prefix, so ids cannot drift from reads. */
  const f = (p) => ({
    t: (k, l, v = '', d = D.text) => H.text(`${p}_${k}`, l, d, v),
    a: (k, l, v = '', d = D.area) => H.area(`${p}_${k}`, l, d, v),
    c: (k, l, v = '#004956', d = D.color) => H.color(`${p}_${k}`, l, d, v),
    b: (k, l, v = false, d = D.toggle) => H.toggle(`${p}_${k}`, l, d, v),
    n: (k, l, v = 5, min = 1, max = 20, d = D.slider) => H.slider(`${p}_${k}`, l, d, v, min, max, 1),
    s: (k, l, opts, v, d = D.select) => H.select(`${p}_${k}`, l, d, opts, v),
    img: (k, l, v = '', d = D.image, req = false) => H.image(`${p}_${k}`, l, d, v, req),
    u: (k, l, v = '', d = D.url) => H.url(`${p}_${k}`, l, d, v),
    link: (k, l, d = D.link) => linkPicker(`${p}_${k}`, l, d),
    prod: (k, l, d = D.product) => productPicker(`${p}_${k}`, l, d),
    cat: (k, l, d = D.category) => categoryPicker(`${p}_${k}`, l, d),
    common: (topSpace = false) => [
      ...(topSpace ? [H.toggle(`${p}_top_space`, 'إضافة مسافة أعلى العنصر', 'مسافة إضافية تفصل القسم عمّا فوقه.', true)] : []),
      H.select(`${p}_display`, 'ظهور العنصر حسب المتصفح', 'اختر أين يظهر هذا العنصر حسب تجربة التصفُّح.', DISPLAY, 'all'),
      H.text(`${p}_custom_css`, 'كلاس CSS مخصص', 'حقل خاص بالمطورين ومصممي المتاجر.', ''),
    ],
  });

  /** Collection column builders bound to a collection id. */
  const col = (cid) => ({
    t: (k, l, v = '', d = D.text) => H.text(`${cid}.${k}`, l, d, v),
    a: (k, l, v = '', d = D.area) => H.area(`${cid}.${k}`, l, d, v),
    c: (k, l, v = '#004956', d = D.color) => H.color(`${cid}.${k}`, l, d, v),
    n: (k, l, v = 50, min = 1, max = 100, d = D.slider) => H.slider(`${cid}.${k}`, l, d, v, min, max, 1),
    s: (k, l, opts, v, d = D.select) => H.select(`${cid}.${k}`, l, d, opts, v),
    img: (k, l, v = '', d = D.image, req = false) => H.image(`${cid}.${k}`, l, d, v, req),
    u: (k, l, v = '', d = D.url) => H.url(`${cid}.${k}`, l, d, v),
    link: (k, l, d = D.link) => linkPicker(`${cid}.${k}`, l, d),
    prod: (k, l, d = D.product) => productPicker(`${cid}.${k}`, l, d),
    cat: (k, l, d = D.category) => categoryPicker(`${cid}.${k}`, l, d),
  });

  const make = (path, ar, en, icon, intro, fields) => {
    const key = path.replace(/^home\./, '');
    return {
      title: { en, ar },
      icon,
      fields: [title(key, ar), description(key, intro), ...fields],
    };
  };

  const specs = {};

  /* ── 00 Advanced Slider ───────────────────────────────────────────────── */
  {
    const p = 'slider';
    const q = f(p);
    const c = col('slides');
    specs['home.selia-advanced-slider'] = make(
      'home.selia-advanced-slider',
      'سلايدر متقدم',
      'Advanced Slider (Selia)',
      'sicon-image',
      'يفضّل استخدامه كأول عنصر في الصفحة الرئيسية للاستفادة من خاصية الهيدر الشفاف. كل شريحة تحمل صورة سطح المكتب وصورة جوال ونصوصها وزرّها.',
      [
        q.b('auto_height', 'تحديد ارتفاع العنصر تلقائياً', true, 'يجعل ارتفاع السلايدر يساوي ارتفاع الشاشة. أوقفه لاستخدام نسبة الصورة نفسها.'),
        q.n('duration', 'مدة التنقل بين الصور', 5, 1, 20, 'بالثواني. القيمة الافتراضية ٥ ثوانٍ.'),
        q.n('speed', 'سرعة تنفيذ الانيميشن بين الصور', 2, 1, 10, 'بالثواني. القيمة الافتراضية ثانيتان.'),
        q.s('effect', 'تأثير الانتقال بين الصور', EFFECT, 'fade'),
        q.b('top_space', 'إضافة مسافة أعلى العنصر'),
        q.b('arrows', 'تفعيل أسهم التنقل', true),
        q.b('dots', 'تفعيل ترقيم الصور (النقاط)', true),
        q.b('image_animation', 'تفعيل الانيميشن على صور السلايدر'),
        q.b('show_video', 'عرض فيديو'),
        collection(
          'slides',
          'عناصر السلايدر',
          'سلايد',
          'كل صف = شريحة كاملة. صورة سطح المكتب ١٩٢٠×١٠٨٠، وصورة الجوال ٨٠٠×١٢٠٠؛ إن تُركت صورة الجوال فارغة تُستخدم صورة سطح المكتب. ضع موضوع الصورة في الوسط حتى لا يُقص.',
          [
            c.img('desktop', 'صورة سطح المكتب'),
            c.img('mobile', 'صورة الجوال'),
            c.t('title', 'العنوان'),
            c.a('description', 'الوصف'),
            c.t('button_label', 'نص الزر', '', 'لإخفاء الزر اترك الحقل فارغًا.'),
            c.c('button_background', 'لون خلفية الزر', '#111111', 'خلفية زر الشريحة. اخترها متباينة مع لون نص الزر ليُقرأ الاسم.'),
            c.c('button_color', 'لون نص الزر', '#ffffff', 'لون كلمة زر الشريحة فوق خلفية الزر.'),
            c.link('button_link', 'رابط الزر'),
            c.u('video', 'رابط الفيديو'),
            c.s('direction', 'اتجاه عرض الصورة او الفيديو', [['يمين', 'rtl'], ['يسار', 'ltr']], 'rtl'),
            c.s('fit', 'طريقة عرض الصور أو الفيديو', FIT, 'cover'),
            c.s('text_position', 'موقع النصوص', [['يمين', 'right'], ['وسط', 'center'], ['يسار', 'left']], 'right', 'حدّد موقع النصوص على الصورة حسب محتواها لتجنّب إخفاء جزء مهم منها.'),
          ],
          [
            { 'slides.desktop': '', 'slides.mobile': '', 'slides.title': 'مجموعة الموسم الجديد', 'slides.description': 'قطع اختيرت لتُرى عن قرب', 'slides.button_label': 'تسوّق الآن', 'slides.button_background': '#111111', 'slides.button_color': '#ffffff', 'slides.button_link': [], 'slides.video': '', 'slides.direction': [{ label: 'يمين', value: 'rtl', key: 'rtl' }], 'slides.fit': [{ label: 'قصّ لملء الإطار', value: 'cover', key: 'cover' }], 'slides.text_position': [{ label: 'يمين', value: 'right', key: 'right' }] },
            { 'slides.desktop': '', 'slides.mobile': '', 'slides.title': 'تفاصيل تصنع الفرق', 'slides.description': 'خامات طبيعية وحرفية واضحة', 'slides.button_label': 'اكتشف المجموعة', 'slides.button_background': '#111111', 'slides.button_color': '#ffffff', 'slides.button_link': [], 'slides.video': '', 'slides.direction': [{ label: 'يمين', value: 'rtl', key: 'rtl' }], 'slides.fit': [{ label: 'قصّ لملء الإطار', value: 'cover', key: 'cover' }], 'slides.text_position': [{ label: 'يمين', value: 'right', key: 'right' }] },
          ],
          { max: 10 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 01 Featured Categories ───────────────────────────────────────────── */
  {
    const q = f('fcats');
    const c = col('fcats_tiles');
    specs['home.selia-featured-categories'] = make(
      'home.selia-featured-categories',
      'تصنيفات مميزة',
      'Featured Categories (Selia)',
      'sicon-list',
      'أربعة تصنيفات بأحجام مختلفة في شبكة واحدة. يجب إضافة بيانات التصنيفات الأربعة ليكتمل التصميم؛ اسم التصنيف يُقرأ من شجرة متجرك.',
      [
        q.t('heading', 'التصنيفات المميزة', 'التصنيفات المميزة'),
        collection(
          'fcats_tiles',
          'التصنيفات الأربعة',
          'تصنيف',
          'صورة التصنيف الأول ٦١٠×٤١٢، والثاني ٤٦٨×٣١٢، والثالث والرابع ٢٣٤×٢٣٥ بكسل.',
          [
            c.t('title', 'نص ترويجي للتصنيف', '', 'نص يجذب العميل لدخول التصنيف.'),
            c.t('subtitle', 'نص فرعي للتصنيف', '', 'مثال: وصل حديثًا أو تخفيضات.'),
            c.c('color', 'لون النصوص على التصنيف', '#ffffff', 'اللون المعروض فوق صورة التصنيف، ويُستخدم كذلك في إطار التركيز عند التنقّل بالكيبورد.'),
            c.t('link_label', 'نص رابط التصنيف', 'تسوّق الآن'),
            c.cat('category', 'اختر التصنيف'),
            c.s('text_position', 'موقع النص على صورة التصنيف', [['أعلى', 'top'], ['المنتصف', 'center'], ['أسفل', 'bottom']], 'bottom'),
            c.img('image', 'صورة التصنيف'),
          ],
          [
            { 'fcats_tiles.title': 'أساسيات لا تُستبدل', 'fcats_tiles.subtitle': 'وصل حديثًا', 'fcats_tiles.color': '#ffffff', 'fcats_tiles.link_label': 'تسوّق الآن', 'fcats_tiles.category': [], 'fcats_tiles.text_position': [{ label: 'أسفل', value: 'bottom', key: 'bottom' }], 'fcats_tiles.image': '' },
            { 'fcats_tiles.title': 'للمنزل', 'fcats_tiles.subtitle': 'تشكيلة مختارة', 'fcats_tiles.color': '#ffffff', 'fcats_tiles.link_label': 'تسوّق الآن', 'fcats_tiles.category': [], 'fcats_tiles.text_position': [{ label: 'أسفل', value: 'bottom', key: 'bottom' }], 'fcats_tiles.image': '' },
            { 'fcats_tiles.title': 'إضاءة', 'fcats_tiles.subtitle': '', 'fcats_tiles.color': '#ffffff', 'fcats_tiles.link_label': 'تسوّق الآن', 'fcats_tiles.category': [], 'fcats_tiles.text_position': [{ label: 'أسفل', value: 'bottom', key: 'bottom' }], 'fcats_tiles.image': '' },
            { 'fcats_tiles.title': 'ديكور', 'fcats_tiles.subtitle': '', 'fcats_tiles.color': '#ffffff', 'fcats_tiles.link_label': 'تسوّق الآن', 'fcats_tiles.category': [], 'fcats_tiles.text_position': [{ label: 'أسفل', value: 'bottom', key: 'bottom' }], 'fcats_tiles.image': '' },
          ],
          { min: 4, max: 4 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 02 Product Videos ────────────────────────────────────────────────── */
  {
    const q = f('pvideos');
    const c = col('pvideos_items');
    specs['home.selia-product-videos'] = make(
      'home.selia-product-videos',
      'فيديوهات المنتجات',
      'Product Videos (Selia)',
      'sicon-video',
      'اختر المنتج وأضف رابط الفيديو الخاص به؛ يظهر الفيديو بدل صورة المنتج في البطاقة. روابط يوتيوب وقوقل درايف غير مدعومة، ارفع الفيديو في مركز التحميل.',
      [
        q.t('title', 'عنوان العنصر', 'فيديوهات المنتجات', 'اتركه فارغًا لإخفاء العنوان.'),
        q.t('subtitle', 'العنوان الفرعي', '', 'نص فرعي يظهر أسفل العنوان.'),
        q.s('layout', 'طريقة العرض', LAYOUT, 'slider'),
        q.s('ratio', 'أبعاد الفيديو', RATIO, '9-16'),
        q.b('autoplay', 'تشغيل الفيديو تلقائياً', true, 'يُشغَّل صامتًا ودوريًا. يُوقف تلقائيًا لمن فعّل تقليل الحركة.'),
        q.b('show_product', 'عرض المنتج أسفل الفيديو', true),
        q.b('show_all', 'عرض رابط "عرض الكل"'),
        collection(
          'pvideos_items',
          'منتجات الفيديو',
          'منتج فيديو',
          'كل صف = منتج ورابط فيديو.',
          [
            c.prod('product', 'المنتج'),
            c.u('video', 'رابط الفيديو'),
          ],
          [
            { 'pvideos_items.product': [], 'pvideos_items.video': '' },
            { 'pvideos_items.product': [], 'pvideos_items.video': '' },
          ],
          { max: 12 }
        ),
        ...q.common(true),
      ]
    );
  }

  /* ── 03 Detailed Products ─────────────────────────────────────────────── */
  {
    const q = f('detail');
    const c = col('detail_items');
    specs['home.selia-detailed-products'] = make(
      'home.selia-detailed-products',
      'منتجات مفصلة',
      'Detailed Products (Selia)',
      'sicon-shopping-bag',
      'بطاقة منتج موسّعة: صورة رئيسية، شريط متحرك، عدد مرات البيع، وخيارات الشراء. بيانات المنتج تُقرأ من الكتالوج، والشريط فقط هو ما تكتبه يدويًا.',
      [
        q.t('title', 'عنوان العنصر', 'منتجات مفصلة'),
        q.t('subtitle', 'العنوان الفرعي'),
        q.b('use_video', 'عرض فيديو بدلا من صور المنتج'),
        q.b('hide_thumbs', 'إخفاء الصور المصغرة والاكتفاء بالصورة الرئيسية'),
        q.s('image_ratio', 'أبعاد الصورة الرئيسية', RATIO, 'square'),
        q.s('image_fit', 'طريقة عرض الصورة الرئيسية', FIT, 'cover'),
        q.c('frame_color', 'لون إطار البطاقة', '#eeeeee', 'خاص بالقالب الأصلي. بطاقات هذا البلوك تُبنى من منتجات متجرك، فلا يظهر أثره حاليًا.'),
        q.b('show_sold', 'عرض عدد مرات الشراء', true),
        q.b('custom_rating', 'تقييم مخصص (للمنتج بدون تقييمات بعد)'),
        q.c('background', 'لون خلفية البطاقة', '#111111', 'خلفية قسم المنتجات المفصّلة، خلف البطاقات.'),
        q.c('text_color', 'لون النصوص', '#ffffff', 'لون النصوص التي يكتبها البلوك فوق خلفيته.'),
        q.b('show_subtitle', 'عرض العنوان الفرعي للمنتج', true),
        q.b('show_description', 'عرض سطرين من وصف المنتج'),
        q.b('show_options', 'عرض خيارات المنتج'),
        q.b('buy_now', 'عرض زر اشترِ الآن (الدفع السريع)', true),
        collection(
          'detail_items',
          'المنتجات',
          'منتج',
          'عدد مرات البيع المكتوب هنا يظهر بدل الرقم الفعلي للمنتج — استخدمه فقط عندما يكون الرقم الحقيقي أقل مما تريد إظهاره.',
          [
            c.prod('product', 'المنتج'),
            c.t('sold_count', 'عدد مرات البيع (اختياري)'),
            c.t('ticker_text', 'نص الشريط المتحرك', 'توصيل مجاني — الشحن خلال يومين'),
            c.t('ticker_icon', 'أيقونة الفاصل في الشريط', 'sicon-star'),
            c.c('ticker_background', 'لون خلفية الشريط', '#004956', 'خاص بالقالب الأصلي. شريط هذا البلوك يُعرض كنص فقط، فلا يظهر أثره حاليًا.'),
            c.c('ticker_color', 'لون نص الشريط', '#ffffff', 'خاص بالقالب الأصلي. لون الشريط يأتي من لون نصوص البلوك، فلا يظهر أثره حاليًا.'),
          ],
          [
            { 'detail_items.product': [], 'detail_items.sold_count': '', 'detail_items.ticker_text': 'توصيل مجاني — الشحن خلال يومين', 'detail_items.ticker_icon': 'sicon-star', 'detail_items.ticker_background': '#004956', 'detail_items.ticker_color': '#ffffff' },
          ],
          { max: 8 }
        ),
        ...q.common(true),
      ]
    );
  }

  /* ── 05 Product Tabs ──────────────────────────────────────────────────── */
  {
    const q = f('ptabs');
    const c = col('ptabs_tabs');
    specs['home.selia-product-tabs'] = make(
      'home.selia-product-tabs',
      'تبويبات المنتجات',
      'Product Tabs (Selia)',
      'sicon-list',
      'اعرض منتجات من أكثر من مصدر مقسّمة في تبويبات، لعرض أكبر عدد ممكن في مساحة محدودة. التبويبات تعمل بلوحة المفاتيح وتُعلن لقارئ الشاشة.',
      [
        q.t('title', 'العنوان الرئيسي', 'تسوّق حسب ما يناسبك'),
        q.t('subtitle', 'العنوان الفرعي'),
        q.s('tab_style', 'شكل التبويبات', TAB_STYLE, 'pills'),
        q.s('layout', 'طريقة العرض', LAYOUT, 'grid'),
        q.b('show_all', 'عرض رابط "عرض الكل"'),
        collection(
          'ptabs_tabs',
          'التبويبات',
          'تبويب',
          'كل صف = تبويب بمصدر منتجاته وعدده. اسم التبويب هو ما يراه الزائر.',
          [
            c.t('label', 'اسم التبويب', 'الأحدث'),
            c.s('layout', 'طريقة العرض', LAYOUT, 'grid'),
            c.s('type', 'نوع المنتجات', TYPES, 'latest'),
            c.n('limit', 'عدد المنتجات', 8, 1, 24),
          ],
          [
            { 'ptabs_tabs.label': 'وصل حديثًا', 'ptabs_tabs.layout': [{ label: 'شبكة', value: 'grid', key: 'grid' }], 'ptabs_tabs.type': [{ label: 'أحدث المنتجات', value: 'latest', key: 'latest' }], 'ptabs_tabs.limit': 8 },
            { 'ptabs_tabs.label': 'الأكثر مبيعًا', 'ptabs_tabs.layout': [{ label: 'شبكة', value: 'grid', key: 'grid' }], 'ptabs_tabs.type': [{ label: 'الأكثر مبيعًا', value: 'best_selling', key: 'best_selling' }], 'ptabs_tabs.limit': 8 },
            { 'ptabs_tabs.label': 'عروض', 'ptabs_tabs.layout': [{ label: 'شبكة', value: 'grid', key: 'grid' }], 'ptabs_tabs.type': [{ label: 'العروض', value: 'offers', key: 'offers' }], 'ptabs_tabs.limit': 8 },
          ],
          { max: 8 }
        ),
        ...q.common(true),
      ]
    );
  }

  /* ── 06 About Store ───────────────────────────────────────────────────── */
  {
    const q = f('about');
    specs['home.selia-about-store'] = make(
      'home.selia-about-store',
      'عن المتجر',
      'About Store (Selia)',
      'sicon-page',
      'محتوى كتابي عن متجرك مع فيديو أو صورة. اللون الافتراضي هو لون خلفية المتجر الثانوي، ويمكنك جعله شفافًا.',
      [
        q.t('subtitle', 'العنوان الفرعي', 'قصة متجر سيليا'),
        q.t('title', 'العنوان', 'من نحن؟'),
        q.a('description', 'الوصف', 'متجر سيليا هو مكان يفتح أمامك أبواب عالم الموضة والأناقة بنقرة واحدة. نختار كل قطعة بعناية لتصل إليك كما تخيّلتها.'),
        q.c('background', 'لون الخلفية', '#eeeeee', 'خلفية قسم «عن المتجر» بالكامل.'),
        q.b('transparent', 'خلفية شفافة'),
        q.b('show_video', 'عرض فيديو', true),
        q.u('video', 'رابط الفيديو', '', 'روابط يوتيوب وقوقل درايف غير مدعومة. ارفعه في مركز التحميل وخذ الرابط الجاهز.'),
        q.t('button_label', 'نص الزر', 'عرض التفاصيل'),
        q.link('button_link', 'الرابط'),
        ...q.common(),
      ]
    );
  }

  /* ── 07 Square Links ──────────────────────────────────────────────────── */
  {
    const q = f('square');
    const c = col('square_links');
    specs['home.selia-square-links'] = make(
      'home.selia-square-links',
      'روابط مربعة',
      'Square Links (Selia)',
      'sicon-image',
      'اعرض أقسام متجرك في بطاقات مربعة. يمكن تحويلها إلى شريط متحرك، وتحويل الصور إلى الأبيض والأسود حتى يمرّ المؤشر عليها.',
      [
        q.t('title', 'العنوان', 'تسوّق حسب القسم'),
        q.t('subtitle', 'الوصف'),
        q.b('as_slider', 'عرض الروابط كعناصر متحركة (سلايدر)'),
        q.b('merge_previous', 'دمج مع العنصر السابق'),
        q.b('compact', 'تصغير الصور'),
        q.b('portrait', 'عرض طولي للصور (مستطيلات)'),
        q.b('rounded', 'حواف دائرية للصور', true),
        q.b('grayscale', 'تفعيل خاصية الصور السوداء والرجوع لالوانها الأصلية في حالة التمرير'),
        q.b('autoplay', 'تحريك تلقائي للروابط في حالة الروابط المتحركة'),
        q.b('arrows', 'أظهار الأسهم في حالة الروابط المتحركة', true),
        q.b('center', 'توسيط الروابط في شاشة الكمبيوتر في حالة الروابط المتحركة'),
        q.b('full_width', 'جعل العنصر بعرض الشاشة'),
        collection(
          'square_links',
          'الروابط',
          'رابط',
          'كل صف = صورة وعنوان ورابط. صورة صغيرة مربعة تكفي، فالحجم الكبير يبطّل الصفحة بلا فائدة.',
          [
            c.img('image', 'صورة الرابط'),
            c.t('title', 'عنوان الرابط', 'قسم جديد'),
            c.t('subtitle', 'عنوان فرعي للرابط'),
            c.link('link', 'الرابط'),
          ],
          [
            { 'square_links.image': '', 'square_links.title': 'العطور', 'square_links.subtitle': 'لمسة من الأناقة', 'square_links.link': [] },
            { 'square_links.image': '', 'square_links.title': 'أطفال', 'square_links.subtitle': 'اعتني بصغيرك', 'square_links.link': [] },
            { 'square_links.image': '', 'square_links.title': 'رجالي', 'square_links.subtitle': '', 'square_links.link': [] },
            { 'square_links.image': '', 'square_links.title': 'نسائي', 'square_links.subtitle': '', 'square_links.link': [] },
          ],
          { max: 16 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 08 Image Grid ────────────────────────────────────────────────────── */
  {
    const q = f('grid');
    const c = col('grid_tiles');
    specs['home.selia-image-grid'] = make(
      'home.selia-image-grid',
      'شبكة صور',
      'Image Grid (Selia)',
      'sicon-image',
      'شبكة من خمس صور بأحجام مختلفة — ليست بنرات مصمّمة. يجب رفع الصور الخمس ليكتمل التصميم؛ المقاسات تُقص حسب حجم الشاشة.',
      [
        q.b('top_space', 'إضافة مسافة أعلى العنصر', true),
        q.b('rounded', 'حواف دائرية للصور', true),
        q.b('full_width', 'جعل العنصر بعرض الصفحة'),
        q.b('show_titles', 'عرض العناوين أسفل الصور', true),
        q.c('title_color', 'لون العناوين على الصور', '#ffffff', 'خاص بالقالب الأصلي. العناوين تُعرض فوق تدرّج داكن بلون ثابت، فلا يظهر أثره حاليًا.'),
        q.b('remove_overlay', 'إزالة الطبقة الشفافة من الصور'),
        collection(
          'grid_tiles',
          'الصور الخمس',
          'صورة',
          'الترتيب ثابت: مربع، مستطيل عريض، مربع، مربع، مستطيل طولي.',
          [
            c.t('title', 'عنوان الصورة', 'العطور'),
            c.img('image', 'الصورة'),
            c.link('link', 'رابط الصورة'),
          ],
          [
            { 'grid_tiles.title': 'العطور', 'grid_tiles.image': '', 'grid_tiles.link': [] },
            { 'grid_tiles.title': 'أطفال', 'grid_tiles.image': '', 'grid_tiles.link': [] },
            { 'grid_tiles.title': 'رجالي', 'grid_tiles.image': '', 'grid_tiles.link': [] },
            { 'grid_tiles.title': 'نسائي', 'grid_tiles.image': '', 'grid_tiles.link': [] },
            { 'grid_tiles.title': 'مكياج', 'grid_tiles.image': '', 'grid_tiles.link': [] },
          ],
          { min: 5, max: 5 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 09 Custom Links ──────────────────────────────────────────────────── */
  {
    const q = f('clinks');
    const c = col('clinks');
    specs['home.selia-custom-links'] = make(
      'home.selia-custom-links',
      'روابط مخصصة',
      'Custom Links (Selia)',
      'sicon-image',
      'روابط بصور مستطيلة عريضة (١١٥٠×٤٠٩ بكسل)، مع تحكم بعدد الصور في صف الكمبيوتر وصف الجوال.',
      [
        q.t('title', 'العنوان', 'اكتشف أقسامنا'),
        q.t('subtitle', 'الوصف'),
        q.b('full_width', 'جعل العنصر بعرض الشاشة'),
        q.b('as_slider', 'عرض الروابط كعناصر متحركة (سلايدر)'),
        q.s('desktop_cols', 'عدد الصور في الصف الواحد في شاشة الكمبيوتر', COLS, '3'),
        q.s('mobile_cols', 'عدد الصور في الصف الواحد في شاشة الجوال', [['١', '1'], ['٢', '2']], '1'),
        q.b('no_crop', 'عرض كامل الصور بدون قص'),
        q.b('original_size', 'عرض الصور بمقاساتها الأصلية'),
        q.b('rounded', 'حواف دائرية للصور', true),
        collection(
          'clinks',
          'الروابط',
          'رابط',
          'المقاس المقترح ١١٥٠×٤٠٩ بكسل أو أي مقاس مستطيل.',
          [
            c.img('image', 'صورة الرابط'),
            c.t('title', 'عنوان الرابط', 'قسم'),
            c.t('subtitle', 'عنوان فرعي للرابط'),
            c.link('link', 'الرابط'),
          ],
          [
            { 'clinks.image': '', 'clinks.title': 'وصل حديثًا', 'clinks.subtitle': '', 'clinks.link': [] },
            { 'clinks.image': '', 'clinks.title': 'الأكثر طلبًا', 'clinks.subtitle': '', 'clinks.link': [] },
            { 'clinks.image': '', 'clinks.title': 'عروض الموسم', 'clinks.subtitle': '', 'clinks.link': [] },
          ],
          { max: 16 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 10 Circle Links ──────────────────────────────────────────────────── */
  {
    const q = f('circles');
    const c = col('circle_links');
    specs['home.selia-circle-links'] = make(
      'home.selia-circle-links',
      'روابط دائرية',
      'Circle Links (Selia)',
      'sicon-image',
      'دوائر لأقسام متجرك مع عنوان فرعي لكل دائرة. حتى ١٢ رابطًا، ويمكن عرضها في شريط متحرك.',
      [
        q.t('title', 'العنوان', 'جميع الأقسام'),
        q.t('subtitle', 'الوصف', 'لتناسب جميع الأذواق'),
        q.b('as_slider', 'عرض الروابط كعناصر متحركة (سلايدر)'),
        q.b('autoplay', 'تحريك تلقائي للروابط في حالة الروابط المتحركة'),
        q.b('arrows', 'أظهار الأسهم في حالة الروابط المتحركة', true),
        q.b('enlarge', 'تكبير الدوائر'),
        q.b('tight_gap', 'تقليل المسافات بين الروابط في حالة الروابط المتحركة'),
        q.b('center', 'توسيط الروابط في شاشة الكمبيوتر في حالة الروابط المتحركة'),
        collection(
          'circle_links',
          'الروابط',
          'رابط',
          'كل صف = دائرة بصورة صغيرة وعنوان وعنوان فرعي ورابط.',
          [
            c.img('image', 'صورة الرابط'),
            c.t('title', 'عنوان الرابط', 'أطفال'),
            c.t('subtitle', 'عنوان فرعي للرابط', 'اعتني بصغيرك'),
            c.link('link', 'الرابط'),
          ],
          [
            { 'circle_links.image': '', 'circle_links.title': 'أطفال', 'circle_links.subtitle': 'اعتني بصغيرك', 'circle_links.link': [] },
            { 'circle_links.image': '', 'circle_links.title': 'عطور', 'circle_links.subtitle': 'لمسة من الأناقة', 'circle_links.link': [] },
            { 'circle_links.image': '', 'circle_links.title': 'العناية بالشعر', 'circle_links.subtitle': 'تألق بشعر لامع', 'circle_links.link': [] },
            { 'circle_links.image': '', 'circle_links.title': 'الأظافر', 'circle_links.subtitle': 'اعتني بنفسك', 'circle_links.link': [] },
            { 'circle_links.image': '', 'circle_links.title': 'عناية بالبشرة', 'circle_links.subtitle': 'استمتع ببشرة نضرة', 'circle_links.link': [] },
            { 'circle_links.image': '', 'circle_links.title': 'عود', 'circle_links.subtitle': 'استمتع بسحر العود', 'circle_links.link': [] },
            { 'circle_links.image': '', 'circle_links.title': 'بطاقات رقمية', 'circle_links.subtitle': 'اختيارك الأمثل', 'circle_links.link': [] },
            { 'circle_links.image': '', 'circle_links.title': 'حقائب', 'circle_links.subtitle': 'تصاميم مبتكرة', 'circle_links.link': [] },
            { 'circle_links.image': '', 'circle_links.title': 'أحذية', 'circle_links.subtitle': '', 'circle_links.link': [] },
          ],
          { max: 12 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 11 Double Banner ─────────────────────────────────────────────────── */
  {
    const q = f('dbanner');
    const c = col('dbanners');
    specs['home.selia-double-banner'] = make(
      'home.selia-double-banner',
      'بانر مزدوج',
      'Double Banner (Selia)',
      'sicon-image',
      'بانران طوليان (٣٠٠×٧٠٠ بكسل)، لكل منهما صورة عربية وصورة إنجليزية. الصورة المناسبة تُختار حسب لغة المتجر الحالية.',
      [
        q.b('equal_height', 'توحيد ارتفاع البنرات'),
        q.b('rounded', 'حواف دائرية', true),
        q.b('stack_mobile', 'عرض البنرات بشكل عمودي في الجوال', true),
        collection(
          'dbanners',
          'البنران',
          'بانر',
          'صورة عربية وصورة إنجليزية لكل بانر؛ إن غابت الإنجليزية تُستخدم العربية.',
          [
            c.img('image_ar', 'صورة البانر (اللغة العربية)'),
            c.img('image_en', 'صورة البانر (English)'),
            c.link('link', 'رابط البانر'),
          ],
          [
            { 'dbanners.image_ar': '', 'dbanners.image_en': '', 'dbanners.link': [] },
            { 'dbanners.image_ar': '', 'dbanners.image_en': '', 'dbanners.link': [] },
          ],
          { min: 2, max: 2 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 12 Animated Banners ──────────────────────────────────────────────── */
  {
    const q = f('abanners');
    const c = col('abanner_slides');
    specs['home.selia-animated-banners'] = make(
      'home.selia-animated-banners',
      'بانرات متحركة',
      'Animated Banners (Selia)',
      'sicon-image',
      'سلايدر بنرات بنفس المقاس (٣٠٠×١٣٠٠ بكسل) للحصول على أفضل نتيجة. لكل بانر صورة سطح مكتب وصورة جوال وصور للغة الإنجليزية.',
      [
        q.b('top_space', 'إضافة مسافة أعلى العنصر', true),
        q.b('full_width', 'جعل البنرات بعرض الشاشة'),
        q.b('rounded', 'حواف دائرية', true),
        q.b('arrows', 'تفعيل أسهم التنقل', true),
        q.b('autoplay', 'تحريك تلقائي', true),
        q.s('effect', 'تأثير الانتقال بين البنرات', EFFECT, 'slide'),
        q.b('equal_height', 'توحيد ارتفاع البنرات'),
        q.b('different_en', 'صور مختلفة للغة الإنجليزية'),
        collection(
          'abanner_slides',
          'قائمة البنرات',
          'بانر',
          'إن لم ترفع صورة الجوال تُستخدم صورة سطح المكتب؛ وصور الإنجليزية تُستخدم فقط عند تفعيل الخيار أعلاه.',
          [
            c.img('desktop', 'صورة البنر في سطح المكتب'),
            c.img('mobile', 'صورة البنر في الجوال'),
            c.img('desktop_en', 'صورة سطح المكتب (English)'),
            c.img('mobile_en', 'صورة الجوال (English)'),
            c.link('link', 'الرابط'),
          ],
          [
            { 'abanner_slides.desktop': '', 'abanner_slides.mobile': '', 'abanner_slides.desktop_en': '', 'abanner_slides.mobile_en': '', 'abanner_slides.link': [] },
            { 'abanner_slides.desktop': '', 'abanner_slides.mobile': '', 'abanner_slides.desktop_en': '', 'abanner_slides.mobile_en': '', 'abanner_slides.link': [] },
          ],
          { max: 10 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 13 Video Gallery ─────────────────────────────────────────────────── */
  {
    const q = f('vgallery');
    const c = col('vgallery_videos');
    specs['home.selia-video-gallery'] = make(
      'home.selia-video-gallery',
      'معرض الفيديو',
      'Video Gallery (Selia)',
      'sicon-video',
      'معرض فيديوهات بنسبة ٩:١٦ أو ١٦:٩. صورة الغلاف مطلوبة عند تعطيل التشغيل التلقائي (٥٢٩×٩٤٢ أو ١٢٨٠×٧٢٠ بكسل).',
      [
        q.t('title', 'العنوان الرئيسي', 'شاهد القصص'),
        q.t('subtitle', 'العنوان الفرعي'),
        q.s('layout', 'نوع العرض', [['شبكة', 'grid'], ['شريط', 'slider']], 'grid'),
        q.s('ratio', 'نسبة العرض للفيديو', [['عمودي ٩:١٦', '9-16'], ['أفقي ١٦:٩', '16-9']], '9-16'),
        q.b('external', 'عرض فيديوهات من منصات اخرى'),
        q.b('top_space', 'إضافة مسافة اعلى العنصر'),
        q.b('full_width', 'جعل العنصر بعرض الشاشة'),
        q.b('equal_height', 'توحيد ارتفاع المقاطع'),
        q.b('autoplay', 'تشغيل تلقائي للمقاطع'),
        q.b('auto_scroll', 'تحريك تلقائي في حالة السلايدر'),
        q.b('rounded', 'جعل الحواف دائرية', true),
        q.b('hide_controls', 'إخفاء جميع أزرار التحكم'),
        collection(
          'vgallery_videos',
          'مجموعة الفيديوهات',
          'فيديو',
          'روابط يوتيوب وقوقل درايف غير مدعومة؛ ارفع الفيديو في مركز التحميل.',
          [
            c.img('poster', 'الصورة المصغرة'),
            c.u('video', 'رابط الفيديو'),
            c.t('title', 'عنوان الفيديو', 'قصة منتج'),
            c.a('description', 'وصف الفيديو'),
          ],
          [
            { 'vgallery_videos.poster': '', 'vgallery_videos.video': '', 'vgallery_videos.title': 'كيف صُنعت', 'vgallery_videos.description': 'نظرة أقرب على التفاصيل' },
            { 'vgallery_videos.poster': '', 'vgallery_videos.video': '', 'vgallery_videos.title': 'في الاستوديو', 'vgallery_videos.description': '' },
          ],
          { max: 12 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 14 Before & After ────────────────────────────────────────────────── */
  {
    const q = f('ba');
    specs['home.selia-before-after'] = make(
      'home.selia-before-after',
      'قبل وبعد',
      'Before & After (Selia)',
      'sicon-image',
      'قارن صورتين بفاصل يُسحب: قبل وبعد استخدام المنتج، أو تصميمين ولونين مختلفين. المقاس المناسب ٨٠٠×٤٠٠ بكسل لكل صورة.',
      [
        q.t('title', 'العنوان', 'الفرق واضح'),
        q.t('subtitle', 'العنوان الفرعي'),
        q.b('top_space', 'إضافة مسافة أعلى العنصر', true),
        q.b('full_width', 'جعل العنصر بعرض الصفحة'),
        q.b('rounded', 'حواف دائرية', true),
        q.b('vertical', 'مقارنة طولية'),
        q.c('divider_color', 'لون الفاصل', '#ffffff', 'لون الخط الفاصل بين الصورتين.'),
        q.img('before', 'الصورة الأولى (قبل)'),
        q.img('after', 'الصورة الثانية (بعد)'),
        q.t('before_label', 'عنوان الصورة الأولى (قبل)', 'قبل'),
        q.t('after_label', 'عنوان الصورة الثانية (بعد)', 'بعد'),
        ...q.common(),
      ]
    );
  }

  /* ── 15 Dynamic Banner ────────────────────────────────────────────────── */
  {
    const q = f('dynbnr');
    specs['home.selia-dynamic-banner'] = make(
      'home.selia-dynamic-banner',
      'بانر ديناميكي',
      'Dynamic Banner (Selia)',
      'sicon-image',
      'بانر مختلف حسب لغة المتجر، وصورة منفصلة للجوال والكمبيوتر، وبنرات مخصصة للوضع الداكن. سطح المكتب ٩٧٠×٢٥٠ والجوال ٥٠٠×٣٠٠ بكسل.',
      [
        q.b('top_space', 'إضافة مسافة أعلى العنصر', true),
        q.b('full_width', 'جعل العنصر بعرض الصفحة'),
        q.b('rounded', 'حواف دائرية'),
        q.b('dark_banners', 'اضافة بنرات مخصصة للوضع الداكن'),
        q.img('ar_desktop', 'بانر اللغة العربية — سطح المكتب'),
        q.img('ar_mobile', 'بانر اللغة العربية — الجوال'),
        q.img('en_desktop', 'بانر اللغة الانقليزية — سطح المكتب'),
        q.img('en_mobile', 'بانر اللغة الانقليزية — الجوال'),
        q.img('dark_desktop', 'بانر الوضع الداكن — سطح المكتب'),
        q.img('dark_mobile', 'بانر الوضع الداكن — الجوال'),
        q.link('link', 'الرابط'),
        ...q.common(),
      ]
    );
  }

  /* ── 16 Triple Banner ─────────────────────────────────────────────────── */
  {
    const q = f('tbanner');
    const c = col('tbanners');
    specs['home.selia-triple-banner'] = make(
      'home.selia-triple-banner',
      'بانر ثلاثي',
      'Triple Banner (Selia)',
      'sicon-image',
      'ثلاثة بنرات طولية (٣٠٠×٧٠٠ بكسل) لكل منها صورة عربية وصورة إنجليزية ورابط.',
      [
        q.b('equal_height', 'توحيد ارتفاع البنرات'),
        q.b('rounded', 'حواف دائرية', true),
        q.b('stack_mobile', 'عرض البنرات بشكل عمودي في الجوال', true),
        collection(
          'tbanners',
          'البنرات الثلاثة',
          'بانر',
          'إن غابت صورة اللغة الإنجليزية تُستخدم الصورة العربية.',
          [
            c.img('image', 'صورة البانر'),
            c.img('image_en', 'صورة البانر للغة الانقليزية'),
            c.link('link', 'الرابط'),
          ],
          [
            { 'tbanners.image': '', 'tbanners.image_en': '', 'tbanners.link': [] },
            { 'tbanners.image': '', 'tbanners.image_en': '', 'tbanners.link': [] },
            { 'tbanners.image': '', 'tbanners.image_en': '', 'tbanners.link': [] },
          ],
          { min: 3, max: 3 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 17 Featured Animated Products ────────────────────────────────────── */
  {
    const q = f('fap');
    specs['home.selia-featured-animated-products'] = make(
      'home.selia-featured-animated-products',
      'منتجات متحركة مميزة',
      'Featured Animated Products (Selia)',
      'sicon-shopping-bag',
      'مساحة محتوى ثابتة بجانب شريط منتجات متحرك. صورة خلفية المحتوى ٦٠٠×٨٠٠ بكسل، ويُفضّل لون نصوص معاكس للخلفية.',
      [
        q.t('title', 'العنوان الرئيسي', 'اكتشف المزيد'),
        q.t('subtitle', 'نص إضافي'),
        q.t('extra', 'عنوان المساحة الثابتة', 'تشكيلة هذا الموسم'),
        q.b('top_space', 'إضافة مسافة أعلى العنصر', true),
        q.b('content_left', 'عرض المحتوى على يسار المنتجات'),
        q.b('mobile_natural', 'عرض المحتوى بارتفاعه الأصلي في الجوال'),
        q.c('background_color', 'لون خلفية المحتوى', '#0D0C0C', 'خلفية لوحة المحتوى التي تحمل العنوان والزر.'),
        q.b('show_video', 'عرض فيديو'),
        q.img('background_image', 'صورة خلفية المحتوى'),
        q.b('overlay', 'عرض طبقة شفافة فوق صورة الخلفية', true),
        q.c('text_color', 'لون النصوص', '#ffffff', 'لون العنوان والوصف داخل اللوحة.'),
        q.t('button_label', 'نص الزر', 'تسوّق المجموعة'),
        q.c('button_color', 'لون نص الزر', '#ffffff', 'لون كلمة الزر فوق خلفيته.'),
        q.c('button_background', 'لون خلفية الزر', '#111111', 'خلفية زر «تسوّق المجموعة» الذي يفتح المجموعة.'),
        q.b('button_ghost', 'جعل الزر مفرغ (بدون لون خلفية)'),
        q.link('button_link', 'رابط الزر'),
        q.b('use_source', 'تحديد مصدر للمنتجات'),
        q.prod('products', 'منتجات'),
        ...q.common(),
      ]
    );
  }

  /* ── 18 Offers Counter ────────────────────────────────────────────────── */
  {
    const q = f('offers');
    specs['home.selia-offers-counter'] = make(
      'home.selia-offers-counter',
      'عداد العروض',
      'Offers Counter (Selia)',
      'sicon-clock',
      'عدّاد تنازلي لنهاية عرضك مع عنوان ووصف وزر دعوة لاتخاذ إجراء. العدّاد يبدأ بعد وصول الصفحة للمتصفح، فلا يختلف بين السيرفر والعميل.',
      [
        q.t('title', 'العنوان', 'عرض لفترة محدودة'),
        q.t('subtitle', 'العنوان الفرعي'),
        q.a('description', 'الوصف', 'خصم خاص على منتجات مختارة حتى نهاية العرض.'),
        q.t('end_at', 'تاريخ انتهاء العد التنازلي', '2027-01-01T15:00', 'حدّد التاريخ والوقت لانتهاء العرض بصيغة YYYY-MM-DDTHH:mm.'),
        q.t('button_label', 'نص الزر', 'تسوّق العرض'),
        q.link('link', 'الرابط'),
        q.c('background', 'لون خلفية المحتوى', '#111827', 'خلفية لوحة العرض، خلف الأرقام والعدّاد.'),
        q.c('text_color', 'لون المحتوى', '#ffffff', 'لون النصوص داخل اللوحة.'),
        q.b('media_background', 'إضافة صورة أو فيديو كخلفية'),
        q.b('full_width', 'جعل العنصر بعرض الصفحة', true),
        ...q.common(true),
      ]
    );
  }

  /* ── 19 FAQ ───────────────────────────────────────────────────────────── */
  {
    const q = f('faq');
    const c = col('faqs');
    specs['home.selia-faq'] = make(
      'home.selia-faq',
      'الأسئلة الشائعة',
      'FAQ (Selia)',
      'sicon-question',
      'أسئلة وأجوبة قابلة للفتح والإغلاق. مبنية على عنصر details الأصلي، فتعمل بلا جافاسكربت ومع لوحة المفاتيح وقارئ الشاشة.',
      [
        q.t('title', 'العنوان', 'لديك سؤال؟ اجابته هنا'),
        q.t('subtitle', 'العنوان الفرعي', 'كل ما تريد معرفته عن الأزياء والموضة'),
        q.b('enable_background', 'تفعيل خلفية العنصر', true),
        collection(
          'faqs',
          'الأسئلة',
          'سؤال',
          'كل صف = سؤال وإجابة، مع زر اختياري أسفل الإجابة.',
          [
            c.t('question', 'السؤال'),
            c.a('answer', 'الإجابة'),
            c.t('button_label', 'نص الزر (اختياري)'),
            c.link('button_link', 'رابط الزر (اختياري)'),
          ],
          [
            { 'faqs.question': 'ما هي المواد الرئيسية المستخدمة في صناعة الملابس؟', 'faqs.answer': 'المواد الشائعة تشمل القطن والصوف والحرير والنايلون، ولكل منها طريقة عناية مختلفة.', 'faqs.button_label': '', 'faqs.button_link': [] },
            { 'faqs.question': 'ما هي اتجاهات الموضة؟', 'faqs.answer': 'الأساليب والتصاميم الشائعة في فترة زمنية معينة، وتتغيّر مع كل موسم.', 'faqs.button_label': '', 'faqs.button_link': [] },
            { 'faqs.question': 'كيف أتابع أحدث الصيحات؟', 'faqs.answer': 'تابع مدونة المتجر وحساباتنا، فننشر فيها كل تشكيلة جديدة أولًا بأول.', 'faqs.button_label': '', 'faqs.button_link': [] },
            { 'faqs.question': 'هل يمكن إرجاع المنتج؟', 'faqs.answer': 'نعم، خلال المدة الموضحة في سياسة الاسترجاع وبشرط أن يكون المنتج بحالته الأصلية.', 'faqs.button_label': '', 'faqs.button_link': [] },
          ],
          { max: 12 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 20 Enhanced Store Features ───────────────────────────────────────── */
  {
    const q = f('features');
    const c = col('features');
    specs['home.selia-store-features'] = make(
      'home.selia-store-features',
      'مميزات المتجر المحسنة',
      'Enhanced Store Features (Selia)',
      'sicon-check-circle',
      'حتى أربع مميزات لمتجرك مع صور أيقونات متحركة. إن لم ترفع صورة تظهر أيقونة بديلة من مكتبة المتجر.',
      [
        q.b('compact_mobile', 'تصغير المميزات في الجوال', true),
        collection(
          'features',
          'المميزات',
          'ميزة',
          'كل صف = عنوان وصورة أيقونة وسطر توضيحي.',
          [
            c.t('title', 'العنوان'),
            c.img('image', 'صورة'),
            c.t('subtitle', 'العنوان الفرعي'),
          ],
          [
            { 'features.title': 'توصيل سريع ومجاني', 'features.image': '', 'features.subtitle': 'نقدم خدمة توصيل سريعة ومجانية لجميع عملائنا.' },
            { 'features.title': 'ضمان استعادة الأموال', 'features.image': '', 'features.subtitle': 'نحن ملتزمون بأعلى مستويات الجودة والرضا.' },
            { 'features.title': 'برامج الولاء', 'features.image': '', 'features.subtitle': 'خصومات حصرية لعملائنا الدائمين.' },
            { 'features.title': 'دعم فني على مدار الساعة', 'features.image': '', 'features.subtitle': 'فريقنا جاهز لمساعدتك في أي وقت.' },
          ],
          { min: 1, max: 4 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 21 Dynamic Product Gallery ───────────────────────────────────────── */
  {
    const q = f('dpg');
    const c = col('dpg_items');
    specs['home.selia-dynamic-product-gallery'] = make(
      'home.selia-dynamic-product-gallery',
      'معرض المنتجات الديناميكي',
      'Dynamic Product Gallery (Selia)',
      'sicon-image',
      'صورة خلفية (٧٨٦×٥٤٤ بكسل) عليها زر (+) في المكان الذي تحدّده، ينبثق منه المنتج. موضع المنتج ثابت على شاشات الجوال.',
      [
        q.t('title', 'العنوان', 'تخيّلها في مكانك'),
        q.t('subtitle', 'العنوان الفرعي'),
        q.b('full_width', 'جعل العنصر بعرض الصفحة'),
        q.b('animate_mobile', 'جعل الصور متحركة في الجوال'),
        q.b('show_plus', 'عرض علامة ال(+) على الصورة', true),
        q.s('open_direction', 'اتجاه فتح المنتج بالنسبة للزر (+)', [['تلقائي', 'auto'], ['يمين', 'right'], ['يسار', 'left']], 'auto'),
        collection(
          'dpg_items',
          'عناصر المعرض',
          'عنصر',
          'الموضعان من ١ إلى ١٠٠: ١ = أعلى الصورة / أقصى يسارها، ١٠٠ = أسفلها / أقصى يمينها.',
          [
            c.img('image', 'صورة المنتج'),
            c.t('caption', 'نص ترويجي على الصورة (طولي)'),
            c.prod('product', 'المنتج'),
            c.n('top', 'موقع المنتج على الصورة من الاعلى', 50),
            c.n('left', 'موقع المنتج على الصورة من اليسار', 50),
          ],
          [
            { 'dpg_items.image': '', 'dpg_items.caption': 'قطعة تكلّم المكان', 'dpg_items.product': [], 'dpg_items.top': 45, 'dpg_items.left': 55 },
            { 'dpg_items.image': '', 'dpg_items.caption': 'تفاصيل عن قرب', 'dpg_items.product': [], 'dpg_items.top': 55, 'dpg_items.left': 40 },
          ],
          { max: 8 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 24 Featured Product ──────────────────────────────────────────────── */
  {
    const q = f('fproduct');
    specs['home.selia-featured-product'] = make(
      'home.selia-featured-product',
      'منتج مميز',
      'Featured Product (Selia)',
      'sicon-shopping-bag',
      'منتج واحد ببطاقة كبيرة. لإظهار العد التنازلي اختر منتجًا عليه خصم وتاريخ نهاية تخفيض.',
      [
        q.t('title', 'العنوان', 'منتج يستحق الانتباه'),
        q.b('enable_background', 'تفعيل خلفية العنصر', true),
        q.b('compact_mobile', 'تصغير المنتج في الجوال'),
        q.b('compact_desktop', 'تصغير المنتج في الكمبيوتر'),
        q.b('hide_quantity', 'اخفاء الكمية المتبقية'),
        q.b('hide_countdown', 'اخفاء العد التنازلي'),
        q.prod('product', 'المنتج'),
        ...q.common(),
      ]
    );
  }

  /* ── 25 Custom Testimonials ───────────────────────────────────────────── */
  {
    const q = f('testimonials');
    const c = col('reviews');
    specs['home.selia-testimonials'] = make(
      'home.selia-testimonials',
      'آراء عملاء مخصصة',
      'Custom Testimonials (Selia)',
      'sicon-chat',
      'تنبيه: إن أردت عرض التقييمات الفعلية للمتجر فاستخدم عنصر «آراء العملاء». هنا تكتب الآراء بنفسك، لذلك تُعرض كآراء مخصصة لا كتقييمات موثّقة.',
      [
        q.t('title', 'العنوان', 'آراء العملاء'),
        q.t('subtitle', 'العنوان الفرعي', 'ماذا يقول عملاؤنا عنا'),
        q.b('enable_background', 'تفعيل خلفية العنصر', true),
        collection(
          'reviews',
          'التقييمات',
          'تقييم',
          'عدد النجوم من ١ إلى ٥. الاسم والنص كما تريد أن يظهرا بالضبط.',
          [
            c.t('name', 'اسم العميل'),
            c.img('image', 'صورة العميل'),
            c.n('rating', 'عدد النجوم', 5, 1, 5),
            c.a('text', 'نص التقييم'),
          ],
          [
            { 'reviews.name': 'سارة الأحمد', 'reviews.image': '', 'reviews.rating': 5, 'reviews.text': 'متجر رائع لن يكون آخر تعامل معكم، المنتجات ممتازة والتوصيل سريع.' },
            { 'reviews.name': 'خالد العتيبي', 'reviews.image': '', 'reviews.rating': 5, 'reviews.text': 'متجر رائع أشكركم على جودة المنتجات والتغليف الممتاز.' },
            { 'reviews.name': 'نورة السبيعي', 'reviews.image': '', 'reviews.rating': 4, 'reviews.text': 'تجربة جيدة ومتجر ممتاز وتجاوب سريع، أنصحكم وبقوة.' },
            { 'reviews.name': 'محمد الحربي', 'reviews.image': '', 'reviews.rating': 5, 'reviews.text': 'متجر جميل وسريعون في التوصيل، والتغليف وصلني تمام.' },
          ],
          { max: 12 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 28 Animated Brands ───────────────────────────────────────────────── */
  {
    const q = f('brands');
    const c = col('brands');
    specs['home.selia-animated-brands'] = make(
      'home.selia-animated-brands',
      'ماركات تجارية متحركة',
      'Animated Brands (Selia)',
      'sicon-image',
      'شريط شعارات يمرّ على حافتي القسم: كل شعار داخل مربّع فاتح، رمادي في السكون وملوّن عند المرور عليه، وصفّان يتحركان في اتجاهين متعاكسين. أضف ٨ ماركات على الأقل — التكرار يتم تلقائيًا لملء الشريط.',
      [
        q.t('title', 'العنوان', 'ماركات نفتخر بها', 'العنوان فوق الشريط. اتركه فارغًا لبدء القسم بالشعارات مباشرة.'),
        q.b('black_logos', 'جعل الشعارات باللون الأسود', false, 'يحوّل كل شعار إلى أسود موحّد بغضّ النظر عن ألوان الشعار الأصلي — يوحّد الشعارات التي وصلت بألوان مختلفة.'),
        q.b('larger', 'عرض الشعارات بحجم أكبر', false, 'يكبّر مربّع الشعار. استخدمه إن كانت الشعارات صغيرة التفاصيل أو القسم عريضًا.'),
        q.b('two_rows', 'صفّان يتحركان في اتجاهين متعاكسين', true, 'صفّان من الشعارات نفسها، يمرّ أحدهما يمينًا والآخر يسارًا. أوقفه لصفّ واحد.'),
        q.c('background', 'لون مربّع الشعار', '#eeeeee', 'لون المربّع خلف كل شعار. الفاتح هو الأنسب لشعارات داكنة.'),
        q.b('no_background', 'إلغاء مربّع الشعار', false, 'يزيل المربّع والحاشية، فتصبح الشعارات على خلفية الصفحة مباشرة.'),
        collection(
          'brands',
          'الماركات التجارية',
          'ماركة',
          'ارفع شعارًا بخلفية شفافة (PNG). المربّع الذي يظهر حوله في القسم هو تصميم، لا جزء من الصورة. يمكن ربط الشعار بماركة أو تصنيف أو مقال أو منتج أو رابط خارجي.',
          [
            c.img('image', 'الصورة'),
            /* Without a name the tile has no accessible name at all: the logo
               IS the content, so the alt text cannot come from anywhere else.
               Optional — a tile without it still renders. */
            c.t('title', 'اسم الماركة', '', 'يُقرأ في قارئ الشاشة ويظهر عند مرور المؤشر. اتركه فارغًا إن كان الشعار نفسه يحمل الاسم.'),
            c.link('link', 'الرابط'),
          ],
          [
            { 'brands.image': '', 'brands.link': [] },
            { 'brands.image': '', 'brands.link': [] },
            { 'brands.image': '', 'brands.link': [] },
            { 'brands.image': '', 'brands.link': [] },
            { 'brands.image': '', 'brands.link': [] },
            { 'brands.image': '', 'brands.link': [] },
            { 'brands.image': '', 'brands.link': [] },
            { 'brands.image': '', 'brands.link': [] },
            { 'brands.image': '', 'brands.link': [] },
            { 'brands.image': '', 'brands.link': [] },
          ],
          { min: 1, max: 30 }
        ),
        ...q.common(),
      ]
    );
  }

  /* ── 29 Advanced Content ──────────────────────────────────────────────── */
  {
    const q = f('acontent');
    const c = col('acontent_items');
    specs['home.selia-advanced-content'] = make(
      'home.selia-advanced-content',
      'محتوى متقدم',
      'Advanced Content (Selia)',
      'sicon-page',
      'محتوى مع صورة خلفية ونافذة جانبية للتفاصيل. إن فعّلت «تحديد رابط للزر» يذهب الزر إلى الرابط مباشرة بدل فتح النافذة.',
      [
        q.t('title', 'العنوان الرئيسي', 'قصة وراء كل قطعة'),
        q.t('subtitle', 'العنوان الفرعي'),
        q.a('description', 'الوصف', 'وصف تفصيلي يظهر في نمط البانر أو أعلى الوسائط في النمط العادي.'),
        q.s('media_type', 'نوع الوسائط', [['صورة', 'image'], ['فيديو', 'video']], 'image'),
        q.img('image', 'رفع الصورة', '', 'الصورة تُعرض كخلفية لكامل العنصر، ويفضّل أن تكون صورة واقعية.'),
        q.u('video', 'رابط الفيديو'),
        q.b('show_media', 'عرض الوسائط', true),
        q.b('as_banner', 'عرض العنصر كبانر'),
        q.b('button_link_instead', 'تحديد رابط للزر بدلاً من فتح النافذة'),
        q.b('show_countdown', 'عرض عد تنازلي'),
        q.t('end_at', 'موعد انتهاء العرض', '2027-01-01T15:00'),
        q.t('button_label', 'نص الزر', 'اعرف المزيد'),
        q.link('button_url', 'رابط الزر'),
        q.t('modal_title', 'عنوان النافذة', 'لماذا نختلف'),
        collection(
          'acontent_items',
          'عناصر النافذة',
          'عنصر',
          'قائمة العناصر التي تظهر داخل النافذة الجانبية، مثل قائمة مميزات.',
          [
            c.t('title', 'العنوان'),
            c.a('description', 'الوصف'),
            c.t('icon', 'أيقونة العنصر', 'sicon-check-circle'),
          ],
          [
            { 'acontent_items.title': 'خامات مختارة', 'acontent_items.description': 'نتعامل مع موردين نعرفهم بالاسم.', 'acontent_items.icon': 'sicon-check-circle' },
            { 'acontent_items.title': 'تصنيع محلي', 'acontent_items.description': 'كل قطعة تُشرف عليها ورشتنا.', 'acontent_items.icon': 'sicon-check-circle' },
            { 'acontent_items.title': 'ضمان لمدة عام', 'acontent_items.description': 'الصيانة والاستبدال مشمولان.', 'acontent_items.icon': 'sicon-check-circle' },
          ],
          { max: 12 }
        ),
        ...q.common(true),
      ]
    );
  }

  /* ── 30 Special Offer with Countdown ──────────────────────────────────── */
  {
    const q = f('soffer');
    specs['home.selia-special-offer'] = make(
      'home.selia-special-offer',
      'عرض خاص مع عد تنازلي',
      'Special Offer with Countdown (Selia)',
      'sicon-clock',
      'عرض خاص بخلفية وعدّاد تنازلي. لونا الخلفية والمحتوى يعملان عندما تكون الصورة بجانب المحتوى.',
      [
        q.img('background_image', 'خلفية العنصر'),
        q.s('image_layout', 'طريقة عرض الصورة', [['خلفية كاملة', 'cover'], ['بجانب المحتوى', 'side']], 'side'),
        q.c('background_color', 'لون الخلفية', '#004956', 'خلفية قسم العرض الخاص.'),
        q.c('text_color', 'لون المحتوى', '#ffffff', 'لون النصوص داخل قسم العرض الخاص.'),
        q.t('end_at', 'موعد انتهاء العرض', '2027-01-01T15:00'),
        q.b('hide_countdown', 'اخفاء العد التنازلي'),
        q.t('title', 'العنوان', 'خصم الموسم'),
        q.a('description', 'الوصف', 'خصم لفترة محدودة على تشكيلة مختارة.'),
        q.t('button_label', 'نص الزر', 'عرض التفاصيل'),
        q.link('button_link', 'رابط الزر'),
        ...q.common(),
      ]
    );
  }

  return specs;
};
