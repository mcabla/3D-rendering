export function createCube() {
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