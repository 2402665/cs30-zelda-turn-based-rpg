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

let exits = [0,0,0,0];
let exitScale = 3; // tells how much grid slots an exit takes up

const GRID_X = 16; // how wide the grid will be
const GRID_Y = 11; // how tall the grid will be
let cellSize; // will turn into a x/y value for scaling later

let loadedRoom; // will turn into a 2D array

let playerAbleToMove = true; // variable used to check if player should be able to move, used for cutscenes/fades
let playerMovementTime = 0; // time in millis() when player last moved
let movementCooldown = 200; // cooldown in milliseconds for player movement

let player = { // player values
  x: 8, // x value in relevance to grid
  y: 5, // y value in relevance to grid
  battleX: 0, // x value during combat
  battleY: 0, // y value during combat
};

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
  },
  {
    name: "Ghini",
    id: 101,
    size: [1,1],
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
  },
  { // spawns in 2nd dungeon 
    name: "Dodongo",
    id: 11,
    size: [2,2],
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
  },
  { // mario, spawns in peach's castle
    name: "Red Plumber",
    id: 20,
    size: [1,2],
  },
  { // luigi, spawns in peach's castle
    name: "Green Plumber",
    id: 21,
    size: [1,2],
  },
  { // bowser, spawns in bowser's castle
    name: "King of the Koopas",
    id: 22,
    size: [3,3],
  },
  { // red, spawns in mt. silver summit
    name: "Pocket Monster Champion",
    id: 30,
    size: [1,1],
  },
  { // kris, spawns in castle town
    name: "Empty Boy",
    id: 40,
    size: [1,2],
  },
  { // susie, spawns in castle town
    name: "Rowdy Horse",
    id: 41,
    size: [1,3],
  },
  { // ralsei, spawns in castle town
    name: "Kind Goat",
    id: 42,
    size: [1,3],
  },
];

const roomObjects = {
  // other objects in the game that can be used at different times
  treasureChest: {
    ID: 5,
    size: [1,1],
  },
  speedBooster: {
    ID: 6,
    size: [1,1],
  },
  safeChest: {
    ID: 9,
    size: [1,1]
  }
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

  imageMode(CENTER);
  rectMode(CENTER);

  loadedRoom = createEmptyRoom();

  randomExits();

  findExits(loadedRoom);

  bgm.title.loop();

  sfx.footstep.playMode("sustain");
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
    displayRoom();
    overworldControls();
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
  console.log(table);
  return table;
}

function displayRoom() {
  noStroke();
  displayBorders();
  loadEntities();
}

function displayBorders() {
  for (let i=0; i<GRID_Y; i++){
    for (let j=0; j<GRID_X; j++){
      if (loadedRoom[i][j]===0){
        image(imageAssets.floor, cellSize*j, cellSize*i, cellSize, cellSize);
      }
      else if (loadedRoom[i][j]===1){
        image(imageAssets.wall, cellSize*j, cellSize*i, cellSize, cellSize);
      }
    }
  }
}

function findExits(table) { // for each exit, uses addExits
  for (let exit of exits){
    addExits(exit,table);
  }
}

function addExits(direction,table){ // adds an "exit" to a given 2D array
  // creates a random position variable for the exit to exist in on the grid
  let randomExitPos;
  
  // depending on direction of exit, use randomExitPos to create the exit on the grid
  if (direction === 0){ //north
    randomExitPos = round(random(1,GRID_X-exitScale-1));
    // adds 0s in table to create the exit
    for (let k=0; k<exitScale; k++){
      table[randomExitPos+k][0] = 0;
    }
  }
  else if (direction === 1){ //east
    randomExitPos = round(random(1,GRID_Y-exitScale-1));
    // adds 0s in table to create the exit
    for (let k=0; k<exitScale; k++){
      table[0][randomExitPos+k] = 0;
    }
  }
  else if (direction === 2){ //south
    randomExitPos = round(random(1,GRID_X-exitScale-1));
    // adds 0s in table to create the exit
    for (let k=0; k<exitScale; k++){
      table[randomExitPos+k][GRID_X-1] = 0;
    }
  }
  else if (direction === 3){ //west
    randomExitPos = round(random(1,GRID_Y-exitScale-1));
    // adds 0s in table to create the exit
    for (let k=0; k<exitScale; k++){
      table[GRID_Y-1][randomExitPos+k] = 0;
    }
  }
}

function randomExits() {
  // randomizes exits
  for (let i=0; i<exits.length; i++){
    exits[i] = floor(random(4));
  }
}

function loadEntities() {
  // if there were multiple entities, for example a treasure chest or enemy, they would have their seperate functions loaded here.
  loadPlayer();

}

function loadPlayer() {
  image(imageAssets.player, cellSize*player.x, cellSize*player.y, cellSize, cellSize);
}

