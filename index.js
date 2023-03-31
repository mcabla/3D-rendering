import Main from './src/main.js';


//Make navbar dynamic
const links = document.querySelectorAll('.nav-link');
let activeLink = links[0];

links.forEach(link => {
  link.addEventListener('click', () => {
    activeLink.classList.remove('active');
    link.classList.add('active');
    activeLink = link;
    const url = new URL(window.location.href);
    url.searchParams.set('world', link.dataset.queryString);
    window.history.replaceState({}, '', url);
  });
});


function main() {

  // Get a reference to the container element
  const container = document.querySelector('#sceneContainer');

  // create our main scene handler.
  const main = new Main(container);

  // start the animation loop
  main.start();
}

main();

