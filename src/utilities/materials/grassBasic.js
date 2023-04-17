import * as THREE from 'three';


export const grassBasic = new THREE.MeshPhysicalMaterial({
    color: 0x229E03, // Green color
    roughness: 1, // Adjust this value to control the roughness of the grass
    metalness: 0, // Adjust this value to control the metalness of the grass
    emissive: 0x112211
});


// this.material = new THREE.MeshLambertMaterial({
//     color: 0x114F02, 
//     emissive: 0x001F00, 
// });