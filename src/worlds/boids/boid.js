import * as THREE from 'three';

export class Boid {
    constructor(boidSize, cubeSize, constantVel, camera) {
        this.cubeSize = cubeSize;
        this.constantVel = constantVel;
        this.camera = camera;
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
        //Push away from walls
        let avoidWallsForce = 0.1;
        let push = new THREE.Vector3();
        push.x = Math.min(0, this.cubeSize / 2 - this.pos.x) + Math.max(0, -this.pos.x - this.cubeSize / 2);
        push.y = Math.min(0, this.cubeSize / 2 - this.pos.y) + Math.max(0, -this.pos.y - this.cubeSize / 2);
        push.z = Math.min(0, this.cubeSize / 2 - this.pos.z) + Math.max(0, -this.pos.z - this.cubeSize / 2);
        this.vel.add(push.multiplyScalar(avoidWallsForce));


        //Push away from other boids that are too close
        //! Move hyperparameters
        let avoidForce = 0.01; //How hard are they pushed away from each other
        let minDistance = 1; //How close do they have to be before they are pushed
        //Check if you are not the leader boid
        if (boidid !== 0)
            for (let i = 0; i < boids.length; i++) {
                if (i !== boidid) {
                    //
                    // console.log("Push away from " + i);
                    let dist = this.pos.distanceTo(boids[i].pos);
                    if (dist < minDistance) {
                        push.x = this.pos.x - boids[i].pos.x;
                        push.y = this.pos.y - boids[i].pos.y;
                        push.z = this.pos.z - boids[i].pos.z;
                        push.normalize().multiplyScalar(avoidForce).divideScalar(dist + 0.00001);
                        // console.log(dist); 
                        // console.log(push);
                        this.vel.add(push);
                    }
                }
            }
        //Pull towards the center of the swarm
        //!Move hyperparam
        let attractForce = 0.2; //How hard are they pulled to the center of the swarm
        push.x = center.x - this.pos.x;
        push.y = center.y - this.pos.y;
        push.z = center.z - this.pos.z;
        push.normalize();
        this.vel.add(push.multiplyScalar(attractForce));


        // Set speed to constant value
        this.vel.normalize().multiplyScalar(this.constantVel);

        this.pos.add(this.vel.clone().multiplyScalar(delta));
        this.mesh.lookAt(this.pos);
        this.mesh.rotateY(Math.PI / 2);
        this.mesh.rotateZ(Math.PI / 2);
        this.mesh.position.copy(this.pos);

        //Change color based on if facing camera
        // var planeVector = (new THREE.Vector3(0, 0, 1)).applyQuaternion(this.mesh.quaternion);
        // var cameraVector = (new THREE.Vector3(0, 0, -1)).applyQuaternion(this.camera.quaternion);
        // if (planeVector.angleTo(cameraVector) > Math.PI / 2)
        //     this.mesh.material.color.setHex(0xff0000);
        // else
        //     this.mesh.material.color.setHex(0x000000);
    }


}
