class SnakeGame {
  constructor() {
    // Game constants
    this.INITIAL_TAIL = 4;
    this.TILE_COUNT = 10;
    this.GRID_SIZE = 400 / this.TILE_COUNT;
    this.INITIAL_PLAYER = { 
      x: Math.floor(this.TILE_COUNT / 2), 
      y: Math.floor(this.TILE_COUNT / 2) 
    };
    
    // Game state
    this.fixedTail = true;
    this.intervalID = null;
    this.velocity = { x: 0, y: 0 };
    this.player = { x: this.INITIAL_PLAYER.x, y: this.INITIAL_PLAYER.y };
    this.walls = false;
    this.fruit = { x: 1, y: 1 };
    this.trail = [];
    this.tail = this.INITIAL_TAIL;
    this.reward = 0;
    this.points = 0;
    this.pointsMax = 0;
    
    // Action tracking
    this.ActionEnum = Object.freeze({
      'none': 0,
      'up': 1,
      'down': 2,
      'left': 3,
      'right': 4
    });
    this.lastAction = this.ActionEnum.none;
    
    // Images
    this.snakeImg = new Image();
    this.snakeImg.src = 'snake.png.jpg';
    this.fruitImg = new Image();
    this.fruitImg.src = 'Fruit.png.jpg';
    
    // Canvas
    this.canv = null;
    this.ctx = null;
    
    // Bind methods
    this.keyPush = this.keyPush.bind(this);
  }
  
  setup() {
    this.canv = document.getElementById('gc');
    this.ctx = this.canv.getContext('2d');
    this.reset();
  }
  
  reset() {
    this.ctx.fillStyle = 'grey';
    this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
    
    this.tail = this.INITIAL_TAIL;
    this.points = 0;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.player.x = this.INITIAL_PLAYER.x;
    this.player.y = this.INITIAL_PLAYER.y;
    this.reward = -1;
    this.lastAction = this.ActionEnum.none;
    
    this.trail = [];
    this.trail.push({ x: this.player.x, y: this.player.y });
  }
  
  moveUp() {
    if (this.lastAction !== this.ActionEnum.down) {
      this.velocity.x = 0;
      this.velocity.y = -1;
    }
  }
  
  moveDown() {
    if (this.lastAction !== this.ActionEnum.up) {
      this.velocity.x = 0;
      this.velocity.y = 1;
    }
  }
  
  moveLeft() {
    if (this.lastAction !== this.ActionEnum.right) {
      this.velocity.x = -1;
      this.velocity.y = 0;
    }
  }
  
  moveRight() {
    if (this.lastAction !== this.ActionEnum.left) {
      this.velocity.x = 1;
      this.velocity.y = 0;
    }
  }
  
  randomFruit() {
    if (this.walls) {
      this.fruit.x = 1 + Math.floor(Math.random() * (this.TILE_COUNT - 2));
      this.fruit.y = 1 + Math.floor(Math.random() * (this.TILE_COUNT - 2));
    } else {
      this.fruit.x = Math.floor(Math.random() * this.TILE_COUNT);
      this.fruit.y = Math.floor(Math.random() * this.TILE_COUNT);
    }
  }
  
  handleWallCollision() {
    if (this.walls) {
      // Hit wall - reset game
      if (this.player.x < 1 || this.player.x > this.TILE_COUNT - 2 || 
          this.player.y < 1 || this.player.y > this.TILE_COUNT - 2) {
        this.reset();
      }
      
      // Draw walls
      this.ctx.fillStyle = 'grey';
      this.ctx.fillRect(0, 0, this.GRID_SIZE - 1, this.canv.height);
      this.ctx.fillRect(0, 0, this.canv.width, this.GRID_SIZE - 1);
      this.ctx.fillRect(this.canv.width - this.GRID_SIZE + 1, 0, this.GRID_SIZE, this.canv.height);
      this.ctx.fillRect(0, this.canv.height - this.GRID_SIZE + 1, this.canv.width, this.GRID_SIZE);
    } else {
      // Wrap around screen
      if (this.player.x < 0) this.player.x = this.TILE_COUNT - 1;
      if (this.player.x >= this.TILE_COUNT) this.player.x = 0;
      if (this.player.y < 0) this.player.y = this.TILE_COUNT - 1;
      if (this.player.y >= this.TILE_COUNT) this.player.y = 0;
    }
  }
  
  checkSelfCollision() {
    const stopped = this.velocity.x === 0 && this.velocity.y === 0;
    if (!stopped) {
      for (let i = 0; i < this.trail.length; i++) {
        if (this.trail[i].x === this.player.x && this.trail[i].y === this.player.y) {
          this.reset();
          return true;
        }
      }
    }
    return false;
  }
  
  checkFruitCollision() {
    if (this.player.x === this.fruit.x && this.player.y === this.fruit.y) {
      if (!this.fixedTail) this.tail++;
      this.points++;
      if (this.points > this.pointsMax) this.pointsMax = this.points;
      this.reward = 1;
      this.randomFruit();
      
      // Make sure fruit doesn't spawn on snake
      while (this.trail.some(segment => segment.x === this.fruit.x && segment.y === this.fruit.y)) {
        this.randomFruit();
      }
    }
  }
  
