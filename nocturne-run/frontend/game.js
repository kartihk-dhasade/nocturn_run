const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ==========================
// GAME STATE
// ==========================
let gameOver = false;
let gameTime = 0;
let dragonPhase = false;
let gameCompleted = false;
let outroTime = 0;

// ==========================
// BACKGROUND (STATIC)
// ==========================
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1c1c3a");
    gradient.addColorStop(1, "#0a0a1a");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Moon
    ctx.beginPath();
    ctx.arc(canvas.width - 200, 150, 80, 0, Math.PI * 2);
    ctx.fillStyle = "#dcdcff";
    ctx.fill();

    // Castle layers
    ctx.fillStyle = "#111";
    for (let i = 0; i < canvas.width; i += 200) {
        ctx.fillRect(i, canvas.height - 260, 80, 60);
        ctx.fillRect(i + 20, canvas.height - 320, 40, 60);
    }

    ctx.fillStyle = "#000";
    ctx.fillRect(0, canvas.height - 200, canvas.width, 200);
}

// ==========================
// PLAYER
// ==========================
const player = {
    x: 100,
    y: canvas.height - 260,
    width: 40,
    height: 60,
    normalHeight: 60,
    slideHeight: 30,
    velocityY: 0,
    gravity: 0.7,
    jumpForce: -14,
    onGround: true,
    isSliding: false
};

// ==========================
// OBSTACLES
// ==========================
let obstacles = [];

function spawnObstacle() {
    if (gameOver || dragonPhase) return;

    if (Math.random() < 0.5) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 200,
            width: 30,
            height: 30
        });
    } else {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 230,
            width: 60,
            height: 30
        });
    }
}

setInterval(spawnObstacle, 1500);

// ==========================
// FIREBALLS
// ==========================
let fireballs = [];

function spawnFireball() {
    if (!dragonPhase || gameOver || gameCompleted) return;

    fireballs.push({
        x: canvas.width - 150,
        y: canvas.height - 300,
        size: 20
    });
}

setInterval(spawnFireball, 1200);

// ==========================
// COLLISION
// ==========================
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// ==========================
// GAME LOOP
// ==========================
let speed = 6;

function update() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    if (gameCompleted) {
        outroTime++;
        drawOutro();
        requestAnimationFrame(update);
        return;
    }

    gameTime++;

    if (gameTime > 300) dragonPhase = true;
    if (gameTime > 700) gameCompleted = true;

    // Gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    if (player.y + player.height >= canvas.height - 200) {
        player.y = canvas.height - 200 - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }

    // Obstacles
    obstacles.forEach((obs) => {
        obs.x -= speed;
        if (isColliding(player, obs)) gameOver = true;
    });

    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

    // Fireballs
    fireballs.forEach((f) => {
        f.x -= speed + 3;

        const fb = { x: f.x, y: f.y, width: f.size, height: f.size };

        if (isColliding(player, fb)) gameOver = true;
    });

    fireballs = fireballs.filter(f => f.x > 0);

    draw();
    requestAnimationFrame(update);
}

// ==========================
// DRAW PLAYER (RUNNING)
// ==========================
function drawPlayer() {
    ctx.save();

    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

    let tilt = Math.sin(gameTime * 0.2) * 0.15;
    ctx.rotate(tilt);

    // body
    ctx.fillStyle = "#000";
    ctx.fillRect(-20, -30, 40, 60);

    // legs
    let legOffset = Math.sin(gameTime * 0.4) * 10;

    ctx.fillRect(-15, 30 + legOffset, 10, 20);
    ctx.fillRect(5, 30 - legOffset, 10, 20);

    ctx.restore();
}

// ==========================
// DRAW DRAGON
// ==========================
function drawDragon() {
    ctx.fillStyle = "#000";

    ctx.beginPath();
    ctx.moveTo(canvas.width - 200, canvas.height - 300);
    ctx.lineTo(canvas.width - 100, canvas.height - 350);
    ctx.lineTo(canvas.width - 50, canvas.height - 300);
    ctx.lineTo(canvas.width - 100, canvas.height - 260);
    ctx.closePath();
    ctx.fill();

    // eye glow
    ctx.beginPath();
    ctx.arc(canvas.width - 120, canvas.height - 310, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#6a5acd";
    ctx.fill();
}

// ==========================
// DRAW GAME
// ==========================
function draw() {
    drawBackground();

    drawPlayer();

    obstacles.forEach((obs) => {
        ctx.fillStyle = "#000";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    if (dragonPhase) drawDragon();

    // fireballs
    fireballs.forEach((f) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size + 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(106,90,205,0.2)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
    });
}

// ==========================
// OUTRO
// ==========================
function drawOutro() {
    drawBackground();

    let flyY = Math.max(canvas.height - 260 - outroTime * 2, -100);

    drawDragon();
    ctx.fillRect(canvas.width - 150, flyY + 20, 30, 40);

    ctx.beginPath();
    ctx.arc(canvas.width - 150, 100, 60, 0, Math.PI * 2);
    ctx.fillStyle = "#6a5acd";
    ctx.fill();

    if (outroTime > 150) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("YOU ESCAPED", canvas.width / 2 - 140, canvas.height / 2);
    }
}

// ==========================
// GAME OVER
// ==========================
function drawGameOver() {
    draw();

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
}

// ==========================
// CONTROLS
// ==========================
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && player.onGround && !gameOver) {
        player.velocityY = player.jumpForce;
        player.onGround = false;
    }

    if (e.code === "ShiftLeft" && !gameOver) {
        player.height = player.slideHeight;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ShiftLeft") {
        player.height = player.normalHeight;
    }
});

// Start
update();