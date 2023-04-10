import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const amplitude = 2.5
const freqGain = 3;
const amplShrink = 0.2;
const startLOD = 2;
const baseSegments = 20;


export class Chunk {
    constructor(camera, chunkSize, x, y, meshMode = true) {
        this.camera = camera;
        this.chunkSize = chunkSize;
        this.position = new THREE.Vector3(x, y, 0);

        const geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, baseSegments, baseSegments);

        // this.material = new THREE.MeshStandardMaterial({color: 0x001100});//slow
        // this.materialMesh = new THREE.MeshPhongMaterial({ color: 0xffffff, });//fast
        this.material = new THREE.MeshLambertMaterial({ color: 0x001100 });//fastest

        this.obj = new THREE.Mesh(geometry, this.material);
        this.obj.position.set(x, y, 0);
        this.obj.rotateX(-Math.PI / 2);
        this.obj.material.depthTest = true;
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
        geometry.computeVertexNormals();
        this.obj.geometry.dispose();
        this.obj.geometry = geometry;
    }

    tick(delta) {
        let d = this.camera.position.distanceTo(this.position);
        let lod;
        switch (true) {
            case d <= 2:
                lod = 4;
                break;
            case d <= 3:
                lod = 3;
                break;
            case d <= 4:
                lod = 2;
                break;
            default:
                lod = 1;
        }
        //Update the LOD and check if it was different from the old value
        if (this.setLOD(lod)) console.log("New lod is: " + lod);
    }
}