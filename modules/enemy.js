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