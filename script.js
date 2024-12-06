// Select the canvas and set up context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
let currentLevel = 1; // Start at level 1
let levelThreshold = 100; // Points needed to advance to the next level
let nextLevelScore = levelThreshold; // Score required for the next level
let spawningEnemies = false; // Track if enemies are currently spawning

canvas.addEventListener('touchstart', (e) => {
    const touchX = e.touches[0].clientX;
    player.dx = touchX < canvas.width / 2 ? -player.speed : player.speed;
});
canvas.addEventListener('touchend', () => {
    player.dx = 0;
});

// Player properties
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 70,
    width: 50,
    height: 50,
    color: 'blue',
    speed: 10,
    dx: 0,
    isHit: false,
    hitFlashDuration: 300
};

// Bullet properties
const bullets = [];
const bulletSpeed = 15;
let canShoot = true;
const fireRate = 100;

// Power-up properties
const powerUps = [];
const powerUpDuration = 5000;
let isPoweredUp = false;
let powerUpEndTime = 0;

// Enemy properties
const enemies = [];
let enemySpeed = 2;
let spawnInterval = 1000;

// Game properties
let score = 0;
let health = 5;
let gameOver = false;
let isPaused = false;
let highScore = localStorage.getItem('highScore') || 0;

// Starfield properties
const stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 1 + 0.5
}));

// Function to draw stars
function drawStars() {
    ctx.fillStyle = 'white';
    stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Move stars
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// Function to shoot bullets (with cooldown)
function shootBullet() {
    if (canShoot) {
        if (isPoweredUp) {
            bullets.push({ x: player.x + 5, y: player.y, width: 10, height: 30 });
            bullets.push({ x: player.x + player.width - 15, y: player.y, width: 10, height: 30 });
        } else {
            bullets.push({ x: player.x + player.width / 2 - 5, y: player.y, width: 10, height: 30 });
        }
        canShoot = false;
        setTimeout(() => { canShoot = true; }, fireRate);
    }
}

// Function to draw the player with gradient color
function drawPlayer() {
    if (player.isHit) ctx.fillStyle = 'red'; 
    else {
        const gradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
        gradient.addColorStop(0, 'blue'); gradient.addColorStop(1, 'cyan');
        ctx.fillStyle = gradient;
    }
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Function to draw bullets
function drawBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        if (bullet.y + bullet.height < 0) {
            bullets.splice(index, 1);
        }
    });
}

// Function to draw enemies
function drawEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemySpeed;
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            health -= 1;
            if (health <= 0) {
                gameOver = true;
                saveHighScore();
            }
        }

        // Collision with player
        if (enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y) {
            enemies.splice(index, 1);
            player.isHit = true;
            setTimeout(() => { player.isHit = false; }, player.hitFlashDuration);
            health -= 1;
        }
    });
}




