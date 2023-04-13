import * as THREE from 'three';
import { createLights } from './lights.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { ChunkManager } from '../../utilities/terrain/chunkManager.js';
import { grassBasic } from '../../utilities/materials/grassBasic.js';
import { terrainTropic } from '../../utilities/materials/terrainTropic.js';
import { terrainMaterial } from '../../utilities/materials/terrainMaterial.js'
import { createWater } from './water.js';

//Inspiration: 

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();
    this.scene.background = new THREE.Color(0x66BBFF);

    //Custom vars
    let cubeSize = 5;

    //Add light
    this.light = createLights();
    this.scene.add(this.light);

    //Add water
    this.water = createWater(this.scene, 0);
    this.scene.add(this.water);
    this.loop.updatables.push(this.water);

    //Add chunks
    let chunkManager = new ChunkManager({
      camera: this.camera,
      scene: this.scene,
      viewDistance: 7,
      chunkSize: cubeSize,
      material: grassBasic
    });

    this.loop.updatables.push(chunkManager);

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
  camera.position.set(-10, 2, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  return camera;
}


