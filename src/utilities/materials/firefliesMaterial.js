import * as THREE from 'three';

// Define the custom shader material
// https://www.shadertoy.com/view/WscBzX
export const fireFliesMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
        time: { type: 'float', value: 0.0 },
        alpha: { type: 'float', value: 0.5 },
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
    `,
    fragmentShader: /* glsl */`
        #define radius 0.4
        #define sphere_Counts 200.0
        
        uniform float time;
        uniform float alpha;
        
        
        varying vec2 vUv;
        
        float N21(vec2 p) {
            vec3 a = fract(vec3(p.xyx) * vec3(213.897, 653.453, 253.098));
            a += dot(a, a.yzx + 79.76);
            return fract((a.x + a.y) * a.z);
        }
        
        vec2 N22(vec2 p){
            float n = N21(p);
            return vec2(n,N21(n+p));
        }
        
        void main() {
            vec2 uv = vUv;
            
            vec3 pointLight = vec3(0.0);
            for (float i = 0.0; i < sphere_Counts; i += 1.0) {
              vec2 rnd = N22(vec2(i, i * 2.0));
              vec2 point = vec2(cos(time / 10.0 * rnd.x + i) * 2.0, sin(time * rnd.y + i));
              float distanceToPoint = distance(uv, point);
              if (distanceToPoint < 0.005) {
                  vec3 color = vec3(radius / distanceToPoint) * vec3(clamp(sin(time + i) / 2.0 + 0.01, 0.1, 0.1));
                  pointLight += pointLight += vec3(color.r, color.g, 0.0);
              }
            }
            pointLight *= vec3(0.3, 0.3, 1.0);


            if (pointLight == vec3(0.0)) {
                discard; // Discard the fragment if pointLight is black
            } else {
                gl_FragColor = vec4(pointLight, alpha);
            }
        }
        `,
});
