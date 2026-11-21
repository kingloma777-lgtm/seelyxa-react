/* ==========================================================================
   product-scrub — a pinned product stage.

   The reference (`D:\theme\src\components\products\GRNDProductScroll.tsx`)
   drove this with Lenis + ScrollTrigger + SplitText: it pinned a section for
   ten viewports and ran five tweens plus a GSAP ticker off the scrub. All
   three of those hijack the page scroll, so the choreography is rebuilt here
   as arithmetic over ONE number:

       p = how far the block has been scrolled through its own run  (0 → 1)

   `useScrollProgress` writes it, the stylesheet derives every stage from it
   with `clamp()`, and the only things JS still owns are the model's spin (a
   quaternion has no CSS equivalent) and the two card thresholds (a binary
   state, which CSS cannot observe).

   Timeline — the reference's own windows, unchanged:

     0.05 → 0.35   the light headline slides out (a full 200vw of travel)
     0.20 → 0.30   a dark disc opens from the centre and floods the frame
     0.15 → 0.50   the dark headline sweeps across (300% of its own width)
     0.45 → 0.65   both rules draw themselves out
     0.65 / 0.85   each card's contents rise out of their masks (1s, power3)
     5% → 100%     the model turns six full turns about its own axis — both
                   ends of that window are the merchant's (spin_start /
                   spin_end), so the product can hold still through the
                   opening beats if they want the type to land first

   The sticker is a DECAL, not a texture swap: the merchant's artwork is cut
   out of the model's own triangles by a projection box, so it hugs the
   bottle's curvature and turns with it. A texture swap would only work on a
   model whose UVs happen to be laid out for it — i.e. never, once the merchant
   replaces the GLB. `applyLabel` owns the whole of it.

   The product itself is a SHAPE by default, not a file. Every ready-made GLB
   carries the colours and the branding of whatever it was modelled as, so a
   merchant selling their own bottle could not use one; a solid of revolution
   with no texture is theirs the moment they pick its colour and drop their
   sticker on it (see `app/lib/productShape.ts`).

   A merchant with their own model has THREE doors, and the order below is the
   order they win in:

     1. `model_code` — the model pasted as text: a `.gltf` document with its
        buffers embedded, a base64 `data:` URI, or a silhouette recipe. This
        is the only door that needs no hosting at all, which matters because
        the editor's single uploader (`image`) refuses a `.glb` and Salla does
        not host 3D files (see `app/lib/modelCode.ts`).
     2. `model` — a link to a `.glb` somewhere public, for models too big to
        travel inside a page payload.
     3. the built-in shapes — the default, and what everyone else gets.

   Two things belong to the merchant rather than to the reference. The first
   is WHERE the product sits: `model_x` / `model_y` nudge it over the copy, as
   a percent of its own width and height, because a cone is bottom-heavy and
   reads higher than a bottle at the same numbers. The second is WHEN it
   turns: `spin_start` / `spin_end` are a window on the block's own progress,
   so the product can hold still while the type lands and then take its six
   turns over whatever is left — never less than a fifth of the scene, because
   a window that closes to nothing is indistinguishable from a broken
   animation.

   The opening line is split PER CHARACTER, exactly as SplitText did — 25ms
   apart, 1s, power3.out — because that cascade is the component's signature.
   The one thing that cannot be copied literally is the script: Arabic is
   joined, and a character in its own inline-block loses its shaping, so an
   Arabic headline splits per word instead (the smallest unit that survives
   both scripts). `splitForMask` decides per headline.

   Deliberately NOT ported: the reference's intro and outro sections (two
   full-viewport lines that frame a demo page, not a storefront block).

   Three numbers are deliberately NOT the reference's, and all three are about
   the copy staying legible: the card frame opens to 8% a side instead of
   12.5% (the paragraphs would sit under the product), the card stagger is
   80ms instead of 25ms (three elements a card, not six split lines), and the
   product is framed exactly as the reference frames it — see `fit()` for why
   its lean and its offset are one mechanism.
   ========================================================================== */

import { Fragment, useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  clamp,
  prefersReducedMotion,
  readNumber,
  readRows,
  readText,
  readTextOr,
  readValue,
  rowText,
  useReveal,
  useScrollProgress,
} from '../../lib/homeBlock';
import { imgSrc } from '../../lib/curtainSlots';
import {
  FINISHES,
  finishOf,
  shapeOf,
  shapeProfile,
  type FinishKey,
  type ShapeKey,
} from '../../lib/productShape';
import { useModelCodeCheck } from '../../lib/modelCode';
import { splitForMask } from '../../lib/splitForMask';

const PREFIX = 'product_scrub';

/** Scroll budget per pacing tier, in svh ON TOP of the pinned viewport. */
const RUN = { short: 400, medium: 600, long: 800 } as const;
type Travel = keyof typeof RUN;

const SPIN_TURNS = 6;
/** The default motion window, in percent of the block's own progress. */
const SPIN_FROM = 5;
const SPIN_TO = 100;

/** Where each card's contents are allowed in, in block progress. Binary, not
 * a ramp: the reference toggled a 1s eased tween at these two points. */
const CARD_IN = [0.65, 0.85];

const travelOf = (data: Record<string, unknown>): Travel => {
  const value = readText(data, 'travel', PREFIX, 'medium');
  return value in RUN ? (value as Travel) : 'medium';
};

/** How far the product has turned, as a fraction of its whole spin.
 *
 * The merchant sets where in the scene the motion starts and where it ends,
 * so the product can sit still through the opening beats and take its turns
 * over any window they choose. Both ends are a percent of block progress; a
 * window narrower than 1% is treated as an instant step rather than a
 * division by nearly zero. */
export function spinFraction(progress: number, start: number, end: number): number {
  const from = clamp(start, 0, 100);
  const to = clamp(end, 0, 100);
  if (to - from < 1) return clamp((progress * 100 - from) * 100);
  return clamp((progress * 100 - from) / (to - from));
}

