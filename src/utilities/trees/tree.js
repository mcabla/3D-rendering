import * as THREE from "three";

const defaultLeafGeometry = new THREE.SphereGeometry(.01, 8, 4);
const defaultLeafMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const defaultLeafMesh = new THREE.Mesh(defaultLeafGeometry, defaultLeafMaterial);

const defaultTrunkMaterial = new THREE.MeshPhongMaterial({ color: 0x663300 });

const onLoad = (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
};

export const getMapleTree = () => {
    const rules = {
        'A': 'EEC',
        'B': '[+C][-C][/C][*C]',
        'C': 'EF[+C][-C][/C][*C]^^C',
    };
    const branchAngle = Math.PI / 4; // angle between branches
    const branchLength = 0.040; // length of each branch
    const iterations = 5; // number of times to apply the rules

    const textureLoader = new THREE.TextureLoader();
    const leafTexture = textureLoader.load('assets/images/vegetation_leaf_maple_01.png');

    const leafGeometry = new THREE.PlaneGeometry(0.1, 0.1);
    const leafMaterial = new THREE.MeshBasicMaterial({
        map: leafTexture,
        side: THREE.DoubleSide,
        transparent: true
    });
    const leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);

    const barkTexture = textureLoader.load('assets/images/vegetation_tree_bark_40.png', onLoad);
    const trunkMaterial = new THREE.MeshBasicMaterial({
        map: barkTexture,
    });

    return getTree(rules, branchAngle, branchLength, iterations, leafMesh, trunkMaterial);
}

export const getPalmTree = () => {
    const rules = {
        'A': 'EEEEEF',
        'F': '[+F][-F]F[*F][/F]F', // Generated with chatGPT
    };
    const branchAngle = Math.PI / 3; // angle between branches
    const branchLength = 0.040; // length of each branch
    const iterations =2; // number of times to apply the rules
    return getTree(rules, branchAngle, branchLength, iterations);
}

export const getWeepingWillowTree = () => {
    const rules = {
        'A': 'E*E/E*EF',
        'F': '[+F][-F][*F]F', // Generated with chatGPT
    };
    const branchAngle = Math.PI / 4; // angle between branches
    const branchLength = 0.040; // length of each branch
    const iterations =5; // number of times to apply the rules
    return getTree(rules, branchAngle, branchLength, iterations);
}

export const getCherryBlossomTree = () => {
    const rules = {
        'A': 'EF',
        'F': 'E[+F][/-F][*F][+F][*F][*F][-F][/*F]', // Generated with chatGPT
    };
    const branchAngle = Math.PI / 4; // angle between branches
    const branchLength = 0.040; // length of each branch
    const iterations =4; // number of times to apply the rules
    return getTree(rules, branchAngle, branchLength, iterations);
}

export const getSpruce = () => {
    // Define the L-system rules
    const rules = {
        'A': 'EEEB',
        'B': 'CFC^B',
        'C': '[++++++++++++++R][--------------S][//////////////T][**************U]',
        'R': 'R-F',
        'S': 'S+F',
        'T': 'T*F',
        'U': 'U/F',
    };
    const branchAngle = Math.PI / 16; // angle between branches
    const branchLength = 0.040; // length of each branch
    const iterations =6; // number of times to apply the rules
    return getTree(rules, branchAngle, branchLength, iterations);
}

export const getFlower = () => {
    // Define the L-system rules
    const rules = {
        'A': '[+F][-F][/F][*F]F',
    };
    const branchAngle = Math.PI / 8; // angle between branches
    const branchLength = 0.040; // length of each branch
    const iterations =1; // number of times to apply the rules
    return getTree(rules, branchAngle, branchLength, iterations);
}

export const getFern = () => {
    // Define the L-system rules
    const rules = {
        'A': 'F',
        'F': '[+F][-F][*F][/F]',
    };
    const branchAngle = Math.PI / 4; // angle between branches
    const branchLength = 0.004; // length of each branch
    const iterations =3; // number of times to apply the rules
    return getTree(rules, branchAngle, branchLength, iterations);
}

/**
 * The first rule is A.
 * E will generate a branch.
 * F will generate a branch with a leave at the end.
 * @param rules
 * @param branchAngle
 * @param branchLength
 * @param iterations
 */
