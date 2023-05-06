import * as THREE from 'three';
import { fireParticle } from '../materials/particleFire.js';


export class Fire {

    constructor({ scene, updatables, firePosition = { x: 0, y: 0, z: 0 }, fireSize = 5, fireToSmokeRatio = 0.9, opacity = 0.8, amount = 1000, fireHeight = 20, speed = 0.2 }) {
        const amountLogs = 3;

        const geometry = new THREE.BufferGeometry();
        //*Fill buffers
        const position = [];
        const positionStart = [];
        const id = [];
        const isSmoke = [];
        for (let i = 0; i < amount; i++) {


            let r = fireSize * (Math.random() - 0.5)
            if (Math.random() > fireToSmokeRatio) {
                r /= 2;
                isSmoke.push(1);
            } else
                isSmoke.push(0);


            const dir = Math.random() * 2 * Math.PI
            let x = firePosition.x + r * Math.cos(dir);
            let y = firePosition.y;
            let z = firePosition.z + r * Math.sin(dir);

            position.push(0, 0, 0);
            positionStart.push(x, y, z);
            id.push(Math.random());
        }

        //* Set attributes
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute("positionStart", new THREE.Float32BufferAttribute(positionStart, 3).setUsage(THREE.StaticReadUsage));
        geometry.setAttribute("id", new THREE.Float32BufferAttribute(id, 1).setUsage(THREE.StaticReadUsage));
        geometry.setAttribute("isSmoke", new THREE.Uint8BufferAttribute(isSmoke, 1).setUsage(THREE.StaticReadUsage));

        //*Configure material
        fireParticle.uniforms.fireToSmokeRatio.value = fireToSmokeRatio;
        fireParticle.uniforms.fireHeight.value = fireHeight;
        fireParticle.uniforms.fireSize.value = fireSize;
        fireParticle.uniforms.firePosition.value = new THREE.Vector3(firePosition.x, firePosition.y, firePosition.z);
        fireParticle.uniforms.opacity.value = opacity;
        this.pointManager = new THREE.Points(geometry, fireParticle);

        //Params
        const rangeFire = fireSize / 5;
        const rangeSmoke = rangeFire / 2;
        const speedFire = speed;
        const speedSmoke = speedFire / 2;


        //Get buffers
        let positions = geometry.attributes.position.array;
        let positionsStart = geometry.attributes.positionStart.array;
        let ids = geometry.attributes.id.array;
        let bools = geometry.attributes.isSmoke.array;

        const prime = 7247;//Prime number to break up patterns
        this.pointManager.tick = (delta) => {
            let time = Date.now();

            for (let i = 0; i < amount * 3; i += 3) {
                const id = ids[i / 3];
                let isSmoke = bools[i / 3];

                //TODO: You could move this to the shader as well.
                if (id> fireToSmokeRatio) {
                    //*Is smoke
                    //Set x
                    positions[i] = positionsStart[i] + rangeSmoke * Math.sin(speedSmoke * time / 1000 + 2 * Math.PI * id);
                    //Set z
                    positions[i + 2] = positionsStart[i + 2] + rangeSmoke * Math.cos(speedSmoke * time / 1000 + 2 * Math.PI * id);
                    //Set y
                    positions[i + 1] = positionsStart[i + 1] + (speedSmoke * time / 1000 + prime * id * fireHeight) % 2 * fireHeight;//smoke
                } else {
                    //*Is fire
                    //Set x
                    positions[i] = positionsStart[i] + rangeFire * Math.sin(2 * speedFire * time / 1000 + 2 * Math.PI * id);
                    //Set z
                    positions[i + 2] = positionsStart[i + 2] + rangeFire * Math.cos(2 * speedFire * time / 1000 + 2 * Math.PI * id);
                    //Set y 
                    positions[i + 1] = positionsStart[i + 1] + (speedFire * time / 1000 + prime * id * fireHeight) % 2 * fireHeight;//fire
                }
            }
            //Update geometry
            geometry.attributes.position.needsUpdate = true;

        }
        //Add point manager
        scene.add(this.pointManager);
        updatables.push(this.pointManager);

        //Add loggs 
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x332110,
            emissive: 0x332110, // Set a brighter emissive color
            emissiveIntensity: 0.5, // Adjust the intensity of the emissive color
            roughness: 1.0, // Increase the roughness value
            metalness: 0.0 // Decrease the metalness value
        });
        const cilinderMesh = new THREE.CylinderGeometry(0.16 * fireSize, 0.16 * fireSize, 1.6 * fireSize, 6);
        cilinderMesh.rotateX(Math.PI / 2);

        const logStart = new THREE.Mesh(cilinderMesh, woodMaterial);
        logStart.position.x = firePosition.x;
        logStart.position.y = firePosition.y - fireSize / 10;
        logStart.position.z = firePosition.z;
        for (let i = 0; i < amountLogs; i++) {
            const log = logStart.clone();
            log.rotation.y = Math.PI / amountLogs * i;
            scene.add(log);
        }

    }

}

