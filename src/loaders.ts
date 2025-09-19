// src/loaders.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

export function createGLTFLoader(renderer: THREE.WebGLRenderer) {
  const gltf = new GLTFLoader();

  const ktx2 = new KTX2Loader()
    .setTranscoderPath('/basis/')            // public/basis/* real files
    .detectSupport(renderer);

  gltf.setKTX2Loader(ktx2);
  gltf.setCrossOrigin('anonymous');
  return gltf;
}
