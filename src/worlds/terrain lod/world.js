import * as THREE from 'three';

import { createMeshCube } from './meshCube.js';
import { createLights } from './lights.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';

import { ChunkManager } from './chunkManager.js';

//Inspiration: 

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();
    this.scene.background = new THREE.Color(0x151519);

    //Custom vars
    let cubeSize = 5;
    this.cube = createMeshCube(cubeSize);
    this.light = createLights();
    let chunkManager = new ChunkManager(this.camera, this.scene, 3, cubeSize);
    this.scene.add(this.cube, this.light);
    this.loop.updatables.push(chunkManager);

    //Camera controls orbit style
    // const controls = new OrbitControls(this.camera, this.main.renderer.domElement);
    // controls.minDistance = 2;
    // controls.maxDistance = 100;
    // controls.maxPolarAngle = Math.PI / 2;
    // controls.target = new THREE.Vector3(0, 0, 0);
    // controls.controlsEnabled = true;
    // controls.update();

    //Controls creative mode flying: 
    const controls = new FlyControls(this.camera, this.main.renderer.domElement);
    controls.movementSpeed = 4;
    controls.domElement = this.main.renderer.domElement;
    controls.rollSpeed = Math.PI / 6;
    controls.dragToLook = true;
    this.loop.updatables.push({
      tick: function (delta) {
        controls.update(delta);
      }
    });

  }


}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    35, // fov = Field Of View
    1, // dummy value for aspect ratio
    0.1, // near clipping plane 
    100, // far clipping plane
  );
  camera.position.set(-10, 0, 2);
  camera.up = new THREE.Vector3(0, 0, 1);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  return camera;
}

// let oldMouseX = 0;
// let oldMouseY = 0;
// let mouseVX = 0;
// let mouseVY = 0;


// Function to handle mouse movement

