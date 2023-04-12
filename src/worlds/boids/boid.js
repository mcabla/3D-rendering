import * as THREE from 'three';

export class Boid {
    constructor({
        boidSize,
        cubeSize,
        camera,
        boidBehavior = {
            constantVel: 1, //How fast the boids move at all times
            gravity: 0.005, //How much the boids are affected by gravity
            attractForce: 0.02, //How hard are they pulled to the center of the swarm
            minDistance: 1, //How close do they have to be before they are considered neighbours
            avoidForce: 0.01,//Only neighbours: How hard are they pushed away from their neighbours
            conformDirection: 0.001 //Only neighbours: How much the boids want to match the direction/heading of their neighbours
        }
    }) {
        this.cubeSize = cubeSize;
        this.camera = camera;
        this.boidBehavior = boidBehavior;
        this.boidShape = new THREE.Shape()
            .moveTo(0, 2 * boidSize)
            .lineTo(boidSize, -boidSize)
            .lineTo(0, 0)
            .lineTo(-boidSize, -boidSize)
            .lineTo(0, 2 * boidSize);

        this.geometry = new THREE.ShapeGeometry(this.boidShape);
        this.materialBoth = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(this.geometry, this.materialBoth);
        this.vel = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        this.pos = new THREE.Vector3();
    }
    createBoid() {
        return this.mesh;
    }
    update(boids, center, boidid, delta) {
        //*Push away from walls
        let avoidWallsForce = 0.1;
        let push = new THREE.Vector3();
        push.x = Math.min(0, this.cubeSize / 2 - this.pos.x) + Math.max(0, -this.pos.x - this.cubeSize / 2);
        push.y = Math.min(0, this.cubeSize / 2 - this.pos.y) + Math.max(0, -this.pos.y - this.cubeSize / 2);
        push.z = Math.min(0, this.cubeSize / 2 - this.pos.z) + Math.max(0, -this.pos.z - this.cubeSize / 2);
        this.vel.add(push.multiplyScalar(avoidWallsForce));

        //*Apply forces for which we need to check every other boid (O(n^2) -> expensive)
        for (let i = 0; i < boids.length; i++) {
            if (i !== boidid) {
                // console.log("Push away from " + i);
                let dist = this.pos.distanceTo(boids[i].pos);
                //Check if they are neighbours and if we need to do more calculations
                if (dist < this.boidBehavior.minDistance) {
                    //*Push away from neighbours
                    push.x = this.pos.x - boids[i].pos.x;
                    push.y = this.pos.y - boids[i].pos.y;
                    push.z = this.pos.z - boids[i].pos.z;
                    push.normalize().multiplyScalar(this.boidBehavior.avoidForce).divideScalar(dist + 0.00001);
                    this.vel.add(push);

                    //*Try to move in a similar direction as your neighbours
                    push.copy(boids[i].vel).normalize().multiplyScalar(0.001).divideScalar(dist + 0.00001);
                    this.vel.add(push);
                }
            }
        }
        //*Pull towards the center of the swarm
        push.x = center.x - this.pos.x;
        push.y = center.y - this.pos.y;
        push.z = center.z - this.pos.z;
        push.normalize();
        this.vel.add(push.multiplyScalar(this.boidBehavior.attractForce));

        //*Pull towards tje ground
        this.vel.z -= this.boidBehavior.gravity;

        //* Set speed to constant value
        this.vel.normalize().multiplyScalar(this.boidBehavior.constantVel);

        this.pos.add(this.vel.clone().multiplyScalar(delta));
        this.mesh.lookAt(this.pos);
        this.mesh.rotateY(Math.PI / 2);
        this.mesh.rotateZ(Math.PI / 2);
        this.mesh.position.copy(this.pos);

        //*Change color based on if facing camera
        // var planeVector = (new THREE.Vector3(0, 0, 1)).applyQuaternion(this.mesh.quaternion);
        // var cameraVector = (new THREE.Vector3(0, 0, -1)).applyQuaternion(this.camera.quaternion);
        // if (planeVector.angleTo(cameraVector) > Math.PI / 2)
        //     this.mesh.material.color.setHex(0xff0000);
        // else
        //     this.mesh.material.color.setHex(0x000000);
    }


}
