// butterfly.js – Three.js butterfly animation for the hero section
// Loaded as ES module via <script type=" module\ src=\butterfly.js\></script>

const DEBUG = location.hash === '#butterfly-debug';

function canRun3D(){
 if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
 if (navigator.connection && navigator.connection.saveData) return false;
 const canvas = document.createElement('canvas');
 const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
 return !!gl;
}

function init(){
 if (!canRun3D()) return;
 import('three').then(THREE => {
 const canvas = document.querySelector('.butterfly-canvas');
 if (!canvas) return;

 const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
 const setSize = () => { renderer.setSize(canvas.clientWidth, canvas.clientHeight); };
 setSize();

 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
 camera.position.set(0,1,3);
 camera.lookAt(0,0,0);

 const ambient = new THREE.AmbientLight(0xffffff,0.6);
 scene.add(ambient);
 const dir = new THREE.DirectionalLight(0xffffff,0.8);
 dir.position.set(5,5,5);
 scene.add(dir);

 const butterfly = new THREE.Group();
 scene.add(butterfly);

 // Body
 const bodyGeom = new THREE.CylinderGeometry(0.03,0.03,0.2,8);
 const bodyMat = new THREE.MeshStandardMaterial({color:0x222222});
 const body = new THREE.Mesh(bodyGeom, bodyMat);
 body.rotation.z = Math.PI/2;
 butterfly.add(body);

 // Wings
 const wingGeom = new THREE.PlaneGeometry(0.3,0.4);
 const texLoader = new THREE.TextureLoader();
 const wingTex = texLoader.load('butterfly-wing.png');
 const wingMat = new THREE.MeshStandardMaterial({map:wingTex, side:THREE.DoubleSide, transparent:true, opacity:0.9});
 const left = new THREE.Mesh(wingGeom, wingMat);
 const right = new THREE.Mesh(wingGeom, wingMat);
 left.position.set(-0.1,0,0); left.rotation.y = Math.PI/2;
 right.position.set(0.1,0,0); right.rotation.y = -Math.PI/2;
 butterfly.add(left); butterfly.add(right);

 const flapFreq = 5; // Hz
 const pathDur = 12; // seconds
 let start=null;
 function animate(ts){
 if(!start) start=ts;
 const elapsed = (ts-start)/1000;
 const prog = (elapsed % pathDur) / pathDur;
 const x = (prog<0.5 ? prog*2 : (1-prog)*2) * 2 - 1;
 const y = Math.sin(prog * Math.PI * 2) * 0.3;
 butterfly.position.set(x,y,0);
 const flap = Math.sin(elapsed * Math.PI * 2 * flapFreq) * 0.4;
 left.rotation.z = flap; right.rotation.z = -flap;
 butterfly.rotation.z = Math.sin(prog * Math.PI * 2) * 0.2;
 renderer.render(scene, camera);
 requestAnimationFrame(animate);
 }
 window.addEventListener('resize', setSize);
 requestAnimationFrame(animate);
 if(DEBUG) console.log('Butterfly debug mode active');
 }).catch(err=>{ console.error('Failed to load Three.js', err); });
}

if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
