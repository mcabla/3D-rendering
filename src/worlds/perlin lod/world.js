import * as THREE from 'three';

import { createCube } from './cube.js';
import { createLights } from './lights.js';
import { Chunk } from './chunk.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();


    this.scene.background = new THREE.Color(0x151519);

    this.chunk = new Chunk(this.camera, 4, 0, 0);
    this.loop.updatables.push(this.chunk);
    this.light = createLights();



    this.scene.add(this.light, this.chunk.createChunk());

    //Camera controls orbit style
    const controls = new OrbitControls(this.camera, this.main.renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target = new THREE.Vector3(0, 0, 0);
    controls.controlsEnabled = true;
    controls.update();
  }
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    35, // fov = Field Of View
    1, // dummy value for aspect ratio
    0.1, // near clipping plane
    100, // far clipping plane
  );
  camera.position.set(0, 0, 10);
  return camera;
}