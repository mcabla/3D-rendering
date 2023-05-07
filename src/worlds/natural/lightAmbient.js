import * as THREE from 'three';

export function createAmbientLight(color= 0xfff9b2, intensity= 0.1) {
    return new THREE.AmbientLight(color, intensity);
}
