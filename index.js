import Main from './src/main.js';

const params = new URLSearchParams(window.location.search);
const hardReload = true;

let mainObj;
let container;
let navbar;


//Make navbar dynamic
const links = document.querySelectorAll('.nav-link');
let activeLink = links[0];

links.forEach(link => {
  if (link.dataset.queryString === params.get('world')) {
    activeLink = link;
  }

  link.addEventListener('click', (event) => {
    // Prevent the default event from navigating to the url.
    event.preventDefault();
    // Prevent loading a world when it was already loaded.
    if (activeLink === link) {
      return;
    }
    // Update the active navigation item.
    activeLink.classList.remove('active');
    link.classList.add('active');
    activeLink = link;
    // Set the world parameter to the new world.
    params.set('world', link.dataset.queryString);
    // Update the URL without triggering a page reload
    let newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${params}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    // If this flag is set, dynamically switching between worlds is disabled.
    if (hardReload) {
      window.location.reload();
    }


    // Stop and delete the old world.
    if (mainObj) {
      mainObj.stop();
      mainObj = null;
    }
    // Start the new world.
    startMain();
  });

});

activeLink.classList.add('active');

function main() {

  // Get a reference to the container element
  container = document.getElementById('sceneContainer');
  navbar = document.getElementById('navbar');
  container.style.height = `calc(100vh - ${navbar.clientHeight}px)`;

  startMain();
}

function startMain() {
  let worldName = params.get('world');

  const validWorlds = Array.from(links).map(link => link.dataset.queryString);
  const defaultWorld = validWorlds[0];

  if (!validWorlds.includes(worldName)) {
    worldName = defaultWorld;
  }
  // create our main scene handler.
  mainObj = new Main(container, worldName);
}

main();

