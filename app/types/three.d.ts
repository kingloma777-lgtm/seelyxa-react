// three ships no types and the project does not carry @types/three (it would
// pull a large type package in for two blocks). This declares only the surface
// the blocks touch, with real signatures so a typo in a method name is still a
// compile error rather than a runtime one.
//
// If @types/three is ever added to the project, DELETE THIS FILE: an ambient
// `declare module` wins over the installed definitions and would silently
// shadow them.
declare module 'three' {
  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    set(x: number, y: number): this;
  }

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    copy(vector: Vector3): this;
  }

  export class Euler {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
  }

  /** The model's real orientation: `rotateOnAxis` writes here, so the spin
   * survives only if this — and not the Euler — is what gets saved. */
  export class Quaternion {
    constructor(x?: number, y?: number, z?: number, w?: number);
    x: number;
    y: number;
    z: number;
    w: number;
    clone(): Quaternion;
    copy(quaternion: Quaternion): Quaternion;
    set(x: number, y: number, z: number, w: number): this;
    identity(): this;
    setFromAxisAngle(axis: Vector3, angle: number): this;
    /** this = this × q — the order is the whole point when a lean is composed
     * with a spin */
    multiply(quaternion: Quaternion): this;
  }

  /** Only the two operations the sticker bake needs: invert the model's world
   * matrix, then push a world-space decal back into the model's own space. */
  export class Matrix4 {
    clone(): Matrix4;
    copy(matrix: Matrix4): Matrix4;
    invert(): Matrix4;
  }

  export class Object3D {
    position: Vector3;
    rotation: Euler;
    quaternion: Quaternion;
    scale: Vector3;
    visible: boolean;
    name: string;
    matrixWorld: Matrix4;
    add(...objects: Object3D[]): this;
    remove(...objects: Object3D[]): this;
    traverse(callback: (object: Object3D) => void): void;
    updateMatrixWorld(force?: boolean): void;
    /** Spins about the object's OWN axis — unlike writing `rotation.y`, this
     * keeps working after a tilt has been applied to another axis. */
    rotateOnAxis(axis: Vector3, angle: number): this;
  }

  /** A plain container. The built-in shapes are a group holding one lathe, so
   * `fit()` and the spin treat it exactly like a loaded GLB scene. */
  export class Group extends Object3D {}

  export class Scene extends Object3D {
    /** An equirectangular reflection map: what makes a metallic finish look
     * like metal instead of a black silhouette. */
    environment: Texture | null;
    environmentIntensity: number;
  }

  export class Camera extends Object3D {
    lookAt(x: number, y: number, z: number): void;
  }

  export class OrthographicCamera extends Camera {
    constructor(left: number, right: number, top: number, bottom: number, near: number, far: number);
  }

  export class PerspectiveCamera extends Camera {
    constructor(fov: number, aspect: number, near: number, far: number);
    fov: number;
    aspect: number;
    updateProjectionMatrix(): void;
  }

  export class Light extends Object3D {}

  export class AmbientLight extends Light {
    constructor(color?: number, intensity?: number);
  }

  export class DirectionalLight extends Light {
    constructor(color?: number, intensity?: number);
    castShadow: boolean;
    shadow: {
      bias: number;
      mapSize: { set(width: number, height: number): void };
    };
  }

  export class Box3 {
    min: Vector3;
    max: Vector3;
    setFromObject(object: Object3D): this;
    getSize(target: Vector3): Vector3;
    getCenter(target: Vector3): Vector3;
  }

  export class Material {
    dispose(): void;
  }

  /** Only what a merchant's colour edit needs: overwrite the tint in place,
   * so a colour change is a uniform write rather than a rebuild. */
  export class Color {
    constructor(value?: string | number);
    set(value: string | number): this;
  }

  export class Texture {
    /** the loaded <img> — read only for its natural size, so a sticker keeps
     * the uploaded artwork's aspect ratio instead of being stretched */
    image: { width: number; height: number } | null;
    colorSpace: string;
    anisotropy: number;
    mapping: number;
    needsUpdate: boolean;
    dispose(): void;
  }

  /** Built from a <canvas>: the block's environment map is drawn, not
   * downloaded, because a 7 MB HDR for three lights is not a trade. */
  export class CanvasTexture extends Texture {
    constructor(canvas: HTMLCanvasElement);
  }

  export class TextureLoader {
    load(
      url: string,
      onLoad?: (texture: Texture) => void,
      onProgress?: (event: unknown) => void,
      onError?: (error: unknown) => void
    ): Texture;
  }

  export interface ShaderUniforms {
    uProgress: { value: number };
    uColor: { value: Vector3 };
    uSpread: { value: number };
    uMix: { value: number };
    [key: string]: { value: unknown };
  }

  export class ShaderMaterial extends Material {
    constructor(parameters: {
      vertexShader: string;
      fragmentShader: string;
      transparent?: boolean;
      uniforms: ShaderUniforms;
    });
    uniforms: ShaderUniforms;
  }

  export class MeshStandardMaterial extends Material {
    constructor(parameters?: {
      color?: string | number;
      map?: Texture | null;
      transparent?: boolean;
      opacity?: number;
      depthWrite?: boolean;
      polygonOffset?: boolean;
      polygonOffsetFactor?: number;
      roughness?: number;
      metalness?: number;
    });
    color: Color;
    metalness: number;
    roughness: number;
  }

  export class BufferGeometry {
    applyMatrix4(matrix: Matrix4): this;
    dispose(): void;
  }

  export class PlaneGeometry extends BufferGeometry {
    constructor(width?: number, height?: number);
  }

  /** A 2D outline revolved about the Y axis — the whole of the built-in
   * product shapes. `segments` is the radial resolution, and it is also what
   * the sticker's projection box has to cut through, so it stays high. */
  export class LatheGeometry extends BufferGeometry {
    constructor(points: Vector2[], segments?: number);
  }

  export class Mesh extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material);
    isMesh?: boolean;
    geometry: BufferGeometry;
    material: Material;
    castShadow: boolean;
  }

  export class WebGLRenderer {
    constructor(parameters?: {
      canvas?: HTMLCanvasElement;
      alpha?: boolean;
      antialias?: boolean;
    });
    setPixelRatio(value: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setClearColor(color: number, alpha?: number): void;
    render(scene: Scene, camera: Camera): void;
    shadowMap: { enabled: boolean; type: number };
    outputColorSpace: string;
    toneMapping: number;
    toneMappingExposure: number;
    dispose(): void;
  }

  export const PCFShadowMap: number;
  export const LinearSRGBColorSpace: string;
  export const SRGBColorSpace: string;
  export const NoToneMapping: number;
  /** Tells the renderer to read a texture as a full-sphere reflection map. */
  export const EquirectangularReflectionMapping: number;

  export const MathUtils: {
    degToRad(degrees: number): number;
  };
}

declare module 'three/examples/jsm/geometries/DecalGeometry.js' {
  import type { BufferGeometry, Euler, Mesh, Vector3 } from 'three';

  /** Cuts a projection box out of a mesh's own triangles. The result is in
   * WORLD space — see the note on `applyLabel` in ProductScrub. */
  export class DecalGeometry extends BufferGeometry {
    constructor(mesh: Mesh, position: Vector3, orientation: Euler, size: Vector3);
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import type { Object3D } from 'three';

  export interface GLTF {
    scene: Object3D;
  }

  export class GLTFLoader {
    load(
      url: string,
      onLoad?: (gltf: GLTF) => void,
      onProgress?: (event: unknown) => void,
      onError?: (error: unknown) => void
    ): void;
    /** Builds from a document already in memory: a pasted `.gltf` (JSON text)
     * or a decoded GLB (ArrayBuffer). No URL, no network. */
    parse(
      data: string | ArrayBuffer,
      path: string,
      onLoad: (gltf: GLTF) => void,
      onError?: (error: unknown) => void
    ): void;
  }
}
