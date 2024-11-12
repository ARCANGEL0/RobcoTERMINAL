// Gameplay parameters
const GRAVITY = 0.15;
const V_JUMP = 7;
const RUN_SPEED = 2;
const SPEED_INCREASE = 0.5;
const CACTUS_BASE = 30;
const CACTUS_MAX = 150;
const CACTUS_CHANCE = 0.2;
const EXTRA_CACTUS_CHANCE = 0.05;
const JUMP_THRESHOLD = 200;

// DINOSAUR
function Dinosaur(x, dividerY) {
	this.width = 55;
	this.height = 50;
	this.x = x;
	this.y = dividerY - this.height;
	this.vy = 0;
	this.jumpVelocity = -1 * V_JUMP;

	// Create the animated GIF overlay
	this.imageElement = document.createElement("img");
	this.imageElement.src = './images/assets/pipboy.gif';
	this.imageElement.style.position = "absolute";
	this.imageElement.style.width = `${this.width}px`;
	this.imageElement.style.height = `${this.height}px`;
	this.imageElement.style.pointerEvents = "none";
	document.body.appendChild(this.imageElement);

	this.updateImagePosition();
}

Dinosaur.prototype.updateImagePosition = function () {
	// Update the position of the GIF image to follow the dinosaur's coordinates
	this.imageElement.style.left = `${this.x}px`;
	this.imageElement.style.top = `${this.y}px`;
};

Dinosaur.prototype.draw = function (context) {
	this.updateImagePosition(); // Update position each frame
};

Dinosaur.prototype.jump = function () {
	this.vy = this.jumpVelocity;
};

Dinosaur.prototype.update = function (divider, gravity) {
	this.y += this.vy;
	this.vy += gravity;
	this.updateImagePosition(); // Update GIF position after movement
};

Dinosaur.prototype.land = function (y) {
	this.y = y;
	this.vy = 0;
	this.updateImagePosition();
};

// Divider, Cactus, and other functions remain unchanged
function Divider(gameWidth, gameHeight) {
	this.width = gameWidth;
	this.height = 50;
	this.x = 0;
	this.y = gameHeight - this.height;
}
Divider.prototype.draw = function (context) {
	context.fillRect(this.x, this.y, this.width, this.height);
};

function Cactus(gameWidth, groundY) {
	this.width = 16;
	this.height = Math.floor(CACTUS_BASE + (Math.random() * CACTUS_MAX));
	this.x = gameWidth;
	this.y = groundY - this.height;
}

Cactus.prototype.draw = function (context) {
	let oldFill = context.fillStyle;
	context.fillStyle = "green";
	context.fillRect(this.x, this.y, this.width, this.height);
	context.fillStyle = oldFill;
};

// GAME
function Game({ container, onGameOver }) {
	this.container = container;
	this.canvas = document.createElement('canvas');
	container.appendChild(this.canvas);

	this.resize();
	window.addEventListener('resize', (e) => this.resize(e), false);

	this.context = this.canvas.getContext("2d");
	this.context.fillStyle = "brown";

	this.gravity = GRAVITY;
	this.divider = new Divider(this.width, this.height);
	this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
	this.cacti = [];

	this.runSpeed = -1 * RUN_SPEED;
	this.paused = false;
	this.noOfFrames = 0;
	this.onGameOver = onGameOver;

	this.firstJump = true;
	this.spacePressed = false;

	document.addEventListener("keydown", (e) => {
		if (e.key === " " && this.firstJump) {
			this.spacePressed = true;
		}
	});
	document.addEventListener("keyup", (e) => {
		if (e.key === " ") {
			this.firstJump = false;
			this.spacePressed = false;
		}
	});
}

Game.prototype.resize = function () {
	let { width, height } = this.container.getBoundingClientRect();
	this.canvas.setAttribute('width', width);
	this.canvas.setAttribute('height', height);

	this.width = width;
	this.height = height;
};

Game.prototype.spawnCactus = function (probability) {
	if (Math.random() <= probability) {
		this.cacti.push(new Cactus(this.width, this.divider.y));
	}
};

Game.prototype.update = function () {
	if (this.paused) return;

	let isInTheAir = bottomWall(this.dino) < topWall(this.divider);

	if (this.firstJump && isInTheAir && this.dino.vy > 0) {
		this.firstJump = false;
	}

	if (this.spacePressed && this.firstJump && bottomWall(this.dino) >= topWall(this.divider) - JUMP_THRESHOLD) {
		this.dino.jump();
	} else if (!isInTheAir && this.dino.vy > 0) {
		this.firstJump = true;
		this.dino.land(topWall(this.divider) - this.dino.height);
	}

	this.dino.update(this.divider, this.gravity);

	if (this.cacti.length > 0 && rightWall(this.cacti[0]) < 0) {
		this.cacti.shift();
	}

	if (this.cacti.length === 0) {
		this.spawnCactus(CACTUS_CHANCE);
	} else if (this.cacti.length > 0 && this.width - leftWall(this.cacti[this.cacti.length - 1]) > this.jumpDistance + 150) {
		this.spawnCactus(EXTRA_CACTUS_CHANCE);
	}

	for (let i = 0; i < this.cacti.length; i++) {
		this.cacti[i].x = this.cacti[i].x + this.runSpeed;
	}

	for (let i = 0; i < this.cacti.length; i++) {
		if (rightWall(this.dino) >= leftWall(this.cacti[i]) &&
			leftWall(this.dino) <= rightWall(this.cacti[i]) &&
			bottomWall(this.dino) >= topWall(this.cacti[i])) {
				this.gameOver();
		}
		this.noOfFrames++;
		this.score = Math.floor(this.noOfFrames / 10);
	}

	this.jumpDistance = Math.floor(this.runSpeed * (2 * this.dino.jumpVelocity) / this.gravity);

	if (this.noOfFrames > 0 && this.noOfFrames % 1000 === 0) {
		this.runSpeed -= SPEED_INCREASE;
	}
};

Game.prototype.draw = function () {
	this.context.clearRect(0, 0, this.width, this.height);
	this.divider.draw(this.context);
	this.dino.draw(this.context);
	for (let i = 0; i < this.cacti.length; i++) {
		this.cacti[i].draw(this.context);
	}

	let oldFill = this.context.fillStyle;
	this.context.font = "20px monospace";
	this.context.textAlign = "end";
	this.context.fillStyle = "white";
	this.context.fillText(this.score, this.width - 30, 30);
	this.context.fillStyle = oldFill;
};

Game.prototype.gameOver = async function() {
	this.paused = true;
	await this.onGameOver(this.score);
	this.canvas.remove();
	this.dino.imageElement.remove(); // Remove the GIF image on game over
};

Game.prototype.main = function () {
	this.update();
	this.draw();
	window.requestAnimationFrame(() => this.main());
};

Game.prototype.start = function () {
	window.requestAnimationFrame(() => this.main());
};

export default Game;