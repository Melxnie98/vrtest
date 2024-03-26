//Melanie Leonard 122115091

import * as THREE from 'three'; 
import {GUI} from '../libs/dat.gui.module.js';
import Stats from '../libs/stats.module.js'; 
import {VRButton} from '../libs/VRButton.js';
import {OrbitControls} from '../libs/OrbitControls'; 
import {GLTFLoader} from '../libs/jsm/loaders/GLTFLoader';
import{FBXLoader} from '../libs/jsm/loaders/FBXLoader';
import{XRControllerModelFactory} from '../libs/jsm/webxr/XRControllerModelFactory';
//import { EffectComposer } from '../libs/postprocessing/EffectComposer.js';
//import { RenderPass } from '../libs/postprocessing/RenderPass.js';
//import { FilmPass } from '../libs/postprocessing/FilmPass.js';
//import { BloomPass } from '../libs/postprocessing/BloomPass.js';


//declare stuff
let container = document.getElementById('container');
//THREE.ColorManagement.enabled = true;
let renderer, scene, camera, controller1, controller2, controllerGrip1, controllerGrip2;
let mixer,mixers;
var cameraControl, mesh, mesh2, mesh3;
let  uniforms, uniforms1, uniforms2, uniforms3, composer;
let stat = new Stats();
stat.showPanel(0);
var video = document.getElementById('video');
video.load();
let gui = new GUI();
container.appendChild(stat.dom); //append to the dom 
var videoCanvasContext, videoTexture;
var width = window.innerWidth;
var height = window.innerHeight;
const clock = new THREE.Clock();
const listener = new THREE.AudioListener();
const posSound = new THREE.PositionalAudio ( listener );
const posSound2 = new THREE.PositionalAudio ( listener );
const textLoader = new THREE.TextureLoader(); //load texture 
const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();
var laoiseAnt = new THREE.Mesh();
var eronaAnt = new THREE.Mesh();
var sphere = new THREE.Mesh();
var sparkles = new THREE.Points();


// Make the renderer
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding;  //Enable the XR 
  renderer.xr.enabled = true;
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0x000000, 1.0);
  container.appendChild(renderer.domElement);
  container.appendChild(VRButton.createButton(renderer));
  console.log('Renderer created');
}
//Make the scene
function createScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#9F2B68'); //set the bg colour
  scene.rotation.set(0,Math.PI/1.0,0)
  console.log('scene created');
}

//Make the camera
function createCamera(){
  camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1, 1000);
  camera.position.z = -20; //set camera position
  camera.position.y = 10;
  camera.rotation.set(0,Math.PI/1.0,0)
  const helper = new THREE.CameraHelper(camera);
  cameraControl = new OrbitControls(camera, renderer.domElement);
  camera.add( listener );
  scene.add(helper);
  scene.add(camera);
  

  //camera.lookAt(scene.position);
  console.log('camera created');
}

function createVRControllers(){
 
  function onSelectStart() {
    this.children[0].scale.z = 10;
    this.userData.isSelecting = true; 
  }
  function onSelectEnd() {
    this.children[0].scale.z = 0;
    this.userData.isSelecting = false;
  }  
  //set up controller 1 
   controller1 = renderer.xr.getController( 0 );
   controller1.addEventListener( 'selectstart', onSelectStart );
   controller1.addEventListener( 'selectend', onSelectEnd );
   controller1.addEventListener( 'connected', function ( event ) {
     this.add( buildController( event.data ) );
   });
   controller1.addEventListener( 'disconnected', function () { this.remove( this.children[ 0 ] ); } );
   scene.add( controller1 );

   //set up controller 2
   controller2 = renderer.xr.getController( 1 );
   controller2.addEventListener( 'selectstart', onSelectStart );
   controller2.addEventListener( 'selectend', onSelectEnd );
   controller2.addEventListener( 'connected', function ( event ) {
     this.add( buildController( event.data ) );
   });
   controller2.addEventListener( 'disconnected', function () { this.remove( this.children[ 0 ] ); } );
   scene.add( controller2 );

   const controllerModelFactory = new XRControllerModelFactory();
   controllerGrip1 = renderer.xr.getControllerGrip( 0 );
   controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
   scene.add( controllerGrip1 );

   controllerGrip2 = renderer.xr.getControllerGrip( 1 );
   controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
   scene.add( controllerGrip2 );
   window.addEventListener( 'resize', onWindowResize, false );

   function buildController( data ) {
    let geometry, material;
    switch ( data.targetRayMode ) {
      case 'tracked-pointer':
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );
        material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );
        return new THREE.Line( geometry, material );
      case 'gaze':
        geometry = new THREE.RingBufferGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
        material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
        return new THREE.Mesh( geometry, material );
      }
    }
  }