export const getTree = (rules, branchAngle, branchLength, iterations, leafMesh = defaultLeafMesh, trunkMaterial = defaultTrunkMaterial) => {
    // Generate the L-system string
    let axiom = 'A'; // starting string
    for (let i = 0; i < iterations; i++) {
        let newAxiom = '';
        for (let j = 0; j < axiom.length; j++) {
            const char = axiom.charAt(j);
            if (rules[char]) {
                newAxiom += rules[char];
            } else {
                newAxiom += char;
            }
        }
        axiom = newAxiom;
    }
    // console.log(axiom);

    // Convert the L-system string to a list of branch instructions
    let position = new THREE.Vector3(0, 0, 0); // starting position
    let direction = new THREE.Vector3(0, 1, 0); // starting direction
    let stack = []; // stack for storing positions and directions
    let branches = []; // list of branch instructions
    let leaves = []; // list of branch instructions
    for (let i = 0; i < axiom.length; i++) {
        const char = axiom.charAt(i);
        switch (char)  {
            case 'E':
            case 'F':
                // add a branch instruction
                branches.push({
                    position: new THREE.Vector3().copy(position),
                    direction: new THREE.Vector3().copy(direction),
                    leaves: char === 'F'
                });
                // move forward
                position.add(direction.clone().multiplyScalar(branchLength));
                break;
            case '+':
                // rotate right
                direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), -branchAngle);
                break;
            case '-':
                // rotate left
                direction.applyAxisAngle(new THREE.Vector3(0, 0, 1), branchAngle);
                break;
            case '*':
                // rotate forward
                direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), branchAngle);
                break;
            case '/':
                // rotate backward
                direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), -branchAngle);
                break;
            case '^':
                // rotate around
                direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), branchAngle/2);
                break;
            case '¨':
                // rotate around in the other direction
                direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), -branchAngle/2);
                break;
            case '[':
                // save position and direction to the stack
                stack.push({
                    position: new THREE.Vector3().copy(position),
                    direction: new THREE.Vector3().copy(direction)
                });
                break;
            case ']':
                // restore position and direction from the stack
                const state = stack.pop();
                position.copy(state.position);
                direction.copy(state.direction);
                break;
            default:
                break;
        }
    }


    const isDuplicate = (obj, index, arr) => {
        return arr.findIndex(o => o.position.equals(obj.position) && o.direction.equals(obj.direction) && o.leaves === obj.leaves) !== index;
    }

    const filteredBranches = branches.filter((obj, index, arr) => !isDuplicate(obj, index, arr));

    // console.log(stack, branches, filteredBranches);

    // Create the Three.js objects for the tree
    const trunkGeometry = new THREE.CylinderGeometry(.005, .005, branchLength, 3, 1, false);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    const group = new THREE.Group();
    group.add(trunk);
    //group.up = new THREE.Vector3(0,1,0)
    trunk.position.add(new THREE.Vector3(0,0,branchLength/2));
    trunk.rotateX(Math.PI/2);

    const branchGroup = new THREE.Group();
    const leafGroup = new THREE.Group();
    for (let i = 0; i < filteredBranches.length; ++i) {
        const branch = group.clone();
        branch.position.copy(filteredBranches[i].position);
        const destination = new THREE.Vector3().copy(filteredBranches[i].direction).multiplyScalar(branchLength).add(branch.position);
        branch.lookAt(destination.x, destination.y, destination.z);
        branchGroup.add(branch);

        if (filteredBranches[i].leaves) {
            for (let j = 0; j < 4; ++j) {
                const leaf = leafMesh.clone();
                leaf.rotation.x = Math.floor(Math.random() * 20 - 10);
                leaf.rotation.x = Math.floor(Math.random() * 20 - 10);
                leaf.rotation.z = Math.floor(Math.random() * 20 - 10);
                leaf.position.copy(destination.sub(filteredBranches[i].position).multiplyScalar(1.1).add(filteredBranches[i].position));
                // leaf.rotation.copy(filteredBranches[i].direction);
                leafGroup.add(leaf);
            }
        }
    }

    const treeGroup = new THREE.Group();
    treeGroup.add(branchGroup);
    treeGroup.add(leafGroup);

    return treeGroup;
}
