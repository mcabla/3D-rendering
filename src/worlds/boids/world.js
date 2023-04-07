import * as THREE from 'three';

import { createMeshCube } from './meshCube.js';
import { createLights } from './lights.js';
import { Boid } from './boid.js';
import { BoidManager } from './boidManager.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


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

    //Camera controls
    const controls = new OrbitControls(this.camera, this.main.renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target = new THREE.Vector3(0, 0, 0);
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