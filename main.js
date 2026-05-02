import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import terrazzoModelUrl from './scala-piano-terra.glb?url';
import bagnoModelUrl from './accssso-dal-bagno.glb?url';

const MODEL_CONFIG = {
  terrazzo: {
    title: 'Scala Piano Terra',
    fileUrl: terrazzoModelUrl,
    description: `In questa posizione la scala permette l’accesso al tetto direttamente dal luogo esterno alla casa.
Inoltre, la collocazione al piano terra la rende più sicura e facile da ancorare e installare.

Con questa soluzione, il locale tecnico (chiuso) dovrebbe essere realizzato dove si trovano attualmente le bombole del gas.
Questa soluzione permette un minimo spostamento degli impianti, ma andrebbe a sacrificare la pianta d’ulivo, attualmente collocata nella stessa posizione.`,
  },
  bagno: {
    title: 'Accesso dal Bagno',
    fileUrl: bagnoModelUrl,
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
let lastFocusedElement = null;
let modalScrollY = 0;
let usingFixedBodyLock = false;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight.position.set(6, 10, 8);
scene.add(dirLight);

const center = new THREE.Vector3();

const infoButton = document.getElementById('viewer-info-button');
const toolbarToggleButton = document.getElementById('viewer-toolbar-toggle');
const descriptionModal = document.getElementById('viewer-description-modal');
const descriptionCloseButton = document.getElementById(
  'viewer-description-close'
);
const descriptionBackdrop = document.getElementById(
  'viewer-description-backdrop'
);

function isMobileLayout() {
  return window.matchMedia('(max-width: 600px)').matches;
}

function setToolbarExpanded(expanded) {
  if (!toolbarToggleButton) return;
  document.body.classList.toggle('toolbar-open', expanded);
  toolbarToggleButton.setAttribute('aria-expanded', String(expanded));
}

function closeToolbarIfMobile() {
  if (!isMobileLayout()) return;
  setToolbarExpanded(false);
}

function shouldUseFixedBodyLock() {
  return !isMobileLayout();
}

function openDescriptionModal() {
  if (!descriptionModal) return;
  closeToolbarIfMobile();
  lastFocusedElement = document.activeElement;

  usingFixedBodyLock = shouldUseFixedBodyLock();
  modalScrollY = window.scrollY;
  if (usingFixedBodyLock) {
    document.body.style.position = 'fixed';
    document.body.style.top = `-${modalScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  document.body.style.overflow = 'hidden';

  descriptionModal.classList.add('open');
  descriptionModal.setAttribute('aria-hidden', 'false');
  if (descriptionCloseButton instanceof HTMLElement) {
    descriptionCloseButton.focus();
  }
}

function closeDescriptionModal() {
  if (!descriptionModal) return;
  descriptionModal.classList.remove('open');
  descriptionModal.setAttribute('aria-hidden', 'true');

  if (usingFixedBodyLock) {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
  }
  document.body.style.overflow = '';

  if (usingFixedBodyLock) {
    window.scrollTo(0, modalScrollY);
  }
  usingFixedBodyLock = false;

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function updateUi(modelKey) {
  const descriptionElement = document.getElementById('viewer-description');
  const descriptionTitleElement = document.getElementById(
    'viewer-description-title'
  );
  const terrazzoLink = document.getElementById('model-link-terrazzo');
  const bagnoLink = document.getElementById('model-link-bagno');

  if (descriptionElement) {
    descriptionElement.textContent = MODEL_CONFIG[modelKey].description;
  }

  if (descriptionTitleElement) {
    descriptionTitleElement.textContent = MODEL_CONFIG[modelKey].title;
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

  updateUi(modelKey);

  loader.load(
    modelEntry.fileUrl,
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

if (infoButton instanceof HTMLElement) {
  infoButton.addEventListener('click', openDescriptionModal);
}

if (toolbarToggleButton instanceof HTMLElement) {
  toolbarToggleButton.addEventListener('click', () => {
    const isExpanded =
      toolbarToggleButton.getAttribute('aria-expanded') === 'true';
    setToolbarExpanded(!isExpanded);
  });
}

if (descriptionCloseButton instanceof HTMLElement) {
  descriptionCloseButton.addEventListener('click', closeDescriptionModal);
}

if (descriptionBackdrop instanceof HTMLElement) {
  descriptionBackdrop.addEventListener('click', closeDescriptionModal);
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!descriptionModal || !descriptionModal.classList.contains('open')) return;
  closeDescriptionModal();
});

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
  closeToolbarIfMobile();
});

window.addEventListener('resize', () => {
  if (!isMobileLayout()) {
    setToolbarExpanded(false);
  }
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
