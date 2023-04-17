import * as THREE from 'three';

// Define the custom shader material
export const terrainTypeFadedMaterial = new THREE.ShaderMaterial({
    uniforms: {
        stoneColor: { type: "c", value: new THREE.Color(0x808080) },
        grassColor: { type: "c", value: new THREE.Color(0x00ff00) },
        sandColor: { type: "c", value: new THREE.Color(0xffff00) },
        stoneAngle: { type: "float", value: 0.5 },
        grassAngle: { type: "float", value: 1.1 },
        waterLevel: { type: "float", value: -0.2 },
        surfaceLevel: { type: "float", value: 0.0 }
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vTangent;
        varying vec3 vBitangent;

        void main() {
            vUv = uv;
            vNormal = normal;
            
            // calculate tangent and bitangent
            vec3 objectNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
            vec3 tangent;
            if (abs(objectNormal.y) < 0.999) {
                tangent = normalize(cross(objectNormal, vec3(0.0, 1.0, 0.0)));
            } else {
                tangent = normalize(cross(objectNormal, vec3(0.0, 0.0, 1.0)));
            }
            vTangent = tangent;
            vBitangent = cross(objectNormal, tangent);
            
            vPosition = position;
            vec4 localPosition = vec4(position, 1.0);
            vec4 worldPosition = modelMatrix * localPosition;
            vec4 viewPosition = viewMatrix * worldPosition;
            vec4 clipPosition = projectionMatrix * viewPosition;
            gl_Position = clipPosition;
        }
    `,
    fragmentShader: /* glsl */`
        uniform vec3 stoneColor;
        uniform vec3 grassColor;
        uniform vec3 sandColor;

        uniform float stoneAngle;
        uniform float grassAngle;
        uniform float waterLevel;
        uniform float surfaceLevel;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vTangent;
        varying vec3 vBitangent;

        void main() {            
            float angle = dot(normalize(vNormal), vec3(0.0, 1.0, 0.0));
            
            vec4 stoneTexel = vec4(stoneColor, 1.0);
            vec4 grassTexel = vec4(grassColor, 1.0);
            vec4 sandTexel = vec4(sandColor, 1.0);

            vec4 heightTexel = mix(sandTexel, grassTexel, smoothstep(waterLevel, surfaceLevel, vPosition.y));
            
            vec4 texel = mix(stoneTexel, heightTexel, smoothstep(stoneAngle, grassAngle, angle)); 

            gl_FragColor = vec4(texel.xyz, texel.a);
        }
        `,
});
