import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const loader = new GLTFLoader();
const fileName = './soda_cans/scene.gltf';
let model;

loader.load(fileName, function(gltf) {
  model = gltf.scene;
  scene.add(model);
  addLight();
  adjustModelAndCamera();
  scene.add(camera);
  // renderer.render(scene, camera);
  animate();
}, undefined, function(e) {
  console.error(e);
});

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

function addLight() {
  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(0.5, 0, 0.866);
  camera.add(light);
}

function adjustModelAndCamera() {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  model.position.x += (model.position.x - center.x);
  model.position.y += (model.position.y - center.y);
  model.position.z += (model.position.z - center.z);

  camera.near = size / 100;
  camera.far = size * 100;
  camera.updateProjectionMatrix();

  camera.position.copy(center);
  camera.position.x += size / 0.2;
  camera.position.y += size / 2;
  camera.position.z += size / 100;
  camera.lookAt(center);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

