import * as THREE from 'three';

const onLoad = (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.05, 0.05);
};

// Define the two textures to blend
const stone = new THREE.TextureLoader().load('assets/images/rocks2-seamless.jpg', onLoad);

//*Grass
const grass = new THREE.TextureLoader().load('assets/images/grass2-seamless2-bright.jpg', onLoad);

//*Dirt
const dirt = new THREE.TextureLoader().load('assets/images/sand-seamless.jpg', onLoad);

// Define the custom shader material
export const terrainTropic = new THREE.ShaderMaterial({
    uniforms: {
        stoneTexture: { type: "t", value: stone },

        grassTexture: { type: "t", value: grass },

        dirtTexture: { type: "t", value: dirt },

        lowestGrass: { type: "float", value: -0.05 },
        highestSand: { type: "float", value: 0.1 },
        sunColor: { type: "c", value: new THREE.Color(0xffffff) },
        ambientColor: { type: "c", value: new THREE.Color(0xaaaaaa) },
        sunDirection: { type: "v3", value: new THREE.Vector3(0.70707, 0.70707, 0.0) }
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
        uniform sampler2D stoneTexture;
        uniform sampler2D grassTexture;
        uniform sampler2D dirtTexture;
        
        uniform float lowestGrass;
        uniform float highestSand;
        
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        uniform vec3 ambientColor;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vTangent;
        varying vec3 vBitangent;
        
        void main() {            
            float angle = dot(normalize(vNormal), vec3(0.0, 1.0, 0.0));
            
            //mod(vUv.x, 4.0)*2.0
            float randAngle = ceil(mod(vUv.x*20.0, 4.0))*0.785398163397;
            vec2 rotatedUv = vec2(cos(randAngle) * (vUv.x - 0.5) - sin(randAngle) * (vUv.y - 0.5) + 0.5, sin(randAngle) * (vUv.x - 0.5) + cos(randAngle) * (vUv.y - 0.5) + 0.5);

            vec4 stoneTexel = texture2D(stoneTexture, rotatedUv  * 20.0);
            vec4 grassTexel = texture2D(grassTexture,  rotatedUv * 20.0);
            vec4 dirtTexel = texture2D(dirtTexture, vUv * 20.0);       
            
            vec4 steepnessTexel = mix(stoneTexel, grassTexel, smoothstep(.5, .9, angle));
            
            vec4 texel = mix(dirtTexel,steepnessTexel, smoothstep(lowestGrass, highestSand, vPosition.y));
            
            vec3 normal = normalize(vNormal);
            vec3 tangent = normalize(vTangent);
            vec3 bitangent = normalize(vBitangent);
            
            vec3 mapNormal = normalize(vec3(128.0)) * mat3(bitangent, tangent, normal);
            vec3 lightDirection = normalize(-sunDirection);
            float diffuse = max(0.0, dot(mapNormal, lightDirection)); 
            
            vec3 ambient = ambientColor * texel.xyz;

            vec3 sunLight = sunColor * diffuse * texel.xyz;
        
            gl_FragColor = vec4(ambient + sunLight, texel.a);
        }
        `,
    receiveShadow: true,
    castShadow: true,
});