  updateLastAction() {
    if (this.velocity.x === 0 && this.velocity.y === -1) this.lastAction = this.ActionEnum.up;
    if (this.velocity.x === 0 && this.velocity.y === 1) this.lastAction = this.ActionEnum.down;
    if (this.velocity.x === -1 && this.velocity.y === 0) this.lastAction = this.ActionEnum.left;
    if (this.velocity.x === 1 && this.velocity.y === 0) this.lastAction = this.ActionEnum.right;
  }
  
  drawSnake() {
    for (let i = 0; i < this.trail.length; i++) {
      this.ctx.drawImage(
        this.snakeImg,
        this.trail[i].x * this.GRID_SIZE + 1,
        this.trail[i].y * this.GRID_SIZE + 1,
        this.GRID_SIZE - 2,
        this.GRID_SIZE - 2
      );
    }
  }
  
  drawFruit() {
    this.ctx.drawImage(
      this.fruitImg,
      this.fruit.x * this.GRID_SIZE + 1,
      this.fruit.y * this.GRID_SIZE + 1,
      this.GRID_SIZE - 2,
      this.GRID_SIZE - 2
    );
  }
  
  drawUI() {
    const stopped = this.velocity.x === 0 && this.velocity.y === 0;
    
    if (!stopped) {
      this.ctx.fillStyle = 'rgba(200,200,200,0.2)';
      this.ctx.font = "small-caps 14px Helvetica";
      this.ctx.fillText("(esc) reset", 24, 356);
      this.ctx.fillText("(space) pause", 24, 374);
    }
    
    if (stopped) {
      this.ctx.fillStyle = 'rgba(250,250,250,0.8)';
      this.ctx.font = "small-caps bold 14px Helvetica";
      this.ctx.fillText("press ARROW KEYS to START...", 24, 374);
    }
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = "bold small-caps 16px Helvetica";
    this.ctx.fillText("points: " + this.points, 288, 40);
    this.ctx.fillText("top: " + this.pointsMax, 292, 60);
  }
  
  gameLoop() {
    this.reward = -0.1;
    
    const stopped = this.velocity.x === 0 && this.velocity.y === 0;
    
    // Update player position
    this.player.x += this.velocity.x;
    this.player.y += this.velocity.y;
    
    // Update last action
    this.updateLastAction();
    
    // Clear canvas
    this.ctx.fillStyle = 'rgba(40,40,40,0.8)';
    this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
    
    // Handle walls
    this.handleWallCollision();
    
    // Update trail
    if (!stopped) {
      this.trail.push({ x: this.player.x, y: this.player.y });
      while (this.trail.length > this.tail) {
        this.trail.shift();
      }
    }
    
    // Draw UI
    this.drawUI();
    
    // Draw snake and check self collision
    this.drawSnake();
    this.checkSelfCollision();
    
    // Check fruit collision
    this.checkFruitCollision();
    
    // Draw fruit
    this.drawFruit();
    
    return this.reward;
  }
  
  keyPush(evt) {
    switch (evt.keyCode) {
      case 37: this.moveLeft(); evt.preventDefault(); break;
      case 38: this.moveUp(); evt.preventDefault(); break;
      case 39: this.moveRight(); evt.preventDefault(); break;
      case 40: this.moveDown(); evt.preventDefault(); break;
      case 32: this.pause(); evt.preventDefault(); break;
      case 27: this.reset(); evt.preventDefault(); break;
    }
  }
  
  start(fps = 8) {
    const startGame = () => {
      this.setup();
      this.intervalID = setInterval(() => this.gameLoop(), 1000 / fps);
    };
    
    // Wait for images to load
    let imagesLoaded = 0;
    const checkImagesLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        startGame();
      }
    };
    
    this.snakeImg.onload = checkImagesLoaded;
    this.fruitImg.onload = checkImagesLoaded;
    
    // If images are already loaded
    if (this.snakeImg.complete) checkImagesLoaded();
    if (this.fruitImg.complete) checkImagesLoaded();
  }
  
  stop() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
      this.intervalID = null;
    }
  }
  
  pause() {
    this.velocity.x = 0;
    this.velocity.y = 0;
  }
  
  action(act) {
    switch (act) {
      case 'left': this.moveLeft(); break;
      case 'up': this.moveUp(); break;
      case 'right': this.moveRight(); break;
      case 'down': this.moveDown(); break;
    }
  }
  
  setupKeyboard(state) {
    if (state) {
      document.addEventListener('keydown', this.keyPush);
    } else {
      document.removeEventListener('keydown', this.keyPush);
    }
  }
  
  setWalls(state) {
    this.walls = state;
  }
  
  setTileCount(size) {
    this.TILE_COUNT = size;
    this.GRID_SIZE = 400 / this.TILE_COUNT;
  }
  
  setFixedTail(state) {
    this.fixedTail = state;
  }
  
  clearTopScore() {
    this.pointsMax = 0;
  }
  
  // Getters for game data
  getPlayer() {
    return this.player;
  }
  
  getFruit() {
    return this.fruit;
  }
  
  getTrail() {
    return [...this.trail]; // Return copy to prevent external modification
  }
  
  getTileCount() {
    return this.TILE_COUNT;
  }
}

// Usage example:
const snake = new SnakeGame();

// Wait for page to load
window.addEventListener('DOMContentLoaded', () => {
  snake.start(8);
  snake.setupKeyboard(true);
  snake.setFixedTail(false);
});