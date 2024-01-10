class Enemy {
  constructor(x, y, id, level){
    this.x = x;
    this.y = y;
    this.direction = "south";
    let currentEnemy;
    try{
      currentEnemy = findEnemy(id, "enemy");
    }
    catch{
      console.log("Enemy does not exist!");
      currentEnemy = findEnemy(105, "enemy"); // defaults to spawning Octorok if enemy ID does not exist
    }
    this.id = currentEnemy.id;
    this.name = currentEnemy.name; // name that will be displayed in combat
    this.size = currentEnemy.size;
    this.diffColor = currentEnemy.diffColor;
    this.color = "red";
    this.movementType = currentEnemy.movementType; // walk, normal (between walk and run), run, hop, idle, etc
    if (this.movementType === "hop"){
      this.hopSpeed = currentEnemy.hopSpeed;
    }
    this.lastMovement = millis()-1;
    this.movementTime = 0;
    this.enemyType = currentEnemy.enemyType;
    this.behavior = currentEnemy.behavior;
    this.baseStats = currentEnemy.baseStats;
    this.attacks = currentEnemy.attacks;
    this.level = level;
    this.canSeePlayer = false;
    this.bonuses = []; // stat bonuses, like temporary attack/defense buffs
  }
  move(){
    // first determine how fast the enemy is
    let walkSPD = 0.085;
    let adjustmentValue = 0.045;
    if (this.movementType === "run"){
      walkSPD += adjustmentValue;
    }
    else if (this.movementType === "walk"){
      walkSPD -= adjustmentValue;
    }
    else if (this.movementType === "idle"){
      walkSPD = 0;
    }

    // then determine which direction enemies can go in
    let directions;
    if (this.movementType === "updown"){
      directions = ["north", "south"];
    }
    else if (this.movementType === "leftright"){
      directions = ["west","east"];
    }
    else if (this.movementType === "armos"){
      directions = ["north", "south"];
      walkSPD -= adjustmentValue;
    }
    else{
      directions = ["north", "south", "west", "east"];
    }

    // change the direction should the enemy's time moving in that direction be over
    if (this.lastMovement + this.movementTime < millis()){
      let randomDirection = floor(random(0, directions.length));
      for (let i=0; i<directions.length; i++){
        if (i === randomDirection){
          this.direction = directions[i];
        }
      }
      this.lastMovement = millis();
      this.movementTime = random(500, 1500);
    }
    
    // use direction to find the addedPos
    let addedPos = {x: 0, y: 0, xSign: 0, ySign: 0};
    if (this.direction === "north"){
      addedPos.y -= walkSPD;
      addedPos.ySign = -0.5;
    }
    else if (this.direction === "south"){
      addedPos.y += walkSPD;
      addedPos.ySign = 0.5;
    }
    else if (this.direction === "west"){
      addedPos.x -= walkSPD;
      addedPos.xSign = -0.5;
    }
    else if (this.direction === "east"){
      addedPos.x += walkSPD;
      addedPos.xSign = 0.5;
    }

    // move the enemy
    let currentRoom = findRoom(player);
  
    try{ //checking for room movement
      if (currentRoom.layout[round(this.y + addedPos.ySign)][round(this.x + addedPos.xSign)] === 0){ // if not running into something
        this.y += addedPos.y;
        this.x += addedPos.x;
      }
      else if (currentRoom.layout[round(this.y + addedPos.ySign)][round(this.x + addedPos.xSign)] === 1){
        // change enemy direction if hit a wall
        let randomDirection = floor(random(0, directions.length));
        for (let i=0; i<directions.length; i++){
          if (i === randomDirection){
            this.direction = directions[i];
          }
        }
        this.lastMovement = millis();
        this.movementTime = random(500, 1500);
      }
    }
    catch{ // in case of error (AKA enemy leaving the room in north/south directions)
      // if an enemy goes through an exit, it removes the enemy from the room grid
      if (this.y < walkSPD){ // if going into north exit
        this.remove();
      }
      else if (this.y > GRID_Y - 1 - walkSPD*2){ // if going to south exit
        this.remove();
      }
    }
    // game does not error in case of west/east exits, so check them here
    if (this.x < 0){ // if going to west exit
      this.remove();
    }
    else if (this.x > GRID_X - 1 - walkSPD){ // if going to east exit
      this.remove();
    }

  }
  display(){
    push();
    imageMode(CORNER);
    let theImage;
    if (this.name === "Leever"){
      theImage = imageAssets.get(this.name.toLowerCase()+"-"+this.color);
    }
    else if (this.diffColor){
      theImage = imageAssets.get(this.name.toLowerCase()+"-"+this.color+"-"+this.direction);
    }
    else{
      theImage = imageAssets.get(this.name.toLowerCase()+"-"+this.direction);
    }
    image(theImage, this.x*cellSize, this.y*cellSize, cellSize*this.size[0], cellSize*this.size[1]);
    pop();
  }
  canSeePlayer(){
  
  }
  attack(){
  
  }
  remove(){
    let currentRoom = findRoom(player);
    for (let i=0; i<currentRoom.enemies.length; i++){
      if (currentRoom.enemies[i].x === this.x && currentRoom.enemies[i].y === this.y){
        currentRoom.enemies.splice(i, 1);
      }
    }
  }
}