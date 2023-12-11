// Ethan Heshka
// Computer Science 30
// Major Project
// Finished on ???
// Project Name: The Legend of Zelda - Rift In Spacetime

// Project Desription:
// The original exploration game redone to be a Legend of Zelda fangame, featuring the base game reimagined to be a turn-based RPG with extra randomization, features, and secrets.

// Overworld Controls:
// Use the WSAD or arrow keys to move Link.
// Click the screen, or tap the space bar to attack.
// Tap the E key to open your inventory. Use WSAD, arrow keys, or the mouse to navigate the inventory menus.

// Battle Controls
// Use the WSAD, arrow keys, or hover with the mouse to select an action. Tap the space bar or click to use the action you have selected.
// Tap the space bar to move through battle dialogue.

// north = 0, west = 1, south = 2, east = 3

// Code:

let exitMax = 4; // tells how many exits can be in a room at once
let exitScale = [2,5]; // tells how much grid slots an exit takes up, [min, max]

const GRID_X = 16; // how wide the grid will be
const GRID_Y = 11; // how tall the grid will be

const DUNGEON_X = 12; // how wide the dungeon grid will be
const DUNGEON_Y = 7; // how tall the dungeon grid will be

let cellSize; // will turn into a x/y value for scaling stuff later

let rooms = []; // the holy array of every room

let player = { // player values
  x: 8, // x value in relevance to grid
  y: 5.5, // y value in relevance to grid
  walkSPDBase: 0.075, // overworld speed without boosts
  walkSPDBoost: 0, // extra boost(s) to overworld speed
  walkSPD: 0, // total overworld speed
  ableToMove: true, // variable used to check if player should be able to move, used for cutscenes/fades
  attackTime: 0, // time when last attack was unleashed
  attackCooldown: 600, // time it takes to unleash an overworld attack in milliseconds
  isMoving: false, // boolean to tell if player is currently moving
  isAttacking: false, // boolean to tell if player is currently using an attack in overworld
  direction: "south", // direction player is facing
  roomX: 0, // x value in relevance to room grid
  roomY: 0, // y value in relevance to room grid
  battleX: 0, // x value during combat
  battleY: 0, // y value during combat
  level: 1, // player's level
  exp: 0, // total experience points player has
  hp: 0, // health points player currently has
  maxHP: 0, // highest health value player is allowed to have
  atk: 0, // attack value during combat
  def: 0, // defense value during combat
  spd: 0, // speed value during combat
  evasion: 10, // evasion value during combat (chance to dodge enemy attacks, is a percentage value)
  actionVal: 0, // the turn value during combat for Link; will be used in formulas taken from Honkai: Star Rail's combat system
};

let imageAssets = new Map();
let bgmAssets = new Map();
let sfxAssets = new Map();

let state = "start"; // current state of game

function preload(){
  // load images
  for (let image of imageData){
    let imageKey = image.key;
    let loadedImage = loadImage(image.location);
    imageAssets.set(imageKey, loadedImage);
  }

  // set up sound formats to be used
  soundFormats("mp3", "wav");

  // load background music
  for (let music of bgmData){
    let musicKey = music.key;
    let loadedBGM = loadSound(music.location);
    bgmAssets.set(musicKey, loadedBGM);
  }

  // load sound effects
  for (let sound of sfxData){
    let soundKey = sound.key;
    let loadedSFX = loadSound(sound.location);
    if (soundKey === "hit-wall"){
      loadedSFX.playMode("untilDone");
    }
    else if (soundKey === "footstep"){
      loadedSFX.playMode("sustain");
    }
    sfxAssets.set(soundKey, loadedSFX);
  }
}

function setup() {
  if (windowWidth>windowHeight){
    cellSize = windowHeight/GRID_Y;
  }
  else {
    cellSize = windowWidth/GRID_X;
  }
  canvas = createCanvas(cellSize*GRID_X, cellSize*GRID_Y);

  player.walkSPD = player.walkSPDBase + player.walkSPDBoost;

  console.log(new Enemy(0,0,100,1));

  imageMode(CENTER);
  rectMode(CENTER);

  let startingRoom = new Room(0, 0, createEmptyRoom(), null, null, null);
  startingRoom.addExits();
  rooms.push(startingRoom);

  bgmAssets.get("title").loop();
}

function draw() {
  if (state === "start"){
    // If on the start screen
    loadStartScreen();
  }
  else if (state === "save") {
    // If picking a save file
    
  } 
  else if (state === "explore") {
    // If exploring
    for (let room of rooms){
      if (room.x === player.roomX && room.y === player.roomY){
        room.display();
      }
    }
    overworldControls();
    loadPlayer();
  } 
  else if (state === "menu") {
    // If in the player menu

  } 
  else if (state === "battle") {
    // If entered a battle
  }
}

