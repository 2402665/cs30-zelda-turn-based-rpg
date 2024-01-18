const enemies = [
  // enemy ID's first digit tells which section of the game they belong in
  // 1 = overworld, 2 = dungeon, 3 = water, 4 = mario
  // for enemies and bosses not from zelda, they will have their own special battle UI, sound effects, background music, and more
  // size are the width and height of the object in relevance to the grid; [3,1] means 3 grid blocks long and 1 grid block tall
  {
    name: "Armos",
    id: 100,
    size: [1,1],
    diffColor: false,
    movementType: "armos",
    enemyType: "normal",
    behavior: "lazy",
    baseStats: {
      maxHP: 10,
      atk: 2,
      def: 3,
      spd: 1,
      evasion: 0,
    },
    attacks: [
      {
        name: "BASH",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 8,
        accuracy: 100,
      },
      {
        name: "NOTHING",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
    rupees: 1,
    exp: 1,
  },
  {
    name: "Ghini",
    id: 101,
    size: [1,1],
    diffColor: false,
    movementType: "normal",
    enemyType: "normal",
    behavior: "crafty",
    baseStats: {
      maxHP: 5,
      atk: 1,
      def: 1,
      spd: 3,
      evasion: 20,
    },
    attacks: [
      {
        name: "BASH",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 8,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Leever",
    id: 102,
    size: [1,1],
    diffColor: true,
    movementType: "walk",
    enemyType: "normal",
    behavior: "lazy",
    baseStats: {
      maxHP: 6,
      atk: 2,
      def: 2,
      spd: 1,
      evasion: 10,
    },
    attacks: [
      {
        name: "BASH",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 8,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Lynel",
    id: 103,
    size: [1,1],
    diffColor: true,
    movementType: "normal",
    enemyType: "normal",
    behavior: "smart",
    baseStats: {
      maxHP: 25,
      atk: 7,
      def: 3,
      spd: 5,
      evasion: 20,
    },
    attacks: [
      {
        name: "SLASH",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 10,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Moblin",
    id: 104,
    size: [1,1],
    diffColor: true,
    movementType: "walk",
    enemyType: "normal",
    behavior: "crafty",
    baseStats: {
      maxHP: 10,
      atk: 3,
      def: 3,
      spd: 3,
      evasion: 0,
    },
    attacks: [
      {
        name: "STAB",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 15,
        accuracy: 70,
      },
      {
        name: "BITE",
        atkSpeed: "fast",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 5,
        accuracy: 80,
      },
    ],
  },
  {
    name: "Octorok",
    id: 105, 
    size: [1,1],
    diffColor: true,
    movementType: "walk",
    enemyType: "normal",
    behavior: "lazy",
    baseStats: {
      maxHP: 10,
      atk: 2,
      def: 2,
      spd: 2,
      evasion: 10,
    },
    attacks: [
      {
        name: "SHOOT ROCK",
        atkSpeed: "normal",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 5,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Peahat",
    id: 106,
    size: [1,1],
    diffColor: false,
    movementType: "hop",
    hopSpeed: 0,
    enemyType: "flying",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Jump Attack",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Tektite",
    id: 107,
    size: [1,1],
    diffColor: false,
    movementType: "hop",
    hopSpeed: 0,
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Jump Attack",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Darknut",
    id: 200,
    size: [1,1],
    diffColor: true,
    movementType: "idle",
    enemyType: "heavy",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
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
        name: "Guard",
        atkSpeed: "slow",
        atkType: "buff",
        atkAff: "support",
        buffType: "Defense",
        buffMultiplier: 2,
        buffDuration: 3,
      },
    ],
  },
  {
    name: "Gel",
    id: 201,
    size: [1,1],
    diffColor: false,
    movementType: "hop",
    hopSpeed: 0,
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Jump Attack",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 70,
      },
    ],
  },
  {
    name: "Gibdo",
    id: 202,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Claw",
        atkSpeed: "fast",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Goriya",
    id: 203,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Boomerang Throw",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Keese",
    id: 204,
    size: [1,1],
    diffColor: true,
    movementType: "idle",
    enemyType: "flying",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Lanmola",
    id: 205,
    size: [3,3], // not very efficient as it is a large snake-like enemy
    diffColor: true,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bite",
        atkSpeed: "fast",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 80,
      },
      {
        name: "Coil",
        atkSpeed: "slow",
        atkType: "buff",
        atkAff: "support",
        buffType: "Defense",
        buffMultiplier: 2,
        buffDuration: 2,
      },
    ],
  },
  {
    name: "Likelike",
    id: 206,
    size: [2,2],
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Devour",
        atkSpeed: "slow",
        atkType: "debuff",
        atkAff: "support",
        buffType: "speed",
        bullMultiplier: 2,
        buffDuration: 3,
        accuracy: 50,
      },
      {
        name: "Chomp",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 80,
      },
    ],
  },
  {
    name: "Moldorm",
    id: 207,
    size: [3,3], // not very efficient as it is a large snake-like enemy
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 5,
      atk: 0,
      def: 999,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Patra",
    id: 208,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Mini Patra",
    id: 209,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "spin",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Pol's Voice",
    id: 210,
    size: [1,1],
    diffColor: false,
    movementType: "hop",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Rope",
    id: 211,
    size: [1,1],
    diffColor: true,
    movementType: "fast",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Quick Attack",
        atkSpeed: "fast",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Stalfos",
    id: 212,
    size: [1,1],
    diffColor: false,
    movementType: "walk",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
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
    ],
  },
  {
    name: "Vire",
    id: 213,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Wallmaster",
    id: 214,
    size: [1,1],
    diffColor: false,
    movementType: "walk",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Grab",
        atkSpeed: "slow",
        atkType: "debuff",
        atkAff: "support",
        buffType: "speed",
        bullMultiplier: 3,
        buffDuration: 3,
        accuracy: 50,
      },
      {
        name: "Squeeze",
        atkSpeed: "slow",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 80,
      },
    ],
  },
  {
    name: "Wizzrobe",
    id: 215,
    size: [1,1],
    diffColor: true,
    movementType: "normal", 
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Beam Attack",
        atkSpeed: "slow",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 90,
      },
    ],
  },
  {
    name: "Zol",
    id: 216,
    size: [1,1],
    diffColor: false,
    movementType: "hop",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Bash",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  { // zora only spawn in water, not sure how this one will get handled
    name: "Zora",
    id: 300,
    size: [1,1],
    diffColor: false,
    movementType: "idle",
    enemyType: "water",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Magic Ball",
        atkSpeed: "slow",
        atkType: "ranged",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
  {
    name: "Goomba",
    id: 400,
    size: [1,1],
    diffColor: false,
    movementType: "walk",
    enemyType: "normal",
    baseStats: {
      maxHP: 0,
      atk: 0,
      def: 0,
      spd: 0,
      evasion: 0,
    },
    attacks: [
      {
        name: "Headbutt",
        atkSpeed: "normal",
        atkType: "melee",
        atkAff: "hit",
        baseDMG: 0,
        accuracy: 100,
      },
    ],
  },
];