//make the scene size change with window size
function onWindowResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  console.log('window size changed');
}


function shaderCube() {
    var shaderProp = {
    uniforms: {
    colour_dark : {type: "v4", value: new THREE.Vector4(0.4, 0.1, 1.0, 1.0)},
    temp: {type: "f", value: 1.0}
    },
    vertexShader: document.getElementById("vs0").textContent,
    fragmentShader: document.getElementById("fs0").textContent
};
    var shaderMat = new THREE.ShaderMaterial(shaderProp);
    var geometry = new THREE.BoxGeometry( 3, 3, 3 );
      mesh = new THREE.Mesh( geometry, shaderMat );
      mesh.position.set(-3, 9, 10);
      scene.add( mesh );


}

function shaderCube2() {
  var geometry = new THREE.BoxGeometry( 0.75, 0.75, 0.75 );
  uniforms1 = {
    'time': { value: 1.0 }
  };
  uniforms2 = {
    'time': { value: 1.0 },
    'colorTexture': { value: new THREE.TextureLoader().load( '../assets//disturb.jpg' ) }
  };
  uniforms2[ 'colorTexture' ].value.wrapS = uniforms2[ 'colorTexture' ].value.wrapT = THREE.RepeatWrapping;

  const params = [
    [ 'fragment_shader1', uniforms1 ]
  ];
  for ( let i = 0; i < params.length; i ++ ) {
    const material2 = new THREE.ShaderMaterial( {
      uniforms: params[ i ][ 1 ],
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( params[ i ][ 0 ] ).textContent
    } );
    mesh2 = new THREE.Mesh( geometry, material2 );
    mesh2.position.set(4, 9, 10);
    scene.add( mesh2 );
  }
}

function shaderCube3(){
  const vertexCount = 200 * 3;

      const geo = new THREE.BufferGeometry();

      const positions = [];
      const colors = [];

      for ( let i = 0; i < vertexCount; i ++ ) {
        // adding x,y,z
        positions.push( Math.random() - 0.5 );
        positions.push( Math.random() - 0.5 );
        positions.push( Math.random() - 0.5 );
        // adding r,g,b,a
        colors.push( Math.random() * 255 );
        colors.push( Math.random() * 255 );
        colors.push( Math.random() * 255 );
        colors.push( Math.random() * 255 );
      }

      const positionAttribute = new THREE.Float32BufferAttribute( positions, 3 );
      const colorAttribute = new THREE.Uint8BufferAttribute( colors, 4 );

      colorAttribute.normalized = true; // this will map the buffer values to 0.0f - +1.0f in the shader

      geo.setAttribute( 'position', positionAttribute );
      geo.setAttribute( 'color', colorAttribute );

      // material

      const material = new THREE.RawShaderMaterial( {

        uniforms: {
          time: { value: 1.0 }
        },
        vertexShader: document.getElementById( 'vs3' ).textContent,
        fragmentShader: document.getElementById( 'fs3' ).textContent,
        side: THREE.DoubleSide,
        transparent: true

      } );

      mesh3 = new THREE.Mesh( geo, material );
      mesh3.position.set(1, 9, 4);
      scene.add( mesh3 );
}

  // function shaderDonut(){
  
  //     uniforms = {

  //       'fogDensity': { value: 0.45 },
  //       'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
  //       'time': { value: 1.0 },
  //       'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
  //       'texture1': { value: textLoader.load( '../assignmentAssets/cloud.png' ) },
  //       'texture2': { value: textLoader.load( '../assignmentAssets/lavatile.jpg' ) }

  //     };

  //     uniforms[ 'texture1' ].value.wrapS = uniforms[ 'texture1' ].value.wrapT = THREE.RepeatWrapping;
  //     uniforms[ 'texture2' ].value.wrapS = uniforms[ 'texture2' ].value.wrapT = THREE.RepeatWrapping;

  //     const size = 0.65;

  //     const material2 = new THREE.ShaderMaterial( {
  //       uniforms: uniforms,
  //       vertexShader: document.getElementById( 'vs2' ).textContent,
  //       fragmentShader: document.getElementById( 'fs2' ).textContent
  //     } );

  //     mesh3 = new THREE.Mesh( new THREE.TorusGeometry( size, 0.3, 30, 30 ), material2 );
  //     mesh3.rotation.x = 0.3;
  //     scene.add( mesh3 );
  //     const renderModel = new RenderPass( scene, camera );
  //     const effectBloom = new BloomPass( 1.25 );
  //     const effectFilm = new FilmPass( 0.35, 0.95, 2048, false );

  //      composer = new EffectComposer( renderer );

  //     composer.addPass( renderModel );
  //    composer.addPass( effectBloom );
  //     composer.addPass( effectFilm );

  // }

	


