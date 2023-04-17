import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const getSpruce = (onLoad) => {
    const loader = new GLTFLoader();
    loader.load( 'assets/models/spruce.glb', ( gltf ) => {
        const geometries = [];
        const materials = [];
        gltf.scene.traverse(obj => {
            console.log(obj);
            if (obj.geometry) {
                geometries.push(obj.geometry);
                materials.push(obj.material);
            }
        })

        onLoad(geometries, materials);

    } );
}
