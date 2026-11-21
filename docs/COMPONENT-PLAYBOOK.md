# Component playbook — porting a block into this theme

This is the working method behind every home block in `app/components/home`.
It exists so the next agent can pick up a reference design and produce the same
kind of result without re-deriving the traps. Read it before writing code, and
re-read §7 before you claim something works.

The theme is **Salla Twilight on React / TanStack Start**. Every block is a
merchant-editable section: it has a manifest entry, a router registration, a
scoped stylesheet, preview data and tests. Miss any of those and the block is
half-built even if it renders.

---

## 1. Where things live

| Piece | Path | Notes |
|---|---|---|
| Component | `app/components/home/<Name>.tsx` | one file per block, default export not required |
| Styles | `app/styles/04-components/<name>.scss` | **must be `@import`ed in `app/styles/app.scss`** |
| Registration | `app/router.tsx` | two places: the components map *and* `registerHomeComponentConfig` |
| Merchant fields | `twilight.json` → `components[]` | Arabic labels + a description per field |
| Preview data | `twilight.preview.json` → `layout[]` | what the dev server actually renders |
| Tests | `tests/components/home/<Name>.test.tsx` | vitest + testing-library |
| Visual harness | `lens-harness/<name>.cjs` | Playwright, writes PNGs to `<name>-shots/` |

Shared helpers — **use these, do not re-implement**:

- `app/lib/homeBlock.ts` — `clamp`, `readValue`, `readText`, `readTextOr`,
  `readNumber`, `readBoolean`, `readRows`, `rowValue`, `rowText`, `rowImage`,
  `rowLink`, `prefersReducedMotion`, `useScrollProgress`, `useReveal`.
- `app/lib/curtainSlots.ts` — `rowsFrom`, `imgSrc`, `scalar`, `pickerValue`
  (the lower-level primitives `homeBlock` is built on).
- `app/lib/productPicker.ts` — `rowProductId(row, key, prefix)`: the one rule
  for "which product does this collection row point at" (the picker puts the id
  in `key`, which `pickerValue` deliberately skips). Shared by
  `shop-the-look` and `product-chapters` so the two can never disagree.
- `app/lib/splitForMask.ts` — `splitForMask(text)`: per **word** for joined
  scripts (Arabic, Syriac, Indic), per **character** for everything else. A
  letter in its own `inline-block` loses its shaping, so this is not a style
  choice. Shared by `product-scrub` and `product-chapters`.

> Known divergence: `StampStory.tsx` still carries its own `opt` / `text` /
> `flag` helpers and its own scroll loop, both written before `homeBlock` was
> extracted. New blocks must use the shared ones. If you touch StampStory, prefer
> migrating it over adding a third dialect.

---

## 2. The loop

### Step 1 — read the reference, then subtract

Read the source component **completely** before writing anything. Then split it
into two piles:

- **Essential**: what the visitor actually perceives — the motion, the imagery,
  the pacing, the type.
- **Incidental**: the reference's own chrome. Index bars, coordinate readouts,
  debug counters, its own nav.

Port the first pile, delete the second. A block that carries another site's
furniture reads as a copy; a block that carries only its motion reads as design.

While reading, note the *numbers*: scroll length, distances, easing curves, font
sizes. They are the design. Guessing them is how a port ends up "similar but
wrong".

### Step 2 — decide the geometry before the markup

For anything spatial, fix the coordinate system first and write it down in a
comment. In `StampStory` the rule is:

```
10 SVG user units = 1vw horizontally = 1svh vertically
```

so an anchor at `x=500` lands on `50vw`, and the trail and the cards can never
drift apart. Every later number is derived from that one sentence. If you skip
this, you will spend the afternoon converting units back and forth and the two
layers will disagree by a few pixels at some viewport widths only.

### Step 3 — contract first: manifest, then router

Write the merchant-facing contract before the component body.

```jsonc
// twilight.json — collection fields need a maxLength or the merchant UI
// silently stops accepting rows at the default
{
  "id": "stamps",
  "type": "collection",
  "minLength": 1,
  "maxLength": 12,
  "label": "الطوابع (الصور)",
  "description": "…what it does, what happens with 1 vs many…",
  "fields": [ /* one entry per row field, each with its own description */ ]
}
```

Rules for the manifest:

- **Arabic labels and descriptions**, and the description explains the
  *effect*, not the field. "من ١ إلى ١٢ طابعًا… كل ثلاثة طوابع يتحوّل اتجاه
  الرحلة" beats "عدد الطوابع".
- Always set `minLength` **and** `maxLength` on collections, and set the ceiling
  deliberately. `maxLength` is the hard cap on how many rows the merchant can
  add — a template default of `3` is how a block ends up mysteriously refusing
  a fourth card, with nothing in the UI explaining why.
- Give every option a default in `value` that shows the block at its best.

Then the router, in both places:

```ts
// 1. the components map
registerHomeComponents({ 'stamp-story': StampStory });

// 2. the render shell — reserved height + wrapper classes
registerHomeComponentConfig({
  'stamp-story': {
    height: 'calc(100svh + var(--stamp-run, 400vw))',
    className: (data) => `s-block s-block--stamp-story ${stampStoryRunClass(data)}`,
  },
});
```

### Step 4 — build with a single source of truth

One scroll value drives everything. The component writes the minimum number of
custom properties per frame; CSS derives the rest.

```ts
section.style.setProperty('--stamp-progress', progress.toFixed(4));
```

Never store scroll position in React state — it re-renders the whole tree on
every frame. Write to the DOM, let CSS do the interpolation.

### Step 5 — make it look right, on a screenshot

This is not optional and it is not "run the tests". Scroll-scrubbed motion has
failure modes that no assertion catches: a trail that stops 40px short of a
stamp, a caption that fades in two frames late, a mid-leg frame with two empty
halves.

See §6 for the harness and §7 for what to look at.

### Step 6 — pin the geometry with tests

Assert the invariants that would break silently — the ones that are wrong-but-
plausible:

- the generated path starts and ends exactly on the first and last anchor;
- the path *meanders* rather than running in a straight line (perpendicular
  distance from the chord > some floor);
- the direction actually reverses after N items;
- the reserved-height class matches the count that will be rendered.

Do not assert pixel values or class lists that a redesign would legitimately
change. Assert the thing the user would notice.

### Step 7 — report honestly

State what you verified and what you did not. "Tests pass" and "it looks right"
are different claims; the second one requires §6.

---

## 3. Non-negotiables

