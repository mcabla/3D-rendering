import * as THREE from 'three';

export default class Loop {
  static clock = new THREE.Clock();

  constructor(main) {
    this.main = main;
    this.stats = main.stats;
    this.renderer = main.renderer;
    this.updatables = [];
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      this.stats.begin();

      // tell every animated object to tick forward one frame
      this.tick();

      // render a frame
      this.main.render();

      this.stats.end();
    });
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  tick() {
    // only call the getDelta function once per frame!
    const delta = Loop.clock.getDelta();

    // console.log(
    //   `The last frame rendered in ${delta * 1000} milliseconds`,
    // );

    for (const object of this.updatables) {
      if (object.tick) {
        object.tick(delta);
      }
    }
  }
}
