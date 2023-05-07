import * as THREE from 'three';
import { materialParticle } from '../materials/particle.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

//Inspired by: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_custom_attributes_particles.html

export class CloudManager extends THREE.Group {

    constructor({ camera, cloudLevel = 3, particleCount = 10000, cloudfieldSize = 50, perlinFreq = 0.1 }) {
        super();
        this.cameraPos = camera.position;
        this.cloudLevel = cloudLevel;
        this.particleCount = particleCount;//Needs to have an integer square root
        this.cloudfieldSize = cloudfieldSize;
        this.perlinFreq = perlinFreq;

        this.geometry = new THREE.BufferGeometry();
        const positions = [];
        const sizes = [];
        this.perlin = new ImprovedNoise();

        const root = Math.sqrt(this.particleCount);
        for (let x = 0; x < root; x++) {
            for (let z = 0; z < root; z++) {
                const xPos = (x / root - 0.5) * this.cloudfieldSize;
                const yPos = this.cloudLevel;
                const zPos = (z / root - 0.5) * this.cloudfieldSize;
                //Buffer so can't use fancy datatypes!
                positions.push(xPos, yPos, zPos);
                sizes.push(0);
            }
        }

        //*You can't choose the name of position and size, otherwise treejs doesn't know what they mean
        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.StaticReadUsage));
        this.geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));

        materialParticle.uniforms.opacity.value = 0.05;//Make clouds transparent
        materialParticle.uniforms.pointTexture.value = new THREE.TextureLoader().load('assets/images/sprites/cloudparticle1.png');
        this.pointManager = new THREE.Points(this.geometry, materialParticle);
        this.add(this.pointManager);
    }

    tick = (delta) => {
        // Get buffers
        let positions = this.geometry.attributes.position.array;
        let sizes = this.geometry.attributes.size.array;
        for (let i = 0; i < this.particleCount * 3; i += 3) {
            //*Get particle position
            let xPos = positions[i] + this.cameraPos.x;
            let zPos = positions[i + 2] + this.cameraPos.z;
            //*Adjust size
            let xP = xPos * this.perlinFreq + Date.now() / 50000;
            let zP = zPos * this.perlinFreq + Date.now() / 50000;
            const p = this.perlin.noise(xP, 0, zP);
            sizes[i / 3] = this.calculateParticlesize(p)
        }
        //Update geometry
        this.geometry.attributes.size.needsUpdate = true;
        //Go to camera
        this.pointManager.position.x = this.cameraPos.x;
        this.pointManager.position.z = this.cameraPos.z;
    }

    calculateParticlesize(input) {
        if (input > 0.2)
            return input * 20;
        else
            return 0;
    }

}

