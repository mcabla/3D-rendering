import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { grassBasic } from '../materials/grassBasic.js';
import {getSpruce} from "../models/spruce.js";
import {getCherryBlossomTree, getMapleTree} from "../trees/tree.js";

// const m = getMapleTree();
const m = getCherryBlossomTree();


export class Chunk {
    constructor({
        camera,
        chunkSize,
        x,
        z,
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
        } }) {
        this.camera = camera;
        this.chunkSize = chunkSize;
        this.position = new THREE.Vector3(x, 0, z);
        this.wireFrameOn = wireFrameOn;
        this.waterHeight = waterHeight;
        this.trees = treesCount > 0;
        this.treesCount = treesCount;
        this.treePositions = [];

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
        this.obj.position.set(x, 0, z);

        this.lod = lod;
        this.baseSegments = baseSegments;
        this.terrainGen = terrainGen;


        if (this.trees) {
            this.treeDummy = new THREE.Object3D();
            const sphereGeometry = new THREE.SphereGeometry(0.05, 1, 1);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            this.treeMesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, this.treesCount);
            this.treeDummy.position.z = -10;
            this.treeDummy.updateMatrix();
            for (let i = 0; i < this.treesCount; i++) {
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


    //Calculate the LOD and generate terrain again if required.
    updateLOD() {
        //Calculate LOD
        let lod = this.calculateLOD();
        if (lod === this.lod)
            return false;//No changes required

        this.lod = lod;
        //Changes are required.
        this.generateTerrain();
        if (this.trees && this.treeMesh) {
            this.treeMesh.instanceMatrix.needsUpdate = true;
            // this.treeMesh.computeBoundingSphere();
        }
        return true;
    }

    //LOD calculator
    calculateLOD() {
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
        return lod;
    }

    //Generate the terrain for this chunk again using the new LOD
    generateTerrain() {
        let level = this.lod;
        let segments = this.baseSegments * level
        const geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, segments, segments);
        geometry.rotateX(-Math.PI / 2);
        let perlin = new ImprovedNoise();
        const oldTreeCount = 0;

        let z = this.position.z;
        let x = this.position.x;
        //x and y are world coords and xL and yL are coords between 0 and 1 within the chunk
        const l = segments + 1
        for (let zL = 0; zL < l; zL++) {
            for (let xL = 0; xL < l; xL++) {
                let index = 3 * zL * l + 3 * xL + 1;
                //*Stop gaps by lowering chunks that are further away into the ground a bit. Hacky but it works!
                geometry.attributes.position.array[index] = level * 0.01;
                for (let i = 0; i <= level; i++) {
                    const freq = this.terrainGen.baseFreq * (this.terrainGen.freqGain ** i);
                    const ampl = this.terrainGen.baseAmpl * (this.terrainGen.amplShrink ** i);
                    let xP = x / this.chunkSize * freq + xL / segments * freq;
                    let zP = z / this.chunkSize * freq + zL / segments * freq;
                    let val = perlin.noise(xP, 0, zP) * ampl;
                    val = this.terrainGen.terrainFunc(i, val);
                    geometry.attributes.position.array[index] += val;
                }

                //! DOES THIS NEED TO CHANGE??
                let terrainHeight = geometry.attributes.position.array[index];
                // Add trees only when LOD is high enough and trees haven't been placed yet
                if (this.trees && this.treeMesh && level >= 5 && terrainHeight > this.waterHeight + 0.09 && this.treePositions.length < this.treesCount) {
                    const freq = this.terrainGen.baseFreq * (this.terrainGen.freqGain ** 10) * 50;
                    const ampl = this.terrainGen.baseAmpl * (this.terrainGen.amplShrink ** 10) * 600000;
                    const xP = x / this.chunkSize * freq + xL / segments * freq;
                    const zP = z / this.chunkSize * freq + zL / segments * freq;
                    const noiseVal = perlin.noise(xP, 0, zP) * ampl;
                    if (noiseVal > 0.08) {
                        const currentX = geometry.attributes.position.array[index - 1];
                        const currentZ = geometry.attributes.position.array[index + 1];
                        this.treeDummy.position.x = currentX;
                        this.treeDummy.position.z = currentZ;
                        this.treeDummy.position.y = terrainHeight;
                        this.treeDummy.updateMatrix();

                        const existingTree = this.treePositions.some((obj) => obj.x === currentX && obj.z === currentZ);
                        const i = existingTree ? existingTree.index : this.treePositions.length;
                        this.treePositions.push({x: xL, z: zL, index: this.treePositions.length});
                        this.treeMesh.setMatrixAt(i, this.treeDummy.matrix);

                        /*const maple = m.clone();
                        maple.position.x = geometry.attributes.position.array[index - 1];
                        maple.position.z = geometry.attributes.position.array[index + 1];
                        maple.position.y = terrainHeight;
                        this.obj.add(maple);*/
                    }
                }
            }
        }

        if (this.trees && oldTreeCount < this.treePositions.length) {
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
}

function isDuplicate(obj, index, arr) {
    return arr.findIndex(o => o.x === obj.x && o.z === obj.z) !== index;
}
