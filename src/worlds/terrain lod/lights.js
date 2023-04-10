import * as THREE from 'three';

export function createLights() {
    const light = new THREE.DirectionalLight('white', 2);
    light.position.set(10, 10, 10);

    light.castShadow = true; // Enable shadow casting on the light
    light.shadow.mapSize.width = 2048; // Set shadow map size
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1; // Set shadow camera properties
    light.shadow.camera.far = 100;
    return light;
}