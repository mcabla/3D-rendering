import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { grassBasic } from '../materials/grassBasic.js';

export class Chunk {
    constructor({
        camera,
        chunkSize,
        x,
        y,
        wireFrameOn = false,
        material = grassBasic,
        lod = 1,
        baseSegments = 20,
        terrainGen = {
            //*Attention: If you overwrite one of these you need to overwrite all of them!
            baseFreq: 1,
            freqGain: 3,
            baseAmpl: 2.5,
            amplShrink: 0.2,
            terrainFunc: (level, val) => {
                return val;
            }
        } }) {
        this.camera = camera;
        this.chunkSize = chunkSize;
        this.position = new THREE.Vector3(x, y, 0);
        this.wireFrameOn = wireFrameOn;

        let geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, baseSegments, baseSegments);
        if (wireFrameOn) {
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
        this.baseSegments = baseSegments;
        this.terrainGen = terrainGen;
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
        let segments = this.baseSegments * level
        const geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, segments, segments);
        let perlin = new ImprovedNoise();

        let x = this.position.x;
        let y = this.position.y;
        //x and y are world coords and xL and yL are coords between 0 and 1 within the chunk
        const l = segments + 1
        for (let yL = 0; yL < l; yL++)
            for (let xL = 0; xL < l; xL++) {
                let index = 3 * yL * l + 3 * xL + 2;
                //*Stop gaps by lowering chunks that are further away into the ground a bit. Hacky but it works!
                geometry.attributes.position.array[index] = level * 0.01;
                for (let i = 0; i <= level; i++) {
                    const freq = this.terrainGen.baseFreq * (this.terrainGen.freqGain ** i);
                    const ampl = this.terrainGen.baseAmpl * (this.terrainGen.amplShrink ** i);
                    let xP = x / this.chunkSize * freq + xL / segments * freq;
                    let yP = -y / this.chunkSize * freq + yL / segments * freq;
                    let val = perlin.noise(xP, yP, 0) * ampl;
                    val = this.terrainGen.terrainFunc(i, val);
                    geometry.attributes.position.array[index] += val;
                }
            }

        this.obj.geometry.dispose();
        if (this.wireFrameOn) {
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