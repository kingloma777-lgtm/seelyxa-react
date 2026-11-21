/* ==========================================================================
   Seeds all 34 ported Selia blocks into `twilight.preview.json`.

   The dev client REGENERATES that file from the theme's own preview pass, so
   anything added here is temporary — it exists so the blocks can be rendered
   and looked at before the merchant has configured anything. Re-run it after
   any build that rewrites the file.

   The seed is derived from `selia-specs.cjs`, the same object that publishes
   `twilight.json`. That is the point: all 394 controls get a real value, in
   the exact key shape the editor writes, so a stale or renamed field shows up
   in the dev preview instead of hiding behind a fallback. The first eight
   blocks keep their hand-written artwork-rich overrides on top.

   Idempotent: a block already present (matched on `path`) is replaced in
   place, not appended twice.
   ========================================================================== */

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const previewPath = path.join(root, 'twilight.preview.json');
const preview = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
const layout = Array.isArray(preview.layout) ? preview.layout : [];
const specs = require('./selia-specs.cjs');

/* A deliberately emptied layout (`scripts/home-layout.cjs empty`) leaves a
   backup file behind. Re-seeding on top of that silently undoes the emptying —
   which is the "they came back again" loop. Ask for `--force` instead.
   Checked here, before `layout` is mutated by the seeding pass below. */
const backupPath = path.join(root, 'twilight.preview.layout-backup.json');
if (
  layout.length === 0 &&
  fs.existsSync(backupPath) &&
  !process.argv.includes('--force')
) {
  console.error(
    'refusing to seed: the preview layout is empty on purpose\n' +
      `  (${path.basename(backupPath)} exists — it holds the blocks you removed).\n` +
      '  Test one block at a time:  node scripts/home-layout.cjs only <path>\n' +
      '  Put everything back:       node scripts/home-layout.cjs restore\n' +
      '  Seed anyway:               node scripts/seed-selia-preview.cjs --force'
  );
  process.exit(1);
}

/** Stand-in artwork. Only ever used by the dev preview — the merchant's own
 *  images replace it the moment they set one. */
const ART = {
  banner: '/reference/oryzo-hero.jpg',
  tile: '/reference/oryzo-product.jpg',
  portrait: '/reference/larevoltosa-lens.jpg',
  world: '/reference/auragate-world.jpg',
  wall: '/reference/second-skin-wall.jpg',
};

const MAP = '<iframe src="https://www.google.com/maps?q=Riyadh&output=embed" loading="lazy"></iframe>';

/** A different photo per image field, so a grid does not look like one tile
 *  repeated — a repeated tile hides broken column wiring in a screenshot. */
function artwork(id) {
  if (/mobile|portrait|vertical/i.test(id)) return ART.portrait;
  if (/background|banner|desktop|world|before|after|hero/i.test(id)) return ART.banner;
  return ART.tile;
}

/** The first eight blocks were seeded by hand before the specs covered them;
 *  keep their copy (it reads like a store, not like a form) and merge the
 *  generated defaults underneath it. */
