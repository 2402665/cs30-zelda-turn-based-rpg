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

const DUNGEON_X = 11; // how wide the dungeon grid will be
const DUNGEON_Y = 7; // how tall the dungeon grid will be

let loadedRoom;

let cellSize; // will turn into a x/y value for scaling later

let rooms = []; // the holy array of every room

let playerAbleToMove = true; // variable used to check if player should be able to move, used for cutscenes/fades

let player = { // player values
  x: 8, // x value in relevance to grid
  y: 5.5, // y value in relevance to grid
  spdBase: 0.075, // speed without boosts
  spdBoost: 0, // extra boost to speed
  spd: 0, //total speed
  roomX: 0, // x value in relevance to room grid
  roomY: 0, // y value in relevance to room grid
  battleX: 0, // x value during combat
  battleY: 0, // y value during combat
};



let imageAssets = { // list of all sprites/spritesheets in the game
  fadeBlack: null,
  floor: null,
  wall: null,
  player: null,
  octorok: null,
  mario: null,
  luigi: null,
  title: null,
  clicktostart: null,
  treasureChest: null,
  speedBooster: null,
  something: null,
  message: null,
};

let bgm = { // list of all background music in the game
  title: null,
  overworld: null,
};

let sfx = { // list of all sound effects in the game
  click: null,
  footstep: null,
  hit_wall: null,
};

let state = "start"; // current state of game

function preload(){
  // load images
  imageAssets.fadeBlack = loadImage("assets/images/fadeblack.png");
  imageAssets.floor = loadImage("assets/images/floor-temp.png");
  imageAssets.wall = loadImage("assets/images/wall-temp.png");
  imageAssets.player = loadImage("assets/images/link_temporary.png");
  imageAssets.title = loadImage("assets/images/title.png");
  imageAssets.clicktostart = loadImage("assets/images/click-to-start.png");

  // set up sound formats to be used
  soundFormats("mp3", "wav");

  // load background music
  bgm.title = loadSound("assets/bgm/title.mp3");
  bgm.title.setVolume(0.5);
  bgm.overworld = loadSound("assets/bgm/overworld.mp3");
  bgm.overworld.setVolume(0.5);


  // load sound effects
  sfx.click = loadSound("assets/sfx/click.wav");
  sfx.footstep = loadSound("assets/sfx/footstep.wav");
  sfx.hit_wall = loadSound("assets/sfx/hit_wall.wav");
}

function setup() {
  if (windowWidth>windowHeight){
    cellSize = windowHeight/GRID_Y;
  }
  else {
    cellSize = windowWidth/GRID_X;
  }
  canvas = createCanvas(cellSize*GRID_X, cellSize*GRID_Y);

  player.spd = player.spdBase + player.spdBoost;

  imageMode(CENTER);
  rectMode(CENTER);

  let startingRoom = new Room(0, 0, createEmptyRoom(), null, null, null);
  startingRoom.addExits();
  rooms.push(startingRoom);

  bgm.title.loop();

  sfx.footstep.playMode("sustain");
  sfx.hit_wall.playMode("untilDone");
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

function loadStartScreen(){
  background(0);
  image(imageAssets.title, width/2, height/2, width-cellSize, cellSize/1.5);
  image(imageAssets.clicktostart, width/2, height-cellSize, width/2.5, cellSize/2.5);
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
  image(imageAssets.player, cellSize*player.x, cellSize*player.y, cellSize, cellSize);
}

function overworldControls() {
  let addedPos = {x: 0, y: 0, xSign: 0, ySign: 0};
  if (state === "explore") {
    if (keyIsDown(87) || keyIsDown(38) ) {
      // w or up arrow
      addedPos.y = player.spd * -1;
      addedPos.ySign = -0.5;
    } 
    else if (keyIsDown(83) || keyIsDown(40)  ) {
      // s or down arrow
      addedPos.y = player.spd;
      addedPos.ySign = 0.5;
    } 
    else if (keyIsDown(65) || keyIsDown(37)  ) {
      // a or left arrow
      addedPos.x = player.spd * -1;
      addedPos.xSign = -0.5;
    } 
    else if (keyIsDown(68) || keyIsDown(39)  ) {
      // d or right arrow
      addedPos.x = player.spd;
      addedPos.xSign = 0.5;
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
      sfx.hit_wall.play();
    }
  }
  catch{ // in case of error (AKA player leaving the room in north/south directions)
    if (player.y < player.spd){ // if going into north exit
      changeRoom("north", player);
    }
    else if (player.y > GRID_Y - 1 - player.spd*2){ // if going to south exit
      changeRoom("south", player);
    }
  }
  // game does not error in case of west/east exits, so check them here
  if (player.x < 0){ // if going to west exit
    changeRoom("west", player);
  }
  else if (player.x > GRID_X - 1 - player.spd){ // if going to east exit
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
    bgm.title.stop();
    bgm.overworld.loop();
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
          sfx.click.play();
        }
      }
    }
    
  }
  else if (state === "battle"){
    // activate some battle button, depending on where clicked
  }
}

