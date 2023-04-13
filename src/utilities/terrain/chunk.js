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

        const treePositions = [];

        let z = this.position.z;
        let x = this.position.x;
        //x and y are world coords and xL and yL are coords between 0 and 1 within the chunk
        const l = segments + 1
        for (let zL = 0; zL < l; zL++)
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
                if (this.trees && this.treeMesh && level < 3 && treePositions.length < this.treeCount && Math.trunc(terrainHeight * 10) / 10 > this.waterHeight + 0.07) {
                    const xP = x / this.chunkSize + xL / segments * 5000;
                    const zP = -z / this.chunkSize + zL / segments * 5000;
                    const noiseVal = perlin.noise(xP, 0, zP);
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
}