// Create 3 types of lighting:  ambient light,directionalLight,spotLight
function createLight() { 
  //Ambient lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  ambientLight.position.set(20, 10, 20);
  scene.add(ambientLight);

  //Directional Lighting
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
  directionalLight.position.set(10, 10, 20);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.top = 180;
  directionalLight.shadow.camera.bottom = - 10;
  directionalLight.shadow.camera.left = - 15;
  directionalLight.shadow.camera.right = 12;
  scene.add(directionalLight);

  //Spotlight
  const spotLight = new THREE.SpotLight(0xffffff,0.3,9.0,0.35,0.0,0.0);
  spotLight.position.set(2,5,2);
  spotLight.lookAt(sphere.position);
  scene.add(spotLight);
  console.log('Lights created');
}

function createSparkles() {
  let points = new THREE.BufferGeometry();
  let pointsArray = [];
  while (pointsArray.length < 10000) {
    let x = 10 * Math.random() - 1
    let y = 2 * Math.random() - 1
    let z = 2 * Math.random() - 1
    if (x * x + y * y + z * z < 1) {
      let pt = new THREE.Vector3(x*20, y*20, z*20);
      pointsArray.push(pt);
    }
  }
  points.setFromPoints(pointsArray);
  let pointMaterial = new THREE.PointsMaterial({
    color: "purple",
    size: 2,
    sizeAttenuation: false
  });
  console.log(pointMaterial.color.getStyle());
  let sparkles = new THREE.Points(points, pointMaterial);
  sparkles.position.set(-3, 9, 10);
  scene.add(sparkles);
}

//Make the Ogre
function createGeometry(){
  //Load the normalm heigth AO textures
  const normalTexture = textLoader.load('../assets/harshbricks-normal.png'); //Load normal
  const heightTexture = textLoader.load('../assets/harshbricks-height5-16.png');//load heigth map
  const aoTexture = textLoader.load('../assets/harshbricks-ao2.png');//loadao2
  const colTexture = textLoader.load('../assets/green.jpeg',
     () => { console.log('loading finished\n');
             colTexture.name = "TEST";
             console.log(colTexture.name)},
     undefined,
     () => { console.log('loading error')}
   );

   const geometry = new THREE.SphereGeometry( 1, 30, 32 );
   const material = new THREE.MeshStandardMaterial({map: colTexture});
   //creating material
   //assigning normal map and assign the variable from earlier 
   material.normalMap = normalTexture;
   material.displacementMap = heightTexture;
   //Can directly play with this - value .005- if it was a 1 coming in from img its now ,005 - 
   material.displacementScale = 0.05;
   material.aoMap = aoTexture;
   material.aoMapIntensity = 0.5;

   //create a new 3D mesh with  the newly created geometry and material
   sphere = new THREE.Mesh( geometry, material );
   sphere.position.x = 2;
   sphere.position.y = 8;
   sphere.position.z = 20;
   sphere.receiveShadow = true;
   scene.add(sphere);
   console.log('ogre created');
}

//Make the VERY educational turtle video for the ant students to learn from
function createTV(){
  //get the canvas 
  var videoCanvas = document.createElement('canvas');
  videoCanvas.width = width/2;
  videoCanvas.height = height/2;
  videoCanvasContext = videoCanvas.getContext('2d');

  // background color if no video present
  videoCanvasContext.fillStyle = '#000900';
  videoCanvasContext.fillRect(0, 0, videoCanvas.width, videoCanvas.height);

  //create the video
  videoTexture = new THREE.VideoTexture(video);
  videoTexture.generateMipmaps = false;
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.encoding = THREE.sRGBEncoding;

 //set size and place 
  var tvMaterial = new THREE.MeshBasicMaterial({map: videoTexture});
  var tvGeometry = new THREE.PlaneGeometry(width/40, height/100);
  var tvMesh = new THREE.Mesh(tvGeometry, tvMaterial);
  tvMesh.rotation.set(0,Math.PI/1.0,0)
  tvMesh.position.set(0, 9, 36);
  scene.add(tvMesh);
  console.log('video created');
}

//Make the small mice & its lil dance moves 
function createCharacters(){
  laoiseAnt = fbxLoader.load( '../assets/mousie2.fbx', function ( object ){
    object.position.x = 2;
    object.position.y = 3;
    mixer = new THREE.AnimationMixer( object );
    const action = mixer.clipAction( object.animations[ 0 ] );
    action.play();
    object.traverse(function(child){
      if(child.isMesh){
        child.castShadow = true;
        child.receiveShadow = true;}});
    scene.add( object );});
  console.log('Character1 created');
  eronaAnt = fbxLoader.load( '../assets/mousie.fbx', function ( object ) {
    object.position.x = -3;
    object.position.z = 4;
    mixers = new THREE.AnimationMixer( object );
    const action2 = mixers.clipAction( object.animations[ 0 ] );
    action2.play();
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );
    scene.add( object );
  } );
  console.log('Character2 created');
}

