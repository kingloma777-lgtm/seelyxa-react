import { lazy } from 'react';
import { createRouter } from '@salla.sa/twilight-theme-engine/tanstack';
import { registry } from '@salla.sa/twilight-theme-engine';
import {
  registerHomeComponents,
  registerHomeComponentConfig,
  DefaultHomeComponents,
} from '@salla.sa/twilight-theme-engine/routes/home';
import { SliderSkeleton } from '@salla.sa/twilight-components-react';
import { routeTree } from './routeTree.gen';
import {
  Brands,
  CustomTestimonials,
  EnhancedSlider,
  FeaturedProducts,
  featuredProductsConfig,
  FixedProducts,
  MainLinks,
  PhotosSlider,
  ProductsSlider,
  SliderProductsWithHeader,
  EnhancedSquareBanners,
} from './components/home';
import { registerThemeHooks } from './hooks';
import { ProductListSkeleton } from './components/product/ProductListSkeleton';
/* Direct file import, not `./components/home` — the home index module is
   mid-refactor in the working tree, and registering a new block must not ride
   that change. */
import { Figurines } from './components/home/Figurines';
/* Direct file import like Figurines: the stamp story is a scroll-scrubbed
   scene with its own stylesheet, and it must not ride the home index refactor. */
import { StampStory, stampStoryRunClass } from './components/home/StampStory';
import { SecondSkin } from './components/home/SecondSkin';
import { ProductScrub, productScrubRunClass } from './components/home/ProductScrub';
import { PortalHero, portalHeroRunClass } from './components/home/PortalHero';
import { ArcCoverflow, arcCoverflowHeightClass } from './components/home/ArcCoverflow';
/* Direct file import like Figurines: the shop-the-look reads the catalogue, so
   it must not ride the home index refactor either. */
import { ShopTheLook, shopTheLookRatioClass } from './components/home/ShopTheLook';
/* Direct file import for the same reason: a scroll-scrubbed stage that owns a
   pinned viewport and its own colour ramp. */
import { ProductChapters, productChaptersRunClass } from './components/home/ProductChapters';
/* Direct file import for the same reason: figures on an orbit around one
   headline number, with its own dark surface and its own stylesheet. */
import { StatsOrbit } from './components/home/StatsOrbit';
/* ── the Selia family ──────────────────────────────────────────────────────
   Ported from the competitor theme's 34 blocks (docs/SELIA-COMPONENTS.md).
   Direct file imports, same reason as the blocks above: they must not ride the
   home-index refactor. Every one of them renders inside `SeliaSection`, so the
   family shares one container and one heading instead of 34 near-copies.
   The list is generated from scripts/selia-specs.cjs — see gen-selia.cjs. */
/* @selia:imports:start */
import { Statistics } from './components/home/selia/Statistics';
import { MapLocation } from './components/home/selia/MapLocation';
import { BlogTeaser } from './components/home/selia/BlogTeaser';
import { ContactForm } from './components/home/selia/ContactForm';
import { TickerBar } from './components/home/selia/TickerBar';
import { CategoryHero } from './components/home/selia/CategoryHero';
import { Branches } from './components/home/selia/Branches';
import { ProductPicks } from './components/home/selia/ProductPicks';
import { AdvancedSlider } from './components/home/selia/AdvancedSlider';
import { FeaturedCategories } from './components/home/selia/FeaturedCategories';
import { ProductVideos } from './components/home/selia/ProductVideos';
import { DetailedProducts } from './components/home/selia/DetailedProducts';
import { ProductTabs } from './components/home/selia/ProductTabs';
import { AboutStore } from './components/home/selia/AboutStore';
import { SquareLinks } from './components/home/selia/SquareLinks';
import { ImageGrid } from './components/home/selia/ImageGrid';
import { CustomLinks } from './components/home/selia/CustomLinks';
import { CircleLinks } from './components/home/selia/CircleLinks';
import { DoubleBanner } from './components/home/selia/DoubleBanner';
import { AnimatedBanners } from './components/home/selia/AnimatedBanners';
import { VideoGallery } from './components/home/selia/VideoGallery';
import { BeforeAfter } from './components/home/selia/BeforeAfter';
import { DynamicBanner } from './components/home/selia/DynamicBanner';
import { TripleBanner } from './components/home/selia/TripleBanner';
import { FeaturedAnimatedProducts } from './components/home/selia/FeaturedAnimatedProducts';
import { OffersCounter } from './components/home/selia/OffersCounter';
import { Faq } from './components/home/selia/Faq';
import { StoreFeatures } from './components/home/selia/StoreFeatures';
import { DynamicProductGallery } from './components/home/selia/DynamicProductGallery';
import { FeaturedProduct } from './components/home/selia/FeaturedProduct';
import { Testimonials } from './components/home/selia/Testimonials';
import { AnimatedBrands } from './components/home/selia/AnimatedBrands';
import { AdvancedContent } from './components/home/selia/AdvancedContent';
import { SpecialOffer } from './components/home/selia/SpecialOffer';
/* @selia:imports:end */

