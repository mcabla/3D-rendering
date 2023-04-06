import * as THREE from 'three';

export default class World {
  constructor(main) {
    this.main = main;
    this.scene = main.scene;
    this.loop = main.loop;
    this.container = main.container;
    this.camera = createCamera();

    let uniforms = { //GLSL types only
      res: {type: 'vec2', value: new THREE.Vector2(main.container.clientWidth, main.container.clientHeight)},
      aspect: {type: 'float', value: main.container.clientWidth / main.container.clientHeight}
    };

    main.resizer.addEventListener('resize', (event) => {
      uniforms.res.value = new THREE.Vector2(event.detail.width, event.detail.height);
      uniforms.aspect.value = event.detail.aspect;
    });

    let geometry = new THREE.PlaneBufferGeometry(2, 2);
    let material = new THREE.ShaderMaterial({
      fragmentShader: fragmentShader(),
      uniforms: uniforms
    });
    let mesh = new THREE.Mesh(geometry, material);

    this.scene.add(mesh);

  }
}

function createCamera() {
  return new THREE.OrthographicCamera( -1, 1, 1, -1, -1, 1);
}

function fragmentShader(){
  //https://medium.com/@SereneBiologist/rendering-escape-fractals-in-three-js-68c96b385a49
  return /*glsl*/`
    precision highp float;
    uniform vec2 res;
    uniform float aspect;
    float mandelbrot(vec2 c){
      float alpha = 1.0;
      vec2 z = vec2(0.0 , 0.0);
      for(int i=0; i < 200; i++){  // i < max iterations
        float x_sq = z.x*z.x;
        float y_sq = z.y*z.y;
        vec2 z_sq = vec2(x_sq - y_sq, 2.0*z.x*z.y);
        z = z_sq + c;
        if(x_sq + y_sq > 4.0){
          alpha = float(i)/200.0;
          break;
        }
      }
      return alpha;
    }
  void main(){ // gl_FragCoord in [0,1]
    vec2 uv = 4.0 * vec2(aspect, 1.0) * gl_FragCoord.xy / res -2.0*vec2(aspect, 1.0);
    float s = 1.0 - mandelbrot(uv);
    vec3 coord = vec3(s, s, s);
    gl_FragColor = vec4(pow(coord, vec3(7.0, 8.0, 5.0)), 1.0);
    }
`;
}
