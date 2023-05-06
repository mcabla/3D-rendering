import * as THREE from 'three';

export const fireParticle = new THREE.ShaderMaterial({
    uniforms: {
        colorLow: { value: new THREE.Color("yellow") },
        colorHigh: { value: new THREE.Color("orange") },
        fireHeight: {},
        fireSize: {},
        fireToSmokeRatio: {},
        firePosition: {}
    },
    vertexShader: `
        varying vec3 vColor;
        uniform vec3 colorLow;
        uniform vec3 colorHigh;
        uniform float fireHeight;
        uniform float fireSize;
        uniform float fireToSmokeRatio;
        uniform vec3 firePosition; 
    
        attribute float id;
        attribute float isSmoke;

        varying float vId; 
        varying float vIsSmoke;
        varying float vSize; 

        void main() {
            vId = id; 
            vIsSmoke = isSmoke; 
            if(vIsSmoke> 0.001)
                vSize =  fireSize*1.6*vId - 0.2*(position.y-firePosition.y);//smoke
            else
                vSize =  fireSize*3.2*vId - 2.0 *(position.y-firePosition.y);//fire        
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = vSize * (100.0 / -mvPosition.z); 
            gl_Position = projectionMatrix * mvPosition;
            vColor = mix(colorLow, colorHigh, vId *(position.y-firePosition.y) / ( fireSize /5.0 ));
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        varying float vId;
        varying float vIsSmoke;
        varying float vSize; 
        uniform float fireToSmokeRatio; 

        void main() {
            if(vSize < 0.00001) discard; 
            
            vec4 color; 
            if(vIsSmoke > 0.001)
                color = vec4(0.5,0.5,0.5, 1.0);//smoke
            else 
                color = vec4(vColor, 1.0);//fire
            
            
            gl_FragColor = color; 
        }
    `,
});

