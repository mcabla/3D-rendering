import * as THREE from 'three';
import { Boid } from './boid.js';

export class BoidManager {
    constructor(camera, scene, amount, boidSize, cubeSize, constantVel) {
        this.camera = camera;
        this.scene = scene;

        this.amount = amount;
        this.boidSize = boidSize;
        this.cubeSize = cubeSize;
        this.constantVel = constantVel;
        this.boids = [];

        for (let i = 0; i < this.amount; i++) {
            let boid = new Boid(this.boidSize, this.cubeSize, this.constantVel, this.camera);
            this.scene.add(boid.createBoid());
            this.boids.push(boid);
        }
    }

    tick(delta) {
        // let center = this.calculateCentroid();
        let center = this.boids[0].pos;
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