import * as THREE from 'three';

import { createMeshCube } from './meshCube.js';
import { createLights } from './lights.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//Inspired by: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_custom_attributes_particles.html

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();
    this.scene.background = new THREE.Color(0x151519);

    //Custom vars
    let cubeSize = 8;
    this.cube = createMeshCube(cubeSize);
    this.light = createLights();
    this.scene.add(this.cube, this.light);

    //*Constnats
    const maxAge = 1;
    const amount = 100;

    let geometry = new THREE.BufferGeometry();
    let positions = [];
    const velocities = [];
    const id = []
    const sizes = [];

    let r = 20;
    for (let i = 0; i < amount; i++) {
      //Buffer so can't use fancy datatypes!
      positions.push(r * (Math.random() - 0.5), r * (Math.random() - 0.5), r * (Math.random() - 0.5));
      velocities.push(0, 0, 0);
      id.push(Math.random() * 2 * Math.PI);
      sizes.push(0);
    }

    //*You can't choose these names, threejs needs position to be position to understand it!
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("velocity", new THREE.Float32BufferAttribute(velocities, 3));
    geometry.setAttribute("id", new THREE.Float16BufferAttribute(id, 1));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(positions, 1).setUsage(THREE.DynamicDrawUsage));

    const material = new THREE.PointsMaterial({ color: 0xffff00 });

    const material2 = new THREE.ShaderMaterial({

      uniforms: {
        pointTexture: {
          value: new THREE.TextureLoader().load('assets/images/firefly.png')
        }
      },
      vertexShader: /* glsl */`
      attribute float size;
			varying vec3 vColor;

			void main() {
				vColor = color;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_PointSize = size * ( 300.0 / -mvPosition.z );
				gl_Position = projectionMatrix * mvPosition;
			}
      `,
      fragmentShader: /* glsl */`
      uniform sampler2D pointTexture;
			varying vec3 vColor;

			void main() {
				gl_FragColor = vec4( vColor, 1.0 );
				gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
			}
      `,

      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true

    });


    this.pointManager = new THREE.Points(geometry, material2);

    this.pointManager.tick = (delta) => {
      //*Adjust position;
      let pos = geometry.attributes.position.array;
      for (let i = 0; i < amount * 3; i += 3) {

        //Change x
        pos[i] += delta * 1 * Math.sin(pos[i + 1]);
        //Change z
        pos[i + 2] += delta * 1 * Math.cos(pos[i + 1]);
        //Change y
        pos[i + 1] += delta * 1 * Math.cos(pos[i]);

        //respawn if too far
        if (Math.sqrt(pos[i] * pos[i] + pos[i + 1] * pos[i + 1] + pos[i + 2] * pos[i + 2]) > 2 * r) {
          pos[i] = r * (Math.random() - 0.5);
          pos[i + 1] = r * (Math.random() - 0.5);
          pos[i + 2] = r * (Math.random() - 0.5);
        }
      }
      geometry.attributes.position.needsUpdate = true;

      //*Adjust size based on time and id
      const time = Date.now();
      let size = geometry.attributes.size.array;
      let id = geometry.attributes.id.array;
      for (let i = 0; i < amount; i++) {
        size[i] = 0.6 + 0.3 * Math.cos(id[i] + time / 2000);
      }
      geometry.attributes.size.needsUpdate = true;
      // console.log(size[0]);
    }

    this.scene.add(this.pointManager);
    this.loop.updatables.push(this.pointManager);

    //Camera controls
    const controls = new OrbitControls(this.camera, this.main.renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 75;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target = new THREE.Vector3(0, 0, 0);
    controls.update();
  }
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    35, // fov = Field Of View
    1, // dummy value for aspect ratio
    0.1, // near clipping plane 
    100, // far clipping plane
  );
  camera.position.set(0, 0, 25);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}