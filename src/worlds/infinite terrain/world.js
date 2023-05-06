import * as THREE from 'three';
import { createLights } from './lights.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { ChunkManager } from '../../utilities/terrain/chunkManager.js';
import { grassBasic } from '../../utilities/materials/grassBasic.js';
import { terrainTropic } from '../../utilities/materials/terrainTropic.js';
import { terrainMaterial } from '../../utilities/materials/terrainMaterial.js'
import { createWater } from '../../utilities/materials/water.js';
import { CloudManager } from '../../utilities/clouds/clouds.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { Fire } from '../../utilities/fire/fire.js';

//Inspiration: 

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = this.createCamera();
    this.scene.background = new THREE.Color(0x66BBFF);

    //Custom vars
    const chunkSize = 5;
    const viewDistance = 7; //This means 7x7=49 chunks are loaded at once
    //The map is only 5*7 = 35 => 35x35 but it looks better if the cloud field goes on a bit further


    //Add Clouds
    const cloudFieldSize = 50;
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

    //Add demo cone: 
    // const geometry = new THREE.ConeGeometry(1, 2, 32);
    // const material = new THREE.MeshStandardMaterial({ roughness: 0 });
    // let mesh = new THREE.Mesh(geometry, material);
    // this.scene.add(mesh);

    //Add fire
    const fire = new Fire({
      scene: this.scene,
      updatables: this.loop.updatables,
      firePosition: { x: -3, y: 1.255, z:   0.5 },
      fireSize: 0.1, 
      fireHeight: 0.4
    });


    //Add gui
    this.parameters = {
      elevation: 0,
      azimuth: 115
    };

    this.gui = this.createGUI();

    //Add sky and light

    // this.light = createLights();
    // this.scene.add(this.light);
    this.sun = new THREE.Vector3();
    this.sky = new Sky();
    this.sky.scale.setScalar(10000);
    this.scene.add(this.sky);

    this.pmremGenerator = new THREE.PMREMGenerator(main.renderer);

    this.skyUniforms = this.sky.material.uniforms;
    this.skyUniforms['turbidity'].value = 10;
    this.skyUniforms['rayleigh'].value = 2;
    this.skyUniforms['mieCoefficient'].value = 0.005;
    this.skyUniforms['mieDirectionalG'].value = 0.8;
    this.updateSun();

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


  createGUI() {
    const gui = new GUI({ container: document.getElementById("sceneContainer") });

    const folderSky = gui.addFolder('Sky');
    folderSky.add(this.parameters, 'elevation', 0, 90, 0.1).onChange(() => this.updateSun());
    folderSky.add(this.parameters, 'azimuth', - 180, 180, 0.1).onChange(() => this.updateSun());
    folderSky.open();

    return gui;
  }

  createCamera() {
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

  updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - this.parameters.elevation);
    const theta = THREE.MathUtils.degToRad(this.parameters.azimuth);

    this.sun.setFromSphericalCoords(1, phi, theta);

    this.sky.material.uniforms['sunPosition'].value.copy(this.sun);
    this.water.material.uniforms['sunDirection'].value.copy(this.sun).normalize();

    if (this.renderTarget !== undefined) {
      this.renderTarget.dispose();
    }

    this.renderTarget = this.pmremGenerator.fromScene(this.sky);

    this.scene.environment = this.renderTarget.texture;

    //Update terrain
    terrainTropic.uniforms.sunDirection.value = this.sun;

  }


}

