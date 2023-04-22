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
            fog: scene.fog !== undefined
        }
    );
    water.material.uniforms.size.value = 10; //*Can't set this in the constructor directly? 
    water.rotation.x = - Math.PI / 2;

    //*Enable transparancy
    water.material.uniforms.alpha.value = 0.85;
    water.material.transparent = true;
    
    
    water.tick = (delta) => {
        water.material.uniforms['time'].value += 0.5 * delta;
    };
    water.position.y = height;
    return water;
}