function overworldControls() {
  let addedPos = {x: 0, y: 0};
  if (state === "explore") {
    if (millis() > playerMovementTime + movementCooldown && playerAbleToMove){
      if (keyIsDown(87) || keyIsDown(38) ) {
        // w or up arrow
        addedPos.y = -1;
        playerMovementTime = millis();
        sfx.footstep.play();
      } 
      else if (keyIsDown(83) || keyIsDown(40)  ) {
        // s or down arrow
        addedPos.y = 1;
        playerMovementTime = millis();
        sfx.footstep.play();
      } 
      else if (keyIsDown(65) || keyIsDown(37)  ) {
        // a or left arrow
        addedPos.x = -1;
        playerMovementTime = millis();
        sfx.footstep.play();
      } 
      else if (keyIsDown(68) || keyIsDown(39)  ) {
        // d or right arrow
        addedPos.x = 1;
        playerMovementTime = millis();
        sfx.footstep.play();
      }
    }
  }
  movePlayer(addedPos);
}

function movePlayer(addedPos) {
  // moves the player
  // moves into a new room given if player left the room
  if (player.y + addedPos.y < 0){ // if going into north exit
    changeRoom("north");
  }
  else if (player.y + addedPos.y >= GRID_Y){ // if going to south exit
    changeRoom("south");
  }
  else if (player.x + addedPos.x < 0){ // if going to west exit
    changeRoom("west");
  }
  else if (player.x + addedPos.x >= GRID_X){ // if going to east exit
    changeRoom("east");
  }
  else if (loadedRoom[player.y + addedPos.y][player.x + addedPos.x] === 0){ // if not running into something
    player.y += addedPos.y;
    player.x += addedPos.x;
  }
  else if (loadedRoom[player.y + addedPos.y][player.x + addedPos.x] === 1){ // if running into a wall
    sfx.hit_wall.play();
  }
}

function changeRoom(direction){
  // creates a new room based on which exit the player took
  // done by copying the row/column of the exit taken, then placing that same row/column on the other side of a newly generated room
  let oppositeExit;
  let oldRoom = structuredClone(loadedRoom);
  let oldExitPos = [];
  if (direction === "north") {
    oppositeExit = 2; //south
    randomExits();
    exits[0] = oppositeExit;
    for (let i=0; i<GRID_X; i++){
      oldExitPos.push(oldRoom[0][i]);
    }
    loadedRoom = createEmptyRoom();
    findExits(loadedRoom);
    for (let i=0; i<GRID_X; i++){
      loadedRoom[GRID_Y-1][i] = oldExitPos[i];
    }
    player.y = GRID_Y-1;
  } 
  else if (direction === "west") {
    oppositeExit = 3; //east
    randomExits();
    exits[0] = oppositeExit;
    for (let i=0; i<GRID_Y; i++){
      oldExitPos.push(oldRoom[i][0]);
    }
    loadedRoom = createEmptyRoom();
    findExits(loadedRoom);
    for (let i=0; i<GRID_X; i++){
      loadedRoom[i][GRID_X-1] = oldExitPos[i];
    }
    player.x = GRID_X-1;
  } 
  else if (direction === "south") {
    oppositeExit = 0; //north
    randomExits();
    exits[0] = oppositeExit;
    for (let i=0; i<GRID_Y; i++){
      oldExitPos.push(oldRoom[GRID_Y-1][i]);
    }
    loadedRoom = createEmptyRoom();
    findExits(loadedRoom);
    for (let i=0; i<GRID_X; i++){
      loadedRoom[0][i] = oldExitPos[i];
    }
    player.y = 0;
  } 
  else if (direction === "east") {
    oppositeExit = 1; //west
    randomExits();
    exits[0] = oppositeExit;
    for (let i=0; i<GRID_X; i++){
      oldExitPos.push(oldRoom[i][GRID_X-1]);
    }
    loadedRoom = createEmptyRoom();
    findExits(loadedRoom);
    for (let i=0; i<GRID_Y; i++){
      loadedRoom[i][0] = oldExitPos[i];
    }
    player.x = 0;
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
    if (loadedRoom[mouseGridY][mouseGridX] === 0){
      player.x = mouseGridX;
      player.y = mouseGridY;
      sfx.click.play();
    }
  }
  else if (state === "battle"){
    // activate some battle button, depending on where clicked
  }
}

function buildEnemy(id, task){ // searches through enemy table to retrieve information
  // for (let enemy of enemies){
  //   if (enemy.id === id){
      
  //   }
  // }
}

class Room {
  constructor(x, y, layout, enemies, objects){
    this.x = x;
    this.y = y;
    this.layout = layout;
    this.enemies = enemies;
    this.objects = objects;
  }
  display(){

  }
}

class Enemy {
  constructor(x, y, roomX, roomY, id){
    this.x = x;
    this.y = y;
    this.roomX = roomX;
    this.roomY = roomY;
    this.id = id;
    this.name = buildEnemy(id, "name");
    this.size = buildEnemy(id, "size");
    this.movementType = buildEnemy(id, "movementType"); // walk, run, hop, idle, etc
    this.stats = buildEnemy(id, "stats");
    this.moves = buildEnemy(id, "moves");
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

window.onresize = function() { // if the window gets resized
  if (windowWidth>windowHeight){
    cellSize = windowHeight/GRID_Y;
  }
  else {
    cellSize = windowWidth/GRID_X;
  }
  canvas = createCanvas(cellSize*GRID_X, cellSize*GRID_Y);
};