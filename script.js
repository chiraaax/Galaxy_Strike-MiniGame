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
