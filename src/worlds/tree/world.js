import * as THREE from 'three';

import { createLights } from './lights.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.camera = createCamera();


    this.scene.background = new THREE.Color(0x151519);


    // Define the L-system rules
    const rules = {
      'S': 'SS',
      'F': 'F+[+F-F-F]--[-F+F+F]+*[*F/F/F]//[/F*F*F]*FFL',
      'L': 'LLF',
    };

    // Generate the L-system string
    const iterations =2; // number of times to apply the rules
    let axiom = 'F'; // starting string
    for (let i = 0; i < iterations; i++) {
      let newAxiom = '';
      for (let j = 0; j < axiom.length; j++) {
        const char = axiom.charAt(j);
        if (rules[char]) {
          newAxiom += rules[char];
        } else {
          newAxiom += char;
        }
      }
      axiom = newAxiom;
    }
    console.log(axiom);

// Convert the L-system string to a list of branch instructions
    const branchAngle = Math.PI / 8; // angle between branches
    const branchLength = 10; // length of each branch
    let position = new THREE.Vector3(0, 0, 0); // starting position
    let direction = new THREE.Vector3(0, 1, 0); // starting direction
    let stack = []; // stack for storing positions and directions
    let branches = []; // list of branch instructions
    let leaves = []; // list of branch instructions
    for (let i = 0; i < axiom.length; i++) {
      const char = axiom.charAt(i);
      switch (char)  {
        case 'F':
          // add a branch instruction
          branches.push({
            position: new THREE.Vector3().copy(position),
            direction: new THREE.Vector3().copy(direction)
          });
          // move forward
          position.add(direction.clone().multiplyScalar(branchLength));
          break;
        case '+':
          // rotate right
          direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), -branchAngle);
          break;
        case '-':
          // rotate left
          direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), branchAngle);
          break;
        case '*':
          // rotate forward
          direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), branchAngle);
          break;
        case '/':
          // rotate backward
          direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), -branchAngle);
          break;
        case '[':
          // save position and direction to the stack
          stack.push({
            position: new THREE.Vector3().copy(position),
            direction: new THREE.Vector3().copy(direction)
          });
          break;
        case ']':
          // restore position and direction from the stack
          const state = stack.pop();
          position.copy(state.position);
          direction.copy(state.direction);
        break;
      default:
        break;
      }
    }

    console.log(stack, branches, leaves);

// Create the Three.js objects for the tree
    const trunkGeometry = new THREE.CylinderGeometry(1, 1, branchLength, 4, 1, false);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x663300 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    const group = new THREE.Group();
    group.add(trunk);
    //group.up = new THREE.Vector3(0,1,0)
    trunk.position.add(new THREE.Vector3(0,0,branchLength/2));
    trunk.rotateX(Math.PI/2)

    const leafGeometry = new THREE.SphereGeometry(2, 8, 4);
    const leafMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

    const branchGroup = new THREE.Group();
    const leafGroup = new THREE.Group();
    for (let i = 0; i < branches.length; i++) {
      const branch = group.clone();
      branch.position.copy(branches[i].position);
      const destination = new THREE.Vector3().copy(branches[i].direction).multiplyScalar(branchLength).add(branch.position)/*.applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI/2)*/;
      branch.lookAt(destination.x, destination.y, destination.z);
      // branch.scale.y = branches[i].direction.length();
      branchGroup.add(branch);

      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.copy(destination);
      // leaf.position.y += 10;
      //leaf.lookAt(branch.position.clone().add(branches[i].direction));
      leafGroup.add(leaf);
    }

    // this.scene.add(trunk);
    this.scene.add(branchGroup);
    this.scene.add(leafGroup);
    //this.scene.add(new THREE.Mesh(leafGeometry, leafMaterial));


    this.light = createLights();


    this.scene.add(this.light);

    const controls = new OrbitControls( this.camera, main.renderer.domElement );
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set( 0, 1, 0 );
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();
  }
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75, // fov = Field Of View
    1, // dummy value for aspect ratio
    0.1, // near clipping plane
    1000, // far clipping plane
  );
  camera.position.set(0, 0, 10);
  return camera;
}
