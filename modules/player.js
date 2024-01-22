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
    this.submenu = null; // current submenu player is in (if on one)
    this.battleButton = 0; // current button player is on in battle
    this.enemyButton = 0; // current enemy player is targeting
    this.enemyButtonOptions = []; // table of enemy battle positions
    this.itemButton = 0;
    this.deathButton = 0;
    this.battleMenu = "main", // current menu the player is in during battle
    this.weaponInventory = [0]; // all weapons in inventory: values are index
    this.itemInventory = [{id: 0, have: 3}]; // all items in inventory
    this.rupees = 0; // money player has
    this.triforceCount = 0; // triforce fragments player owns
    this.equippedWeapon1 = 0; // currently equipped weapon (index value in weapon inventory table) - link can have 2 equipped at once, hence equippedWeapon2
    this.equippedWeapon2 = null; // refer to line directly above
    this.equippedSkill1 = [0,1]; // currently equipped skills with equippedWeapon1 in weapons table; works same for equippedSkill2 and equippedWeapon2
    this.equippedSkill2 = [null, null]; // refer to line directly above
    this.level = 1; // player's level
    this.exp = 0; // total experience points player has
    this.maxHP = 10; // highest health value player is allowed to have
    this.hp = this.maxHP; // health points player currently has
    this.atk = 1; // attack value during combat
    this.def = 1; // defense value during combat
    this.spd = 1; // speed value during combat
    this.evasion = 10; // evasion value during combat (chance to dodge enemy attacks, is a percentage value) (UNUSED)
    this.luck = 5; // luck value during combat (chance to land critical hits, is a percentage value) (UNUSED)
    this.statBoosts = { // stat boosts activated during battle (acts like a multiplier)
      atk: 1,
      def: 1,
      spd: 1,
      evasion: 1,
      luck: 1,
    };
    this.isFading = null; // variable for if the player is entering/exiting a battle: null if not fading
    this.currentlyFighting = []; // list of enemies in battle
    this.currentAction = null; // what is currently going on (dialogue, like enemyTurn for "Armos used BASH!") (null if on a menu)
    this.fightButtons = []; // table of buttons, is a list of player's skills
    this.turnOrder = []; // the turn order of the battle; turnOrder[0] is whoever currently has their turn
    this.attackUsed = false; // boolean for whether or not an attack has been used (can be player or enemy, depends on current turn)
    this.guarding = false; // boolean for if Link is guarding
    this.itemUsed = false; // boolean for if Link has used an item
    this.lastSkill = null; // last used player skill, changes anytime player uses said skill
    this.damageDealt = 0; // damage last dealt to something (can be player or enemy)
    this.enemySkill = null; // last used enemy skill
    this.deadEnemyPos = []; // table of positions of dead enemies with the time they died
    this.deathTime = null; // time in millis() that Link died
    this.deathSpin = 0; // total times Link has spun in death animation
    this.deathSpinLimit = 17; // amount of times Link spins in death animation
    this.accumulatedEXP = 0; // exp accumulated from killing enemies
    this.accumulatedRupees = 0; // rupees accumulated from killing enemies
    this.accumulatedHearts = 0; // hearts accumulated from killing enemies (percentage * 10, 1=10%)
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
            currentRoom.enemies[i].battlePos = 0;
            this.enemyButtonOptions.push(0);
            // add 2 more enemies from the room to currentlyFighting should they exist
            let count = 1;
            for (let j=0; j<currentRoom.enemies.length; j++){
              if (j !== i && count < 3){
                this.currentlyFighting.push(j);
                currentRoom.enemies[j].battlePos = count;
                this.enemyButtonOptions.push(count);
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

    if (this.currentAction === null && this.turnOrder[0].id !== "player"){
      this.currentAction = "enemyTurn";
      this.attackUsed = false;
    }
  }
  battle(){
    let currentRoom = findRoom(this);

    // find the turn order should it not already exist
    if (this.turnOrder.length === 0){
      this.findTurnOrder();
    }

    // if the battle is won, set to results screen
    if (this.currentlyFighting.length === 0){
      this.currentAction = "results";
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

    // now displaying who's turn it is next, if battle is not won yet
    textAlign(RIGHT, CENTER);
    if (this.currentAction !== "results"){
      text("NEXT:", width - width/10, width/16);
      if (this.turnOrder[0].id === "player" && 10000/this.spd < this.turnOrder[1].actionVal - this.turnOrder[0].actionVal){
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
      let targetedEnemy;
      if (this.battleButton === 0 || this.battleButton === 1){
        theSkill = equipment[this.equippedWeapon1].attacks[this.equippedSkill1[this.fightButtons[this.battleButton]]];
      }
      else{
        theSkill = equipment[this.equippedWeapon2].attacks[this.equippedSkill2[this.fightButtons[this.battleButton]]];
      }
      
      // deal damage
      if (!this.attackUsed){
        for(let theEnemy of this.currentlyFighting){
          if (this.enemyButtonOptions[this.enemyButton] === currentRoom.enemies[theEnemy].battlePos){
            targetedEnemy = currentRoom.enemies[theEnemy];
            if (theSkill.atkAff === "hit"){
              if (this.statBoosts.atk <= 0){
                this.statBoosts.atk = 0.1;
              }
              if (targetedEnemy.statBoosts.def <= 0){
                targetedEnemy.statBoosts.def = 0.1;
              }
              this.damageDealt = ceil(theSkill.baseDMG / (targetedEnemy.baseStats.def * targetedEnemy.statBoosts.def*4) * (this.atk/2 * this.statBoosts.atk));
              console.log(this.damageDealt + " damage was dealt.");
              targetedEnemy.hp -= this.damageDealt;
              sfxAssets.get("hit-enemy").play();
            }
            else if (theSkill.atkAff === "support"){
              if (theSkill.atkType === "buff"){
                if (theSkill.buffType === "atk"){
                  this.statBoosts.atk += theSkill.buffMultiplier;
                }
                else if (theSkill.buffType === "def"){
                  this.statBoosts.def += theSkill.buffMultiplier;
                }
                else if (theSkill.buffType === "spd"){
                  this.statBoosts.spd += theSkill.buffMultiplier;
                }
              }
              else if (theSkill.atkType === "debuff"){
                if (theSkill.buffType === "atk"){
                  targetedEnemy.statBoosts.atk += theSkill.buffMultiplier;
                }
                else if (theSkill.buffType === "def"){
                  targetedEnemy.statBoosts.def += theSkill.buffMultiplier;
                }
                else if (theSkill.buffType === "spd"){
                  targetedEnemy.statBoosts.spd += thetheSkill.buffMultiplier;
                }
              }
              sfxAssets.get("fire-buff").play();
            }
          }
        }
        this.attackUsed = true;
      }
      if (theSkill.atkAff === "hit"){
        text(player.name + " used " + theSkill.name + "!", width/16, height-height/7.5);
      }
      else if (theAttack.atkAff === "support"){
        if (theAttack.atkType === "buff"){
          text(this.name + " used " + theSkill.name + "!", width/16, height-height/7.5);
          text(this.name + "'s " + theSkill.buffType.toUpperCase() + " raised!", width/16, height-height/12);
        }
        else if (theAttack.atkType === "debuff"){
          text(this.name + " used " + theSkill.name + "!", width/16, height-height/7.5);
          text(targetedEnemy.name + "'s " + theSkill.buffType.toUpperCase() + " fell!", width/16, height-height/12);
        }
      }
      
      this.lastSkill = theSkill;

      // display damage dealt below enemy
      if (this.enemyButtonOptions[this.enemyButton]===0){
        text(this.damageDealt, width*2/3, height/2 + height/16);
      }
      else if (this.enemyButtonOptions[this.enemyButton]===1){
        text(this.damageDealt, width*2.3/3, height/2.75 + height/16);
      }
      else if (this.enemyButtonOptions[this.enemyButton]===2){
        text(this.damageDealt, width*2.6/3, height/1.65 + height/16);
      }
    }
    else if (this.currentAction === "enemyTurn"){
      textAlign(LEFT, TOP);
      // deal damage to player
      let theEnemy = currentRoom.enemies[this.turnOrder[0].id];
      let theAttack;

      // pick a move to use depending on enemy behavior, if a move hasn't already been picked
      if (this.enemySkill === null){
        if (theEnemy.behavior === "lazy"){
          theAttack = round(random(0,theEnemy.attacks.length-1));
        }
        else if (theEnemy.behavior === "crafty"){
          if (theEnemy.lastAttack === null || theEnemy.attacks.length === 1){
            theAttack = round(random(0,theEnemy.attacks.length-1));
          }
          else{
            theAttack = round(random(0,theEnemy.attacks.length-1));
            while (theEnemy.attacks[theAttack] === theEnemy.lastAttack){
              theAttack = round(random(0,theEnemy.attacks.length-1));
            }
          }
        }
        else if (theEnemy.behavior === "smart"){
          if (theEnemy.tacticMove !== undefined && theEnemy.tacticMove !== null && theEnemy.tacticMove + 1 < theEnemy.tactic.length){
            theEnemy.tacticMove++;
            theAttack = theEnemy.tactic[theEnemy.tacticMove];
          }
          else{
            let randomMove = random(0,100);
            if (randomMove < 50){
            // pick a random move that isn't part of a tactic
              theAttack = round(random(0,theEnemy.attacks.length-1));
              let notTactic = false;
              while (!notTactic){
                let alreadyTaken = false;
                for (let aMove of theEnemy.tactic){
                  if (aMove === theAttack){
                    alreadyTaken = true;
                  }
                }
                if (!alreadyTaken){
                  notTactic = true;
                }
                else{
                  theAttack = round(random(0,theEnemy.attacks.length-1));
                }
              }
            }
            else{ // if hit the 50% chance
              theEnemy.tacticMove = 0;
              theAttack = theEnemy.tactic[theEnemy.tacticMove];
            }
          }
        }
        theAttack = theEnemy.attacks[theAttack];
      }
      else{
        theAttack = this.enemySkill;
      }

      this.enemySkill = theAttack;

      // use the move
      if (!this.attackUsed){
        if (theAttack.atkAff === "hit"){
          if (theEnemy.statBoosts.atk <= 0){
            theEnemy.statBoosts.atk = 0.1;
          }
          if (this.statBoosts.def <= 0){
            this.statBoosts.def = 0.1;
          }
          this.damageDealt = ceil(theAttack.baseDMG / (this.def * this.statBoosts.def*4) * (theEnemy.baseStats.atk/2 * theEnemy.statBoosts.atk));
          console.log(this.damageDealt + " damage was taken.");
          this.hp -= this.damageDealt;
          if (this.hp < 0){
            this.hp = 0;
          }
          if (this.guarding){
            sfxAssets.get("guarded-hit").play();
          }
          else{
            sfxAssets.get("hit-player").play();
          }
        }
        else if (theAttack.atkAff === "support"){
          if (theAttack.atkType === "buff"){
            if (theAttack.buffType === "atk"){
              theEnemy.statBoosts.atk += theAttack.buffMultiplier;
            }
            else if (theAttack.buffType === "def"){
              theEnemy.statBoosts.def += theAttack.buffMultiplier;
            }
            else if (theAttack.buffType === "spd"){
              theEnemy.statBoosts.spd += theAttack.buffMultiplier;
            }
          }
          else if (theAttack.atkType === "debuff"){
            if (theAttack.buffType === "atk"){
              this.statBoosts.atk -= theAttack.buffMultiplier;
            }
            else if (theAttack.buffType === "def"){
              this.statBoosts.def -= theAttack.buffMultiplier;
            }
            else if (theAttack.buffType === "spd"){
              this.statBoosts.spd -= theAttack.buffMultiplier;
            }
          }
          sfxAssets.get("fire-buff").play();
        }
        this.attackUsed = true;
      }
      if (theAttack.atkAff === "hit"){
        text(theEnemy.name + " used " + theAttack.name + "!", width/16, height-height/7.5);
        text(this.damageDealt, width/4, height/2 + height/16);
      }
      else if (theAttack.atkAff === "support"){
        if (theAttack.atkType === "buff"){
          text(theEnemy.name + " used " + theAttack.name + "!", width/16, height-height/7.5);
          text(theEnemy.name + "'s " + theAttack.buffType.toUpperCase() + " raised!", width/16, height-height/12);
        }
        else if (theAttack.atkType === "debuff"){
          text(theEnemy.name + " used " + theAttack.name + "!", width/16, height-height/7.5);
          text(this.name + "'s " + theAttack.buffType.toUpperCase() + " fell!", width/16, height-height/12);
        }
      }
    }
    else if (this.currentAction === "guard"){
      textAlign(LEFT, TOP);
      if (!this.guarding){
        this.guarding = true;
        this.statBoosts.def += 1.5;
      }
      text(this.name + " started guarding!", width/16, height-height/7.5);
    }
    else if (this.currentAction === "item"){
      textAlign(LEFT, TOP);
      if (!this.itemUsed){
        this.itemUsed = true;
        if (items[this.itemInventory[this.itemButton].id].name === "Life Potion"){
          this.hp = this.maxHP;
        }
        this.itemInventory[this.itemButton].have--;
      }
      text(this.name + " used a " + items[this.itemInventory[this.itemButton].id].name + "!", width/16, height-height/7.5);
    }
    else if (this.currentAction === "results"){
      if (!bgmAssets.get("victory").isPlaying() && this.currentlyFighting.length === 0){
        bgmAssets.get("battle").stop();
        bgmAssets.get("mass-destruction").stop();
        bgmAssets.get("victory").loop();
      }
      textAlign(LEFT, TOP);
      text("Earned " + this.accumulatedEXP + " EXP and " + this.accumulatedRupees + " Rupees.", width/16, height-height/7.5);
      text("Received " + round(this.maxHP * (this.accumulatedHearts/10)) + " hearts.", width/16, height-height/12);
    }

    //buttons
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
      for(let theEnemy of this.currentlyFighting){
        if (this.enemyButtonOptions[this.enemyButton] === currentRoom.enemies[theEnemy].battlePos){
          if (currentRoom.enemies[theEnemy].battlePos===0){
            image(theImage, width*2/3, height/2 + height/8, width/25, width/25);
          }
          else if (currentRoom.enemies[theEnemy].battlePos===1){
            image(theImage, width*2.3/3, height/2.75 + height/8, width/25, width/25);
          }
          else if (currentRoom.enemies[theEnemy].battlePos===2){
            image(theImage, width*2.6/3, height/1.65 + height/8, width/25, width/25);
          }
          textAlign(LEFT, TOP);
          text("Use on " + currentRoom.enemies[theEnemy].name + "?", width/16, height-height/7.5);
        }
      }
    }
    else if (this.turnOrder[0].id === "player" && this.battleMenu === "item"){
      for(let i=0; i<this.itemInventory.length; i++){
        text(items[this.itemInventory[i].id].name+": "+this.itemInventory[i].have, width/this.itemInventory.length*i + width/this.itemInventory.length/2, height-height/7.5);
        if (i === this.itemButton){
          image(imageAssets.get("triforce"), width/this.itemInventory.length*i + width/this.itemInventory.length/2, height-height/18, width/25, width/25);
        }
      }
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

      // draw the enemy
      if (theEnemy.battlePos===0){
        image(theImage, width*2/3, height/2, cellSize*theEnemy.size[0], cellSize*theEnemy.size[1]);
      }
      else if (theEnemy.battlePos===1){
        image(theImage, width*2.3/3, height/2.75, cellSize*theEnemy.size[0], cellSize*theEnemy.size[1]);
      }
      else if (theEnemy.battlePos===2){
        image(theImage, width*2.6/3, height/1.65, cellSize*theEnemy.size[0], cellSize*theEnemy.size[1]);
      }
    }

    // display dead enemies
    for (let i=0; i<this.deadEnemyPos.length; i++){
      let theImage = imageAssets.get("cloud");
      let deadEnemy = this.deadEnemyPos[i];
      if (deadEnemy.time + 1600 > millis()){
        if (deadEnemy.pos===0){
          image(theImage, width*2/3, height/2, cellSize, cellSize);
        }
        else if (deadEnemy.pos===1){
          image(theImage, width*2.3/3, height/2.75, cellSize, cellSize);
        }
        else if (deadEnemy.pos===2){
          image(theImage, width*2.6/3, height/1.65, cellSize, cellSize);
        }
      }
      else {
        this.deadEnemyPos.splice(i,1);
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
            currentRoom.enemies[i].battlePos = null;

            // reset all stat boosts on enemies
            currentRoom.enemies[i].statBoosts = {
              atk: 1,
              def: 1,
              spd: 1,
              evasion: 1,
              luck: 1,
            };
          }
        }
      }

      // give player rewards for winning the battle
      this.exp += this.accumulatedEXP;
      this.rupees += this.accumulatedRupees;
      this.hp += round(this.maxHP * (this.accumulatedHearts/10));
      if (this.hp > this.maxHP){
        this.hp = this.maxHP;
      }

      // reset variables to how they were before the battle
      this.accumulatedEXP = 0;
      this.accumulatedRupees = 0;
      this.accumulatedHearts = 0;
      this.isFading = null;
      this.currentlyFighting = [];
      this.enemyButtonOptions = [];
      this.turnOrder = [];
      this.currentAction = null;
      this.battleButton = 0;
      this.enemyButton = 0;
      this.deadEnemyPos = [];
      this.lastAttack = null;
      this.enemySkill = null;
      this.statBoosts = {
        atk: 1,
        def: 1,
        spd: 1,
        evasion: 1,
        luck: 1,
      };
      bgmAssets.get("battle").stop();
      bgmAssets.get("mass-destruction").stop();
      bgmAssets.get("victory").stop();
      bgmAssets.get("overworld").loop();
      state = "explore";
    }
  }
  defeat(){
    push();
    background("red");
    rectMode(CORNER);
    fill("black");
    imageMode(CENTER);
    rect(0,0,width,cellSize*2); // top black rectangle
    rect(0, height - cellSize*2,width, height); // bottom black rectangle
    
    // depending on how long it's been since Link died, do certain things
    // spinning Link
    
    if (this.deathSpin >= this.deathSpinLimit){
      background("black");
      if (this.deathTime + 100*(this.deathSpin+12) < millis()){
        state = "game-over";
      }
    }
    else if (this.deathTime + 100*this.deathSpin < millis()){
      this.spin();
      this.deathSpin++;
    }

    // display link
    
    image(imageAssets.get("link-" + this.direction + "-idle"), width/4, height/2, cellSize, cellSize);
    if (this.deathTime + 100*(this.deathSpin+3) < millis()){
      background("black");
    }
    pop();
  }
  spin(){
    if (this.direction === "north"){
      this.direction = "east";
    }
    else if (this.direction === "east"){
      this.direction = "south";
    }
    else if (this.direction === "south"){
      this.direction = "west";
    }
    else if (this.direction === "west"){
      this.direction = "north";
    }
  }
  gameOverMenu(){
    this.deathSpin = 0;
    push();
    if (!bgmAssets.get("game-over").isPlaying()){
      bgmAssets.get("game-over").loop();
    }
    background("black");
    fill("white");
    textSize(cellSize/1.75);
    textAlign(CENTER, CENTER);
    imageMode(CENTER);
    text("GAME OVER", width/2, height/2);
    for(let i=0; i<deathButtons.length; i++){
      text(deathButtons[i], width/deathButtons.length*i + width/deathButtons.length/2, height-height/6);
      if (i === this.deathButton){
        image(imageAssets.get("triforce"), width/deathButtons.length*i + width/deathButtons.length/2, height-height/10, width/25, width/25);
      }
    }
    pop();
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
          sfxAssets.get("click").play();
        }
      }
    }
    else if (state === "menu"){
      if (theKey === 69){ // e
        // exits menu
        state = "explore";
        player.ableToMove = true;
        sfxAssets.get("click").play();
      }
      else if (theKey === 32){ // space bar
        // enters section of menu
        sfxAssets.get("click").play();
        
      }
      else if (theKey === 87 || theKey === 38) { // w or up arrow
        // moves cursor up in submenus only
        sfxAssets.get("footstep").play();
      } 
      else if (theKey === 83 || theKey === 40) { // s or down arrow
        // moves cursor down in submenus only
        sfxAssets.get("footstep").play();
      } 
      else if (theKey === 65 || theKey === 37) {// a or left arrow
        // moves cursor left in main menu only
        if (this.menuButton === 0){
          this.menuButton = menuButtons.length-1;
        }
        else{
          this.menuButton--;
        }
        sfxAssets.get("footstep").play();
      } 
      else if (theKey === 68 || theKey === 39) { // d or right arrow
        // moves cursor right in main menu only
        if (this.menuButton === menuButtons.length-1){
          this.menuButton = 0;
        }
        else{
          this.menuButton++;
        }
        sfxAssets.get("footstep").play();
      }
    }
    else if (state === "battle"){
      if (theKey === 32){ // space bar
        // enters section of menu or passes through dialogue

        // check dialogue first
        if (this.currentAction === "run"){
          this.currentAction = "results";
          sfxAssets.get("click").play();
        }
        else if (this.currentAction === "results"){
          this.isFading = "out";
          sfxAssets.get("click").play();
          this.fadeOutOfBattle();
        }
        else if (this.currentAction === "fight" || this.currentAction === "guard" || this.currentAction === "item"){

          // player has moved past battle dialogue from their turn
          let currentRoom = findRoom(this);
          
          // check to see if any enemies are dead
          for(let i=this.currentlyFighting.length-1; i>=0; i--){
            if (currentRoom.enemies[this.currentlyFighting[i]].hp <= 0){
              console.log("enemy died");
              //remove from turn order
              for(let j=this.turnOrder.length-1; j>=0; j--){
                if (this.turnOrder[j].id === this.currentlyFighting[i]){
                  for (let turn of this.turnOrder){
                    if (turn.id > this.currentlyFighting[i]){
                      turn.id--;
                    }
                  }
                  this.turnOrder.splice(j, 1);
                  break;
                }
              }

              // add to deadEnemyPos
              this.deadEnemyPos.push({pos: currentRoom.enemies[this.currentlyFighting[i]].battlePos, time: millis()});

              // check what spaces in enemy buttons are still available
              for (let h=this.enemyButtonOptions.length-1; h>=0; h--){
                if (this.enemyButtonOptions[h] === currentRoom.enemies[this.currentlyFighting[i]].battlePos){
                  this.enemyButtonOptions.splice(h, 1);
                }
              }

              // change enemy button
              this.enemyButton = 0;

              // add to rupees, hearts and experience gained from battle
              this.accumulatedEXP += currentRoom.enemies[this.currentlyFighting[i]].exp;
              this.accumulatedRupees += currentRoom.enemies[this.currentlyFighting[i]].rupees;
              this.accumulatedHearts++;

              // remove from room
              currentRoom.enemies.splice(this.currentlyFighting[i], 1);

              // subtract all values above what is about to be removed
              for (let k=0; k<this.currentlyFighting.length; k++){
                if (this.currentlyFighting[k] > this.currentlyFighting[i]){
                  this.currentlyFighting[k]--;
                }
              }

              // remove from currentlyFighting
              this.currentlyFighting.splice(i,1);
              
              // death sound effect
              sfxAssets.get("enemy-death").play();
            }
          }

          // subtract Link's current action value from all enemies
          for(let i=this.turnOrder.length-1; i>=0; i--){
            this.turnOrder[i].actionVal -= this.turnOrder[0].actionVal;
          }

          // change player's action value
          if (this.currentAction === "guard" || this.currentAction === "item"){
            this.turnOrder[0].actionVal = 10000/this.spd;
          }
          else if (this.lastSkill.atkSpeed === "fast"){
            this.turnOrder[0].actionVal = 10000/this.spd*0.6;
          }
          else if (this.lastSkill.atkSpeed === "slow"){
            this.turnOrder[0].actionVal = 10000/this.spd*1.4;
          }
          else{
            this.turnOrder[0].actionVal = 10000/this.spd;
          }

          // resort turn order
          this.turnOrder.sort((a,b) => a.actionVal-b.actionVal);

          // if enemy's turn next, set currentAction to enemyTurn
          if (this.turnOrder[0].id !== "player"){
            this.currentAction = "enemyTurn";
          }
          else {
            this.currentAction = null;
          }

          // reset buttons
          this.battleButton = 0;
          this.battleMenu = "main";
          
          // reset attack used regardless of who's turn it is
          this.attackUsed = false;
        }

        else if (this.currentAction === "enemyTurn"){
          // player has moved past battle dialogue from the enemy turn

          // if player is dead
          if (this.hp <= 0){
            this.accumulatedEXP = 0;
            this.accumulatedRupees = 0;
            this.accumulatedHearts = 0;
            this.isFading = null;
            this.currentlyFighting = [];
            this.enemyButtonOptions = [];
            this.turnOrder = [];
            this.currentAction = null;
            this.battleButton = 0;
            this.enemyButton = 0;
            this.deadEnemyPos = [];
            this.lastAttack = null;
            this.enemySkill = null;
            this.guarding = false;
            this.itemUsed = false;
            this.statBoosts = {
              atk: 1,
              def: 1,
              spd: 1,
              evasion: 1,
              luck: 1,
            };
            bgmAssets.get("battle").stop();
            bgmAssets.get("mass-destruction").stop();
            this.direction = "east";
            this.deathTime = millis();
            sfxAssets.get("game-over-jingle").play();
            state = "defeat";
          }
          else{
          // subtract the enemy's current action value from all entities
            for(let i=this.turnOrder.length-1; i>=0; i--){
              this.turnOrder[i].actionVal -= this.turnOrder[0].actionVal;
            }

            // change the enemy's action value
            if (this.enemySkill.atkSpeed === "fast"){
              this.turnOrder[0].actionVal = 10000/this.spd*0.6;
            }
            else if (this.enemySkill.atkSpeed === "slow"){
              this.turnOrder[0].actionVal = 10000/this.spd*1.4;
            }
            else if (this.enemySkill.atkSpeed === "superslow"){
              this.turnOrder[0].actionVal = 10000/this.spd*2;
            }
            else{
              this.turnOrder[0].actionVal = 10000/this.spd;
            }

            // resort turn order
            this.turnOrder.sort((a,b) => a.actionVal-b.actionVal);

            // if enemy's turn, set currentAction to enemyTurn
            if (this.turnOrder[0].id !== "player"){
              this.currentAction = "enemyTurn";
              this.enemySkill = null;
            }
            else {
              this.currentAction = null;
              if (this.guarding){
                this.guarding = false;
                this.statBoosts.def -= 1.5;
              }
              this.itemUsed = false;
            }

            // reset buttons
            this.battleButton = 0;
            this.battleMenu = "main";
          
            // reset attack used regardless of who's turn it is
            this.enemySkill = null;
            this.attackUsed = false;
          }
        }

        // now buttons, if it is the player's turn
        else if (this.turnOrder[0].id === "player"){
          if (this.battleMenu === "main" && battleButtons[this.battleButton] === "FIGHT"){
            this.battleMenu = "fight";
            this.battleButton = 0;
          }
          else if (this.battleMenu === "main" && battleButtons[this.battleButton] === "GUARD"){
            this.currentAction = "guard";
          }
          else if (this.battleMenu === "main" && battleButtons[this.battleButton] === "ITEM"){
            this.battleMenu = "item";
            this.itemButton = 0;
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
          else if (this.battleMenu === "item"){
            if (this.itemInventory[this.itemButton].have > 0){
              this.currentAction = "item";
              sfxAssets.get("click").play();
            }
            else{
              sfxAssets.get("exit").play();
            }
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
          else if (this.battleMenu === "item"){
            this.battleMenu = "main";
            this.battleButton = 2;
          }
          else if (this.battleMenu === "enemy"){
            this.battleMenu = "fight";
          }
          sfxAssets.get("exit").play();
        }
      }
      else if (theKey === 65 || theKey === 37) {// a or left arrow
        // moves cursor left
        if (this.battleMenu === "enemy" && this.currentAction === null){
          if (this.enemyButton === 0 && this.enemyButtonOptions.length !== 1){
            this.enemyButton = this.enemyButtonOptions.length-1;
          }
          else if (this.enemyButtonOptions.length !== 1){
            this.enemyButton--;
          }
          sfxAssets.get("footstep").play();
        }
        else if (this.battleMenu === "item" && this.currentAction === null){
          if (this.itemButton === 0){
            this.itemButton = this.itemInventory.length-1;
          }
          else{
            this.itemButton--;
          }
          sfxAssets.get("footstep").play();
        }
        else if (this.currentAction === null){
          if (this.battleButton === 0){
            this.battleButton = battleButtons.length-1;
          }
          else{
            this.battleButton--;
          }
          sfxAssets.get("footstep").play();
        }
      } 
      else if (theKey === 68 || theKey === 39) { // d or right arrow
        // moves cursor right
        if (this.battleMenu === "enemy" && this.currentAction === null){
          if (this.enemyButton === this.currentlyFighting.length-1 && this.enemyButtonOptions.length !== 1){
            this.enemyButton = 0;
          }
          else if (this.enemyButtonOptions.length !== 1){
            this.enemyButton++;
          }
          sfxAssets.get("footstep").play();
        }
        else if (this.battleMenu === "item" && this.currentAction === null){
          if (this.itemButton === this.itemInventory.length-1){
            this.itemButton = 0;
          }
          else{
            this.itemButton++;
          }
          sfxAssets.get("footstep").play();
        }
        else if (this.currentAction === null){
          if (this.battleButton === battleButtons.length-1){
            this.battleButton = 0;
          }
          else{
            this.battleButton++;
          }
          sfxAssets.get("footstep").play();
        }
      }
    }
    else if (state === "game-over"){
      if (theKey === 32){ // space bar
        // respawns player or sends them back to the title screen
        this.x = GRID_X/2;
        this.y = GRID_Y/2;
        this.roomX = 0;
        this.roomY = 0;
        this.direction = "south";
        this.hp = this.maxHP;
        bgmAssets.get("game-over").stop();
        if (deathButtons[this.deathButton] === "RESPAWN"){
          state = "explore";
          bgmAssets.get("overworld").loop();
        }
        else if (deathButtons[this.deathButton] === "TITLE"){
          state = "start";
          imageMode(CENTER);
          rectMode(CENTER);
          textAlign(CENTER, CENTER);
        }
        sfxAssets.get("click").play();
      }
      if (theKey === 65 || theKey === 37) {// a or left arrow
        // moves cursor left
        if (this.deathButton === 0){
          this.deathButton = deathButtons.length-1;
        }
        else{
          this.deathButton--;
        }
        sfxAssets.get("footstep").play();
      } 
      else if (theKey === 68 || theKey === 39) { // d or right arrow
        // moves cursor right
        if (this.deathButton === deathButtons.length-1){
          this.deathButton = 0;
        }
        else{
          this.deathButton++;
        }
        sfxAssets.get("footstep").play();
      }
    }
  }
}