import * as THREE from 'three';

const onLoad = (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.05, 0.05);
};

// Define the two textures to blend
const stone = new THREE.TextureLoader().load('assets/images/rock_wall_02_diff_1k.jpg', onLoad);
const stoneNormal = new THREE.TextureLoader().load('assets/images/rock_wall_02_nor_gl_1k.png', onLoad);
const grass = new THREE.TextureLoader().load('assets/images/coast_sand_rocks_02_diff_1k.png', onLoad);
const grassNormal = new THREE.TextureLoader().load('assets/images/coast_sand_rocks_02_nor_gl_1k.png', onLoad);
const dirt = new THREE.TextureLoader().load('assets/images/coast_sand_04_diff_1k.jpg', onLoad);
const dirtNormal = new THREE.TextureLoader().load('assets/images/coast_sand_04_nor_gl_1k.png', onLoad);

// Define the custom shader material
export const terrainMaterial = new THREE.ShaderMaterial({
    uniforms: {
        stoneTexture: { type: "t", value: stone },
        stoneNormalMap: { type: "t", value: stoneNormal },
        grassTexture: { type: "t", value: grass },
        grassNormalMap: { type: "t", value: grassNormal },
        dirtTexture: { type: "t", value: dirt },
        dirtNormalMap: { type: "t", value: dirtNormal },
        stoneAngle: { type: "float", value: 0.5 },
        grassAngle: { type: "float", value: 1.1 },
        waterLevel: { type: "float", value: -0.2 },
        surfaceLevel: { type: "float", value: 0.0 },
        sunColor: { type: "c", value: new THREE.Color(0xffffff) },
        ambientColor: { type: "c", value: new THREE.Color(0xffffff) },
        sunDirection: { type: "v3", value: new THREE.Vector3( 0.70707, 0.70707, 0.0 ) }
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
        
        uniform sampler2D stoneNormalMap;
        uniform sampler2D grassNormalMap;
        uniform sampler2D dirtNormalMap;
        
        uniform float stoneAngle;
        uniform float grassAngle;
        uniform float waterLevel;
        uniform float surfaceLevel;
        
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        uniform vec3 ambientColor;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vTangent;
        varying vec3 vBitangent;

        void main() {            
            float angle = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
            
            vec4 stoneTexel = texture2D(stoneTexture, vUv  * 20.0);
            vec4 grassTexel = texture2D(grassTexture, vUv * 20.0);
            vec4 dirtTexel = texture2D(dirtTexture, vUv * 20.0);
            
            vec4 stoneNormal = texture2D(stoneNormalMap, vUv  * 20.0);
            vec4 grassNormal = texture2D(grassNormalMap, vUv * 20.0);
            vec4 dirtNormal = texture2D(dirtNormalMap, vUv * 20.0);            
            
            vec4 steepnessTexel = mix(stoneTexel, grassTexel, smoothstep(stoneAngle, grassAngle, angle));
            vec4 steepnessNormal = mix(stoneNormal, grassNormal, smoothstep(stoneAngle, grassAngle, angle));
            
            vec4 texel = mix(dirtTexel,steepnessTexel, smoothstep(waterLevel, surfaceLevel, vPosition.y));
            vec4 normalMap = mix(dirtNormal,steepnessNormal, smoothstep(waterLevel, surfaceLevel, vPosition.y));
            
            vec3 normal = normalize(vNormal);
            vec3 tangent = normalize(vTangent);
            vec3 bitangent = normalize(vBitangent);
            
            vec3 mapNormal = normalize(vec3(normalMap.xyz * 2.0 - 1.0)) * mat3(bitangent, tangent, normal);
            vec3 lightDirection = normalize(-sunDirection);
            float diffuse = max(0.0, dot(mapNormal, lightDirection)); 
            
            vec3 ambient = ambientColor * texel.xyz;

            vec3 sunLight = sunColor * diffuse * texel.xyz;
        
            gl_FragColor = vec4(ambient + sunLight, texel.a);
        }
        `,
});
