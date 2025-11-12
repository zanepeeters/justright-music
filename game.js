let lanes = [100, 200, 300, 400]; // 4 lanes, 4 col
let keys = ['q', 's', 'd', 'f'];
let notes = [];
let noteSpeed = 2;
let score = 0;
let combo = 0;
let lives = 3;
let timeLeft = 120;
let gameRunning = false;
let paused = false;
let particles = [];
let flashColor = null;
let flashTimer = 0;
let timerInterval;

const loader = document.createElement('div'); // for background wrk
loader.id = 'worker-loader';
loader.textContent = 'Loading...';
loader.style.position = 'absolute';
loader.style.top = '50%';
loader.style.left = '50%';
loader.style.transform = 'translate(-50%, -50%)';
loader.style.fontSize = '2rem';
loader.style.color = '#ffcc00';
loader.style.display = 'none';
loader.style.pointerEvents = 'none'; // no click on loader
document.body.appendChild(loader);


function startWorker() {
  loader.style.display = 'block';
  worker = new Worker('worker.js');

  worker.postMessage({ start: true });

  worker.onmessage = (e) => {
    const data = e.data;
    if (data.status === 'done') {
      loader.style.display = 'none';
      console.log('Worker finished, result:', data.result);
    } else if (data.status === 'error') {
      loader.style.display = 'none';
      alert('Worker error: ' + data.message);
    }
  };

  worker.onerror = (err) => {
    loader.style.display = 'none';
    alert('Worker crashed: ' + err.message);
    worker.terminate();
  };
}


class Note {
	constructor(lane) {
		this.x = lanes[lane];
		this.y = 0;
		this.hit = false;
	}
	update() {
		this.y += noteSpeed;
	}
	display() {
		if (!this.hit) {
			fill(255, 204, 0);
			stroke(255);
			circle(this.x, this.y, 40);
			fill(0);
			noStroke();
			textAlign(CENTER, CENTER);
			textSize(20);
			text(keys[lanes.indexOf(this.x)].toUpperCase(), this.x, this.y);
		}
	}
	offScreen() {
		return this.y > height;
	}
	inHitZone() {
		return abs(this.y - 550) < 25;
	}
}

class Particle {
	constructor(x, y, col) {
		this.x = x;
		this.y = y;
		this.vx = random(-2, 2);
		this.vy = random(-3, -1);
		this.alpha = 255;
		this.size = random(5, 12);
		this.color = col;
	}
	update() {
		this.x += this.vx;
		this.y += this.vy;
		this.alpha -= 8;
	}
	display() {
		noStroke();
		fill(this.color.levels ? this.color.levels[0] : this.color.r, 
			this.color.levels ? this.color.levels[1] : this.color.g, 
			this.color.levels ? this.color.levels[2] : this.color.b, 
			this.alpha);
		circle(this.x, this.y, this.size);
	}
	isDead() {
		return this.alpha <= 0;
	}
}

function setup() {
	const container = document.getElementById('game-container');
	let cnv = createCanvas(500, 600);
	cnv.parent(container);
	textFont('Poppins');
}

function draw() {
	let baseRed = 20;
	let baseGreen = 20;
	let baseBlue = 50;
	let bluePulse = map(combo, 0, 10, 0, 150); // brighten effect for combo
	background(baseRed, baseGreen, baseBlue + bluePulse);
	drawComboBorder();

	drawLanes();
	drawHitZone();

	if (!gameRunning) {
		fill(255);
		textAlign(CENTER, CENTER);
		textSize(28);
		text('Press Start to Begin', width / 2, height / 2);
		return;
	}

	if (paused) {
		fill(255);
		textAlign(CENTER, CENTER);
		textSize(32);
		text('PAUSED', width / 2, height / 2);
		return;
	}

	for (let i = notes.length - 1; i >= 0; i--) {
		notes[i].update();
		notes[i].display();
		if (notes[i].offScreen()) {
			notes.splice(i, 1);
			combo = 0;
			lives--;
			updateUI();
			if (lives <= 0) endGame("Game Over!");
		}
	}

	for (let i = particles.length - 1; i >= 0; i--) {
		particles[i].update();
		particles[i].display();
		if (particles[i].isDead()) particles.splice(i, 1);
	}

	if (frameCount % 60 === 0) {
		let lane = floor(random(4));
		notes.push(new Note(lane));
	}

	if (timeLeft <= 0) endGame("Time's Up!");
}

