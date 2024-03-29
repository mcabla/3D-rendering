import * as THREE from 'three';
import { Chunk } from './chunk.js';


export class ChunkManager extends THREE.Group {
    constructor({
        camera,
        viewDistance,
        chunkSize,
        wireFrame = false,
        material,
        baseSegments,
        terrainGen,
        baseFreq = 1,
        waterHeight = 0.0,
                    treesCount = 0
    }) {
        super(); 
        this.camera = camera;
        this.cameraPos = new THREE.Vector3();
        this.viewDistance = Math.floor(viewDistance);
        this.chunkSize = chunkSize;
        this.wireFrame = wireFrame;
        this.material = material;
        this.baseSegments = baseSegments;
        this.terrainGen = terrainGen;
        this.baseFreq = baseFreq;
        this.waterHeight = waterHeight;
        this.treesCount = treesCount;
        this.chunks = new Set();

        if (this.viewDistance % 2 === 0 || this.viewDistance <= 0)
            throw new Error(`Viewdistance should be strictly positive odd number not ${this.viewDistance}`);

        this.cameraPos = new THREE.Vector3();
    }

    tick(delta) {
        //*If camera position hasn't changed we don't need to do anything.
        if (this.cameraPos.equals(this.camera.position))
            return;
        this.cameraPos.copy(this.camera.position);

        //*Assume all chunks need to be deleted
        let chunksToDelete = new Set();
        this.chunks.forEach(chunk => chunksToDelete.add(chunk));

        //*Iterate over all chunks that should be loaded at the moment
        let minX = Math.ceil(-this.viewDistance / 2 + this.camera.position.x / this.chunkSize) * this.chunkSize;
        let maxX = Math.ceil(this.viewDistance / 2 + this.camera.position.x / this.chunkSize) * this.chunkSize;
        let minZ = Math.ceil(-this.viewDistance / 2 + this.camera.position.z / this.chunkSize) * this.chunkSize;
        let maxZ = Math.ceil(this.viewDistance / 2 + this.camera.position.z / this.chunkSize) * this.chunkSize;
        for (let z = minZ; z < maxZ; z += this.chunkSize)
            for (let x = minX; x < maxX; x += this.chunkSize) {
                //*Check if the chunk it already exists
                let found = false;
                let chunkToUpdate = null;
                this.chunks.forEach(chunk => {
                    if (chunk.position.x === x && chunk.position.z === z) {
                        found = true;
                        chunkToUpdate = chunk;
                    }
                })
                //*If it doesn't, create the chunk
                if (!found) {
                    chunkToUpdate = new Chunk({
                        camera: this.camera,
                        chunkSize: this.chunkSize,
                        x: x,
                        z: z,
                        material: this.material,
                        baseSegments: this.baseSegments,
                        terrainGen: this.terrainGen,
                        wireFrameOn: this.wireFrame,
                        baseFreq: this.baseFreq,
                        waterHeight: this.waterHeight,
                        treesCount: this.treesCount
                    });
                    this.add(chunkToUpdate.getMesh());
                    this.chunks.add(chunkToUpdate);
                }
                //*Remove it from the to delete list
                chunksToDelete.delete(chunkToUpdate);
                //*Update the LOD of the chunk
                chunkToUpdate.updateLOD();
            }

        //* Delete chunks that are still on the to delete list
        chunksToDelete.forEach(chunk => {
            this.remove(chunk.getMesh());
            this.chunks.delete(chunk);
        });
    }

    // //Print the lod's of all the loaded chunks
    // printMap() {
    //     let i = 0;
    //     let res = "";
    //     this.chunks.forEach(chunk => {
    //         res += chunk.level + " ";
    //         if ((i + 1) % this.viewDistance === 0)
    //             res += "\n";
    //         i++;
    //     });
    //     console.log(res);
    // }

}