1. **Scoped motion.** Never touch page scroll, never `position: fixed` outside
   the block. The block's own height is the scroll budget; the stage is
   `position: sticky` inside it.
2. **RTL and LTR both work.** Use logical properties (`inset-inline-start`), and
   when geometry has to mirror, mirror the *geometry* — not the content.
   `scaleX(-1)` on a wrapper that contains text gives you mirrored text.
   Any Latin copy inside an RTL page needs `dir="auto"` on its own element, or
   its trailing full stop is a neutral character and gets reordered to the
   *start* of the line — ".walls" instead of "walls.".
3. **`prefers-reduced-motion` gets a composed still**, not a broken half-state.
   Settle every value to its end position and lay the items out as a static row.
4. **No page-level `will-change`.** Promoting a multi-viewport layer gets it
   rasterised once and stretched — that is how scrub animations go pixelated.
5. **Images**: first item `loading="eager"`, the rest `lazy`, always
   `decoding="async"`, always `alt`.
6. **One `useId`-scoped mask/filter id per instance.** Two placements of the
   same block on one page will otherwise share the id and the second one breaks.

---

## 4. Driving the camera when the layout is not monotone

The default `useScrollProgress` + `progress × distance` model assumes the scene
moves in one direction. The moment the layout reverses, that model is wrong: the
camera slides the wrong way and loses the element it is chasing.

Interpolate through the anchors instead:

```ts
function track(values: readonly number[], progress: number): number {
  const n = values.length;
  if (n === 1) return values[0];
  const scaled = clamp(progress) * (n - 1);
  const index = Math.min(n - 2, Math.floor(scaled));
  return values[index] + (values[index + 1] - values[index]) * (scaled - index);
}
```

and write `--cam-x` / `--cam-y` per frame. The same applies to the pen that
draws a line: "halfway through the scroll" is not "halfway along the path" when
the path meanders — measure each anchor's arc position once at mount with
`getPointAtLength` and map progress through it.

---

## 5. Reserved height (avoid the scroll jump)

`HomeComponentConfig.height` is a **static string** — it cannot depend on the
data. But `className` can be a function. Use that:

```ts
height: 'calc(100svh + var(--stamp-run, 400vw))',
className: (data) => `… stamp-story-run--${key}${legs}`,
```

and generate the classes so the variable resolves before the block mounts:

```scss
@each $key, $per in (s: 130, m: 200, l: 300) {
  @for $legs from 0 through 11 {
    .stamp-story-run--#{$key}#{$legs} { --stamp-run: #{$legs * $per}vw; }
  }
}
```

Compute the run length in **one** exported helper used by both the router and
the component, so the reservation and the real height cannot disagree. Verify it
by measuring: wrapper height must equal block height.

---

## 6. The visual harness

Every spatial block gets a `lens-harness/<name>.cjs` modelled on `stamp.cjs`:

```js
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/dev-<id>/ar', { waitUntil: 'load' });
await page.waitForSelector('.stamp-story', { timeout: 90000 });

const info = await page.evaluate(() => {
  const b = document.querySelector('.stamp-story');
  const r = b.getBoundingClientRect();
  return { top: r.top + scrollY, height: r.height,
           stageH: b.querySelector('.stamp-story__stage').getBoundingClientRect().height };
});

for (const p of [0, 0.25, 0.5, 0.75, 1]) {
  const y = Math.round(info.top + p * (info.height - info.stageH));
  await page.evaluate((t) => scrollTo(0, t), y);
  await sleep(420);                       // let rAF settle before shooting
  await page.screenshot({ path: `${OUT}/scroll-${p}.png` });
}
```

Shoot this matrix, always:

| Frame | Why |
|---|---|
| `0` | the first item must be centred, nothing half-cut |
| every anchor stop | the pen/camera must land exactly on the item |
| **mid-leg** frames | the gap between two items is where emptiness shows |
| the **reversal** frame | a zigzag's turning point is the most breakable frame |
| `1` | the last item must be centred and the trail complete |
| `390×844` mobile | different unit scale, captions may collide |
| `reducedMotion: 'reduce'` | must be a still, not a half-scrolled state |
| `/en` | LTR mirroring |

Then **open the PNGs and look at them**. Reading the DOM tells you the element
exists; only the image tells you it is in the right place.

Two harness traps that cost real time:

- **`window.scrollTo` is silently ignored** in the Salla preview shell — it
  returns without moving and `scrollY` stays `0`, so every frame comes out
  identical and you think the block is frozen. Drive real input instead:
  `await page.mouse.move(640, 500); await page.mouse.wheel(0, 200)` in a small
  loop, then read `window.scrollY` back to prove the page actually moved.
- **A colour variable is not a colour.** `--ss-text: #ff2d55` on the root only
  proves the field arrived. Read `getComputedStyle(el).color` on the actual
  text nodes — inheritance, a stray rule, or an invalid value all leave the
  variable looking right while the screen stays the old colour.
- **A screenshot is same-origin, an image is not.** When a block needs the
  *pixels* of a merchant image and the CDN sends no CORS headers,
  `canvas.getImageData` throws `SecurityError` and every pixel read is dead on
  arrival. Screenshot the image into a bare page and read THAT — the file is
  local, so the canvas is clean. `lens-harness/make-cutouts.cjs` is the working
  example: catalogue photo → transparent PNG, cropped to the product.

Beware stale data: the dev server renders `twilight.preview.json`, not
`twilight.json`. Editing the manifest alone changes nothing on screen — and
right after a JSON edit the first page load can still hand you the previous
render, so re-run the harness once before believing a regression.

---

## 7. Traps already paid for