const OVERRIDES = {
  'selia-ticker-bar': {
    ticker_layout: 'cross',
    ticker_tilt: 4,
    ticker_gap: -16,
    ticker_anim: 'scroll',
    ticker_hover: 'pause',
    ticker_fade: false,
    ticker_divider: 'star',
    ticker_size: 15,
    ticker_weight: '700',
    ticker_radius: 0,
    ticker_shadow: false,
    ticker_top_space: false,
    ticker_rows: [
      {
        'ticker_rows.text': 'توصيل مجاني للطلبات فوق ٢٠٠ ريال',
        'ticker_rows.link': '',
        'ticker_rows.background': '#111111',
        'ticker_rows.color': '#ffffff',
        'ticker_rows.direction': 'page',
        'ticker_rows.speed': 110,
        'ticker_rows.size': 'md',
        'ticker_rows.style': 'solid',
      },
      {
        'ticker_rows.text': 'خصم ٢٥٪ على الأطقم الجديدة — لفترة محدودة',
        'ticker_rows.link': '',
        'ticker_rows.background': '#ed1c24',
        'ticker_rows.color': '#ffffff',
        'ticker_rows.direction': 'reverse',
        'ticker_rows.speed': 92,
        'ticker_rows.size': 'md',
        'ticker_rows.style': 'solid',
      },
      {
        'ticker_rows.text': 'شحن خلال يومين لكل مدن المملكة',
        'ticker_rows.link': '',
        'ticker_rows.background': '#f4efe6',
        'ticker_rows.color': '#141414',
        'ticker_rows.direction': 'page',
        'ticker_rows.speed': 132,
        'ticker_rows.size': 'sm',
        'ticker_rows.style': 'solid',
      },
    ],
  },
  'selia-category-hero': {
    cathero_title: 'تسوّق حسب التصنيف',
    cathero_background: ART.banner,
    cathero_compact_mobile: true,
    cathero_cta_label: 'كل التصنيفات',
    cathero_cta_link: '/categories',
    hero_categories: [
      { 'hero_categories.image': ART.tile, 'hero_categories.category': [{ label: 'أثاث', value: '/categories/1', key: '1' }] },
      { 'hero_categories.image': ART.tile, 'hero_categories.category': [{ label: 'إضاءة', value: '/categories/2', key: '2' }] },
      { 'hero_categories.image': ART.tile, 'hero_categories.category': [{ label: 'مفروشات', value: '/categories/3', key: '3' }] },
      { 'hero_categories.image': ART.tile, 'hero_categories.category': [{ label: 'ديكور', value: '/categories/4', key: '4' }] },
    ],
  },
  /* Fifteen real logo files. `artwork()` hands every row the same product
     photo, and a brand wall showing one bottle fifteen times tests nothing
     about the wall: the tiles, the edge mask and the seam all look right for
     the wrong reason. Files live in `public/reference/brands/`, names are the
     logos' own — a tile without one is an unnamed image. */
  'selia-animated-brands': {
    brands_title: 'ماركات نفتخر بها',
    brands_two_rows: true,
    brands_background: '#eeeeee',
    brands: [
      'سليا ثيم',
      'أديداس',
      'شانيل',
      'ديور',
      'لويس فيتون',
      'نقاء',
      'بوس',
      'مزون',
      'تابي',
      'دولتشي أند غابانا',
      'آبل باي',
      'أرامكس',
      'فيزا',
      'دي إتش إل',
      'ماستركارد',
    ].map((name, index) => ({
      'brands.image': `/reference/brands/brand-${String(index + 1).padStart(2, '0')}.png`,
      'brands.title': name,
      'brands.link': [],
    })),
  },
  'selia-custom-products': {
    picks_title: 'الأكثر مبيعًا',
    picks_subtitle: 'قطع اختارها عملاؤنا أكثر من غيرها',
    picks_layout: 'grid',
    picks_type: 'latest',
    picks_limit: 4,
    picks_show_all: true,
  },
  'selia-statistics': {
    statistics_title: 'أرقام تتكلم',
    statistics_subtitle: 'خمسة عشر عامًا في خدمة عملائنا',
    statistics_count_up: true,
    stats: [
      { 'stats.icon': [{ label: 'حقيبة تسوّق', value: 'shopping-bag', key: 'shopping-bag' }], 'stats.color': '#004956', 'stats.number': '+١٢٠٠', 'stats.title': 'عميل سعيد', 'stats.description': 'من كل مدن المملكة' },
      { 'stats.icon': [{ label: 'قلب', value: 'heart', key: 'heart' }], 'stats.color': '#8a5a44', 'stats.number': '٩٨٪', 'stats.title': 'رضا العملاء', 'stats.description': 'حسب تقييمات المتجر' },
      { 'stats.icon': [{ label: 'صندوق', value: 'box-bankers', key: 'box-bankers' }], 'stats.color': '#3f5d4a', 'stats.number': '+٤٥٠٠', 'stats.title': 'طلب تم تسليمه', 'stats.description': '' },
      { 'stats.icon': [{ label: 'تقويم', value: 'calendar', key: 'calendar' }], 'stats.color': '#6a4a7a', 'stats.number': '١٥', 'stats.title': 'سنة خبرة', 'stats.description': '' },
    ],
  },
  'selia-blog': { blog_title: 'من المدونة', blog_count: 3 },
  'selia-featured-categories': {
    fcats_heading: 'تسوّق حسب الفئة',
    /* Four DIFFERENT photos: the shared artwork() helper hands every image
       field the same tile, and a category menu showing one picture four times
       reads as a broken grid rather than as four ways into the catalogue. */
    fcats_tiles: [
      { 'fcats_tiles.title': 'غرفة الجلوس', 'fcats_tiles.subtitle': 'قطع تجعل البيت بيتك', 'fcats_tiles.image': ART.banner, 'fcats_tiles.color': '#c8a15a' },
      { 'fcats_tiles.title': 'المساحات الخارجية', 'fcats_tiles.subtitle': 'أفنية وأقواس', 'fcats_tiles.image': ART.portrait, 'fcats_tiles.color': '#b8663f' },
      { 'fcats_tiles.title': 'ديكور وخامات', 'fcats_tiles.subtitle': 'طين، خشب، وضوء', 'fcats_tiles.image': ART.wall, 'fcats_tiles.color': '#8a7259' },
      { 'fcats_tiles.title': 'أساسيات العناية', 'fcats_tiles.subtitle': 'زيت، بلسم، وفحم', 'fcats_tiles.image': ART.tile, 'fcats_tiles.color': '#3f5d4a' },
    ],
  },
  /* Twelve categories, twelve DIFFERENT photos: `artwork()` hands every image
     field the same tile, and a category index showing one bottle twelve times
     is not a design, it is a bug you can see. Files live in
     `public/reference/categories/` so the preview works offline. */
  'selia-circle-links': {
    circles_title: 'جميع الأقسام',
    circles_subtitle: 'لتناسب جميع الازواق',
    circle_links: [
      { 'circle_links.image': '/reference/categories/kids.jpg', 'circle_links.title': 'أطفال', 'circle_links.subtitle': 'اعتني بصغيرك', 'circle_links.link': [{ label: 'أطفال', value: '/categories/kids', key: 'kids' }] },
      { 'circle_links.image': '/reference/categories/perfume.jpg', 'circle_links.title': 'عطور', 'circle_links.subtitle': 'لمسة من الأناقة', 'circle_links.link': [{ label: 'عطور', value: '/categories/perfume', key: 'perfume' }] },
      { 'circle_links.image': '/reference/categories/hair.jpg', 'circle_links.title': 'العناية بالشعر', 'circle_links.subtitle': 'تألق بشعر لامع', 'circle_links.link': [{ label: 'العناية بالشعر', value: '/categories/hair', key: 'hair' }] },
      { 'circle_links.image': '/reference/categories/nails.jpg', 'circle_links.title': 'الأظافر', 'circle_links.subtitle': 'اعتني بنفسك', 'circle_links.link': [{ label: 'الأظافر', value: '/categories/nails', key: 'nails' }] },
      { 'circle_links.image': '/reference/categories/skin.jpg', 'circle_links.title': 'عناية بالبشرة', 'circle_links.subtitle': 'استمتع ببشرة نضرة', 'circle_links.link': [{ label: 'عناية بالبشرة', value: '/categories/skin', key: 'skin' }] },
      { 'circle_links.image': '/reference/categories/oud.jpg', 'circle_links.title': 'عود', 'circle_links.subtitle': 'استمتع بسحر العود', 'circle_links.link': [{ label: 'عود', value: '/categories/oud', key: 'oud' }] },
      { 'circle_links.image': '/reference/categories/cards.png', 'circle_links.title': 'بطاقات رقمية', 'circle_links.subtitle': 'اختيارك الأمثل', 'circle_links.link': [{ label: 'بطاقات رقمية', value: '/categories/cards', key: 'cards' }] },
      { 'circle_links.image': '/reference/categories/bags.jpg', 'circle_links.title': 'حقائب', 'circle_links.subtitle': 'تصاميم مبتكرة', 'circle_links.link': [{ label: 'حقائب', value: '/categories/bags', key: 'bags' }] },
      { 'circle_links.image': '/reference/categories/shoes.jpg', 'circle_links.title': 'أحذية', 'circle_links.subtitle': 'جودة عالية', 'circle_links.link': [{ label: 'أحذية', value: '/categories/shoes', key: 'shoes' }] },
      { 'circle_links.image': '/reference/categories/glasses.jpg', 'circle_links.title': 'نظارات', 'circle_links.subtitle': 'أناقة بصرية', 'circle_links.link': [{ label: 'نظارات', value: '/categories/glasses', key: 'glasses' }] },
      { 'circle_links.image': '/reference/categories/tees.jpg', 'circle_links.title': 'تيشيرتات', 'circle_links.subtitle': 'تجربة مختلفة', 'circle_links.link': [{ label: 'تيشيرتات', value: '/categories/tees', key: 'tees' }] },
      { 'circle_links.image': '/reference/categories/dresses.jpg', 'circle_links.title': 'فساتين', 'circle_links.subtitle': 'أناقة الطفولة', 'circle_links.link': [{ label: 'فساتين', value: '/categories/dresses', key: 'dresses' }] },
    ],
  },
  /* Two files that actually differ. `artwork()` hands both `ba_before` and
     `ba_after` the same banner, and a comparison slider whose two halves are
     identical shows nothing at all — not the seam, not the drag, nothing.
     `ba-before.jpg` is the same courtyard graded dull and dusty; the pair is
     generated by `lens-harness/_ba-art.cjs`. */
  'selia-before-after': {
    ba_title: 'الفرق واضح',
    ba_subtitle: 'اسحب المقبض لمقارنة الصورة قبل الترميم وبعده',
    ba_before: '/reference/ba-before.jpg',
    ba_after: '/reference/ba-after.jpg',
    ba_before_label: 'قبل',
    ba_after_label: 'بعد',
  },
  /* Three DIFFERENT photographs and three different buttons. `artwork()` gives
     every `desktop` column the same banner, and a slider whose slides are the
     same picture looks broken rather than calm — you cannot tell whether the
     fade ran. */
  'selia-advanced-slider': {
    slider_effect: 'fade',
    slider_duration: 6,
    slider_speed: 1.2,
    slider_arrows: true,
    slider_dots: true,
    slider_image_animation: true,
    slides: [
      {
        'slides.desktop': '/reference/ba-after.jpg',
        'slides.mobile': '/reference/ba-after.jpg',
        'slides.title': 'مجموعة الموسم الجديد',
        'slides.description': 'قطع اختيرت لتُرى عن قرب — خامات طبيعية وحرفية واضحة',
        'slides.button_label': 'تسوّق الآن',
        'slides.button_background': '#111111',
        'slides.button_color': '#ffffff',
        'slides.button_link': [{ label: 'تسوّق الآن', value: '/categories/new', key: 'new' }],
        'slides.text_position': [{ label: 'يمين', value: 'right', key: 'right' }],
        'slides.fit': [{ label: 'قصّ لملء الإطار', value: 'cover', key: 'cover' }],
      },
      {
        'slides.desktop': '/reference/second-skin-wall.jpg',
        'slides.mobile': '/reference/second-skin-wall.jpg',
        'slides.title': 'جدار يتنفّس',
        'slides.description': 'طين وضوء وحجر — التفاصيل التي لا تُرى من بعيد',
        'slides.button_label': 'ديكور وخامات',
        'slides.button_background': '#f2ede4',
        'slides.button_color': '#1b1d21',
        'slides.button_link': [{ label: 'ديكور وخامات', value: '/categories/decor', key: 'decor' }],
        'slides.text_position': [{ label: 'يمين', value: 'right', key: 'right' }],
        'slides.fit': [{ label: 'قصّ لملء الإطار', value: 'cover', key: 'cover' }],
      },
      {
        'slides.desktop': '/reference/categories/perfume.jpg',
        'slides.mobile': '/reference/categories/perfume.jpg',
        'slides.title': 'لمسة تبقى',
        'slides.description': 'عطور مختارة بعناية، من الأذكى إلى الأعمق',
        'slides.button_label': 'اكتشف العطور',
        'slides.button_background': '#ffffff',
        'slides.button_color': '#14161a',
        'slides.button_link': [{ label: 'اكتشف العطور', value: '/categories/perfume', key: 'perfume' }],
        'slides.text_position': [{ label: 'يمين', value: 'right', key: 'right' }],
        'slides.fit': [{ label: 'قصّ لملء الإطار', value: 'cover', key: 'cover' }],
      },
    ],
  },
  'selia-branches': {
    branches_title: 'فروعنا',
    branches_subtitle: 'اختر أقرب فرع لك',
    branches_tab_style: 'pills',
    branches: [
      { 'branches.name': 'الرياض — العليا', 'branches.country': '', 'branches.map': MAP },
      { 'branches.name': 'جدة — الروضة', 'branches.country': '', 'branches.map': MAP },
      { 'branches.name': 'الدمام — الشاطئ', 'branches.country': '', 'branches.map': MAP },
    ],
  },
  'selia-map-location': { map_title: 'موقعنا', map_subtitle: 'زورونا في المعرض', map_embed: MAP },
  'selia-contact-form': {
    contact_title: 'تواصل معنا',
    contact_subtitle: 'فريق العناية بالعملاء يقرأ كل رسالة بنفسه، ونرد خلال يوم عمل واحد.',
    contact_layout: 'split',
    contact_recipient: 'hello@example.com',
    contact_access_key: '',
    contact_phone: '+966 55 123 4567',
    contact_hours: 'الأحد – الخميس، ٩ص – ٦م',
    contact_privacy_note: 'نستخدم بياناتك للرد على رسالتك فقط، ولا نشاركها مع أي طرف.',
  },
  'selia-product-videos': {
    pvideos_title: 'صُنعت خصيصا لك',
    pvideos_subtitle: 'إرث سعودي يُرتدى',
    pvideos_layout: 'grid',
    pvideos_ratio: '9-16',
    pvideos_autoplay: true,
    pvideos_show_product: true,
    pvideos_show_all: false,
    pvideos_items: [
      /* Ten rows on purpose: four fit a page, so the reel has three pages and
         the merchant can see the arrows, the bars and the snapping. */
      { 'pvideos_items.product': [{ value: '677709975', key: '677709975' }], 'pvideos_items.video': 'https://selia-tech.github.io/videos/video-2026-04-03T14-18-53-762Z-bxoz7r.mp4' },
      { 'pvideos_items.product': [{ value: '1361945446', key: '1361945446' }], 'pvideos_items.video': 'https://selia-tech.github.io/videos/video-2026-04-03T14-17-22-246Z-xl7p1d.mp4' },
      { 'pvideos_items.product': [{ value: '1303461379', key: '1303461379' }], 'pvideos_items.video': 'https://selia-tech.github.io/videos/video-2026-04-03T14-18-53-762Z-bxoz7r.mp4' },
      { 'pvideos_items.product': [{ value: '73203761', key: '73203761' }], 'pvideos_items.video': 'https://selia-tech.github.io/videos/video-2026-04-03T14-17-22-246Z-xl7p1d.mp4' },
      { 'pvideos_items.product': [{ value: '524759233', key: '524759233' }], 'pvideos_items.video': 'https://selia-tech.github.io/videos/video-2026-04-03T14-18-53-762Z-bxoz7r.mp4' },
      { 'pvideos_items.product': [{ value: '2106933489', key: '2106933489' }], 'pvideos_items.video': 'https://selia-tech.github.io/videos/video-2026-04-03T14-17-22-246Z-xl7p1d.mp4' },
      { 'pvideos_items.product': [{ value: '627583647', key: '627583647' }], 'pvideos_items.video': 'https://selia-tech.github.io/videos/video-2026-04-03T14-18-53-762Z-bxoz7r.mp4' },
      { 'pvideos_items.product': [{ value: '1436244360', key: '1436244360' }], 'pvideos_items.video': 'https://selia-tech.github.io/videos/video-2026-04-03T14-17-22-246Z-xl7p1d.mp4' },
      { 'pvideos_items.product': [{ value: '1730363092', key: '1730363092' }], 'pvideos_items.video': 'https://selia-tech.github.io/videos/video-2026-04-03T14-18-53-762Z-bxoz7r.mp4' },
      { 'pvideos_items.product': [{ value: '356917195', key: '356917195' }], 'pvideos_items.video': 'https://selia-tech.github.io/videos/video-2026-04-03T14-17-22-246Z-xl7p1d.mp4' },
    ],
  },
};

