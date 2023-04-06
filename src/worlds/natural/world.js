import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';



export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();
    this.scene.background = new THREE.Color('skyblue');

    // Create a font loader
    const fontLoader = new FontLoader();

// Load the font
    fontLoader.load('/assets/fonts/helvetiker_regular.typeface.json', (font) => {

      // Create the text geometry
      const textGeometry = new TextGeometry('Use the navigation bar to\npreview our current tests', {
        font: font,
        size: .25,
        height: 0.005,
        curveSegments: 12,
        bevelEnabled: false
      });

      // Create a material for the text mesh
      const material = new THREE.MeshBasicMaterial({
        color: 0x0
      });

      // Create the text mesh
      const textMesh = new THREE.Mesh(textGeometry, material);

      // Set the position of the text mesh
      textMesh.position.set(-1.5, -0, 0);

      // Add the text mesh to the scene
      this.scene.add(textMesh);

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
  camera.position.set(0, 0, 10);
  return camera;
}
