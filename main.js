const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, dx: 4, dy: 4 };
let paddle = {
  x: canvas.width / 2 - 75,
  y: canvas.height - 60,
  width: 150,
  height: 15,
  speed: 6,
  dx: 0,
  dy: 0
};
let gameOver = false;
let level = 1;
let lives = 3;
let showLevelUp = false;
let levelUpTimer = 0;
let flashScreen = false;
let flashStart = 0;
let screenShake = false;
let shakeStart = 0;
const maxSpeed = 20;

let heart = {
  x: Math.random() * (canvas.width - 60) + 30,
  y: Math.random() * (canvas.height / 2) + 30,
  baseY: 0,
  size: 40,
  active: true,
  bounceAmplitude: 10,
  bounceSpeed: 0.005,
  bounceOffset: Math.random() * 1000
};
heart.baseY = heart.y;

// Sound effects
let levelUpSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_34b3d4c8c1.mp3");
let hitSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_70f49231a1.mp3");
let wallSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_f108e13aa8.mp3");
let gameOverSound = new Audio("https://cdn.pixabay.com/audio/2022/03/22/audio_f8b8b4d5c6.mp3");
let lifeLostSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_d1cf70c2d0.mp3");
let lifeCollectSound = new Audio("https://cdn.pixabay.com/audio/2022/03/25/audio_2cfcc08952.mp3");

// Gradual speed increase
let speedIncreaseInterval = 15000;
let speedMultiplier = 1.05;
setInterval(() => {
  if (!gameOver) {
    ball.dx = Math.sign(ball.dx) * Math.min(Math.abs(ball.dx * speedMultiplier), maxSpeed);
    ball.dy = Math.sign(ball.dy) * Math.min(Math.abs(ball.dy * speedMultiplier), maxSpeed);
    level++;
    showLevelUp = true;
    levelUpTimer = Date.now();
    levelUpSound.play();
    if (!heart.active) {
      heart.x = Math.random() * (canvas.width - 60) + 30;
      heart.baseY = Math.random() * (canvas.height / 2) + 30;
      heart.y = heart.baseY;
      heart.active = true;
      heart.bounceOffset = Math.random() * 1000;
    }
  }
}, speedIncreaseInterval);

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") paddle.dx = -paddle.speed;
  if (e.key === "ArrowRight") paddle.dx = paddle.speed;
  if (e.key === "ArrowUp") paddle.dy = -paddle.speed;
  if (e.key === "ArrowDown") paddle.dy = paddle.speed;
  if (gameOver && e.key.toLowerCase() === "r") {
    document.location.reload();
  }
});

document.addEventListener("keyup", (e) => {
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) paddle.dx = 0;
  if (["ArrowUp", "ArrowDown"].includes(e.key)) paddle.dy = 0;
});

function resetBallAndPaddle() {
  ball.x = Math.random() * (canvas.width - 100) + 50;
  ball.y = Math.random() * (canvas.height / 2) + 50;
  ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = 4 * (Math.random() > 0.5 ? 1 : -1);
  paddle.x = canvas.width / 2 - paddle.width / 2;
  paddle.y = canvas.height - 60;
  paddle.dx = 0;
  paddle.dy = 0;
}

function update() {
  if (gameOver) return;

  ball.x += ball.dx;
  ball.y += ball.dy;
  paddle.x += paddle.dx;
  paddle.y += paddle.dy;

  if (ball.x - ball.radius < 10 || ball.x + ball.radius > canvas.width - 10) {
    ball.dx *= -1;
    wallSound.play();
  }

  if (ball.y - ball.radius < 10) {
    ball.dy *= -1;
    wallSound.play();
  }

  if (
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    ball.dy *= -1;
    hitSound.play();
  }

  if (
    heart.active &&
    ball.x + ball.radius > heart.x &&
    ball.x - ball.radius < heart.x + heart.size &&
    ball.y + ball.radius > heart.y &&
    ball.y - ball.radius < heart.y + heart.size
  ) {
    lives++;
    heart.active = false;
    lifeCollectSound.play();
  }

  if (ball.y + ball.radius > canvas.height - 10) {
    lives--;
    if (lives > 0) {
      lifeLostSound.play();
      resetBallAndPaddle();
      flashScreen = true;
      flashStart = Date.now();
      screenShake = true;
      shakeStart = Date.now();
    } else {
      gameOver = true;
      gameOverSound.play();
    }
  }

  if (paddle.x < 10) paddle.x = 10;
  if (paddle.x + paddle.width > canvas.width - 10) paddle.x = canvas.width - 10 - paddle.width;
  if (paddle.y < 10) paddle.y = 10;
  if (paddle.y + paddle.height > canvas.height - 10) paddle.y = canvas.height - 10 - paddle.height;
}

function draw() {
  if (screenShake && Date.now() - shakeStart < 300) {
    ctx.save();
    ctx.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);
  }

  if (flashScreen && Date.now() - flashStart < 200) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    flashScreen = false;
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#0f2027");
  gradient.addColorStop(0.5, "#203a43");
  gradient.addColorStop(1, "#2c5364");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#888";
  ctx.shadowColor = "white";
  ctx.shadowBlur = 15;
  ctx.fillRect(0, 0, 10, canvas.height);
  ctx.fillRect(canvas.width - 10, 0, 10, canvas.height);
  ctx.fillRect(0, 0, canvas.width, 10);
  ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = "green";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  if (heart.active) {
    const time = Date.now();
    heart.y = heart.baseY + Math.sin((time + heart.bounceOffset) * heart.bounceSpeed) * heart.bounceAmplitude;
    ctx.font = "48px Arial";
    ctx.fillStyle = "#ff4d4d";
    ctx.fillText("\u2665", heart.x, heart.y + heart.size);
  }

  if (showLevelUp && Date.now() - levelUpTimer < 1000) {
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";
    ctx.fillText(`LEVEL ${level}`, canvas.width / 2, canvas.height / 2);
  } else {
    showLevelUp = false;
  }

  const timeSinceLevel = Date.now() - levelUpTimer;
  const progress = Math.min((timeSinceLevel % speedIncreaseInterval) / speedIncreaseInterval, 1);
  const barWidth = 200;
  const barHeight = 10;
  const barX = canvas.width - barWidth - 20;
  const barY = 20;
  ctx.fillStyle = "#222";
  ctx.fillRect(barX, barY, barWidth, barHeight);
  ctx.fillStyle = "lime";
  ctx.fillRect(barX, barY, barWidth * progress, barHeight);
  ctx.strokeStyle = "white";
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  for (let i = 0; i < lives; i++) {
    ctx.font = "24px Arial";
    ctx.fillStyle = "#ff4d4d";
    ctx.fillText("\u2665", 20 + i * 30, 30);
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 60px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#ffcc00";
    ctx.fillText(`High Score: ${level}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 60);
  }

  if (screenShake && Date.now() - shakeStart < 300) {
    ctx.restore();
  } else {
    screenShake = false;
  }
}

function loop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(loop);
}

loop();







