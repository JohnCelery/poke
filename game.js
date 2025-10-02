const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const dialogueBox = document.getElementById('dialogue');
const locationLabel = document.getElementById('locationLabel');
const partyLabel = document.getElementById('partyLabel');
const battleUI = document.getElementById('battleUI');
const battleButtons = Array.from(battleUI.querySelectorAll('button'));
const battleLog = document.getElementById('battleLog');
const playerMonLabel = document.getElementById('playerMonLabel');
const enemyMonLabel = document.getElementById('enemyMonLabel');
const playerHealth = document.getElementById('playerHealth');
const enemyHealth = document.getElementById('enemyHealth');

const TILE_SIZE = 32;
const MOVE_SPEED = 180; // pixels per second

const rawMap = `
############################################################
#tttttttggggggggggggggggggggggggggggggggggggggggggggttttttt#
#tttttttgtggtggtggtggtggtggtggtggtggtggtggtggtggtggtttttttt#
#gggggggggggggggggggggggggggggggggggggggggggggggggggggggggg#
#gggggggggggggggggggggggggggggggggggggggggggggggggggggggggg#
#gggggggs~~~sgggggggggggggggggggggggggggggggggggggggggggggg#
#ggggggggs~~~sggggggggggggggggppggggggggggggggggggggggggggg#
#ggggghgs~~~sgggggggghggggggggpgggggggggggggggggggggggggggg#
#gggggggs~~~sgggggggggggggggggppggggggggggggggggggggggggggg#
#ggggggggs~~~sggggggggggggggggpgggggggggggggggggggggggggggg#
#gggffffffff~sggggggggggggggggppggggggwggwggwggwggwggwggwgg#
#gggffffffff~sggggggggggggggggpgggggggggwggwggwggwggwggwggg#
#gggffffffff~~sgggggggggggggggppgggggggwggwggwggwggwggwgggg#
#ghgffffffff~sggggggggggggggggpgggggggwggwhgwggwggwggwggwgg#
#gggffffffff~~sgggggggggggggggppggggggggwggwggwggwggwggwggg#
#gggffffffff~~~sggggggggghggggpggggggggwggwggwggwggwghwgggg#
#gggffffffff~~sgggggggggggggggppggggggggggggggggggggggggggg#
#gggggggggs~~~sgggppppppppggggpgggggggggggggggggggggggggggg#
#gggggggggggs~~~sgppppppppgggpppggggggggggggggggggggggggggg#
#ggggggggggs~~~sggppppppppgggppgggggggggggggggggggggggggggg#
#pppppppppppppppppppppppppppppppppppppppppppppppppppppppppp#
#pppppppppppppppppppppppppppppppppppppppppppppppppppppppppp#
#gggggggggpxx~~sgggggggggggggpppggggggggggggggggggggggggggg#
#ggggggggggps~~BBBBBBBBggggggpppppgggggggggggggghgggggggggg#
#ggggggggggggs~BbbbbbbBgggghgpppppBBBBBBBBBBggggggggggggggg#
#gggggggggggs~~BbbbbbbBggggggpppppBbbbbbbbbBggggggggggggggg#
#ghgggggggggs~~BbbbbbbBgggggggppggBbbbbbbbbBgggg^s^s^s^s^s^#
#gggggggggggggsBbbbbbbBgggggggpgggBbbbbbbbbBggggs^s^s^s^s^s#
#ggCCCCCCCCCCs~BBBdBBBBgggggggppggBbbbbbbbbBgggg^s^s^s^s^s^#
#ggCccccccccCs~~~sggggggggggggpgggBBBBdddBBBggggs^s^s^s^s^s#
#ggCccccccccCgs~~~sgggggggggggppgggggggggggggggg^s^s^s^s^s^#
#ggCccccccccCgggggggggggggggggpgggggggggggggggggs^s^s^s^s^s#
#ggCccccccccCgggggggggggggggggppgggggggggggggggg^s^s^s^s^s^#
#ggCCCCddCCCCgggggggggggggggggpgggggggggggggggggs^s^s^s^s^s#
#gggggggggggggggggggggggggggggppgggggggggggggggg^s^s^s^s^s^#
############################################################
`;