function findArrayIndex(itemToFind, theArray){
  for (let i=0; i<theArray.length; i++){
    if (theArray[i] === itemToFind){
      return i;
    }
  }
}

function loadStartScreen(){
  background(0);
  image(imageAssets.get("title"), width/2, height/2, width-cellSize, cellSize/1.5);
  image(imageAssets.get("click-to-start"), width/2, height-cellSize, width/2.5, cellSize/2.5);
}

function createEmptyRoom() {
  let table = new Array(GRID_Y);
  for(let i=0; i<GRID_Y; i++){
    if(i===0 || i===GRID_Y-1){
      table[i] = new Array(GRID_X).fill(1);
    }
    else {
      table[i] = new Array(GRID_X).fill(0);
      table[i][0] = 1;
      table[i][GRID_X-1] = 1;
    }
  }
  return table;
}

function loadPlayer() {
  let theImage;
  if (player.isMoving === false && player.isAttacking === false){
    if (player.direction === "north"){
      theImage = imageAssets.get("link-north-idle");
    }
    else if (player.direction === "east"){
      theImage = imageAssets.get("link-east-idle");
    }
    else if (player.direction === "south"){
      theImage = imageAssets.get("link-south-idle");
    }
    else if (player.direction === "west"){
      theImage = imageAssets.get("link-west-idle");
    }
  }
  else if (player.isMoving === true){
    if (player.direction === "north"){
      theImage = imageAssets.get("link-north-moving");
    }
    else if (player.direction === "east"){
      theImage = imageAssets.get("link-east-moving");
    }
    else if (player.direction === "south"){
      theImage = imageAssets.get("link-south-moving");
    }
    else if (player.direction === "west"){
      theImage = imageAssets.get("link-west-moving");
    }
  }
  image(theImage, cellSize*player.x, cellSize*player.y, cellSize, cellSize);
}

function overworldControls() {
  let addedPos = {x: 0, y: 0, xSign: 0, ySign: 0};
  if (state === "explore" && player.ableToMove) {
    if (keyIsDown(87) || keyIsDown(38)) {
      // w or up arrow
      addedPos.y = player.walkSPD * -1;
      addedPos.ySign = -0.5;
      player.direction = "north";
      player.isMoving = true;
    } 
    else if (keyIsDown(83) || keyIsDown(40)) {
      // s or down arrow
      addedPos.y = player.walkSPD;
      addedPos.ySign = 0.5;
      player.direction = "south";
      player.isMoving = true;
    } 
    else if (keyIsDown(65) || keyIsDown(37)) {
      // a or left arrow
      addedPos.x = player.walkSPD * -1;
      addedPos.xSign = -0.5;
      player.direction = "west";
      player.isMoving = true;
    } 
    else if (keyIsDown(68) || keyIsDown(39)) {
      // d or right arrow
      addedPos.x = player.walkSPD;
      addedPos.xSign = 0.5;
      player.direction = "east";
      player.isMoving = true;
    }
    else {
      player.isMoving = false;
    }
  }
  movePlayer(addedPos);
}

function movePlayer(addedPos) {
  // moves the player
  // moves into a new room given if player left the room
  let currentRoom;
  for (let room of rooms){
    if (player.roomX === room.x && player.roomY === room.y){
      currentRoom = room;
      break;
    }
  }
  try{ //checking for room movement
    if (currentRoom.layout[round(player.y + addedPos.ySign)][round(player.x + addedPos.xSign)] === 0){ // if not running into something
      player.y += addedPos.y;
      player.x += addedPos.x;
    }
    else if (currentRoom.layout[round(player.y + addedPos.ySign)][round(player.x + addedPos.xSign)] === 1){ // if running into a wall
      sfxAssets.get("hit-wall").play();
    }
  }
  catch{ // in case of error (AKA player leaving the room in north/south directions)
    if (player.y < player.walkSPD){ // if going into north exit
      changeRoom("north", player);
    }
    else if (player.y > GRID_Y - 1 - player.walkSPD*2){ // if going to south exit
      changeRoom("south", player);
    }
  }
  // game does not error in case of west/east exits, so check them here
  if (player.x < 0){ // if going to west exit
    changeRoom("west", player);
  }
  else if (player.x > GRID_X - 1 - player.walkSPD){ // if going to east exit
    changeRoom("east", player);
  }
}

