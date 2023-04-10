import * as THREE from 'three';
import { Chunk } from './chunk.js';

export class ChunkManager {
    constructor(camera, scene, viewDistance, chunkSize) {
        this.camera = camera;
        this.scene = scene;
        this.chunkSize = chunkSize;
        this.chunks = [];
        this.viewDistance = Math.floor(viewDistance);

        if (this.viewDistance % 2 === 0 || this.viewDistance <= 0)
            throw new Error(`Viewdistance should be strictly positive odd number not ${this.viewDistance}`);
        let min = -Math.floor(viewDistance / 2);
        let max = Math.ceil(viewDistance / 2)
        for (let y = min; y < max; y++) {
            for (let x = min; x < max; x++) {
                let chunk = new Chunk(chunkSize, x * chunkSize, y * chunkSize);
                this.scene.add(chunk.createChunk());
                this.chunks.push(chunk);
            }

        }
    }

    tick(delta) {
        // console.log(`x: ${Math.round(this.camera.position.x)}, y: ${Math.round(this.camera.position.y)}, z: ${Math.round(this.camera.position.z)}`);

        let anyChange = false;
        for (let i = 0; i < this.chunks.length; i++) {
            let d = this.camera.position.distanceTo(this.chunks[i].position);
            let lod;
            switch (true) {
                case d <= 8:
                    lod = 4;
                    break;
                case d <= 10:
                    lod = 3;
                    break;
                default:
                    lod = 2;
            }
            //Update the LOD and check if it was different from the old value
            if (this.chunks[i].setLOD(lod))
                anyChange = true;
        }
        if (anyChange)
            this.printMap();
    }

    //Print the lod's of all the loaded chunks
    printMap() {
        let res = "";
        for (let i = 0; i < this.chunks.length; i++) {
            res += this.chunks[i].level + " ";
            if ((i + 1) % this.viewDistance === 0)
                res += "\n";
        }
        console.log(res);
    }

}