const WORLD_ROWS = rawMap.trim().split('\n');
const WORLD_HEIGHT = WORLD_ROWS.length;
const WORLD_WIDTH = WORLD_ROWS[0].length;
const WORLD_PIXEL_WIDTH = WORLD_WIDTH * TILE_SIZE;
const WORLD_PIXEL_HEIGHT = WORLD_HEIGHT * TILE_SIZE;

const tileDefinitions = {
  '#': { color: '#0b1120', walkable: false, label: 'Ancient Pines' },
  t: { color: '#14532d', overlay: '#1d4c2f', walkable: false, label: 'Thick Evergreen Canopy' },
  g: { color: '#166534', overlay: '#22c55e', walkable: true, encounter: true, label: 'Verdant Expanse', encounterRate: 0.18 },
  h: { color: '#166534', overlay: '#4ade80', walkable: true, encounter: true, label: 'Blooming Thicket', encounterRate: 0.28 },
  w: { color: '#1a4731', overlay: '#facc15', walkable: true, encounter: true, label: 'Wildflower Meadow', encounterRate: 0.12 },
  f: { color: '#854d0e', overlay: '#f97316', walkable: true, label: 'Golden Farmland' },
  p: { color: '#475569', overlay: '#94a3b8', walkable: true, label: "Traveler's Causeway" },
  s: { color: '#fbbf24', overlay: '#fef08a', walkable: true, label: 'Riverbank Sand' },
  '~': { color: '#0369a1', overlay: '#0ea5e9', walkable: false, label: 'Silverstream River' },
  r: { color: '#0ea5e9', overlay: '#38bdf8', walkable: true, label: 'Shallow Crossing' },
  B: { color: '#1e293b', overlay: '#334155', walkable: false, label: 'Village Wall' },
  b: { color: '#475569', overlay: '#64748b', walkable: true, label: 'Village Interior' },
  d: { color: '#f59e0b', overlay: '#facc15', walkable: true, label: 'Doorway Threshold' },
  C: { color: '#111827', overlay: '#0f172a', walkable: false, label: 'Obsidian Cavern Wall' },
  c: { color: '#1f2937', overlay: '#111827', walkable: true, encounter: true, label: 'Obsidian Cavern Floor', encounterRate: 0.1 },
  x: {
    color: '#9a3412',
    overlay: '#fb923c',
    walkable: true,
    heal: true,
    label: 'Campfire Rest',
  },
  '^': { color: '#334155', overlay: '#475569', walkable: false, label: 'Shale Cliffs' },
};

const camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
};

const movementActions = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

const inputState = { up: false, down: false, left: false, right: false };
const directionQueue = [];

