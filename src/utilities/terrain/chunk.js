import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { grassBasic } from '../materials/grassBasic.js';

const amplitude = 2.5
const freqGain = 3;
const amplShrink = 0.2;
const baseSegments = 20;


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
        waterHeight = 0.0,
        treesCount = 0,
        terrainGen = {
            //*Attention: If you overwrite one of these you need to overwrite all of them!
            baseFreq: 1,
            freqGain: 3,
            baseAmpl: 2.5,
            amplShrink: 0.2,
            terrainFunc: (level, val) => {
                return val;
            }
        }}) {
        this.camera = camera;
        this.chunkSize = chunkSize;
        this.position = new THREE.Vector3(x, y, 0);
        this.wireFrameOn = wireFrameOn;
        this.waterHeight = waterHeight;
        this.trees = treesCount > 0;
        this.treesCount = treesCount;

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
            // this.obj.frustumCulled = false;
        }
        this.obj.position.set(x, y, 0);

        this.lod = lod;
        this.baseSegments = baseSegments;
        this.terrainGen = terrainGen;


        if (this.trees) {
            this.treeDummy = new THREE.Object3D();
            const sphereGeometry = new THREE.SphereGeometry(0.05, 1, 1);
            const sphereMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
            this.treeMesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, treeCount);
            this.treeDummy.position.z = -10;
            this.treeDummy.updateMatrix();
            for (let i = 0; i < treeCount; i++) {
                this.treeMesh.setMatrixAt(i, this.treeDummy.matrix);
            }
            this.obj.add(this.treeMesh);
            this.treeMesh.instanceMatrix.needsUpdate = true;
        }

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

        const treePositions = [];

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

                // Prevent most of the water twitching.
                let terrainHeight = geometry.attributes.position.array[index];
                const waterOffset = Math.abs(terrainHeight - this.waterHeight);
                if (waterOffset < 0.02) {
                    // Move the terrain up or down by a certain amount
                    if (terrainHeight < this.waterHeight) {
                        geometry.attributes.position.array[index] -= 1 * Math.abs(terrainHeight) * (waterOffset < 0.1 ? 1 : 1);
                    } else {
                        geometry.attributes.position.array[index] += .5 * Math.abs(terrainHeight);
                    }
                    terrainHeight = geometry.attributes.position.array[index];
                }
                // Add trees only when LOD is high enough and trees haven't been placed yet
                if (this.trees && this.treeMesh && level < 3 && treePositions.length < this.treeCount && Math.trunc(terrainHeight*10)/10 > this.waterHeight + 0.07) {
                    const xP = x / this.chunkSize + xL / segments * 5000;
                    const yP = -y / this.chunkSize + yL / segments * 5000;
                    const noiseVal = perlin.noise(xP, yP, 0);
                    if (noiseVal > treeThreshold) {
                        //this.treeDummy.position.x = x + (xL / segments * 5000) * this.chunkSize;
                        // this.treeDummy.position.y = y + (yL / segments * 5000) * this.chunkSize;
                        //this.treeDummy.position.z = terrainHeight;
                        //this.treeDummy.updateMatrix();
                        // this.treeMesh.setMatrixAt(treePositions.length, this.treeDummy.matrix);
                        //treePositions.push({ x: xL, y: yL });
                    }
                }
            }

        if (this.trees && level < 3) {
            this.treeMesh.instanceMatrix.needsUpdate = true;
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
            case d <= 8:
                lod = 5;
                break;
            case d <= 15:
                lod = 3;
                break;
            default:
                lod = 2;
                break;
        }
        //Update the LOD and check if it was different from the old value
        if (this.setLOD(lod)) {
            // console.log("New lod is: " + lod);
        }

        if (this.trees && this.treeMesh) {
            this.treeMesh.instanceMatrix.needsUpdate = true;
            // this.treeMesh.computeBoundingSphere();
        }
    }
}
