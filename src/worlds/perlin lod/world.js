import * as THREE from 'three';
import { createMeshCube } from './meshCube.js';
import { createLights } from './lights.js';
import { Chunk } from '../../utilities/terrain/chunk.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { grassBasic } from '../../utilities/materials/grassBasic.js';
import { terrainTropic } from '../../utilities/materials/terrainTropic.js';
import { terrainMaterial } from '../../utilities/materials/terrainMaterial.js'


export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();

    const cubeSize = 4;
    this.cube = createMeshCube(cubeSize);

    this.scene.background = new THREE.Color(0x151519);


    //Hjälp
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    this.chunk = new Chunk({
      camera: this.camera,
      chunkSize: cubeSize,
      x: 0,
      z: 0,
      wireFrameOn: true
    });

    this.chunk.calculateLOD = () => {
      let d = this.chunk.camera.position.distanceTo(this.chunk.position);
      let lod;
      switch (true) {
        case d <= 6:
          lod = 4;
          break;
        case d <= 8:
          lod = 3;
          break;
        case d <= 10:
          lod = 2;
          break;
        default:
          lod = 1;
      }
      return lod;
    }

    this.chunk.tick = (delta) => {
      this.chunk.updateLOD();
    };

    this.loop.updatables.push(this.chunk);
    this.light = createLights();

    this.scene.add(this.light, this.cube, this.chunk.getMesh());

    //Camera controls orbit style
    const controls = new OrbitControls(this.camera, this.main.renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = 0;
    controls.target = new THREE.Vector3(0, 0, 0);
    controls.controlsEnabled = true;
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
  camera.position.set(0, 10, 10);
  camera.lookAt(new THREE.Vector3());
  return camera;
}
