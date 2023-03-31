export default class Resizer {
  width = 0;
  height = 0;

  constructor(container, camera, renderer) {
    // set initial size
    this._setSize(container, camera, renderer);

    window.addEventListener('resize', () => {
      // set the size again if a resize occurs
      this._setSize(container, camera, renderer);
      // perform any custom actions
      this.onResize();
    });
  }

  onResize() { }

  _setSize(container, camera, renderer) {
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  };
}