//Make the big ant & its lil dance moves 
function createClassroom(){
  gltfLoader.load(
     '../assets/classroom.gltf',
     function(gltf){
      scene.add(gltf.scene);
    }
  )
}

function createPositionSound(){ //positional sound for the two characters
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load ('../assets/laoiseTurtle.m4a', function (buffer) {
        posSound.setBuffer( buffer)
        posSound.setRefDistance(10)
        posSound.setLoop(true);});
    laoiseAnt.add(posSound);
    
    audioLoader.load ('../assets/warnerTurtle.m4a', function (buff) {
        posSound2.setBuffer( buff)
        posSound2.setRefDistance( 10 )
        posSound2.setLoop(true);
    });
    sphere.add(posSound2);
}

function animate() {
  window.requestAnimationFrame(animate);
  stat.begin();
  stat.update();
  const delta = clock.getDelta();
  if ( mixer ) mixer.update( delta );
  if ( mixers ) mixers.update( delta );
  if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
    videoCanvasContext.drawImage( video, 0, 0 );
    if ( videoTexture ) videoTexture.needsUpdate = true;
   } else {console.log("no video")};

   //Rotate stuff 
  sphere.rotation.x += 0.01;
  sphere.rotation.y += 0.21;
  mesh.rotation.x += 0.005;
	mesh.rotation.y += 0.01;
  mesh2.rotation.z += 0.05;
	mesh2.rotation.y += 0.01;
  mesh3.rotation.z += 0.55;
	mesh3.rotation.y += 0.1;
  //uniforms3[ 'time' ].value += 0.2 * delta;
  renderer.render(scene, camera);
  //composer.render( 0.01 );
  renderer.setAnimationLoop(animate);
  stat.end();
}

//Make all of the GUI controlls
function createControlPanel() { 
  //create folder for stuff inside  Control turtle video
  const cntlPanel = gui.addFolder('Video Control Panel');
  const playVideo = { play: function () { video.play(); console.log('Video play')} };
  cntlPanel.add(playVideo, 'play');
  const pauseVideo = { pause: function () { video.pause();console.log('video pause') } };
  cntlPanel.add(pauseVideo, 'pause');
  const stopVideo = { stop: function () { video.pause(); video.currentTime = 0; console.log('video stop')} };
  cntlPanel.add(stopVideo, 'stop');
  cntlPanel.open();

  //controls for the little mice excited turtle voice(kindly provided by by friend)
  const soundFolder = gui.addFolder('Mouse Positional Audio');  //creates folder 
  const playAnt = { play:function(){ posSound.play(); console.log('mouse sound stopped')}};  
  soundFolder.add(playAnt,'play');   // key value pair - value is function key is play/stop 
  const stopAnt = { stop:function(){ posSound.stop(); console.log('mouse sound stopped')}};
  soundFolder.add(stopAnt,'stop'); 
  soundFolder.open();

  //controls for the ogre whos also excited about the turtle 
  const soundFolder2 = gui.addFolder('Ogre Positional Audio');
  const playOgre = { play:function(){ posSound2.play(); console.log('Ogre sound turned on')}}; 
  soundFolder2.add(playOgre,'play');  // key value pair - value is function key is play/stop 
  const stopOgre = { stop:function(){ posSound2.stop(); console.log('Ogre sound stopped'); }};
  soundFolder2.add(sphere.position, "z", -5, 5, 5).name('Panner'); 
  soundFolder2.add(stopOgre,'stop');
  soundFolder2.open();

  const allAudioFolder = gui.addFolder('All Audio');
  const muteObj = { stop:function(){
    posSound.isPlaying || posSound2.isPlaying || video.isPlaying ? listener.setMasterVolume(0) : listener.setMasterVolume(1) 
  }};
  allAudioFolder.add(muteObj,'stop').name('Mute All');
  allAudioFolder.open(); 
}


//initialise all the stuff
function init() {
    
  createScene();
  createRenderer();
  createCamera();
  window.addEventListener("resize", onWindowResize, false);
  createControlPanel();
  createLight();
  createTV(); 
  createSparkles();
  createGeometry();
  createVRControllers();
  createPositionSound();
  createClassroom();
  createCharacters();
  //createCharacters2();
  shaderCube();
  shaderCube2();
  shaderCube3();
  //shaderDonut();
  animate();
}
 
init();


