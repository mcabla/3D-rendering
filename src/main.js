import * as THREE from 'three';
//import Stats from 'three/addons/jsm/libs/stats.module.js';

import Loop from './loop.js';
import Stats from './stats.js'
import Resizer from './resizer.js';
export default class Main {
  constructor(container, worldName = 'natural') {
    this.container = container;
    this.renderer = this.createRenderer();
    this.scene = this.createScene();
    this.stats = this.createStats();
    this.loop = new Loop(this);
    container.append(this.renderer.domElement);
    this.resizer = new Resizer(container, this.renderer);

    const validWorlds = ['natural', 'boids', 'cube', 'fractals', 'terrain', 'water'];
    const defaultWorld = validWorlds[0];

    let actualWorldName;
    if (validWorlds.includes(worldName)) {
      actualWorldName = worldName;
    } else {
      actualWorldName = defaultWorld;
    }

    import(`./worlds/${actualWorldName}/world.js`).then(module => {
      const world = new module.default(this);
      this.camera = world.camera;
      this.resizer.setCamera(this.camera);
      this.start();
    });
  }

  render() {
    // draw a single frame
    this.renderer.render(this.scene, this.camera);
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
      precision: 'highp'
    });
    renderer.useLegacyLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    return renderer;
  }

  createScene() {
    return new THREE.Scene();
  }

  createStats() {
    const stats = Stats()
    this.container.appendChild(stats.dom);
    return stats;
  }

}
