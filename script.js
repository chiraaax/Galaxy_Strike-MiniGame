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

// Function to draw power-ups
function drawPowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.speed;
        ctx.fillStyle = 'lime';
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.size, 0, Math.PI * 2);
        ctx.fill();

        if (powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
        }
    });
}

// Function to spawn an enemy
function spawnEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 50,
        height: 50
    });
}

// Function to spawn a power-up
function spawnPowerUp() {
    if (!gameOver && !isPaused) {
        powerUps.push({
            x: Math.random() * canvas.width,
            y: -20,
            size: 15,
            speed: 2
        });
    }
}

setInterval(() => {
    if (!isPaused && !gameOver) {
        spawnPowerUp();
    }
}, 8000);  // Adjust spawn interval if needed


// Function to activate power-up
function activatePowerUp() {
    isPoweredUp = true;
    powerUpEndTime = Date.now() + powerUpDuration;
    setTimeout(() => {
        isPoweredUp = false;
    }, powerUpDuration);
}

// Function to save high score
function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

// Function to detect collisions
function detectCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
            }
        });
    });

// Player-powerUp collisions
powerUps.forEach((powerUp, powerUpIndex) => {
    if (
        player.x < powerUp.x + powerUp.size &&
        player.x + player.width > powerUp.x - powerUp.size &&
        player.y < powerUp.y + powerUp.size &&
        player.y + player.height > powerUp.y - powerUp.size
    ) {
        powerUps.splice(powerUpIndex, 1);
        activatePowerUp();
    }
});

}

// Function to draw HUD
function drawHUD() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 10, 30);

    const barWidth = 150;
    const barHeight = 15;
    const healthRatio = health / 5;
    const barX = canvas.width - barWidth - 20;

    ctx.fillStyle = 'red';
    ctx.fillRect(barX, 40, barWidth, barHeight);
    ctx.fillStyle = 'lime';
    ctx.fillRect(barX, 40, barWidth * healthRatio, barHeight);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(barX, 40, barWidth, barHeight);
}

// Function to show game-over screen
function showGameOver() {
    ctx.fillStyle = 'red';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font = '30px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
}

// Function to toggle pause state
function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        renderPauseMessage();
    } else {
        if (!spawningEnemies) {
            spawnEnemies(); // Resume spawning if it hasn't already resumed
        }
        requestAnimationFrame(gameLoop);
    }
}


function renderPauseMessage() {
    // Dim the background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Display pause text
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '20px Arial';
    ctx.fillText('Press "R" to Restart', canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press "P" to Resume', canvas.width / 2, canvas.height / 2 + 60);
}

function restartGame() {
    score = 0; health = 5; gameOver = false; isPaused = false;
    enemies.length = 0; bullets.length = 0; powerUps.length = 0;
    spawnEnemies(); gameLoop();
}

// Function to update player position
function updatePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Keyboard input handlers
function handleKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
    else if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
    else if (e.key === ' ') shootBullet();
    else if (e.key === 'p') togglePause();
    else if (e.key === 'r') if (isPaused || gameOver) restartGame();
}          
  
function handleKeyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
        player.dx = 0;
    }
}

// Game loop
function gameLoop() {
    if (gameOver) {
        showGameOver();
        return;
    }

    if (isPaused) {
        return; // Skip the loop if paused
    }

    // Clear the canvas and draw game elements
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPowerUps();
    detectCollisions();
    updatePlayer();
    drawHUD();

    // Visual effect for power-up activation
    if (isPoweredUp) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(gameLoop);
}

// Spawn enemies at dynamic intervals
function spawnEnemies() {
    if (gameOver || isPaused || spawningEnemies) return;

    spawningEnemies = true; // Set the flag to true when spawning starts
    spawnEnemy();

    setTimeout(() => {
        spawningEnemies = false; // Reset the flag after the timeout
        spawnEnemies(); // Continue the spawn cycle
    }, spawnInterval);
}










