import * as THREE from '../libs/three.module.js';
import { OrbitControls } from '../libs/OrbitControls.js';
import Stats from '../libs/stats.module.js';


let aspectRatio = (window.innerWidth / window.innerHeight);
let scene, camera, renderer, controls;
const container = document.getElementById( 'container' );
const stats = Stats();
stats.showPanel( 0 ); // 0 = fps, 1 = ms, 2 = mb, 3 = custom
container.appendChild(stats.dom);



function createCamera() {
  camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
  camera.position.z = 2;
  controls = new OrbitControls(camera, renderer.domElement);
}

function createScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('grey');
}


function createGeometry() {
  const textLoader = new THREE.TextureLoader();
  const colTexture = textLoader.load('../assets/lee_diffuse.jpg',
      () => {
          console.log('loading finished\n');
          colTexture.name = "TEST";
          console.log(colTexture.name);
      },
      undefined,
      () => {
          console.log('loading error');
      }
  );

  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ map: colTexture });
  let sphere = new THREE.Mesh(geometry, material);

  // Invert the sphere by adjusting its scale
  sphere.scale.set(-1, 1, 1);

  scene.add(sphere);
}


function createLight(){
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
   scene.add(ambientLight);
}



//////////////////////////////////

// Renderer, Utils, Animate, Init
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true }); 
  //If you want anti aliassing u need to turn it on in renderer itself  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1.0);
  container.appendChild( renderer.domElement );
  console.log( renderer.info );
  //never ship 


}


function animate() {
  window.requestAnimationFrame( animate ); 
  //ultimately called from window
 stats.begin();
   renderer.render(scene, camera);
   //wraap renderer with stats - so that it can get info
   //v common - used in things like physics 
   //change over time - time happens inside request animatin frame 
   //if you want to do anything that involves time be prepared to wrap
 stats.end();
}
//get familiar with all this stuff- dat.gui - useful for understanding where your errors are

function init() {
  createRenderer();
  createCamera();
  createScene();
  createGeometry();
  createLight();
  animate();
}

init();
