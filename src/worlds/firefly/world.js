import * as THREE from 'three';
import { createLights } from './lights.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import {fireFliesMaterial} from "../../utilities/materials/firefliesMaterial.js";

//Inspiration:

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    // this.main.renderer.sortObjects = true;
    this.camera = createCamera();
    //this.scene.background = new THREE.Color(0x66BBFF);

    //Custom vars
    this.light = createLights();
    this.scene.add(this.light);

    const fireflies = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(fireflies, fireFliesMaterial);
    mesh.position.set(0, 0, 0);
    this.scene.add(mesh);
    mesh.tick = (delta) => {
      fireFliesMaterial.uniforms.time.value += delta/5;
      mesh.rotation.copy(this.camera.rotation);
      mesh.updateMatrixWorld();

    }
    this.loop.updatables.push(mesh);



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
