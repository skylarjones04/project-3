const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, dx: 4, dy: 4 };
let paddle = {
  x: canvas.width / 2 - 50,
  y: canvas.height - 60,
  width: 100,
  height: 10,
  speed: 6,
  dx: 0,
  dy: 0
};
let gameOver = false;
let level = 1;
let showLevelUp = false;
let levelUpTimer = 0;
const maxSpeed = 20; // Speed cap for the ball
let levelUpSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_34b3d4c8c1.mp3");

// Gradual speed increase
let speedIncreaseInterval = 3000; // milliseconds
let speedMultiplier = 1.05;
setInterval(() => {
  if (!gameOver) {
    ball.dx = Math.sign(ball.dx) * Math.min(Math.abs(ball.dx * speedMultiplier), maxSpeed);
    ball.dy = Math.sign(ball.dy) * Math.min(Math.abs(ball.dy * speedMultiplier), maxSpeed);
    level++;
    showLevelUp = true;
    levelUpTimer = Date.now();
    levelUpSound.play();
  }
}, speedIncreaseInterval);

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") paddle.dx = -paddle.speed;
  if (e.key === "ArrowRight") paddle.dx = paddle.speed;
  if (e.key === "ArrowUp") paddle.dy = -paddle.speed;
  if (e.key === "ArrowDown") paddle.dy = paddle.speed;
});

document.addEventListener("keyup", (e) => {
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) paddle.dx = 0;
  if (["ArrowUp", "ArrowDown"].includes(e.key)) paddle.dy = 0;
});

function update() {
  if (gameOver) return;

  ball.x += ball.dx;
  ball.y += ball.dy;
  paddle.x += paddle.dx;
  paddle.y += paddle.dy;

  // Wall collision (left/right)
  if (ball.x - ball.radius < 10 || ball.x + ball.radius > canvas.width - 10) {
    ball.dx *= -1;
  }

  // Ceiling collision (top wall)
  if (ball.y - ball.radius < 10) {
    ball.dy *= -1;
  }

  // Paddle collision
  if (
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    ball.dy *= -1;
  }

  // Ball falls below paddle (bottom wall)
  if (ball.y + ball.radius > canvas.height - 10) {
    gameOver = true;
  }

  // Prevent paddle from going off-screen
  if (paddle.x < 10) paddle.x = 10;
  if (paddle.x + paddle.width > canvas.width - 10) paddle.x = canvas.width - 10 - paddle.width;
  if (paddle.y < 10) paddle.y = 10;
  if (paddle.y + paddle.height > canvas.height - 10) paddle.y = canvas.height - 10 - paddle.height;
}

function draw() {
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#0f2027");
  gradient.addColorStop(0.5, "#203a43");
  gradient.addColorStop(1, "#2c5364");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw walls (all sides)
  ctx.fillStyle = "#888";
  ctx.shadowColor = "white";
  ctx.shadowBlur = 15;
  ctx.fillRect(0, 0, 10, canvas.height); // left wall
  ctx.fillRect(canvas.width - 10, 0, 10, canvas.height); // right wall
  ctx.fillRect(0, 0, canvas.width, 10); // top wall
  ctx.fillRect(0, canvas.height - 10, canvas.width, 10); // bottom wall
  ctx.shadowBlur = 0; // reset shadow

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();

  // Draw paddle
  ctx.fillStyle = "green";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Show level up message
  if (showLevelUp && Date.now() - levelUpTimer < 1000) {
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";
    ctx.fillText(`LEVEL ${level}`, canvas.width / 2, canvas.height / 2);
  } else {
    showLevelUp = false;
  }

  // Draw level-up progress bar
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

  // Game Over screen
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 60px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#ffcc00";
    ctx.fillText(`Final Level: ${level}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 60);
  }
}

function loop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  if (gameOver && e.key.toLowerCase() === "r") {
    document.location.reload();
  }
});

loop();