function drawComboBorder() {
	let pulseStrength = map(combo, 0, 10, 0, 255);
	stroke(255, 204, 0, pulseStrength);
	strokeWeight(4 + combo * 0.5);
	noFill();
	rect(2, 2, width - 4, height - 4);
}

function drawLanes() {
	stroke(255, 50);
	for (let x of lanes) line(x, 0, x, height);
}

function drawHitZone() {
	if (flashColor && flashTimer > 0) {
		stroke(flashColor);
		flashTimer--;
	} else {
		stroke(255, 204, 0);
		flashColor = null;
	}
	strokeWeight(3);
	line(50, 550, 450, 550);
	noStroke();
	fill(255, 204, 0, 50);
	rect(50, 525, 400, 50);
}

function keyPressed() {
	if (!gameRunning) return;
	let idx = keys.indexOf(key.toLowerCase());
	if (idx !== -1 && !paused) checkHit(idx);
	if (key.toLowerCase() === 'p') togglePause();
} // letter p can be used to pause

document.getElementById('pause').addEventListener('click', () => {
	if (gameRunning) togglePause();
});

function togglePause() {
	if (!gameRunning) return;
	paused = !paused;
	if (paused) noLoop();
	else loop();
} // was problem if paused cant continue, this is fix

function checkHit(lane) {
	let hitRegistered = false;
	for (let i = 0; i < notes.length; i++) {
		if (notes[i].x === lanes[lane] && !notes[i].hit) {
			let offset = notes[i].y - 550;
			if (abs(offset) < 25) {
				notes[i].hit = true;
				notes.splice(i, 1);
				combo++;
				score += combo * noteSpeed * 10;
				for (let j = 0; j < 10; j++) {
					particles.push(new Particle(lanes[lane], 550, color(255, 204, 0)));
				}
				hitRegistered = true;
				updateUI();
				return;
			} else if (offset < 0) {
				flashHitZone(color(0, 255, 0));
				combo = 0;
				hitRegistered = true;
				updateUI();
				return;
			} else if (offset > 0) {
				flashHitZone(color(255, 0, 0));
				combo = 0;
				hitRegistered = true;
				updateUI();
				return;
			}
		}
	}
	if (!hitRegistered) {
		combo = 0;
		updateUI();
	}
} // function to check acceptable hit zone for the notes on the line

function flashHitZone(col) {
	flashColor = col;
	flashTimer = 5;
}

function updateUI() {
	document.getElementById('score').value = score;
	document.getElementById('combo').value = combo;
	document.getElementById('lives').textContent = `Lives: ${lives}`;
	document.getElementById('time').textContent = `Time: ${timeLeft}`;
	localStorage.setItem('lastScore', score);

	let best = localStorage.getItem('bestScore') || 0;
	if (score > best) {
		best = score;
		localStorage.setItem('bestScore', best);
	}

	const highScoreEl = document.getElementById('best-score');
	if (highScoreEl) highScoreEl.textContent = `High Score: ${best}`;
}

function startTimer() {
	clearInterval(timerInterval);
	timerInterval = setInterval(() => {
		if (!paused && gameRunning) {
			timeLeft--;
			updateUI();
			if (timeLeft <= 0) clearInterval(timerInterval);
		}
	}, 1000);
}

function endGame(message) {
	gameRunning = false;
	paused = false;
	clearInterval(timerInterval);
	noLoop();
	document.getElementById("end-message").textContent = `${message}\nYour Score: ${score}`;
	showEndScreen();
}

document.getElementById('restart').addEventListener('click', () => {
	score = 0;
	combo = 0;
	lives = 3;
	timeLeft = 120;
	notes = [];
	particles = [];
	gameRunning = false;
	paused = false;
	updateUI();
	gsap.to("#end-screen", {opacity: 0, duration: 0.5, display: "none"});
	gsap.to("#start-screen", {opacity: 1, duration: 0.5, display: "block"});
});

