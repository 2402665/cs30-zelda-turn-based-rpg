// player settings
class Player {
  constructor(x,y,roomX,roomY){
    this.x = x; // x value in relevance to grid
    this.y = y; // y value in relevance to grid
    this.walkSPDBase = 0.085; // overworld speed without boosts
    this.walkSPDBoost = 0; // extra boost(s) to overworld speed
    this.walkSPD = this.walkSPDBase + this.walkSPDBoost; // total overworld speed
    this.ableToMove = true; // variable used to check if player should be able to move, used for cutscenes/fades
    this.attackTime = 0; // time when last attack was unleashed
    this.attackCooldown = 300; // time it takes to unleash an overworld attack in milliseconds
    this.isMoving = false; // boolean to tell if player is currently moving
    this.isAttacking = false; // boolean to tell if player is currently using an attack in overworld
    this.direction = "south"; // direction player is facing
    this.roomX = roomX; // x value in relevance to room grid
    this.roomY = roomY; // y value in relevance to room grid
    this.battleX = 0; // x value during combat
    this.battleY = 0; // y value during combat
    this.level = 1; // player's level
    this.exp = 0; // total experience points player has
    this.maxHP = 10; // highest health value player is allowed to have
    this.hp = this.maxHP; // health points player currently has
    this.atk = 1; // attack value during combat
    this.def = 1; // defense value during combat
    this.spd = 1; // speed value during combat
    this.evasion = 10; // evasion value during combat (chance to dodge enemy attacks, is a percentage value)
    this.luck = 5; // luck value during combat (chance to land critical hits, is a percentage value)
    this.actionVal = 0; // the turn value during combat for Link; will be used in formulas taken from Honkai: Star Rail's combat system
  }
  displayPlayer() {
    let theImage;
    let xScalar = 1; // scalar for Link in the case he is doing something beyond his normal width/height (like attacking)
    let yScalar = 1; // same as above but for y value
    let xSubtractValue = 1; // position to be subtracted from where Link's position is, used for east and south to make the attack look clean
    let ySubtractValue = 1; // same as above but for y value
    if (this.isMoving === false && this.isAttacking === false){ // if idle (no movement)
      theImage = imageAssets.get("link-"+this.direction+"-idle");
    }
    else if (this.isMoving === true){ // if walking
      theImage = imageAssets.get("link-"+this.direction+"-moving");
    }
    else if (this.isAttacking === true){ // if attacking
      if (millis() < this.attackTime + this.attackCooldown / 6 || millis() > this.attackTime + this.attackCooldown - this.attackCooldown / 6){ // if in preattack
        theImage = imageAssets.get("link-"+this.direction+"-preattack");
      }
      else { // if weapon (currently only sword) is drawn
        theImage = imageAssets.get("link-"+this.direction+"-attack");
        if (this.direction === "north" || this.direction === "south"){
          yScalar = 1.6875;
        }
        else if (this.direction === "west" || this.direction === "east"){
          xScalar = 1.6875;
        }
        if (this.direction === "east"){
          xSubtractValue = xScalar;
        }
        if (this.direction === "south"){
          ySubtractValue = yScalar;
        }
      }
    }
    image(theImage, cellSize*this.x-cellSize*(xScalar-xSubtractValue), cellSize*this.y-cellSize*(yScalar-ySubtractValue), cellSize*xScalar, cellSize*yScalar);
  }
  overworldControls(theKey) {
    let addedPos = {x: 0, y: 0, xSign: 0, ySign: 0};
    if (state === "explore" && this.ableToMove && !this.isAttacking) {
      if (keyIsDown(32)){ // space bar
        // attack
        this.isMoving = false;
        this.isAttacking = true;
        this.attackTime = millis();
      }
      else if (keyIsDown(87) || keyIsDown(38)) { // w or up arrow
        // move player up
        addedPos.y = this.walkSPD * -1;
        addedPos.ySign = -0.5;
        this.direction = "north";
        this.isMoving = true;
      } 
      else if (keyIsDown(83) || keyIsDown(40)) { // s or down arrow
        // move player down
        addedPos.y = this.walkSPD;
        addedPos.ySign = 0.5;
        this.direction = "south";
        this.isMoving = true;
      } 
      else if (keyIsDown(65) || keyIsDown(37)) {// a or left arrow
        // move player left
        addedPos.x = this.walkSPD * -1;
        addedPos.xSign = -0.5;
        this.direction = "west";
        this.isMoving = true;
      } 
      else if (keyIsDown(68) || keyIsDown(39)) { // d or right arrow
        // move player right
        addedPos.x = this.walkSPD;
        addedPos.xSign = 0.5;
        this.direction = "east";
        this.isMoving = true;
      }
      else {
        // player is not moving
        this.isMoving = false;
      }
    }
    if (state === "explore" && this.ableToMove && this.isAttacking && millis() >= this.attackTime + this.attackCooldown){
      this.isAttacking = false;
    }
    this.move(addedPos);
  }
  move(addedPos) {
    // moves the player
    // moves into a new room given if player left the room
    let currentRoom = findRoom(this);
  
    try{ //checking for room movement
      if (currentRoom.layout[round(this.y + addedPos.ySign)][round(this.x + addedPos.xSign)] === 0){ // if not running into something
        this.y += addedPos.y;
        this.x += addedPos.x;
      }
      else if (currentRoom.layout[round(this.y + addedPos.ySign)][round(this.x + addedPos.xSign)] === 1){ // if running into a wall
        sfxAssets.get("hit-wall").play();
      }
    }
    catch{ // in case of error (AKA player leaving the room in north/south directions)
      if (this.y < this.walkSPD){ // if going into north exit
        this.changeRoom("north");
      }
      else if (this.y > GRID_Y - 1 - this.walkSPD*2){ // if going to south exit
        this.changeRoom("south");
      }
    }
    // game does not error in case of west/east exits, so check them here
    if (this.x < 0){ // if going to west exit
      this.changeRoom("west");
    }
    else if (this.x > GRID_X - 1 - this.walkSPD){ // if going to east exit
      this.changeRoom("east");
    }
  }
  changeRoom(direction){
    // changes the player position based on which exit the player took
    if (direction === "north"){
      this.y = GRID_Y-1;
      this.roomY -= 1;
    }
    else if (direction === "south"){
      this.y = 0;
      this.roomY += 1;
    }
    else if (direction === "west"){
      this.x = GRID_X-1;
      this.roomX -= 1;
    }
    else if (direction === "east"){
      this.x = 0;
      this.roomX += 1;
    }
    // check to see if another room needs to be generated
    let roomNeedsGenerating = true;
    if (findRoom(this) !== null){
      roomNeedsGenerating = false;
    }
    if (roomNeedsGenerating){
      let newRoom = new Room(this.roomX, this.roomY, createEmptyRoom(), null, randomBiome("biome"), randomBiome("subbiome"), null);
      newRoom.addExits();
      rooms.push(newRoom);
    }
  }
  displayMenu(){
    if (state === "menu"){
      background(0);
    }
  }
  menuControls(theKey){
    if (state === "explore"){
      if (theKey === 69){ // e
        // opens menu so long as player is not attacking
        if (!this.isAttacking){
          state = "menu";
          this.isMoving = false;
          this.ableToMove = false;
        }
      }
    }
    else if (state === "menu"){
      if (theKey === 69){ // e
        state = "explore";
        player.ableToMove = true;
      }
    }
  }
}