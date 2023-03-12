export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;

    this.scene.background = new THREE.Color('skyblue');

  }
}