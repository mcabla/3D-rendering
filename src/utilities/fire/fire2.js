import * as THREE from 'three';
import { materialParticle } from '../materials/particleFire.js';

//*For the most realistic looking results the amount should not be bigger than 5x the cloudsize


export class Fire2 {

    constructor({ scene, updatables, fireToSmokeRatio = 0.9, amountLogs = 3, amount = 1000, fireHeight = 20, speed = 0.5, cloudSize = 5 }) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const positionsStart = [];
        const id = [];

        for (let i = 0; i < amount; i++) {
            //Buffer so can't use fancy datatypes!

            let r = cloudSize * (Math.random() - 0.5)
            if (id > fireToSmokeRatio)
                r /= 2;

            const dir = Math.random() * 2 * Math.PI
            let x = r * Math.cos(dir);
            let z = r * Math.sin(dir);

            positions.push(x, 0, z);
            positionsStart.push(x, 0, z);
            id.push(Math.random());
        }

        //* Set attributes
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute("positionStart", new THREE.Float32BufferAttribute(positionsStart, 3));//TODO: Change to read only 
        geometry.setAttribute("id", new THREE.Float32BufferAttribute(id, 1));

        //*Configure material
        console.log(fireToSmokeRatio);
        materialParticle.uniforms.fireToSmokeRatio.value = fireToSmokeRatio;
        this.pointManager = new THREE.Points(geometry, materialParticle);


        //Params
        const rangeFire = 1;
        const rangeSmoke = 0.5;
        const speedFire = speed;
        const speedSmoke = speed / 2;
        this.pointManager.tick = (delta) => {
            let time = Date.now();
            //Get buffers
            let positions = geometry.attributes.position.array;
            let positionsStart = geometry.attributes.positionStart.array;
            let ids = geometry.attributes.id.array;
            // console.log(ids);
            for (let i = 0; i < amount * 3; i += 3) {
                const id = ids[i / 3]

                //TODO:  Move to shader maybe? 
                if (id > fireToSmokeRatio) {
                    //*Is smoke
                    //Set x
                    positions[i] = positionsStart[i] + rangeSmoke * Math.sin(speed * time / 1000 + 2 * Math.PI * id);
                    //Set z
                    positions[i + 2] = positionsStart[i + 2] + rangeSmoke * Math.cos(speed * time / 1000 + 2 * Math.PI * id);
                    //Set y
                    positions[i + 1] = (speedSmoke * time / 1000 + id * 2 * fireHeight) % 2 * fireHeight;//smoke
                } else {
                    //*Is fire
                    //Set x
                    positions[i] = positionsStart[i] + rangeFire * Math.sin(speed * time / 1000 + 2 * Math.PI * id);
                    //Set z
                    positions[i + 2] = positionsStart[i + 2] + rangeFire * Math.cos(speed * time / 1000 + 2 * Math.PI * id);
                    //Set y 
                    positions[i + 1] = (speed * time / 1000 + id * 2 * fireHeight) % 2 * fireHeight;//fire
                }


            }
            //Update geometry
            geometry.attributes.position.needsUpdate = true;

        }
        //Add point manager
        scene.add(this.pointManager);
        updatables.push(this.pointManager);

        //Add loggs 
        const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x332110 });
        const cilinderMesh = new THREE.CylinderGeometry(0.8, 0.8, 8, 6);
        cilinderMesh.rotateX(Math.PI / 2);
        cilinderMesh.translate(0, -1, 0);
        const logStart = new THREE.Mesh(cilinderMesh, woodMaterial);
        for (let i = 0; i < amountLogs; i++) {
            const log = logStart.clone();
            log.rotation.y = Math.PI / amountLogs * i;
            scene.add(log);
        }

    }

}

