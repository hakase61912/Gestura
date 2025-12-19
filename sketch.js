// === グローバル変数 ===
let socket;
let handDir = "CENTER";
let spread = 0.0;
let shooting = true; // 常時発射ON
let score = 0;
let player = { x: 0, y: 0, w: 50, h: 50, vx: 0 };
let bullets = [];
let enemies = [];

let gameState = "DEMO"; // "DEMO" | "STARTING" | "PLAY" | "GAMEOVER"
let lastReceived = -1;
const HAND_LOST_TIMEOUT = 2000; // ms
const HAND_HELD_START_TIME = 2000; // 検出2秒連続で開始
let handHeldSince = null;

let gameTimer = 0; // ゲーム開始時刻
let startTimer = 0; // STARTING カウントダウン用

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  textFont("Agave");

  player.x = width / 2;
  player.y = height - 50;

  setupSocket();
  console.log("✅ p5.js initialized.");
}

function draw() {
  background(0);
  const now = millis();
  const handDetected = lastReceived > 0 && now - lastReceived < HAND_LOST_TIMEOUT;

  drawBackground();

  // === 状態制御 ===
  switch (gameState) {
    case "DEMO":
      drawDemo(handDetected, now);
      break;

    case "STARTING":
      drawStarting();
      break;

    case "PLAY":
      drawGame(handDetected, now);
      break;

    case "GAMEOVER":
      drawGameOver();
      break;
  }

  // 統一HUD
  drawHUD();
}

// === 背景（星流し） ===
function drawBackground() {
  noStroke();
  fill(255);
  for (let i = 0; i < 80; i++)
    ellipse(random(width), (frameCount * 3 + i * 50) % height, 2);
}

// === デモモード ===
function drawDemo(handDetected, now) {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(60);
  text("DEMO MODE", width / 2, height / 2 - 100);
  textSize(36);
  text("手をカメラにかざすとゲームが始まります", width / 2, height / 2);

  // デモ用自動移動（ランダム方向転換）
  if (frameCount % int(random(90, 150)) === 0) {
    player.vx = random([-6, -4, 4, 6]);
  }
  player.x += player.vx;
  if (player.x < 25 || player.x > width - 25) player.vx *= -1;

  // 常時弾幕
  if (frameCount % 5 === 0) bullets.push({ x: player.x, y: player.y - 25 });

  handlePlayer();
  updateBullets();

  // 敵生成（少しずつ速く）
  let interval = max(20, 60 - frameCount / 180);
  if (frameCount % int(interval) === 0) {
    enemies.push({
      x: random(width * 0.1, width * 0.9),
      y: -40,
      speed: random(2, 4 + frameCount / 2000)
    });
  }

  updateEnemies();
  checkCollision();

  // === 手が一定時間連続検出されたら STARTINGへ ===
  if (handDetected) {
    if (!handHeldSince) handHeldSince = now;
    if (now - handHeldSince >= HAND_HELD_START_TIME) {
      gameState = "STARTING";
      startTimer = now;
      handHeldSince = null;
    }
  } else {
    handHeldSince = null;
  }
}

// === STARTING（操作説明＋3秒カウント）===
function drawStarting() {
  const elapsed = millis() - startTimer;
  const countdown = 3 - floor(elapsed / 1000);

  fill(255);
  textAlign(CENTER, CENTER);

  textSize(42);
  text("操作方法", width / 2, height / 2 - 120);

  textSize(28);
  text("左右に指を向けると操作することが出来ます", width / 2, height / 2 - 40);
  text("出来るだけ沢山の敵を倒しましょう!!", width / 2, height / 2);
 
  textSize(80);
  text(countdown, width / 2, height / 2 + 150);

  if (elapsed >= 3000) startGame();
}

// === プレイ状態 ===
function drawGame(handDetected, now) {
  handlePlayer();

  if (frameCount % 5 === 0)
    bullets.push({ x: player.x, y: player.y - 25 });

  updateBullets();

  let elapsed = (now - gameTimer) / 1000;
  let interval = max(15, 45 - elapsed);
  if (frameCount % int(interval) === 0) {
    enemies.push({
      x: random(width * 0.1, width * 0.9),
      y: -40,
      speed: random(3, 3 + elapsed / 10)
    });
  }

  updateEnemies();
  checkCollision();

  if (now - gameTimer >= 30000) endGame("TIME UP");
  if (!handDetected && now - lastReceived > 10000) endGame("NO HAND");
}

// === ゲームオーバー ===
function drawGameOver() {
  fill(255, 80, 80);
  textSize(60);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2 - 80);
  textSize(30);
  text(`SCORE: ${score}`, width / 2, height / 2);
  text("Restarting demo...", width / 2, height / 2 + 80);
}

// === プレイヤー描画 ===
function handlePlayer() {
  if (gameState === "PLAY") {
    if (handDir === "LEFT") player.x -= 6;
    if (handDir === "RIGHT") player.x += 6;
  }
  player.x = constrain(player.x, 25, width - 25);
  fill(180, 220, 255);
  rectMode(CENTER);
  rect(player.x, player.y, player.w, player.h, 10);
}

// === 弾 ===
function updateBullets() {
  fill(255, 200, 0);
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= 10;
    ellipse(bullets[i].x, bullets[i].y, 10);
    if (bullets[i].y < 0) bullets.splice(i, 1);
  }
}

// === 敵 ===
function updateEnemies() {
  fill(255, 80, 80);
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed;
    rectMode(CENTER);
    rect(enemies[i].x, enemies[i].y, 40, 40);
    if (enemies[i].y > height) enemies.splice(i, 1);
  }
}

// === 当たり判定 ===
function checkCollision() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {
      let e = enemies[i], b = bullets[j];
      if (abs(b.x - e.x) < 20 && abs(b.y - e.y) < 20) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score++;
        break;
      }
    }
  }
}

// === HUD ===
function drawHUD() {
  fill(0, 130);
  stroke(100, 255, 255, 80);
  strokeWeight(1.2);
  rect(105, 80, 210, 150, 10);
  noStroke();

  fill(255);
  textAlign(LEFT, TOP);
  textSize(18);
  let x = 25, y = 25, lh = 24;

  const info = [
    ["SCORE", score],
    ["STATE", gameState],
    ["HAND", handDir],
    ["SHOOT", shooting ? "ON" : "OFF"],
  ];
  if (gameState === "PLAY")
    info.push(["TIME", max(0, 30 - floor((millis() - gameTimer) / 1000))]);

  for (let i = 0; i < info.length; i++) {
    textStyle(BOLD); text(info[i][0] + ":", x, y + i * lh);
    textStyle(NORMAL); text(info[i][1], x + 110, y + i * lh);
  }
}

// === ゲーム開始 / 終了 ===
function startGame() {
  score = 0;
  bullets = [];
  enemies = [];
  gameState = "PLAY";
  gameTimer = millis();
}

function endGame(reason) {
  console.log("💀 Game Over:", reason);
  gameState = "GAMEOVER";
  setTimeout(() => (gameState = "DEMO"), 5000);
}

// === SocketIO ===
function setupSocket() {
  socket = io("http://127.0.0.1:9001");
  socket.on("hand", (data) => {
    handDir = data.dir;
    spread = data.spread;
    shooting = true;
    lastReceived = millis();
  });
}