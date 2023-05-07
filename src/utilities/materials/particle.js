import * as THREE from 'three';

export const materialParticle = new THREE.ShaderMaterial({
    uniforms: {
        pointTexture: {
            value: new THREE.TextureLoader().load('assets/images/sprites/firefly2.png')
        },
        opacity: { value: 1 }
    },
    vertexShader: /* glsl */`
        attribute float size;
        varying float vSize;
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            vSize = gl_PointSize; 
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: /* glsl */`
        uniform sampler2D pointTexture;
        uniform float opacity;
        varying float vSize; 
        void main(){
            if(vSize < 0.00001) discard; 
            vec4 texColor = texture2D(pointTexture, gl_PointCoord);
            gl_FragColor = vec4(1.0, 1.0, 1.0, opacity) * texColor;
        }
    `,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    vertexColors: true
});