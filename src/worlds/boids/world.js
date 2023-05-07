import * as THREE from 'three';

import { createMeshCube } from './meshCube.js';
import { createLights } from './lights.js';
import { BoidManager } from '../../utilities/boids/boidManager.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();
    this.scene.background = new THREE.Color(0x151519);

    //Custom vars
    let cubeSize = 8;
    this.cube = createMeshCube(cubeSize);
    this.light = createLights();
    this.scene.add(this.cube, this.light);


    this.boidManager = new BoidManager({
      camera: this.camera,
      scene: this.scene,
      amount: 1000,
      cubeSize: cubeSize
    });

    this.loop.updatables.push(this.boidManager);

    //Camera controls
    const controls = new OrbitControls(this.camera, this.main.renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 75;
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
  camera.position.set(0, 0, 25);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}