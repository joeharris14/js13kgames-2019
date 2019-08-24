import { init, initKeys, keyPressed, Sprite, load, SpriteSheet, GameLoop } from 'kontra';
import characterSpriteSheet from './assets/imgs/MainGuySpriteSheet.png';
let { canvas } = init();
let CHAR_WIDTH = 20;

let image = new Image();
image.src = characterSpriteSheet;
image.onload = function() {
  console.log("loaded");
  let spriteSheet = SpriteSheet({
    image: image,
    frameWidth: 46,
    frameHeight: 36,
    animations: {
      // create a named animation: walk
      walkRight: {
        frames: [2,3],  // frames 0 through 9
        frameRate: 12
      },
      walkUp: {
        frames: [4,5],  // frames 0 through 9
        frameRate: 12
      },
      walkDown: {
        frames: [0,1],  // frames 0 through 9
        frameRate: 12
      },
      walkLeft: {
        frames: [6,7],  // frames 0 through 9
        frameRate: 12
      },
      idle: {
        frames:[1],
      }
    }
  });
  player.animations = spriteSheet.animations;
}

function giveRandomVector(sprite) {
  sprite.dx = Math.floor(Math.random()*2-1);
  sprite.dy = Math.floor(Math.random()*2-1);
}

let player = Sprite({
  type: 'player',
  x: 50,        // starting x,y position of the player
  y: 100,
  color: 'red',  // fill color of the player rectangle
  width: CHAR_WIDTH*2,     // width and height of the player rectangle
  height: CHAR_WIDTH*2,
  dx: 2,
  intersects: function(sprite) {
    if (sprite.type == "player") return;
    let dx = player.x - sprite.x;
    let dy = player.y - sprite.y;
    if (Math.sqrt(dx * dx + dy * dy) < player.width/1.5) {
      console.log("intersects");
      if (sprite.canSteal) {
        sprite.color = 'red';
        sprite.dx = 0;
        sprite.dy = 0;
        if (keyPressed('space')) {
          console.log("pickpocket");
          sprite.canSteal = false;
          sprite.color = 'blue';
        }
      } else {
        sprite.color = 'blue';
        giveRandomVector(sprite);
      }
    } else {
      sprite.color = 'green';
      giveRandomVector(sprite);
      sprite.canSteal = true;
    }
  }          
});

function generateCivilian() {
  const randomX = Math.floor(Math.random() * canvas.width);
  const randomY = Math.floor(Math.random() * canvas.height);
  let civilian = Sprite({
    x: randomX,
    y: randomY,
    color: 'blue',
    width: CHAR_WIDTH,
    height: CHAR_WIDTH,
    canSteal: true,
  });
  giveRandomVector(civilian);
  return civilian;
}

// Set up players
let sprites = [player];
for (let i = 0; i < 10; i++) {
  sprites.unshift(generateCivilian());
}

initKeys();

function playerIsntMoving() { 
  return (player.dx == 0 && player.dy == 0);
}

let loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    // player.update();
    sprites.map(s => {
      s.update();
      player.intersects(s);
      if (s.x < -s.width) {
        s.x = canvas.width;
      }
      if (s.x > canvas.width) {
        s.x = -s.width;
      }
      if (s.y < -s.height) {
        s.y = canvas.height;
      }
      if (s.y > canvas.height) {
        s.y = -s.height;
      }
    });

    if (playerIsntMoving()) {
      player.playAnimation('idle');
    }
    if (keyPressed('left')) {
      player.dx = -2;
      player.playAnimation('walkLeft');
    } else if (keyPressed('right')) {
      player.dx = 2;
      player.playAnimation('walkRight');
    } else {
      player.dx = 0;
    } 
    if (keyPressed('up')) {
      player.dy = -2;
      player.playAnimation('walkUp');
    } else if (keyPressed('down')) {
      player.dy = 2;
      player.playAnimation('walkDown');
    } else {
      player.dy = 0;
    }

    // wrap the players position when it reaches
    // the edge of the screen
    if (player.x > canvas.width) {
      player.x = -player.width;
    }
  },
  render: function() { // render the game state
    sprites.forEach(s => s.render());
  }
});

loop.start();    // start the game