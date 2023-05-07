import * as THREE from 'three';

const onLoad = (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.05, 0.05);
};

// Define the two textures to blend
const stone = new THREE.TextureLoader().load('assets/images/Rock_035_baseColor-dark.jpg', onLoad);
const stoneNormal = new THREE.TextureLoader().load('assets/images/Rock_035_normal.jpg', onLoad);
const grass = new THREE.TextureLoader().load('assets/images/grass2-seamless2-bright.jpg', onLoad);
const grass2 = new THREE.TextureLoader().load('assets/images/grass2-seamless2-bright_remix.png', onLoad);
const sand = new THREE.TextureLoader().load('assets/images/Sand_004_COLOR.png', onLoad);
const sandNormal = new THREE.TextureLoader().load('assets/images/Sand_004_Normal.png', onLoad);

// Define the custom shader material
export const terrainMaterial = new THREE.ShaderMaterial({
    uniforms: {
        stoneTexture: { type: "t", value: stone },
        stoneNormalMap: { type: "t", value: stoneNormal },
        grassTexture: { type: "t", value: grass },
        grass2Texture: { type: "t", value: grass2 },
        sandTexture: { type: "t", value: sand },
        sandNormalMap: { type: "t", value: sandNormal },
        stoneAngle: { type: "float", value: 0.5 },
        grassAngle: { type: "float", value: 1.1 },
        waterLevel: { type: "float", value: -0.2 },
        surfaceLevel: { type: "float", value: 0.0 },
        sunColor: { type: "c", value: new THREE.Color(0xffffff) },
        sunIntensity: { type: "float", value: 1.0 },
        ambientColor: { type: "c", value: new THREE.Color(0xfff9b2) },
        ambientIntensity: { type: "float", value: 1.0 },
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
        uniform sampler2D grass2Texture;
        uniform sampler2D sandTexture;
        
        uniform sampler2D stoneNormalMap;
        uniform sampler2D sandNormalMap;
        
        uniform float stoneAngle;
        uniform float grassAngle;
        uniform float waterLevel;
        uniform float surfaceLevel;
        
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        uniform float sunIntensity;
        uniform vec3 ambientColor;
        uniform float ambientIntensity;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vTangent;
        varying vec3 vBitangent;

        void main() {            
            float angle = dot(normalize(vNormal), vec3(0.0, 1.0, 0.0));

            float randAngle = ceil(mod(vUv.x*20.0, 4.0))*0.785398163397;
            vec2 rotatedUv = vec2(cos(randAngle) * (vUv.x - 0.5) - sin(randAngle) * (vUv.y - 0.5) + 0.5, sin(randAngle) * (vUv.x - 0.5) + cos(randAngle) * (vUv.y - 0.5) + 0.5);

            // Define a seed value based on the uv coordinates
            float seed = clamp(fract(rotatedUv.x * rotatedUv.y * 43.7585453123), 0.0, 1.0);
            
            // Use the seed value to select one of the textures
            vec4 grassTexel1 = texture2D(grassTexture, rotatedUv * 20.0);
            vec4 grassTexel2 = texture2D(grass2Texture, rotatedUv * 20.0);
            
            // Blend the two textures together using the seed
            vec4 grassTexel = mix(grassTexel1, grassTexel2, smoothstep(0.49, 0.51, seed));
            grassTexel = mix(grassTexel, grassTexel1, smoothstep(.99, 1.0, seed));

            vec4 stoneTexel = texture2D(stoneTexture, vUv  * 4.0);
            vec4 sandTexel = texture2D(sandTexture, vUv * 20.0);

            vec4 stoneNormal = texture2D(stoneNormalMap, vUv  * 4.0);
            vec4 grassNormal = vec4(vec3(1.0, 1.0, 1.0) * 0.5 + 0.5, 1.0);
            vec4 sandNormal = texture2D(sandNormalMap, vUv * 20.0);

            vec4 heightTexel = mix(sandTexel, grassTexel, smoothstep(waterLevel, surfaceLevel, vPosition.y));
            vec4 heightNormal = mix(sandNormal, grassNormal, smoothstep(waterLevel, surfaceLevel, vPosition.y));

            vec4 texel = mix(stoneTexel, heightTexel, smoothstep(stoneAngle, grassAngle, angle)); 
            vec4 normalMap = mix(stoneNormal, heightNormal, smoothstep(stoneAngle, grassAngle, angle));

            vec3 normal = normalize(vNormal);
            vec3 tangent = normalize(vTangent);
            vec3 bitangent = normalize(vBitangent);

            vec3 mapNormal = normalize(vec3(normalMap.xyz * 2.0 - 1.0)) * mat3(bitangent, tangent, normal);

            vec3 swappedSunDirection = vec3(-sunDirection.x, sunDirection.z, -sunDirection.y);
            vec3 lightDirection = normalize(-swappedSunDirection);

            vec3 ambient = ambientColor * max(0.0, ambientIntensity) * texel.xyz;

            float t = clamp((vPosition.y - waterLevel) / (surfaceLevel + 0.35 - waterLevel), 0.0, 1.0);
            float diffuseMax = mix(0.2, 10.0, smoothstep(0.0, 1.0, t));

            float diffuse = min(diffuseMax, max(0.0, dot(mapNormal, lightDirection)));
            vec3 sunLight = sunColor * max(0.0, sunIntensity) * diffuse * texel.xyz;

            gl_FragColor = vec4(ambient + sunLight, texel.a);
        }
        `,
});
