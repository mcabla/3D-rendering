import Loop from './loop.js';
import Stats from './stats.js'
import Resizer from './resizer.js';
import { default as SpinningCubeWorld } from './worlds/cube/world.js';
import { default as NaturalWorld } from './worlds/natural/world.js';

export default class Main {
  constructor(container) {
    this.container = container;
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.scene = this.createScene();
    this.stats = this.createStats();
    this.loop = new Loop(this);
    container.append(this.renderer.domElement);

    const world = new SpinningCubeWorld(this);

    const resizer = new Resizer(container, this.camera, this.renderer);
  }

  render() {
    // draw a single frame
    this.renderer.render(scene, camera);
  }

  start() {
    this.loop.start();
  }

  stop() {
    this.loop.stop();
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(
      35, // fov = Field Of View
      1, // dummy value for aspect ratio
      0.1, // near clipping plane
      100, // far clipping plane
    );
    camera.position.set(0, 0, 10);
    return camera;
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.useLegacyLights = true;
    return renderer;
  }

  createScene() {
    const scene = new THREE.Scene();
    return scene;
  }

  createLights() {
    const light = new THREE.DirectionalLight('white', 8);
    light.position.set(10, 10, 10);
    return light;
  }

  createStats() {
    const stats = Stats()
    this.container.appendChild(stats.dom);
    return stats;
  }

}