const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const busImage = new Image();
busImage.src = 'bus.png';

const ahmoImage = new Image();
ahmoImage.src = 'ahmo.png';

const tableImage = new Image();
tableImage.src = 'table.png';

const riipasuImage = new Image();
riipasuImage.src = 'riipasu.png';

function fitToScreen() {
    // Fit canvas to screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

fitToScreen(); // Call initially
window.addEventListener('resize', fitToScreen); // Adjust size on window resize

// Bus object
const bus = {
    x: 50,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    jumping: false,
    jumpHeight: 100,
    jumpSpeed: 7,
    draw() {
        ctx.drawImage(busImage, this.x, this.y, this.width, this.height);
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

// Table object
const table = {
    x: canvas.width - 74, // Initial x position (right of canvas)
    y: canvas.height / 2 - 32, // Initial y position (middle of canvas)
    draw() {
        ctx.drawImage(tableImage, this.x, this.y, 64, 64);
    }
};

// Riipasu object
const riipasu = {
    x: 10, // Initial x position (left of canvas)
    y: canvas.height / 2 - 32, // Initial y position (middle of canvas)
    visible: false, // Flag to track visibility
    tapsNeeded: 0, // Number of taps needed to make it disappear (initially 0)
    tapCount: 0, // Current tap count
    visibleTimer: 0, // Timer to track visibility duration
    appear() {
        this.x = 10 + Math.random() * (canvas.width / 2 - 74); // Random x position between left edge and middle of canvas
        this.y = canvas.height / 2 - 32 + Math.random() * (canvas.height / 2 - 74); // Random y position between middle and bottom of canvas
        this.visible = true;
        this.tapsNeeded = Math.floor(Math.random() * 3) + 1; // Random taps needed between 1 and 3
        this.tapCount = 0;
        this.visibleTimer = Date.now();
    },
    draw() {
        if (this.visible) {
            ctx.drawImage(riipasuImage, this.x, this.y, 64, 64);
        }
    },
    update() {
        if (this.visible && Date.now() - this.visibleTimer > 2000) {
            // If visible for more than 2 seconds, make it disappear and trigger game over
            this.visible = false;
            gameOver = true;
        }
    },
    handleTap() {
        if (this.visible && this.tapCount < this.tapsNeeded) {
            this.tapCount++;
            if (this.tapCount >= this.tapsNeeded) {
                this.visible = false;
                // Reset tap count for next appearance
                setTimeout(() => {
                    this.appear();
                }, Math.random() * 1800 + 200);
            }
        }
    }
};

let gameOver = false;
let score = 0;
let speedIncreaseTimer = 0;
let timer = 5;
let paused = false; // Variable to keep track of whether the game is paused
let scoreNotification10Shown = false; // Variable to track whether the 10 score notification has been shown
let scoreNotification20Shown = false; // Variable to track whether the 20 score notification has been shown
let scoreNotification30Shown = false; // Variable to track whether the 30 score notification has been shown
let winNotificationShown = false; // Variable to track whether the win notification has been shown
let gameStarted = false; // Variable to track whether the game has started

gameLoop(); // Start the game loop immediately

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Score: ' + score, canvas.width / 2, 30);

    if (gameStarted) {
        // Draw the bus image at the top-left corner
        ctx.drawImage(busImage, 10, 10, 64, 64);
        // Draw the timer below the bus image
        ctx.fillText('Timer: ' + timer, 10, 90);
        // Draw Ahmo and Table only after the 20 score notification is shown
        if (scoreNotification20Shown) {
            ahmo.draw();
            table.draw();
        }
        // Draw Riipasu if the 30 score notification is shown
        if (scoreNotification30Shown) {
            riipasu.draw();
        }
    }

    if (paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        if (score === 10 && scoreNotification10Shown) {
            ctx.fillText('Kaiffareilla on jano.', canvas.width / 2, canvas.height / 2 - 75);
            ctx.fillText('Anna heille juomaa', canvas.width / 2, canvas.height / 2 - 45);
            ctx.fillText('vähintään 5s välein', canvas.width / 2, canvas.height / 2 - 15);
        } else if (score === 20 && scoreNotification20Shown) {
            ctx.fillText('Ahmo meinaa juoda', canvas.width / 2, canvas.height / 2 - 75);
            ctx.fillText('itsensä pyödän alle.', canvas.width / 2, canvas.height / 2 - 45);
            ctx.fillText('Estä häntä', canvas.width / 2, canvas.height / 2 - 15);
        } else if (score === 30 && scoreNotification30Shown) {
            ctx.fillText('Bowers meinaa riipaista', canvas.width / 2, canvas.height / 2 - 75);
            ctx.fillText('kurkkuun. ', canvas.width / 2, canvas.height / 2 - 45);
            ctx.fillText('Aja täysimpää', canvas.width / 2, canvas.height / 2 - 15);
        } else if (score === 50 && winNotificationShown) {
            ctx.fillText('Pääsit perille ouluun!', canvas.width / 2, canvas.height / 2 - 15);
        }
        ctx.fillText('Tap to continue.', canvas.width / 2, canvas.height / 2 + 15);
    } else if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        ctx.fillText('Tap to restart.', canvas.width / 2, canvas.height / 2 + 15);
    } else {
        bus.draw();
        obstacle.draw();
    }
}

function update() {
    if (!paused && !gameOver) {
        obstacle.update();
        // Update Ahmo only after the 20 score notification is shown
        if (scoreNotification20Shown) {
            ahmo.update();
        }
        // Update Riipasu if the 30 score notification is shown
        if (scoreNotification30Shown) {
            riipasu.update();
        }
        if (
            bus.x < obstacle.x + obstacle.width &&
            bus.x + bus.width > obstacle.x &&
            bus.y < obstacle.y + obstacle.height &&
            bus.y + bus.height > obstacle.y
        ) {
            gameOver = true;
        }
        if (score === 10 && !scoreNotification10Shown) {
            paused = true;
            scoreNotification10Shown = true;
            gameStarted = true;
            speedIncreaseTimer = Date.now();
        } else if (score === 20 && !scoreNotification20Shown) {
            paused = true;
            scoreNotification20Shown = true;
            gameStarted = true;
            speedIncreaseTimer = Date.now();
        } else if (score === 30 && !scoreNotification30Shown) {
            paused = true;
            scoreNotification30Shown = true;
            gameStarted = true;
            speedIncreaseTimer = Date.now();
            // Make Riipasu appear on a random interval after reaching 30 score
            setTimeout(() => {
                riipasu.appear();
            }, Math.random() * 1800 + 200); // Random interval between 0.2s and 2s
        } else if (score === 50 && !winNotificationShown) {
            paused = true;
            winNotificationShown = true;
            gameStarted = true;
        }
    }
}

function gameLoop() {
    draw();
    update();
    requestAnimationFrame(gameLoop); // Keep looping
    // Decrease timer every second
    if (!paused && !gameOver && gameStarted && Date.now() - speedIncreaseTimer > 1000) {
        timer--;
        speedIncreaseTimer = Date.now();
        if (timer === 0) {
            gameOver = true;
        }
    }
    // Increase speed every 3 seconds
    if (!paused && !gameOver && gameStarted && Date.now() - speedIncreaseTimer > 3000) {
        obstacle.speed += 0.5;
        bus.speed += 0.5;
        speedIncreaseTimer = Date.now();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!paused && !gameOver && !winNotificationShown) {
            bus.jump();
        } else if (gameOver) {
            document.location.reload();
        }
    }
});