function valueOf(field) {
  if (field.format === 'dropdown-list') return field.selected?.[0]?.value ?? '';
  if (field.format === 'variable-list') return field.value ?? [];
  return field.value ?? '';
}

function seedFor(specPath) {
  const fields = {};
  for (const field of specs[specPath].fields) {
    if (field.type === 'static') continue;

    if (field.type === 'collection') {
      fields[field.id] = (field.value || []).map((row) => {
        const out = {};
        for (const column of field.fields) {
          let value = row[column.id];
          if (column.format === 'image' && !value) value = artwork(column.id);
          if (value !== undefined && value !== null && value !== '') out[column.id] = value;
        }
        return out;
      });
      continue;
    }

    let value = valueOf(field);
    if (field.format === 'image' && !value) value = artwork(field.id);
    /* A countdown with a fixed date eventually becomes a dead timer in the
       preview. Use a rolling future date so the block shows a real clock on
       every run, whatever year this checkout is opened in. */
    if (/_end_at$/.test(field.id)) {
      const future = new Date(Date.now() + 45 * 86400000);
      value = future.toISOString().slice(0, 16);
    }
    if (value === '' || value === undefined || value === null) continue;
    if (Array.isArray(value) && !value.length) continue;
    fields[field.id] = value;
  }
  return fields;
}

