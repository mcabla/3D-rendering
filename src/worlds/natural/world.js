import * as THREE from 'three';
import { createLights } from './lights.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { ChunkManager } from '../../utilities/terrain/chunkManager.js';
import { terrainMaterial } from '../../utilities/materials/terrainMaterial.js'
import { createWater } from './water.js';
import {BoidManager} from "../../utilities/boids/boidManager.js";

//Inspiration:
const waterHeight = 0.0;
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
const boidBehavior = {
  //*Attention: If you overwrite one of the boidBehavior rules you need to overwrite all of them!
  constantVel: 1, //How fast the boids move at all times
  avoidWallsForce: 0.1,//How hard the boids get pushed back to the center when the cross the walls or floor
  gravity: 0.005, //How much the boids are affected by gravity
  attractForce: 0.02, //How hard are they pulled to the center of the swarm
  minDistance: 0.5, //How close do they have to be before they are considered neighbours
  avoidForce: 0.01,//Only neighbours: How hard are they pushed away from their neighbours
  conformDirection: 0.001 //Only neighbours: How much the boids want to match the direction/heading of their neighbours
}


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
    this.water = createWater(this.scene, waterHeight);
    this.scene.add(this.water);
    this.loop.updatables.push(this.water);

    //Add chunks
    let chunkManager = new ChunkManager({
      camera: this.camera,
      scene: this.scene,
      viewDistance: 7,
      chunkSize: cubeSize,
      material: terrainMaterial,
      baseFreq: .5,
      wireFrame: false,
      waterHeight: waterHeight,
      trees: true
    });
    this.loop.updatables.push(chunkManager);
    terrainMaterial.uniforms['waterLevel'].value = waterHeight + 0.05;
    terrainMaterial.uniforms['waterLevel2'].value = waterHeight + 0.07;

    //Add boids
    this.boidManager = new BoidManager({
      camera: this.camera,
      boidMesh: defaultBoidMesh,
      scene: this.scene,
      amount: 100,
      boidSize: 0.1,
      floorHeight: 3,
      boidBehavior: boidBehavior
    });
    this.loop.updatables.push(this.boidManager);

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
