import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MODEL_CONFIG = {
  terrazzo: {
    title: 'Scala Piano Terra',
    file: './scala-piano-terra.glb',
    description: `In questa posizione la scala permette l’accesso al tetto direttamente dal luogo esterno alla casa.
Inoltre, la collocazione al piano terra la rende più sicura e facile da ancorare e installare.

Con questa soluzione, il locale tecnico (chiuso) dovrebbe essere realizzato dove si trovano attualmente le bombole del gas.
Questa soluzione permette un minimo spostamento degli impianti, ma andrebbe a sacrificare la pianta d’ulivo, attualmente collocata nella stessa posizione.
Inserisci qui la descrizione del modello Scala Piano Terra.`,
  },
  bagno: {
    title: 'Accesso dal Bagno',
    file: './accssso-dal-bagno.glb',
    description: `Creando nell’attuale vano doccia una struttura portante (anche in metallo) abbastanza
robusta, si crea l’opportunità di posizionarvi al di sopra la scala per accesso al tetto, come
raffigurato.
L’accesso alla struttura ed al piano che si viene a creare è previsto principalmente dal
bagno di sopra.
Per accedere alla scala si prevede una apertura laterale ricavata nel parapetto.
La struttura di piano in metallo utilizzerebbe un angolo smussato nella parte anteriore`,
  },
};

const DEFAULT_MODEL_KEY = 'terrazzo';

function getModelKeyFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('model');
  if (requested && MODEL_CONFIG[requested]) return requested;
  return DEFAULT_MODEL_KEY;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f4f8);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(4, 2.5, 4);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.05;
controls.maxDistance = 200;

const loader = new GLTFLoader();
let currentModel = null;
let currentModelKey = getModelKeyFromUrl();

const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(6, 10, 8);
scene.add(dirLight);

const center = new THREE.Vector3();

function updateUi(modelKey) {
  const titleElement = document.getElementById('viewer-title');
  const descriptionElement = document.getElementById('viewer-description');
  const terrazzoLink = document.getElementById('model-link-terrazzo');
  const bagnoLink = document.getElementById('model-link-bagno');

  if (titleElement) {
    titleElement.textContent = `Vista corrente: ${MODEL_CONFIG[modelKey].title}`;
  }

  if (descriptionElement) {
    descriptionElement.textContent = MODEL_CONFIG[modelKey].description;
  }

  if (terrazzoLink && bagnoLink) {
    terrazzoLink.classList.toggle('active', modelKey === 'terrazzo');
    bagnoLink.classList.toggle('active', modelKey === 'bagno');
  }
}

function fitCameraToObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;

  const size = box.getSize(new THREE.Vector3());
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = (camera.fov * Math.PI) / 180;
  const distance = maxDim / (2 * Math.tan(fov / 2));

  camera.position
    .copy(center)
    .add(
      new THREE.Vector3(1.2, 0.8, 1.2)
        .normalize()
        .multiplyScalar(distance * 1.8)
    );
  camera.near = Math.max(maxDim / 1000, 0.001);
  camera.far = distance * 100;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.minDistance = Math.max(maxDim * 0.01, 0.01);
  controls.maxDistance = distance * 10;
  controls.update();
}

function loadModel(modelKey) {
  const modelEntry = MODEL_CONFIG[modelKey];
  if (!modelEntry) return;

  const modelUrl = new URL(modelEntry.file, import.meta.url).href;
  updateUi(modelKey);

  loader.load(
    modelUrl,
    function (gltf) {
      if (currentModel) {
        scene.remove(currentModel);
      }

      currentModel = gltf.scene;
      scene.add(currentModel);
      fitCameraToObject(currentModel);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function handleNavigationChange() {
  const nextModelKey = getModelKeyFromUrl();
  if (nextModelKey === currentModelKey) return;
  currentModelKey = nextModelKey;
  loadModel(currentModelKey);
}

window.addEventListener('popstate', handleNavigationChange);

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLAnchorElement)) return;

  const modelFromQuery = new URL(
    target.href,
    window.location.origin
  ).searchParams.get('model');

  if (!modelFromQuery || !MODEL_CONFIG[modelFromQuery]) return;

  event.preventDefault();

  if (modelFromQuery === currentModelKey) return;

  currentModelKey = modelFromQuery;
  history.pushState({}, '', `?model=${modelFromQuery}`);
  loadModel(currentModelKey);
});

loadModel(currentModelKey);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
