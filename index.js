import Main from './src/main.js';

function main() {

  // Get a reference to the container element
  const container = document.querySelector('#sceneContainer');

  // create our main scene handler.
  const main = new Main(container);

  // start the animation loop
  main.start();
}

main();