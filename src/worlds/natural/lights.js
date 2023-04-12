import * as THREE from 'three';

export function createLights() {
    const light = new THREE.DirectionalLight('white', 1);
    light.position.set(10, 10, 10);
    return light;
}
