const dino = document.getElementById("dino");
const obstacle = document.getElementById("obstacle");
const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const restartBtn = document.getElementById("restartBtn");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const finalScoreEl = document.getElementById("finalScore");

const themeToggleBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");

let isJumping = false;
let isGameRunning = false;
let score = 0;
let highScore = parseInt(localStorage.getItem("dinoHighScore") || "0", 10);
let scoreInterval = null;
let collisionInterval = null;
let speedLevel = 1; // used to gradually speed up obstacle
let currentDuration = 1.5; // seconds

highScoreEl.textContent = highScore.toString();

/* --- THEME HANDLING --- */

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  if (theme === "day") {
    themeIcon.textContent = "☀️";
    themeLabel.textContent = "Day";
  } else {
    themeIcon.textContent = "🌙";
    themeLabel.textContent = "Night";
  }
}

let currentTheme = localStorage.getItem("dinoTheme") || "night";
applyTheme(currentTheme);

themeToggleBtn.addEventListener("click", () => {
  currentTheme = currentTheme === "night" ? "day" : "night";
  applyTheme(currentTheme);
  localStorage.setItem("dinoTheme", currentTheme);
});

/* --- GAME CONTROL --- */

function startGame() {
  if (isGameRunning) return;

  isGameRunning = true;
  score = 0;
  speedLevel = 1;
  currentDuration = 1.5;

  scoreEl.textContent = "0";
  finalScoreEl.textContent = "0";

  startOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");

  // reset animation duration + play
  obstacle.style.animationDuration = `${currentDuration}s`;
  obstacle.style.animationPlayState = "running";

  startScoring();
  startCollisionCheck();
}

function endGame() {
  if (!isGameRunning) return;

  isGameRunning = false;

  obstacle.style.animationPlayState = "paused";
  stopScoring();
  stopCollisionCheck();

  finalScoreEl.textContent = score.toString();
  gameOverOverlay.classList.remove("hidden");

  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore.toString();
    localStorage.setItem("dinoHighScore", String(highScore));
  }
}

function resetGame() {
  // Force obstacle to restart animation by toggling it off/on
  obstacle.style.animation = "none";
  void obstacle.offsetWidth; // trigger reflow
  obstacle.style.animation = `obstacleMove ${currentDuration}s linear infinite`;
  obstacle.style.animationPlayState = "paused";

  startGame();
}

/* --- SCORING & DIFFICULTY --- */

function startScoring() {
  stopScoring();
  scoreInterval = setInterval(() => {
    if (!isGameRunning) return;

    score += 1;
    scoreEl.textContent = score.toString();

    // Increase difficulty every 100 points (min cap on duration)
    if (score % 100 === 0 && currentDuration > 0.7) {
      speedLevel += 1;
      currentDuration -= 0.1;
      obstacle.style.animationDuration = `${currentDuration}s`;
    }
  }, 120);
}

function stopScoring() {
  if (scoreInterval) {
    clearInterval(scoreInterval);
    scoreInterval = null;
  }
}

/* --- COLLISION DETECTION --- */

function startCollisionCheck() {
  stopCollisionCheck();
  collisionInterval = setInterval(() => {
    if (!isGameRunning) return;

    const dinoRect = dino.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    const horizontalOverlap =
      dinoRect.right > obstacleRect.left + 4 &&
      dinoRect.left + 4 < obstacleRect.right;
    const verticalOverlap = dinoRect.bottom > obstacleRect.top + 6;

    if (horizontalOverlap && verticalOverlap) {
      endGame();
    }
  }, 18);
}

function stopCollisionCheck() {
  if (collisionInterval) {
    clearInterval(collisionInterval);
    collisionInterval = null;
  }
}

/* --- JUMP LOGIC (with flip) --- */

function jump() {
  if (!isGameRunning) {
    startGame();
  }

  if (isJumping) return;

  isJumping = true;
  dino.classList.add("jump");
  setTimeout(() => {
    dino.classList.remove("jump");
    isJumping = false;
  }, 550);
}

/* --- INPUT HANDLERS --- */

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.key === " " || e.key === "ArrowUp") {
    e.preventDefault();
    jump();
  }
});

document.addEventListener("click", () => {
  jump();
});

document.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    jump();
  },
  { passive: false }
);

restartBtn.addEventListener("click", () => {
  resetGame();
});

/* Start in idle state */
obstacle.style.animationPlayState = "paused";
