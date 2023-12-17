window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1000;
  canvas.height = 500;
  // canvas.fillText(`Press 'n' to Begin the Game....`,canvas.width*0.5,canvas.height*0.5);
  let startBtn = document.getElementById("startBtn");
  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (event) => {
        if (
          (event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowRight" ||
            event.key === "ArrowLeft") &&
          this.game.keys.indexOf(event.key) === -1
        ) {
          this.game.keys.push(event.key);
        } else if (event.key === " ") {
          this.game.player.shootTop();
        } else if (event.key === "d") {
          this.game.debug = !this.game.debug;
        } else if (event.key === "n") {
          animate(0);
        }
        // console.log(event.key);
      });
      startBtn.onclick = function () {
        animate(0);
      };
      window.addEventListener("keyup", (event) => {
        if (this.game.keys.indexOf(event.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(event.key), 1);
        }
      });
    }
  }
  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 36.25;
      this.height = 20;
      this.speed = Math.random() * 0.2 + 2.8;
      this.markedForDeletion = false;
      this.image = document.getElementById("fireball");
      this.frameX = 0;
      this.maxFrame = 3;
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.fps = 5;
    }
    update(deltaTime) {
      this.x += this.speed;

      if (this.frameX < this.maxFrame) {
        if (this.timer > this.interval) {
          this.frameX++;
        } else {
          this.timer += deltaTime;
        }
        this.frameX++;
      } else {
        this.frameX = 0;
      }
      if (this.x > this.game.width) this.markedForDeletion = true;
    }
    draw(context) {
      context.fillStyle = "yellow";
      if (this.game.debug) {
        context.strokeRect(this.x, this.y, this.width, this.height);
      }
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  class Shield {
    constructor(game) {
      this.game = game;
      this.width = this.game.player.width;
      this.height = this.game.player.height;
      this.frameX = 0;
      this.maxFrame = 24;
      this.image = document.getElementById("shieldAnimation");
      this.timer = 0;
      this.fps = 15;
      this.interval = 1000 / this.fps;
    }
    update(deltaTime) {
      if (this.frameX <= this.maxFrame) {
        if (this.timer > this.interval) {
          this.frameX++;
          this.timer = 0;
        } else {
          this.timer += deltaTime;
        }
      }
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.game.player.x,
        this.game.player.y,
        this.width,
        this.height
      );
    }
    reset() {
      this.frameX = 0;
      // this.game.sound.shield();
    }
  }
  class SoundController {
    constructor() {
      this.powerUpSound = document.getElementById("powerup");
      this.powerDownSound = document.getElementById("powerdown");
      this.explosionSound = document.getElementById("explosion");
      this.hitSound = document.getElementById("hit");
      this.shieldSound = document.getElementById("shield");
      this.shotSound = document.getElementById("shot");
    }
    powerUp() {
      this.powerUpSound.currentTime = 0;
      this.powerUpSound.play();
    }
    powerDown() {
      this.powerDownSound.currentTime = 0;
      this.powerDownSound.play();
    }
    explosion() {
      this.explosionSound.currentTime = 0;
      this.explosionSound.play();
    }
    hit() {
      this.hitSound.currentTime = 0;
      this.hitSound.play();
    }
    shot() {
      this.shotSound.currentTime = 0;
      this.shotSound.play();
    }
    shield() {
      this.shieldSound.currentTime = 0;
      this.shieldSound.play();
    }
  }
  class Particle {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById("gears");
      this.frameX = Math.floor(Math.random() * 3);
      this.frameY = Math.floor(Math.random() * 3);
      this.spriteSize = 50;
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.sizeModifier;
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * -15;
      this.gravity = 0.5;
      this.markedForDeletion = false;
      this.angle = 0;
      this.omega = Math.random() * 0.2 - 0.1;
      this.bounced = 0;
      this.bottomBounceBoundary = Math.random() * 80 + 60;
    }
    update() {
      this.angle += this.omega;
      this.speedY += this.gravity;
      this.x -= this.speedX + this.game.environmentSpeed;
      this.y += this.speedY;
      if (this.y > this.game.height + this.size || this.x < 0 - this.size)
        this.markedForDeletion = true;
      if (
        this.y > this.game.height - this.bottomBounceBoundary &&
        this.bounced < 2
      ) {
        this.bounced++;
        this.speedY *= -0.5;
      }
    }
    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.omega);

      context.drawImage(
        this.image,
        this.frameX * this.spriteSize,
        this.frameY * this.spriteSize,
        this.spriteSize,
        this.spriteSize,
        this.size * -0.5,
        this.size * -0.5,
        this.size,
        this.size
      );
      context.restore();
    }
  }
  class Player {
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
      this.speedY = 0;
      this.maxSpeed = 5;
      this.projectile = [];
      this.image = document.getElementById("player");
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 1000 * 5;
    }
    update(deltaTime) {
      // if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
      // else if (this.game.keys.includes("ArrowDown"))
      //   this.speedY = this.maxSpeed;
      // else this.speedY = 0;
      // this.y += this.speedY;

      if (this.game.keys.includes("ArrowUp")) this.y -= this.maxSpeed;
      else if (this.game.keys.includes("ArrowDown")) this.y += this.maxSpeed;
      else if (this.game.keys.includes("ArrowRight")) this.x += this.maxSpeed;
      else if (this.game.keys.includes("ArrowLeft")) this.x -= this.maxSpeed;

      // vertical Boundaries
      if (this.y > this.game.height - this.height * 0.5) {
        this.y = this.game.height - this.height * 0.5;
      } else if (this.y < -this.height * 0.5) {
        this.y = -this.height * 0.5;
      }
      // Horizontal Boundaries
      if (this.x + this.width * 0.5 < 0) {
        this.x = -this.width / 2;
      } else if (this.x + this.width * 0.5 > this.game.width) {
        this.x = this.game.width - this.width * 0.5;
      }
      // handle Projectiles
      this.projectile.forEach((projectileObject) => {
        projectileObject.update(deltaTime);
      });
      this.projectile = this.projectile.filter(
        (projectileObject) => !projectileObject.markedForDeletion
      );
      // Player Sprite Animation
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;
      // Power Up Mode
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;
          this.powerUp = false;
          this.frameY = 0;
          this.game.sound.powerDown();
        } else {
          this.powerUpTimer += deltaTime;
          this.frameY = 1;
          // this.game.ammo += 0.1;
        }
      }
    }
    draw(context) {
      context.fillStyle = "black";
      if (this.game.debug) {
        context.strokeRect(this.x, this.y, this.width, this.height);
      }
      this.projectile.forEach((projectileObject) => {
        projectileObject.draw(context);
      });
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    shootTop() {
      if (this.game.ammo > 0) {
        this.projectile.push(
          new Projectile(this.game, this.x + 80, this.y + 30)
        );

        this.game.ammo--;
      }
      this.game.sound.shot();
      if (this.powerUp) this.shootBottom();
    }

    shootBottom() {
      if (this.game.ammo > 0) {
        this.projectile.push(
          new Projectile(this.game, this.x + 80, this.y + 175)
        );

        this.game.ammo--;
      }
    }
    enterPowerUp() {
      this.powerUpTimer = 0;
      this.powerUp = true;
      if (this.game.ammo < this.game.maxPowerUpAmmo)
        this.game.ammo = this.game.maxPowerUpAmmo;
      this.game.sound.powerUp();
    }
  }
  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.0 - 1;
      this.markedForDeletion = false;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }
    update() {
      this.x += this.speedX - this.game.environmentSpeed;
      if (this.x + this.width < 0) this.markedForDeletion = true;
      // sprite animation
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else this.frameX = 0;
      if (this.game.currentScore >= this.game.maxScore) {
        this.speedX = 0;
        this.markedForDeletion = true;
      }
    }
    draw(context) {
      context.fillStyle = "red";
      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      context.font = "20px Helvetica";
      if (this.game.debug)
        context.fillText(this.lives, this.x + 16, this.y + 25);
    }
  }
  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228;
      this.height = 169;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler1");
      this.frameY = Math.floor(Math.random() * 3);
      this.lives = 2;
      this.score = this.lives;
      this.type = "angler1";
    }
  }
  class Angler2 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 213;
      this.height = 165;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler2");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 3;
      this.speedX = Math.random() * -1.0 - 2;
      this.score = this.lives;
      this.type = "angler2";
    }
  }
  class LuckyFish extends Enemy {
    constructor(game) {
      super(game);
      this.width = 99;
      this.height = 95;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("lucky");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 1;
      this.score = this.lives;
      this.type = "lucky";
      this.speedX = Math.random() * -1.0 - 5;
    }
  }
  class HiveWhale extends Enemy {
    constructor(game) {
      super(game);
      this.width = 400;
      this.height = 227;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("hivewhale");
      this.frameY = 0;
      this.lives = 15;
      this.score = this.lives;
      this.type = "hivewhale";
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }
  class Drone extends Enemy {
    constructor(game, x, y) {
      super(game);
      this.width = 115;
      this.height = 95;
      this.y = y;
      this.x = x;
      this.image = document.getElementById("drone");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 1;
      this.score = this.lives;
      this.type = "drone";
      this.speedX = Math.random() * -4.2 - 0.5;
    }
  }
  class BulbWhale extends Enemy {
    constructor(game) {
      super(game);
      this.width = 270;
      this.height = 219;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("bulb");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 4;
      this.score = this.lives;
      this.type = "bulb";
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }
  class MoonFish extends Enemy {
    constructor(game) {
      super(game);
      this.width = 227;
      this.height = 240;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("moon");
      this.frameY = 0;
      this.lives = 5;
      this.score = this.lives;
      this.type = "moon";
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }
  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }
    update() {
      if (this.x <= -this.width) this.x = 0;
      this.x -= this.game.environmentSpeed * this.speedModifier;
      if (this.game.currentScore >= this.game.maxScore) {
        this.speedModifier = 0;
      }
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }
  class Background {
    constructor(game) {
      this.game = game;
      this.image1 = document.getElementById("layer1");
      this.image2 = document.getElementById("layer2");
      this.image3 = document.getElementById("layer3");
      this.image4 = document.getElementById("layer4");

      this.layer1 = new Layer(this.game, this.image1, 2.5);
      this.layer2 = new Layer(this.game, this.image2, 2);
      this.layer3 = new Layer(this.game, this.image3, 1.5);
      this.layer4 = new Layer(this.game, this.image4, 5);
      this.layers = [this.layer1, this.layer2, this.layer3];
    }
    update() {
      this.layers.forEach((layer) => layer.update());
    }
    draw(context) {
      this.layers.forEach((layer) => layer.draw(context));
    }
  }
  class Explosion {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.frameX = 0;
      this.spriteHeight = 200;
      this.fps = 15;
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.markedForDeletion = false;
    }
    update(deltaTime) {
      this.x -= this.game.environmentSpeed;
      if (this.timer > this.interval) {
        this.frameX++;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
      if (this.frameX > this.maxFrame) this.markedForDeletion = true;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  class SmokeExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.getElementById("smokeExplosion");
      this.spriteWidth = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.x = x - this.width * 0.5;
      this.y - this.height * 0.5;
    }
  }
  class FireExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.getElementById("fireExplosion");
      this.spriteWidth = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.x = x - this.width * 0.5;
      this.y - this.height * 0.5;
    }
  }
  class UI {
    constructor(game) {
      this.game = game;
      this.fontsize = 25;
      this.fontFamily = "Bangers";
      this.color = "white";
    }
    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = this.fontsize + "px " + this.fontFamily;
      // For Score Dispaly
      if (this.game.currentScore < this.game.maxScore) {
        context.fillText(`Score : ${this.game.currentScore}`, 20, 40);
      }
      let afterMaxScore =
        this.game.currentScore - (this.game.currentScore % 100);
      if (this.game.currentScore >= this.game.maxScore) {
        context.fillText(`Score : ${this.game.currentScore}`, 20, 40);
      }

      // timer
      context.font = this.fontsize * 0.8 + "px Bangers";
      let formattedTime = this.game.gameTime * 0.001;
      context.fillText(`Timer:${formattedTime.toFixed(1)}`, 20, 90);
      // Ammo
      if (this.game.player.powerUp) context.fillStyle = "#dbbf0d";
      for (let i = 0; i < this.game.ammo; i++) {
        //This  for loop is responsible for creating the bullets bar count on the top
        context.fillRect(20 + 5 * i, 50, 3, 20); //here we are creating the bullet rectangle at the bar.And each time we are changing its x-coordinate to display a new one
      }

      // Game Over Messages
      if (this.game.gameOver) {
        context.textAlign = "center";
        let message1;
        let message2;
        if (this.game.currentScore >= this.game.maxScore) {
          message1 = "You Win!!😎😎";
          message2 = "Well done Explorer!";
        } else {
          message1 = "You LOST NOOB!!!";
          message2 = "Go Play Candycrush😜.";
        }
        context.font = "80px " + this.fontFamily;
        context.fillStyle = "white";
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5
        );
        context.font = "50px " + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 60
        );
      }
      context.restore();
    }
  }
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.background = new Background(this);
      this.player = new Player(this);
      this.inputhandler = new InputHandler(this);
      this.ui = new UI(this);
      this.sound = new SoundController();
      this.shield = new Shield(this);
      this.keys = [];
      this.enemies = [];
      this.particles = [];
      this.explosions = [];
      this.enemyTimer = 0;
      this.enemyInterval = 400;
      this.ammo = 20;
      this.maxAmmo = 50;
      this.maxPowerUpAmmo = 100;
      this.ammoTimer = 0;
      this.ammoInterval = 100;
      this.gameOver = false;
      this.currentScore = 0;
      this.maxScore = 100;
      this.gameTime = 0;
      this.timeLimit = 10000 * 6;
      this.environmentSpeed = 0.9;
      this.debug = false;
    }
    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime;
      if (this.gameTime > this.timeLimit) this.gameOver = true;
      this.background.update();
      this.background.layer4.update();
      this.player.update(deltaTime);
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }
      this.shield.update(deltaTime);
      this.particles.forEach((particle) => particle.update());
      this.particles = this.particles.filter(
        (particle) => !particle.markedForDeletion
      );
      this.explosions.forEach((explosion) => explosion.update(deltaTime));
      this.explosions.filter((explosion) => !explosion.markedForDeletion);
      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
          this.addExplosion(enemy);
          this.sound.hit();
          this.sound.shield();
          this.shield.reset();
          for (let i = 0; i < enemy.score; i++) {
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            );
          }
          if (enemy.type === "lucky") {
            this.player.enterPowerUp();
          } else if (enemy.type === "angler1") {
            // this.powerUpTimer = 6000;
            if (this.currentScore > 0) this.currentScore--;
            else this.currentScore = 0;
          } else if (enemy.type === "angler2") {
            // this.powerUpTimer = 6000;
            if (this.currentScore > 0) this.currentScore -= 2;
            else this.currentScore = 0;
          } else if (enemy.type === "hivewhale") {
            if (this.currentScore > 0) this.currentScore -= 5;
            else this.currentScore = 0;
          }
        }
        this.player.projectile.forEach((bullet) => {
          if (this.checkCollision(bullet, enemy)) {
            enemy.lives--;
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            );
            if (enemy.type === "hivewhale" && enemy.lives === 0) {
              for (let i = 0; i < 5; i++) {
                this.enemies.push(
                  new Drone(
                    this,
                    enemy.x + Math.random() * enemy.width,
                    enemy.y + Math.random() * enemy.height * 0.5
                  )
                );
                this.addExplosion(enemy);
              }
            }
            this.sound.hit();
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;
              for (let i = 0; i < 10; i++) {
                this.particles.push(
                  new Particle(
                    this,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5
                  )
                );
              }

              if (enemy.type === "moon") {
                if (!this.checkCollision(enemy, this.player)) {
                  this.player.enterPowerUp();
                }
              }
              this.addExplosion(enemy);
              this.sound.explosion();
              if (!this.gameOver) this.currentScore += enemy.score;
              if (this.currentScore >= this.maxScore) this.gameOver = true;
            }
            bullet.markedForDeletion = true;
          }
        });
      });
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }
    draw(context) {
      this.background.draw(context);
      this.ui.draw(context);
      this.player.draw(context);
      // this.shield.draw(context);
      this.particles.forEach((particle) => particle.draw(context));
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.explosions.forEach((explosion) => explosion.draw(context));
      this.background.layer4.draw(context);
    }
    addEnemy() {
      const randomize = Math.random();
      if (randomize < 0.3) this.enemies.push(new Angler1(this));
      else if (randomize < 0.6) this.enemies.push(new Angler2(this));
      else if (randomize < 0.7) this.enemies.push(new BulbWhale(this));
      else if (randomize < 0.8) this.enemies.push(new HiveWhale(this));
      else if (randomize < 0.9) this.enemies.push(new MoonFish(this));
      else this.enemies.push(new LuckyFish(this));
    }
    addExplosion(enemy) {
      const randomize = Math.random();
      if (randomize < 0.5) {
        this.explosions.push(
          new SmokeExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
      } else {
        this.explosions.push(
          new FireExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
      }
    }
    checkCollision(rect1, rect2) {
      return (
        rect1.x + rect1.width > rect2.x &&
        rect2.x + rect2.width > rect1.x &&
        rect1.y + rect1.height > rect2.y &&
        rect2.y + rect2.height > rect1.y
      );
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;
  //   animation loop
  //   This animate loop runs every deltaTime time Interval.(~8.35ms).
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    // console.log(deltaTime);
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height); //To clear the previous Player Rectangle object.
    game.draw(ctx); // Game Draw loop due to requestAnimationFrame() loop.
    game.update(deltaTime); // Game Update Loop requestAnimationFrame() loop.
    requestAnimationFrame(animate);
  }
});