window.addEventListener('keydown', (event) => {
  const action = movementActions[event.key];
  if (action) {
    if (!inputState[action]) {
      directionQueue.push(action);
    }
    inputState[action] = true;
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  const action = movementActions[event.key];
  if (action) {
    inputState[action] = false;
    const index = directionQueue.indexOf(action);
    if (index >= 0) {
      directionQueue.splice(index, 1);
    }
    event.preventDefault();
  }
});

function nextDirection() {
  for (let i = directionQueue.length - 1; i >= 0; i -= 1) {
    const action = directionQueue[i];
    if (inputState[action]) {
      switch (action) {
        case 'up':
          return { dx: 0, dy: -1 };
        case 'down':
          return { dx: 0, dy: 1 };
        case 'left':
          return { dx: -1, dy: 0 };
        case 'right':
          return { dx: 1, dy: 0 };
        default:
          break;
      }
    }
  }
  return null;
}

function makeCreature(template, level) {
  const growth = level - 1;
  const creature = {
    name: template.name,
    type: template.type,
    level,
    maxHp: template.baseHp + growth * template.hpGrowth,
    hp: template.baseHp + growth * template.hpGrowth,
    attack: template.baseAttack + growth * template.attackGrowth,
    specialPower: template.baseSpecial + growth * template.specialGrowth,
    defense: template.baseDefense + growth * template.defenseGrowth,
    speed: template.baseSpeed + growth * template.speedGrowth,
    maxEnergy: template.baseEnergy + growth * template.energyGrowth,
    energy: template.baseEnergy + growth * template.energyGrowth,
    xp: 0,
  };
  return creature;
}

const MONSTER_DEX = [
  {
    name: 'Astrafox',
    type: 'Starlight',
    baseHp: 30,
    hpGrowth: 6,
    baseAttack: 7,
    attackGrowth: 2,
    baseSpecial: 10,
    specialGrowth: 3,
    baseDefense: 5,
    defenseGrowth: 1.5,
    baseSpeed: 8,
    speedGrowth: 1.2,
    baseEnergy: 18,
    energyGrowth: 2,
  },
  {
    name: 'Torracorn',
    type: 'Cascade',
    baseHp: 36,
    hpGrowth: 7,
    baseAttack: 9,
    attackGrowth: 2.4,
    baseSpecial: 6,
    specialGrowth: 2,
    baseDefense: 7,
    defenseGrowth: 2,
    baseSpeed: 6,
    speedGrowth: 1,
    baseEnergy: 16,
    energyGrowth: 2,
  },
  {
    name: 'Bloomtail',
    type: 'Verdant',
    baseHp: 32,
    hpGrowth: 7,
    baseAttack: 6,
    attackGrowth: 1.8,
    baseSpecial: 9,
    specialGrowth: 2.6,
    baseDefense: 6,
    defenseGrowth: 1.7,
    baseSpeed: 7,
    speedGrowth: 1.4,
    baseEnergy: 20,
    energyGrowth: 2.4,
  },
];

const WILD_POOL = [
  {
    name: 'Glintpup',
    type: 'Spark',
    baseHp: 24,
    hpGrowth: 5,
    baseAttack: 6,
    attackGrowth: 1.8,
    baseSpecial: 9,
    specialGrowth: 2.2,
    baseDefense: 4,
    defenseGrowth: 1.4,
    baseSpeed: 9,
    speedGrowth: 1.6,
    baseEnergy: 15,
    energyGrowth: 2,
  },
  {
    name: 'Marblume',
    type: 'Stonebloom',
    baseHp: 28,
    hpGrowth: 6,
    baseAttack: 7,
    attackGrowth: 2,
    baseSpecial: 7,
    specialGrowth: 2,
    baseDefense: 8,
    defenseGrowth: 2.4,
    baseSpeed: 5,
    speedGrowth: 1,
    baseEnergy: 17,
    energyGrowth: 1.7,
  },
  {
    name: 'Scorchick',
    type: 'Ember',
    baseHp: 26,
    hpGrowth: 5.5,
    baseAttack: 8,
    attackGrowth: 2.3,
    baseSpecial: 8,
    specialGrowth: 2.5,
    baseDefense: 5,
    defenseGrowth: 1.5,
    baseSpeed: 8,
    speedGrowth: 1.3,
    baseEnergy: 18,
    energyGrowth: 2.2,
  },
];

const gameState = {
  mode: 'explore',
  messageTimer: null,
  lastMessageTile: null,
  player: {
    gridX: 32,
    gridY: 24,
    x: 32 * TILE_SIZE,
    y: 24 * TILE_SIZE,
    moving: false,
    moveDir: { dx: 0, dy: 0 },
    targetX: 32 * TILE_SIZE,
    targetY: 24 * TILE_SIZE,
    lastTileKey: null,
    party: [makeCreature(MONSTER_DEX[0], 3)],
  },
  battle: {
    active: false,
    enemy: null,
    locked: false,
  },
};

gameState.player.party[0].xp = 15;

function tileAt(gridX, gridY) {
  if (gridY < 0 || gridY >= WORLD_HEIGHT || gridX < 0 || gridX >= WORLD_WIDTH) {
    return '#';
  }
  return WORLD_ROWS[gridY][gridX];
}

function isWalkable(gridX, gridY) {
  const tile = tileDefinitions[tileAt(gridX, gridY)];
  if (!tile) return false;
  return tile.walkable;
}

function updateCamera() {
  const player = gameState.player;
  const centerX = player.x + TILE_SIZE / 2;
  const centerY = player.y + TILE_SIZE / 2;
  const maxX = Math.max(0, WORLD_PIXEL_WIDTH - camera.width);
  const maxY = Math.max(0, WORLD_PIXEL_HEIGHT - camera.height);
  camera.x = Math.max(0, Math.min(centerX - camera.width / 2, maxX));
  camera.y = Math.max(0, Math.min(centerY - camera.height / 2, maxY));
}

function updateLocationLabel() {
  const tileChar = tileAt(gameState.player.gridX, gameState.player.gridY);
  const tileInfo = tileDefinitions[tileChar];
  locationLabel.textContent = tileInfo?.label ?? 'Wilderness';
}

function updatePartyLabel() {
  const members = gameState.player.party
    .map((mon) => `${mon.name} Lv.${mon.level} — HP ${Math.round(mon.hp)}/${Math.round(mon.maxHp)}`)
    .join(' | ');
  partyLabel.textContent = members;
}

function showDialogue(message, duration = 2200) {
  if (gameState.messageTimer) {
    clearTimeout(gameState.messageTimer);
  }
  dialogueBox.textContent = message;
  if (duration > 0) {
    gameState.messageTimer = setTimeout(() => {
      if (dialogueBox.textContent === message) {
        dialogueBox.textContent = '';
      }
    }, duration);
  }
}

function healParty() {
  gameState.player.party.forEach((mon) => {
    mon.hp = mon.maxHp;
    mon.energy = mon.maxEnergy;
  });
  updatePartyLabel();
  showDialogue('Your party feels refreshed after resting by the campfire!', 2800);
}

function encounterChance(tileChar) {
  const tile = tileDefinitions[tileChar];
  if (tile?.encounter) {
    return tile.encounterRate ?? 0.18;
  }
  return 0;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function xpForNextLevel(level) {
  return Math.floor(level * 35 + Math.pow(level, 1.5) * 4);
}

function startBattle(enemy) {
  gameState.mode = 'battle';
  gameState.battle.active = true;
  gameState.battle.enemy = enemy;
  gameState.battle.locked = false;
  battleUI.hidden = false;
  battleLog.innerHTML = '';
  battleButtons.forEach((btn) => {
    btn.disabled = false;
  });
  logBattle(`A wild ${enemy.name} appeared!`);
  showDialogue('Battle start! Choose an action.', 1500);
  updateBattleUI();
}

function endBattle(message) {
  gameState.mode = 'explore';
  gameState.battle.active = false;
  gameState.battle.enemy = null;
  battleUI.hidden = true;
  battleButtons.forEach((btn) => {
    btn.disabled = false;
  });
  if (message) {
    showDialogue(message, 2600);
  }
  updatePartyLabel();
  updateLocationLabel();
}

function updateBattleUI() {
  const playerMon = gameState.player.party[0];
  const enemy = gameState.battle.enemy;
  playerMonLabel.textContent = `${playerMon.name} · Lv.${playerMon.level} · Energy ${Math.round(playerMon.energy)}/${Math.round(playerMon.maxEnergy)}`;
  const playerRatio = Math.max(0, playerMon.hp) / playerMon.maxHp;
  playerHealth.style.transform = `scaleX(${playerRatio})`;

  enemyMonLabel.textContent = `${enemy.name} · Lv.${enemy.level}`;
  const enemyRatio = Math.max(0, enemy.hp) / enemy.maxHp;
  enemyHealth.style.transform = `scaleX(${enemyRatio})`;
}

function logBattle(message) {
  const entry = document.createElement('p');
  entry.textContent = message;
  battleLog.appendChild(entry);
  battleLog.scrollTop = battleLog.scrollHeight;
}

function calculateDamage(attacker, defender, isSpecial = false) {
  const powerStat = isSpecial ? attacker.specialPower : attacker.attack;
  const randomFactor = 0.85 + Math.random() * 0.3;
  const raw = powerStat * randomFactor - defender.defense * 0.35;
  return Math.max(1, Math.round(raw));
}

function calculateHeal(user) {
  const randomFactor = 0.9 + Math.random() * 0.3;
  return Math.round(user.maxHp * 0.3 * randomFactor + 4);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function handlePlayerAction(action) {
  if (!gameState.battle.active || gameState.battle.locked) return;
  const playerMon = gameState.player.party[0];
  const enemy = gameState.battle.enemy;
  gameState.battle.locked = true;
  battleButtons.forEach((btn) => {
    btn.disabled = true;
  });

  if (action === 'attack') {
    const damage = calculateDamage(playerMon, enemy, false);
    enemy.hp = Math.max(0, enemy.hp - damage);
    playerMon.energy = Math.min(playerMon.maxEnergy, playerMon.energy + 3);
    logBattle(`${playerMon.name} strikes for ${damage} damage!`);
    updateBattleUI();
    await delay(600);
    if (enemy.hp <= 0) {
      await handleVictory(enemy);
      return;
    }
  } else if (action === 'special') {
    const cost = 8;
    if (playerMon.energy < cost) {
      logBattle(`${playerMon.name} doesn't have enough energy!`);
      await delay(400);
      battleButtons.forEach((btn) => {
        btn.disabled = false;
      });
      gameState.battle.locked = false;
      return;
    }
    playerMon.energy -= cost;
    const damage = Math.round(calculateDamage(playerMon, enemy, true) * 1.3);
    enemy.hp = Math.max(0, enemy.hp - damage);
    logBattle(`${playerMon.name} unleashes a radiant burst for ${damage} damage!`);
    updateBattleUI();
    await delay(700);
    if (enemy.hp <= 0) {
      await handleVictory(enemy);
      return;
    }
  } else if (action === 'heal') {
    const cost = 6;
    if (playerMon.energy < cost) {
      logBattle(`${playerMon.name} is too exhausted to heal.`);
      await delay(400);
      battleButtons.forEach((btn) => {
        btn.disabled = false;
      });
      gameState.battle.locked = false;
      return;
    }
    playerMon.energy -= cost;
    const amount = calculateHeal(playerMon);
    playerMon.hp = Math.min(playerMon.maxHp, playerMon.hp + amount);
    logBattle(`${playerMon.name} restores ${amount} HP!`);
    updateBattleUI();
    await delay(600);
  } else if (action === 'run') {
    const chance = Math.min(0.95, playerMon.speed / (playerMon.speed + enemy.speed * 0.8));
    if (Math.random() < chance) {
      logBattle(`${playerMon.name} successfully fled!`);
      updateBattleUI();
      await delay(700);
      endBattle('You safely escaped the battle.');
      gameState.battle.locked = false;
      return;
    }
    logBattle(`${playerMon.name} tried to run, but the wild ${enemy.name} blocked the way!`);
    await delay(600);
  }

  await enemyTurn();
  if (gameState.battle.active) {
    battleButtons.forEach((btn) => {
      btn.disabled = false;
    });
    gameState.battle.locked = false;
  }
}

async function enemyTurn() {
  const playerMon = gameState.player.party[0];
  const enemy = gameState.battle.enemy;
  if (enemy.hp <= 0) return;
  await delay(350);

  const available = [];
  available.push('attack');
  if (enemy.energy > 8) available.push('special');
  if (enemy.energy > 5 && enemy.hp < enemy.maxHp * 0.7) available.push('heal');
  const action = available[Math.floor(Math.random() * available.length)];

  if (action === 'attack') {
    const damage = calculateDamage(enemy, playerMon, false);
    playerMon.hp = Math.max(0, playerMon.hp - damage);
    enemy.energy = Math.min(enemy.maxEnergy, enemy.energy + 2);
    logBattle(`Wild ${enemy.name} attacks for ${damage} damage.`);
  } else if (action === 'special') {
    enemy.energy -= 8;
    const damage = Math.round(calculateDamage(enemy, playerMon, true) * 1.25);
    playerMon.hp = Math.max(0, playerMon.hp - damage);
    logBattle(`Wild ${enemy.name} unleashes a fierce special for ${damage} damage!`);
  } else if (action === 'heal') {
    enemy.energy -= 5;
    const amount = calculateHeal(enemy);
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + amount);
    logBattle(`Wild ${enemy.name} regains ${amount} HP.`);
  }
  updateBattleUI();
  await delay(600);

  if (playerMon.hp <= 0) {
    logBattle(`${playerMon.name} has fainted!`);
    await delay(800);
    playerMon.hp = Math.max(1, Math.round(playerMon.maxHp * 0.35));
    playerMon.energy = Math.max(4, Math.round(playerMon.maxEnergy * 0.5));
    endBattle('You were overwhelmed, but your partner regains consciousness with renewed determination.');
  }
}

async function handleVictory(enemy) {
  const playerMon = gameState.player.party[0];
  logBattle(`Wild ${enemy.name} was defeated!`);
  await delay(600);
  const xpGain = Math.round(enemy.level * 15 + 10);
  playerMon.xp += xpGain;
  logBattle(`${playerMon.name} earned ${xpGain} experience.`);
  updateBattleUI();
  await delay(600);

  while (playerMon.xp >= xpForNextLevel(playerMon.level)) {
    playerMon.xp -= xpForNextLevel(playerMon.level);
    playerMon.level += 1;
    playerMon.maxHp += 6;
    playerMon.attack += 2;
    playerMon.specialPower += 2.5;
    playerMon.defense += 1.5;
    playerMon.speed += 0.8;
    playerMon.maxEnergy += 2;
    playerMon.hp = playerMon.maxHp;
    playerMon.energy = playerMon.maxEnergy;
    logBattle(`${playerMon.name} grew to level ${playerMon.level}! Stats improved.`);
    updateBattleUI();
    await delay(650);
  }

  endBattle('Victory! Keep exploring for more encounters.');
}

battleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    handlePlayerAction(button.dataset.action);
  });
});

