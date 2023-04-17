import * as THREE from 'three';
import { createMeshCube } from './meshCube.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { CloudManager } from '../../utilities/clouds/clouds.js';

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

    //Add Clouds
    this.cloudManager = new CloudManager({ camera: this.camera });
    this.scene.add(this.cloudManager.getClouds());
    this.loop.updatables.push(this.cloudManager);

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
  camera.position.set(0, 0, 25);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}