import * as THREE from 'three';

export function createDirectionalLight() {
    const directionalLight = new THREE.DirectionalLight('white', 2);
    directionalLight.position.set(0, 100, -100);
    return directionalLight;
}
