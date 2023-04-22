import * as THREE from 'three';
import { createLights } from './lights.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { ChunkManager } from '../../utilities/terrain/chunkManager.js';
import { grassBasic } from '../../utilities/materials/grassBasic.js';
import { terrainTropic } from '../../utilities/materials/terrainTropic.js';
import { terrainMaterial } from '../../utilities/materials/terrainMaterial.js'
import { createWater } from '../../utilities/materials/water.js';

import { CloudManager } from '../../utilities/clouds/clouds.js';

//Inspiration: 

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();
    this.scene.background = new THREE.Color(0x66BBFF);

    //Custom vars
    const chunkSize = 5;
    const viewDistance = 7; //This means 7x7=49 chunks are loaded at once
    //The map is only 5*7 = 35 => 35x35 but it looks better if the cloud field goes on a bit further
    const cloudFieldSize = 50;

    //Add light
    this.light = createLights();
    this.scene.add(this.light);

    //Add Clouds
    this.cloudManager = new CloudManager({ camera: this.camera, cloudLevel: 6, cloudfieldSize: cloudFieldSize });
    this.scene.add(this.cloudManager.getClouds());
    this.loop.updatables.push(this.cloudManager);

    //Add chunks
    const terrainGen = {
      //*Attention: If you overwrite one of these you need to overwrite all of them!
      baseFreq: 1,
      freqGain: 3,
      baseAmpl: 2.5,
      amplShrink: 0.2,
      terrainFunc: (level, val) => {
        if (level === 0) {
          let beachSlope = 0.3;
          let terrainOffset = 0.1;
          let boundary = terrainOffset / (1 - beachSlope);
          if (val < boundary)
            return val * beachSlope;
          else
            return val - terrainOffset;
        }
        return val;
      }
    }

    let chunkManager = new ChunkManager({
      camera: this.camera,
      scene: this.scene,
      viewDistance: viewDistance,
      chunkSize: chunkSize,
      material: terrainTropic,
      terrainGen: terrainGen
    });
    this.loop.updatables.push(chunkManager);

    //Add water
    this.water = createWater(this.scene, 0);
    this.scene.add(this.water);
    this.loop.updatables.push(this.water);

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