function changeRoom(direction, player){
  // changes the player position based on which exit the player took
  if (direction === "north"){
    player.y = GRID_Y-1;
    player.roomY -= 1;
  }
  else if (direction === "south"){
    player.y = 0;
    player.roomY += 1;
  }
  else if (direction === "west"){
    player.x = GRID_X-1;
    player.roomX -= 1;
  }
  else if (direction === "east"){
    player.x = 0;
    player.roomX += 1;
  }
  // check to see if another room needs to be generated
  let roomNeedsGenerating = true;
  for (let room of rooms){
    if (player.roomX === room.x && player.roomY === room.y){
      roomNeedsGenerating = false;
    }
  }
  if (roomNeedsGenerating){
    let newRoom = new Room(player.roomX, player.roomY, createEmptyRoom(), null, null, null);
    newRoom.addExits();
    rooms.push(newRoom);
  }
}

// function fadeIntoBlack(){
//   for (let i=0; i>256; i++){
//     push();
//     tint(255, i);
//     image(imageAssets.fadeBlack, 0, 0, width, height);
//   }
// }

// function fadeOutBlack(){
//   for (let i=255; i<=0; i++){
//     push();
//     tint(255, i);
//     image(imageAssets.fadeBlack, 0, 0, width, height);
//   }
// }

function mousePressed() { 
  if (state === "start"){
    bgmAssets.get("title").stop();
    bgmAssets.get("overworld").loop();
    state = "explore";
    imageMode(CORNER);
  }
  else if (state === "explore"){
    // teleports player to location on the grid
    let mouseGridX = floor(mouseX / cellSize);
    let mouseGridY = floor(mouseY / cellSize);
    for (let room of rooms){
      if (room.x === player.roomX && room.y === player.roomY){
        if (room.layout[mouseGridY][mouseGridX] === 0){
          player.x = mouseGridX;
          player.y = mouseGridY;
          sfxAssets.get("click").play();
        }
      }
    }
    
  }
  else if (state === "battle"){
    // activate some battle button, depending on where clicked
  }
}

function findEnemy(id, type){ // searches through enemy or boss table to retrieve information
  if (type === "enemy"){
    for (let enemy of enemies){
      if (enemy.id === id){
        return enemy;
      }
    }
  }
  else if (type === "boss"){
    for (let boss of bosses){
      if (boss.id === id){
        return boss;
      }
    }
  }
}

function newExit(direction, position, size){
  return {
    direction: direction,
    position: position,
    size: size,
  };
}

