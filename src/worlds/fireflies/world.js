import * as THREE from 'three';
import { createMeshCube } from './meshCube.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createFireflies } from '../../utilities/fireflies/fireflies.js';

//Inspired by: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_custom_attributes_particles.html
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
    this.scene.add(this.cube);

    //Add fireflies
    let pointManager = createFireflies({ amount: 100, cloudSize: 20 });
    this.scene.add(pointManager);
    this.loop.updatables.push(pointManager);

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
  camera.position.set(0, 0, 25);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}