/** The reserved height is a static string in the engine config, so the run
 * length has to arrive through a class — one per pacing tier. */
export const productScrubRunClass = (data: unknown): string =>
  `product-scrub-run--${travelOf((data ?? {}) as Record<string, unknown>)}`;

/* ── icons ────────────────────────────────────────────────────────────────
   Inline paths instead of an icon package: the block needs two glyphs, and a
   dependency for that is not a trade worth making. `stroke="currentColor"`
   means the card's own text colour drives them. */
const GLYPHS: Record<string, ReactNode> = {
  bolt: (
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  ),
  bluetooth: <path d="m7 7 10 10-5 5V2l5 5L7 17" />,
  battery: (
    <>
      <rect x="2" y="7" width="16" height="10" rx="2" />
      <path d="M22 11v2" />
      <path d="m11 10-3 4h3l-1 4" />
    </>
  ),
  drop: <path d="M12 2.7 6.6 8.1a7.6 7.6 0 1 0 10.8 0z" />,
};

const Glyph = ({ name }: { name: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="40"
    height="40"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {GLYPHS[name] ?? GLYPHS.bolt}
  </svg>
);

interface Card {
  icon: string;
  title: string;
  body: string;
}

const DEFAULT_CARDS: Card[] = [
  {
    icon: 'bolt',
    title: 'Built to last',
    body: 'Designed to match your pace, it runs all week on a single charge. No interruptions, no slowing down.',
  },
  {
    icon: 'bluetooth',
    title: 'Stay synced',
    body: 'With app integration it helps you stay consistent. Monitor intake, set goals, and make every sip count.',
  },
];

interface ProductScrubProps {
  data: {
    title_a?: unknown;
    title_b?: unknown;
    model?: unknown;
    shape?: unknown;
    body_color?: unknown;
    body_finish?: unknown;
    body_width?: unknown;
    label?: unknown;
    label_size?: unknown;
    label_vertical?: unknown;
    label_angle?: unknown;
    spin_start?: unknown;
    spin_end?: unknown;
    model_x?: unknown;
    model_y?: unknown;
    travel?: unknown;
    light?: unknown;
    dark?: unknown;
    ink?: unknown;
    chalk?: unknown;
    muted?: unknown;
    cards?: unknown;
    [key: string]: unknown;
  };
}

/** The built-in product's own settings. One object, because it travels
 * through a ref: a colour change must repaint the live material, never tear
 * the WebGL context down and build it again. */
interface BodyConfig {
  shape: ShapeKey;
  color: string;
  finish: FinishKey;
  /** radius multiplier, 0.6 → 1.4 */
  width: number;
  /** a silhouette the merchant pasted, replacing the preset profile. Identity
   * compared, so the geometry is rebuilt on a paste and never on a repaint. */
  custom: Array<[number, number]> | null;
}

/** Where the product sits in the frame, as a fraction of its own width and
 * height. `0, 0` is the reference's composition; the merchant nudges from
 * there when their product's mass sits differently (a cone is bottom-heavy, a
 * bottle is not) and the default framing puts it over the copy instead of
 * beside it. */
interface FrameConfig {
  x: number;
  y: number;
}

/** Everything the decal needs. Kept as one object because it travels through a
 * ref: a re-render must repaint the sticker, never rebuild the scene. */
interface LabelConfig {
  url: string;
  /** sticker width as a percentage of the model's own width */
  size: number;
  /** 0 = bottom of the product, 100 = top */
  vertical: number;
  /** degrees about the product's own vertical axis, so the sticker can start
   * on whichever face the merchant wants */
  angle: number;
}

/* ── the split ───────────────────────────────────────────────────────────────
   Joined scripts split per word, everything else per character — the rule now
   lives in `app/lib/splitForMask` because `product-chapters` animates type the
   same way. Re-exported here so this block's public surface is unchanged. */
export { splitForMask, type Unit } from '../../lib/splitForMask';

export function ProductScrub({ data }: ProductScrubProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outRef = useRef<HTMLHeadingElement>(null);
  const sweepRef = useRef<HTMLHeadingElement>(null);
  /* the model's spin lives in the mount effect; the scroll hook reaches it
     through this ref so a re-render never re-creates the scene */
  const spinRef = useRef<((progress: number) => void) | null>(null);
  /* same reason: a sticker edit repaints the decal inside the live scene
     instead of tearing the WebGL context down and building it again */
  const labelRef = useRef<((config: LabelConfig) => void) | null>(null);
  const labelCfgRef = useRef<LabelConfig>({ url: '', size: 80, vertical: 45, angle: 0 });
  /* and the built-in product's settings reach the live scene the same way */
  const bodyRef = useRef<((config: BodyConfig) => void) | null>(null);
  const bodyCfgRef = useRef<BodyConfig>({
    shape: 'bottle',
    color: '#cfccc6',
    finish: 'satin',
    width: 1,
    custom: null,
  });
  /* the motion window, for the same reason: moving the start of the spin must
     re-aim the live model, not rebuild the WebGL context */
  const motionRef = useRef({ start: SPIN_FROM, end: SPIN_TO });
  /* and the product's place in the frame: a position slider re-fits the
     camera and the model's position, never the geometry */
  const frameRef = useRef<((config: FrameConfig) => void) | null>(null);
  const frameCfgRef = useRef<FrameConfig>({ x: 0, y: 0 });
  /* the cards' `is-in` state, mirrored here so the scroll handler can tell a
     real crossing from a frame that merely repeated */
  const inRef = useRef<boolean[]>([]);

  /* copy uses `readTextOr`: a headline the merchant clears must go away, not
     fall back to the seed line. Colours keep `readText` — an empty colour is
     not a design decision, it is an invalid value. */
  const titleA = readTextOr(data, 'title_a', PREFIX, 'Every Rep Starts With');
  const titleB = readTextOr(data, 'title_b', PREFIX, 'GRND Shaker');
  /* A link, not an upload: the theme editor's only uploader is `image` and it
     rejects a .glb outright, and Salla itself does not host 3D models — its own
     product API demands a public external CDN URL. `imgSrc` still reads an
     upload object, so a future file field costs nothing here.
     Empty is no longer "no product": an empty link means the block draws its
     own neutral shape, which is the state a merchant who has not modelled
     their product yet should land in. */
  const modelField = readValue(data, 'model', PREFIX);
  const modelUrl = modelField === undefined || modelField === null ? '' : imgSrc(modelField);
  /* `none` is the only value that removes the product; every other value,
     including a missing one, resolves to a shape */
  const shapeChoice = shapeOf(readValue(data, 'shape', PREFIX));
  const shape: ShapeKey = shapeChoice === 'none' ? 'bottle' : shapeChoice;
  const bodyColor = readText(data, 'body_color', PREFIX, '#cfccc6');
  const finish = finishOf(readValue(data, 'body_finish', PREFIX));
  const bodyWidth = clamp(readNumber(data, 'body_width', PREFIX, 100), 60, 140) / 100;
  /* A model the merchant pasted as text. Parsed once per paste, not once per
     keystroke: a 300 KB glTF document is a JSON parse, and the settings change
     on every keystroke in the editor — `useModelCodeCheck` waits for the
     typing to stop before reading it. The parse also reports WHY it failed, so
     "your paste is 11 MB, use the link field" can be told apart from "that is
     not a model" — on screen both are just an absent product. */
  const modelCode = readTextOr(data, 'model_code', PREFIX, '');
  const codeCheck = useModelCodeCheck(modelCode);
  const codeModel = codeCheck.model;
  /* a pasted *mesh* is the merchant's own object; a pasted *profile* is still
     our solid, so it keeps the colour and finish controls */
  const codeMesh = codeModel && codeModel.kind !== 'profile' ? codeModel : null;
  const customProfile = codeModel?.kind === 'profile' ? codeModel.points : null;

  /* the merchant's own model always wins; the shape is the fallback */
  const showProduct = Boolean(modelUrl) || Boolean(codeModel) || shapeChoice !== 'none';
  /* an absent sticker is no sticker — there is no seed artwork to fall back
     to, so this is a plain read */
  const labelUrl = imgSrc(readValue(data, 'label', PREFIX));
  const labelSize = clamp(readNumber(data, 'label_size', PREFIX, 80), 10, 100);
  const labelVertical = clamp(readNumber(data, 'label_vertical', PREFIX, 45), 0, 100);
  const labelAngle = clamp(readNumber(data, 'label_angle', PREFIX, 0), 0, 360);
  /* Where the product sits over the type, as a percent of its own width and
     height. `0` is the reference's composition — the merchant nudges from
     there when their product's mass sits differently (a cone is bottom-heavy,
     a bottle is not) and the default framing leaves it too high. */
  const modelX = clamp(readNumber(data, 'model_x', PREFIX, 0), -50, 50) / 100;
  const modelY = clamp(readNumber(data, 'model_y', PREFIX, 0), -50, 50) / 100;
  /* Where the product's motion begins and ends, as a percent of the block's
     own scroll. `end` is kept at least a fifth of the scene above `start`:
     a window that closes to nothing leaves the product frozen for the whole
     block, which the merchant reports as "the animation is broken". */
  const spinStart = clamp(readNumber(data, 'spin_start', PREFIX, SPIN_FROM), 0, 80);
  const spinEnd = clamp(readNumber(data, 'spin_end', PREFIX, SPIN_TO), spinStart + 20, 100);
  const light = readText(data, 'light', PREFIX, '#e0dfdf');
  const dark = readText(data, 'dark', PREFIX, '#0d0d0d');
  const ink = readText(data, 'ink', PREFIX, '#0d0d0d');
  const chalk = readText(data, 'chalk', PREFIX, '#e0dfdf');
  const muted = readText(data, 'muted', PREFIX, '#8f8f8f');

  const rows = readRows(data, 'cards', PREFIX);
  const cards: Card[] = rows.length
    ? rows
        .map((row) => ({
          icon: rowText(row, 'icon', `${PREFIX}_cards`, 'bolt'),
          title: rowText(row, 'title', `${PREFIX}_cards`, ''),
          body: rowText(row, 'body', `${PREFIX}_cards`, ''),
        }))
        /* A row with no title and no body is not a card. The merchant cleared
           it to get rid of it, and an empty frame parked in the corner of the
           stage is not what they asked for. */
        .filter((card) => card.title.trim() || card.body.trim())
    : DEFAULT_CARDS;

  /* the light headline rises once, on approach — the same beat as the
     reference's "75% bottom" trigger, without a ScrollTrigger */
  useReveal(rootRef);

  /* `dir="auto"` decides each line's direction from its own copy, and only the
     browser knows the answer. `:dir()` is the CSS way to ask, but the build's
     minifier downlevels it into a `:lang()` list — which describes the page's
     language, not the line's direction — so the resolved `direction` is read
     here and written back as `data-flow`. Nothing moves before the first
     scroll, so the extra frame costs no flash. */
  useEffect(() => {
    for (const node of [outRef.current, sweepRef.current]) {
      if (!node) continue;
      node.dataset.flow = getComputedStyle(node).direction === 'rtl' ? 'rtl' : 'ltr';
    }
  }, [titleA, titleB]);

  useScrollProgress(rootRef, (progress) => {
    spinRef.current?.(progress);

    /* Crossing a card threshold is the only moment the DOM has to change, so
       the class is written on the crossing and never on the frames between —
       the reveal itself is the stylesheet's 1s transition. */
    const host = cardsRef.current;
    if (!host) return;
    for (let i = 0; i < host.children.length; i += 1) {
      const limit = CARD_IN[i] ?? CARD_IN[CARD_IN.length - 1];
      const on = progress >= limit;
      if (inRef.current[i] === on) continue;
      inRef.current[i] = on;
      host.children[i].classList.toggle('is-in', on);
    }
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /* The flat state settles the whole timeline on its end composition AND
       collapses the block's scroll budget (see the stylesheet): a visitor who
       asked for less motion must not be walked through seven viewports of a
       stage that never moves. */
    const reduced = prefersReducedMotion();
    if (reduced) root.classList.add('is-flat');

    const canvas = canvasRef.current;
    if (!canvas || !showProduct) return;
    const connection = (navigator as unknown as { connection?: { saveData?: boolean } })
      .connection;
    /* a live WebGL scene is not worth spending on a visitor who asked for less
       data — the type and the cards are the block */
    if (connection?.saveData) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    const start = async () => {
      let THREE: typeof import('three');
      try {
        THREE = await import('three');
      } catch {
        /* no three, no model — the type and the cards are the block */
        return;
      }
      if (disposed) return;

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        /* no WebGL: the stage still works, it just loses the product */
        return;
      }

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
      /* the environment map below already lifts the shadows, so the flat
         ambient is only here to keep the dark panel from going pure black */
      scene.add(new THREE.AmbientLight(0xffffff, 0.42));
      const key = new THREE.DirectionalLight(0xffffff, 1);
      key.position.set(1, 2, 3);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.5);
      fill.position.set(-2, 0, -2);
      scene.add(fill);
      /* A rim light from behind the product: the model is matte black and the
         flooded frame is near-black, so without an edge light the silhouette
         disappears into the panel exactly when the disc has finished opening. */
      const rim = new THREE.DirectionalLight(0xffffff, 1.6);
      rim.position.set(-2, 1, -3);
      scene.add(rim);

      /* ── the light rig's missing piece ────────────────────────────────────
         A metallic surface has almost no diffuse colour: it shows what it
         reflects, and three directional lights are not something to reflect.
         At the "metal" finish the product would therefore render as a black
         silhouette on a light panel — which the merchant would report as "the
         colour does nothing", the exact bug this block already paid for once.
         A drawn equirectangular map fixes it for a few kilobytes: bright sky,
         dark floor, and one soft window band to give a specular streak. */
      const envCanvas = document.createElement('canvas');
      envCanvas.width = 256;
      envCanvas.height = 128;
      const envCtx = envCanvas.getContext('2d');
      if (envCtx) {
        const sky = envCtx.createLinearGradient(0, 0, 0, 128);
        sky.addColorStop(0, '#ffffff');
        sky.addColorStop(0.42, '#d2d2d2');
        sky.addColorStop(0.58, '#7c7c7c');
        sky.addColorStop(1, '#141414');
        envCtx.fillStyle = sky;
        envCtx.fillRect(0, 0, 256, 128);
        envCtx.fillStyle = 'rgba(255,255,255,0.85)';
        envCtx.fillRect(24, 22, 74, 20);
        envCtx.fillStyle = 'rgba(255,255,255,0.35)';
        envCtx.fillRect(150, 30, 40, 14);
      }
      const environment = new THREE.CanvasTexture(envCanvas);
      environment.mapping = THREE.EquirectangularReflectionMapping;
      environment.colorSpace = THREE.SRGBColorSpace;
      scene.environment = environment;
      scene.environmentIntensity = 0.85;

      const draw = () => renderer.render(scene, camera);

      const resize = () => {
        const width = canvas.clientWidth || 1;
        const height = canvas.clientHeight || 1;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        draw();
      };

      const observer = new ResizeObserver(resize);
      observer.observe(canvas);

      const box = new THREE.Box3();
      const size = new THREE.Vector3();
      const centre = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      const zAxis = new THREE.Vector3(0, 0, 1);
      /* The pose is ONE quaternion: the reference lean about z, then the spin
         about the product's own axis. Composing it here instead of writing
         `rotation.z` is what stops a re-fit from throwing the spin away — the
         Euler and the quaternion are the same slot, so the last write wins,
         and `fit()` writes on every reshape. */
      const tiltQuat = new THREE.Quaternion();
      const spinQuat = new THREE.Quaternion();
      let model: import('three').Object3D | null = null;
      let angle = 0;
      /** the reference lean in radians — owned by `fit()`, applied by `applyPose` */
      let lean = 0;
      /** the fitted position — owned by `fit()`, so a slider can move it without
       * rebuilding a single vertex */
      const base = new THREE.Vector3();

      const applyPose = () => {
        if (!model) return;
        tiltQuat.setFromAxisAngle(zAxis, lean);
        spinQuat.setFromAxisAngle(up, angle);
        model.quaternion.copy(tiltQuat).multiply(spinQuat);
        draw();
      };

      const fit = () => {
        if (!model) return;
        /* Measured with the pose cleared: the box has to describe the product,
           not its lean. A tilted AABB is about a fifth wider than the product,
           and every offset below is a fraction of that width — measuring the
           lean would make the same "20%" mean two different distances. */
        model.quaternion.identity();
        model.position.set(0, 0, 0);
        model.updateMatrixWorld(true);

        box.setFromObject(model);
        box.getSize(size);
        box.getCenter(centre);
        const narrow = window.innerWidth < 1000;
        /* the whole stage mirrors with the page — the lean included */
        const side = getComputedStyle(root).direction === 'rtl' ? 1 : -1;
        /* the merchant's own nudge, as a fraction of the product's own size:
           -0.5 … +0.5 of its width and height, so the number means the same
           thing on a slim tube and on a wide jar */
        const frame = frameCfgRef.current;

        /* The lean and the offset are one mechanism, not two. The model's
           origin sits below its bounding box (centre.y ≈ 1.9), so tilting it
           −25° about z swings the whole silhouette sideways by about 0.8
           units; the reference's `−size.x * 0.4` is what cancels that swing
           and leaves the product centred. Applying the offset without the
           lean (or mirroring one and not the other) throws it a third of a
           screen off centre and buries a card. */
        /* On a phone there is no room beside the copy, so the product is
           pushed aside instead of centred — the reference does the same, with
           a full width of offset that leaves only half the bottle in frame. */
        lean = narrow ? 0 : THREE.MathUtils.degToRad(25 * side);

        base.set(
          -centre.x + side * size.x * (narrow ? 0.7 : 0.4) + size.x * frame.x,
          /* the reference's own 8.5% lift off the optical centre */
          -centre.y + size.y * 0.085 + size.y * frame.y,
          -centre.z
        );
        model.position.copy(base);

        /* The reference frames the product at 1.25× its largest dimension on a
           desktop and 2× on a phone: the bottle is meant to dominate the
           frame, standing in the middle of the type rather than beside it. A
           longer camera turns the hero back into a thumbnail.
           That rule only holds for a slim product, though: the camera sits on
           the model's CENTRE, so a deep model's near face is half its depth
           closer and a cube at "1.25 × max side" overflows the viewport. The
           bounding sphere is depth-independent, and 1.09 is the constant that
           puts the reference bottle back at exactly 1.25 × its span — so the
           composition the block was matched to is unchanged, and a chunky
           pasted model is framed instead of cropped. */
        const radius = 0.5 * Math.hypot(size.x, size.y, size.z) || 0.5;
        const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
        const distance = (radius / Math.sin(halfFov)) * 1.09;
        camera.position.set(0, 0, narrow ? distance * 1.6 : distance);
        camera.lookAt(0, 0, 0);
        canvas.dataset.box = JSON.stringify({
          sx: Number(size.x.toFixed(2)),
          sy: Number(size.y.toFixed(2)),
          sz: Number(size.z.toFixed(2)),
          cam: Number(camera.position.z.toFixed(2)),
        });
        applyPose();
      };
      /* the merchant's position sliders land here: a re-fit, never a rebuild */
      frameRef.current = () => fit();

      const spinTo = (progress: number) => {
        if (!model || reduced) return;
        const { start, end } = motionRef.current;
        const target = Math.PI * 2 * SPIN_TURNS * spinFraction(progress, start, end);
        const delta = target - angle;
        if (Math.abs(delta) < 0.0008) return;
        angle = target;
        /* The angle is published for the same reason `data-built` is: a WebGL
           canvas without `preserveDrawingBuffer` gives back an empty buffer,
           so "did the product turn?" cannot be answered from pixels — and the
           frames behind this transparent canvas are themselves moving, which
           makes a screenshot diff lie in both directions. */
        canvas.dataset.spinAngle = angle.toFixed(4);
        applyPose();
      };
      spinRef.current = spinTo;

      /* ── the sticker ──────────────────────────────────────────────────────
         A decal, not a texture swap. `DecalGeometry` cuts a projection box out
         of the host mesh's own triangles, so the artwork follows the bottle's
         curvature — and, because the result is built from that mesh, it also
         survives the merchant replacing the GLB with a differently shaped
         product. A UV/texture swap would only work on a model whose UVs happen
         to be laid out for it, which is never the case for a shop's own file.

         One wrinkle decides the whole implementation: DecalGeometry emits
         geometry in WORLD space (it pushes each vertex through the mesh's
         matrixWorld, clips, then pushes it back out through the projector).
         Parented to the model as-is, the sticker would hang in the air while
         the model spun underneath it. So the geometry is baked back into the
         model's local space once, and only then parented — after that the
         model's own rotation carries it around. */
      let decal: import('three').Mesh | null = null;
      let decalTexture: import('three').Texture | null = null;
      /* a slider dragged quickly starts several image loads; only the last
         one may paint */
      let labelToken = 0;
      let makeDecal:
        | ((
            mesh: import('three').Mesh,
            position: import('three').Vector3,
            orientation: import('three').Euler,
            size: import('three').Vector3
          ) => import('three').BufferGeometry)
        | null = null;

      const vertexCount = (geometry: import('three').BufferGeometry): number => {
        const reader = geometry as unknown as {
          getAttribute?: (name: string) => { count: number } | undefined;
        };
        return reader.getAttribute?.('position')?.count ?? 0;
      };

      const dropLabel = () => {
        if (decal) {
          model?.remove(decal);
          decal.geometry.dispose();
          decal.material.dispose();
          decal = null;
        }
        if (decalTexture) {
          decalTexture.dispose();
          decalTexture = null;
        }
        delete canvas.dataset.labelFit;
      };

      /** Builds the sticker on one mesh. False means the projection box caught
       * no triangles — the caller then tries the next largest mesh. */
      const buildOn = (
        host: import('three').Mesh,
        texture: import('three').Texture,
        config: LabelConfig
      ): boolean => {
        if (!model || !makeDecal) return false;

        const hostBox = new THREE.Box3();
        const hostSize = new THREE.Vector3();
        const hostCentre = new THREE.Vector3();
        hostBox.setFromObject(host);
        hostBox.getSize(hostSize);
        hostBox.getCenter(hostCentre);

        /* the artwork's own proportions decide the height: a wordmark is never
           stretched into a square, and a tall logo is capped by the body */
        const image = texture.image;
        const aspect = image && image.width && image.height ? image.width / image.height : 1;
        const rawWidth = hostSize.x * (config.size / 100);
        const rawHeight = rawWidth / aspect;
        const cap = hostSize.y * 0.92;
        const shrink = rawHeight > cap ? cap / rawHeight : 1;
        const width = rawWidth * shrink;
        const height = rawHeight * shrink;

        /* 0 = the bottom of the product, 100 = the top, measured over the room
           the sticker actually has — so neither end hangs off the body */
        const room = Math.max(0, hostSize.y - height);
        const y = hostBox.min.y + height / 2 + room * (config.vertical / 100);

        const theta = THREE.MathUtils.degToRad(config.angle);
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);
        /* How far the surface is from the centre in the chosen direction. A
           box reaches `1 / (|sin|/hx + |cos|/hz)`, and taking the Z extent for
           every angle instead would park the projector inside a product that
           is wider than it is deep — the 90° setting would then cut nothing at
           all, which looks exactly like a broken control. */
        const hx = Math.max(1e-4, (hostBox.max.x - hostBox.min.x) / 2);
        const hz = Math.max(1e-4, (hostBox.max.z - hostBox.min.z) / 2);
        const reach = 1 / (Math.abs(sin) / hx + Math.abs(cos) / hz) + 0.02;
        /* deep enough to reach the surface where the sticker's outer edges
           curve away from the projector, shallow enough to stop short of the
           far wall of the product */
        const depth = reach * 1.1 + 0.02;

        const geometry = makeDecal(
          host,
          new THREE.Vector3(
            hostCentre.x + sin * (reach - depth / 2),
            y,
            hostCentre.z + cos * (reach - depth / 2)
          ),
          new THREE.Euler(0, theta, 0),
          new THREE.Vector3(width, height, depth)
        );
        if (vertexCount(geometry) === 0) {
          geometry.dispose();
          return false;
        }
        geometry.applyMatrix4(model.matrixWorld.clone().invert());

        const material = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          roughness: 0.85,
          metalness: 0,
          /* the sticker is a surface ON a surface: without these two it
             z-fights with the wall it was cut from and flickers */
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
        });

        decal = new THREE.Mesh(geometry, material);
        model.add(decal);
        canvas.dataset.labelFit = JSON.stringify({
          w: Number(width.toFixed(3)),
          h: Number(height.toFixed(3)),
          y: Number(y.toFixed(3)),
          angle: config.angle,
          verts: vertexCount(geometry),
        });
        return true;
      };

      const applyLabel = (config: LabelConfig) => {
        if (!model) return;
        const token = (labelToken += 1);
        dropLabel();
        if (!config.url) {
          draw();
          return;
        }

        new THREE.TextureLoader().load(
          config.url,
          (texture) => {
            if (disposed || token !== labelToken || !model) {
              texture.dispose();
              return;
            }
            decalTexture = texture;
            texture.colorSpace = THREE.SRGBColorSpace;
            /* the artwork is small on screen and often angled away; without
               anisotropic filtering its edges crawl during the spin */
            texture.anisotropy = 8;

            /* Measured and projected with the model's own pose reset, so the
               sticker is sized against the product rather than against its
               tilt: at 25° the world box is a fifth wider than the bottle, and
               the same "80%" would then mean a visibly different size on a
               phone, where there is no tilt. The pose is restored from the
               QUATERNION, never from `rotation.z` — the spin is written there
               by `rotateOnAxis`, and rewriting the Euler would silently throw
               the model back to its starting angle mid-scroll. */
            const pose = model.quaternion.clone();
            const origin = { x: model.position.x, y: model.position.y, z: model.position.z };
            model.quaternion.set(0, 0, 0, 1);
            model.position.set(0, 0, 0);
            model.updateMatrixWorld(true);

            /* The body is the largest mesh in a bottle file, and a label
               belongs on the largest thing. Meshes are tried in descending
               volume, because a projection box can miss a thin or hollow one
               entirely — in which case the sticker would silently not exist. */
            const meshes: import('three').Mesh[] = [];
            model.traverse((object) => {
              const mesh = object as import('three').Mesh;
              if (mesh.isMesh) meshes.push(mesh);
            });
            const probe = new THREE.Box3();
            const extent = new THREE.Vector3();
            const ranked = meshes
              .map((mesh) => {
                probe.setFromObject(mesh);
                probe.getSize(extent);
                return { mesh, volume: extent.x * extent.y * extent.z };
              })
              .sort((a, b) => b.volume - a.volume);

            let built = false;
            for (const candidate of ranked) {
              if (buildOn(candidate.mesh, texture, config)) {
                built = true;
                break;
              }
            }

            model.quaternion.copy(pose);
            model.position.set(origin.x, origin.y, origin.z);
            model.updateMatrixWorld(true);

            /* nothing accepted the projection: drop the texture rather than
               leave it alive on a mesh that does not exist */
            if (!built) {
              texture.dispose();
              decalTexture = null;
            }
            draw();
          },
          undefined,
          () => {
            /* the image is missing or blocked — the product has no sticker,
               which is the block's default state anyway */
            if (token === labelToken) canvas.dataset.labelFit = 'error';
          }
        );
      };
      labelRef.current = applyLabel;

      /* ── the built-in product ─────────────────────────────────────────────
         A solid of revolution with no texture at all. Nothing on it belongs to
         anybody: the colour is the merchant's, the finish is the merchant's,
         and the only artwork it can carry is the sticker they upload. That is
         the whole reason it exists — a ready-made GLB is branded by
         definition, and its logo is baked into a map no merchant can repaint. */
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: bodyCfgRef.current.color,
        roughness: FINISHES[bodyCfgRef.current.finish].roughness,
        metalness: FINISHES[bodyCfgRef.current.finish].metalness,
      });
      let bodyMesh: import('three').Mesh | null = null;
      let bodyShape: ShapeKey | null = null;
      let bodyCustom: Array<[number, number]> | null = null;

      const buildBody = (config: BodyConfig) => {
        if (!model) return;
        if (bodyMesh) {
          model.remove(bodyMesh);
          bodyMesh.geometry.dispose();
        }
        /* 96 radial segments: the sticker's projection box cuts these very
           triangles, so a low count shows up as a faceted label edge */
        const profile = config.custom ?? shapeProfile(config.shape, 1);
        const points = profile.map(([x, y]) => new THREE.Vector2(x, y));
        bodyMesh = new THREE.Mesh(new THREE.LatheGeometry(points, 96), bodyMaterial);
        model.add(bodyMesh);
        bodyShape = config.shape;
        bodyCustom = config.custom;
        /* a readiness signal for the visual harness: the geometry exists, so a
           screenshot taken now is the shape and not an empty canvas */
        canvas.dataset.built = config.custom ? 'custom' : config.shape;
      };

      const applyBody = (config: BodyConfig) => {
        /* A merchant's own mesh carries its own materials. The shape controls
           describe the built-in product and must never repaint a model the
           merchant paid to have made. A pasted *silhouette* is different: it
           is still our solid, so colour and finish apply to it. */
        if (!model || modelUrl || codeMesh) return;

        const finish = FINISHES[config.finish];
        bodyMaterial.color.set(config.color);
        bodyMaterial.roughness = finish.roughness;
        bodyMaterial.metalness = finish.metalness;

        const reshaped = config.shape !== bodyShape || config.custom !== bodyCustom;
        if (reshaped) buildBody(config);

        const mesh = bodyMesh;
        const resized = mesh ? Math.abs(mesh.scale.x - config.width) > 1e-3 : false;
        if (mesh && resized) {
          /* width is a scale, not a new profile: dragging a slider must not
             rebuild six thousand vertices on every tick */
          mesh.scale.x = config.width;
          mesh.scale.z = config.width;
        }

        if (!reshaped && !resized) {
          draw();
          return;
        }
        /* the sticker was projected onto the old surface and the framing was
           measured from the old bounding box — both are redone */
        fit();
        applyLabel(labelCfgRef.current);
      };
      bodyRef.current = applyBody;

      resize();

      const { DecalGeometry } = await import(
        'three/examples/jsm/geometries/DecalGeometry.js'
      );
      makeDecal = (mesh, position, orientation, size) =>
        new DecalGeometry(mesh, position, orientation, size);
      if (disposed) {
        observer.disconnect();
        renderer.dispose();
        return;
      }

      cleanup = () => {
        observer.disconnect();
        spinRef.current = null;
        labelRef.current = null;
        bodyRef.current = null;
        frameRef.current = null;
        dropLabel();
        if (bodyMesh) {
          bodyMesh.geometry.dispose();
          bodyMesh = null;
        }
        bodyMaterial.dispose();
        environment.dispose();
        renderer.dispose();
      };

      /* Takes a merchant's mesh, from wherever it came — a link, a pasted
         glTF document, a decoded GLB — and does the same three things to it:
         one matte pass, one fit, one sticker. Keeping it in one place is why
         the paste path needed no new rendering code at all. */
      const adopt = (scene3d: import('three').Object3D) => {
        if (disposed) return;
        model = scene3d;
        model.traverse((object) => {
          const mesh = object as import('three').Mesh;
          if (!mesh.isMesh) return;
          const material = mesh.material as import('three').MeshStandardMaterial;
          /* the model ships glossy; a matte pass reads better on the flat
             panels and hides the cheap specular of a 7 MB export */
          material.metalness = 0.05;
          material.roughness = 0.9;
        });
        scene.add(model);
        fit();
        /* the sticker is baked after the fit, because the projection box is
           measured in world space — before the lean and the offset are applied
           it would be aimed at the wrong face */
        applyLabel(labelCfgRef.current);
        /* a still, not a frozen mid-state: reduced motion gets the product
           turned to a three-quarter view and left there */
        if (reduced) {
          angle = Math.PI * 0.62;
          applyPose();
        } else {
          spinTo(progressNow(root));
        }
      };

      /* The shape path costs nothing to load and needs no loader at all, so
         the GLTF chunk is only fetched by the merchant who actually supplied
         a mesh. On the default configuration that is ~100 KB never downloaded. */
      if (!modelUrl && !codeMesh) {
        model = new THREE.Group();
        scene.add(model);
        applyBody(bodyCfgRef.current);
        if (reduced) {
          /* a still, not a frozen mid-state: a three-quarter view, written as
             the angle so a later re-fit re-applies it instead of dropping it */
          angle = Math.PI * 0.62;
          applyPose();
        } else {
          spinTo(progressNow(root));
        }
        return;
      }

      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      if (disposed) {
        cleanup();
        return;
      }
      const loader = new GLTFLoader();

      /* ── a pasted model ───────────────────────────────────────────────────
         Nothing is fetched: the merchant's glTF document (or the GLB behind a
         `data:` URI) is already in the page, so `parse` is synchronous on the
         JSON path and there is no URL to be blocked, rate-limited or lost when
         the merchant's hosting lapses. */
      if (codeMesh) {
        loader.parse(
          codeMesh.kind === 'binary' ? codeMesh.buffer : codeMesh.json,
          '',
          (gltf) => adopt(gltf.scene),
          () => {
            /* the paste is not a model after all — the stage keeps its type
               and its cards, which is the whole composition minus the product */
          }
        );
        return;
      }

      loader.load(
        modelUrl,
        (gltf) => adopt(gltf.scene),
        undefined,
        () => {
          /* the file is missing or blocked: the stage keeps its type and its
             cards, which is the whole composition minus the product */
        }
      );
    };

    /* the model is the heaviest thing on the page; it is fetched only when the
       block is close to being seen */
    let started = false;
    const kick = () => {
      if (started) return;
      started = true;
      void start();
    };

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === 'undefined') {
      kick();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          io?.disconnect();
          io = null;
          kick();
        },
        { rootMargin: '700px 0px' }
      );
      io.observe(root);
    }

    return () => {
      disposed = true;
      io?.disconnect();
      cleanup?.();
    };
    /* `showProduct` is a dependency because it decides whether the canvas
       exists at all: switching the shape to "none" unmounts it, and switching
       it back has to build a new context on a new element. A shape-to-shape
       change does NOT re-run this — that would tear the context down on a
       dropdown, which is the trap this block already paid for.
       `codeMesh` is different in kind: a paste REPLACES the object in the
       scene, so it is the one setting that has to rebuild the context. It is
       memoised on the pasted text, so typing in the field does not rebuild it
       once per keystroke — only a new parse does. */
  }, [modelUrl, showProduct, codeMesh]);

  /* Shape, colour, finish and width reach the live material through
     `bodyRef`; only a change of *shape* rebuilds geometry. */
  useEffect(() => {
    const config: BodyConfig = {
      shape,
      color: bodyColor,
      finish,
      width: bodyWidth,
      custom: customProfile,
    };
    bodyCfgRef.current = config;
    bodyRef.current?.(config);
  }, [shape, bodyColor, finish, bodyWidth, customProfile]);

  /* Sticker edits reach the live scene through `labelRef` instead of through
     this effect's dependencies. Re-running the scene effect on every slider
     tick would dispose the WebGL context and build a new one on the same
     canvas — which comes back blank (a paid-for trap, see the playbook). */
  useEffect(() => {
    const config: LabelConfig = {
      url: labelUrl,
      size: labelSize,
      vertical: labelVertical,
      angle: labelAngle,
    };
    labelCfgRef.current = config;
    labelRef.current?.(config);
  }, [labelUrl, labelSize, labelVertical, labelAngle]);

  /* Moving either end of the motion window re-aims the live model from where
     the page currently stands. Without this the change would only appear on
     the next scroll frame, which a merchant reports as "the slider does
     nothing". */
  useEffect(() => {
    motionRef.current = { start: spinStart, end: spinEnd };
    const root = rootRef.current;
    if (root) spinRef.current?.(progressNow(root));
  }, [spinStart, spinEnd]);

  /* Same contract for the product's place in the frame: a re-fit, so the
     change lands the moment the slider is released. */
  useEffect(() => {
    const config: FrameConfig = { x: modelX, y: modelY };
    frameCfgRef.current = config;
    frameRef.current?.(config);
  }, [modelX, modelY]);

  if (!titleA && !titleB) return null;

  const headlineGroups = splitForMask(titleA);

  return (
    <div
      ref={rootRef}
      className="product-scrub"
      style={
        {
          '--ps-light': light,
          '--ps-dark': dark,
          '--ps-ink': ink,
          '--ps-chalk': chalk,
          '--ps-muted': muted,
          '--ps-run': `${RUN[travelOf(data as Record<string, unknown>)]}svh`,
        } as CSSProperties
      }
    >
      <div className="product-scrub__stage">
        {/* 1 — the light panel: the opening line, sliding away */}
        <div className="product-scrub__panel product-scrub__panel--light">
          <h2
            ref={outRef}
            className="product-scrub__headline product-scrub__headline--out"
            dir="auto"
            data-reveal
          >
            {headlineGroups.map((units, wordIndex) => (
              <Fragment key={`w${wordIndex}`}>
                {wordIndex > 0 ? ' ' : null}
                {/* one inline-block per word: a line break may fall between
                    words, never inside one */}
                <span className="product-scrub__wordgroup">
                  {units.map((unit) => (
                    <span className="product-scrub__mask" key={unit.i}>
                      <span
                        className="product-scrub__unit"
                        style={{ '--i': unit.i } as CSSProperties}
                      >
                        {unit.ch}
                      </span>
                    </span>
                  ))}
                </span>
              </Fragment>
            ))}
          </h2>
        </div>

        {/* 2 — the dark disc that floods the frame */}
        <div className="product-scrub__disc" aria-hidden="true" />

        {/* 3 — the dark headline, sweeping across the flooded frame */}
        <div className="product-scrub__panel product-scrub__panel--dark">
          <h2
            ref={sweepRef}
            className="product-scrub__headline product-scrub__headline--sweep"
            dir="auto"
          >
            {titleB}
          </h2>
        </div>

        {/* 4 — the two cards */}
        <div className="product-scrub__cards" ref={cardsRef}>
          {cards.map((card, index) => (
            <article className="product-scrub__card" key={`${card.title}-${index}`}>
              <span className="product-scrub__mask product-scrub__mask--icon">
                <span className="product-scrub__rise" style={{ '--i': 0 } as CSSProperties}>
                  <Glyph name={card.icon} />
                </span>
              </span>

              <span className="product-scrub__rule" aria-hidden="true" />

              {/* one mask per element, not per word: a title rising word by
                  word reads as a typewriter glitch, and the reference staggered
                  by line for exactly that reason */}
              <h3 className="product-scrub__card-title" dir="auto">
                <span className="product-scrub__mask">
                  <span className="product-scrub__rise" style={{ '--i': 1 } as CSSProperties}>
                    {card.title}
                  </span>
                </span>
              </h3>

              <p className="product-scrub__card-body" dir="auto">
                <span className="product-scrub__mask product-scrub__mask--body">
                  <span className="product-scrub__rise" style={{ '--i': 2 } as CSSProperties}>
                    {card.body}
                  </span>
                </span>
              </p>
            </article>
          ))}
        </div>

        {/* 5 — the product itself, over everything */}
        {showProduct ? (
          <canvas
            className="product-scrub__canvas"
            ref={canvasRef}
            data-model={modelUrl && !codeMesh ? modelUrl : undefined}
            data-source={codeMesh ? 'code' : modelUrl ? 'url' : customProfile ? 'profile' : 'shape'}
            data-code={codeCheck.status}
            data-shape={modelUrl || codeMesh ? undefined : shapeChoice}
            data-body-color={modelUrl ? undefined : bodyColor}
            data-body-finish={modelUrl ? undefined : finish}
            data-body-width={modelUrl ? undefined : Math.round(bodyWidth * 100)}
            data-spin={`${Math.round(spinStart)}-${Math.round(spinEnd)}`}
            data-frame={`${Math.round(modelX * 100)},${Math.round(modelY * 100)}`}
            data-label={labelUrl || undefined}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  );
}

/** Reads the block's own progress without waiting for a scroll event — used to
 * place the model at the right angle the moment it finishes loading. */
function progressNow(root: HTMLElement): number {
  const rect = root.getBoundingClientRect();
  const distance = Math.max(1, rect.height - window.innerHeight);
  return clamp(-rect.top / distance);
}
