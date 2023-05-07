import * as THREE from 'three';

export function createLights(intensity = 8) {
    const light = new THREE.DirectionalLight('white', intensity);
    light.position.set(10, 10, 10);
    return light;
}