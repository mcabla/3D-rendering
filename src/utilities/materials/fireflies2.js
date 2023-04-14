import * as THREE from 'three';

export const materialFireflies2 = new THREE.ShaderMaterial({
    uniforms: {
        pointTexture: {
            value: new THREE.TextureLoader().load('assets/images/sprites/firefly2.png')
        }
    },
    vertexShader: /* glsl */`
    attribute float size;
          varying vec3 vColor;

          void main() {
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
              gl_PointSize = size * ( 300.0 / -mvPosition.z );
              gl_Position = projectionMatrix * mvPosition;
          }
    `,
    fragmentShader: /* glsl */`
    uniform sampler2D pointTexture;
          varying vec3 vColor;

          void main() {
              gl_FragColor = vec4( vColor, 1.0 );
              gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
          }
    `,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true
});