const blocks = Object.keys(specs).map((specPath) => {
  const key = specPath.replace(/^home\./, '');
  return { path: key, fields: { ...seedFor(specPath), ...(OVERRIDES[key] || {}) } };
});

const byPath = new Map(layout.map((block, index) => [block.path, index]));
const seededPaths = new Set(blocks.map((block) => block.path));

blocks.forEach((block) => {
  if (byPath.has(block.path)) {
    const index = byPath.get(block.path);
    layout[index] = { ...layout[index], fields: block.fields };
    return;
  }
  layout.push({ id: `block-selia-${block.path}`, path: block.path, fields: block.fields });
});

/* Drop any `selia-*` entry this script no longer seeds. Renaming a block would
   otherwise leave the old path in the layout, and a path with no registered
   component renders an empty `.s-block` — a silent gap on the page and a
   phantom "rendered nothing" row in the visual harness. */
const pruned = layout.filter(
  (block) => !/^selia-/.test(block.path) || seededPaths.has(block.path)
);
if (pruned.length !== layout.length) {
  console.log(`pruned ${layout.length - pruned.length} stale selia preview block(s)`);
}

/* Blocks that are NOT ported Selia blocks but still have to be on the preview
   home page. They are seeded here, not typed into the JSON, because the dev
   client rewrites this file from the theme's own preview pass: anything added
   by hand is gone after the next restart, and the page silently comes back
   with one block fewer. */
