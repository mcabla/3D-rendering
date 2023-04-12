import * as THREE from 'three';
import { Chunk } from './chunk.js';


export class ChunkManager {
    constructor({ camera, scene, viewDistance, chunkSize, wireFrame = false, material, baseFreq = 1, waterHeight = 0.0, trees = false }) {
        this.camera = camera;
        this.scene = scene;
        this.viewDistance = Math.floor(viewDistance);
        this.chunkSize = chunkSize;
        this.wireFrame = wireFrame;
        this.material = material;
        this.baseFreq = baseFreq;
        this.waterHeight = waterHeight;
        this.trees = trees;
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
        let minY = Math.ceil(-this.viewDistance / 2 + this.camera.position.y / this.chunkSize) * this.chunkSize;
        let maxY = Math.ceil(this.viewDistance / 2 + this.camera.position.y / this.chunkSize) * this.chunkSize;
        for (let y = minY; y < maxY; y += this.chunkSize)
            for (let x = minX; x < maxX; x += this.chunkSize) {
                //*Check if the chunk it already exists
                let found = false;
                let chunkToUpdate = null;
                this.chunks.forEach(chunk => {
                    if (chunk.position.x === x && chunk.position.y === y) {
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
                        y: y,
                        wireFrameOn: this.wireFrame,
                        material: this.material,
                        baseFreq: this.baseFreq,
                        waterHeight: this.waterHeight,
                        trees: this.trees
                    });
                    this.scene.add(chunkToUpdate.getMesh());
                    this.chunks.add(chunkToUpdate);
                }
                //*Remove it from the to delete list
                chunksToDelete.delete(chunkToUpdate);
                //*Update the LOD of the chunk
                chunkToUpdate.tick(delta);
            }

        //* Delete chunks that are still on the to delete list
        chunksToDelete.forEach(chunk => {
            this.scene.remove(chunk.getMesh());
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