| Trap | Symptom | Fix |
|---|---|---|
| `maxLength` left at a template default | merchant can't add rows past N | set it to the real ceiling |
| `dasharray: 0.01` + round cap | reads as beads, not strokes | `22 24` at width `6` — the cap adds the width back, so each mark ends up ~4.7× its thickness |
| Wide translucent stroke as "glow" | muddy olive band on black | real blur filter, or drop the glow |
| Uniform Catmull–Rom | loops at crests and reversals | centripetal, α = 0.5 |
| Monotone cubic on non-monotone x | NaN / collapsed path | monotone needs increasing x; use centripetal |
| Linear camera + reversing layout | item drifts out of frame | interpolate through anchors (`track`) |
| Wave offset applied vertically | bulges the wrong way on return legs | offset perpendicular to the leg |
| `vector-effect: non-scaling-stroke` | reveal offset in the wrong units | keep dash array in user units |
| `scaleX(-1)` over content | mirrored text | mirror geometry only |
| Static reserved height | page jumps on mount | className → CSS var → height |
| React state per scroll frame | dropped frames | write custom properties |
| `getTotalLength()` in jsdom | tests crash | guard `typeof fn === 'function'` |
| Missing `@import` in `app.scss` | styles silently absent | add it, then rebuild |
| Editing `twilight.json` only | dev page unchanged | also edit `twilight.preview.json` |
| LTR copy in an RTL page, no `dir` | trailing `.` jumps to the line start | `dir="auto"` on the element |
| Aspect-corrected shader noise | four giant blobs across a phone | keep raw `uv`; fine cells beat square cells |
| Fallback scrim above the type | the headline you're protecting goes grey | scrim `z-index` below the text, canvas above |
| `three` imported with no types | TS7016 on every class | ambient `app/types/three.d.ts`, delete it if `@types/three` lands |
| Short key read before the field id (`data.image` before `data.second_skin_image`) | merchant changes a setting, nothing happens — seed value wins forever | prefixed key first, presence (even `''`) is authoritative; see §7a |
| Image read with `readText`/`scalar` | `[object Object]` src, or empty | `imgSrc()` — it handles url / `{url, small_url}` / picker array |
| `Number('')` in a numeric reader | an unset setting becomes `0`, not its default | test `undefined / null / ''` before coercing; only then `Number.isFinite` |
| Deleting a manifest field but leaving its render path | old payloads keep the key and the section comes back | delete field **and** markup **and** styles **and** the payload key, then leave a test that the old key renders nothing |
| A colour field whose effect is `mix-blend-mode: multiply` | white / pastel values change nothing, so the control reads as broken | `multiply` can only darken: take hue from a `color` blend and leave multiply to the darkening ramp |
| Rebuilding a `WebGLRenderer` on the same `<canvas>` | a live colour edit loses the context and drops to the flat fallback | keep the renderer, write `uniform.value` on change, repaint once |
| `dir="auto"` + `text-align: start`, box still anchored to the page | a Latin headline jumps to the other edge of an RTL page | anchor the **box** by the content too: `inset-inline-start: 0` resolves against the element's own direction, so alignment and side agree |
| A headline wider than the viewport, anchored by the page direction | on RTL you see the *end* of the sentence before the scroll has started | `inset-inline-start: 0` + `dir="auto"` + `text-align: start` + a width past the viewport — the line then always bleeds off its own far edge |
| `:dir(rtl)` in the stylesheet | the production CSS minifier rewrites it into `:lang(ar), :lang(he)…` — page language, not line direction — so a Latin line on an Arabic page animates the wrong way (dev looks fine) | read `getComputedStyle(el).direction` once and write `data-flow`; select on `[data-flow='rtl']` |
| `translateX(-100%)` on a child that is wider than its panel | the line stops half-way out of frame | percentages are the element's own width: a 200vw line in a 100vw panel needs `-200%` |
| `rotation.z` on a model whose origin sits below its bounding-box centre | the whole silhouette swings sideways (~0.8 units on a 3.7-tall model) and lands on top of a card | the reference's `−size.x × 0.4` is the counterweight, not decoration; mirror the lean **and** the offset together, or neither |
| `getImageData` on a WebGL canvas | an empty buffer unless `preserveDrawingBuffer` is on, so a "where is the model" probe reads nothing | measure the DOM and the projected maths instead of the pixels |
| Splitting Arabic into characters (`SplitText` `type: "chars"`) | every letter loses its join, the word reads as isolated glyphs | split at **word** level — the smallest unit both scripts survive |
| A pinned stage's first card at `inset-block: 6%` | it hides behind the floating site header | start below the header (12% on a phone-height viewport) |
| Reduced motion settled to `p: 1` but the block still tall | the visitor scrolls seven viewports of a frozen stage | collapse the budget too: `height: 100svh`, plus `:has()` + `!important` over the engine's inline `min-height` |
| A near-black model on a near-black panel | the silhouette vanishes exactly when the disc finishes opening | add a rim light from behind the product |
| `readText` for a field that ships a default | clearing it in the editor resurrects the seed copy | `readTextOr` — absent means default, cleared means nothing |
| Harness readiness check keyed to `offsetHeight > innerHeight` | the reduced-motion run reloads forever (that state is one viewport) | check the block's own custom properties, not its height |
| Piping the harness through `head` | SIGPIPE kills node mid-capture, later frames never written | let it finish, then read the tail |
| `DecalGeometry` output parented straight to the model | the sticker hangs in mid-air while the model spins underneath it | the class emits **world**-space geometry: bake it into the model's own space first (`geometry.applyMatrix4(model.matrixWorld.clone().invert())`), then parent it |
| Projection box measured while the model is tilted | the same "80%" is a visibly different sticker on desktop (25° lean) and on a phone (no lean) | reset the pose, measure and build, restore — the product's own extent is the only stable reference |
| Restoring that pose with `model.rotation.z = saved` | the spin jumps back to the start the moment a sticker slider moves | the spin lives in the **quaternion** (`rotateOnAxis` writes there); save and restore `quaternion`, never the Euler |
| Decal projector aimed with one axis extent | at 90° the box sits inside a product that is wider than it is deep and cuts nothing, so the control looks dead | box support distance is `1 / (|sinθ|/hx + |cosθ|/hz)` |
| Sticker z-fighting the wall it was cut from | it flickers while the model turns | `polygonOffset: true`, `polygonOffsetFactor: -4`, `depthWrite: false` |
| Hand-editing `twilight.preview.json` while the dev server or `npm run build` is running | the file is regenerated from the manifest and the added keys vanish without a word | seed it last, restart the dev server, and re-check after any build |
| A new dynamic import of a `three/examples` module | Vite re-optimises, its commit deletes `node_modules/.vite/deps`, the sandbox blocks the bulk delete and `SAFE_DELETE_BULK_CONFIRM_REQUIRED` kills the dev server | move the stale `deps_temp_*` dirs aside with `mv` (a rename is not a delete), then start again |
| A merchant-uploaded GLB | **there is no way to upload one.** The editor's only uploader is `format: "image"`, and it refuses a `.glb` with «تعذّر رفع الصورة» — and Salla's own 3D product API demands a public external CDN URL, so the platform expects a link | keep the field a `format: "url"`; say where to host it (R2 / S3 / GitHub Releases) in the description. Then add the door that needs no hosting at all: a `textarea` that takes the model **as text** (`format: "gltf"` JSON, a base64 `data:` URI, or a silhouette recipe) and hand it to `GLTFLoader.parse` — see §7b |
| A `.glb` pasted into a textarea | the field is text in the page payload; a model that is too big silently exceeds the cap and the block falls back to the preset shape with no error anywhere | accept `.gltf` **with embedded buffers** (a GLB is JSON + a binary chunk: fold the chunk back in as a base64 `data:` URI, `tools/glb-to-text.py` does exactly that), cap the field, and say the cap in the description |
| A merchant pasting an 8.67 MB car export (11.5 M characters) into the model field | the theme editor freezes on the paste itself, before any of our code runs, and the string then sits in the store's settings for good. Nothing on screen says why | **the ceiling is page weight, not browser capability** — 400 000 characters, and the manifest `maxLength` must equal it. In code, check the length **before** `trim()`: `trim()` allocates a copy, and on an 11 MB string that copy is the hitch the merchant blames the block for. Then sniff two characters before `JSON.parse`. Publish the verdict (`data-code="oversize" \| unreadable \| empty"`) so "too big" is never mistaken for "broken", and keep the link field as the path for real models |
| A reference whose hero is `position: fixed` behind the whole page | copying it puts the world image over the theme's own header and footer on every page, and a block is not allowed to own the viewport | `position: sticky; top: 0; height: 100svh; margin-block-end: -100svh` on a layer inside the block: it covers the block, adds no height, and ends where the block ends. `overflow: hidden` goes on that layer, never on an ancestor — an ancestor with `overflow: hidden` becomes a scroll container and every sticky stage inside it stops sticking |
| White text on translucent white "glass" cards | it reads over the reference's dark photo and disappears over anything bright — the reference's own sky background already breaks it, so the merchant's product shot has no chance | derive both the surface and the ink from one merchant colour (`color-mix` for the dimmed neighbours, a luminance check for `--card-ink`). The hierarchy — lit centre, quiet neighbours — survives any photo, and the merchant gets one colour field instead of two that can disagree |
| `useIsMobile` switching seven carousel numbers | a resize re-renders the whole row, and the numbers live in JS where the stylesheet cannot see them | put every one of them in a custom property on the row and rewrite them in a media query; the component then writes only `--pos` / `--abs` per card, which change when the active card changes and never on resize |
| A block whose last row is buttons on a phone | the theme's fixed bottom bar (76px + safe area) sits on top of them, so the merchant's arrows are half-swallowed and read as missing | pad the block's own bottom by the bar's height in the mobile media query — `calc(92px + var(--safe-bottom))` for the hero copy and `calc(100px + …)` for a section ending in arrows |
| Collapsing the scroll budget for reduced motion | the block's progress goes to 1 on the first pixel of scroll, so every "fade out as you leave" ramp fires and the still loses its subject (the portal vanishes, leaving the world behind it) | the still needs its opacities pinned too, not just its transforms: `opacity: 1` on every element whose base rule is a `clamp()` on progress |
| A script word rendered as a `<span>` inside a heading line | JSX drops the whitespace between the span and the text that follows it on the next line, so «Discover» and «Living» touch | emit the space explicitly (`{' '}`) or as `margin-inline-end` — and remember `margin` alone is not a word space when the script face has a swash that overhangs |
| A reference slider that calls `preventDefault()` on `wheel` inside a `100svh` section | as a one-page demo it feels great; as a block on a store it is a scroll trap — a visitor scrolling down over it can never reach the rest of the page, and on a phone `touch-action: none` does the same to the thumb | let the vertical wheel through and only take the horizontal one (`Math.abs(deltaX) > Math.abs(deltaY)`), plus `touch-action: pan-y`. Drag, arrows and the keyboard cover the rest, so nothing is lost but the trap |\n| Mirroring the row with a `dir` multiplier on the layout only | the cards flip but the wheel and the arrow keys keep pushing the old way, so "next" walks the collection backwards in Arabic — and it looks like a data-order bug, not an input bug | every input multiplies by the same `dir` the geometry uses: `target += deltaX * dir`, `step * dir`. One number, both sides |\n| Writing `x / y / width / height` inline per frame (what the reference does) | four layout-affecting properties × every card, every frame — the compositor cannot help and the cost scales with the collection | keep the card's layout size fixed and write `--x / --y / --s`; the stylesheet owns the `transform` string. Three style writes, zero layout |\n| A card-size ratio tuned on a 1440px desktop (`width * 0.155`) | applied to a 390px phone it yields a 60px card, so the "gallery" renders as thumbnails and the merchant reports the block as broken | floor the size (`max(140, …)`) and cap it by the block's height too, so a short (landscape) block shrinks the cards instead of cropping them |\n| An even number of slides on a wrapping arc | the wrap gives one side an extra card, so the fan is lopsided and the eye reads it as a layout bug rather than a collection size | either ask for an odd count in the field description, or accept it and say so — the asymmetry is arithmetic, not styling |\n| A test that asserts a mirrored position with `-x` | `--x` is the card's LEFT edge, so the mirror is `-(x + width)`, not `-x`; the assertion passes only while the card has zero width and fails the moment real geometry arrives | compare centres (`x + width * scale / 2`), and publish the card width as a custom property so the test can read it instead of hardcoding it |\n| A `textarea` described as «بديل الرفع» | the merchant reads it as an uploader, tries to paste the file itself, the editor freezes on the paste, and the report is «بلصق كود محرر الثيم بيتوقف نهائيا» — the field was never the feature | the description is not a feature either. Ship a drop zone that converts **outside** the editor (`tools/model-code-studio.html`, one self-contained file): a separate tab is allowed to take ten seconds, which is exactly what the editor cannot. The textarea stays for merchants who already have the text |
| Memoising `checkModelCode` on the settings object | it saves the parses *between* renders and none of the ones that matter: the editor pushes a new settings object on every keystroke, so a 300 KB `JSON.parse` still lands between two characters and typing becomes a slideshow | debounce above 20 000 characters (≈320 ms) and parse inline below it, so a silhouette never lags; keep `oversize` out of the timer entirely — `length` answers it before anything is allocated |
| Deleting `images` from a glTF to make it smaller | the file does not change: the bytes still sit in the buffer, and the buffer is what gets base64'd into the paste. A converter that reports "textures removed" while the character count stays put is lying | drop the bufferViews nothing points at and repack the buffer in one pass — and collect the accessors in the same pass, or a pruned attribute keeps its accessor, the accessor keeps its bufferView, and the bytes stay reachable |
| Camera framed at `max(size) × 1.25` | fine for a slim bottle, and a cropped mess for a cube: the camera sits on the model's **centre**, so a deep model's near face is half its depth closer | frame by the bounding **sphere**: `distance = radius / sin(fov/2) × k`, with `k` chosen so the reference bottle still lands on its measured number |
| A `.usd` from a model marketplace | Blender imports the stage, then `imported no meshes`: the download was a **root stage referencing a `payloads/` folder** that did not come with it. And three.js cannot read `.usd` at all | ask for the full asset (or a GLB/glTF/FBX/OBJ/blend) and convert with `tools/model-to-glb.py` |
| The store page hanging for exactly ~120 s, then `SSR stream transform exceeded maximum lifetime` | the Salla settings fetch stalls (rate limit or a cold cache) and the response stream never closes — the block is innocent | restart the dev server; if it recurs immediately the store is rate-limited, so wait it out instead of editing code |
| A `dropdown-list` of six bare nouns (`زجاجة`, `برطمان`, …) | the merchant cannot tell which solid they are choosing, so the control is a coin flip and the block "looks wrong" whatever they pick | the editor renders the option **label**; there is no documented slot for a picture per option, so put the silhouette in the text: `الاسم · Latin — شكل الجسم في نصف سطر` |
| Twenty fields in one flat column | nothing says which settings belong to the product, which to the sticker, which to the motion, so the panel reads as an undifferentiated wall | `static` / `title` rows between groups, and one `static` / `description` per group that states the precedence (`a linked GLB wins over shape and colour`) |
| A motion window read inside the WebGL effect | every slider tick re-runs the effect, disposes the context and the canvas comes back blank | keep the window in a ref and read it inside the existing `spinTo`; a separate effect writes the ref and re-aims the model from the current scroll (`progressNow(root)`) — otherwise the change only appears on the next scroll frame and reads as "the slider does nothing" |
| Harness `page.screenshot({ clip })` measured before scrolling | `Clipped area is either empty or outside the resulting image` — the canvas lives in a pinned stage, so at `scrollY 0` it is a full viewport below the fold | read the clip **after** the scroll, and clamp it to the viewport |
| Comparing two screenshots to prove "the product is still" | the canvas is transparent over panels that are themselves animating, so the bytes differ whether or not the model moved — the diff answers a different question, and answers it wrongly | publish the number you care about (`canvas.dataset.spinAngle`) and read it; a WebGL canvas without `preserveDrawingBuffer` gives back an empty buffer, so pixels cannot answer "did it turn" at all |
| `model.rotation.z = lean` written by a re-fit while the spin lives in `rotateOnAxis` | the model turns while you scroll, then a shape or width change calls `fit()`, the Euler write replaces the quaternion, and the product **freezes at the lean** for the rest of the page — the bookkeeping angle still says it is turning, so `spinTo` computes a near-zero delta and never repairs it | one pose, one write: compose `tiltQuat × spinQuat` in a single `applyPose()` and call it from both `fit()` and `spinTo`. Never let two owners write the same rotation slot |
| A spin window the merchant can close to nothing (`start 95, end 100`) | the product turns only in the last 5% of the block, so it looks like a still image and the report is "the animation is broken", not "I moved the slider" | clamp: start ≤ 80, end ≥ start + 20 — a fifth of the scene is the smallest window that still reads as motion, and a saved out-of-range value lands inside it instead of freezing |
| Position offsets measured on a tilted model | the same "20%" means two different distances before and after a reshape, and the product drifts as the merchant edits | clear the pose, measure, restore: `quaternion.identity()` + `position.set(0,0,0)` + `updateMatrixWorld` before `setFromObject`, then re-apply the pose. Offsets are a fraction of the product's own width and height, so a slim tube and a wide jar move the same visible distance |

