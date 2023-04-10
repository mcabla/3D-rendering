import * as THREE from 'three';

// Define the two textures to blend
const stone = new THREE.TextureLoader().load('assets/images/stone.jpg');
stone.wrapS = THREE.RepeatWrapping;
stone.wrapT = THREE.RepeatWrapping;
stone.repeat.set(0.05, 0.05); // scale down by a factor of 20
const grass = new THREE.TextureLoader().load('assets/images/grass.jpg');
grass.wrapS = THREE.RepeatWrapping;
grass.wrapT = THREE.RepeatWrapping;
grass.repeat.set(0.05, 0.05); // scale down by a factor of 20
const dirt = new THREE.TextureLoader().load('assets/images/dirt.jpg');
dirt.wrapS = THREE.RepeatWrapping;
dirt.wrapT = THREE.RepeatWrapping;
dirt.repeat.set(0.05, 0.05); // scale down by a factor of 20

// Define the custom shader material
export const terrainMaterial = new THREE.ShaderMaterial({
    uniforms: {
        stoneTexture: { type: "t", value: stone },
        grassTexture: { type: "t", value: grass },
        dirtTexture: { type: "t", value: dirt },
        blendDistance: { type: "f", value: 5.0 },
        waterLevel: { type: "float", value: -0.2 },
        waterLevel2: { type: "float", value: 0.0 }
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vNormal = normal;
            vPosition = position;
            // 1) Postion our geometry - coordinates your object begins in.
            vec4 localPosition = vec4(position, 1.0);
            // 2) Transform the local coordinates to world-space coordinates
            vec4 worldPosition = modelMatrix * localPosition;
            // 3) Transform the world coordinates to view-space coordinates - seen from the camera/viewer point of view
            vec4 viewPosition = viewMatrix * worldPosition;
            // 4) Project view coordinates to clip coordinates and transform to screen coordinates
            vec4 clipPosition = projectionMatrix * viewPosition;
            gl_Position = clipPosition;
        }
    `,
    fragmentShader: /* glsl */`
        uniform sampler2D stoneTexture;
        uniform sampler2D grassTexture;
        uniform sampler2D dirtTexture;
        uniform float blendDistance;
        uniform float waterLevel;
        uniform float waterLevel2;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {            
            float angle = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
            vec4 stoneTexel = texture2D(stoneTexture, vUv  * 20.0);
            vec4 grassTexel = texture2D(grassTexture, vUv * 20.0);
            vec4 dirtTexel = texture2D(dirtTexture, vUv * 20.0);
            vec4 steepnessTexel = mix(stoneTexel, grassTexel, smoothstep(.3, 0.8, angle));
            gl_FragColor = mix(dirtTexel,steepnessTexel, smoothstep(waterLevel, waterLevel2, vPosition.z));
        }
        `,
    receiveShadow: true,
    castShadow: true,
});
