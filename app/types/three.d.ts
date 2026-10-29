/**
 * The runtime package ships the GLTF loader and renderer without bundled
 * TypeScript declarations. These blocks use a deliberately small surface of the
 * Three.js API, so a local ambient declaration keeps the literal dynamic
 * imports analysable by Vite without adding a type-only dependency.
 */
declare module 'three';
declare module 'three/addons/loaders/GLTFLoader.js';
