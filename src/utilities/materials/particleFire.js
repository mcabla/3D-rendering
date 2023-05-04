import * as THREE from 'three';

export const materialParticle = new THREE.ShaderMaterial({
    uniforms: {
        colorLow: { value: new THREE.Color("yellow") },
        colorHigh: { value: new THREE.Color("red") },
        maxHeight: { value: 20.0 },
        fireToSmokeRatio: {value: 0.9}
    },
    vertexShader: `
        varying vec3 vColor;
        uniform vec3 colorLow;
        uniform vec3 colorHigh;
        uniform float maxHeight;
        uniform float fireToSmokeRatio;
    

        attribute float id;
        varying float vId; 
        varying float vSize; 

        void main() {
            
            vId = id; 
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            
            
            if(vId>fireToSmokeRatio){
                vSize =  2.0*(4.0*vId - 0.1*mvPosition.y);//smoke
            }
            else{
                vSize =  2.0*(4.0*vId - 0.2*mvPosition.y);//fire        
            }
            gl_PointSize = vSize * (100.0 / -mvPosition.z); 
            gl_Position = projectionMatrix * mvPosition;
            vColor = mix(colorLow, colorHigh, vId *position.y / maxHeight);
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        varying float vId;
        varying float vSize; 
        uniform float fireToSmokeRatio; 

        void main() {
            if(vSize < 0.01) discard; 
            
            vec4 color; 
            if(vId>fireToSmokeRatio){
                color = vec4(0.5,0.5,0.5, 1.0);//grey
            }
            else {
                color = vec4(vColor, 1.0);
            }
            
            gl_FragColor = color; 
        }
    `,
});

