import * as THREE from 'three';

export function createMeshCube(cubeSize) {
    const geometry = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
    const wireframe = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    // line.rotation.set(-1, 0, 3.14 / 3);
    line.position.set(0, 0, 0);
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    return line;
}