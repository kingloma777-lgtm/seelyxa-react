/* ==========================================================================
   The merchant fields for the ported Selia blocks.

   One source of truth, applied to `twilight.json` by `apply-selia.cjs`. Written
   here rather than edited into the JSON by hand for two reasons:

   1. **The catalogue is lossy.** `docs/SELIA-COMPONENTS.md` was scraped from
      the editor's panel text, which flattens every repeater: Selia's four
      testimonials come out as nineteen unrelated text fields, and a row's
      `الرقم *` is indistinguishable from the block's own title. The real shape
      is recovered here from the panel's own row headers (`الإحصاء #1`).
   2. **Idempotence.** Re-running the applier updates the fields of a block that
      already exists instead of appending a second copy of it, so a correction
      to a label is one edit and one run — not a manual hunt through 4000 lines
      of JSON.

   Every field id is `<prefix>_<key>`, matching the rest of the theme. The
   blocks read them through `readValue`, which prefers the prefixed id — see
   the trap documented in `app/lib/homeBlock.ts`.
   ========================================================================== */

/** uuid for a new component; the applier keeps the existing one on update. */
const F = (fields) => fields;

const title = (prefix, value, description) => ({
  type: 'static',
  format: 'title',
  id: `static-title-${prefix}`,
  value,
  variant: 'h6',
});

const description = (prefix, value) => ({
  type: 'static',
  format: 'description',
  id: `static-desc-${prefix}`,
  value,
});

const text = (id, label, desc, value = '', extra = {}) => ({
  type: 'string',
  format: 'text',
  id,
  required: false,
  label,
  description: desc,
  value,
  ...extra,
});

const area = (id, label, desc, value = '', extra = {}) => ({
  type: 'string',
  format: 'textarea',
  id,
  required: false,
  label,
  description: desc,
  value,
  ...extra,
});

const color = (id, label, desc, value) => ({
  type: 'string',
  format: 'color',
  id,
  required: false,
  label,
  description: desc,
  value,
});

const image = (id, label, desc, value = '', required = false) => ({
  type: 'string',
  format: 'image',
  id,
  required,
  label,
  description: desc,
  value,
});

const url = (id, label, desc, value = '') => ({
  type: 'string',
  format: 'url',
  id,
  required: false,
  label,
  description: desc,
  value,
});

const toggle = (id, label, desc, value = false) => ({
  type: 'boolean',
  format: 'switch',
  id,
  required: false,
  label,
  description: desc,
  value,
  selected: value,
});

/* The real Selia editor renders these as plain `s-input` number controls, and
   the Salla manifest validator only accepts integer/number/numeric/text for
   `type: "number"`. `format: "slider"` was a guess that produced 25 non-fatal
   `check:manifest` warnings and did not match the captured editor. */
const slider = (id, label, desc, value, minimum, maximum, step = 1) => ({
  type: 'number',
  format: 'number',
  id,
  required: false,
  label,
  description: desc,
  value,
  minimum,
  maximum,
  step,
});

const select = (id, label, desc, options, selectedValue) => {
  const built = options.map(([optionLabel, value]) => ({
    label: optionLabel,
    value,
    key: `${id}-${value}`,
  }));
  const selected = built.filter((option) => option.value === selectedValue);
  return {
    type: 'items',
    id,
    format: 'dropdown-list',
    required: false,
    label,
    description: desc,
    source: 'Manual',
    options: built,
    selected,
  };
};

const collection = (id, label, itemLabel, desc, fields, value, limits = {}) => ({
  id,
  key: undefined, // filled by the applier (a stable uuid per collection)
  type: 'collection',
  format: 'collection',
  required: limits.required ?? true,
  minLength: limits.min ?? 1,
  maxLength: limits.max ?? 8,
  label,
  item_label: itemLabel,
  description: desc,
  value,
  fields,
});

const ICON_OPTIONS = [
  ['حقيبة تسوّق', 'shopping-bag'],
  ['قلب', 'heart'],
  ['موقع', 'location'],
  ['هاتف', 'phone'],
  ['تمّ بنجاح', 'check-circle'],
  ['تقويم', 'calendar'],
  ['نار (عرض)', 'fire'],
  ['صندوق', 'box-bankers'],
  ['طائرة ورقية (إرسال)', 'paper-plane'],
  ['رسالة', 'mail-letter'],
  ['كاميرا', 'camera'],
  ['قائمة', 'list'],
  ['مستند', 'page'],
  ['مفتاح', 'keyboard'],
];

