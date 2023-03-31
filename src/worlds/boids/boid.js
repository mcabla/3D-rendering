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
    tick(delta) {
        //Push away from walls
        let f = Math.min(0, this.cubeSize / 2 - this.pos.x);
        f += Math.max(0, -this.pos.x - this.cubeSize / 2);
        this.vel.x += f;

        f = Math.min(0, this.cubeSize / 2 - this.pos.y);
        f += Math.max(0, -this.pos.y - this.cubeSize / 2);
        this.vel.y += f;

        f = Math.min(0, this.cubeSize / 2 - this.pos.z);
        f += Math.max(0, -this.pos.z - this.cubeSize / 2);
        this.vel.z += f;

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