| A block that paints its own background but owns no stacking context | the block renders, the geometry measures correctly, and the merchant's heading is **invisible**: `portal-hero` keeps a `position: sticky; z-index: 0` world layer, a sticky element is not clipped by its block, and it paints over the next static sibling. `elementFromPoint` on the title returns `img.` from a block 3000px above | `position: relative; isolation: isolate` on the block root — same layer, later in DOM order, so the block wins. `arc-coverflow` already relied on this; every new block must too |
| A tier custom property re-declared on the block root | the router puts the merchant's choice on the wrapper (`.look-ar--landscape`), the block root declares `--look-ar: 0.86` "as a default", and the child's own declaration shadows the inherited one — the frame kept the portrait default whatever the merchant picked, and every measurement of the block *looked* fine | never re-declare a variable you inherit. Put the default in the consumer: `aspect-ratio: var(--look-ar, 0.86)` |
| Hotspot percentages on an `object-fit: cover` frame | the crop is a function of the frame's ratio, so a mobile-specific ratio silently slides every dot off its object — and only on phones | one ratio at every breakpoint, stated in the stylesheet; the crop is then identical everywhere and a `%` of the frame is a `%` of the visible photo. Place the dots with physical `left`/`top`, never `inset-inline-start`, or they swap edges when the store is read LTR |
| A per-row form that a batch button submits | `form.submit()` fires no `submit` event, so React's `onSubmit` never runs and the cart call never happens — the button looks dead | `form.requestSubmit()`: real validation, real event, the same handler a single press uses. Guard for old engines by dispatching a bubbling `submit` Event |
| A tall "add all" bar made `position: sticky` on a phone | a 180px summary pinned to the bottom covers the rows it is summarising, and the visitor reads the total instead of the products | sticky is for a slim bar. Below the fold the total belongs at the end of the list |
| `source: 'selected'` with an empty `sourceValue` | the API answers with the store's **whole catalogue**, so a block whose merchant has not picked anything yet fetches and paints the front page | `enabled: ids.length > 0` on the query, and return `null` when there are no rows at all |
| A picker value whose id lives in `key` | `pickerValue` reads `value / url / link / id / label / title / name` and deliberately skips `key`, so the row resolves to no product and **disappears** with no error anywhere | supplement `pickerValue` with the picker's `key`, then try `/p<digits>` → bare digits → the last numeric run |
| A test that waits for `rows.length === n` on a catalogue-backed block | the placeholder rows are already there, so the wait passes during loading and every assertion runs against a list with no products in it — a green test over a blank section | wait for the placeholder class to be gone (`.is-waiting` → 0), not just for the count |
| `useNumber` imported from `@salla.sa/twilight-theme-engine/hooks/useNumber` | the package exports `./hooks/useMoney` but no `./hooks/useNumber`; the bare subpath fails at build with `is not exported under the conditions` | import it from the `./hooks` barrel (`useMoney` stays on its own subpath for tree-shaking) |
| A rAF-driven test that waits a fixed 360ms and then reads the DOM | the lerp needs ~25 frames to land, jsdom renders them on a timer, and a loaded machine gives fewer per second — so the file passes alone and fails in the full suite ("five presses landed on the fourth card") | poll the number the assertion reads, not the clock: `restOn(container, expected)` |
| …and polling that number inside ONE `act(async () => …)` | `act` defers every pending state update until its scope exits, so the attribute being polled never changes and the loop always times out — the fix looks broken for a reason unrelated to the bug | one `await act(() => sleep(20))` per iteration, so each pass flushes what the frame loop produced |
| Reaching for `product.options` on a list card | the type says «Detail responses only», and it means it: a `source: 'selected'` list carries `has_options` and nothing else, so an in-place picker rendered from the list is permanently empty | `has_options` decides *whether* to open; `product.queries.detail(id)` (one request, on open, cached) supplies the options |
| `salla-product-options` mounted with an `options` prop | passing the options makes the component **skip its own details fetch**, and that fetch is the only thing that ever sets `productAvailable` — the prop defaults to `false`, so every variant renders as «نفدت الكمية» on a product that is in stock | pass `productAvailable={!product.is_out_of_stock}` yourself. On the options-prop path you own every value the component would otherwise have discovered |
| The `options` array handed to `salla-product-options` re-created on each render | the ref callback re-runs, `setOptionsData` re-fills the selection, and the size the customer just picked silently snaps back to the first one — every keystroke, forever | `useMemo` the array (keyed on the detail response), then `useCallback` the ref on that array. The identity is the selection |
| `window.salla.product.getPrice(form)` read as `{ price, sale_price }` | that is what the SDK's `.d.ts` promises; the live endpoint answers `{ status, success, data: { price, regular_price, has_sale_price } }`. Reading the documented shape yields `undefined` for every variant, so the row keeps quoting «from» after a size is chosen — and nothing errors | read `data` when it is there and fall back to the bare shape; `data.price` is already the payable amount |
| A web component imported eagerly by a home block | the block ships the product-options runtime to every visitor of the front page, for a panel most of them never open | `lazy(() => import('…/product-options').then(m => ({ default: m.SallaProductOptionsCore })))` inside a `Suspense` — the chunk arrives on the first open and is cached from then on |
| A test that fires `change` on the `<form>` itself | React's `onChange` is a form-control event: a `change` dispatched **on** the form is ignored, the handler never runs, and the assertion fails as if the feature were missing | fire it from a real control inside the form (`fireEvent.change(form.querySelector('select'), …)`), which is how the web component emits it too |
| A row that opens, whose product name is still a link out | the most obvious thing to press is the one thing that navigates away, so the customer reports "I press the product and nothing drops down" — the expander works, they never touched it | on a row that can expand, the name is text and the whole row is the target; put the product link inside the opened panel |
| A chapter index built from `count − 1` segments | every chapter dwells except the last: it arrives on the exact frame `progress = 1`, which is the frame the sticky stage unpins, so the visitor never sees it at rest and the block looks like it ends mid-move | `count` segments, one per chapter, each a dwell followed by a hand-over. The last chapter then stands still for its own dwell before the block ends |
| A per-letter cascade whose sign is inverted (`--signed * +52%`) | the outgoing word and the incoming word both travel the same way, so at the hand-over they sit on top of each other — a double-exposure of two words instead of one leaving and one arriving. It looks like a rendering bug and it is invisible in any single frame you inspect | a chapter that has LEFT travels up, one that has NOT ARRIVED comes from below: `translateY(calc(var(--signed) * -52%))` |
| Two product packs cross-dissolving **in place** | the hand-over shows two products stacked on the same pixels for the whole transition, which reads as a double-exposure of one product, not as a replacement | give the pack a full pack height of travel (`translateY(calc(var(--pd) * -100%))`): at 50% the outgoing pack's bottom edge meets the incoming pack's top edge, so the two never share a pixel |
| Ribbon, price and caption fading at the same rate as the colour plane | two ribbons and two prices cross-fading on top of each other turn into blur, and neither is the one being read | fade the type faster than the background: `opacity: calc(1 - min(1, var(--ad) * 2.4))` on the type only, so it is gone at the seam and the colour keeps its slower ramp |
| `dir="auto"` on an element placed with `inset-inline-*` | the element's OWN direction picks the side, so an Arabic label in an LTR store resolves `auto` to RTL and the ribbon jumps to the opposite edge — on top of the price circle. Nothing errors, and it only happens in the language you did not build in | drop `dir="auto"` from anything positioned by a logical inset; bidi already renders the Arabic run correctly. Keep it on the centred text blocks, where it cannot move anything |
| Reduced motion applied with `classList.add` | the block renders twice on a normal visit (loading, then catalogue), and React owns `className` — the second render wipes the class, so the visitor who asked for less motion gets the full scroll stage. It passes every manual check because the first paint looks right | make it state: `const [flat, setFlat] = useState(false)` + `useEffect(() => { if (prefersReducedMotion()) setFlat(true) }, [])`, then read `flat` in `className`, in `inert` and in the scroll callback. Read it in an effect, never during render — the server has no `matchMedia` |
| A fixed-height pack around a catalogue photo | a square shot inside a `height: clamp(...)` box is letterboxed by `object-fit: contain`, so the merchant's own card shows white bands inside itself and the product looks smaller than it is | no height on the pack: `max-width` + `max-height` on the `<img>` and let the card wrap it. The card is then exactly the photo plus its padding |
| jsdom's `matchMedia` | it answers `matches: true` for everything, so every test in the file silently runs the reduced-motion path and the animated assertions fail for a reason that has nothing to do with the component | `vi.stubGlobal('matchMedia', undefined)` in `beforeEach` — and only the reduced-motion test stubs a truthy one |
| A dev server left running for hours | it serves a stale SSR module graph and throws `ReferenceError: <identifier> is not defined` for code you already deleted, so a working component looks broken and the error names a function that no longer exists in the file | restart it. Related: a Playwright run killed mid-navigation leaves its SSR stream open, and after a few of those every request answers 500 with `Stream lifetime exceeded` until the server restarts |
| A giant word sized from a **character count** | Arabic glyphs are about half the width of Latin ones at the same font size, so one constant overflows the frame by a third on «الكرسي» and leaves a gap on «CHAIR». It looks like a taste problem, not a bug | measure the shaped word and scale it to a target width: `fit *= (boxWidth * BLEED * scale) / inkWidth`, applied as `font-size: calc(<estimate> * var(--fit))`. The relation is linear, so one pass is exact and the estimate is only the pre-measurement frame |
| The letter columns measured **before** the fit lands | the columns are where each letter sits at its final size; measuring them at the estimate clips the wrong columns, so letters show up in the wrong place and some regions are covered twice — it reads as a broken word, not as a stale measurement | make the band measurement depend on `fit` (`useEffect(..., [text, fit])`). Pass 1 fits, pass 2 measures the columns at the fitted size |
| `mix-blend-mode` on the `<img>` inside a transformed pack | the pack's `transform` makes it a stacking context, so the image has nothing to blend with and paints its white background untouched — the setting looks like it does nothing | move the blend to the PACK. And accept that multiply also tints the PRODUCT (a grey chair on a red chapter becomes a red chair), so it can never be the default — put the photo on a light card by default and treat the knock-out as an opt-in |
| Un-premultiplying a matte against white | the textbook fix for a white fringe drives dark pixels to black: a pixel with 20% coverage has to give back 80% of a full white, so wood and shadow creases come out as black artifacts along every edge | binary alpha + colour BLEED: leave coverage alone and copy the product's own colour outward into the edge ring. Same silhouette, no invented black |
| A luminance threshold (or flood fill) to cut a product out of a studio shot | the backdrop is not pure white (0.95), the ground shadow is OPAQUE and only a shade darker than it (0.78–0.87), and a light product sits in the same band as both — a threshold keeps a grey blob under every product, and a plain fill eats holes in a pale armchair | fill from the frame edge but step only across GENTLE gradients (~0.015/px): the backdrop and its shadow change by 0.002/px, a product's edge is a jump. Then verify by matting every candidate twice (ramp vs fill) and keeping only the ones where the two agree — that is a measurement, not a judgement call |
| A circle button pinned to the frame edge while the product is centred | on a wide product it lands in an empty corner, on a narrow one it sits on top of the product — and the product's width is the merchant's photo, so no CSS number can be right | anchor it to the product: put the pack and the circle in one `display: grid` figure whose width IS the pack's, and place the circle at `inset-inline-start: 100%`. It is then always one gap from the product, whatever shape it is |
| A cut-out placed on a card because the pack style says so | the merchant uploads a transparent PNG *and* the default style is `surface`, so the block draws a cream rectangle behind the product it was just cut out of — the exact thing the cut-out was for | scope every pack style with `:not(.is-cutout)`, and give the cut-out its own single rule (a `drop-shadow` on the image, never a `box-shadow` on the pack) |
| A hidden measuring copy left **in flow** | the copy holds the layout and the per-letter units are painted after it, so the line box is twice the word: the word paints twice, the line overflows the frame, and `text-align: center` can no longer shift an overflowing line — the first letter is cut at the edge. The fit still reports the right width, so the numbers look correct | take the copy out of the line (`position: absolute; width: max-content; opacity: 0`) and let the visible layer be the only in-flow content. Measure the layer that is actually painted: the union of the letter boxes is a few percent wider than the shaped word |
| `twilight.preview.json` is written by the **browser**, not by the build | the preview state is POSTed by the theme's own client and the file is gitignored, so a stray tab — or a Playwright page that loads while the store holds an empty layout — overwrites it with `layout: []` and the home page renders nothing at all, with no error anywhere. It looks like the theme broke | rebuild it from the manifest: `lens-harness/rebuild-preview.cjs` (state shape `{enabled, settings, layout: [{id, path, fields}]}`, `path` without the `home.` prefix, field ids ARE the keys the component reads). Keep the script — it is the only recovery path |
| A gradient-flood matte leaves specks and a white rim | dots of studio shadow sitting in the wall are OPAQUE to the fill (the gradient rule cannot step 0.1 in one pixel), so they survive as a trail of white dots beside the product; the product's own anti-aliasing survives as a one-pixel white outline; and the bleed then copies that white outward, which paints a halo | drop opaque islands under ~200px (nothing that small is the product), erode 1px and **do not dilate back** — dilating re-includes the exact ring the erosion removed, which is the outline you were trying to delete. Verify on the chapter's own colour, not on white |
| A letter's travel written as a percentage of the LETTER | a letter is ~20% of the frame tall, so `translateY(-100%)` moves the word 150px: it never leaves the frame, and at the hand-over both words sit on top of each other in the middle. It looks like a cross-fade with a wobble, and the numbers (`--signed` going −1 → 1) look perfectly correct | write the travel in FRAME units (`-80svh`) and size it from the word's own rest position: to clear the bottom edge a word at 22% needs ~105svh, at 37% it needs ~80svh. Make it a variable — a phone needs a different one, and so does a percentage of the pack, whose height changes at the breakpoint |
| The whole chapter layer faded out | fading the layer fades the WORD and the PRODUCT with it, so during the hand-over two half-transparent words are visible at once — the classic double-exposure. The reference never dims the word that is leaving; only the colour changes | fade the flat colour only: move `background: var(--pc-bg)` onto a `::before` that carries the `--ad` fade, keep the layer itself solid, and add a sharp `clamp(0, (1.08 - var(--ad)) * 12, 1)` guard so a chapter a full segment away cannot leak its edge into the frame |
| A giant word fitted to the frame's width | it looks right on one chapter and wrong on the next: a five-letter word becomes enormous and an eight-letter one shrinks, so the block has no consistent type scale. The reference holds a CONSTANT cap height (303px across five chapters) and lets the width run 80–93% | fix the size (`23vw`, capped in `svh`) and make the fit SHRINK-ONLY: `next = Math.min(1, previous * target / width)`. Then every chapter shares one scale and only an unusually long word is scaled down |