function findEnemy(id){ // searches through enemy table to retrieve information
  for (let enemy of enemies){
    if (enemy.id === id){
      return enemy;
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
          for (let ban of bannedDirections){
            if (ban === "north"){
              notBanned = false;
            }
          }
          if (notBanned){
            this.exits.push(newExit("north", round(random(1,GRID_X-newExitSize-1)), newExitSize));
          }
        }
        else if (newExitDirection === 1){ //south
          for (let ban of bannedDirections){
            if (ban === "south"){
              notBanned = false;
            }
          }
          if (notBanned){
            this.exits.push(newExit("south", round(random(1,GRID_X-newExitSize-1)), newExitSize));
          }
        }
        else if (newExitDirection === 2){ //west
          for (let ban of bannedDirections){
            if (ban === "west"){
              notBanned = false;
            }
          }
          if (notBanned){
            this.exits.push(newExit("west", round(random(1,GRID_Y-newExitSize-1)), newExitSize));
          }
        }
        else if (newExitDirection === 3){ //east
          for (let ban of bannedDirections){
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
          image(imageAssets.floor, cellSize*j, cellSize*i, cellSize, cellSize);
        }
        else if (this.layout[i][j]===1){
          image(imageAssets.wall, cellSize*j, cellSize*i, cellSize, cellSize);
        }
      }
    }
  }
}

