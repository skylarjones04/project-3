// Bouncing Ball Game with Three.js - Full 3D Version
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 10);
light.castShadow = true;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Background
scene.background = new THREE.Color(0x202020);

// Ball
const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x220000 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.castShadow = true;
scene.add(ball);

// Paddle
const paddleGeometry = new THREE.BoxGeometry(2, 0.2, 1);
const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
paddle.receiveShadow = true;
scene.add(paddle);

// Walls
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const wallGeo = new THREE.BoxGeometry(0.2, 10, 10);
const leftWall = new THREE.Mesh(wallGeo, wallMaterial);
leftWall.position.set(-6, 2.5, 0);
scene.add(leftWall);

const rightWall = new THREE.Mesh(wallGeo, wallMaterial);
rightWall.position.set(6, 2.5, 0);
scene.add(rightWall);

const backWall = new THREE.Mesh(new THREE.BoxGeometry(12, 10, 0.2), wallMaterial);
backWall.position.set(0, 2.5, -5);
scene.add(backWall);

// Floor
const floor = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 10), new THREE.MeshStandardMaterial({ color: 0x333333 }));
floor.position.set(0, -0.1, 0);
floor.receiveShadow = true;
scene.add(floor);

// Score
let score = 0;
let scoreText;
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
  const textGeometry = new TextGeometry(`Score: ${score}`, {
    font: font,
    size: 0.5,
    height: 0.1
  });
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  scoreText = new THREE.Mesh(textGeometry, textMaterial);
  scoreText.position.set(-4, 7, 4);
  scene.add(scoreText);
});

// Sound
const listener = new THREE.AudioListener();
camera.add(listener);

const bounceSound = new THREE.Audio(listener);
const gameOverSound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('https://cdn.pixabay.com/audio/2022/03/15/audio_34b3d4c8c1.mp3', function (buffer) {
  bounceSound.setBuffer(buffer);
  bounceSound.setVolume(0.5);
});
audioLoader.load('https://cdn.pixabay.com/audio/2022/03/26/audio_f0f3e2e1fa.mp3', function (buffer) {
  gameOverSound.setBuffer(buffer);
  gameOverSound.setVolume(0.5);
});

// Positions
ball.position.set(0, 1, 0);
paddle.position.set(0, 0, 4);
camera.position.set(0, 5, 15);
camera.lookAt(0, 1, 0);

// Game state
let ballVelocity = { x: 0.1, y: 0.1, z: -0.1 };
let paddleSpeed = 0.4;
let paddleVelocity = 0;
let gameOver = false;
let difficultyInterval = 5000;
const speedCap = 1.2;

// Controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') paddleVelocity = -paddleSpeed;
  if (e.key === 'ArrowRight') paddleVelocity = paddleSpeed;
});

document.addEventListener('keyup', () => {
  paddleVelocity = 0;
});

// Difficulty scaling
setInterval(() => {
  if (!gameOver) {
    ballVelocity.x = Math.sign(ballVelocity.x) * Math.min(Math.abs(ballVelocity.x) * 1.05, speedCap);
    ballVelocity.y = Math.sign(ballVelocity.y) * Math.min(Math.abs(ballVelocity.y) * 1.05, speedCap);
    ballVelocity.z = Math.sign(ballVelocity.z) * Math.min(Math.abs(ballVelocity.z) * 1.05, speedCap);
  }
}, difficultyInterval);

// Animate
function animate() {
  if (gameOver) return;
  requestAnimationFrame(animate);

  ball.position.x += ballVelocity.x;
  ball.position.y += ballVelocity.y;
  ball.position.z += ballVelocity.z;

  // Wall collisions
  if (ball.position.x > 5.8 || ball.position.x < -5.8) ballVelocity.x *= -1;
  if (ball.position.y > 9.8 || ball.position.y < 0.5) ballVelocity.y *= -1;
  if (ball.position.z < -4.8) ballVelocity.z *= -1;

  // Paddle movement
  paddle.position.x += paddleVelocity;
  if (paddle.position.x > 4.5) paddle.position.x = 4.5;
  if (paddle.position.x < -4.5) paddle.position.x = -4.5;

  // Paddle collision
  if (
    ball.position.z >= paddle.position.z - 0.6 &&
    ball.position.z <= paddle.position.z &&
    ball.position.x >= paddle.position.x - 1 &&
    ball.position.x <= paddle.position.x + 1 &&
    ball.position.y <= paddle.position.y + 0.6
  ) {
    ballVelocity.z *= -1;
    bounceSound.play();
    score++;
    updateScoreText();
    camera.position.x = (Math.random() - 0.5) * 0.3;
    camera.position.y = 5 + (Math.random() - 0.5) * 0.3;
  }

  // Game over
  if (ball.position.z > 6) {
    gameOver = true;
    gameOverSound.play();
    alert(`Game Over! Score: ${score}`);
    location.reload();
  }

  renderer.render(scene, camera);
}

function updateScoreText() {
  if (!scoreText) return;
  scene.remove(scoreText);
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new TextGeometry(`Score: ${score}`, {
      font: font,
      size: 0.5,
      height: 0.1
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    scoreText = new THREE.Mesh(textGeometry, textMaterial);
    scoreText.position.set(-4, 7, 4);
    scene.add(scoreText);
  });
}

animate();

