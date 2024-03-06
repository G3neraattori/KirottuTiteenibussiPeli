const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const dudeImage = new Image();
dudeImage.src = 'dude.png';

const ahmoImage = new Image();
ahmoImage.src = 'ahmo.png';

const tableImage = new Image();
tableImage.src = 'table.png';

function fitToScreen() {
    // Fit canvas to screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

fitToScreen(); // Call initially
window.addEventListener('resize', fitToScreen); // Adjust size on window resize

// Dinosaur object
const dino = {
    x: 50,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    jumping: false,
    jumpHeight: 100,
    jumpSpeed: 7,
    draw() {
        ctx.fillStyle = '#666';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    jump() {
        if (!this.jumping) {
            this.jumping = true;
            let jumpInterval = setInterval(() => {
                this.y -= this.jumpSpeed;
                this.jumpHeight -= this.jumpSpeed;
                if (this.jumpHeight <= 0) {
                    clearInterval(jumpInterval);
                    let fallInterval = setInterval(() => {
                        this.y += this.jumpSpeed;
                        if (this.y >= canvas.height - this.height) {
                            clearInterval(fallInterval);
                            this.jumpHeight = 100;
                            this.jumping = false;
                        }
                    }, 20);
                }
            }, 20);
        }
    }
};

// Obstacle object
const obstacle = {
    x: canvas.width,
    y: canvas.height - 50,
    width: 20,
    height: 50,
    speed: 5,
    draw() {
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        this.x -= this.speed;
        if (this.x + this.width <= 0) {
            this.x = canvas.width;
            score++;
        }
    }
};

// Ahmo object
const ahmo = {
    x: canvas.width - 74, // Initial x position (right of canvas)
    y: 10, // Initial y position (top of canvas)
    speed: 1, // Speed of movement
    initialX: canvas.width - 74, // Initial x position for reset
    initialY: 10, // Initial y position for reset
    draw() {
        ctx.drawImage(ahmoImage, this.x, this.y, 64, 64);
    },
    update() {
        // Move ahmo downwards
        if (this.y < canvas.height - 74) {
            this.y += this.speed;
        }
        // Check if ahmo goes below the table
        if (this.y + 64 > canvas.height / 2) {
            gameOver = true;
        }
    },
    resetPosition() {
        this.x = this.initialX;
        this.y = this.initialY;
    }
};

let gameOver = false;
let score = 0;
let speedIncreaseTimer = 0;
let timer = 5;

gameLoop(); // Start the game loop immediately

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Score: ' + score, canvas.width / 2, 30);
    // Draw the dude image at the top-left corner
    ctx.drawImage(dudeImage, 10, 10, 64, 64);
    // Draw the table image in the middle-right area
    ctx.drawImage(tableImage, canvas.width - 74, canvas.height / 2 - 32, 64, 64);
    // Draw the timer below the dude image
    ctx.fillText('Timer: ' + timer, 10, 90);
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        ctx.fillText('Tap to restart.', canvas.width / 2, canvas.height / 2 + 15);
    } else {
        dino.draw();
        obstacle.draw();
        ahmo.draw();
    }
}

function update() {
    if (!gameOver) {
        obstacle.update();
        ahmo.update(); // Update ahmo's position
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            gameOver = true;
        }
    }
}

function gameLoop() {
    draw();
    update();
    requestAnimationFrame(gameLoop); // Keep looping
    // Decrease timer every second
    if (!gameOver && Date.now() - speedIncreaseTimer > 1000) {
        timer--;
        speedIncreaseTimer = Date.now();
        if (timer === 0) {
            gameOver = true;
        }
    }
    // Increase speed every 3 seconds
    if (!gameOver && Date.now() - speedIncreaseTimer > 3000) {
        obstacle.speed += 0.5;
        dino.speed += 0.5;
        speedIncreaseTimer = Date.now();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameOver) {
            dino.jump();
        } else {
            document.location.reload();
        }
    }
});

canvas.addEventListener('click', (e) => {
    if (!gameOver) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        if (clickX >= 10 && clickX <= 74 && clickY >= 10 && clickY <= 74) {
            timer = 5; // Reset timer if clicked on the dude image
        } else if (clickX >= ahmo.x && clickX <= ahmo.x + 64 && clickY >= ahmo.y && clickY <= ahmo.y + 64) {
            ahmo.resetPosition(); // Reset ahmo's position if clicked on the ahmo image
        } else {
            dino.jump();
        }
    } else {
        document.location.reload();
    }
});

// Handle touch events for mobile devices
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameOver) {
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        if (touchX >= 10 && touchX <= 74 && touchY >= 10 && touchY <= 74) {
            timer = 5; // Reset timer if touched on the dude image
        } else if (touchX >= ahmo.x && touchX <= ahmo.x + 64 && touchY >= ahmo.y && touchY <= ahmo.y + 64) {
            ahmo.resetPosition(); // Reset ahmo's position if touched on the ahmo image
        } else {
            dino.jump();
        }
    } else {
        document.location.reload();
    }
});