class Enemy {
  constructor(x, y, id, level){
    this.x = x;
    this.y = y;
    try{
      let currentEnemy = findEnemy(id);
      this.id = currentEnemy.id;
      this.name = currentEnemy.name;
      this.size = currentEnemy.size;
      this.movementType = currentEnemy.movementType; // walk, normal (between walk and run), run, hop, idle, etc
      this.baseStats = currentEnemy.baseStats;
      this.moves = currentEnemy.moves;
    }
    catch{
      console.log("Enemy does not exist!");
    }
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

const equipment = [
  {
    name: "Sword", // starter sword
    attacks: [ // the attacks usable in combat with this weapon
      {
        name: "Slash", // name of attack
        atkSpeed: "normal", // the speed of the attack; slower speeds gives the enemy more turns, higher speeds gives Link more turns
        atkType: "melee", // melee weapons can only hit things on the ground; flying enemies cannot be hit with them
        atkAff: "slash", // attack affinity determines what kind of attack it is; some enemies are weak/resistant to certain attacks
        baseDMG: 0, // base damage of specific attack
      },
    ],
  },
  {
    name: "White Sword",
    attacks: [ // the attacks usable in combat with this weapon
      {
        name: "Slash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "slash",
        baseDMG: 0,
      },
      {
        name: "Stab",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "slash",
        baseDMG: 0,
      },
    ],
  },
  {
    name: "Magical Sword",
    attacks: [ // the attacks usable in combat with this weapon
      {
        name: "Slash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "slash",
        baseDMG: 0,
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
    explodeTime: 3, // in seconds
    canCarryInitial: 8, // limit to how much bombs Link can hold, however can be upgraded
    inInventory: 0, // how much Link actually has in his inventory
    attacks: [ // the attacks usable in combat with this weapon
      {
        name: "Set Bomb",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "explosion",
        baseDMG: 0,
      },
    ],
  },
  {
    name: "Food", // can be used as an enemy distraction or as a healing item
    distractionTime: 20, // how many seconds enemies can eat the food before it disappears and starts noticing Link again
    canCarryInitial: 3, // limit to how much food Link can hold
    inInventory: 0, // heals 50HP to player in combat / if selected to use the healing function instead via the menu
  },
  {
    name: "Boomerang",
    screenDist: 0.5, // how far the boomerang can travel in reference to grid in overworld: math is width (or height) * screenDist, basically saying it can travel half the screen
    atkType: "ranged", // ranged attacks can hit all enemies
    atkAff: "slash",
  },
  {
    name: "Magical Boomerang",
    screenDist: 1, // how far the boomerang can travel in reference to grid in overworld: math is width (or height) * screenDist, basically saying it can travel half the screen
    atkType: "ranged",
    atkAff: "slash",
  },
  {
    name: "Bow", // attacks change depending on what arrow Link has, silver arrow has priority over regular arrow, only usable if Link has any arrow types
    screenDist: 1, // how far the boomerang can travel in reference to grid in overworld: math is width (or height) * screenDist, basically saying it can travel the full screen
    atkType: "ranged",
    atkAff: "slash",
  },
  {
    name: "Blue Candle", // emits fire forward, can hurt both player and enemy. One use per room entry
    screenDist: 0.1, // how far the candle fire can travel in reference to grid in overworld: math is width (or height) * screenDist, basically saying it can travel a tenth of the screen
    atkType: "melee",
    atkAff: "fire",
  },
  {
    name: "Red Candle", // emits fire forward, can hurt both player and enemy. Infinite use
    screenDist: 0.1, // how far the candle fire can travel in reference to grid in overworld: math is width (or height) * screenDist, basically saying it can travel a tenth of the screen
    atkType: "melee",
    atkAff: "fire",
  },
  {
    name: "Recorder", // has a few uses
    // use 1: teleports to last completed dungeon's entrance if used in the overworld
    // use 2: reveals the entrance to dungeon 7 if used in the room where the entrance is
    // use 3: usable in the Digdogger fight to shrink him, so he is no longer invincible
  },
  {
    name: "Magical Rod",
    screenDist: 1, // how far the rod projectiles can travel in reference to grid in overworld: math is width (or height) * screenDist, basically saying it can travel the whole screen
    atkType: "ranged",
    atkAff: "slash", // will be changed to fire should the player own the Book of Magic
  },
];

const shields = [ // shields are different from equipment as they are equipped at all times; cannot be swapped out for another weapon as guarding is always an option in battle
  {
    name: "Wooden Shield",
    type: "shield",
    defMultiplier: 1, // how much defense the shield gives in general
    guardMultiplier: 2.5, // how much defense the shield gives when guarding
  },
  {
    name: "Magical Shield",
    type: "shield",
    defMultiplier: 1.5,
    guardMultiplier: 5,
  },
];

const items = [
  {
    name: "Life Potion",
    canbeUsed: true, // asks if this item is usable in combat. If false, it is limited to the player menu in the overworld
    heals: "full", // if item has "full" as the heal value, it fully heals the player upon use
    uses: 1, // how many times this item can be used before it disappears
  },
  {
    name: "2nd Potion", // difference is that it can be used twice before disappearing
    canbeUsed: true,
    heals: "full",
    uses: 2,
  },
  {
    name: "Raft", // is used to cross water
    canbeUsed: false,
    uses: "inf", // if "inf", it has infinite usage
  },
  {
    name: "Raft", // is used to cross gaps
    canbeUsed: false,
    uses: "inf",
  },
  {
    name: "Escape Rope", // only can be used within dungeons; is used to escape the current dungeon and teleport to its entrance 
    canbeUsed: false,
    uses: 1,
  },
];

const enemies = [
  // enemies themselves will not show up on the grid
  // however when checking if running into an enemy, it will look at the player and enemy x/y values
  // id = enemy ID
  // enemy ID's first digit tells which section of the game they belong in
  // 1 = overworld, 2 = dungeon, 3 = water, 4 = mario
  // for enemies and bosses not from zelda, they will have their own special battle UI, sound effects, background music, and more
  // size are the width and height of the object in relevance to the grid; [3,1] means 3 grid blocks long and 1 grid block tall
  {
    name: "Armos",
    id: 100,
    size: [1,1],
    movementType: "walk",
  },
  {
    name: "Ghini",
    id: 101,
    size: [1,1],
    movementType: "normal",
  },
  {
    name: "Leever",
    id: 102,
    size: [1,1],
    color: null,
  },
  {
    name: "Lynel",
    id: 103,
    size: [1,1],
    color: null,
  },
  {
    name: "Moblin",
    id: 104,
    size: [1,1],
    color: null,
  },
  {
    name: "Octorok",
    id: 105, 
    size: [1,1],
    color: null,
    movementType: "normal",
  },
  {
    name: "Peahat",
    id: 106,
    size: [1,1],
  },
  {
    name: "Tektite",
    id: 107,
    size: [1,1],
  },
  {
    name: "Darknut",
    id: 200,
    size: [1,1],
    color: null,
  },
  {
    name: "Gel",
    id: 201,
    size: [1,1],
  },
  {
    name: "Gibdo",
    id: 202,
    size: [1,1],
  },
  {
    name: "Goriya",
    id: 203,
    size: [1,1],
  },
  {
    name: "Keese",
    id: 204,
    size: [1,1],
    color: null,
  },
  {
    name: "Lanmola",
    id: 205,
    size: [3,3], // not very efficient as it is a large snake-like enemy
    color: null,
  },
  {
    name: "Likelike",
    id: 206,
    size: [2,2],
  },
  {
    name: "Moldorm",
    id: 207,
    size: [3,3], // not very efficient as it is a large snake-like enemy
  },
  {
    name: "Patra",
    id: 208,
    size: [1,1],
  },
  {
    name: "Mini Patra",
    id: 209,
    size: [1,1],
  },
  {
    name: "Pol's Voice",
    id: 210,
    size: [1,1],
  },
  {
    name: "Rope",
    id: 211,
    size: [1,1],
  },
  {
    name: "Stalfos",
    id: 212,
    size: [1,1],
  },
  {
    name: "Vire",
    id: 213,
    size: [1,1],
  },
  {
    name: "Wallmaster",
    id: 214,
    size: [1,1],
  },
  {
    name: "Wizzrobe",
    id: 215,
    size: [1,1],
    color: null,
  },
  {
    name: "Zol",
    id: 216,
    size: [1,1],
  },
  { // zora only spawn in water, not sure how this one will get handled
    name: "Zora",
    id: 300,
    size: [1,1],
  },
  {
    name: "Goomba",
    id: 400,
    size: [1,1],
    movementType: "normal",
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
    powerlv: 1, // 1 or 2 depending on dungeon
    movementType: "idle",
  },
  { // spawns in 2nd dungeon 
    name: "Dodongo",
    id: 11,
    size: [2,2],
    movementType: "normal",
  },
  { // spawns in 3rd dungeon
    name: "Manhandla",
    id: 12,
    size: [3,3],
  },
  { // spawns in 4th dungeon with 2 heads, and 8th dungeon with 4 heads
    name: "Gleeok",
    id: 13,
    size: [2,3],
    powerlv: 1, // 1 or 2 depending on dungeon
    movementType: "idle",
  },
  { // spawns in 5th dungeon
    name: "Digdogger",
    id: 14,
    size: [2,2],
  },
  { // spawns in 6th dungeon
    name: "Gohma",
    id: 15,
    size: [3,1],
  },
  { // spawns in 9th (final) dungeon
    name: "Ganon",
    id: 16,
    size: [2,2],
    movementType: "idle",
  },
  { // mario, spawns in peach's castle
    name: "Red Plumber",
    id: 20,
    size: [1,2],
    movementType: "idle",
  },
  { // luigi, spawns in peach's castle
    name: "Green Plumber",
    id: 21,
    size: [1,2],
    movementType: "idle",
  },
  { // bowser, spawns in bowser's castle
    name: "King of the Koopas",
    id: 22,
    size: [3,3],
    movementType: "idle",
  },
  { // red, spawns in mt. silver summit
    name: "Pocket Monster Champion",
    id: 30,
    size: [1,1],
    movementType: "idle",
  },
  { // kris, spawns in castle town
    name: "Empty Boy",
    id: 40,
    size: [1,2],
    movementType: "idle",
  },
  { // susie, spawns in castle town
    name: "Rowdy Horse",
    id: 41,
    size: [1,2],
    movementType: "idle",
  },
  { // ralsei, spawns in castle town
    name: "Gentle Goat",
    id: 42,
    size: [1,2],
    movementType: "idle",
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