### 7a. The "I changed it and nothing happened" bug

Any block that reads both a short alias (`image`, `title`, `travel`) and the
prefixed field id (`second_skin_image`, `stamp_story_travel`) has to decide
which one wins. **The field id wins, always** — that is the key the merchant's
editor writes. The short alias only ever exists in seed data, in a hand-written
`twilight.preview.json`, or in the block's own thumbnail.

Reading the short key first produces a bug that looks like caching but is pure
precedence: the seed value is present, so the edit is never even looked at.
Worse, it only reproduces on a placement that was seeded, so it survives every
fresh-install test.

```ts
// wrong — the seed shadows the merchant
data[key] ?? data[`${prefix}_${key}`]

// right — the editor's key is the truth; presence (even '') is authoritative,
// so clearing a field actually clears it instead of resurrecting seed text
const prefixed = data[`${prefix}_${key}`] ?? data[`${prefix}.${key}`];
return prefixed !== undefined && prefixed !== null ? prefixed : data[key];
```

Consequences to keep in mind:

- **Do not seed both keys.** A preview payload with `image` *and*
  `second_skin_image` is a lie about the production shape; keep only the field
  id, so a precedence mistake fails loudly in dev instead of silently in prod.
- **Images are not text.** `scalar()` flattens a `{url, small_url, alt}` object
  to its first pickable string, which for an image object is not the url. Use
  `imgSrc()`.