function spawnWildCreature() {
  const template = WILD_POOL[Math.floor(Math.random() * WILD_POOL.length)];
  const playerMon = gameState.player.party[0];
  const level = Math.max(1, randomInt(playerMon.level - 1, playerMon.level + 2));
  const enemy = makeCreature(template, level);
  enemy.hp = enemy.maxHp;
  enemy.energy = enemy.maxEnergy;
  return enemy;
}

function tryEncounter(tileChar) {
  const chance = encounterChance(tileChar);
  if (chance > 0 && Math.random() < chance) {
    const enemy = spawnWildCreature();
    startBattle(enemy);
  }
}

function handleTileEffects(tileChar, isNewTile) {
  const tile = tileDefinitions[tileChar];
  if (!tile) return;
  if (isNewTile && tile.heal) {
    healParty();
  }
  if (tile.message) {
    if (isNewTile && gameState.lastMessageTile !== tileChar) {
      showDialogue(tile.message, 2600);
      gameState.lastMessageTile = tileChar;
    }
  } else if (isNewTile) {
    gameState.lastMessageTile = null;
  }
  if (isNewTile) {
    tryEncounter(tileChar);
  }
}

function updatePlayer(delta) {
  const player = gameState.player;
  if (gameState.mode !== 'explore') {
    return;
  }

  if (!player.moving) {
    const direction = nextDirection();
    if (direction) {
      const targetGridX = player.gridX + direction.dx;
      const targetGridY = player.gridY + direction.dy;
      if (isWalkable(targetGridX, targetGridY)) {
        player.moving = true;
        player.moveDir = direction;
        player.targetX = targetGridX * TILE_SIZE;
        player.targetY = targetGridY * TILE_SIZE;
      } else {
        showDialogue('Dense trees block your path.');
      }
    }
  }

  if (player.moving) {
    const step = MOVE_SPEED * delta;
    const dx = player.moveDir.dx * step;
    const dy = player.moveDir.dy * step;
    player.x += dx;
    player.y += dy;
    updateCamera();

    const reachedX = (player.moveDir.dx >= 0 && player.x >= player.targetX) || (player.moveDir.dx <= 0 && player.x <= player.targetX);
    const reachedY = (player.moveDir.dy >= 0 && player.y >= player.targetY) || (player.moveDir.dy <= 0 && player.y <= player.targetY);

    if ((player.moveDir.dx !== 0 && reachedX) || (player.moveDir.dy !== 0 && reachedY)) {
      player.x = player.targetX;
      player.y = player.targetY;
      player.gridX = Math.round(player.targetX / TILE_SIZE);
      player.gridY = Math.round(player.targetY / TILE_SIZE);
      player.moving = false;
      const tileChar = tileAt(player.gridX, player.gridY);
      const tileKey = `${player.gridX},${player.gridY}`;
      const isNewTile = tileKey !== player.lastTileKey;
      player.lastTileKey = tileKey;
      updateLocationLabel();
      handleTileEffects(tileChar, isNewTile);
    }
  } else {
    updateCamera();
  }
}

function drawWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE) - 1);
  const endCol = Math.min(WORLD_WIDTH - 1, Math.ceil((camera.x + camera.width) / TILE_SIZE) + 1);
  const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE) - 1);
  const endRow = Math.min(WORLD_HEIGHT - 1, Math.ceil((camera.y + camera.height) / TILE_SIZE) + 1);

  for (let y = startRow; y <= endRow; y += 1) {
    for (let x = startCol; x <= endCol; x += 1) {
      const tileChar = WORLD_ROWS[y][x];
      const tile = tileDefinitions[tileChar] ?? tileDefinitions.g;
      const posX = x * TILE_SIZE;
      const posY = y * TILE_SIZE;

      ctx.fillStyle = tile.color;
      ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

      switch (tileChar) {
        case '#':
        case 't': {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE / 2.4, TILE_SIZE / 2.4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#14532d';
          ctx.beginPath();
          ctx.ellipse(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2 - 4, TILE_SIZE / 2.8, TILE_SIZE / 2.8, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'g':
        case 'h':
        case 'w': {
          const sway = Math.sin(animationTime / 350 + x * 0.6 + y * 0.3);
          ctx.fillStyle = tile.overlay;
          ctx.beginPath();
          ctx.ellipse(
            posX + TILE_SIZE / 2,
            posY + TILE_SIZE / 2 + sway * (tileChar === 'h' ? 3 : 2),
            TILE_SIZE / 2.6,
            TILE_SIZE / 3,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          if (tileChar === 'w') {
            ctx.fillStyle = '#fef3c7';
            ctx.beginPath();
            ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          if (tileChar === 'h') {
            ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
            ctx.fillRect(posX + 6, posY + 6, TILE_SIZE - 12, TILE_SIZE - 12);
          }
          break;
        }
        case 'f': {
          ctx.fillStyle = '#b45309';
          for (let i = 2; i < TILE_SIZE; i += 6) {
            ctx.fillRect(posX + i, posY, 2, TILE_SIZE);
          }
          break;
        }
        case 'p': {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
          ctx.lineWidth = 2;
          ctx.strokeRect(posX + 2, posY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.beginPath();
          ctx.moveTo(posX, posY + TILE_SIZE / 2);
          ctx.lineTo(posX + TILE_SIZE, posY + TILE_SIZE / 2);
          ctx.stroke();
          break;
        }
        case 's': {
          ctx.fillStyle = 'rgba(250, 240, 137, 0.45)';
          for (let i = 0; i < 3; i += 1) {
            const offsetX = (i * 7 + x * 13 + y * 17) % (TILE_SIZE - 8);
            const offsetY = (i * 5 + x * 11 + y * 19) % (TILE_SIZE - 8);
            ctx.beginPath();
            ctx.arc(posX + 4 + offsetX, posY + 4 + offsetY, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case '~': {
          const gradient = ctx.createLinearGradient(posX, posY, posX, posY + TILE_SIZE);
          gradient.addColorStop(0, '#38bdf8');
          gradient.addColorStop(1, '#0c4a6e');
          ctx.fillStyle = gradient;
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
          ctx.beginPath();
          ctx.ellipse(
            posX + TILE_SIZE / 2,
            posY + TILE_SIZE / 2 + Math.sin(animationTime / 300 + x * 0.6) * 3,
            TILE_SIZE / 2.5,
            TILE_SIZE / 3.2,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          break;
        }
        case 'r': {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = 'rgba(248, 250, 252, 0.7)';
          ctx.fillRect(posX + 5, posY + 5, TILE_SIZE - 10, TILE_SIZE - 10);
          break;
        }
        case 'B': {
          ctx.fillStyle = '#111827';
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(posX + TILE_SIZE / 2, posY + 4);
          ctx.lineTo(posX + TILE_SIZE - 4, posY + TILE_SIZE - 4);
          ctx.lineTo(posX + 4, posY + TILE_SIZE - 4);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'b': {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(posX + 2, posY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(posX + 2, posY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          break;
        }
        case 'd': {
          const gradient = ctx.createLinearGradient(posX, posY, posX, posY + TILE_SIZE);
          gradient.addColorStop(0, '#facc15');
          gradient.addColorStop(1, '#b45309');
          ctx.fillStyle = gradient;
          ctx.fillRect(posX + 4, posY, TILE_SIZE - 8, TILE_SIZE);
          break;
        }
        case 'C': {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(posX, posY);
          ctx.lineTo(posX + TILE_SIZE, posY + TILE_SIZE);
          ctx.lineTo(posX, posY + TILE_SIZE);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'c': {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(posX + 4, posY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
          ctx.beginPath();
          ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'x': {
          const flicker = Math.sin(animationTime / 120 + x + y) * 2;
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE / 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fb923c';
          ctx.beginPath();
          ctx.moveTo(posX + TILE_SIZE / 2, posY + 6 - flicker);
          ctx.lineTo(posX + TILE_SIZE / 2 + 5, posY + TILE_SIZE / 2 + 4);
          ctx.lineTo(posX + TILE_SIZE / 2 - 5, posY + TILE_SIZE / 2 + 4);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case '^': {
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.moveTo(posX + TILE_SIZE / 2, posY + 4);
          ctx.lineTo(posX + TILE_SIZE - 4, posY + TILE_SIZE - 4);
          ctx.lineTo(posX + 4, posY + TILE_SIZE - 4);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.2)';
          ctx.beginPath();
          ctx.moveTo(posX + 6, posY + TILE_SIZE - 6);
          ctx.lineTo(posX + TILE_SIZE - 6, posY + TILE_SIZE - 12);
          ctx.stroke();
          break;
        }
        default: {
          if (tile.overlay) {
            ctx.fillStyle = tile.overlay;
            ctx.fillRect(posX + 6, posY + 6, TILE_SIZE - 12, TILE_SIZE - 12);
          }
        }
      }
    }
  }

  ctx.restore();
}

function drawPlayer() {
  const player = gameState.player;
  ctx.save();
  ctx.translate(player.x - camera.x + TILE_SIZE / 2, player.y - camera.y + TILE_SIZE / 2);
  const bob = Math.sin(animationTime / 220) * 2;
  ctx.translate(0, -bob);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, TILE_SIZE / 2.4, TILE_SIZE / 2.4, TILE_SIZE / 3.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.ellipse(0, TILE_SIZE / 8, TILE_SIZE / 3.1, TILE_SIZE / 2.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f97316';
  ctx.fillRect(-TILE_SIZE / 3.5, -TILE_SIZE / 5, TILE_SIZE / 7, TILE_SIZE / 2.2);

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(0, -TILE_SIZE / 3.2, TILE_SIZE / 3.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-TILE_SIZE / 3, -TILE_SIZE / 2.2, TILE_SIZE / 1.5, TILE_SIZE / 10);
  ctx.fillStyle = '#22d3ee';
  ctx.fillRect(-TILE_SIZE / 4, -TILE_SIZE / 2.4, TILE_SIZE / 2, TILE_SIZE / 12);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-TILE_SIZE / 4, TILE_SIZE / 6);
  ctx.lineTo(-TILE_SIZE / 2.5, TILE_SIZE / 3);
  ctx.moveTo(TILE_SIZE / 4, TILE_SIZE / 6);
  ctx.lineTo(TILE_SIZE / 2.5, TILE_SIZE / 3);
  ctx.stroke();
  ctx.restore();
}

let animationTime = 0;
let lastTimestamp = 0;
function loop(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }
  const delta = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
  animationTime = timestamp;

  updatePlayer(delta);
  drawWorld();
  drawPlayer();

  requestAnimationFrame(loop);
}

function initialize() {
  gameState.player.lastTileKey = `${gameState.player.gridX},${gameState.player.gridY}`;
  updateLocationLabel();
  updatePartyLabel();
  updateCamera();
  showDialogue('Welcome to Poke Adventure! Follow the stone road, cross the Silverstream, and discover hidden caverns.');
  requestAnimationFrame(loop);
}

initialize();
