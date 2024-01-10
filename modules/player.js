// player settings
class Player {
  constructor(x,y,roomX,roomY){
    this.name = "Link";
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
    this.menuButton = 0; // current button player is on in menu
    this.submenu = null; // current submenu player is in (if on one)
    this.weaponInventory = [];
    this.shieldInventory = [];
    this.itemInventory = [];
    this.rupees = 0; // money player has
    this.triforceCount = 0; // triforce fragments player owns
    this.equippedWeapon1 = 0; // currently equipped weapon (index value in equipment table) - link can have 2 equipped at once, hence equippedWeapon2
    this.equippedWeapon2 = 1; // refer to line directly above
    this.equippedSkill1 = [0,1]; // currently equipped skills with equippedWeapon1 in weapons table; works same for equippedSkill2 and equippedWeapon2
    this.equippedSkill2 = [0,1]; // refer to line directly above
    this.equippedShield = "Shield"; // currently equipped shield
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
        addedPos.y -= this.walkSPD;
        addedPos.ySign = -0.5;
        this.direction = "north";
        this.isMoving = true;
      } 
      else if (keyIsDown(83) || keyIsDown(40)) { // s or down arrow
        // move player down
        addedPos.y += this.walkSPD;
        addedPos.ySign = 0.5;
        this.direction = "south";
        this.isMoving = true;
      } 
      else if (keyIsDown(65) || keyIsDown(37)) {// a or left arrow
        // move player left
        addedPos.x -= this.walkSPD;
        addedPos.xSign = -0.5;
        this.direction = "west";
        this.isMoving = true;
      } 
      else if (keyIsDown(68) || keyIsDown(39)) { // d or right arrow
        // move player right
        addedPos.x += this.walkSPD;
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
      newRoom.addEnemies();
      rooms.push(newRoom);
    }
  }
  displayMenu(){
    if (state === "menu"){
      background(0);
      push();
      imageMode(CENTER);
      textAlign(CENTER, TOP);
      textSize(30);
      for(let i=0; i<menuButtons.length; i++){
        text(menuButtons[i], width/menuButtons.length*i + width/menuButtons.length/2, height/50);
        if (i === this.menuButton){
          image(imageAssets.get("triforce"), width/menuButtons.length*i + width/menuButtons.length/2, height/9, width/25, width/25);
        }
      }
      image(imageAssets.get("heart"), width/16, height - width/16, width/25, width/25);
      image(imageAssets.get("rupee"), width/16 + width/2.75, height - width/16, width/45, width/25);
      image(imageAssets.get("triforce"), width/16 + width/1.6, height - width/16, width/25, width/25);
      textAlign(LEFT, CENTER);
      textSize(35);
      text(this.hp + "/" + this.maxHP, width/16 + width/25, height - width/16);
      text("x " + this.rupees, width/16 + width/2.5, height - width/16);
      text("x " + this.triforceCount, width/16 + width/1.5, height - width/16);
      textSize(30);
      if (this.menuButton === 0){ // stat screen
        image(imageAssets.get("link-south-moving"), width/4, height*1.15/4, width/8, width/8);
        textAlign(CENTER, CENTER);
        text(this.name, width/4, height*1.65/4);
        let expToLevel = this.exp;
        let nextLevel;
        for(let i=0; i<levels.length; i++){ // find exp required to get to next level and how much progress has been made already
          if (i===levels.length-1){
            nextLevel = levels[levels.length-1].exp;
            this.level = levels.length;
            this.maxHP = levels[levels.length-1].maxHP;
            this.atk = levels[levels.length-1].atk;
            this.def = levels[levels.length-1].def;
            this.spd = levels[levels.length-1].spd;
            break;
          }
          else if (expToLevel - levels[i].exp < 0){
            nextLevel = levels[i].exp;
            break;
          }
          else {
            expToLevel-=levels[i].exp;
            this.level = i+1;
            this.maxHP = levels[i].maxHP;
            this.atk = levels[i].atk;
            this.def = levels[i].def;
            this.spd = levels[i].spd;
          }
        }
        text("LEVEL: " + this.level, width*3/5, height*0.9/4);
        if (this.level === levels.length){
          text("EXP: " + nextLevel + "/" + nextLevel, width*3/5, height*1.15/4);
        }
        else{
          text("EXP: " + expToLevel + "/" + nextLevel, width*3/5, height*1.15/4);
        }
        text("ATK: " + this.atk, width*3/5, height*1.4/4);
        text("DEF: " + this.def, width*3/5, height*1.65/4);
        text("SPD: " + this.spd, width*3/5, height*1.9/4);
        text("EVASION: " + this.evasion, width*3/5, height*2.15/4);
        text("LUCK: " + this.luck, width*3/5, height*2.4/4);
        image(imageAssets.get(equipment[this.equippedWeapon1].name), width/10, height*2.2/4, imageAssets.get(equipment[this.equippedWeapon1].name).width*4, imageAssets.get(equipment[this.equippedWeapon1].name).height*4);
        text(equipment[this.equippedWeapon1].attacks[this.equippedSkill1[0]].name, width/4, height*2.05/4);
        text(equipment[this.equippedWeapon1].attacks[this.equippedSkill1[1]].name, width/4, height*2.3/4);
        image(imageAssets.get(equipment[this.equippedWeapon2].name), width/10, height*2.8/4, imageAssets.get(equipment[this.equippedWeapon2].name).width*4, imageAssets.get(equipment[this.equippedWeapon2].name).height*4);
        text(equipment[this.equippedWeapon2].attacks[this.equippedSkill2[0]].name, width/4, height*2.65/4);
        text(equipment[this.equippedWeapon2].attacks[this.equippedSkill2[1]].name, width/4, height*2.9/4);
      }
      else { // if any other button
        textAlign(CENTER, CENTER);
        text("NOT FINISHED", width/2, height/2);
      }
      pop();
    }
  }
  menuControls(theKey){
    if (state === "explore"){
      if (theKey === 69){ // e
        // opens menu so long as player is not attacking
        if (!this.isAttacking){
          state = "menu";
          this.menuButton = 0;
          this.isMoving = false;
          this.ableToMove = false;
        }
      }
    }
    else if (state === "menu"){
      if (theKey === 69){ // e
        // exits menu
        state = "explore";
        player.ableToMove = true;
      }
      else if (theKey === 32){ // space bar
        // enters section of menu
        
      }
      else if (theKey === 87 || theKey === 38) { // w or up arrow
        // moves cursor up in submenus only
      } 
      else if (theKey === 83 || theKey === 40) { // s or down arrow
        // moves cursor down in submenus only
      } 
      else if (theKey === 65 || theKey === 37) {// a or left arrow
        // moves cursor left in main menu only
        if (this.menuButton === 0){
          this.menuButton = menuButtons.length-1;
        }
        else{
          this.menuButton--;
        }
      } 
      else if (theKey === 68 || theKey === 39) { // d or right arrow
        // moves cursor right in main menu only
        if (this.menuButton === menuButtons.length-1){
          this.menuButton = 0;
        }
        else{
          this.menuButton++;
        }
      }
    }
  }
}