canvas.addEventListener('click', (e) => {
    if (!paused && !gameOver && !winNotificationShown) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        if (clickX >= 10 && clickX <= 74 && clickY >= 10 && clickY <= 74) {
            timer = 5; // Reset timer if clicked on the bus image
        } else if (clickX >= ahmo.x && clickX <= ahmo.x + 64 && clickY >= ahmo.y && clickY <= ahmo.y + 64) {
            ahmo.resetPosition(); // Reset ahmo's position if clicked on the ahmo image
        } else if (
            clickX >= riipasu.x &&
            clickX <= riipasu.x + 64 &&
            clickY >= riipasu.y &&
            clickY <= riipasu.y + 64
        ) {
            riipasu.handleTap();
        } else {
            bus.jump();
        }
    } else if (paused && !winNotificationShown) {
        paused = false; // Resume the game if paused
    } else if (gameOver && !winNotificationShown) {
        document.location.reload(); // Restart the game if game over
    }
});

// Handle touch events for mobile devices
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!paused && !gameOver && !winNotificationShown) {
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        if (touchX >= 10 && touchX <= 74 && touchY >= 10 && touchY <= 74) {
            timer = 5; // Reset timer if touched on the bus image
        } else if (touchX >= ahmo.x && touchX <= ahmo.x + 64 && touchY >= ahmo.y && touchY <= ahmo.y + 64) {
            ahmo.resetPosition(); // Reset ahmo's position if touched on the ahmo image
        } else if (
            touchX >= riipasu.x &&
            touchX <= riipasu.x + 64 &&
            touchY >= riipasu.y &&
            touchY <= riipasu.y + 64
        ) {
            riipasu.handleTap();
        } else {
            bus.jump();
        }
    } else if (paused && !winNotificationShown) {
        paused = false; // Resume the game if paused
    } else if (gameOver && !winNotificationShown) {
        document.location.reload(); // Restart the game if game over
    }
});
