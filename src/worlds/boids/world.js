import * as THREE from 'three';

import { createCube } from './meshCube.js';
import { createLights } from './lights.js';
import { Boid } from './boid.js';

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();
    this.scene.background = new THREE.Color(0x151519);

    //Custom vars
    this.cubeSize = 4;
    this.boidSize = 0.1;
    this.constantVel = 1;

    this.cube = createCube(4);
    this.light = createLights();


    // this.loop.updatables.push(this.cube);


    this.scene.add(this.cube, this.light);

    //Add boids
    for (let i = 0; i < 100; i++) {
      let boid = new Boid(this.boidSize, this.cubeSize, this.constantVel, this.camera);
      this.scene.add(boid.createBoid());
      this.loop.updatables.push(boid);
    }

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