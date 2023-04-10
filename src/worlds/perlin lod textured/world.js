import * as THREE from 'three';

import { createLights } from './lights.js';
import { Chunk } from './chunk.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

export default class World {
  renderTarget;
  parameters = {
    elevation: 2,
    azimuth: 180
  };
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.container = main.container;
    this.camera = createCamera();


    this.sun = new THREE.Vector3();

    this.water = this.createWater();
    this.water.position.y = -0.15;
    this.scene.add( this.water );
    this.loop.updatables.push(this.water);

    this.sky = new Sky();
    this.sky.scale.setScalar( 10000 );
    this.scene.add( this.sky );

    this.skyUniforms = this.sky.material.uniforms;
    this.skyUniforms[ 'turbidity' ].value = 10;
    this.skyUniforms[ 'rayleigh' ].value = 2;
    this.skyUniforms[ 'mieCoefficient' ].value = 0.005;
    this.skyUniforms[ 'mieDirectionalG' ].value = 0.8;

    this.pmremGenerator = new THREE.PMREMGenerator( main.renderer );

    this.updateSun(this.parameters.elevation , this.parameters.azimuth);

    this.cube = this.createCube();
    this.scene.add( this.cube );
    this.loop.updatables.push(this.cube);

    this.chunk = new Chunk(this.camera, 4, 0, 0);
    this.loop.updatables.push(this.chunk);
    this.light = createLights();



    this.scene.add(this.light, this.chunk.createChunk());

    //Camera controls orbit style
    const controls = new OrbitControls(this.camera, this.main.renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target = new THREE.Vector3(0, 0, 0);
    controls.controlsEnabled = true;
    controls.update();

    this.gui = this.createGUI();
  }



  createWater() {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
        waterGeometry,
        {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals: new THREE.TextureLoader().load('assets/images/waternormals.jpg', (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }),
          sunDirection: new THREE.Vector3(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 0.1,
          fog: this.scene.fog !== undefined,
          alpha: 0.9,
        }
    );

    water.rotation.x = - Math.PI / 2;
    water.tick = (delta) => {
      // increase the cube's rotation each frame
      water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
    };
    return water;
  }

  createCube() {
    const geometry = new THREE.BoxGeometry( 30, 30, 30 );
    const material = new THREE.MeshStandardMaterial( { roughness: 0 } );
    const cube = new THREE.Mesh( geometry, material );
    const radiansPerSecond = THREE.MathUtils.degToRad(30);
    // this method will be called once per frame
    cube.tick = (delta) => {
      // increase the cube's rotation each frame
      cube.rotation.z += radiansPerSecond * delta;
      cube.rotation.x += radiansPerSecond * delta;
      cube.rotation.y += radiansPerSecond * delta;
    };
    return cube;
  }

  createGUI() {
    const gui = new GUI();

    const folderSky = gui.addFolder( 'Sky' );
    folderSky.add( this.parameters, 'elevation', 0, 90, 0.1 ).onChange(() =>  this.updateSun() );
    folderSky.add( this.parameters, 'azimuth', - 180, 180, 0.1 ).onChange( () =>  this.updateSun() );
    folderSky.open();

    const waterUniforms = this.water.material.uniforms;
    const folderWater = gui.addFolder( 'Water' );
    folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
    folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
    folderWater.open();

    return gui;
  }
  updateSun() {
    const phi = THREE.MathUtils.degToRad( 90 - this.parameters.elevation );
    const theta = THREE.MathUtils.degToRad( this.parameters.azimuth );

    this.sun.setFromSphericalCoords( 1, phi, theta );

    this.sky.material.uniforms[ 'sunPosition' ].value.copy( this.sun );
    this.water.material.uniforms[ 'sunDirection' ].value.copy( this.sun ).normalize();

    if ( this.renderTarget !== undefined ) {
      this.renderTarget.dispose();
    }

    this.renderTarget = this.pmremGenerator.fromScene( this.sky );

    this.scene.environment = this.renderTarget.texture;

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
