import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { grassBasic } from './materials/grassBasic.js';

const amplitude = 2.5
const freqGain = 3;
const amplShrink = 0.2;
const baseSegments = 20;


export class Chunk {
    constructor({ camera, chunkSize, x, y, wireFrame = false, material = grassBasic, lod = 1 }) {
        this.camera = camera;
        this.chunkSize = chunkSize;
        this.position = new THREE.Vector3(x, y, 0);

        let geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, baseSegments, baseSegments);
        this.meshMode = wireFrame;
        if (wireFrame) {
            let wireframe = new THREE.WireframeGeometry(geometry);
            this.obj = new THREE.LineSegments(wireframe);
            this.obj.material.opacity = 0.75;
            this.obj.material.transparent = true;
        }
        else {
            this.material = material;
            this.obj = new THREE.Mesh(geometry, this.material);
            this.obj.material.depthTest = true;
        }
        this.obj.position.set(x, y, 0);
        this.lod = lod;
        this.updateLOD();
    }


    //Return the mesh
    getMesh() {
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
                //*Stop gaps by lowering chunks that are further away into the ground a bit. Hacky but it works!
                geometry.attributes.position.array[i] = level * 0.01;
                for (let l = 1; l <= level; l++) {
                    let xP = x / this.chunkSize * freqGain ** l + xL / segments * freqGain ** l
                    let yP = -y / this.chunkSize * freqGain ** l + yL / segments * freqGain ** l
                    const val = perlin.noise(xP, yP, 0) * amplitude * amplShrink ** l
                    geometry.attributes.position.array[i] += val;
                }
            }

        this.obj.geometry.dispose();
        if (this.meshMode) {
            const wireframe = new THREE.WireframeGeometry(geometry);
            this.obj.geometry = wireframe;
        } else {
            geometry.computeVertexNormals();
            this.obj.geometry = geometry;
        }

    }

    //*When a chunk manager is used this is not called directly
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