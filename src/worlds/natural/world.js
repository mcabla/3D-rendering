import * as THREE from 'three';
import { createAmbientLight } from './lightAmbient.js';
import { createDirectionalLight } from './lightDirectional.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { ChunkManager } from '../../utilities/terrain/chunkManager.js';
import { terrainMaterial } from '../../utilities/materials/terrainMaterial.js'
import { createWater } from '../../utilities/materials/water.js';
import { BoidManager } from "../../utilities/boids/boidManager.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { CloudManager } from '../../utilities/clouds/clouds.js';
import { Fire } from '../../utilities/fire/fire.js';

const waterHeight = 0.0;

export default class World {
  renderTarget;
  parameters = {
    elevation: 2,
    azimuth: 180
  };
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.container = main.container;
    this.camera = this.createCamera();

    //Add light
    this.ambientLight = createAmbientLight();
    this.scene.add(this.ambientLight);
    this.directionalLight = createDirectionalLight();
    this.scene.add(this.directionalLight);

    this.sun = new THREE.Vector3();

    //Add water
    this.water = createWater(this.scene, waterHeight);
    this.scene.add(this.water);
    this.loop.updatables.push(this.water);

    //Add clouds
    const cloudFieldSize = 50;
    const cloudManager = new CloudManager({ camera: this.camera, cloudLevel: 6, cloudfieldSize: cloudFieldSize });
    this.scene.add(cloudManager);
    this.loop.updatables.push(cloudManager);

    // Add sky
    this.sky = new Sky();
    this.sky.scale.setScalar(10000);
    this.scene.add(this.sky);

    this.skyUniforms = this.sky.material.uniforms;
    this.skyUniforms['turbidity'].value = 10;
    this.skyUniforms['rayleigh'].value = 2;
    this.skyUniforms['mieCoefficient'].value = 0.005;
    this.skyUniforms['mieDirectionalG'].value = 0.8;

    this.pmremGenerator = new THREE.PMREMGenerator(main.renderer);


    //Add fire
    const fire = new Fire({
      firePosition: { x: -3, y: 1.255, z: 0.5 },
      fireSize: 0.1,
      fireHeight: 0.4
    });
    this.loop.updatables.push(fire);
    this.scene.add(fire);

    //*Add terrain

    const terrainGen = {
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
      viewDistance: 7,
      chunkSize: 5,
      material: terrainMaterial,
      baseFreq: .5,
      wireFrame: false,
      waterHeight: waterHeight,
      treesCount: 100,
      terrainGen: terrainGen
    });
    this.scene.add(chunkManager);
    this.loop.updatables.push(chunkManager);
    terrainMaterial.uniforms['waterLevel'].value = waterHeight + 0.01;
    terrainMaterial.uniforms['surfaceLevel'].value = waterHeight + 0.09;
    terrainMaterial.uniforms['stoneAngle'].value = 0.6;
    terrainMaterial.uniforms['grassAngle'].value = 0.75;
    terrainMaterial.uniforms['sunColor'].value = this.directionalLight.color;
    terrainMaterial.uniforms['sunIntensity'].value = this.directionalLight.intensity + 0.3;
    terrainMaterial.uniforms['ambientColor'].value = this.ambientLight.color;
    terrainMaterial.uniforms['ambientIntensity'].value = this.ambientLight.intensity + 0.5;

    //Add boids
    const boidSize = 0.03
    const boidShape = new THREE.Shape()
      .moveTo(0, 2 * boidSize)
      .lineTo(boidSize, -boidSize)
      .lineTo(0, 0)
      .lineTo(-boidSize, -boidSize)
      .lineTo(0, 2 * boidSize);

    const geometryBoid = new THREE.ShapeGeometry(boidShape);
    const materialBoid = new THREE.MeshBasicMaterial({ color: 0x000022, side: THREE.DoubleSide });
    const defaultBoidMesh = new THREE.Mesh(geometryBoid, materialBoid);

    const boidManager = new BoidManager({
      camera: this.camera,
      boidMesh: defaultBoidMesh,
      amount: 100,
      boidSize: 0.1,
      floorHeight: 3,
      boidBehavior: {

        constantVel: 1, //How fast the boids move at all times
        centeringForce: 0.1,//How hard the boids get pushed back to the center when the cross the walls or floor
        gravity: 0.005, //How much the boids are affected by gravity
        attractForce: 0.02, //How hard are they pulled to the center of the swarm
        minDistance: 0.5, //How close do they have to be before they are considered neighbours
        avoidForce: 0.01,//Only neighbours: How hard are they pushed away from their neighbours
        conformDirection: 0.001 //Only neighbours: How much the boids want to match the direction/heading of their neighbours
      }
    });
    this.scene.add(boidManager);
    this.loop.updatables.push(boidManager);

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

    //Add gui
    this.parameters = {
      elevation: 0,
      azimuth: 115
    };
    this.gui = this.createGUI();
    this.updateSun(this.parameters.elevation, this.parameters.azimuth);

  }


  updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - this.parameters.elevation);
    const theta = THREE.MathUtils.degToRad(this.parameters.azimuth);

    this.sun.setFromSphericalCoords(1, phi, theta);

    this.sky.material.uniforms['sunPosition'].value.copy(this.sun);
    this.water.material.uniforms['sunDirection'].value.copy(this.sun).normalize();

    terrainMaterial.uniforms.sunDirection.value = this.sun;

    this.directionalLight.position.x = this.sun.x * 1000 + this.camera.position.x;
    this.directionalLight.position.y = this.sun.y * 1000 + this.camera.position.y;
    this.directionalLight.position.z = this.sun.z * 1000 + this.camera.position.z;


    if (this.renderTarget !== undefined) {
      this.renderTarget.dispose();
    }

    this.renderTarget = this.pmremGenerator.fromScene(this.sky);

    this.scene.environment = this.renderTarget.texture;
  }

  createGUI() {
    const gui = new GUI({ container: document.getElementById("sceneContainer") });

    const folderSky = gui.addFolder('Sky');
    folderSky.add(this.parameters, 'elevation', 0, 89, 0.1).onChange(() => this.updateSun());
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
}

