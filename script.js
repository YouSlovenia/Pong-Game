const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 12;
const paddleHeight = 80;
const ballRadius = 10;
const playerX = 20;
const aiX = canvas.width - paddleWidth - 20;
const paddleSpeed = 6;
let playerY = (canvas.height - paddleHeight) / 2;
let aiY = (canvas.height - paddleHeight) / 2;

// Ball state
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);

// Score
let playerScore = 0;
let aiScore = 0;

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "32px Arial";
    ctx.fillText(text, x, y);
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

function collision(paddleX, paddleY) {
    // Simple AABB collision
    return (
        ballX + ballRadius > paddleX &&
        ballX - ballRadius < paddleX + paddleWidth &&
        ballY + ballRadius > paddleY &&
        ballY - ballRadius < paddleY + paddleHeight
    );
}

function update() {
    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top and bottom wall collision
    if (ballY - ballRadius < 0) {
        ballY = ballRadius;
        ballSpeedY = -ballSpeedY;
    }
    if (ballY + ballRadius > canvas.height) {
        ballY = canvas.height - ballRadius;
        ballSpeedY = -ballSpeedY;
    }

    // Left paddle collision
    if (collision(playerX, playerY)) {
        ballX = playerX + paddleWidth + ballRadius; // avoid sticking
        ballSpeedX = -ballSpeedX;
        // Add some effect based on where it hits the paddle
        let collidePoint = (ballY - (playerY + paddleHeight / 2));
        ballSpeedY = collidePoint * 0.25;
    }

    // Right paddle (AI) collision
    if (collision(aiX, aiY)) {
        ballX = aiX - ballRadius; // avoid sticking
        ballSpeedX = -ballSpeedX;
        let collidePoint = (ballY - (aiY + paddleHeight / 2));
        ballSpeedY = collidePoint * 0.25;
    }

    // Left and right wall (score)
    if (ballX - ballRadius < 0) {
        aiScore++;
        resetBall();
    }
    if (ballX + ballRadius > canvas.width) {
        playerScore++;
        resetBall();
    }

    // AI movement (simple follow)
    let aiCenter = aiY + paddleHeight / 2;
    if (ballY < aiCenter - 12) {
        aiY -= paddleSpeed;
    } else if (ballY > aiCenter + 12) {
        aiY += paddleSpeed;
    }
    // Clamp AI paddle
    aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));
}

function render() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, "#111");
    // Middle line
    for (let i = 0; i < canvas.height; i += 32) {
        drawRect(canvas.width / 2 - 1, i, 2, 16, "#555");
    }
    // Draw paddles
    drawRect(playerX, playerY, paddleWidth, paddleHeight, "#4dd0e1");
    drawRect(aiX, aiY, paddleWidth, paddleHeight, "#f06292");
    // Draw ball
    drawCircle(ballX, ballY, ballRadius, "#fff");
    // Scores
    drawText(playerScore, canvas.width / 2 - 60, 50, "#4dd0e1");
    drawText(aiScore, canvas.width / 2 + 36, 50, "#f06292");
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Mouse movement for player paddle
canvas.addEventListener('mousemove', function(evt) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    playerY = mouseY - paddleHeight / 2;
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - paddleHeight) playerY = canvas.height - paddleHeight;
});

// Start the game
gameLoop();
