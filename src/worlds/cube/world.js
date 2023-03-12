import { createCube } from './cube.js';
import { createLights } from './lights.js';

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;


    this.scene.background = new THREE.Color('skyblue');


    this.cube = createCube();
    this.light = createLights();

    this.loop.updatables.push(this.cube);

    this.scene.add(this.cube, this.light);
  }
}