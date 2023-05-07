import * as THREE from 'three';

export function createAmbientLight(color= 0xaaaaaa, intensity= 0.2) {
    return new THREE.AmbientLight(color, intensity);
}