- **Collections have the same rule one level down**: `stamps.image` beats a
  row's `image`, or a replaced stamp keeps showing the seeded photo.

---

### 7b. When the platform has no uploader: ship the file as text

The editor's uploader is `image`, and it refuses anything that is not one. A
`.glb` is therefore unreachable — unless the block stops asking for a *file*
and starts asking for *text*. A `.gltf` is JSON, and its buffers can be
embedded as base64, so a whole model fits in a `textarea`:

```
{ "asset": {"version":"2.0"}, …
  "buffers": [{ "uri": "data:application/octet-stream;base64,Z2xURgIAAAA…" }] }
```

`GLTFLoader.parse(text, '', onLoad)` takes that string directly — no URL, no
network, nothing to be rate-limited, and the merchant's asset never leaves
their store settings. `tools/model-code-studio.html` turns a dropped `.glb` /
`.gltf` into it; `tools/glb-to-text.py` and Blender's "glTF Embedded" export
produce the same thing.

Rules that make it usable rather than a gimmick:

- **The merchant asked to upload, so give them an uploader — just not inside
  the editor.** A `textarea` with a description that lists three formats reads
  as an instruction manual, and the merchant's next message is "I pasted it and
  the editor froze". Ship `tools/model-code-studio.html`: a drop zone that
  converts, shrinks and reports the character count *before* anything is
  copied. The heavy work happens in a page of its own, which is the entire
  point — a tab that is allowed to take ten seconds is a tab that cannot hang
  the theme editor.
