import * as THREE from 'three';
import { createLights } from './lights.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { exportGLTF } from "../../utilities/models/exporter.js";
import {
  getCherryBlossomTree, getFern,
  getFlower,
  getMapleTree,
  getPalmTree,
  getSpruce,
  getWeepingWillowTree
} from "../../utilities/trees/tree.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const params = {
  trs: false,
  onlyVisible: true,
  binary: false,
  maxTextureSize: 4096,
  exportFern: exportFern,
  exportMaple: exportMaple,
  exportFlower: exportFlower,
  exportSpruce: exportSpruce,
  exportPalmTree: exportPalmTree,
  exportWeepingWillow: exportWeepingWillow,
  exportCherryBlossom: exportCherryBlossom,
};

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();


    this.scene.background = new THREE.Color(0x151519);

    const fern = getFern();
    fern.position.x = -1;
    this.scene.add(fern);

    const mapleTree = getMapleTree();
    mapleTree.position.x = -0.5;
    this.scene.add(mapleTree);

    const flower = getFlower();
    this.scene.add(flower);

    const spruceTree = getSpruce();
    spruceTree.position.x = .5;
    this.scene.add(spruceTree);

    const palmTree = getPalmTree();
    palmTree.position.x = 1;
    this.scene.add(palmTree);

    const weepingWillowTree = getWeepingWillowTree();
    weepingWillowTree.position.x = 1.5;
    this.scene.add(weepingWillowTree);

    const cherryBlossomTree = getCherryBlossomTree();
    cherryBlossomTree.position.x = 2;
    this.scene.add(cherryBlossomTree);

    this.light = createLights(2);

    this.scene.add(this.light);


    //Controls creative mode flying: 
    const controls = new FlyControls(this.camera, this.main.renderer.domElement);
    controls.movementSpeed = 1.5;
    controls.domElement = this.main.renderer.domElement;
    controls.rollSpeed = Math.PI / 3;
    controls.dragToLook = true;
    this.loop.updatables.push({
      tick: function (delta) {
        controls.update(delta);
      }
    });

    //*Add ground plane
    // Load the grass texture
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = new THREE.TextureLoader().load('assets/images/grass2-seamless2-bright.jpg');
    grassTexture.repeat.set(1000, 1000); // Adjust the repeat values as needed
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 1.0,
    });

    // Create a plane geometry with a large size
    const planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000);

    // Create a mesh using the geometry and material
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

    // Rotate the plane to be parallel to the ground (optional)
    planeMesh.rotation.x = -Math.PI / 2;

    // Add the plane to the scene
    this.scene.add(planeMesh);



    //Add GUI
    const gui = new GUI();

    let h = gui.addFolder('Settings');
    h.add(params, 'trs').name('Use TRS');
    h.add(params, 'onlyVisible').name('Only Visible Objects');
    h.add(params, 'binary').name('Binary (GLB)');
    h.add(params, 'maxTextureSize', 2, 8192).name('Max Texture Size').step(1);

    h = gui.addFolder('Export');
    h.add(params, 'exportFern').name('Export Fern');
    h.add(params, 'exportMaple').name('Export Maple');
    h.add(params, 'exportFlower').name('Export Flower');
    h.add(params, 'exportSpruce').name('Export Spruce');
    h.add(params, 'exportPalmTree').name('Export Palm tree');
    h.add(params, 'exportWeepingWillow').name('Export Weeping Willow');
    h.add(params, 'exportCherryBlossom').name('Export Cherry Blossom');

    gui.open();

  }
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75, // fov = Field Of View
    1, // dummy value for aspect ratio
    0.1, // near clipping plane
    1000, // far clipping plane
  );
  camera.position.set(0, 1, 2);
  return camera;
}

function exportFern() {
  exportGLTF(getFern(), 'fern', params);
}

function exportMaple() {
  const texturesToLoad = {
    'vegetation_leaf_maple_01': {
      path: 'assets/images/vegetation_leaf_maple_01.png',
      mimeType: 'image/png'
    },
    'vegetation_tree_bark_40': {
      path: 'assets/images/vegetation_tree_bark_40.png',
      mimeType: 'image/png'
    },
    // add more textures here if needed
  };
  const loadedTextures = {};
  const loader = new THREE.FileLoader();
  Promise.all(texturesToLoad.keys().map((textureInfoName) => {
    const textureInfo = texturesToLoad[textureInfoName];
    return new Promise((resolve, reject) => {
      loader.load(textureInfo.path, (textureData) => {
        loadedTextures[textureInfoName] = textureData;
        resolve();
      }, null, reject);
    });
  })).then(() => {
    const options = {
      binary: true,
      includeCustomExtensions: true,
      embedImages: Object.keys(loadedTextures).map((textureName) => {
        return {
          mimeType: texturesToLoad[textureName].mimeType,
          buffer: loadedTextures[textureName],
          name: textureName,
        };
      })
    };
    exportGLTF(getMapleTree(), 'maple', params, options);
  }).catch((error) => {
    console.error(error);
  });
}


function exportFlower() {
  exportGLTF(getFlower(), 'flower', params);
}

function exportSpruce() {
  exportGLTF(getSpruce(), 'spruce', params);
}

function exportPalmTree() {
  exportGLTF(getPalmTree(), 'palm', params);
}

function exportWeepingWillow() {
  exportGLTF(getWeepingWillowTree(), 'willow', params);
}

function exportCherryBlossom() {
  exportGLTF(getCherryBlossomTree(), 'cherry', params);
}
