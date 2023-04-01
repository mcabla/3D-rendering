export default class Resizer extends EventTarget {
  width = 0;
  height = 0;
  _camera = undefined;
  _container = undefined;
  _renderer = undefined;

  constructor(container, renderer) {
    super();
    this._container = container;
    this._renderer = renderer;
    // set initial size
    this._setSize(this._container, this._camera, this._renderer);

    window.addEventListener('resize', () => {
      this.onResize();
    });
  }

  setCamera(camera) {
    this._camera = camera;
    this.onResize();
  }

  onResize() {
    // set the size if a resize occurs
    this._setSize(this._container, this._camera, this._renderer);

    this.dispatchEvent(new CustomEvent('resize',  { detail: {
        height: this.height,
        width: this.width,
        aspect: this.width / this.height
      }}));
  }

  _setSize(container, camera, renderer) {
    if (container) {
      this.width = container.clientWidth;
      this.height = container.clientHeight;
    }

    if (camera) {
      camera.aspect = this.width / this.height;
      camera.updateProjectionMatrix();
    }

    if (renderer) {
      renderer.setSize(this.width, this.height);
      renderer.setPixelRatio(window.devicePixelRatio);
    }
  };
}