class Room {
  constructor(x, y, layout, preset, biome, exits){
    this.x = x;
    this.y = y;
    this.layout = layout;
    this.preset = preset;
    this.biome = biome;
    if (exits !== null){
      this.exits = exits;
    }
    else{
      this.exits = [];
    }
    this.enemies = null;
    this.objects = null;
  }
  addExits(){
    // before adding exits, add banned direction table so you can't exit into another room's wall
    let bannedDirections = [];
    // first, check for exits in surrounding rooms if they exist
    for (let room of rooms){
      //checking north side
      if (room.x === this.x && room.y === this.y - 1){
        for (let exit of room.exits){
          if (exit.direction === "south"){
            this.exits.push(newExit("north", exit.position, exit.size));
          }
        }
        // make banned direction so no weird exits get placed in that direction
        bannedDirections.push("north");
      }
      //checking south side
      else if (room.x === this.x && room.y === this.y + 1){
        for (let exit of room.exits){
          if (exit.direction === "north"){
            this.exits.push(newExit("south", exit.position, exit.size));
          }
        }
        // make banned direction so no weird exits get placed in that direction
        bannedDirections.push("south");
      }
      //checking west side
      else if (room.x === this.x - 1 && room.y === this.y){
        for (let exit of room.exits){
          if (exit.direction === "east"){
            this.exits.push(newExit("west", exit.position, exit.size));
          }
        }
        // make banned direction so no weird exits get placed in that direction
        bannedDirections.push("west");
      }
      //checking east side
      else if (room.x === this.x + 1 && room.y === this.y){
        for (let exit of room.exits){
          if (exit.direction === "west"){
            this.exits.push(newExit("east", exit.position, exit.size));
          }
        }
        // make banned direction so no weird exits get placed in that direction
        bannedDirections.push("east");
      }
    }
    // add random exits until hit exit maximum
    if (bannedDirections.length < 4){ // makes sure that more exits can actually be placed
      while(this.exits.length < exitMax){
        let newExitDirection = round(random(0,3));
        let newExitSize = round(random(exitScale[0], exitScale[1]));
        let notBanned = true;

        if (newExitDirection === 0){ //north
          for (let ban of bannedDirections){ //check for an exit ban
            if (ban === "north"){
              notBanned = false;
            }
          }
          if (notBanned){
            this.exits.push(newExit("north", round(random(1,GRID_X-newExitSize-1)), newExitSize));
          }
        }
        else if (newExitDirection === 1){ //south
          for (let ban of bannedDirections){ //check for an exit ban
            if (ban === "south"){
              notBanned = false;
            }
          }
          if (notBanned){
            this.exits.push(newExit("south", round(random(1,GRID_X-newExitSize-1)), newExitSize));
          }
        }
        else if (newExitDirection === 2){ //west
          for (let ban of bannedDirections){ //check for an exit ban
            if (ban === "west"){
              notBanned = false;
            }
          }
          if (notBanned){
            this.exits.push(newExit("west", round(random(1,GRID_Y-newExitSize-1)), newExitSize));
          }
        }
        else if (newExitDirection === 3){ //east
          for (let ban of bannedDirections){ //check for an exit ban
            if (ban === "east"){
              notBanned = false;
            }
          }
          if (notBanned){
            this.exits.push(newExit("east", round(random(1,GRID_Y-newExitSize-1)), newExitSize));
          }
        }
      }
    }
    
    //put the exits on the layout
    for (let exit of this.exits){
      if (exit.direction === "north"){
        for (let i=0; i<exit.size; i++){
          this.layout[0][exit.position+i] = 0;
        }
      }
      else if (exit.direction === "south"){
        for (let i=0; i<exit.size; i++){
          this.layout[GRID_Y-1][exit.position+i] = 0;
        }
      }
      else if (exit.direction === "west"){
        for (let i=0; i<exit.size; i++){
          this.layout[exit.position+i][0] = 0;
        }
      }
      else if (exit.direction === "east"){
        for (let i=0; i<exit.size; i++){
          this.layout[exit.position+i][GRID_X-1] = 0;
        }
      }
    }
  }
  display(){
    // display room borders
    for (let i=0; i<GRID_Y; i++){
      for (let j=0; j<GRID_X; j++){
        if (this.layout[i][j]===0){
          image(imageAssets.get("floor-temp"), cellSize*j, cellSize*i, cellSize, cellSize);
        }
        else if (this.layout[i][j]===1){
          image(imageAssets.get("wall-temp"), cellSize*j, cellSize*i, cellSize, cellSize);
        }
      }
    }
  }
}

class Enemy {
  constructor(x, y, id, level){
    this.x = x;
    this.y = y;
    let currentEnemy;
    try{
      currentEnemy = findEnemy(id, "enemy");
    }
    catch{
      console.log("Enemy does not exist!");
      currentEnemy = findEnemy(100, "enemy"); // defaults to spawning Armos if enemy ID does not exist
    }
    this.id = currentEnemy.id;
    this.name = currentEnemy.name;
    this.size = currentEnemy.size;
    this.diffColor = currentEnemy.diffColor;
    this.movementType = currentEnemy.movementType; // walk, normal (between walk and run), run, hop, idle, etc
    if (this.movementType === "hop"){
      this.hopSpeed = currentEnemy.hopSpeed;
    }
    this.enemyType = currentEnemy.enemyType;
    this.behavior = currentEnemy.behavior;
    this.baseStats = currentEnemy.baseStats;
    this.attacks = currentEnemy.attacks;
    this.level = level;
    this.canSeePlayer = false;
    this.bonuses = []; // stat bonuses, like temporary attack/defense buffs
  }
  display(){

  }
  canSeePlayer(){

  }
  move(){

  }
  attack(){

  }
}

