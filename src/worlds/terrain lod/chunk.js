import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const amplitude = 2.5
const freqGain = 3;
const amplShrink = 0.2;
const startLOD = 2;
const baseSegments = 20;


export class Chunk {
    constructor(chunkSize, x, y, meshMode = true) {
        this.chunkSize = chunkSize;
        this.position = new THREE.Vector3(x, y, 0);

        let geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, baseSegments, baseSegments);
        // this.materialMesh = new THREE.MeshPhongMaterial({ color: 0xffffff, });


        let wireframe = new THREE.WireframeGeometry(geometry);
        this.obj = new THREE.LineSegments(wireframe);
        // this.obj = new THREE.Mesh(geometry, this.materialMesh);
        this.level = 2;
        this.updateLOD();
    }


    //Return the mesh
    createChunk() {
        return this.obj;
    }

    //Set a new LOD value and return of the value has changed
    setLOD(level) {
        let changed = (level !== this.level);
        this.level = level;
        if (changed === true)
            this.updateLOD();
        return changed;
    }

    //Generate the terrain for this chunk again using the new LOD
    updateLOD() {
        let level = this.level;
        let segments = baseSegments * level
        const geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, segments, segments);
        let perlin = new ImprovedNoise();

        let x = this.position.x;
        let y = this.position.y;
        //x and y are world coords and xL and yL are coords between 0 and 1 within the chunk
        const l = segments + 1
        for (let yL = 0; yL < l; yL++)
            for (let xL = 0; xL < l; xL++) {
                let i = 3 * yL * l + 3 * xL + 2;
                // console.log(`x: ${x}, y: ${y}, i: ${i}`);
                geometry.attributes.position.array[i] = 0;
                for (let l = 1; l <= level; l++) {
                    let xP = x / this.chunkSize * freqGain ** l + xL / segments * freqGain ** l
                    let yP = -y / this.chunkSize * freqGain ** l + yL / segments * freqGain ** l
                    const val = perlin.noise(xP, yP, 0) * amplitude * amplShrink ** l
                    geometry.attributes.position.array[i] += val;
                }
            }

        const wireframe = new THREE.WireframeGeometry(geometry);
        this.obj = new THREE.LineSegments(wireframe);

        // this.obj = new THREE.Mesh(geometry, this.materialMesh);

        this.obj.position.set(x, y, 0);
        this.obj.material.depthTest = false;
        // this.obj.castShadow = true; // Enable shadow casting on the mesh
        // this.obj.receiveShadow = true; // Enable shadow receiving on the mesh
        // this.obj.material.opacity = 0.25;
        // this.obj.material.transparent = true;
    }
}