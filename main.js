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

// Gradual speed increase
let speedIncreaseInterval = 15000; // milliseconds
let speedMultiplier = 1.05;
setInterval(() => {
  if (!gameOver) {
    ball.dx = Math.sign(ball.dx) * Math.min(Math.abs(ball.dx * speedMultiplier), maxSpeed);
    ball.dy = Math.sign(ball.dy) * Math.min(Math.abs(ball.dy * speedMultiplier), maxSpeed);
    level++;
    showLevelUp = true;
    levelUpTimer = Date.now();
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
    alert("Game Over!");
    document.location.reload();
  }

  // Prevent paddle from going off-screen
  if (paddle.x < 10) paddle.x = 10;
  if (paddle.x + paddle.width > canvas.width - 10) paddle.x = canvas.width - 10 - paddle.width;
  if (paddle.y < 10) paddle.y = 10;
  if (paddle.y + paddle.height > canvas.height - 10) paddle.y = canvas.height - 10 - paddle.height;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  ctx.fillStyle = "blue";
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
}

function loop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(loop);
}

loop();