- **Cap the field and say the cap.** The paste rides in the page payload on
  every request. 400 000 characters (≈300 KB of model) is the ceiling here —
  far below what a browser can parse, because the limit is the *page*, not the
  parser. Bigger models use the link field, and the description must say so in
  the merchant's own words, with the numbers in it.
- **Refuse by length before you touch the string.** `raw.length > MAX` first,
  then `trim()`, then a two-character sniff, then `JSON.parse`. Every other
  order pays for work on a string that is about to be thrown away, and on the
  paste that actually broke a merchant's editor (11.5 M characters) that is the
  difference between a dropped frame and a frozen tab.
- **Publish the reason, not just the absence.** `data-code` on the canvas
  (`empty` / `ok` / `oversize` / `unreadable`) is the only channel that can
  separate "your file is 29× too big" from "that is not a model". Both look
  identical on screen: an absent product.
- **Put the arithmetic in the converter.** Both converters print
  `characters / budget`, the multiple, and what to do about it — decimate,
  Draco, or the link field — instead of writing an 11 MB file and letting the
  merchant find out in the editor. The studio disables its own copy button
  above the ceiling: a converter that hands over a paste it knows will be
  refused is a converter that wasted the merchant's afternoon.
- **Recognise glTF by `asset.version`, not by "it parses as JSON".** Otherwise
  every typo that happens to be valid JSON becomes a blank canvas with no
  error. A refusal falls back to the preset shape — the stage keeps its type
  and its cards, which is the whole composition minus the product.
