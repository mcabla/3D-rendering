import * as THREE from 'three';

import { createLights } from './lights.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {getFlower, getOakTree, getSpruce} from "../../utilities/trees/tree.js";

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();


    this.scene.background = new THREE.Color(0x151519);

    const oakTree = getOakTree();
    oakTree.position.x = -50;
    oakTree.position.y = -50;
    this.scene.add(oakTree);

    const flower = getFlower();
    flower.position.y = -50;
    this.scene.add(flower);

    const spruceTree = getSpruce();
    spruceTree.position.x = 50;
    spruceTree.position.y = -50;
    this.scene.add(spruceTree);

    this.light = createLights();


    this.scene.add(this.light);

    const controls = new OrbitControls( this.camera, main.renderer.domElement );
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set( 0, 1, 0 );
    controls.minDistance = 4.0;
    controls.maxDistance = 2000.0;
    controls.update();
  }
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75, // fov = Field Of View
    1, // dummy value for aspect ratio
    0.1, // near clipping plane
    1000, // far clipping plane
  );
  camera.position.set(0, 0, 100);
  return camera;
}
