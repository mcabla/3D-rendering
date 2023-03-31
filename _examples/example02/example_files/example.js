function createCube() {
    const geometry = new THREE.BoxBufferGeometry(2, 2, 2);
    
    // if you want to color mesh with a single color, use this code below
    const material = new THREE.MeshStandardMaterial({
        color: 'red'
    });
    
    const cube = new THREE.Mesh(geometry, material);

    cube.rotation.set(-0.5, -0.1, 0.8);

    const radiansPerSecond = THREE.MathUtils.degToRad(30);

    // this method will be called once per frame
    cube.tick = (delta) => {
        // increase the cube's rotation each frame
        cube.rotation.z += radiansPerSecond * delta;
        cube.rotation.x += radiansPerSecond * delta;
        cube.rotation.y += radiansPerSecond * delta;
    };

    return cube;
}



function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        35, // fov = Field Of View
        1, // dummy value for aspect ratio
        0.1, // near clipping plane
        100, // far clipping plane
    );
    camera.position.set(0, 0, 10);
    return camera;
}


function createLights() {
    const light = new THREE.DirectionalLight('white', 8);
    light.position.set(10, 10, 10);
    return light;
}


function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('skyblue');
    return scene;
}


function createRenderer() {
    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.physicallyCorrectLights = true;
    return renderer;
}


const clock = new THREE.Clock();

class Loop {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.updatables = [];
    }

    start() {
        this.renderer.setAnimationLoop(() => {
            // tell every animated object to tick forward one frame
            this.tick();

            // render a frame
            this.renderer.render(this.scene, this.camera);
        });
    }

    stop() {
        this.renderer.setAnimationLoop(null);
    }

    tick() {
        // only call the getDelta function once per frame!
        const delta = clock.getDelta();

        // console.log(
        //   `The last frame rendered in ${delta * 1000} milliseconds`,
        // );

        for (const object of this.updatables) {
            object.tick(delta);
        }
    }
}


const setSize = (container, camera, renderer) => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
};


class Resizer {
    constructor(container, camera, renderer) {
        // set initial size
        setSize(container, camera, renderer);

        window.addEventListener('resize', () => {
            // set the size again if a resize occurs
            setSize(container, camera, renderer);
            // perform any custom actions
            this.onResize();
        });
    }

    onResize() {}
}




let camera;
let renderer;
let scene;
let loop;


class World {
    constructor(container) {
        camera = createCamera();
        renderer = createRenderer();
        scene = createScene();
        loop = new Loop(camera, scene, renderer);
        container.append(renderer.domElement);

        const cube = createCube();
        const light = createLights();

        loop.updatables.push(cube);

        scene.add(cube, light);

        const resizer = new Resizer(container, camera, renderer);
    }

    render() {
        // draw a single frame
        renderer.render(scene, camera);
    }

    start() {
        loop.start();
    }

    stop() {
        loop.stop();
    }
}




function main() {

    // Get a reference to the container element
    const container = document.querySelector('#sceneContainer');

    // create a new world
    const world = new World(container);

    // start the animation loop
    world.start();
}

main();