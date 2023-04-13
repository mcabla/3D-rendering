import * as THREE from 'three';

import { createLights } from './lights.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {exportGLTF} from "../../utilities/exporter.js";
import {
  getCherryBlossomTree, getFern,
  getFlower,
  getMapleTree,
  getPalmTree,
  getSpruce,
  getWeepingWillowTree
} from "../../utilities/trees/tree.js";
import {GUI} from "three/addons/libs/lil-gui.module.min.js";

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
    fern.position.x = -100;
    fern.position.y = -50;
    this.scene.add(fern);

    const mapleTree = getMapleTree();
    mapleTree.position.x = -50;
    mapleTree.position.y = -50;
    this.scene.add(mapleTree);

    const flower = getFlower();
    flower.position.y = -50;
    this.scene.add(flower);

    const spruceTree = getSpruce();
    spruceTree.position.x = 50;
    spruceTree.position.y = -50;
    this.scene.add(spruceTree);

    const palmTree = getPalmTree();
    palmTree.position.x = 100;
    palmTree.position.y = -50;
    this.scene.add(palmTree);

    const weepingWillowTree = getWeepingWillowTree();
    weepingWillowTree.position.x = 150;
    weepingWillowTree.position.y = -50;
    this.scene.add(weepingWillowTree);

    const cherryBlossomTree = getCherryBlossomTree();
    cherryBlossomTree.position.x = 200;
    cherryBlossomTree.position.y = -50;
    this.scene.add(cherryBlossomTree);

    this.light = createLights();

    this.scene.add(this.light);

    const controls = new OrbitControls( this.camera, main.renderer.domElement );
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set( 0, 1, 0 );
    controls.minDistance = 4.0;
    controls.maxDistance = 2000.0;
    controls.update();


    const gui = new GUI();

    let h = gui.addFolder( 'Settings' );
    h.add( params, 'trs' ).name( 'Use TRS' );
    h.add( params, 'onlyVisible' ).name( 'Only Visible Objects' );
    h.add( params, 'binary' ).name( 'Binary (GLB)' );
    h.add( params, 'maxTextureSize', 2, 8192 ).name( 'Max Texture Size' ).step( 1 );

    h = gui.addFolder( 'Export' );
    h.add( params, 'exportFern' ).name( 'Export Fern' );
    h.add( params, 'exportMaple' ).name( 'Export Maple' );
    h.add( params, 'exportFlower' ).name( 'Export Flower' );
    h.add( params, 'exportSpruce' ).name( 'Export Spruce' );
    h.add( params, 'exportPalmTree' ).name( 'Export Palm tree' );
    h.add( params, 'exportWeepingWillow' ).name( 'Export Weeping Willow' );
    h.add( params, 'exportCherryBlossom' ).name( 'Export Cherry Blossom' );

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
  camera.position.set(0, 0, 100);
  return camera;
}

function exportFern() {
  exportGLTF( getFern(), 'fern', params );
}

function exportMaple() {
  exportGLTF( getMapleTree(),'maple', params );
}


function exportFlower() {
  exportGLTF( getFlower(), 'flower', params );
}

function exportSpruce() {
  exportGLTF( getSpruce(), 'spruce', params );
}

function exportPalmTree() {
  exportGLTF( getPalmTree(), 'palm', params );
}

function exportWeepingWillow() {
  exportGLTF( getWeepingWillowTree(), 'willow', params );
}

function exportCherryBlossom() {
  exportGLTF( getCherryBlossomTree(), 'cherry', params );
}
