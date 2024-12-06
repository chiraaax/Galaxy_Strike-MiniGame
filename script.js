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
