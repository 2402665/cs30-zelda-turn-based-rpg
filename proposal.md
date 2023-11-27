# Project Description

This Major Project is a randomized turn-based RPG using resources from the Legend of Zelda series, along with a few others as easter eggs.

## This Project Needs to Have...
- Randomly generating rooms that look like something you'd find on the NES Zelda map with the use of spritesheets. These rooms would get saved into a grid of rooms to create a map, with the exits to those rooms connecting to one another properly.
- A stat screen that shows the player's current attributes and allows the player to change their equipment, use items, and more.
- Randomly generating enemies that hunt down the player upon seeing them, and once interacted with, initiates combat.
- A fully working turn based combat system that:
    - calculates total player and enemy turns, and displays the turn order on the side of the screen. Different actions of both the player and the enemy will change the turn order, depending on the "speed" value of the move one uses
    - lets the player make moves (including using a basic attack, skill, item, and running away)
    - has enemy AI that will either pick a random move for the enemy to use, try to always use a different move than what they did in their last turn, or use a sequence of specific moves as a "tactic"
    - after winning, gives the player experience points and other rewards upon victory, and returns them to the room they were in
    - after losing, makes them lose their items and money (but not their level, equipment, and other stats), as well as resetting their room position to (0,0) or their last Safe Chest location (if safe chests have enough time to be implemented)
- Randomly generating objects like treasure chests or ground spikes that appear in rooms and can help or threaten the player, depending on the object generated.
- Animations for player, enemies, and more.
- Background music and sound effects that enhance the player experience.

## It Would Be Nice to Have...
- A fully animated title screen.
- A start screen menu that allows for players to play a tutorial.
- Animated room changes; the screen sliding left/right/up/down to the next room whenever you leave a room
- Multiple different weapons with their own niches and uses in both the overworld and combat.
- "Safe Chests". These special interactable objects can spawn in rooms and act like checkpoints, and can also hold items and money you'd rather not lose in combat. All safe chests are connected to each other, so any items you put in one safe chest can be retrieved from any other safe chest.
- Pre-generated areas that have the chance of generating instead of normal randomized rooms. Can hold puzzles, shops, and many secrets.
- Underground dungeons and secret entrances to said dungeons in the overworld that hold enemies, bosses, treasures, and other secrets to be found.
- Shards of the Triforce that can be collected, with entering all Zelda dungeons (not secret dungeons) and conquering the bosses at the end of each one will form the full Triforce and unlock the final dungeon so you may beat the game.
- Secret enemies and dungeons from other games and styles with their own special mechanics, music, sound effects, and more.
- An online mode that saves the data of players. The specific user's profile will be accessible by a keycode/username only the player will have, and then a display name for an online leaderboard that shows the stats of the top players, depending on the category selected. Player data can be saved locally or globally.
- A co-op mode that allows for two or more players to explore the same world. Each player will play as a different colored Link with a max of four players in one world.
- A PvP mode that allows for two to four players to fight each other in turn-based combat. Nothing will be gained for victory, and nothing will be lost if defeated.