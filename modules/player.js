// player settings
class Player {
  constructor(x,y,roomX,roomY){
    this.name = "LINK";
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
    this.direction = "south"; // direction player is facing in overworld
    this.roomX = roomX; // x value in relevance to room grid
    this.roomY = roomY; // y value in relevance to room grid
    this.menuButton = 0; // current button player is on in menu
    this.battleButton = 0; // current button player is on in battle
    this.enemyButton = 0; // current enemy player is targeting
    this.submenu = null; // current submenu player is in (if on one)
    this.battleMenu = "main",
    this.weaponInventory = [];
    this.shieldInventory = [];
    this.itemInventory = [];
    this.rupees = 0; // money player has
    this.triforceCount = 0; // triforce fragments player owns
    this.equippedWeapon1 = 0; // currently equipped weapon (index value in equipment table) - link can have 2 equipped at once, hence equippedWeapon2
    this.equippedWeapon2 = null; // refer to line directly above
    this.equippedSkill1 = [0,1]; // currently equipped skills with equippedWeapon1 in weapons table; works same for equippedSkill2 and equippedWeapon2
    this.equippedSkill2 = [null, null]; // refer to line directly above
    this.equippedShield = "Shield"; // currently equipped shield
    this.level = 1; // player's level
    this.exp = 0; // total experience points player has
    this.maxHP = 10; // highest health value player is allowed to have
    this.hp = this.maxHP; // health points player currently has
    this.atk = 1; // attack value during combat
    this.def = 1; // defense value during combat
    this.spd = 1; // speed value during combat
    this.evasion = 10; // evasion value during combat (chance to dodge enemy attacks, is a percentage value)
    this.luck = 5; // luck value during combat (chance to land critical hits, is a percentage value)
    this.statBoosts = { // extra stat boosts player can receive from equipment / level ups
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
      luck: 0,
    };
    this.isFading = null;
    this.currentlyFighting = [];
    this.currentAction = null;
    this.fightButtons = [];
    this.turnOrder = [];
    this.attackUsed = false;
    this.damageDealt = 0;
    this.inAttackAnimation = false;
    this.tempBoosts = []; // stat boosts activated during battle that dissipate when the battle ends
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
  overworldControls() {
    let addedPos = {x: 0, y: 0, xSign: 0, ySign: 0};
    this.walkSPD = this.walkSPDBase + this.walkSPDBoost; // reset total overworld speed
    if (state === "explore" && this.ableToMove && !this.isAttacking) {
      if (keyIsDown(87) || keyIsDown(38)) { // w or up arrow
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
    // checks if player moves into an enemy (initiates combat if so)
    // moves into a new room given if player left the room
    let currentRoom = findRoom(this);
  
    // check for enemy collisions
    for  (let i=0; i<currentRoom.enemies.length; i++){
      if (currentRoom.enemies[i].canMove){
        if (this.x + currentRoom.enemies[i].size[0] > currentRoom.enemies[i].x && this.x - currentRoom.enemies[i].size[0] < currentRoom.enemies[i].x){ // check x collision
          if (this.y + currentRoom.enemies[i].size[1] > currentRoom.enemies[i].y && this.y - currentRoom.enemies[i].size[1] < currentRoom.enemies[i].y){ // check y collision
          // put the enemy that was encountered in the currentlyFighting table
            this.currentlyFighting.push(i);
            // add 2 more enemies from the room to currentlyFighting should they exist
            let count = 1;
            for (let j=0; j<currentRoom.enemies.length; j++){
              if (j !== i && count < 3){
                this.currentlyFighting.push(j);
                count++;
              }
            }
            // start the battle
            this.isFading = "in";
            state = "battle";
            break;
          }
        }
      }
    }

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
  checkLevel(){// changes Link's stats to his current attributes
    let expToLevel = this.exp;
    for(let i=0; i<levels.length; i++){ 
      if (i===levels.length-1){
        this.level = levels.length;
        this.maxHP = levels[levels.length-1].maxHP;
        this.atk = levels[levels.length-1].atk;
        this.def = levels[levels.length-1].def;
        this.spd = levels[levels.length-1].spd;
        break;
      }
      else if (expToLevel - levels[i].exp < 0){
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
  }
  displayMenu(){
    if (state === "menu"){
      background(0);
      push();
      imageMode(CENTER);
      textAlign(CENTER, TOP);
      textSize(cellSize/2); // make text size based on cell size for scaling purposes
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
      textSize(cellSize/1.7);
      text(this.hp + "/" + this.maxHP, width/16 + width/25, height - width/16);
      text("x " + this.rupees, width/16 + width/2.5, height - width/16);
      text("x " + this.triforceCount, width/16 + width/1.5, height - width/16);
      textSize(cellSize/2);
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
        if (this.equippedWeapon1 !== null){
          image(imageAssets.get(equipment[this.equippedWeapon1].name), width/10, height*2.2/4, imageAssets.get(equipment[this.equippedWeapon1].name).width*4, imageAssets.get(equipment[this.equippedWeapon1].name).height*4);
        }
        if (this.equippedSkill1 !== null){
          if (this.equippedSkill1[0] !== null){
            text(equipment[this.equippedWeapon1].attacks[this.equippedSkill1[0]].name, width/4, height*2.05/4);
          }
          else {
            text("-----", width/4, height*2.05/4);
          }
          if (this.equippedSkill1[1]!== null){
            text(equipment[this.equippedWeapon1].attacks[this.equippedSkill1[1]].name, width/4, height*2.3/4);
          }
          else {
            text("-----", width/4, height*2.3/4);
          }
        }
        else{
          text("-----", width/4, height*2.05/4);
          text("-----", width/4, height*2.3/4);
        }
        if (this.equippedWeapon2 !== null){
          image(imageAssets.get(equipment[this.equippedWeapon2].name), width/10, height*2.8/4, imageAssets.get(equipment[this.equippedWeapon2].name).width*4, imageAssets.get(equipment[this.equippedWeapon2].name).height*4);
        }
        if (this.equippedSkill2 !== null){
          if (this.equippedSkill2[0] !== null){
            text(equipment[this.equippedWeapon2].attacks[this.equippedSkill2[0]].name, width/4, height*2.65/4);
          }
          else {
            text("-----", width/4, height*2.65/4);
          }
          if (this.equippedSkill2[1] !== null){
            text(equipment[this.equippedWeapon2].attacks[this.equippedSkill2[1]].name, width/4, height*2.9/4);
          }
          else {
            text("-----", width/4, height*2.9/4);
          }
        }
        else {
          text("-----", width/4, height*2.65/4);
          text("-----", width/4, height*2.9/4);
        }
      }
      else { // if any other button
        textAlign(CENTER, CENTER);
        text("NOT FINISHED", width/2, height/2);
      }
      pop();
    }
  }
  fadeIntoBattle(){
    if (this.isFading === "in" && currentFadeCount < fadeCount){ // if battle just started and is still fading into the battle
      background(255, 255, 255, currentFadeCount); // fade current screen to white
      currentFadeCount++;
      if (!sfxAssets.get("enter-battle").isPlaying()){
        sfxAssets.get("enter-battle").play();
      }
    }
    else{ // if fade is over, we can transition into battle
      this.isFading = null;
      currentFadeCount = 0;
      if (!bgmAssets.get("mass-destruction").isPlaying() && this.name === "MAKOTO"){
        bgmAssets.get("mass-destruction").loop();
      }
      else if (!bgmAssets.get("battle").isPlaying()){
        bgmAssets.get("battle").loop();
      }
    }
  }
  findTurnOrder(){
    let currentRoom = findRoom(this);
    // gather all action values and put into the turn order table
    // first the player
    this.turnOrder.push({id: "player", actionVal: 10000/this.spd});

    // now the enemies
    for (let enemyIndex of this.currentlyFighting){
      this.turnOrder.push({id: enemyIndex, actionVal: 10000/currentRoom.enemies[enemyIndex].baseStats.spd});
    }

    // find the turn order based on everyone's action value
    this.turnOrder.sort((a,b) => a.actionVal-b.actionVal);
  }
  battle(){
    let currentRoom = findRoom(this);

    // find the turn order should it not already exist
    if (this.turnOrder.length === 0){
      this.findTurnOrder();
    }

    // display the battle itself, starting with a background
    for (let i=2; i<GRID_Y-2; i++){
      for (let j=0; j<GRID_X; j++){
        if (j===0 || j===GRID_X-1){
          if (currentRoom.subbiome === "trees"){
            image(imageAssets.get("tiles-overworld-"+currentRoom.biome)[3][1], cellSize*j, cellSize*i, cellSize, cellSize);
          }
          else if (currentRoom.subbiome === "rocks"){
            image(imageAssets.get("tiles-overworld-"+currentRoom.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
          }
        }
        else{
          image(imageAssets.get("tiles-overworld-"+currentRoom.biome)[0][2], cellSize*j, cellSize*i, cellSize, cellSize);
        }
      }
    }
    push();

    // now the black border
    rectMode(CORNER);
    fill("black");
    rect(0,0,width,cellSize*2); // top black rectangle
    rect(0, height - cellSize*2,width, height); // bottom black rectangle

    // now the player health meter
    textAlign(LEFT, CENTER);
    textSize(cellSize/1.7);
    fill("white");
    text(this.hp + "/" + this.maxHP, width/6.25, width/16); // hp for player
    imageMode(CENTER);
    image(imageAssets.get("link-south-moving"), width/16, width/16, cellSize, cellSize); // display player in health area
    image(imageAssets.get("heart"), width/8, width/16, cellSize/1.9, cellSize/1.9); // display heart

    // now displaying who's turn it is next
    textAlign(RIGHT, CENTER);
    text("NEXT:", width - width/10, width/16);
    if (this.turnOrder[0].id === "player" && this.turnOrder[0].actionVal < this.turnOrder[1].actionVal - this.turnOrder[0].actionVal){
      // if it is currently the player's turn and the player is fast enough to get another turn afterward
      image(imageAssets.get("link-south-moving"), width - width/16, width/16, cellSize, cellSize);
    }
    else if (this.turnOrder[1].id === "player"){
      image(imageAssets.get("link-south-moving"), width - width/16, width/16, cellSize, cellSize);
    }
    else{
      let theEnemy = currentRoom.enemies[this.turnOrder[1].id];
      let theImage;
      if (theEnemy.name === "Leever"){
        theImage = imageAssets.get(theEnemy.name.toLowerCase()+"-"+theEnemy.color);
      }
      else if (theEnemy.diffColor){
        theImage = imageAssets.get(theEnemy.name.toLowerCase()+"-"+theEnemy.color+"-west");
      }
      else{
        theImage = imageAssets.get(theEnemy.name.toLowerCase()+"-south");
      }
      image(theImage, width - width/16, width/16, cellSize*theEnemy.size[0], cellSize*theEnemy.size[1]);
    }

    // now bottom (can be buttons or dialogue)
    textAlign(CENTER, TOP);
    textSize(cellSize/2);

    // check dialogue first, then menus
    if (this.currentAction === "run"){
      textAlign(LEFT, TOP);
      text("GOT AWAY!", width/16, height-height/7.5);
    }
    else if (this.currentAction === "fight"){
      textAlign(LEFT, TOP);
      //find the skill used
      let theSkill;
      if (this.battleButton === 0 || this.battleButton === 1){
        theSkill = equipment[this.equippedWeapon1].attacks[this.equippedSkill1[this.fightButtons[this.battleButton]]];
      }
      else{
        theSkill = equipment[this.equippedWeapon2].attacks[this.equippedSkill2[this.fightButtons[this.battleButton]]];
      }
      
      // deal damage
      if (!this.attackUsed){
        this.damageDealt = ceil(theSkill.baseDMG / (currentRoom.enemies[this.currentlyFighting[this.enemyButton]].baseStats.def * 4) * (this.atk/2));
        console.log(this.damageDealt + " damage was dealt.");
        currentRoom.enemies[this.currentlyFighting[this.enemyButton]].hp -= this.damageDealt;
        this.attackUsed = true;
      }
      text(player.name + " used " + theSkill.name + "!", width/16, height-height/7.5);

      // display damage dealt below enemy
      if (this.enemyButton===0){
        text(this.damageDealt, width*2/3, height/2 + height/16);
      }
      else if (this.enemyButton===1){
        text(this.damageDealt, width*2.3/3, height/2.75 + height/16);
      }
      else if (this.enemyButton===2){
        text(this.damageDealt, width*2.6/3, height/1.65 + height/16);
      }
    }
    else if (this.turnOrder[0].id === "player" && this.battleMenu === "main"){
      for(let i=0; i<battleButtons.length; i++){
        text(battleButtons[i], width/battleButtons.length*i + width/battleButtons.length/2, height-height/7.5);
        if (i === this.battleButton){
          image(imageAssets.get("triforce"), width/battleButtons.length*i + width/battleButtons.length/2, height-height/18, width/25, width/25);
        }
      }
    }
    else if (this.turnOrder[0].id === "player" && this.battleMenu === "fight"){
      this.fightButtons = [this.equippedSkill1[0], this.equippedSkill1[1], this.equippedSkill2[0], this.equippedSkill2[1]];
      for(let i=0; i<this.fightButtons.length; i++){
        if (this.fightButtons[i] !== null){
          if (i===0 || i===1){ // if part of equippedSkill1
            text(equipment[this.equippedWeapon1].attacks[this.equippedSkill1[this.fightButtons[i]]].name, width/this.fightButtons.length*i + width/this.fightButtons.length/2, height-height/7.5);
          }
          else{
            text(equipment[this.equippedWeapon2].attacks[this.equippedSkill2[this.fightButtons[i]]].name, width/this.fightButtons.length*i + width/this.fightButtons.length/2, height-height/7.5);
          }
        }
        else{
          text("-----", width/this.fightButtons.length*i + width/this.fightButtons.length/2, height-height/7.5);
        }
        if (i === this.battleButton){
          image(imageAssets.get("triforce"), width/this.fightButtons.length*i + width/this.fightButtons.length/2, height-height/18, width/25, width/25);
        }
      }
    }
    else if (this.turnOrder[0].id === "player" && this.battleMenu === "enemy"){
      let theImage = imageAssets.get("triforce");
      if (this.enemyButton===0){
        image(theImage, width*2/3, height - height/4, width/25, width/25);
      }
      else if (this.enemyButton===1){
        image(theImage, width*2.3/3, height - height/4, width/25, width/25);
      }
      else if (this.enemyButton===2){
        image(theImage, width*2.6/3, height - height/4, width/25, width/25);
      }
      textAlign(LEFT, TOP);
      text("Use on " + currentRoom.enemies[this.currentlyFighting[this.enemyButton]].name + "?", width/16, height-height/7.5);
    }

    // display player in battle visual
    image(imageAssets.get("link-east-idle"), width/4, height/2, cellSize, cellSize); 

    //display enemies in battle visual
    for (let i=0; i<this.currentlyFighting.length; i++){
      let theEnemy = currentRoom.enemies[this.currentlyFighting[i]];
      let theImage;
      if (theEnemy.name === "Leever"){
        theImage = imageAssets.get(theEnemy.name.toLowerCase()+"-"+theEnemy.color);
      }
      else if (theEnemy.diffColor){
        theImage = imageAssets.get(theEnemy.name.toLowerCase()+"-"+theEnemy.color+"-west");
      }
      else{
        if (theEnemy.movementType === "armos"){
          theImage = imageAssets.get(theEnemy.name.toLowerCase()+"-south");
        }
        else {
          theImage = imageAssets.get(theEnemy.name.toLowerCase()+"-west");
        }
      }
      if (i===0){
        image(theImage, width*2/3, height/2, cellSize*theEnemy.size[0], cellSize*theEnemy.size[1]);
      }
      else if (i===1){
        image(theImage, width*2.3/3, height/2.75, cellSize*theEnemy.size[0], cellSize*theEnemy.size[1]);
      }
      else if (i===2){
        image(theImage, width*2.6/3, height/1.65, cellSize*theEnemy.size[0], cellSize*theEnemy.size[1]);
      }
    }

    pop();
  }
  fadeOutOfBattle(){
    let currentRoom = findRoom(this);
    if (this.isFading === "out" && currentFadeCount < fadeCount){ // if battle just started and is still fading into the battle
      background(0, 0, 0, currentFadeCount); // fade current screen to black
      currentFadeCount++;
    }
    else{ // if fade is over, we can leave the battle
      // reset fade
      currentFadeCount = 0;

      // make enemies that were in the battle unable to move / initiate combat for 5 seconds
      for (let i=0; i<currentRoom.enemies.length; i++){
        for (let enemy of this.currentlyFighting){
          if (i === enemy){
            currentRoom.enemies[i].canMove = false;
            currentRoom.enemies[i].lastMovement = millis();
          }
        }
      }

      // reset variables to how they were before the battle
      this.isFading = null;
      this.currentlyFighting = [];
      this.turnOrder = [];
      this.currentAction = null;
      this.battleButton = 0;
      this.enemyButton = 0;
      bgmAssets.get("battle").stop();
      bgmAssets.get("mass-destruction").stop();
      bgmAssets.get("overworld").loop();
      state = "explore";
    }
  }
  menuControls(theKey){
    if (state === "explore"){
      if (theKey === 32 && !this.isAttacking){ // space bar
        // attack
        // I know it sounds wrong that I put attacking in the menu controls, but this way it only activates once per space bar hit
        this.isMoving = false;
        this.isAttacking = true;
        this.attackTime = millis();
      }
      else if (theKey === 69){ // e
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
    else if (state === "battle"){
      if (theKey === 32){ // space bar
        // enters section of menu or passes through dialogue

        // check dialogue first
        if (this.currentAction === "run"){
          this.isFading = "out";
          this.fadeOutOfBattle();
        }

        // now buttons, if it is the player's turn
        if (this.turnOrder[0].id === "player"){
          if (this.battleMenu === "main" && battleButtons[this.battleButton] === "FIGHT"){
            this.battleMenu = "fight";
            this.battleButton = 0;
          }
          else if (this.battleMenu === "main" && battleButtons[this.battleButton] === "RUN"){
            this.currentAction = "run";
          }
          else if (this.battleMenu === "fight"){
            if (this.battleButton === 0 || this.battleButton === 1){
              if (this.equippedWeapon1 !== null && this.equippedSkill1[this.fightButtons[this.battleButton]] !== null){
                this.battleMenu = "enemy";
              }
            }
            else {
              if (this.equippedWeapon2 !== null && this.equippedSkill2[this.fightButtons[this.battleButton]] !== null){
                this.battleMenu = "enemy";
              }
            }
          }
          else if (this.battleMenu === "enemy"){
            this.currentAction = "fight";
          }
        }
      }
      else if (theKey === 8 || theKey === 27){ // backspace or escape
        // exits current menu
        if (this.turnOrder[0].id === "player"){
          if (this.battleMenu === "fight"){
            this.battleMenu = "main";
            this.battleButton = 0;
          }
          else if (this.battleMenu === "enemy"){
            this.battleMenu = "fight";
          }
        }
      }
      else if (theKey === 65 || theKey === 37) {// a or left arrow
        // moves cursor left
        if (this.battleMenu === "enemy"){
          if (this.enemyButton === 0){
            this.enemyButton = this.currentlyFighting.length-1;
          }
          else{
            this.enemyButton--;
          }
        }
        else{
          if (this.battleButton === 0){
            this.battleButton = battleButtons.length-1;
          }
          else{
            this.battleButton--;
          }
        }
      } 
      else if (theKey === 68 || theKey === 39) { // d or right arrow
        // moves cursor right
        if (this.battleMenu === "enemy"){
          if (this.enemyButton === this.currentlyFighting.length-1){
            this.enemyButton = 0;
          }
          else{
            this.enemyButton++;
          }
        }
        else{
          if (this.battleButton === battleButtons.length-1){
            this.battleButton = 0;
          }
          else{
            this.battleButton++;
          }
        }
      }
    }
  }
}