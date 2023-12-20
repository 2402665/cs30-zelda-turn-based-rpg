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

// Battle Controls:
// Use the WSAD, arrow keys, or hover with the mouse to select an action. Tap the space bar or click to use the action you have selected.
// Tap the space bar to move through battle dialogue.

// Note To Self:
// Remember that in package.json, the "no-undef" is "off", meaning that error won't pop up for module stuff
// when debugging, remember to turn it back on

// Code:

// setting up variables for modules

let imageAssets = new Map();
let bgmAssets = new Map();
let sfxAssets = new Map();
let roomAssets = new Map();

// biome list
let biomeList = ["gloomy", "grassy", "rocky", "spooky"];
let subbiomeList = ["rocks", "trees"];

// exit settings
let exitMax = 8; // tells how many exits can be in a room at once
let exitScale = [2,5]; // tells how much grid slots an exit takes up, [min, max]

// grid size settings
const GRID_X = 16; // how wide the grid will be
const GRID_Y = 11; // how tall the grid will be

const DUNGEON_X = 12; // how wide the dungeon grid will be
const DUNGEON_Y = 7; // how tall the dungeon grid will be

let cellSize; // will turn into a x/y value for scaling stuff later

let rooms = []; // the holy array of every room

let player = null; // the current player; will be changed into an array of players should co-op be added

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

  player = new Player(GRID_X/2, GRID_Y/2, 0, 0);

  player.walkSPD = player.walkSPDBase + player.walkSPDBoost;

  for (let biome of biomeList){
    if (imageAssets.has("tiles-overworld-"+biome)){
      let loadedImage = imageAssets.get("tiles-overworld-"+biome);
      let overworldSpriteX = 8;
      let overworldSpriteY = 5;
      let spriteArray = [];
      for (let y=0; y<overworldSpriteY; y++){
        spriteArray[y] = [];
        for (let x=0; x<overworldSpriteX; x++){
          spriteArray[y][x] = loadedImage.get(loadedImage.width / overworldSpriteX * x, loadedImage.height / overworldSpriteY * y, loadedImage.width / overworldSpriteX, loadedImage.height / overworldSpriteY);
        }
      }
      imageAssets.set("tiles-overworld-"+biome, spriteArray);
    }
  }
  
  console.log(new Enemy(0,0,100,1));

  imageMode(CENTER);
  rectMode(CENTER);

  let startingRoom = new Room(0, 0, createEmptyRoom(), null, randomBiome("biome"), randomBiome("subbiome"), null);
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

function randomBiome(biomeType){
  if (biomeType === "biome"){
    let biomeNum = round(random(0,biomeList.length-1)); // intended that index 0 and 3 are rarer than 1 and 2
    return biomeList[biomeNum];
  }
  else if (biomeType === "subbiome"){
    let biomeNum = round(random(0,subbiomeList.length-1));
    return subbiomeList[biomeNum];
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
  let xScalar = 1; // scalar for Link in the case he is doing something beyond his normal width/height (like attacking)
  let yScalar = 1; // same as above but for y value
  let xSubtractValue = 1; // position to be subtracted from where Link's position is, used for east and south to make the attack look clean
  let ySubtractValue = 1; // same as above but for y value
  if (player.isMoving === false && player.isAttacking === false){ // if idle (no movement)
    theImage = imageAssets.get("link-"+player.direction+"-idle");
  }
  else if (player.isMoving === true){ // if walking
    theImage = imageAssets.get("link-"+player.direction+"-moving");
  }
  else if (player.isAttacking === true){ // if attacking
    if (millis() < player.attackTime + player.attackCooldown / 6 || millis() > player.attackTime + player.attackCooldown - player.attackCooldown / 6){ // if in preattack
      theImage = imageAssets.get("link-"+player.direction+"-preattack");
    }
    else { // if weapon (currently only sword) is drawn
      theImage = imageAssets.get("link-"+player.direction+"-attack");
      if (player.direction === "north" || player.direction === "south"){
        yScalar = 1.6875;
      }
      else if (player.direction === "west" || player.direction === "east"){
        xScalar = 1.6875;
      }
      if (player.direction === "east"){
        xSubtractValue = xScalar;
      }
      if (player.direction === "south"){
        ySubtractValue = yScalar;
      }
    }
  }
  image(theImage, cellSize*player.x-cellSize*(xScalar-xSubtractValue), cellSize*player.y-cellSize*(yScalar-ySubtractValue), cellSize*xScalar, cellSize*yScalar);
}

function overworldControls() {
  let addedPos = {x: 0, y: 0, xSign: 0, ySign: 0};
  if (state === "explore" && player.ableToMove && !player.isAttacking) {
    if (keyIsDown(32)){ // space bar
      // attack
      player.isMoving = false;
      player.isAttacking = true;
      player.attackTime = millis();
    }
    else if (keyIsDown(69)){ // e
      // opens menu so long as player is not attacking
      if (!player.isAttacking){
        player.isMoving = false; 
        state = "menu";
      }
    }
    else if (keyIsDown(87) || keyIsDown(38)) { // w or up arrow
      // move player up
      addedPos.y = player.walkSPD * -1;
      addedPos.ySign = -0.5;
      player.direction = "north";
      player.isMoving = true;
    } 
    else if (keyIsDown(83) || keyIsDown(40)) { // s or down arrow
      // move player down
      addedPos.y = player.walkSPD;
      addedPos.ySign = 0.5;
      player.direction = "south";
      player.isMoving = true;
    } 
    else if (keyIsDown(65) || keyIsDown(37)) {// a or left arrow
      // move player left
      addedPos.x = player.walkSPD * -1;
      addedPos.xSign = -0.5;
      player.direction = "west";
      player.isMoving = true;
    } 
    else if (keyIsDown(68) || keyIsDown(39)) { // d or right arrow
      // move player right
      addedPos.x = player.walkSPD;
      addedPos.xSign = 0.5;
      player.direction = "east";
      player.isMoving = true;
    }
    else {
      // player is not moving
      player.isMoving = false;
    }
  }
  if (state === "explore" && player.ableToMove && player.isAttacking && millis() >= player.attackTime + player.attackCooldown){
    player.isAttacking = false;
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
    let newRoom = new Room(player.roomX, player.roomY, createEmptyRoom(), null, randomBiome("biome"), randomBiome("subbiome"), null);
    newRoom.addExits();
    rooms.push(newRoom);
  }
}

function mousePressed() { 
  if (state === "start"){
    bgmAssets.get("title").stop();
    bgmAssets.get("overworld").loop();
    state = "explore";
    imageMode(CORNER);
  }
  else if (state === "explore"){
    // attacks
    player.isMoving = false;
    player.isAttacking = true;
    player.attackTime = millis();
  }
  else if (state === "menu"){
    // activates some menu button, depending on where clicked
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

window.onresize = function() { // if the window gets resized
  if (windowWidth>windowHeight){
    cellSize = windowHeight/GRID_Y;
  }
  else {
    cellSize = windowWidth/GRID_X;
  }
  canvas = createCanvas(cellSize*GRID_X, cellSize*GRID_Y);
};