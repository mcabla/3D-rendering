import * as THREE from 'three';
//import Stats from 'three/addons/jsm/libs/stats.module.js';

import Loop from './loop.js';
import Stats from './stats.js'
import Resizer from './resizer.js';
import { default as BoidsWorld } from './worlds/boids/world.js';
import { default as SpinningCubeWorld } from './worlds/cube/world.js';
import { default as FractalsWorld } from './worlds/fractals/world.js';
import { default as NaturalWorld } from './worlds/natural/world.js';
import { default as TerrainWorld } from './worlds/terrain/world.js';

export default class Main {
  constructor(container) {
    this.container = container;
    this.renderer = this.createRenderer();
    this.scene = this.createScene();
    this.stats = this.createStats();
    this.loop = new Loop(this);
    container.append(this.renderer.domElement);

    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    let world;
    switch (params.world) {
      case 'boids':
        world = new BoidsWorld(this);
        break;
      case 'cube':
        world = new SpinningCubeWorld(this);
        break;
      case 'fractals':
        world = new FractalsWorld(this);
        break;
      case 'terrain':
        world = new TerrainWorld(this);
        break;
      case 'natural':
      default:
        world = new NaturalWorld(this);
        break;
    }

    this.camera = world.camera;

    this.resizer = new Resizer(container, this.camera, this.renderer);
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

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      precision:'highp'
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