let imageData = [ // list of all sprites/spritesheets in the game
  {
    key: "black",
    location: "assets/images/fadeblack.png",
  },
  {
    key: "floor-temp",
    location: "assets/images/floor-temp.png",
  },
  {
    key: "wall-temp",
    location: "assets/images/wall-temp.png",
  },
  {
    key: "title",
    location: "assets/images/title.png",
  },
  {
    key: "click-to-start",
    location: "assets/images/click-to-start.png",
  },
  {
    key: "link-north-idle",
    location: "assets/images/link/link-north-idle.png",
  },
  {
    key: "link-east-idle",
    location: "assets/images/link/link-east-idle.png",
  },
  {
    key: "link-south-idle",
    location: "assets/images/link/link-south-idle.png",
  },
  {
    key: "link-west-idle",
    location: "assets/images/link/link-west-idle.png",
  },
  {
    key: "link-north-moving",
    location: "assets/images/link/link-north-moving.gif",
  },
  {
    key: "link-east-moving",
    location: "assets/images/link/link-east-moving.gif",
  },
  {
    key: "link-south-moving",
    location: "assets/images/link/link-south-moving.gif",
  },
  {
    key: "link-west-moving",
    location: "assets/images/link/link-west-moving.gif",
  },
  {
    key: "link-north-preattack",
    location: "assets/images/link/link-north-preattack.png",
  },
  {
    key: "link-east-preattack",
    location: "assets/images/link/link-east-preattack.png",
  },
  {
    key: "link-south-preattack",
    location: "assets/images/link/link-south-preattack.png",
  },
  {
    key: "link-west-preattack",
    location: "assets/images/link/link-west-preattack.png",
  },
  {
    key: "link-north-attack",
    location: "assets/images/link/link-north-attack.png",
  },
  {
    key: "link-east-attack",
    location: "assets/images/link/link-east-attack.png",
  },
  {
    key: "link-south-attack",
    location: "assets/images/link/link-south-attack.png",
  },
  {
    key: "link-west-attack",
    location: "assets/images/link/link-west-attack.png",
  },
];

let bgmData = [ // list of all background music in the game
  {
    key: "title",
    location: "assets/bgm/title.mp3",
  },
  {
    key: "overworld",
    location: "assets/bgm/overworld.mp3",
  },
];

let sfxData = [ // list of all sound effects in the game
  {
    key: "click",
    location: "assets/sfx/click.wav",
  },
  {
    key: "footstep",
    location: "assets/sfx/footstep.wav",
  },
  {
    key: "hit-wall",
    location: "assets/sfx/hit_wall.wav",
  },
];

const enemies = [
  // enemy ID's first digit tells which section of the game they belong in
  // 1 = overworld, 2 = dungeon, 3 = water, 4 = mario
  // for enemies and bosses not from zelda, they will have their own special battle UI, sound effects, background music, and more
  // size are the width and height of the object in relevance to the grid; [3,1] means 3 grid blocks long and 1 grid block tall
  {
    name: "Armos",
    id: 100,
    size: [1,1],
    diffColor: false,
    movementType: "updown",
    enemyType: "normal",
    behavior: "lazy",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Pierce",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
    sprites: [],
  },
  {
    name: "Ghini",
    id: 101,
    size: [1,1],
    diffColor: false,
    movementType: "normal",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Leever",
    id: 102,
    size: [1,1],
    diffColor: true,
    movementType: "walk",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Lynel",
    id: 103,
    size: [1,1],
    diffColor: true,
    movementType: "walk",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Slash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Parry",
        atkSpeed: "slow",
        atkType: "counter",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 200,
      },
    ],
  },
  {
    name: "Moblin",
    id: 104,
    size: [1,1],
    diffColor: true,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Stab",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 70,
      },
      {
        name: "Bite",
        atkSpeed: "fast",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 80,
      },
    ],
  },
  {
    name: "Octorok",
    id: 105, 
    size: [1,1],
    diffColor: true,
    movementType: "slow",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Shoot Rock",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Peahat",
    id: 106,
    size: [1,1],
    diffColor: false,
    movementType: "hop",
    hopSpeed: 0,
    enemyType: "flying",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Jump Attack",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Tektite",
    id: 107,
    size: [1,1],
    diffColor: false,
    movementType: "hop",
    hopSpeed: 0,
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Jump Attack",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Darknut",
    id: 200,
    size: [1,1],
    diffColor: true,
    movementType: "idle",
    enemyType: "heavy",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Slash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Guard",
        atkSpeed: "slow",
        atkType: "buff",
        atkAff: "support",
        buffType: "Defense",
        buffMultiplier: 2,
        buffDuration: 3,
      },
    ],
  },
  {
    name: "Gel",
    id: 201,
    size: [1,1],
    diffColor: false,
    movementType: "hop",
    hopSpeed: 0,
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Jump Attack",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Gibdo",
    id: 202,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Claw",
        atkSpeed: "fast",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Goriya",
    id: 203,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Boomerang Throw",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Keese",
    id: 204,
    size: [1,1],
    diffColor: true,
    movementType: "idle",
    enemyType: "flying",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Lanmola",
    id: 205,
    size: [3,3], // not very efficient as it is a large snake-like enemy
    diffColor: true,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bite",
        atkSpeed: "fast",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 80,
      },
      {
        name: "Coil",
        atkSpeed: "slow",
        atkType: "buff",
        atkAff: "support",
        buffType: "Defense",
        buffMultiplier: 2,
        buffDuration: 2,
      },
    ],
  },
  {
    name: "Likelike",
    id: 206,
    size: [2,2],
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Devour",
        atkSpeed: "slow",
        atkType: "debuff",
        atkAff: "support",
        buffType: "speed",
        bullMultiplier: 2,
        buffDuration: 3,
        accuracy: 50,
      },
      {
        name: "Chomp",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 80,
      },
    ],
  },
  {
    name: "Moldorm",
    id: 207,
    size: [3,3], // not very efficient as it is a large snake-like enemy
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 5,
      atk: 0,
      def: 999,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Patra",
    id: 208,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Mini Patra",
    id: 209,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "spin",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Pol's Voice",
    id: 210,
    size: [1,1],
    diffColor: false,
    movementType: "hop",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Rope",
    id: 211,
    size: [1,1],
    diffColor: true,
    movementType: "fast",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Quick Attack",
        atkSpeed: "fast",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Stalfos",
    id: 212,
    size: [1,1],
    diffColor: false,
    movementType: "walk",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Slash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Vire",
    id: 213,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Wallmaster",
    id: 214,
    size: [1,1],
    diffColor: false,
    movementType: "walk",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Grab",
        atkSpeed: "slow",
        atkType: "debuff",
        atkAff: "support",
        buffType: "speed",
        bullMultiplier: 3,
        buffDuration: 3,
        accuracy: 50,
      },
      {
        name: "Squeeze",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 80,
      },
    ],
  },
  {
    name: "Wizzrobe",
    id: 215,
    size: [1,1],
    diffColor: true,
    movementType: "normal", 
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Beam Attack",
        atkSpeed: "slow",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 90,
      },
    ],
  },
  {
    name: "Zol",
    id: 216,
    size: [1,1],
    diffColor: false,
    movementType: "hop",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // zora only spawn in water, not sure how this one will get handled
    name: "Zora",
    id: 300,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "water",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Magic Ball",
        atkSpeed: "slow",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Goomba",
    id: 400,
    size: [1,1],
    diffColor: false,
    movementType: "walk",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Headbutt",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
];

