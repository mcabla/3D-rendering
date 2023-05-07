import * as THREE from 'three';

export function createDirectionalLight() {
    // A point light works better in our case, but this isn't ideal for further distances.
    const directionalLight = new THREE.PointLight(0xd4d2df, 1.2, 0);
    directionalLight.position.set(0, 100, -100);
    return directionalLight;
}
