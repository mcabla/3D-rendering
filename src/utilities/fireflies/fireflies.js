import * as THREE from 'three';
import { materialParticle } from '../../utilities/materials/particle.js';

//*For the most realistic looking results the amount should not be bigger than 5x the cloudsize
export function createFireflies({ amount = 100, sizeScale = 1, cloudSize = 20 }) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const id = [];
    const sizes = [];
    for (let i = 0; i < amount; i++) {
        //Buffer so can't use fancy datatypes!
        positions.push(cloudSize * (Math.random() - 0.5), cloudSize * (Math.random() - 0.5), cloudSize * (Math.random() - 0.5));
        id.push(Math.random() * 2 * Math.PI);
        sizes.push(0);
    }

    //*You can't choose these names, threejs needs position to be position to understand it!
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("id", new THREE.Float16BufferAttribute(id, 1));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));

    const pointManager = new THREE.Points(geometry, materialParticle);
    const p = new THREE.Vector3();//Help vector
    pointManager.tick = (delta) => {
        const time = Date.now();
        //Get buffers
        let positions = geometry.attributes.position.array;
        let sizes = geometry.attributes.size.array;
        let ids = geometry.attributes.id.array;

        for (let i = 0; i < amount * 3; i += 3) {
            p.x = positions[i]; p.y = positions[i + 1]; p.z = positions[i + 2];
            //*Adjust size based on time and id
            sizes[i / 3] = sizeScale * (1 + 0.5 * Math.cos(ids[i / 3] + time / 2000));

            //*Adjust position;
            //Change x
            positions[i] += delta * Math.sin(p.y);
            //Change z
            positions[i + 2] += delta * Math.cos(p.y);
            //Change y
            positions[i + 1] += delta * Math.cos(p.x);

            //*Respawn if too far
            if (p.length() > cloudSize * 1.2) {
                positions[i] = cloudSize * (Math.random() - 0.5);
                positions[i + 1] = cloudSize * (Math.random() - 0.5);
                positions[i + 2] = cloudSize * (Math.random() - 0.5);
            }
        }
        //Update geometry
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
    }
    return pointManager;
}