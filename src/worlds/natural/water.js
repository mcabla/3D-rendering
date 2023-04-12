import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

export function createWater(scene, height) {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
        waterGeometry,
        {
            textureWidth: 1024,
            textureHeight: 1024,
            waterNormals: new THREE.TextureLoader().load('assets/images/waternormals.jpg', (texture) => {
                // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 0.1,
            fog: scene.fog !== undefined,
        }
    );
    water.position.z = height;
    //zwater.rotation.x = - Math.PI / 2;
    water.tick = (delta) => {
        // increase the cube's rotation each frame
        water.material.uniforms[ 'time' ].value += delta;
    };
    return water;
}
