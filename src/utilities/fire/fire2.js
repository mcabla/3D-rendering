import * as THREE from 'three';
import { materialParticle } from '../materials/particleFire.js';

//*For the most realistic looking results the amount should not be bigger than 5x the cloudsize


export class Fire2 {

    constructor({ scene, updatables, amountLogs = 3, amount = 1000, fireHeight = 20, speed = 5, cloudSize = 5 }) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const id = [];

        for (let i = 0; i < amount; i++) {
            //Buffer so can't use fancy datatypes!
            positions.push(cloudSize * (Math.random() - 0.5),2* fireHeight * Math.random(), cloudSize * (Math.random() - 0.5));
            id.push(Math.random());
        }

        //*You can't choose these names, threejs needs position to be position to understand it!
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute("id", new THREE.Float32BufferAttribute(id, 1));


        // materialParticle.uniforms.pointTexture.value = new THREE.TextureLoader().load('assets/images/sprites/particleFire.png');
        this.pointManager = new THREE.Points(geometry, materialParticle);
        const p = new THREE.Vector3();//Help vector
        this.pointManager.tick = (delta) => {
            const time = Date.now();
            //Get buffers
            let positions = geometry.attributes.position.array;

            let ids = geometry.attributes.id.array;
            // console.log(ids);
            for (let i = 0; i < amount * 3; i += 3) {
                const id = ids[i / 3]
                p.x = positions[i]; p.y = positions[i + 1]; p.z = positions[i + 2];


                //*Adjust position;
                //Change x
                positions[i] += delta * speed / 5 * Math.sin(p.y + 2 * Math.PI * id);
                //Change z
                positions[i + 2] += delta * speed / 5 * Math.cos(p.y + 2 * Math.PI * id);
                //Change y
                let offset = 1 + (id - 0.5) * 0.5;
                positions[i + 1] += speed * delta * offset;

                //! move to shader
                //*Respawn if too far
                if (positions[i + 1] > 2*fireHeight) {
                    let r = cloudSize * (Math.random() - 0.5)
                    if (id > 0.8) {
                        r /= 2;
                    }
                    const dir = Math.random() * 2 * Math.PI
                    positions[i] = r * Math.cos(dir);
                    positions[i + 1] = 0;
                    positions[i + 2] = r * Math.sin(dir);
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

