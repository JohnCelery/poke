const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const dialogueBox = document.getElementById('dialogue');
const DIALOGUE_MODE_CLASS = 'dialogue--active';
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

function adjustColor(hex, amount) {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const numeric = parseInt(normalized, 16);
  let r = (numeric >> 16) + amount;
  let g = ((numeric >> 8) & 0xff) + amount;
  let b = (numeric & 0xff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function tileRandom(x, y, seed = 0) {
  const raw = Math.sin((x * 928371 + y * 57261 + seed * 18973) * 12.9898);
  return raw - Math.floor(raw);
}

function roundedRectPath(context, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
}

const TYPE_COLOR_MAP = {
  Starlight: '#60a5fa',
  Cascade: '#38bdf8',
  Verdant: '#4ade80',
  Spark: '#facc15',
  Stonebloom: '#f97316',
  Ember: '#fb7185',
};

const BATTLE_STARS = Array.from({ length: 110 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height * 0.45,
  twinkle: Math.random() * Math.PI * 2,
  radius: 0.8 + Math.random() * 1.6,
}));

const BATTLE_PARTICLES = Array.from({ length: 36 }, () => ({
  baseRadius: 40 + Math.random() * 120,
  offset: Math.random() * Math.PI * 2,
  orbitSpeed: 0.6 + Math.random() * 0.6,
  size: 1.8 + Math.random() * 2.6,
}));

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

const confirmKeys = new Set(['Enter', ' ', 'Space', 'Spacebar']);

window.addEventListener('keydown', (event) => {
  if (confirmKeys.has(event.key)) {
    if (gameState.mode === 'dialogue') {
      advanceDialogue(true);
    } else if (gameState.mode === 'explore') {
      tryInteractWithNpc();
    }
    event.preventDefault();
  } else if (gameState.mode === 'dialogue') {
    const numeric = parseInt(event.key, 10);
    if (!Number.isNaN(numeric) && numeric >= 1) {
      selectDialogueChoice(numeric - 1);
      event.preventDefault();
    }
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
  dialogue: {
    activeNpc: null,
    nodeId: null,
    pendingEffects: [],
    claimedRewards: new Set(),
  },
  npcs: [
    {
      id: 'river_scholar',
      name: 'River Scholar',
      gridX: 43,
      gridY: 6,
      facing: 'right',
      palette: { cloak: '#0f172a', trim: '#38bdf8', accent: '#f1f5f9' },
      idleSeed: 0.42,
      dialogue: {
        start: 'greeting',
        nodes: {
          greeting: {
            text: 'The Silverstream runs swift tonight. Its song changes with the moon—have you noticed?',
            choices: [
              { text: 'Ask about the river\'s secrets', next: 'secrets' },
              { text: 'Compliment their studies', next: 'compliment' },
              { text: 'Take your leave', next: null },
            ],
          },
          secrets: {
            text: 'Beneath the glimmer lies a current that only kindred spirits feel. Listen close near the old bridge.',
            next: 'closing',
            reward: {
              type: 'trigger',
              description: 'A lead for the hidden bridge resonance quest.',
              repeatable: false,
            },
          },
          compliment: {
            text: 'Knowledge flows best when shared. Should you uncover river stones, bring one and we\'ll learn together.',
            next: 'closing',
          },
          closing: {
            text: 'May the river guide your steps. Return when its melody changes.',
            choices: [{ text: 'Nod appreciatively', next: null }],
          },
        },
      },
    },
    {
      id: 'market_guard',
      name: 'Market Guard',
      gridX: 34,
      gridY: 24,
      facing: 'down',
      palette: { cloak: '#1e293b', trim: '#f97316', accent: '#facc15' },
      idleSeed: 0.18,
      dialogue: {
        start: 'post',
        nodes: {
          post: {
            text: 'Hey there! The bazaar is busier than ever. Anything you\'re looking for?',
            choices: [
              { text: 'Ask for travel tips', next: 'tips' },
              { text: 'Offer to help keep watch', next: 'watch' },
              { text: 'Say goodbye', next: null },
            ],
          },
          tips: {
            text: 'Merchants whisper of rare blooms in the north caverns. Stock up on tonics before heading out.',
            next: 'post',
          },
          watch: {
            text: 'Appreciated! Take this guard ration—keeps you going on long patrols.',
            choices: [
              {
                text: 'Accept the ration',
                next: 'post',
                reward: { type: 'item', description: 'Guard Ration', repeatable: false },
              },
            ],
          },
        },
      },
    },
    {
      id: 'cavern_scout',
      name: 'Cavern Scout',
      gridX: 18,
      gridY: 30,
      facing: 'left',
      palette: { cloak: '#0f172a', trim: '#64748b', accent: '#94a3b8' },
      idleSeed: 0.67,
      dialogue: {
        start: 'camp',
        nodes: {
          camp: {
            text: 'Darkness breathes in the caverns. I map new tunnels each night.',
            choices: [
              { text: 'Request a map fragment', next: 'fragment' },
              { text: 'Share your own findings', next: 'share' },
              { text: 'Wish them luck', next: null },
            ],
          },
          fragment: {
            text: 'Here. This sketch marks a cavern bloom rumored to awaken stonefolk.',
            next: null,
            reward: { type: 'item', description: 'Cavern Map Fragment', repeatable: false },
          },
          share: {
            text: 'Interesting... our paths cross beneath the ridge then. I will adjust tomorrow\'s survey.',
            next: 'camp',
          },
        },
      },
    },
    {
      id: 'campfire_minstrel',
      name: 'Campfire Minstrel',
      gridX: 22,
      gridY: 22,
      facing: 'up',
      palette: { cloak: '#b45309', trim: '#fde68a', accent: '#f8fafc' },
      idleSeed: 0.91,
      dialogue: {
        start: 'greeting',
        nodes: {
          greeting: {
            text: 'Care for a tune? These strings know tales of heroes and hearths.',
            choices: [
              { text: 'Listen to a soothing ballad', next: 'ballad' },
              { text: 'Request an energetic melody', next: 'melody' },
              { text: 'Decline politely', next: null },
            ],
          },
          ballad: {
            text: 'The song wraps around you like warm embers. Your companions breathe easier.',
            next: null,
            reward: { type: 'heal', repeatable: true },
          },
          melody: {
            text: 'The chords spark with energy! Your lead partner feels ready for any challenge.',
            next: null,
            reward: { type: 'xp', amount: 18, repeatable: false },
          },
        },
      },
    },
  ],
};

const npcByTile = new Map();

function buildNpcSpatialIndex() {
  npcByTile.clear();
  gameState.npcs.forEach((npc) => {
    const key = `${npc.gridX},${npc.gridY}`;
    if (!npcByTile.has(key)) {
      npcByTile.set(key, []);
    }
    npcByTile.get(key).push(npc);
  });
}

function nearbyNpc() {
  const { gridX, gridY } = gameState.player;
  const offsets = [
    { dx: 0, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];
  for (const { dx, dy } of offsets) {
    const key = `${gridX + dx},${gridY + dy}`;
    const candidates = npcByTile.get(key);
    if (candidates?.length) {
      return candidates[0];
    }
  }
  return null;
}

function resetDialogueEffects() {
  gameState.dialogue.pendingEffects = [];
}

function queueDialogueEffect(effect) {
  if (!effect) return;
  const { activeNpc, claimedRewards, pendingEffects } = gameState.dialogue;
  if (!activeNpc) return;
  const keyParts = [activeNpc.id];
  if (effect.type === 'reward') {
    const reward = effect.reward;
    if (!reward) return;
    const identifier = `${reward.type ?? 'unknown'}:${reward.description ?? ''}:${reward.amount ?? ''}`;
    keyParts.push(identifier);
    if (!reward.repeatable && claimedRewards.has(keyParts.join('|'))) {
      return;
    }
    if (!reward.repeatable) {
      claimedRewards.add(keyParts.join('|'));
    }
  }
  pendingEffects.push(effect);
}

function applyPendingDialogueEffects() {
  const { pendingEffects } = gameState.dialogue;
  if (!pendingEffects.length) {
    return;
  }

  const messages = [];
  pendingEffects.forEach((effect) => {
    if (effect.type === 'reward') {
      const reward = effect.reward ?? {};
      switch (reward.type) {
        case 'item':
          messages.push(`Received ${reward.description ?? 'an item'}!`);
          break;
        case 'xp': {
          const amount = reward.amount ?? 0;
          if (amount > 0) {
            const lead = gameState.player.party[0];
            if (lead) {
              lead.xp += amount;
              messages.push(`${lead.name} gained ${amount} experience.`);
              let leveled = false;
              while (lead.xp >= xpForNextLevel(lead.level)) {
                lead.xp -= xpForNextLevel(lead.level);
                lead.level += 1;
                lead.maxHp += 6;
                lead.attack += 2;
                lead.specialPower += 2.5;
                lead.defense += 1.5;
                lead.speed += 0.8;
                lead.maxEnergy += 2;
                lead.hp = lead.maxHp;
                lead.energy = lead.maxEnergy;
                leveled = true;
              }
              if (leveled) {
                messages.push(`${lead.name} grew to level ${lead.level}!`);
              }
              updatePartyLabel();
            }
          }
          break;
        }
        case 'heal': {
          gameState.player.party.forEach((mon) => {
            mon.hp = mon.maxHp;
            mon.energy = mon.maxEnergy;
          });
          updatePartyLabel();
          messages.push('Your party feels revitalized.');
          break;
        }
        case 'trigger':
          messages.push(reward.description ?? 'A new lead has been noted.');
          break;
        default:
          if (reward.description) {
            messages.push(reward.description);
          }
          break;
      }
      if (reward.type !== 'heal') {
        // For heal we already called healParty which shows a message, avoid duplicates.
      }
    } else if (effect.type === 'trigger') {
      messages.push(effect.description ?? 'A new opportunity arises.');
    }
  });

  if (messages.length) {
    const combinedMessage = messages.join(' ');
    const duration = Math.min(6000, 2200 + combinedMessage.length * 20);
    showMessage(combinedMessage, duration);
  }
  resetDialogueEffects();
}

function endDialogue() {
  gameState.mode = 'explore';
  dialogueBox.classList.remove(DIALOGUE_MODE_CLASS);
  dialogueBox.innerHTML = '';
  applyPendingDialogueEffects();
  gameState.dialogue.activeNpc = null;
  gameState.dialogue.nodeId = null;
}

function renderDialogueNode() {
  const { activeNpc, nodeId } = gameState.dialogue;
  if (!activeNpc) {
    endDialogue();
    return;
  }
  const node = activeNpc.dialogue?.nodes?.[nodeId];
  if (!node) {
    endDialogue();
    return;
  }

  dialogueBox.classList.add(DIALOGUE_MODE_CLASS);
  dialogueBox.innerHTML = '';

  const speaker = document.createElement('h2');
  speaker.className = 'dialogue__speaker';
  speaker.textContent = activeNpc.name;
  dialogueBox.appendChild(speaker);

  const text = document.createElement('p');
  text.className = 'dialogue__text';
  text.textContent = node.text;
  dialogueBox.appendChild(text);

  if (node.reward) {
    queueDialogueEffect({ type: 'reward', reward: node.reward });
  }

  const choices = node.choices ?? [];
  if (choices.length) {
    const choicesContainer = document.createElement('div');
    choicesContainer.className = 'dialogue__choices';
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dialogue__choice';
      button.dataset.choiceIndex = index.toString();
      button.textContent = `${index + 1}. ${choice.text}`;
      button.addEventListener('click', () => {
        selectDialogueChoice(index);
      });
      choicesContainer.appendChild(button);
    });
    const prompt = document.createElement('p');
    prompt.className = 'dialogue__prompt';
    prompt.textContent = 'Press the matching number or Enter to choose the first option.';
    dialogueBox.appendChild(choicesContainer);
    dialogueBox.appendChild(prompt);
  } else {
    const prompt = document.createElement('p');
    prompt.className = 'dialogue__prompt';
    prompt.textContent = node.next ? 'Press Enter to continue.' : 'Press Enter to conclude the conversation.';
    dialogueBox.appendChild(prompt);
  }
}

function advanceDialogue(defaultToFirstChoice = true) {
  const { activeNpc, nodeId } = gameState.dialogue;
  if (!activeNpc) {
    return;
  }
  const node = activeNpc.dialogue?.nodes?.[nodeId];
  if (!node) {
    endDialogue();
    return;
  }

  if (node.choices?.length) {
    if (defaultToFirstChoice) {
      selectDialogueChoice(0);
    }
    return;
  }

  if (node.next) {
    gameState.dialogue.nodeId = node.next;
    renderDialogueNode();
  } else {
    endDialogue();
  }
}

function selectDialogueChoice(index) {
  const { activeNpc, nodeId } = gameState.dialogue;
  if (!activeNpc) {
    return;
  }
  const node = activeNpc.dialogue?.nodes?.[nodeId];
  if (!node?.choices?.length) {
    return;
  }
  const choice = node.choices[index];
  if (!choice) {
    return;
  }
  if (choice.reward) {
    queueDialogueEffect({ type: 'reward', reward: choice.reward });
  }
  if (choice.next) {
    gameState.dialogue.nodeId = choice.next;
    renderDialogueNode();
  } else {
    endDialogue();
  }
}

function startDialogue(npc) {
  if (!npc?.dialogue?.nodes) {
    showMessage(`${npc?.name ?? 'The figure'} has nothing to discuss right now.`, 2200);
    return;
  }
  if (gameState.messageTimer) {
    clearTimeout(gameState.messageTimer);
    gameState.messageTimer = null;
  }
  resetDialogueEffects();
  gameState.mode = 'dialogue';
  gameState.dialogue.activeNpc = npc;
  const startNode = npc.dialogue.start ?? Object.keys(npc.dialogue.nodes)[0];
  if (!startNode || !npc.dialogue.nodes[startNode]) {
    gameState.mode = 'explore';
    showMessage(`${npc.name} pauses, unsure what to share.`, 2000);
    return;
  }
  gameState.dialogue.nodeId = startNode;
  renderDialogueNode();
}

function tryInteractWithNpc() {
  if (gameState.mode !== 'explore') {
    return;
  }
  const npc = nearbyNpc();
  if (npc) {
    startDialogue(npc);
  } else {
    showMessage('There is no one nearby to speak with.', 1600);
  }
}

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

function showMessage(message, duration = 2200) {
  if (gameState.messageTimer) {
    clearTimeout(gameState.messageTimer);
  }
  if (gameState.mode === 'dialogue') {
    return;
  }
  dialogueBox.classList.remove(DIALOGUE_MODE_CLASS);
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
  showMessage('Your party feels refreshed after resting by the campfire!', 2800);
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
  showMessage('Battle start! Choose an action.', 1500);
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
    showMessage(message, 2600);
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
      showMessage(tile.message, 2600);
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
        showMessage('Dense trees block your path.');
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

      const baseGradient = ctx.createLinearGradient(posX, posY, posX, posY + TILE_SIZE);
      baseGradient.addColorStop(0, adjustColor(tile.color, 18));
      baseGradient.addColorStop(1, adjustColor(tile.color, -18));
      ctx.fillStyle = baseGradient;
      ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

      switch (tileChar) {
        case '#':
        case 't': {
          const trunkWidth = TILE_SIZE / 5;
          ctx.fillStyle = '#3f2c1c';
          ctx.fillRect(posX + TILE_SIZE / 2 - trunkWidth / 2, posY + TILE_SIZE / 2, trunkWidth, TILE_SIZE / 2);

          const canopyGradient = ctx.createRadialGradient(
            posX + TILE_SIZE / 2,
            posY + TILE_SIZE / 3,
            TILE_SIZE / 5,
            posX + TILE_SIZE / 2,
            posY + TILE_SIZE / 3,
            TILE_SIZE / 1.4,
          );
          canopyGradient.addColorStop(0, adjustColor(tile.overlay ?? tile.color, 40));
          canopyGradient.addColorStop(1, tile.overlay ?? tile.color);
          ctx.fillStyle = canopyGradient;
          ctx.beginPath();
          ctx.moveTo(posX + TILE_SIZE / 2, posY - 2);
          ctx.bezierCurveTo(posX + TILE_SIZE, posY + 4, posX + TILE_SIZE * 0.9, posY + TILE_SIZE * 0.9, posX + TILE_SIZE / 2, posY + TILE_SIZE * 0.8);
          ctx.bezierCurveTo(posX + TILE_SIZE * 0.1, posY + TILE_SIZE * 0.9, posX, posY + 4, posX + TILE_SIZE / 2, posY - 2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.beginPath();
          ctx.ellipse(posX + TILE_SIZE / 2, posY + TILE_SIZE / 4, TILE_SIZE / 3.2, TILE_SIZE / 4.2, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'g':
        case 'h':
        case 'w': {
          const tuftCount = 5 + Math.floor(tileRandom(x, y) * 5);
          for (let i = 0; i < tuftCount; i += 1) {
            const offset = tileRandom(x, y, i) * (TILE_SIZE - 6) + 3;
            const sway = Math.sin(animationTime / 320 + (x + i) * 0.5 + y * 0.35) * 3;
            const height = TILE_SIZE / 2.4 + tileRandom(x, y, i + 7) * 7 + (tileChar === 'h' ? 6 : 0);
            ctx.strokeStyle = adjustColor(tile.overlay ?? tile.color, 20);
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(posX + offset, posY + TILE_SIZE - 3);
            ctx.quadraticCurveTo(
              posX + offset + sway * 0.6,
              posY + TILE_SIZE - height / 2,
              posX + offset + sway,
              posY + TILE_SIZE - height,
            );
            ctx.stroke();

            if (tileChar === 'w' && tileRandom(x, y, i + 31) > 0.65) {
              ctx.fillStyle = ['#f5d0c5', '#fde68a', '#f9a8d4'][Math.floor(tileRandom(x, y, i + 12) * 3)];
              ctx.beginPath();
              ctx.arc(posX + offset + sway * 0.3, posY + TILE_SIZE - height - 3, 2.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          if (tileChar === 'h') {
            ctx.fillStyle = 'rgba(74, 222, 128, 0.28)';
            ctx.fillRect(posX + 4, posY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, 6 + Math.sin(animationTime / 450 + x) * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'f': {
          const furrowSpacing = 5;
          ctx.strokeStyle = 'rgba(107, 70, 32, 0.75)';
          ctx.lineWidth = 1.5;
          for (let i = 1; i < TILE_SIZE; i += furrowSpacing) {
            ctx.beginPath();
            ctx.moveTo(posX, posY + i);
            ctx.lineTo(posX + TILE_SIZE, posY + i + tileRandom(x, y, i) * 2);
            ctx.stroke();
          }
          if (tileRandom(x, y, 8) > 0.4) {
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.moveTo(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2 - 6);
            ctx.lineTo(posX + TILE_SIZE / 2 + 3, posY + TILE_SIZE / 2 + 4);
            ctx.lineTo(posX + TILE_SIZE / 2 - 3, posY + TILE_SIZE / 2 + 4);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case 'p': {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.lineWidth = 2;
          ctx.strokeRect(posX + 1.5, posY + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
          ctx.lineWidth = 1;
          for (let i = 0; i < 3; i += 1) {
            const stoneSize = 3 + tileRandom(x, y, i) * 4;
            ctx.fillStyle = `rgba(148, 163, 184, ${0.25 + tileRandom(x, y, i + 20) * 0.35})`;
            ctx.beginPath();
            ctx.ellipse(
              posX + 6 + tileRandom(x, y, i + 4) * (TILE_SIZE - 12),
              posY + 6 + tileRandom(x, y, i + 6) * (TILE_SIZE - 12),
              stoneSize,
              stoneSize * 0.6,
              tileRandom(x, y, i + 9) * Math.PI,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
          break;
        }
        case 's': {
          ctx.fillStyle = 'rgba(250, 240, 137, 0.35)';
          for (let i = 0; i < 4; i += 1) {
            const grainX = posX + tileRandom(x, y, i) * TILE_SIZE;
            const grainY = posY + tileRandom(x, y, i + 11) * TILE_SIZE;
            ctx.beginPath();
            ctx.arc(grainX, grainY, 1.5 + tileRandom(x, y, i + 17), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.strokeStyle = 'rgba(244, 209, 98, 0.3)';
          ctx.beginPath();
          ctx.moveTo(posX, posY + TILE_SIZE - 4);
          ctx.quadraticCurveTo(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, posX + TILE_SIZE, posY + TILE_SIZE - 6);
          ctx.stroke();
          break;
        }
        case '~': {
          const waterGradient = ctx.createLinearGradient(posX, posY, posX, posY + TILE_SIZE);
          waterGradient.addColorStop(0, '#38bdf8');
          waterGradient.addColorStop(0.5, '#0ea5e9');
          waterGradient.addColorStop(1, '#0c4a6e');
          ctx.fillStyle = waterGradient;
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 2; i += 1) {
            const wave = Math.sin(animationTime / 280 + (x + i) * 0.9) * 4;
            ctx.beginPath();
            ctx.moveTo(posX + 2, posY + TILE_SIZE / 2 + i * 5 + wave);
            ctx.quadraticCurveTo(
              posX + TILE_SIZE / 2,
              posY + TILE_SIZE / 2 - 3 + wave,
              posX + TILE_SIZE - 2,
              posY + TILE_SIZE / 2 + i * 5 + wave,
            );
            ctx.stroke();
          }
          break;
        }
        case 'r': {
          const shallowGradient = ctx.createLinearGradient(posX, posY, posX, posY + TILE_SIZE);
          shallowGradient.addColorStop(0, '#bae6fd');
          shallowGradient.addColorStop(1, '#38bdf8');
          ctx.fillStyle = shallowGradient;
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = 'rgba(248, 250, 252, 0.65)';
          roundedRectPath(ctx, posX + 4, posY + 4, TILE_SIZE - 8, TILE_SIZE - 8, 6);
          ctx.fill();
          break;
        }
        case 'B': {
          ctx.fillStyle = '#111827';
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
          ctx.lineWidth = 2;
          ctx.strokeRect(posX + 2, posY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.2)';
          ctx.beginPath();
          ctx.moveTo(posX + 4, posY + TILE_SIZE / 2);
          ctx.lineTo(posX + TILE_SIZE - 4, posY + TILE_SIZE / 2);
          ctx.moveTo(posX + TILE_SIZE / 2, posY + 4);
          ctx.lineTo(posX + TILE_SIZE / 2, posY + TILE_SIZE - 4);
          ctx.stroke();
          break;
        }
        case 'b': {
          const floorGradient = ctx.createLinearGradient(posX, posY, posX + TILE_SIZE, posY + TILE_SIZE);
          floorGradient.addColorStop(0, '#475569');
          floorGradient.addColorStop(1, '#64748b');
          ctx.fillStyle = floorGradient;
          ctx.fillRect(posX + 2, posY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.25)';
          ctx.lineWidth = 1;
          ctx.strokeRect(posX + 3, posY + 3, TILE_SIZE - 6, TILE_SIZE - 6);
          break;
        }
        case 'd': {
          const doorGradient = ctx.createLinearGradient(posX, posY, posX, posY + TILE_SIZE);
          doorGradient.addColorStop(0, '#fde68a');
          doorGradient.addColorStop(1, '#b45309');
          ctx.fillStyle = doorGradient;
          roundedRectPath(ctx, posX + 5, posY + 2, TILE_SIZE - 10, TILE_SIZE - 4, 6);
          ctx.fill();
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(posX + TILE_SIZE - 10, posY + TILE_SIZE / 2, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'C': {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(posX, posY + TILE_SIZE);
          ctx.lineTo(posX + TILE_SIZE / 2, posY + TILE_SIZE / 3);
          ctx.lineTo(posX + TILE_SIZE, posY + TILE_SIZE);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
          ctx.beginPath();
          ctx.moveTo(posX + TILE_SIZE / 2, posY + TILE_SIZE / 3);
          ctx.lineTo(posX + TILE_SIZE * 0.65, posY + TILE_SIZE);
          ctx.lineTo(posX + TILE_SIZE * 0.35, posY + TILE_SIZE);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'c': {
          ctx.fillStyle = '#111827';
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#1f2937';
          roundedRectPath(ctx, posX + 3, posY + 3, TILE_SIZE - 6, TILE_SIZE - 6, 4);
          ctx.fill();
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.beginPath();
          ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, 4, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'x': {
          const flicker = Math.sin(animationTime / 120 + x + y) * 3;
          ctx.fillStyle = '#4b5563';
          ctx.beginPath();
          ctx.moveTo(posX + 6, posY + TILE_SIZE - 4);
          ctx.lineTo(posX + TILE_SIZE / 2, posY + TILE_SIZE - 10);
          ctx.lineTo(posX + TILE_SIZE - 6, posY + TILE_SIZE - 4);
          ctx.lineTo(posX + TILE_SIZE / 2, posY + TILE_SIZE - 2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE / 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde68a';
          ctx.beginPath();
          ctx.moveTo(posX + TILE_SIZE / 2, posY + TILE_SIZE / 4 - flicker);
          ctx.lineTo(posX + TILE_SIZE / 2 + 6, posY + TILE_SIZE / 2 + flicker / 2);
          ctx.lineTo(posX + TILE_SIZE / 2 - 6, posY + TILE_SIZE / 2 + flicker / 2);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case '^': {
          const rockGradient = ctx.createLinearGradient(posX, posY, posX, posY + TILE_SIZE);
          rockGradient.addColorStop(0, '#64748b');
          rockGradient.addColorStop(1, '#334155');
          ctx.fillStyle = rockGradient;
          ctx.beginPath();
          ctx.moveTo(posX + TILE_SIZE / 2, posY + 2);
          ctx.lineTo(posX + TILE_SIZE - 4, posY + TILE_SIZE - 2);
          ctx.lineTo(posX + 4, posY + TILE_SIZE - 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.25)';
          ctx.beginPath();
          ctx.moveTo(posX + TILE_SIZE / 2, posY + 6);
          ctx.lineTo(posX + TILE_SIZE / 2, posY + TILE_SIZE - 8);
          ctx.moveTo(posX + 10, posY + TILE_SIZE - 10);
          ctx.lineTo(posX + TILE_SIZE - 10, posY + TILE_SIZE - 14);
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

function drawNPCs() {
  gameState.npcs.forEach((npc) => {
    const screenX = npc.gridX * TILE_SIZE - camera.x;
    const screenY = npc.gridY * TILE_SIZE - camera.y;
    if (
      screenX + TILE_SIZE < -TILE_SIZE ||
      screenX > canvas.width + TILE_SIZE ||
      screenY + TILE_SIZE < -TILE_SIZE ||
      screenY > canvas.height + TILE_SIZE
    ) {
      return;
    }

    ctx.save();
    ctx.translate(screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2);
    const idleSeed = npc.idleSeed ?? 0;
    const bob = Math.sin(animationTime / (240 + idleSeed * 120) + idleSeed * Math.PI * 2) * 2.2;
    ctx.translate(0, -bob);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, TILE_SIZE / 2.4, TILE_SIZE / 2.4, TILE_SIZE / 3.3, 0, 0, Math.PI * 2);
    ctx.fill();

    const palette = npc.palette ?? {};
    const cloakColor = palette.cloak ?? '#334155';
    const trimColor = palette.trim ?? adjustColor(cloakColor, 26);
    const accentColor = palette.accent ?? '#f8fafc';
    const facing = npc.facing ?? 'down';

    if (facing === 'left') {
      ctx.scale(-1, 1);
    }

    const cloakGradient = ctx.createLinearGradient(0, -TILE_SIZE / 2, 0, TILE_SIZE / 2);
    cloakGradient.addColorStop(0, adjustColor(cloakColor, 18));
    cloakGradient.addColorStop(1, adjustColor(cloakColor, -18));
    ctx.fillStyle = cloakGradient;
    ctx.beginPath();
    ctx.moveTo(-TILE_SIZE / 3.5, -TILE_SIZE / 8);
    ctx.bezierCurveTo(-TILE_SIZE / 3.7, TILE_SIZE / 2.4, TILE_SIZE / 3.7, TILE_SIZE / 2.4, TILE_SIZE / 3.5, -TILE_SIZE / 8);
    ctx.quadraticCurveTo(0, TILE_SIZE / 3.2, -TILE_SIZE / 3.5, -TILE_SIZE / 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.beginPath();
    ctx.moveTo(-TILE_SIZE / 4.2, TILE_SIZE / 12);
    ctx.lineTo(TILE_SIZE / 4.2, TILE_SIZE / 12);
    ctx.quadraticCurveTo(0, TILE_SIZE / 3.6, -TILE_SIZE / 4.2, TILE_SIZE / 12);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (facing === 'up') {
      ctx.moveTo(-TILE_SIZE / 5, -TILE_SIZE / 6);
      ctx.lineTo(0, -TILE_SIZE / 3);
      ctx.lineTo(TILE_SIZE / 5, -TILE_SIZE / 6);
    } else {
      ctx.moveTo(-TILE_SIZE / 5, TILE_SIZE / 9);
      ctx.lineTo(-TILE_SIZE / 3.4, TILE_SIZE / 3.3);
      ctx.moveTo(TILE_SIZE / 5, TILE_SIZE / 9);
      ctx.lineTo(TILE_SIZE / 3.4, TILE_SIZE / 3.3);
    }
    ctx.stroke();

    if (facing === 'right') {
      ctx.fillStyle = adjustColor(trimColor, 18);
      ctx.fillRect(TILE_SIZE / 4.5, -TILE_SIZE / 6, 3, TILE_SIZE / 2.6);
    }

    ctx.restore();
  });
}

function drawPlayer() {
  const player = gameState.player;
  ctx.save();
  ctx.translate(player.x - camera.x + TILE_SIZE / 2, player.y - camera.y + TILE_SIZE / 2);
  const bob = Math.sin(animationTime / 220) * 2.5;
  ctx.translate(0, -bob);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, TILE_SIZE / 2.2, TILE_SIZE / 2, TILE_SIZE / 3.1, 0, 0, Math.PI * 2);
  ctx.fill();

  const cloakGradient = ctx.createLinearGradient(0, -TILE_SIZE / 2, 0, TILE_SIZE / 2);
  cloakGradient.addColorStop(0, '#1e3a8a');
  cloakGradient.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = cloakGradient;
  ctx.beginPath();
  ctx.moveTo(-TILE_SIZE / 3.2, -TILE_SIZE / 8);
  ctx.bezierCurveTo(-TILE_SIZE / 3.5, TILE_SIZE / 2.4, TILE_SIZE / 3.5, TILE_SIZE / 2.4, TILE_SIZE / 3.2, -TILE_SIZE / 8);
  ctx.quadraticCurveTo(0, TILE_SIZE / 3, -TILE_SIZE / 3.2, -TILE_SIZE / 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.moveTo(-TILE_SIZE / 4, TILE_SIZE / 12);
  ctx.lineTo(TILE_SIZE / 4, TILE_SIZE / 12);
  ctx.lineTo(TILE_SIZE / 8, TILE_SIZE / 3.1);
  ctx.lineTo(-TILE_SIZE / 8, TILE_SIZE / 3.1);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-TILE_SIZE / 4, TILE_SIZE / 10);
  ctx.lineTo(-TILE_SIZE / 2.5, TILE_SIZE / 3);
  ctx.moveTo(TILE_SIZE / 4, TILE_SIZE / 10);
  ctx.lineTo(TILE_SIZE / 2.5, TILE_SIZE / 3);
  ctx.stroke();

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(0, -TILE_SIZE / 3.4, TILE_SIZE / 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(-TILE_SIZE / 6, -TILE_SIZE / 3.4, TILE_SIZE / 6, Math.PI * 0.8, Math.PI * 1.6, true);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  roundedRectPath(ctx, -TILE_SIZE / 2.8, -TILE_SIZE / 2.1, TILE_SIZE / 1.4, TILE_SIZE / 6, 4);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-TILE_SIZE / 4, -TILE_SIZE / 2.4, TILE_SIZE / 2, TILE_SIZE / 12);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-TILE_SIZE / 10, -TILE_SIZE / 3.6, TILE_SIZE / 30, 0, Math.PI * 2);
  ctx.arc(TILE_SIZE / 10, -TILE_SIZE / 3.6, TILE_SIZE / 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-TILE_SIZE / 8, -TILE_SIZE / 2.8);
  ctx.quadraticCurveTo(0, -TILE_SIZE / 2.2, TILE_SIZE / 8, -TILE_SIZE / 2.8);
  ctx.stroke();

  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(-TILE_SIZE / 6, TILE_SIZE / 3.2, TILE_SIZE / 10, 0, Math.PI * 2);
  ctx.arc(TILE_SIZE / 6, TILE_SIZE / 3.2, TILE_SIZE / 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBattleCreature(mon, side) {
  if (!mon) return;
  const baseX = side === 'player' ? canvas.width * 0.28 : canvas.width * 0.72;
  const baseY = side === 'player' ? canvas.height * 0.68 : canvas.height * 0.42;
  const primaryColor = TYPE_COLOR_MAP[mon.type] ?? '#38bdf8';
  const highlight = adjustColor(primaryColor, 70);
  const shadow = adjustColor(primaryColor, -70);

  ctx.save();
  ctx.translate(baseX, baseY);
  const mirror = side === 'player' ? 1 : -1;
  ctx.scale(mirror, 1);
  const float = Math.sin(animationTime / 320 + (side === 'player' ? 0 : Math.PI)) * 3;
  ctx.translate(0, float);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 40, 70, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyGradient = ctx.createRadialGradient(0, -18, 12, 0, -18, 80);
  bodyGradient.addColorStop(0, highlight);
  bodyGradient.addColorStop(1, shadow);
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(0, -12, 68, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = adjustColor(primaryColor, 40);
  ctx.beginPath();
  ctx.moveTo(-54, -8);
  ctx.quadraticCurveTo(-30, -34, -12, -12);
  ctx.quadraticCurveTo(-32, 12, -54, -8);
  ctx.fill();

  ctx.fillStyle = adjustColor(primaryColor, 20);
  ctx.beginPath();
  ctx.moveTo(32, -36);
  ctx.quadraticCurveTo(58, -6, 16, 18);
  ctx.lineTo(12, -6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(248, 250, 252, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-12, -28, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-18, -18, 4.5, 0, Math.PI * 2);
  ctx.arc(6, -18, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = adjustColor(primaryColor, 90);
  ctx.beginPath();
  ctx.moveTo(-8, 6);
  ctx.quadraticCurveTo(0, 20, 18, 10);
  ctx.quadraticCurveTo(2, 4, -8, 6);
  ctx.fill();

  ctx.restore();
}

function drawBattleScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const horizon = canvas.height * 0.45;

  const skyGradient = ctx.createLinearGradient(0, 0, 0, horizon);
  skyGradient.addColorStop(0, '#020617');
  skyGradient.addColorStop(0.5, '#0f172a');
  skyGradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, horizon);

  BATTLE_STARS.forEach((star) => {
    const twinkle = (Math.sin(animationTime / 500 + star.twinkle) + 1) / 2;
    ctx.fillStyle = `rgba(248, 250, 252, ${0.25 + twinkle * 0.55})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius + twinkle, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let layer = 0; layer < 4; layer += 1) {
    const depth = 1 - layer / 4;
    const offset = layer * 30;
    ctx.fillStyle = `rgba(30, 64, 175, ${0.08 + depth * 0.18})`;
    ctx.beginPath();
    ctx.moveTo(0, horizon - offset);
    for (let i = 0; i <= 6; i += 1) {
      const peakX = (canvas.width / 6) * i;
      const peakHeight = Math.sin(animationTime / 900 + i * 0.7 + layer) * 12;
      const controlX = peakX + canvas.width / 12;
      const controlY = horizon - offset - 40 - peakHeight - layer * 12;
      ctx.quadraticCurveTo(controlX, controlY, peakX + canvas.width / 6, horizon - offset);
    }
    ctx.lineTo(canvas.width, horizon + 60);
    ctx.lineTo(0, horizon + 60);
    ctx.closePath();
    ctx.fill();
  }

  const groundGradient = ctx.createLinearGradient(0, horizon, 0, canvas.height);
  groundGradient.addColorStop(0, '#1f2937');
  groundGradient.addColorStop(1, '#0b1120');
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    const y = horizon + (i * (canvas.height - horizon)) / 10;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y + 30);
    ctx.stroke();
  }
  for (let i = -6; i <= 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 + i * 60, horizon);
    ctx.lineTo(canvas.width / 2 + i * 30, canvas.height);
    ctx.stroke();
  }

  const stagePositions = {
    player: { x: canvas.width * 0.28, y: canvas.height * 0.72 },
    enemy: { x: canvas.width * 0.72, y: canvas.height * 0.48 },
  };

  Object.entries(stagePositions).forEach(([side, position]) => {
    const baseColor = side === 'player' ? 'rgba(37, 99, 235, 0.28)' : 'rgba(244, 114, 182, 0.28)';
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 120, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -8, 80, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });

  BATTLE_PARTICLES.forEach((particle, index) => {
    const target = index % 2 === 0 ? stagePositions.player : stagePositions.enemy;
    const angle = animationTime / 700 * particle.orbitSpeed + particle.offset;
    const radius = particle.baseRadius + Math.sin(animationTime / 600 + particle.offset) * 18;
    const x = target.x + Math.cos(angle) * radius;
    const y = target.y - 30 + Math.sin(angle) * radius * 0.4;
    ctx.fillStyle = `rgba(148, 163, 184, ${0.15 + (index % 2) * 0.15})`;
    ctx.beginPath();
    ctx.arc(x, y, particle.size + Math.sin(animationTime / 480 + particle.offset) * 0.6, 0, Math.PI * 2);
    ctx.fill();
  });

  const playerMon = gameState.player.party[0];
  const enemyMon = gameState.battle.enemy;
  drawBattleCreature(playerMon, 'player');
  drawBattleCreature(enemyMon, 'enemy');

  ctx.save();
  ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
  ctx.font = '700 22px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('VS', canvas.width / 2, horizon + 36);

  ctx.font = '16px "Press Start 2P", monospace';
  ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
  ctx.fillText(playerMon.name, stagePositions.player.x, stagePositions.player.y + 70);
  if (enemyMon) {
    ctx.fillText(enemyMon.name, stagePositions.enemy.x, stagePositions.enemy.y - 70);
  }
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
  if (gameState.mode === 'battle') {
    drawBattleScene();
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWorld();
    drawNPCs();
    drawPlayer();
  }

  requestAnimationFrame(loop);
}

function initialize() {
  buildNpcSpatialIndex();
  gameState.player.lastTileKey = `${gameState.player.gridX},${gameState.player.gridY}`;
  updateLocationLabel();
  updatePartyLabel();
  updateCamera();
  showMessage('Welcome to Poke Adventure! Follow the stone road, cross the Silverstream, and discover hidden caverns.');
  requestAnimationFrame(loop);
}

initialize();
