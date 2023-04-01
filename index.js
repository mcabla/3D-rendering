import Main from './src/main.js';

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});


//Make navbar dynamic
const links = document.querySelectorAll('.nav-link');
let activeLink = links[0];

links.forEach(link => {
  if (link.dataset.queryString === params.world) {
    link.classList.add('active');
  }

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
  const container = document.getElementById('sceneContainer');
  const navbar = document.getElementById('navbar');
  container.style.height = `calc(100vh - ${navbar.clientHeight}px)`;

  // create our main scene handler.
  const main = new Main(container, params.world);

  // start the animation loop
  main.start();
}

main();