const ProductListPage = lazy(() =>
  import('./components/product/ProductListPage').then((m) => ({ default: m.ProductListPage }))
);

// Register theme-level hooks (AddProductToast, DigitalFilesSettings, etc.)
registerThemeHooks();

registry.register('product:list-page', ProductListPage);
registry.register('product:list-skeleton', ProductListSkeleton);

registerHomeComponents({
  ...DefaultHomeComponents,
  brands: Brands,
  'enhanced-slider': EnhancedSlider,
  'custom-testimonials': CustomTestimonials,
  'main-links': MainLinks,
  'square-links': MainLinks,
  // Replaces the engine Swiper with the theme's scroll carousel (home block +
  // the product page's "similar products" `best-offers-<n>-slider`).
  'products-slider': ProductsSlider,
  // Replaces the engine Swiper with the theme's scroll carousel — same
  // progress bar + arrows as testimonials/products, cards instead of a thin
  // full-width banner strip.
  'photos-slider': PhotosSlider,
  // The renderer checks `home:featured-products:<view_style>` before the bare
  // key (theme-engine `HomePageRenderer.getComponentByPath`), and
  // `...DefaultHomeComponents` above still has the engine's own component
  // registered under the three literal `styleN` variants — leaving those out
  // here would mean only view_style-less / unrecognised blocks ever reach
  // this component, and every `style1`/`style2`/`style3` block keeps
  // rendering the broken engine variants this fork exists to replace.
  'featured-products': FeaturedProducts,
  'featured-products:style1': FeaturedProducts,
  'featured-products:style2': FeaturedProducts,
  'featured-products:style3': FeaturedProducts,
  // Fork of the engine block so its grid renders the theme's ProductCard wrapper.
  'fixed-products': FixedProducts,
  'slider-products-with-header': SliderProductsWithHeader,
  'enhanced-square-banners': EnhancedSquareBanners,
  // Full-viewport depth-carousel hero (`home.figurines`). The morphing
  // component: colour, position, scale, blur and opacity of every figure
  // crossfade together under one 650ms easing.
  figurines: Figurines,
  // Diagonal "field journal" journey across three postage stamps
  // (`home.stamp-story`). Photos + motion only: the reference's fixed index
  // bar and coordinate line are deliberately gone. Scoped to the block — the
  // page scroll is never touched, the journey is the block's own height.
  'stamp-story': StampStory,
  // Scroll-scrubbed WebGL dissolve over a full-bleed portrait
  // (`home.second-skin`). The reference drove it with Lenis + ScrollTrigger,
  // which hijack the page scroll — this port reads the raw offset in one rAF
  // loop and writes a custom property, so the block owns nothing global.
  'second-skin': SecondSkin,
  // Pinned product stage (`home.product-scrub`). The reference pinned with
  // ScrollTrigger for ten viewports and smoothed it with Lenis; here the
  // block's height is the scroll budget and the stage is `position: sticky`,
  // so nothing outside the block is touched. The GLTF spins about its own
  // axis from the same progress number that drives the CSS.
  'product-scrub': ProductScrub,
  // Portal walk-through hero (`home.portal-hero`). The reference is a whole
  // page with its own fixed nav and footer; this port keeps the two acts —
  // the zoom through the doorway and the arc of reviews on the same world —
  // and leaves the page furniture to the theme. Nothing is `position: fixed`:
  // the world is sticky inside the block.
  'portal-hero': PortalHero,
  // Endless cosine-arc coverflow (`home.arc-coverflow`). The reference
  // preventDefaults `wheel` on a 100svh section — a scroll trap on a store —
  // so only a horizontal wheel turns the cards here and a vertical one scrolls
  // the page. No GSAP: one rAF loop writes three custom properties.
  'arc-coverflow': ArcCoverflow,
  // Scene photo with numbered hotspots bound to real catalogue products
  // (`home.shop-the-look`). The reference typed its prices and faked its option
  // chips; here the name, price, stock and options come from `api/product`, and
  // a product that needs a size links to its page instead of pretending to be
  // a chip. The checkboxes drive a real total.
  'shop-the-look': ShopTheLook,
  // One product per screen (`home.product-chapters`). The reference pinned a
  // GSAP timeline for six viewports on top of Lenis; here the block's own
  // height is the budget, the stage is `position: sticky`, and the whole scene
  // is a pure function of ONE number — the float chapter index. Each chapter
  // paints its own opaque colour layer, so the background ramps by
  // cross-fading two layers instead of interpolating a colour in JS.
  'product-chapters': ProductChapters,
  // Figures scattered around one sphere (`home.stats-orbit`). The reference
  // placed five glass cards at hand-picked coordinates; the block keeps that
  // const still and animates the ENTRANCE (staggered card reveal + count-up),
  // so it reserves no scroll and needs no run class.
  'stats-orbit': StatsOrbit,
  // ── Selia family ────────────────────────────────────────────────────────
  // Each key matches the block's `path` in twilight.json minus the `home.`
  // prefix. Generated — 34 blocks, one per Selia component.
  /* @selia:map:start */
  'selia-statistics': Statistics,
  'selia-map-location': MapLocation,
  'selia-blog': BlogTeaser,
  'selia-contact-form': ContactForm,
  'selia-ticker-bar': TickerBar,
  'selia-category-hero': CategoryHero,
  'selia-branches': Branches,
  'selia-custom-products': ProductPicks,
  'selia-advanced-slider': AdvancedSlider,
  'selia-featured-categories': FeaturedCategories,
  'selia-product-videos': ProductVideos,
  'selia-detailed-products': DetailedProducts,
  'selia-product-tabs': ProductTabs,
  'selia-about-store': AboutStore,
  'selia-square-links': SquareLinks,
  'selia-image-grid': ImageGrid,
  'selia-custom-links': CustomLinks,
  'selia-circle-links': CircleLinks,
  'selia-double-banner': DoubleBanner,
  'selia-animated-banners': AnimatedBanners,
  'selia-video-gallery': VideoGallery,
  'selia-before-after': BeforeAfter,
  'selia-dynamic-banner': DynamicBanner,
  'selia-triple-banner': TripleBanner,
  'selia-featured-animated-products': FeaturedAnimatedProducts,
  'selia-offers-counter': OffersCounter,
  'selia-faq': Faq,
  'selia-store-features': StoreFeatures,
  'selia-dynamic-product-gallery': DynamicProductGallery,
  'selia-featured-product': FeaturedProduct,
  'selia-testimonials': Testimonials,
  'selia-animated-brands': AnimatedBrands,
  'selia-advanced-content': AdvancedContent,
  'selia-special-offer': SpecialOffer,
/* @selia:map:end */
});