const EXTRAS = [
  {
    id: 'block-stats-orbit',
    path: 'stats-orbit',
    first: true,
    fields: {
      stats_orbit_eyebrow: 'أرقام تتكلم',
      stats_orbit_center_image: '/reference/oryzo-product.jpg',
      stats_orbit_count_up: true,
      stats_orbit_show_ring: true,
      stats_orbit_items: [
        { 'stats_orbit_items.title': 'عميل سعيد', 'stats_orbit_items.value': '1200', 'stats_orbit_items.unit': '+', 'stats_orbit_items.delta': '+18%', 'stats_orbit_items.date': 'هذا العام', 'stats_orbit_items.color': '#ed1c24' },
        { 'stats_orbit_items.title': 'طلب مكتمل', 'stats_orbit_items.value': '48', 'stats_orbit_items.unit': 'ألف', 'stats_orbit_items.delta': '', 'stats_orbit_items.date': 'خلال ١٢ شهرًا', 'stats_orbit_items.color': '#f0a04b' },
        { 'stats_orbit_items.title': 'تقييم المتجر', 'stats_orbit_items.value': '4.9', 'stats_orbit_items.unit': '/5', 'stats_orbit_items.delta': '', 'stats_orbit_items.date': 'من ٣٤٠٠ مراجعة', 'stats_orbit_items.color': '#0f766e' },
        { 'stats_orbit_items.title': 'مدينة نخدمها', 'stats_orbit_items.value': '32', 'stats_orbit_items.unit': '', 'stats_orbit_items.delta': '', 'stats_orbit_items.date': 'توصيل خلال يومين', 'stats_orbit_items.color': '#7c3aed' },
        { 'stats_orbit_items.title': 'قطعة في المعرض', 'stats_orbit_items.value': '860', 'stats_orbit_items.unit': '+', 'stats_orbit_items.delta': '', 'stats_orbit_items.date': 'تُحدَّث أسبوعيًا', 'stats_orbit_items.color': '#0891b2' },
        { 'stats_orbit_items.title': 'سنوات خبرة', 'stats_orbit_items.value': '12', 'stats_orbit_items.unit': '', 'stats_orbit_items.delta': '', 'stats_orbit_items.date': 'منذ ٢٠١٣', 'stats_orbit_items.color': '#be123c' },
      ],
    },
  },
];

let finalLayout = pruned;
for (const extra of EXTRAS) {
  if (finalLayout.some((block) => block.path === extra.path)) continue;
  const { first, ...entry } = extra;
  finalLayout = first ? [entry, ...finalLayout] : [...finalLayout, entry];
}

preview.layout = finalLayout;
fs.writeFileSync(previewPath, `${JSON.stringify(preview, null, 2)}\n`, 'utf8');
console.log(`preview layout: ${finalLayout.length} blocks (${blocks.length} Selia + ${EXTRAS.length} extra)`);