const bosses = [
  // bosses will be much stronger than normal enemies
  // may very rarely spawn in the overworld, most often found in designated areas (dungeons)
  // enemy ID's first digit tells which game they come from
  // 1 = zelda, 2 = mario, 3 = pokemon, 4 = deltarune
  // for enemies not from zelda, they will have their own special battle UI, sound effects, background music, and more
  // the player will be warned non-zelda bosses are nearby in some fashion, possibly audio cues
  { // spawns in 1st and 7th dungeon
    name: "Aquamentus",
    id: 10,
    size: [2,2],
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Triple Fireball",
        atkSpeed: "normal",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // spawns in 2nd dungeon, is a miniboss in 5th/7th dungeon
    name: "Dodongo",
    id: 11,
    size: [2,2],
    movementType: "normal",
    enemyType: "dodongo",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // spawns in 3rd dungeon, is a miniboss in 4th/8th dungeon
    name: "Manhandla",
    id: 12,
    size: [3,3],
    movementType: "normal",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Icicle Shard",
        atkSpeed: "slow",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // spawns in 4th dungeon with 2 heads. Is a miniboss in 6th dungeon with 3 heads and in 8th dungeon with 4 heads
    name: "Gleeok",
    id: 13,
    size: [2,3],
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Ice Breath",
        atkSpeed: "normal",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // spawns in 5th dungeon, is a miniboss in 7th dungeon
    name: "Digdogger",
    id: 14,
    size: [2,2],
    movementType: "normal",
    enemyType: "digdogger",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // spawns in 6th dungeon, is a miniboss in 8th dungeon
    name: "Gohma",
    id: 15,
    size: [3,1],
    movementType: "hop",
    enemyType: "gohma",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Close Eye",
        atkSpeed: "fast",
        atkType: "buff",
        atkAff: "support",
      },
      {
        name: "Open Eye",
        atkSpeed: "fast",
        atkType: "debuff",
        atkAff: "support",
      },
      {
        name: "Sticky Web",
        atkSpeed: "normal",
        atkType: "debuff",
        atkAff: "support",
        buffType: "speed",
        buffMultiplier: 2,
        buffDuration: 3,
      },
      {
        name: "Fireball",
        atkSpeed: "fast",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // spawns in 9th (final) dungeon
    name: "Ganon",
    id: 16,
    size: [2,2],
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Invisibility",
        atkSpeed: "fast",
        atkType: "buff",
        atkAff: "support",
      },
      {
        name: "Fireball",
        atkSpeed: "normal",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // mario, spawns in peach's castle
    name: "Red Plumber",
    id: 20,
    size: [1,2],
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Jump",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Hammer",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Bros' Attack",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Item",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // luigi, spawns in peach's castle
    name: "Green Plumber",
    id: 21,
    size: [1,2],
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Jump",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Hammer",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Bros' Attack",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Item",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // bowser, spawns in bowser's castle
    name: "King of the Koopas",
    id: 22,
    size: [3,3],
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Punch",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Flame",
        atkSpeed: "normal",
        atkType: "ranged",
        atkAff: "fire",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Vacuum",
        atkSpeed: "normal",
        atkType: "debuff",
        atkAff: "support",
      },
      {
        name: "Item",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // red, spawns in mt. silver summit
    name: "Pocket Monster Champion",
    id: 30,
    size: [1,1],
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    team: ["Pikachu", "Espeon", "Snorlax", "Venusaur", "Charizard", "Blastoise"],
    currentPKMN: "Pikachu",
    attacks: [
      {
        name: "Send Out PKMN",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // kris, spawns in castle town
    name: "Empty Boy",
    id: 40,
    size: [1,2],
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Fight",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Act",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Item",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Mercy",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Guard",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // susie, spawns in castle town
    name: "Rowdy Horse",
    id: 41,
    size: [1,2],
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Fight",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Magic",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Item",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Mercy",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Guard",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // ralsei, spawns in castle town
    name: "Gentle Goat",
    id: 42,
    size: [1,2],
    movementType: "idle",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Fight",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Magic",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Item",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Mercy",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Guard",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
];

const equipment = [
  {
    name: "Sword", // starter sword
    overworldUse: { // what this does when used in the overworld
      type: "sword",
    },
    attacks: [ // the attacks usable in combat with this weapon
      {
        name: "Slash", // name of attack
        atkSpeed: "normal", // the speed of the attack; slower speeds gives the enemy more turns, higher speeds gives Link more turns
        atkType: "melee", // melee weapons can only hit things on the ground; flying enemies cannot be hit with them
        atkAff: "hit", // attack affinity determines what kind of attack it is; some enemies are weak/resistant to certain attacks
        baseDMG: 0, // base damage of specific attack
        accuracy: 100, // base chance of attack actually hitting enemy; is in percentage, can be lowered by enemy's evasion stat
      },
      {
        name: "Stab",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "White Sword",
    overworldUse:{
      type: "sword",
    },
    attacks: [
      {
        name: "Slash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Parry",
        atkSpeed: "slow",
        atkType: "counter",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 200,
      },
    ],
  },
  {
    name: "Magical Sword",
    overworldUse:{
      type: "sword",
    },
    attacks: [
      {
        name: "Slash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Hone",
        atkSpeed: "fast",
        atkType: "buff",
        atkAff: "support",
        buffType: "Attack", // skill buff Link's attack stat
        buffMultiplier: 3, // how much Link's attack will be multiplied
        buffDuration: 2, // how many of Link's turns the buff will last for
      },
    ],
  },
  {
    name: "Bombs",
    overworldUse:{
      type: "bomb",
      explodeTime: 3, // in seconds
      maxInv: 8, // limit to how much bombs Link can hold, however can be upgraded
    },
    attacks: [
      {
        name: "Place",
        atkSpeed: "fast",
        atkType: "bomb", // bomb can hit most enemies, specific ones might resist it though
        atkAff: "explosion",
        baseDMG: 0,
        accuracy: 85,
        bombDuration: 1, // how much turns it takes until the bomb explodes, will explode at the start of Link's next turn (since value is 1)
      },
    ],
  },
  {
    name: "Boomerang",
    overworldUse:{
      type: "boomerang",
      screenDist: 0.5, // how far the projectile can travel in reference to grid in overworld: math is width (or height) * screenDist, basically 0.5 is saying that it can travel half the screen
    },
    attacks: [
      {
        name: "Throw",
        atkSpeed: "normal",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 80,
      },
    ],
  },
  {
    name: "Magical Boomerang",
    overworldUse:{
      type: "boomerang",
      screenDist: 1,
    },
    attacks: [
      {
        name: "Throw",
        atkSpeed: "fast",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 90,
      },
    ],
  },
  {
    name: "Bow", // attacks change depending on what arrow Link has, silver arrow has priority over regular arrow, only usable if Link has any arrow types
    overworldUse:{
      type: "bow",
      screenDist: 1,
    },
    attacks: [
      {
        name: "Shoot",
        atkSpeed: "normal",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 95,
      },
    ],
  },
  {
    name: "Blue Candle", // emits fire forward, can hurt both player and enemy. One use per room entry
    overworldUse:{
      type: "candle",
      screenDist: 0.1,
      limit: 1,
    },
    attacks: [
      {
        name: "Light Up",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "fire",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Red Candle", // emits fire forward, can hurt both player and enemy. Infinite use
    overworldUse:{
      type: "candle",
      screenDist: 0.1,
      limit: "inf",
    },
    attacks: [
      {
        name: "Light Up",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "fire",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Recorder", // has a few uses
    // use 1: teleports to last completed dungeon's entrance if used in the overworld
    // use 2: reveals the entrance to dungeon 7 if used in the room where the entrance is
    // use 3: usable in the Digdogger fight to shrink him, so he is no longer invincible
    overworldUse:{
      type: "recorder",
    },
    attacks: [
      {
        name: "Play",
        atkSpeed: "slow",
        atkType: "recorder",
        atkAff: "support",
      },
    ],
  },
  {
    name: "Magical Rod",
    overworldUse:{
      type: "rod",
      screenDist: 1,
    },
    attacks: [
      {
        name: "Beam Attack",
        atkSpeed: "slow",
        atkType: "ranged",
        atkAff: "hit", // will be changed to fire should the player own the Book of Magic
        baseDMG: 0,
        accuracy: 90,
      },
    ],
  },
];

const shields = [ // shields are different from equipment as they are equipped at all times; cannot be swapped out for another weapon as guarding is always an option in battle
  {
    name: "Wooden Shield",
    guard: 2.5, // how much defense is multiplied by when guarding
  },
  {
    name: "Magical Shield",
    guard: 5,
  },
];

const items = [
  {
    name: "Life Potion",
    canbeUsed: true, // asks if this item is usable in combat. If false, it is limited to the player menu in the overworld
    heals: "full", // if item has "full" as the heal value, it fully heals the player upon use
    holding: 0, // how much is in Link's inventory
    uses: 1, // how many times this item can be used before it disappears
  },
  {
    name: "2nd Potion", // difference from Life Potion is that it can be used twice before disappearing
    canbeUsed: true,
    heals: "full",
    holding: 0,
    uses: 2,
  },
  {
    name: "Food", // can be used as an enemy distraction
    canbeUsed: true,
    distractionTime: 20, // how many seconds enemies can eat the food before it disappears and enemies start noticing Link again
    holding: 0,
    uses: 1,
  },
  {
    name: "Raft", // is used to cross water
    canbeUsed: false,
    uses: "inf", // if "inf", it has infinite usage
  },
  {
    name: "Stepladder", // is used to cross gaps
    canbeUsed: false,
    uses: "inf",
  },
  {
    name: "Escape Rope", // only can be used within dungeons; is used to escape the current dungeon and teleport to its entrance 
    canbeUsed: false,
    uses: 1,
  },
];

const keyItems = [
  {
    name: "Arrow",
    baseDMG: 0,
  },
  {
    name: "Silver Arrow",
    baseDMG: 0,
  },
  {
    name: "Small Key",
    holding: 0,
  },
  {
    name: "Magical Key",
  },
  {
    name: "Letter",
  },
  {
    name: "Book of Magic",
  },
  {
    name: "Power Bracelet",
  },
  {
    name: "Compass",
    dungeon: 0,
  },
  {
    name: "Dungeon Map",
    dungeon: 0,
  },
  {
    name: "Triforce Fragment",
    holding: 0,
  },
  {
    name: "Triforce of Wisdom",
  },
];

const roomObjects = [
  // other objects in the game that have different uses and functionality
  {
    name: "Treasure Chest",
    id: 0,
    size: [1,1],
  },
  {
    name: "Speed Booster",
    ID: 1,
    size: [1,1],
  },
  {
    name: "Spikes",
    ID: 2,
    size: [1,1],
  },
  {
    name: "Boulder",
    ID: 3,
    size: [1,1],
  },
  {
    name: "Breakable Object",
    ID: 4,
    type: null,
    size: [1,1],
  },
  {
    name: "Movable Rock",
    ID: 5,
    size: [1,1],
  },
  {
    name: "Safe Chest",
    ID: 9,
    size: [1,1]
  }
];

window.onresize = function() { // if the window gets resized
  if (windowWidth>windowHeight){
    cellSize = windowHeight/GRID_Y;
  }
  else {
    cellSize = windowWidth/GRID_X;
  }
  canvas = createCanvas(cellSize*GRID_X, cellSize*GRID_Y);
};