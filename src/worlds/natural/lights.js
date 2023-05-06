import * as THREE from 'three';

export function createLights() {
    const directionalLight = new THREE.DirectionalLight('white', 1);
    directionalLight.position.set(10, 10, 10);
    const ambientLight = new THREE.AmbientLight(0xfff9b2, .9);
    const group = new THREE.Group();
    group.add(directionalLight);
    group.add(ambientLight);
    return group;
}