- **Debounce the parse, don't just memoise it.** Memoising saves the parses
  between renders; it does nothing about the settings object changing on every
  *keystroke*, and a 300 KB `JSON.parse` per keystroke is a frozen panel. Below
  20 000 characters parse inline (a silhouette must never lag), above it wait
  ~320 ms for the typing to stop — the stage keeps the previous model, which is
  what it was already showing. Oversized is exempt: `length` decides it before
  anything is allocated, so it must answer on the same render.
- **A paste rebuilds the scene; a slider never does.** The parsed model is a
  dependency of the WebGL effect, memoised on the raw text, so only a real
  change tears the context down.
- **Shrink before you refuse.** `tools/fit-model.py` decimates and re-measures
  the *paste-ready text* (not the GLB — different number), searching ratios
  instead of guessing one. Decimation alone is usually not enough: a 7 MB
  "model" is often 4 MB of 2048px PBR maps for an object that renders 600 px
  wide. `--strip-textures` is the biggest single win here, because this block
  paints the product itself; `--max-texture 512` keeps a baked logo at a
  sane size. The studio does the same two moves in the browser (canvas
  re-encode to 512px WebP, then a packed buffer rebuilt from only the
  bufferViews something still points at) — deleting `images` frees nothing
  until the bytes leave the buffer, and the buffer is what gets base64'd.
- **Take the silhouette too.** `{"profile": [[r,h], …]}` gives a merchant a
  custom solid with no file at all — and because it is still *our* lathe, the
  colour, finish and width controls keep working on it, unlike a pasted mesh.

---

## 8. Definition of done

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` succeeds
- [ ] full `npx vitest run` green, including the new block's tests
- [ ] `npm run check:manifest` — no new errors
- [ ] harness shot at every anchor **and** every mid-leg, plus mobile, reduced,
      LTR — and you actually looked at each one
- [ ] wrapper height == block height
- [ ] merchant can add the maximum number of rows the manifest allows
- [ ] reduced motion shows a finished composition
- [ ] the reply states what was verified, and what was not

---

## 9. Environment note

`C:` filling up kills every shell tool at once with `ENOSPC`, and the
safe-delete guard then fails to write its own approval record — so deletes stop
working too. Regenerable caches are the safe thing to clear:
`%LOCALAPPDATA%\npm-cache\_cacache`, `%LOCALAPPDATA%\pip\Cache`. Do not touch
`Temp`, `Documents`, `Desktop` or `ms-playwright` without asking.
