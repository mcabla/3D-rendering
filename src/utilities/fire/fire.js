import * as THREE from 'three';
import { materialParticle } from '../materials/particle.js';

//*For the most realistic looking results the amount should not be bigger than 5x the cloudsize


export class Fire {

    constructor({ scene, updatables, amountLogs = 3, amount = 100, fireHeight = 10, speed = 5, cloudSize = 5 }) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const id = [];
        const sizes = [];
        for (let i = 0; i < amount; i++) {
            //Buffer so can't use fancy datatypes!
            positions.push(cloudSize * (Math.random() - 0.5), fireHeight * Math.random(), cloudSize * (Math.random() - 0.5));
            id.push(Math.random() * 2 * Math.PI);
            sizes.push(0);
        }

        //*You can't choose these names, threejs needs position to be position to understand it!
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute("id", new THREE.Float16BufferAttribute(id, 1));
        geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));

        this.pointManager = new THREE.Points(geometry, materialParticle);
        const p = new THREE.Vector3();//Help vector
        this.pointManager.tick = (delta) => {
            const time = Date.now();
            //Get buffers
            let positions = geometry.attributes.position.array;
            let sizes = geometry.attributes.size.array;
            let ids = geometry.attributes.id.array;

            for (let i = 0; i < amount * 3; i += 3) {
                p.x = positions[i]; p.y = positions[i + 1]; p.z = positions[i + 2];
                //*Adjust size based on height and id
                sizes[i / 3] = Math.max(0, 2 * (ids[i / 3] - 0.5 * positions[i + 1]));

                //*Adjust position;
                //Change x
                positions[i] += delta * speed / 5 * Math.sin(p.y);
                //Change z
                positions[i + 2] += delta * speed / 5 * Math.cos(p.y);
                //Change y
                positions[i + 1] += speed * delta;

                //*Respawn if too far
                if (positions[i + 1] > fireHeight) {
                    positions[i] = cloudSize * (Math.random() - 0.5);
                    positions[i + 1] = 0;
                    positions[i + 2] = cloudSize * (Math.random() - 0.5);
                }
            }
            //Update geometry
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.size.needsUpdate = true;


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

