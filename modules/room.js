class Room {
  constructor(x, y, layout, preset, biome, subbiome, exits){
    this.x = x;
    this.y = y;
    this.layout = layout;
    this.preset = preset; // still needs functionality
    this.biome = biome;
    this.subbiome = subbiome;
    if (exits !== null){
      this.exits = exits;
    }
    else{
      this.exits = [];
    }
    this.enemies = [];
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
          for (let ban of bannedDirections){ //check for an exit ban
            if (ban === "north"){
              notBanned = false;
            }
          }
          if (notBanned){
            this.exits.push(newExit("north", round(random(1,GRID_X-newExitSize-1)), newExitSize));
          }
        }
        else if (newExitDirection === 1){ //south
          for (let ban of bannedDirections){ //check for an exit ban
            if (ban === "south"){
              notBanned = false;
            }
          }
          if (notBanned){
            this.exits.push(newExit("south", round(random(1,GRID_X-newExitSize-1)), newExitSize));
          }
        }
        else if (newExitDirection === 2){ //west
          for (let ban of bannedDirections){ //check for an exit ban
            if (ban === "west"){
              notBanned = false;
            }
          }
          if (notBanned){
            this.exits.push(newExit("west", round(random(1,GRID_Y-newExitSize-1)), newExitSize));
          }
        }
        else if (newExitDirection === 3){ //east
          for (let ban of bannedDirections){ //check for an exit ban
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
  addEnemies(){
    //finds a random enemy and a random amount of enemies to add, then adds them
    let enemyCount = round(random(1,5)); // how many enemies are to be added into the room
    for (let i=0; i<enemyCount; i++){
      let theID = round(random(0,5)) + 100; // random IDs, set two numbers in random() to be the same for one enemy guaranteed
      let notAllowed = true; // forgive me for giving this a horrible name I was out of ideas
      let x;
      let y;
      while(notAllowed){
        x = random(2, GRID_X-2);
        y = random(2, GRID_Y-2);
        if (this.layout[round(y)][round(x)] === 0){ // if where it has chosen to spawn is not a wall
          notAllowed = false;
        }
      }
      this.enemies.push(new Enemy(x,y,theID,1));
    }
  }
  display(){
    // display room borders
    for (let i=0; i<GRID_Y; i++){
      for (let j=0; j<GRID_X; j++){
        if (this.layout[i][j]===0){
          image(imageAssets.get("tiles-overworld-"+this.biome)[0][2], cellSize*j, cellSize*i, cellSize, cellSize);
        }
        else if (this.layout[i][j]===1){
          if (this.subbiome === "trees"){
            image(imageAssets.get("tiles-overworld-"+this.biome)[3][1], cellSize*j, cellSize*i, cellSize, cellSize);
          }
          else if (this.subbiome === "rocks"){
            // for rocks biome, checks must be done in a specific order so they overlap one another
            // one specific sprite can be used in many different cases
  
            if (j-1 >= 0) { // if not open to left
              if (this.layout[i][j-1] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (j+1 < GRID_X) { // if not open to right
              if (this.layout[i][j+1] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (i-1 >= 0 && j-1 >= 0) { // if not open to left or above
              if (this.layout[i][j-1] === 1 && this.layout[i-1][j] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (i+1 < GRID_Y && j-1 >= 0) { // if not open to left or below
              if (this.layout[i][j-1] === 1 && this.layout[i+1][j] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (i-1 >= 0 && j+1 < GRID_X) { // if not open to right or above
              if (this.layout[i][j+1] === 1 && this.layout[i-1][j] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (i+1 < GRID_Y && j+1 < GRID_X) { // if not open to right or below
              if (this.layout[i][j+1] === 1 && this.layout[i+1][j] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (j-1 >= 0 && j+1 < GRID_X) { // if not open to left or right
              if (this.layout[i][j+1] === 1 && this.layout[i][j-1] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (i-1 >= 0 && j-1 >= 0) { // if open to left but not above
              if (this.layout[i][j-1] === 0 && this.layout[i-1][j] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (i-1 >= 0 && j+1 >= 0) { // if open to right but not above
              if (this.layout[i][j+1] === 0 && this.layout[i-1][j] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (i+1 < GRID_Y && j-1 >= 0) { // if open to left but not below
              if (this.layout[i][j-1] === 0 && this.layout[i+1][j] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (i+1 < GRID_Y && j+1 >= 0) { // if open to right but not below
              if (this.layout[i][j+1] === 0 && this.layout[i+1][j] === 1) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (i-1 >= 0 && j-1 >= 0) { // if not open to left or right but open above
              if (this.layout[i][j-1] === 1 && this.layout[i][j-1] === 1 && this.layout[i-1][j] === 0) {
                image(imageAssets.get("tiles-overworld-"+this.biome)[4][1], cellSize*j, cellSize*i, cellSize, cellSize);
              }
            }
            if (i-1 >= 0 && j-1 >= 0){// if open to left and above
              if (this.layout[i-1][j] === 0 && this.layout[i][j-1] === 0){ 
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][3], cellSize*j, cellSize*i, cellSize, cellSize);
              } 
            }
            if (i-1 >= 0 && j+1 < GRID_X){ // if open to right and above
              if (this.layout[i-1][j] === 0 && this.layout[i][j+1] === 0){
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][4], cellSize*j, cellSize*i, cellSize, cellSize);
              } 
            }
            if (i+1 < GRID_Y && j-1 >= 0){ // if open to left and below
              if (this.layout[i+1][j] === 0 && this.layout[i][j-1] === 0){
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][5], cellSize*j, cellSize*i, cellSize, cellSize);
              } 
            }
            if (i+1 < GRID_Y && j+1 < GRID_X){ // if open to right and below
              if (this.layout[i+1][j] === 0 && this.layout[i][j+1] === 0){
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][7], cellSize*j, cellSize*i, cellSize, cellSize);
              } 
            }
            if (i-1 >= 0 && j-1 >= 0 && j+1 < GRID_X){ // if open in left, right and above
              if (this.layout[i-1][j] === 0 && this.layout[i][j-1] === 0 && this.layout[i][j+1] === 0){
                image(imageAssets.get("tiles-overworld-"+this.biome)[4][1], cellSize*j, cellSize*i, cellSize, cellSize);
              } 
            }
            if (i+1 < GRID_Y && j-1 >= 0 && j+1 < GRID_X){ // if open in left, right and below
              if (this.layout[i+1][j] === 0 && this.layout[i][j-1] === 0 && this.layout[i][j+1] === 0){
                image(imageAssets.get("tiles-overworld-"+this.biome)[3][6], cellSize*j, cellSize*i, cellSize, cellSize);
              } 
            }
            if (i-1 >= 0 && i+1 < GRID_Y && j-1 >= 0){ // if open in left, above and below
              if (this.layout[i-1][j] === 0 && this.layout[i][j-1] === 0 && this.layout[i+1][j] === 0){
                image(imageAssets.get("tiles-overworld-"+this.biome)[4][1], cellSize*j, cellSize*i, cellSize, cellSize);
              } 
            }
            if (i-1 >= 0 && i+1 < GRID_Y && j+1 < GRID_X){ // if open in right, above and below
              if (this.layout[i-1][j] === 0 && this.layout[i][j+1] === 0 && this.layout[i+1][j] === 0){
                image(imageAssets.get("tiles-overworld-"+this.biome)[4][1], cellSize*j, cellSize*i, cellSize, cellSize);
              } 
            }
          }
        }
      }
    }
  }
}