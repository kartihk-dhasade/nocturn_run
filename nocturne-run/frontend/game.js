const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ==========================
// ASSETS
// ==========================
const bg = new Image();
bg.src = "assets/background.png";

const playerImg = new Image();
playerImg.src = "assets/player.png";

// ==========================
// GAME STATE
// ==========================
let gameOver = false;
let gameTime = 0;

// ==========================
// PLAYER (GOOD FEEL)
// ==========================
const player = {
    x: 120,
    width: 60,
    height: 90,
    velocityY: 0,
    velocityX: 0,
    gravity: 0.65,
    jumpForce: -16,
    onGround: true,

    coyoteTime: 0,
    jumpBuffer: 0
};

// ==========================
// PLATFORMS (PARKOUR)
// ==========================
let platforms = [];

function spawnPlatform() {
    if (gameOver) return;

    let yLevels = [
        canvas.height - 200,
        canvas.height - 300,
        canvas.height - 400
    ];

    let y = yLevels[Math.floor(Math.random() * yLevels.length)];

    platforms.push({
        x: canvas.width,
        y: y,
        width: 180,
        height: 20
    });
}

setInterval(spawnPlatform, 1600);

// ==========================
// OBSTACLES + GUARDS
// ==========================
let obstacles = [];

function spawnObstacle() {
    if (gameOver) return;

    let type = Math.random();
    let obs;

    if (type < 0.5) {
        obs = { width: 40, height: 40, type: "box" };
    } else {
        obs = { width: 50, height: 90, type: "guard" };
    }

    obs.x = canvas.width + Math.random() * 200;
    obs.y = canvas.height - 200 - obs.height;

    obstacles.push(obs);
}

setInterval(spawnObstacle, 2000);

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
let speed = 4.5;

function update() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    gameTime++;

    // ======================
    // PLAYER PHYSICS
    // ======================
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    player.onGround = false;

    // platforms
    platforms.forEach(p => {
        if (
            player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + 20
        ) {
            player.y = p.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
            player.coyoteTime = 10;
        }
    });

    // ground fallback
    if (player.y + player.height >= canvas.height - 200) {
        player.y = canvas.height - 200 - player.height;
        player.velocityY = 0;
        player.onGround = true;
        player.coyoteTime = 10;
    }

    // coyote time
    if (!player.onGround) player.coyoteTime--;

    // jump buffer
    if (player.jumpBuffer > 0) player.jumpBuffer--;

    // execute jump
    if (player.jumpBuffer > 0 && player.coyoteTime > 0) {
        player.velocityY = player.jumpForce;
        player.onGround = false;
        player.jumpBuffer = 0;
    }

    // forward boost (parkour feel)
    player.velocityX = player.onGround ? 0 : 2.2;

    // ======================
    // MOVE WORLD
    // ======================
    platforms.forEach(p => p.x -= speed);
    platforms = platforms.filter(p => p.x + p.width > 0);

    obstacles.forEach(obs => {
        obs.x -= speed + player.velocityX;
        if (isColliding(player, obs)) gameOver = true;
    });
    obstacles = obstacles.filter(o => o.x + o.width > 0);

    draw();
    requestAnimationFrame(update);
}

// ==========================
// DRAW GUARD (HUMAN)
// ==========================
function drawGuard(x, y, w, h) {
    ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.5);

    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.2, w * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(x + w * 0.3, y + h * 0.8, w * 0.15, h * 0.2);
    ctx.fillRect(x + w * 0.55, y + h * 0.8, w * 0.15, h * 0.2);
}

// ==========================
// DRAW
// ==========================
function draw() {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // ground
    ctx.fillStyle = "#000";
    ctx.fillRect(0, canvas.height - 200, canvas.width, 200);

    // platforms
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // player
    if (playerImg.complete) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    }

    // obstacles
    obstacles.forEach(obs => {
        if (obs.type === "guard") {
            drawGuard(obs.x, obs.y, obs.width, obs.height);
        } else {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
    });
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
    if (e.code === "Space") {
        player.jumpBuffer = 10;
    }
});

// init
player.y = canvas.height - 200 - player.height;
update();