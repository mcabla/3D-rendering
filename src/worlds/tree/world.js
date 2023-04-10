import * as THREE from 'three';

import { createTree } from './tree.js';
import { createLights } from './lights.js';

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();


    this.scene.background = new THREE.Color(0x151519);


    this.tree = createTree();
    for (let i = 0; i < this.tree.get().length; i += 1) {
      this.scene.add(this.tree.get()[i]);
    }

    this.light = createLights();

    // this.loop.updatables.push(this.tree);

    this.scene.add(this.cube, this.light);
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