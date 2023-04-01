import * as THREE from 'three';
import Branch from './branch.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';


export function createTree() {
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const tree = new Tree(0, -2, 1, 0.87, material);

    return tree;

}

export default class Tree {
    //https://github.com/jlopez90/fractal-tree
    constructor(startX = 0, startY = 0, length = 10, growPercentatge, material) {
        this.geometry = [];

        this.material = material;
        this.growPercentatge = growPercentatge;

        // root
        this.initRoot(startX, startY, length);
        this.grow({ x: startX, y: startY + length }, length, Math.PI / 4, Math.PI / 4);
    }

    initRoot(startX, startY, length) {
        const vertices = [
            startX, startY , 0,
            startX, length + startY, 0,
        ];

        const geometryRoot = new THREE.BufferGeometry();
        geometryRoot.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        const lineRoot = new THREE.Line(geometryRoot, this.material);

        this.geometry.push(lineRoot);

    }

    get() {
        return this.geometry;
    }

    grow(start, length, leftAngle, rightAngle) {
        if (length < 0.5) return;

        const newLength = length * this.growPercentatge;

        const leftEnd = {
            x: start.x - (newLength * (Math.cos(leftAngle))),
            y: start.y + (newLength * (Math.sin(leftAngle))),
        };

        const rightEnd = {
            x: start.x + (newLength * (Math.cos(rightAngle))),
            y: start.y + (newLength * (Math.sin(rightAngle))),
        };

        const newBranch = new Branch(start, leftEnd, rightEnd);
        this.geometry.push(newBranch.getBranch());

        // left branch
        this.grow(
            leftEnd,
            newLength,
            Math.random() * (((Math.PI / 3) - (Math.PI / 6)) + (Math.PI / 6) + leftAngle),
            Math.random() * (((Math.PI / 3) - (Math.PI / 6)) + (Math.PI / 6) + rightAngle),
        );

        // right branch
        this.grow(
            rightEnd,
            newLength,
            Math.random() * (((Math.PI / 3) - (Math.PI / 6)) + (Math.PI / 6) + leftAngle),
            Math.random() * (((Math.PI / 3) - (Math.PI / 6)) + (Math.PI / 6) + rightAngle),
        );
    }
}
