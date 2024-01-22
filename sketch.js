// Ethan Heshka
// Computer Science 30
// Major Project
// Finished on ???
// Project Name: The Legend of Zelda - Rift In Spacetime

// Project Desription:
// The original exploration game redone to be a Legend of Zelda fangame, featuring the base game reimagined to be a turn-based RPG with extra randomization, features, and secrets.

// Overworld Controls:
// Use the WSAD or arrow keys to move Link.
// Tap the space bar to attack.
// Tap the E key to open your inventory. Use WSAD, or the arrow keys to navigate the inventory menus.

// Battle Controls:
// Use WSAD, or arrow keys to select an action. Tap the space bar to use the action you have selected.
// Tap the space bar to move through dialogue.

// Note To Self:
// Remember that in package.json, the "no-undef" is "off", meaning that error won't pop up for module stuff
// when debugging, remember to turn it back on

// NOTES FOR LATER:
// DAMAGE CALCULATIONS: base dmg (of attack used) * link's attack * enemy def formula (100% - [enemyDEF / (enemyDEF + 20)]
// reverse the above for enemy attacks

// Code:

// setting up variables for modules

let imageAssets = new Map();
let bgmAssets = new Map();
let sfxAssets = new Map();
let roomAssets = new Map();

// define nesFont for use later
let nesFont;

// define timers for use later
let startupTextTimer = 0;
let startupTextCooldown = 800;

// button lists
let menuButtons = ["EQUIP", "ITEMS"];
let equipButtons = ["EQUIP", "SWAP"];
let itemButtons = ["USE"];
let battleButtons = ["FIGHT", "GUARD", "ITEM", "RUN"];
let deathButtons = ["RESPAWN", "TITLE"];

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

// other important variables
let cellSize; // will turn into a x/y value for scaling stuff later

let rooms = []; // the holy array of every room

let player = null; // the current player; will be changed into an array of players should co-op be added

let state = "not-done"; // current state of game

let fadeCount = 51; // amount of times fade has to occur (255/51 is fade level, aka 5)
let currentFadeCount = 0; //however many times fade has occurred

function preload(){
  // load nesFont
  nesFont = loadFont("assets/fonts/PressStart2P-vaV7.ttf");

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

  textFont(nesFont);
  fill(255);

  player = new Player(GRID_X/2, GRID_Y/2, 0, 0);

  player.walkSPD = player.walkSPDBase + player.walkSPDBoost;

  // split up tileset/spritesheet for overworld sprites
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

  imageMode(CENTER);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  let startingRoom = new Room(0, 0, createEmptyRoom(), null, randomBiome("biome"), randomBiome("subbiome"), null);
  startingRoom.addExits();
  rooms.push(startingRoom);
  state = "start";
}

function draw() {
  player.checkLevel();
  if (state === "start"){
    // If on the start screen
    if (!bgmAssets.get("title").isPlaying()){
      bgmAssets.get("title").loop();
    }
    loadStartScreen();
  }
  else if (state === "explore") {
    // If exploring
    let theRoom = findRoom(player);
    theRoom.display();
    for(let enemy of theRoom.enemies){
      enemy.move();
      enemy.display();
    }
    theRoom.displayObjects();
    player.overworldControls();
    player.displayPlayer();
  } 
  else if (state === "menu") {
    // If in the player menu
    player.displayMenu();
  } 
  else if (state === "battle") {
    // If entered a battle
    if (player.isFading === "in"){
      bgmAssets.get("overworld").stop();
      player.fadeIntoBattle();
    }
    else if (player.isFading === "out"){
      player.fadeOutOfBattle();
    }
    else{
      player.battle();
    }
  }
  else if (state === "defeat"){
    player.defeat();
  }
  else if (state === "game-over"){
    player.gameOverMenu();
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
  push();
  image(imageAssets.get("title-screen"), width/2, height/2, width, height);
  image(imageAssets.get("rift"), width/2, height/2-height/20, width-width/5, height/5);
  textSize(height/22.5);
  fill("white");
  text("RIFT IN SPACETIME", width/2, height/2-height/24);
  textSize(height/30);
  fill("black");
  text("DEMO", width/2, height/1.725);
  if (millis() < startupTextTimer + startupTextCooldown / 2){
    text("PRESS ANY KEY", width/2, height/1.57);
  }
  else if (millis() > startupTextTimer + startupTextCooldown){
    startupTextTimer = millis();
  }
  pop();
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

function findRoom(thePlayer){
  let currentRoom = null;
  for (let room of rooms){
    if (thePlayer.roomX === room.x && thePlayer.roomY === room.y){
      currentRoom = room;
      break;
    }
  }
  return currentRoom;
}

function findWeapon(theName){
  for (let i=0; i<equipment.length; i++){
    if (theName === equipment[i].name){ // if theName is a name of a weapon, return the index in the equipment tab
      return i;
    }
    else if (theName === i){ // if theName is an index variable, return the name of the weapon
      return equipment[i].name;
    }
  }
}

function keyPressed(){
  if (state === "start"){
    bgmAssets.get("title").stop();
    bgmAssets.get("overworld").loop();
    state = "explore";
    imageMode(CORNER);
  }
  else{
    player.menuControls(keyCode);
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