document.getElementById('start').addEventListener('click', () => {
	let diff = document.getElementById('difficulty').value;
	localStorage.setItem('lastDifficulty', diff);
	if (diff === 'easy') noteSpeed = 2;
	if (diff === 'medium') noteSpeed = 4;
	if (diff === 'hard') noteSpeed = 6;
	score = 0;
	combo = 0;
	lives = 3;
	timeLeft = 120;
	notes = [];
	particles = [];
	gameRunning = true;
	paused = false;
	loop();
	updateUI();
	startTimer();
});

// restart could be linked...

function showGameScreen() {
	gsap.to("#start-screen", {opacity: 0, duration: 0.5, display: "none"});
	gsap.to("#game-wrapper", {opacity: 1, duration: 0.5, display: "block"});
}

function showEndScreen() {
	gsap.to("#game-wrapper", {opacity: 0, duration: 0.5, display: "none"});
	gsap.to("#end-screen", {opacity: 1, duration: 0.5, display: "block"});
}

function animateScoreBar() {
	gsap.from("#score", {scale: 0, duration: 0.5, ease: "back.out(1.7)"});
	gsap.from("#combo", {scale: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.1});
	gsap.from("#lives", {scale: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.2});
	gsap.from("#time", {scale: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.3});
}

function startSignal() {
	const startText = document.createElement('div');
	startText.id = "start-signal";
	startText.textContent = "GO!";
	startText.style.position = "absolute";
	startText.style.top = "50%";
	startText.style.left = "50%";
	startText.style.transform = "translate(-50%, -50%)";
	startText.style.fontSize = "5rem";
	startText.style.color = "#ffcc00";
	startText.style.pointerEvents = "none";
	document.body.appendChild(startText);

	gsap.fromTo(startText, 
		{scale: 0, opacity: 0}, 
		{
			scale: 1.5, 
			opacity: 1, 
			duration: 1.5, 
			onComplete: () => {
				gsap.to(startText, {opacity: 0, duration: 1.5, onComplete: () => startText.remove()});
			}
		});
}

window.addEventListener('load', () => {
	gsap.from("main", {opacity: 0, y: 50, duration: 1, ease: "power2.out"});
});

document.getElementById('start').addEventListener('click', () => {
	startWorker();
	showGameScreen();
	animateScoreBar();
	startSignal();
});

class ScoreDisplay extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				.score-container {
					font-family: 'Poppins', sans-serif;
					font-size: 1.2rem;
					color: #ffcc00;
					margin: 5px;
				}
			</style>
			<div class="score-container">Score: 0</div>
		`;
	}
	set value(val) {
		this.shadowRoot.querySelector('.score-container').textContent = `Score: ${val}`;
	}
} // web comp to change score, shw score in yellow

class ComboDisplay extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				.combo-container {
					font-family: 'Poppins', sans-serif;
					font-size: 1.2rem;
					color: #00ffcc;
					margin: 5px;
				}
			</style>
			<div class="combo-container">Combo: 0</div>
		`;
	}
	set value(val) {
		this.shadowRoot.querySelector('.combo-container').textContent = `Combo: ${val}`;
	}
} // web comp to change combo, shw combo in blue

customElements.define('score-display', ScoreDisplay);

customElements.define('combo-display', ComboDisplay);

window.addEventListener('offline', () => {
  	alert('You are offline.');
});

window.addEventListener('online', () => {
  	alert('You are online.');
});

window.addEventListener('load', () => {
  	const lastDiff = localStorage.getItem('lastDifficulty');
  	if (lastDiff) {
    	document.getElementById('difficulty').value = lastDiff;
	}

	const lastScore = localStorage.getItem('lastScore');
	if (lastScore) {
		score = parseInt(lastScore);
		updateUI();
	}

	const best = localStorage.getItem('bestScore') || 0;
	const highScoreEl = document.getElementById('best-score');
	if (highScoreEl) highScoreEl.textContent = `High Score: ${best}`;
}); // for oflfine mode
