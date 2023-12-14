const equipment = [
  {
    name: "Sword", // starter sword
    overworldUse: { // what this does when used in the overworld
      type: "sword",
    },
    attacks: [ // the attacks usable in combat with this weapon
      {
        name: "Slash", // name of attack
        atkSpeed: "normal", // the speed of the attack; slower speeds gives the enemy more turns, higher speeds gives Link more turns
        atkType: "melee", // melee weapons can only hit things on the ground; flying enemies cannot be hit with them
        atkAff: "hit", // attack affinity determines what kind of attack it is; some enemies are weak/resistant to certain attacks
        baseDMG: 0, // base damage of specific attack
        accuracy: 100, // base chance of attack actually hitting enemy; is in percentage, can be lowered by enemy's evasion stat
      },
      {
        name: "Stab",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "White Sword",
    overworldUse:{
      type: "sword",
    },
    attacks: [
      {
        name: "Slash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Parry",
        atkSpeed: "slow",
        atkType: "counter",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 200,
      },
    ],
  },
  {
    name: "Magical Sword",
    overworldUse:{
      type: "sword",
    },
    attacks: [
      {
        name: "Slash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
      {
        name: "Hone",
        atkSpeed: "fast",
        atkType: "buff",
        atkAff: "support",
        buffType: "Attack", // skill buff Link's attack stat
        buffMultiplier: 3, // how much Link's attack will be multiplied
        buffDuration: 2, // how many of Link's turns the buff will last for
      },
    ],
  },
  {
    name: "Bombs",
    overworldUse:{
      type: "bomb",
      explodeTime: 3, // in seconds
      maxInv: 8, // limit to how much bombs Link can hold, however can be upgraded
    },
    attacks: [
      {
        name: "Place",
        atkSpeed: "fast",
        atkType: "bomb", // bomb can hit most enemies, specific ones might resist it though
        atkAff: "explosion",
        baseDMG: 0,
        accuracy: 85,
        bombDuration: 1, // how much turns it takes until the bomb explodes, will explode at the start of Link's next turn (since value is 1)
      },
    ],
  },
  {
    name: "Boomerang",
    overworldUse:{
      type: "boomerang",
      screenDist: 0.5, // how far the projectile can travel in reference to grid in overworld: math is width (or height) * screenDist, basically 0.5 is saying that it can travel half the screen
    },
    attacks: [
      {
        name: "Throw",
        atkSpeed: "normal",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 80,
      },
    ],
  },
  {
    name: "Magical Boomerang",
    overworldUse:{
      type: "boomerang",
      screenDist: 1,
    },
    attacks: [
      {
        name: "Throw",
        atkSpeed: "fast",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 90,
      },
    ],
  },
  {
    name: "Bow", // attacks change depending on what arrow Link has, silver arrow has priority over regular arrow, only usable if Link has any arrow types
    overworldUse:{
      type: "bow",
      screenDist: 1,
    },
    attacks: [
      {
        name: "Shoot",
        atkSpeed: "normal",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 95,
      },
    ],
  },
  {
    name: "Blue Candle", // emits fire forward, can hurt both player and enemy. One use per room entry
    overworldUse:{
      type: "candle",
      screenDist: 0.1,
      limit: 1,
    },
    attacks: [
      {
        name: "Light Up",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "fire",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Red Candle", // emits fire forward, can hurt both player and enemy. Infinite use
    overworldUse:{
      type: "candle",
      screenDist: 0.1,
      limit: "inf",
    },
    attacks: [
      {
        name: "Light Up",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "fire",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Recorder", // has a few uses
    // use 1: teleports to last completed dungeon's entrance if used in the overworld
    // use 2: reveals the entrance to dungeon 7 if used in the room where the entrance is
    // use 3: usable in the Digdogger fight to shrink him, so he is no longer invincible
    overworldUse:{
      type: "recorder",
    },
    attacks: [
      {
        name: "Play",
        atkSpeed: "slow",
        atkType: "recorder",
        atkAff: "support",
      },
    ],
  },
  {
    name: "Magical Rod",
    overworldUse:{
      type: "rod",
      screenDist: 1,
    },
    attacks: [
      {
        name: "Beam Attack",
        atkSpeed: "slow",
        atkType: "ranged",
        atkAff: "hit", // will be changed to fire should the player own the Book of Magic
        baseDMG: 0,
        accuracy: 90,
      },
    ],
  },
];
  
const shields = [ // shields are different from equipment as they are equipped at all times; cannot be swapped out for another weapon as guarding is always an option in battle
  {
    name: "Wooden Shield",
    guard: 2.5, // how much defense is multiplied by when guarding
  },
  {
    name: "Magical Shield",
    guard: 5,
  },
];
  
const items = [
  {
    name: "Life Potion",
    canbeUsed: true, // asks if this item is usable in combat. If false, it is limited to the player menu in the overworld
    heals: "full", // if item has "full" as the heal value, it fully heals the player upon use
    holding: 0, // how much is in Link's inventory
    uses: 1, // how many times this item can be used before it disappears
  },
  {
    name: "2nd Potion", // difference from Life Potion is that it can be used twice before disappearing
    canbeUsed: true,
    heals: "full",
    holding: 0,
    uses: 2,
  },
  {
    name: "Food", // can be used as an enemy distraction
    canbeUsed: true,
    distractionTime: 20, // how many seconds enemies can eat the food before it disappears and enemies start noticing Link again
    holding: 0,
    uses: 1,
  },
  {
    name: "Raft", // is used to cross water
    canbeUsed: false,
    uses: "inf", // if "inf", it has infinite usage
  },
  {
    name: "Stepladder", // is used to cross gaps
    canbeUsed: false,
    uses: "inf",
  },
  {
    name: "Escape Rope", // only can be used within dungeons; is used to escape the current dungeon and teleport to its entrance 
    canbeUsed: false,
    uses: 1,
  },
];
  
const keyItems = [
  {
    name: "Arrow",
    baseDMG: 0,
  },
  {
    name: "Silver Arrow",
    baseDMG: 0,
  },
  {
    name: "Small Key",
    holding: 0,
  },
  {
    name: "Magical Key",
  },
  {
    name: "Letter",
  },
  {
    name: "Book of Magic",
  },
  {
    name: "Power Bracelet",
  },
  {
    name: "Compass",
    dungeon: 0,
  },
  {
    name: "Dungeon Map",
    dungeon: 0,
  },
  {
    name: "Triforce Fragment",
    holding: 0,
  },
  {
    name: "Triforce of Wisdom",
  },
];