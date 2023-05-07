import * as THREE from 'three';

export function createAmbientLight() {
    const ambientLight = new THREE.AmbientLight(0xfff9b2, .1);
    return ambientLight;
}
