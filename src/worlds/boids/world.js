import * as THREE from 'three';

import { createMeshCube } from './meshCube.js';
import { createLights } from './lights.js';
import { Boid } from './boid.js';
import { BoidManager } from './boidManager.js';

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();
    this.scene.background = new THREE.Color(0x151519);

    //Custom vars
    let cubeSize = 4;
    this.cube = createMeshCube(cubeSize);
    this.light = createLights();
    this.scene.add(this.cube, this.light);


    let boidSize = 0.1;
    let constantVel = 1;
    let amount = 100;
    this.boidManager = new BoidManager(this.camera, this.scene, amount, boidSize, cubeSize, constantVel)
    this.loop.updatables.push(this.boidManager);

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