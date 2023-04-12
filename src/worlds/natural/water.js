import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

export function createWater(scene, height) {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('assets/images/waternormals.jpg', (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 0.1,
            fog: scene.fog !== undefined,
            alpha: 0.5,
            size: 0.1
        }
    );
    water.position.y = height;
    //zwater.rotation.x = - Math.PI / 2;
    water.tick = (delta) => {
        // increase the cube's rotation each frame
        water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
    };

    water.material.uniforms[ 'size' ].value = 200;
    water.material.uniforms[ 'alpha' ].value = 1.0;
    return water;
}
