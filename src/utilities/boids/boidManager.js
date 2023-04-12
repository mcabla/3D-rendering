import * as THREE from 'three';
import { Boid } from './boid.js';

export class BoidManager {
    constructor({
        camera,
        scene,
        amount,
        cubeSize,
        floorHeight,
        boidMesh,
        boidBehavior
    }) {
        this.camera = camera;
        this.scene = scene;
        this.amount = amount;
        this.boids = [];
        for (let i = 0; i < this.amount; i++) {
            let boid = new Boid({
                cubeSize: cubeSize,
                floorHeight: floorHeight,
                camera: camera,
                boidMesh: boidMesh,
                boidBehavior: boidBehavior
            });
            this.scene.add(boid.createBoid());
            this.boids.push(boid);
        }
    }

    tick(delta) {
        let center = this.calculateCentroid();//This makes it so the boids want to go towards the center of the swarm
        // let center = this.boids[0].pos; //This implements a "leader" boid that everyone follow
        for (let i = 0; i < this.amount; i++)
            this.boids[i].update(this.boids, center, i, delta);
    }

    calculateCentroid() {
        let pos = new THREE.Vector3();
        for (let i = 0; i < this.amount; i++)
            pos.add(this.boids[i].pos);
        return pos.divideScalar(this.boids.length);
    }

}