module.exports = {
  /* ── 1. Statistics ─────────────────────────────────────────────────────── */
  'home.selia-statistics': {
    title: { en: 'Statistics (Selia)', ar: 'إحصائيات' },
    icon: 'sicon-list',
    fields: F([
      title('statistics', 'إحصائيات'),
      description(
        'statistics',
        'أرقام كبيرة بسطر تحتها: عدد العملاء، سنوات الخبرة، عدد الطلبات. الأرقام تُكتب يدويًا لا تُقرأ من المتجر، فهي إقرار منك لا إحصاء آلي — اكتب فيها ما تستطيع الدفاع عنه. الأيقونة واللون اختياريان: بدون أيقونة يبقى الرقم وحده، وهذا أنظف عندما تكون الأرقام متجاورة.'
      ),
      text('statistics_title', 'عنوان القسم', 'العنوان الذي يظهر فوق الأرقام. اتركه فارغًا لتبدأ الأرقام مباشرة بدون رأس — مناسب عندما تكون الأرقام امتدادًا للقسم الذي فوقها.', ''),
      text('statistics_subtitle', 'العنوان الفرعي', 'سطر توضيحي تحت العنوان، بحد أقصى سطرين على الكمبيوتر. لا تكرر فيه العنوان نفسه.', ''),
      toggle(
        'statistics_count_up',
        'تفعيل أنيميشن عداد الأرقام',
        'يبدأ كل رقم من صفر ويصل إلى قيمته عند ظهوره على الشاشة. يتوقف تلقائيًا لمن فعّل «تقليل الحركة» في نظامه، ويظهر الرقم النهائي فورًا بدون حركة.',
        true
      ),
      collection(
        'stats',
        'الإحصائيات',
        'إحصاء',
        'كل صف = رقم واحد. الرقم يقبل نصًا لا رقمًا فقط، فاكتب «+١٢٠٠» أو «٩٩٪» كما تريد أن يظهر تمامًا. عند تفعيل العداد يتحرك الجزء الرقمي فقط ويبقى ما حوله (+ و٪) ثابتًا.',
        [
          select('stats.icon', 'الأيقونة', 'أيقونة تظهر فوق الرقم داخل مربع ملوّن. اتركها فارغة إذا أردت أرقامًا عارية بدون رموز.', ICON_OPTIONS, 'shopping-bag'),
          color('stats.color', 'لون الأيقونة', 'يُستخدم كخلفية باهتة لمربع الأيقونة ولونًا للرمز نفسه. لا يغيّر لون الرقم — الرقم يبقى بلون النص الأساسي ليظل مقروءًا في الوضع الليلي.', '#004956'),
          text('stats.number', 'الرقم', 'كما تريد أن يظهر بالضبط: «+١٢٠٠»، «٩٩٪»، «١٥ سنة». هو الحقل الوحيد المطلوب في الصف.', '+١٢٠٠'),
          text('stats.title', 'العنوان', 'كلمة أو كلمتان تحت الرقم: «عميل سعيد»، «سنة خبرة».', 'عميل سعيد'),
          area('stats.description', 'الوصف', 'سطر اختياري ثالث للتوضيح. الصف بدون وصف يبقى أقصر وأهدأ بصريًا.', ''),
        ],
        [
          { 'stats.icon': [{ label: 'حقيبة تسوّق', value: 'shopping-bag', key: 'shopping-bag' }], 'stats.color': '#004956', 'stats.number': '+١٢٠٠', 'stats.title': 'عميل سعيد', 'stats.description': '' },
          { 'stats.icon': [{ label: 'قلب', value: 'heart', key: 'heart' }], 'stats.color': '#8a5a44', 'stats.number': '٩٨٪', 'stats.title': 'رضا العملاء', 'stats.description': '' },
          { 'stats.icon': [{ label: 'صندوق', value: 'box-bankers', key: 'box-bankers' }], 'stats.color': '#3f5d4a', 'stats.number': '+٤٥٠٠', 'stats.title': 'طلب تم تسليمه', 'stats.description': '' },
          { 'stats.icon': [{ label: 'تقويم', value: 'calendar', key: 'calendar' }], 'stats.color': '#6a4a7a', 'stats.number': '١٥', 'stats.title': 'سنة خبرة', 'stats.description': '' },
        ],
        { max: 6 }
      ),
    ]),
  },

  /* ── 2. Google Maps Location ───────────────────────────────────────────── */
  'home.selia-map-location': {
    title: { en: 'Google Maps Location (Selia)', ar: 'موقعك على خرائط قوقل' },
    icon: 'sicon-location',
    fields: F([
      title('map', 'موقعك على خرائط قوقل'),
      description(
        'map',
        'خريطة تفاعلية لموقع المتجر أو المعرض. الصق كود التضمين من خرائط قوقل، ويُقرأ منه رابط الخريطة فقط — أي شيء آخر في الكود لا يُنفَّذ، فلا يمكن أن يضيف هذا الحقل سكربتًا إلى صفحتك. الخريطة تُحمّل عند وصول الزائر إليها لا عند فتح الصفحة، لأنها طلب خارجي ثقيل.'
      ),
      text('map_title', 'عنوان القسم', 'عنوان فوق الخريطة. اتركه فارغًا إذا كانت الخريطة نفسها كافية.', ''),
      text('map_subtitle', 'العنوان الفرعي', 'سطر توضيحي: «زورونا في المعرض»، أو ساعات العمل.', ''),
      area(
        'map_embed',
        'كود خرائط قوقل',
        'افتح موقعك على خرائط قوقل ← مشاركة ← «تضمين خريطة» ← انسخ الكود والصقه هنا كاملًا. يكفي أن يحتوي على رابط https، ويُقبل أيضًا لصق الرابط وحده بدون وسم iframe.',
        '<iframe src="https://www.google.com/maps?q=Riyadh&output=embed" width="600" height="450" style="border:0;" loading="lazy"></iframe>',
        { required: true, minLength: 10 }
      ),
      toggle(
        'map_dark_mode',
        'تفعيل الوضع الداكن للخريطة',
        'يعكس ألوان الخريطة لتناسب الصفحة الداكنة. خرائط قوقل لا توفّر خريطة داكنة عبر التضمين، فالعكس هو الطريقة الوحيدة — وهو يبدو غريبًا على صفحة فاتحة، فلا تفعّله إلا إذا كان موقعك داكنًا.',
        false
      ),
    ]),
  },

  /* ── 3. Blog ───────────────────────────────────────────────────────────── */
  'home.selia-blog': {
    title: { en: 'Blog (Selia)', ar: 'المدونة' },
    icon: 'sicon-page',
    fields: F([
      title('blog', 'المدونة'),
      description(
        'blog',
        'أحدث مقالات مدونتك، بصورها وعناوينها وتواريخها، مع تصنيفات المدونة كأزرار تصفية للزائر. كل شيء يُقرأ من مدونتك: انشر مقالًا فيظهر هنا تلقائيًا، واحذفه فيختفي. لا يوجد في هذا القسم عنوان أو مقال مكتوب بخط اليد — ولذلك لا يمكن أن يعرض مقالًا محذوفًا.'
      ),
      text('blog_title', 'عنوان القسم', 'العنوان فوق شبكة المقالات. اتركه فارغًا لتبدأ المقالات مباشرة.', 'المدونة'),
      slider(
        'blog_count',
        'عدد المقالات',
        'كم مقالًا يظهر في الصفحة. ٣ هو العدد الذي يملأ صفًا واحدًا على الكمبيوتر بدون أن يدفع بقية الصفحة لأسفل.',
        3,
        1,
        12,
        1
      ),
    ]),
  },

  /* ── 4. Contact Form ───────────────────────────────────────────────────── */
  'home.selia-contact-form': {
    title: { en: 'Contact Form (Selia)', ar: 'نموذج التواصل' },
    icon: 'sicon-mail-letter',
    fields: F([
      title('contact', 'نموذج التواصل'),
      description(
        'contact',
        'نموذج يراسل بريدك مباشرة بدون سيرفر. يحتاج مفتاحًا مجانيًا من Web3Forms (خدمة توصيل رسائل) وبريدًا تستقبل عليه — وبدون المفتاحين يعرض القسم بريدك كرابط mailto بدل نموذج لا يرسل شيئًا. التحقق من الحقول والرسائل الخطأ وحالة الإرسال كلها مدمجة، ولا يوجد أي تأكيد وهمي: رسالة النجاح لا تظهر إلا بعد موافقة خدمة التوصيل على الاستلام.'
      ),
      text('contact_title', 'العنوان الرئيسي', 'عنوان القسم. اتركه فارغًا للاكتفاء بالحقول.', 'تواصل معنا'),
      text('contact_subtitle', 'العنوان الفرعي', 'سطر تحت العنوان يشرح متى تُتوقع الإجابة، مثل «نرد خلال يوم عمل».', ''),
      select(
        'contact_layout',
        'نوع العرض',
        '«جانبي» يضع الحقول في عمودين على الكمبيوتر (الاسم والبريد جنبًا إلى جنب)، و«عمودي» يجعلها عمودًا واحدًا في كل المقاسات.',
        [
          ['جانبي (عمودان)', 'split'],
          ['عمودي', 'stacked'],
        ],
        'split'
      ),
      text(
        'contact_success_message',
        'رسالة النجاح',
        'النص الذي يراه الزائر بعد وصول رسالته فعلًا. اكتب فيه ما يطمئنه: مدة الرد أو رقم للتواصل العاجل.',
        'وصلتنا رسالتك، وسنعاود التواصل معك قريبًا.'
      ),
      text(
        'contact_recipient',
        'البريد الإلكتروني لاستقبال الرسائل',
        'البريد الذي تصل إليه رسائل النموذج. يُستخدم أيضًا في رابط mailto عندما لا يكون المفتاح مضبوطًا، فلا تتركه فارغًا.',
        '',
        { required: true }
      ),
      text(
        'contact_access_key',
        'مفتاح Web3Forms',
        'مفتاح مجاني من web3forms.com: أدخل بريدك واضغط Create Access Key ثم انسخ المفتاح هنا. الخدمة مجانية ولا تحتاج حسابًا. بدون هذا المفتاح لا يستطيع النموذج إرسال شيء، وسيتحوّل القسم إلى رابط بريد مباشر.',
        ''
      ),
      text(
        'contact_phone',
        'رقم الهاتف أو واتساب',
        'يظهر في لوحة البيانات بجانب البريد كرقم قابل للنقر. اتركه فارغًا لإخفاء السطر بالكامل.',
        ''
      ),
      text(
        'contact_hours',
        'ساعات العمل',
        'سطر واحد يطمئن الزائر: متى تُتوقع الإجابة. مثال: «الأحد – الخميس، ٩ص – ٦م». اتركه فارغًا لإخفاء السطر.',
        ''
      ),
      text(
        'contact_privacy_note',
        'ملاحظة تحت زر الإرسال',
        'سطر صغير يشرح مصير البيانات، مثل «نستخدم بريدك للرد فقط». اتركه فارغًا لإخفائه.',
        'نستخدم بياناتك للرد على رسالتك فقط، ولا نشاركها مع أي طرف.'
      ),
      toggle('contact_full_width', 'جعل العنصر بكامل عرض الشاشة', 'يمدّ خلفية القسم إلى حواف الشاشة. الحقول تبقى داخل نفس عرض بقية الصفحة.', false),
    ]),
  },

  /* ── 5. Animated Announcement Bar ──────────────────────────────────────── */
  'home.selia-ticker-bar': {
    title: { en: 'Animated Announcement Bar (Selia)', ar: 'شريط اعلاني متحرك' },
    icon: 'sicon-fire',
    fields: F([
      title('ticker', 'شريط اعلاني متحرك'),
      description(
        'ticker',
        'أشرطة تمرّ على عرض الشاشة: عرض تخفيض، رسالة توصيل، إعلان موسم. تقدر تعمل أكثر من شريط، تميلهم، تخليهم يتقاطعوا كعلامة ×، وتعطي كل شريط سرعته واتجاهه ولونه ونصه. الأشرطة تتحرك مع اتجاه القراءة — يمينًا في المتجر العربي — وتتوقف عند مرور المؤشر عليها، وتصير سطورًا ثابتة لمن فعّل «تقليل الحركة». تُقرأ مرة واحدة لقارئ الشاشة لا مرة لكل تكرار.'
      ),
      select(
        'ticker_layout',
        'ترتيب الأشرطة',
        '«متوازية»: كل شريط تحت الثاني. «مائلة»: كلها بنفس الميل. «متقاطعة»: الميل يتبادل (يمين/يسار) فتتقاطع — استخدم «المسافة بين الأشرطة» بقيمة سالبة حتى تتراكب فعلًا.',
        [
          ['متوازية', 'stack'],
          ['مائلة (نفس الميل)', 'tilt'],
          ['متقاطعة (ميل متعاكس)', 'cross'],
        ],
        'stack'
      ),
      slider(
        'ticker_tilt',
        'ميل الأشرطة',
        'بالدرجات. ٦ درجات تعطي إحساس الشريط المائل بدون أن يلتهم القسم نصف الشاشة. لا يعمل مع «متوازية» — اختر «مائلة» أو «متقاطعة» أولًا.',
        6,
        0,
        10
      ),
      slider(
        'ticker_gap',
        'المسافة بين الأشرطة',
        'بالبكسل. القيمة السالبة تجعل الأشرطة تتراكب — وهي التي تصنع التقاطع الحقيقي في وضع «متقاطعة». صفر يجعلها ملتصقة.',
        10,
        -40,
        40
      ),
      select(
        'ticker_anim',
        'نوع الحركة',
        '«تمرير»: الحركة الأساسية. «لمعان»: وميض يمر على النص كل ثانيتين. «نبض»: سطوع الخلفية يعلو ويهدأ. «بدون»: أشرطة ثابتة — مفيدة لما تكون الأشرطة مائلة ومتقاطعة وأنت تريد الشكل بلا حركة.',
        [
          ['تمرير مستمر', 'scroll'],
          ['تمرير + لمعان على النص', 'shimmer'],
          ['تمرير + نبض في الخلفية', 'pulse'],
          ['بدون حركة', 'still'],
        ],
        'scroll'
      ),
      select(
        'ticker_hover',
        'عند مرور المؤشر',
        '«يتوقف» هو السلوك الصحيح: القارئ يستطيع إنهاء جملة تهرب منه. «لا يتغير» يمنع التوقف ويترك الشريط مستمرًا.',
        [
          ['يتوقف', 'pause'],
          ['لا يتغير', 'none'],
        ],
        'pause'
      ),
      toggle(
        'ticker_fade',
        'تلاشي الأطراف',
        'يُذيب بداية الشريط ونهايته بدل أن يُقطع النص عند حافة الشاشة. يظهر أثره أكثر مع الأشرطة المائلة.',
        false
      ),
      select(
        'ticker_divider',
        'الفاصل بين التكرارات',
        'العلامة التي تفصل بين نهاية الجملة وبدايتها عند التكرار. «بدون» يجعلها جملة واحدة متصلة — أنسب للجمل الطويلة.',
        [
          ['نقطة', 'dot'],
          ['شرطة', 'dash'],
          ['نجمة', 'star'],
          ['بدون', 'none'],
        ],
        'dot'
      ),
      slider('ticker_size', 'حجم الخط', 'بالبكسل. هذا هو الأساس، وحجم كل شريط يضبط عليه.', 14, 11, 26),
      select(
        'ticker_weight',
        'وزن الخط',
        '«عريض» هو المناسب لشريط إعلاني — يُقرأ في لمحة. «عادي» أنسب للجمل الطويلة.',
        [
          ['عادي', '400'],
          ['متوسط', '600'],
          ['عريض', '800'],
        ],
        '600'
      ),
      slider(
        'ticker_radius',
        'استدارة الأطراف',
        'بالبكسل. لا يظهر أثرها عندما تكون الأشرطة مائلة، لأن الأطراف تُقصّ خارج الشاشة أصلًا.',
        0,
        0,
        24
      ),
      toggle('ticker_shadow', 'ظل تحت الأشرطة', 'ظل ناعم يفصل الشريط عن الصفحة ويجعله يبدو مرتفعًا عنها.', false),
      toggle('ticker_top_space', 'إضافة مسافة أعلى الشريط', 'يفصله عن القسم الذي فوقه. أوقفه عندما يكون الشريط ملتصقًا بالهيدر مباشرة.', false),
      collection(
        'ticker_rows',
        'الأشرطة',
        'شريط',
        'كل صف = شريط واحد. أضف حتى ٥ أشرطة. النص المكرر داخل الشريط تلقائيًا ليملأ العرض، فاكتب الجملة مرة واحدة.',
        [
          area(
            'ticker_rows.text',
            'نص الشريط',
            'جملة واحدة قصيرة. لا تقل عن ٨ أحرف حتى لا تتكرر بسرعة مزعجة، ولا تزد عن ١٢٠ حرفًا حتى يراها القارئ كاملة. اتركه فارغًا لحذف الشريط.',
            'توصيل مجاني للطلبات فوق ٢٠٠ ريال — الشحن خلال يومين',
            { required: true, minLength: 5, maxLength: 120 }
          ),
          url('ticker_rows.link', 'رابط الشريط (اختياري)', 'يجعل الشريط كله قابلًا للنقر. اتركه فارغًا إذا كان إعلانًا بلا صفحة.', ''),
          color('ticker_rows.background', 'لون الخلفية', 'لون الشريط. الأسود أو لون علامتك التجارية يعملان في الوضعين الفاتح والداكن.', '#000000'),
          color('ticker_rows.color', 'لون النص', 'لون النص فوق الخلفية. تأكد من التباين: النص الفاتح على خلفية فاتحة غير مقروء.', '#ffffff'),
          select(
            'ticker_rows.direction',
            'اتجاه الحركة',
            '«مع اتجاه الصفحة» يتحرك مع العين (يمينًا في العربي). «عكسي» يتحرك ضدها — وفي الوضع المتقاطع أعطِ كل شريط اتجاهًا مخالفًا للثاني.',
            [
              ['مع اتجاه الصفحة', 'page'],
              ['عكسي', 'reverse'],
            ],
            'page'
          ),
          slider(
            'ticker_rows.speed',
            'سرعة الحركة',
            'بالبكسل في الثانية. ٨٠–١٤٠ مريحة للقراءة. السرعات المختلفة بين الأشرطة تصنع تمايزًا بصريًا جميلًا في الوضع المتقاطع.',
            110,
            20,
            320
          ),
          select(
            'ticker_rows.size',
            'حجم الشريط',
            'نسبة إلى «حجم الخط» في الأعلى: صغير ٠٫٨٥×، عادي ١×، كبير ١٫٢×. اجعل الأشرطة الخلفية أصغر لتصنع عمقًا.',
            [
              ['صغير', 'sm'],
              ['عادي', 'md'],
              ['كبير', 'lg'],
            ],
            'md'
          ),
          select(
            'ticker_rows.style',
            'نمط الشريط',
            '«ممتلئ»: خلفية كاملة. «محدَّد بحدود»: بلا خلفية، بإطار ونص بلون الخلفية المختار — أنسب لشريط ثانٍ فوق شريط ممتلئ حتى لا يطغى عليه.',
            [
              ['ممتلئ', 'solid'],
              ['محدَّد بحدود', 'outline'],
            ],
            'solid'
          ),
        ],
        [],
        { min: 1, max: 5 }
      ),
    ]),
  },

  /* ── 6. Featured Categories with Background ────────────────────────────── */
  'home.selia-category-hero': {
    title: { en: 'Featured Categories with Background (Selia)', ar: 'تصنيفات مميزة مع خلفية' },
    icon: 'sicon-list',
    fields: F([
      title('cathero', 'تصنيفات مميزة مع خلفية'),
      description(
        'cathero',
        'بانر بصورتك، تتدلّى عليه بطاقات التصنيفات من حافته السفلية. كل بطاقة تفتح تصنيفها الحقيقي، واسمها يُقرأ من التصنيف نفسه لا يُكتب بخط اليد — فتغيير اسم التصنيف في لوحة سلة يغيّر البطاقة، وحذفه لا يترك اسمًا بلا وجهة.'
      ),
      text('cathero_title', 'عنوان القسم', 'العنوان الذي يظهر فوق البانر. اتركه فارغًا إذا كانت صورة البانر تحمل عنوانها بنفسها.', 'تسوّق حسب التصنيف'),
      text('cathero_eyebrow', 'السطر العلوي', 'كلمة صغيرة قبل عنوان القسم، مثل «مجموعات مختارة». اتركها فارغة لإخفائها.', 'مجموعات مختارة'),
      text('cathero_headline', 'العنوان داخل البانر', 'العنوان الكبير المكتوب على خلفية البانر. آخر كلمة تُلوَّن بلون التمييز تلقائيًا.', 'كل البيت، في مكان واحد'),
      text(
        'cathero_subtitle',
        'الوصف داخل البانر',
        'سطر أو سطران تحت العنوان. اتركه فارغًا إذا كان العنوان وحده يكفي.',
        'من الأثاث إلى آخر تفصيلة في الغرفة — اختر التصنيف الذي يشبه ذوقك وابدأ منه.'
      ),
      image(
        'cathero_background',
        'صورة الخلفية',
        'المقاس المناسب ١٢٣٣×٥٠٠ بكسل. تُقصّ من المنتصف لتملأ الإطار، فضع موضوع الصورة في الوسط لا في الحافة. تُعرض تحت طبقة تعتيم خفيفة حتى يظهر الزر الأبيض فوق أي صورة.',
        '',
        true
      ),
      toggle(
        'cathero_compact_mobile',
        'تفعيل العرض المصغر للصور في الجوال',
        'على الهاتف تصبح التصنيفات شريطًا أفقيًا يُسحب بدل شبكة صفّين، فيبقى البانر والتصنيفات على شاشة واحدة. أوقفه إذا كان عندك ٣ تصنيفات أو أقل.',
        true
      ),
      text('cathero_cta_label', 'نص الزر الرئيسي', 'زر فوق البانر. اتركه فارغًا إذا لم يكن هناك ما يستحق النقر.', ''),
      url('cathero_cta_link', 'رابط الزر', 'إلى أين يذهب الزر: صفحة تصنيفاتك أو صفحة عرض خاص.', ''),
      collection(
        'hero_categories',
        'التصنيفات',
        'تصنيف',
        'كل صف = تصنيف واحد: صورته والتصنيف نفسه. اختر التصنيف من شجرة تصنيفات متجرك، والاسم الظاهر تحته يأتي منه تلقائيًا.',
        [
          image('hero_categories.image', 'الصورة', 'مربعة ١٠٠٠×١٠٠٠ بكسل. الصورة المربعة تملأ البطاقة بدون قصّ.', '', true),
          {
            id: 'hero_categories.category',
            type: 'items',
            format: 'variable-list',
            searchable: true,
            source: 'custom',
            required: true,
            label: 'التصنيف',
            icon: 'sicon-list',
            description: 'تصنيف من شجرة متجرك. البطاقة تفتح صفحته، واسمه يظهر تحت الصورة. لو حذفت التصنيف تسقط بطاقته بدل أن تصبح رابطًا ميتًا.',
            value: null,
            sources: [{ label: 'تصنيفات', key: 'categories', value: 'categories' }],
          },
        ],
        [
          { 'hero_categories.image': '', 'hero_categories.category': [] },
          { 'hero_categories.image': '', 'hero_categories.category': [] },
          { 'hero_categories.image': '', 'hero_categories.category': [] },
          { 'hero_categories.image': '', 'hero_categories.category': [] },
        ],
        { max: 8 }
      ),
    ]),
  },

  /* ── 7. Store Branches ─────────────────────────────────────────────────── */
  'home.selia-branches': {
    title: { en: 'Store Branches (Selia)', ar: 'فروع المتجر' },
    icon: 'sicon-location',
    fields: F([
      title('branches', 'فروع المتجر'),
      description(
        'branches',
        'تبويب لكل فرع، وخريطة الفرع المختار تحته. التبويبات تعمل بلوحة المفاتيح (الأسهم وHome وEnd) وتُعلن نفسها لقارئ الشاشة كتبويبات حقيقية — وهذا هو الفرق بين قسم يجد فيه الزائر فرعًا قريبًا وقسم لا يستطيع الوصول إليه إلا بالفأرة.'
      ),
      text('branches_title', 'العنوان الرئيسي', 'عنوان القسم. اتركه فارغًا للاكتفاء بالتبويبات.', 'فروعنا'),
      text('branches_subtitle', 'العنوان الفرعي', 'سطر توضيحي: «اختر أقرب فرع لك».', ''),
      select(
        'branches_tab_style',
        'شكل التبويبات',
        '«أقراص» أزرار مستديرة، و«خط سفلي» تبويبات هادئة بخط تحت المختار، و«بطاقات» مربعات أعرض. اختر ما يناسب بقية صفحتك.',
        [
          ['أقراص دائرية', 'pills'],
          ['خط سفلي', 'underline'],
          ['بطاقات', 'blocks'],
        ],
        'pills'
      ),
      toggle(
        'branches_multi_country',
        'عدة دول',
        'يجمع التبويبات تحت اسم الدولة في صفوف الفروع. الفروع التي أدخلتها تبقى كما هي — الحقل اختياري في كل صف، ولا تفقد شيئًا عند تشغيله.',
        false
      ),
      toggle('branches_full_width', 'عرض كامل للشاشة', 'يمدّ الخريطة إلى حواف الشاشة. التبويبات تبقى في المنتصف.', false),
      collection(
        'branches',
        'قائمة المدن والفروع',
        'مدينة/فرع',
        'كل صف = فرع واحد باسمه وخريطته. اسم الفرع هو نص التبويب، فاجعله قصيرًا: «الرياض — العليا» أفضل من العنوان الكامل.',
        [
          text('branches.name', 'اسم المدينة/الفرع', 'نص التبويب. قصير ومميّز عن بقية الفروع.', 'الرياض — العليا', { required: true }),
          text('branches.country', 'الدولة', 'يُستخدم فقط عند تفعيل «عدة دول»، ويظهر كعنوان فوق مجموعة الفروع. اتركه فارغًا في متجر بدولة واحدة.', ''),
          area(
            'branches.map',
            'كود خريطة الفرع',
            'من خرائط قوقل: مشاركة ← تضمين خريطة ← انسخ الكود. يُقرأ رابط الخريطة منه فقط، فلا يُنفَّذ أي سكربت من هذا الحقل. الفرع بدون كود يظهر بتبويبه ورسالة أن الخريطة لم تُضف بعد.',
            '',
            { minLength: 10 }
          ),
        ],
        [
          { 'branches.name': 'الرياض — العليا', 'branches.country': '', 'branches.map': '<iframe src="https://www.google.com/maps?q=Riyadh+Olaya&output=embed" loading="lazy"></iframe>' },
          { 'branches.name': 'جدة — الروضة', 'branches.country': '', 'branches.map': '<iframe src="https://www.google.com/maps?q=Jeddah+Alrawda&output=embed" loading="lazy"></iframe>' },
        ],
        { max: 20 }
      ),
    ]),
  },

  /* ── 8. Custom Products ────────────────────────────────────────────────── */
  'home.selia-custom-products': {
    title: { en: 'Custom Products (Selia)', ar: 'منتجات مخصصة' },
    icon: 'sicon-shopping-bag',
    fields: F([
      title('picks', 'منتجات مخصصة'),
      description(
        'picks',
        'شبكة أو شريط منتجات من كتالوجك. الاسم والسعر والصورة والتوفّر تُقرأ من الكتالوج لحظة العرض، فتغيير سعر أو نفاد مخزون يظهر هنا فورًا — ولا يوجد سعر مكتوب بخط اليد في هذا القسم.'
      ),
      text('picks_title', 'العنوان الرئيسي', 'عنوان القسم. اتركه فارغًا لتبدأ المنتجات مباشرة.', 'الأكثر مبيعًا'),
      text('picks_subtitle', 'العنوان الفرعي', 'سطر توضيحي تحت العنوان.', ''),
      select(
        'picks_layout',
        'طريقة العرض',
        '«شبكة» تلتف على أكثر من صف، و«شريط» صف واحد يُسحب مع أزرار أسهم على الكمبيوتر. الشريط مفيد عندما يكون عندك أكثر من ٨ منتجات ولا تريد دفع الصفحة لأسفل.',
        [
          ['شبكة', 'grid'],
          ['شريط يُسحب', 'slider'],
        ],
        'grid'
      ),
      select(
        'picks_type',
        'نوع المنتجات',
        'من أين تُقرأ المنتجات. «مختارة» تعرض ما تختاره أنت بالترتيب الذي اخترته، وبقية الأنواع تُحدَّث تلقائيًا مع الكتالوج والمبيعات.',
        [
          ['أحدث المنتجات', 'latest'],
          ['الأكثر مبيعًا', 'best_selling'],
          ['العروض', 'offers'],
          ['الأعلى تقييمًا', 'top_rated'],
          ['منتجات مختارة', 'selected'],
        ],
        'latest'
      ),
      {
        id: 'picks_products',
        type: 'items',
        format: 'variable-list',
        searchable: true,
        source: 'custom',
        required: false,
        label: 'المنتجات المختارة',
        icon: 'sicon-shopping-bag',
        description: 'تُستخدم فقط عندما يكون «نوع المنتجات» = منتجات مختارة. اخترها بالترتيب الذي تريد ظهورها به. المنتج المحذوف من الكتالوج يسقط من القسم بدل أن يظهر مكسورًا.',
        value: null,
        sources: [{ label: 'منتجات', key: 'products', value: 'products' }],
      },
      slider('picks_limit', 'عدد المنتجات', 'كم منتجًا يظهر. ٤ يملأ صفًا واحدًا على الهاتف، و٨ صفين على الكمبيوتر.', 8, 1, 24, 1),
      toggle('picks_show_all', 'عرض رابط "عرض الكل"', 'يضيف زرًا أسفل القسم يفتح صفحة المنتجات (أو صفحة العروض إذا كان النوع عروضًا).', true),
      toggle('picks_top_space', 'إضافة مسافة أعلى العنصر', 'مسافة إضافية فوق القسم. استخدمها إذا التصق بالقسم الذي فوقه.', false),
    ]),
  },
};

/* ── the remaining 26 Selia blocks ────────────────────────────────────────
   Kept in a second module only because this file had grown to 500 lines; the
   builders above are passed in so both halves publish identical field shapes.
   `apply-selia.cjs` and `verify-selia.cjs` see ONE merged spec object either
   way, so the merchant's editor gets all 34 blocks from the same source.
   -------------------------------------------------------------------------- */
Object.assign(
  module.exports,
  require('./selia-specs-batch2.cjs')({
    F,
    title,
    description,
    text,
    area,
    color,
    image,
    url,
    toggle,
    slider,
    select,
    collection,
    ICON_OPTIONS,
  })
);
