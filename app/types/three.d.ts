/**
 * The runtime package ships the GLTF loader and renderer without bundled
 * TypeScript declarations. These blocks use a deliberately small surface of the
 * Three.js API, so a local ambient declaration keeps the literal dynamic
 * imports analysable by Vite without adding a type-only dependency.
 */
declare module 'three';
declare module 'three/addons/loaders/GLTFLoader.js';
declare module 'three/addons/postprocessing/EffectComposer.js';
declare module 'three/addons/postprocessing/RenderPass.js';
declare module 'three/addons/postprocessing/UnrealBloomPass.js';
declare module 'three/addons/postprocessing/ShaderPass.js';
declare module 'three/addons/shaders/GammaCorrectionShader.js';
declare module 'three/addons/shaders/CopyShader.js';
