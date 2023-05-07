import * as THREE from 'three';

export function createAmbientLight(color= 0xaaaa9a, intensity= 0.3) {
    return new THREE.AmbientLight(color, intensity);
}