// Wrapper `<section>` classes for `featured-products` — the engine only styles
// the literal `styleN` values; this covers the semantic `view_style`s too.
// `custom-testimonials` gets `s-block--full-bg` so the gray band runs edge-to-edge.
registerHomeComponentConfig({
  'featured-products': featuredProductsConfig,
  'custom-testimonials': {
    className: 's-block s-block--custom-testimonials s-block--full-bg',
  },
  // Lazy placements (blocks 4+): reserve the loaded blocks' height and show the
  // same SliderSkeleton the SSR path shows (sized in home-blocks.scss), not the
  // engine's 400px/200px defaults with mismatched skeletons (CLS on scroll-in).
  'enhanced-slider': {
    height: 'calc(100vw / 2.4)', // the 12:5 slide ratio
    placeholder: <SliderSkeleton />,
    // The boxed variant (`in_container`) is capped at the container width, so
    // its skeleton must be too (home-blocks.scss) or the reservation oversizes.
    className: (data) =>
      `s-block s-block--enhanced-slider${data.in_container ? ' s-block--enhanced-slider-boxed' : ''}`,
  },
  'main-links': {
    height: '112px',
    placeholder: <SliderSkeleton />,
    // Keeps the engine entry's merge classes; theme config replaces, not merges.
    className: (data) => {
      const mergeWithTop = data.merge_links_with_top_component;
      return [
        's-block',
        's-block--main-links',
        mergeWithTop && data.position ? 'merge-with-top-component' : '',
        !data.title && mergeWithTop ? 'merged-has-no-title' : '',
      ]
        .filter(Boolean)
        .join(' ');
    },
  },
  'square-links': {
    height: '144px', // .slide--cat-entry h-36 cards (square-links keeps the card look)
    placeholder: <SliderSkeleton />,
  },
  // Taller cards than the engine's thin full-width banner strip — reserve
  // more skeleton height so the real content doesn't shift the page on load.
  'photos-slider': {
    height: 'clamp(210px, 32vw, 420px)',
    placeholder: <SliderSkeleton />,
    className: (data) =>
      `s-block s-block--photos-slider${data.is_repeated ? ' repeated-block' : ''}`,
  },
  // The figurines hero paints its own colour full-bleed and clears the shared
  // block margins in the stylesheet. The "under the header" opt-in (the Twig
  // system) is read RIGHT HERE from the merchant switch, both key shapes as
  // usual, and turns into `s-block--under-header` on the wrapper — which is
  // the flag MorphHeader.tsx looks for to lift the first block + scrim the
  // header; the physical lift itself lives in home-blocks.scss.
  figurines: {
    className: (data) =>
      's-block s-block--figurines' +
      (data.under_header ?? data.figurines_under_header ? ' s-block--under-header' : ''),
  },
  // The stamp story pins its own viewport with `position: sticky` and its
  // height IS the journey (one viewport + the scroll length), so the reserved
  // height is that real geometry — a lazy placement never shifts the page.
  // The default matches the "medium" travel tier (4 viewports).
  'stamp-story': {
    /* the run length lives in `--stamp-run`, set by the class below from the
       placement's own stamp count — a static number would be wrong for every
       placement but the default one */
    height: 'calc(100svh + var(--stamp-run, 400vw))',
    className: (data) =>
      `s-block s-block--stamp-story ${stampStoryRunClass(data)}`,
  },
  'second-skin': {
    /* the block is exactly one hero, so the reservation is its height and
       nothing else — no per-placement class to compute any more */
    height: '175svh',
    className: 's-block s-block--second-skin',
  },
  // The scrub block's height is one pinned viewport plus a run whose length is
  // the merchant's pacing choice — so the static height string reads the
  // variable that the className supplies from the data.
  'product-scrub': {
    height: 'calc(100svh + var(--ps-run, 600svh))',
    className: (data) => `s-block s-block--product-scrub ${productScrubRunClass(data)}`,
  },
  // Same contract as the scrub: one viewport of stage plus a run whose length
  // is the merchant's pacing tier, so the reserved height reads the variable
  // the className supplies.
  'portal-hero': {
    height: 'calc(100svh + var(--ph-run, 80svh))',
    className: (data) => `s-block s-block--portal-hero ${portalHeroRunClass(data)}`,
  },
  // The block's height is the merchant's tier, not a scroll budget, so the
  // reservation reads the same variable the class sets — and the same
  // `max(360px, …)` floor the stylesheet uses, so a short (landscape) phone
  // cannot make the wrapper shorter than the block inside it.
  'arc-coverflow': {
    height: 'max(360px, calc(var(--ac-height, 78) * 1svh))',
    className: (data) => `s-block s-block--arc-coverflow ${arcCoverflowHeightClass(data)}`,
  },
  // This block's height is its content (a photo at the merchant's ratio beside a
  // list of however many products they picked), so the reservation is an
  // estimate, not a contract — `RenderWhenVisible` only applies it until the
  // block mounts. The ratio still arrives as a class so the frame keeps the
  // merchant's shape from the very first paint.
  'shop-the-look': {
    height: 'clamp(560px, 88vw, 820px)',
    className: (data) => `s-block s-block--shop-the-look ${shopTheLookRatioClass(data)}`,
  },
  // Same contract as the scrub and the portal: one pinned viewport plus a run
  // whose length is the merchant's pacing tier × their chapter count, so the
  // static height string reads the variable the className supplies — one class
  // per (tier × count), computed by the same helper the block calls.
  'product-chapters': {
    height: 'calc(100svh + var(--pc-run, 420svh))',
    className: (data) => `s-block s-block--product-chapters ${productChaptersRunClass(data)}`,
  },
  // The scatter is content height: the stage's aspect-ratio plus the mobile
  // column grow it, so there is nothing to reserve.
  'stats-orbit': { className: 's-block s-block--stats-orbit' },
  // The Selia family reserves nothing: every block's height is its own content
  // (a heading, a grid, a map), so `RenderWhenVisible` mounts them straight
  // away and there is no lazy skeleton to size. The class carries the block's
  // slug so its stylesheet can scope everything to it. Generated — 34 blocks.
  /* @selia:config:start */
  'selia-statistics': { className: 's-block s-block--selia-statistics' },
  'selia-map-location': { className: 's-block s-block--selia-map-location' },
  'selia-blog': { className: 's-block s-block--selia-blog' },
  'selia-contact-form': { className: 's-block s-block--selia-contact-form' },
  'selia-ticker-bar': { className: 's-block s-block--selia-ticker-bar' },
  'selia-category-hero': { className: 's-block s-block--selia-category-hero' },
  'selia-branches': { className: 's-block s-block--selia-branches' },
  'selia-custom-products': { className: 's-block s-block--selia-custom-products' },
  'selia-advanced-slider': { className: 's-block s-block--selia-advanced-slider' },
  'selia-featured-categories': { className: 's-block s-block--selia-featured-categories' },
  'selia-product-videos': { className: 's-block s-block--selia-product-videos' },
  'selia-detailed-products': { className: 's-block s-block--selia-detailed-products' },
  'selia-product-tabs': { className: 's-block s-block--selia-product-tabs' },
  'selia-about-store': { className: 's-block s-block--selia-about-store' },
  'selia-square-links': { className: 's-block s-block--selia-square-links' },
  'selia-image-grid': { className: 's-block s-block--selia-image-grid' },
  'selia-custom-links': { className: 's-block s-block--selia-custom-links' },
  'selia-circle-links': { className: 's-block s-block--selia-circle-links' },
  'selia-double-banner': { className: 's-block s-block--selia-double-banner' },
  'selia-animated-banners': { className: 's-block s-block--selia-animated-banners' },
  'selia-video-gallery': { className: 's-block s-block--selia-video-gallery' },
  'selia-before-after': { className: 's-block s-block--selia-before-after' },
  'selia-dynamic-banner': { className: 's-block s-block--selia-dynamic-banner' },
  'selia-triple-banner': { className: 's-block s-block--selia-triple-banner' },
  'selia-featured-animated-products': { className: 's-block s-block--selia-featured-animated-products' },
  'selia-offers-counter': { className: 's-block s-block--selia-offers-counter' },
  'selia-faq': { className: 's-block s-block--selia-faq' },
  'selia-store-features': { className: 's-block s-block--selia-store-features' },
  'selia-dynamic-product-gallery': { className: 's-block s-block--selia-dynamic-product-gallery' },
  'selia-featured-product': { className: 's-block s-block--selia-featured-product' },
  'selia-testimonials': { className: 's-block s-block--selia-testimonials' },
  'selia-animated-brands': { className: 's-block s-block--selia-animated-brands' },
  'selia-advanced-content': { className: 's-block s-block--selia-advanced-content' },
  'selia-special-offer': { className: 's-block s-block--selia-special-offer' },
/* @selia:config:end */
});

// Singleton for client-side (preserves QueryClient cache across navigations)
// SSR creates fresh instances per request via getRouter()
let clientRouter: ReturnType<typeof createRouter> | null = null;

// TanStack Start expects getRouter() for SSR compatibility
export function getRouter() {
  // On client: reuse existing router to preserve QueryClient cache
  if (typeof window !== 'undefined' && clientRouter) {
    return clientRouter;
  }

  // On SSR or first client load: create new router
  const router = createRouter(routeTree);

  // Cache for client-side
  if (typeof window !== 'undefined') {
    clientRouter = router;
  }

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
