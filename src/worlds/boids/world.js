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
    let cubeSize = 8;
    this.cube = createMeshCube(cubeSize);
    this.light = createLights();
    this.scene.add(this.cube, this.light);


    this.boidManager = new BoidManager({
      camera: this.camera,
      scene: this.scene,
      amount: 100,
      boidSize: 0.1,
      cubeSize: cubeSize,
    });

    // boidBehavior: {
    //   constantVel: 1, //How fast the boids move at all times
    //   avoidForce: 0.01,//How hard are they pushed away from each other
    //   minDistance: 1, //How close do they have to be before they are pushed
    //   attractForce: 0.2 //How hard are they pulled to the center of the swarm
    // }

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
  camera.position.set(-25, 0, 0);
  camera.up = new THREE.Vector3(0, 0, 1);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}