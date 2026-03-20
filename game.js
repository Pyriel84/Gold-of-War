// ========== CONSTANTES ET VARIABLES ==========
const GAME_STATES = {
    EXPLORING: 'exploring',
    COMBAT: 'combat',
    SHOPPING: 'shopping',
    GAME_OVER: 'game_over'
};

let currentGameState = GAME_STATES.EXPLORING;
let currentEnemy = null;

// Joueur
let player = {
    name: 'Héros',
    health: 100,
    maxHealth: 100,
    gold: 50,
    level: 1,
    exp: 0,
    maxExp: 100,
    attack: 10,
    defense: 5,
    inventory: ['épée rouillée'],
    stats: {
        enemiesKilled: 0,
        treasuresFound: 0,
        explorations: 0,
        potionsUsed: 0,
        goldSpent: 0
    }
};

// Système de quêtes
let activeQuests = [];
let completedQuests = [];

const questTemplates = {
    killEnemies: {
        title: "Chasseur de monstres",
        description: "Élimine {target} ennemis",
        type: "kill",
        target: 5,
        rewards: { gold: 50, exp: 30 },
        icon: "⚔️"
    },
    collectTreasures: {
        title: "Chasseur de trésors",
        description: "Trouve {target} trésors",
        type: "treasure",
        target: 3,
        rewards: { gold: 40, exp: 25 },
        icon: "💰"
    },
    reachLevel: {
        title: "Ascension",
        description: "Atteins le niveau {target}",
        type: "level",
        target: 3,
        rewards: { gold: 100, exp: 50 },
        icon: "⭐"
    },
    explore: {
        title: "Grand explorateur",
        description: "Explore {target} fois",
        type: "explore",
        target: 10,
        rewards: { gold: 60, exp: 40 },
        icon: "🗺️"
    },
    usePotions: {
        title: "Alchimiste",
        description: "Utilise {target} potions",
        type: "potion",
        target: 3,
        rewards: { gold: 30, exp: 20 },
        icon: "🧪"
    },
    spendGold: {
        title: "Grand dépensier",
        description: "Dépense {target} pièces d'or",
        type: "spend",
        target: 200,
        rewards: { gold: 80, exp: 35 },
        icon: "💸"
    }
};

const questGivers = [
    {
        name: "Maître Aldric",
        dialogue: "Jeune aventurier, j'ai une mission importante pour toi !",
        quests: ["killEnemies", "reachLevel"]
    },
    {
        name: "Roi Marcus",
        dialogue: "Mon royaume a besoin d'un héros courageux !",
        quests: ["collectTreasures", "explore"]
    },
    {
        name: "Alchimiste Vera",
        dialogue: "Mes potions ont besoin d'être testées !",
        quests: ["usePotions", "spendGold"]
    },
    {
        name: "Capitaine Gareth",
        dialogue: "Les monstres menacent nos routes commerciales !",
        quests: ["killEnemies", "explore"]
    }
];

const enemies = {
    goblin:   { name: 'Gobelin',   image: 'images/gobelin.png',   health: 30,  maxHealth: 30,  attack: 5,  defense: 1, exp: 15, gold: [5,  15] },
    orc:      { name: 'Orc',       image: 'images/orc.png',       health: 50,  maxHealth: 50,  attack: 8,  defense: 3, exp: 25, gold: [10, 25] },
    troll:    { name: 'Troll',     image: 'images/troll.png',     health: 80,  maxHealth: 80,  attack: 12, defense: 5, exp: 40, gold: [15, 35] },
    dragon:   { name: 'Dragon',    image: 'images/dragon.png',    health: 150, maxHealth: 150, attack: 20, defense: 8, exp: 80, gold: [30, 70] },
    skeleton: { name: 'Squelette', image: 'images/squelette.png', health: 40,  maxHealth: 40,  attack: 7,  defense: 2, exp: 20, gold: [8,  20] }
};

const shopItems = {
    potion:    { name: 'Potion de soin',  price: 15,  effect: 'heal',    value: 40, unique: false },
    sword:     { name: 'Épée en acier',   price: 80,  effect: 'attack',  value: 5,  unique: true  },
    armor:     { name: 'Armure de cuir',  price: 120, effect: 'defense', value: 3,  unique: true  },
    bigPotion: { name: 'Grande potion',   price: 35,  effect: 'heal',    value: 80, unique: false }
};

// Éléments DOM
let domElements = {};

// ========== FONCTIONS UTILITAIRES ==========
function initializeDOMElements() {
    const elementIds = [
        'exploreBtn', 'attackBtn', 'fleeBtn', 'useItemBtn', 'shopBtn',
        'questBtn', 'restBtn', 'saveBtn', 'loadBtn', 'resetBtn',
        'story', 'enemy-info', 'active-quests', 'playerName', 'playerHealth',
        'playerMaxHealth', 'playerGold', 'playerLevel', 'playerExp',
        'playerMaxExp', 'playerAttack', 'playerDefense', 'playerInventory',
        'healthFill', 'expFill', 'enemyName', 'enemyHealth', 'enemyMaxHealth',
        'enemyAttack', 'enemyDefense', 'enemyHealthFill'
    ];

    elementIds.forEach(id => {
        domElements[id] = document.getElementById(id);
        if (!domElements[id]) {
            console.warn(`Élément DOM manquant: ${id}`);
        }
    });
}

function safeGetElement(id) {
    return domElements[id] || null;
}

function showMessage(message) {
    const story = safeGetElement('story');
    if (story) {
        story.innerHTML = `<p>${message}</p>`;
    }
}

// CORRECTION #3 : addMessage() est maintenant utilisée dans les combats
function addMessage(message) {
    const story = safeGetElement('story');
    if (story) {
        story.innerHTML += `<p>${message}</p>`;
        // Scroll automatique vers le bas pour voir les nouveaux messages
        story.scrollTop = story.scrollHeight;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function updateUI() {
    const elements = [
        ['playerName',      player.name],
        ['playerHealth',    player.health],
        ['playerMaxHealth', player.maxHealth],
        ['playerGold',      player.gold],
        ['playerLevel',     player.level],
        ['playerExp',       player.exp],
        ['playerMaxExp',    player.maxExp],
        ['playerAttack',    player.attack],
        ['playerDefense',   player.defense],
        ['playerInventory', player.inventory.join(', ') || 'Vide']
    ];

    elements.forEach(([id, value]) => {
        const element = safeGetElement(id);
        if (element) element.textContent = value;
    });

    const healthPercent = (player.health / player.maxHealth) * 100;
    const expPercent    = (player.exp    / player.maxExp)    * 100;

    const healthFill = safeGetElement('healthFill');
    const expFill    = safeGetElement('expFill');

    if (healthFill) healthFill.style.width = healthPercent + '%';
    if (expFill)    expFill.style.width    = expPercent    + '%';
}

function updateEnemyUI() {
    const enemyInfo  = safeGetElement('enemy-info');
    const enemyImage = document.getElementById('enemyImage');

    if (!enemyInfo) return;

    if (currentEnemy) {
        const elements = [
            ['enemyName',      currentEnemy.name],
            ['enemyHealth',    currentEnemy.health],
            ['enemyMaxHealth', currentEnemy.maxHealth],
            ['enemyAttack',    currentEnemy.attack],
            ['enemyDefense',   currentEnemy.defense]
        ];

        elements.forEach(([id, value]) => {
            const element = safeGetElement(id);
            if (element) element.textContent = value;
        });

        // CORRECTION #5 : mise à jour de la barre de vie de l'ennemi
        const enemyHealthFill = safeGetElement('enemyHealthFill');
        if (enemyHealthFill) {
            const percent = Math.max(0, (currentEnemy.health / currentEnemy.maxHealth) * 100);
            enemyHealthFill.style.width = percent + '%';
        }

        if (enemyImage && currentEnemy.image) {
            enemyImage.src             = currentEnemy.image;
            enemyImage.alt             = currentEnemy.name;
            enemyImage.style.display   = 'block';
        }

        enemyInfo.style.display = 'block';
    } else {
        if (enemyImage) enemyImage.style.display = 'none';
        enemyInfo.style.display = 'none';
    }
}
// ========== SYSTÈME DE QUÊTES ==========
function updateQuestDisplay() {
    const activeQuestsDiv = safeGetElement('active-quests');
    if (!activeQuestsDiv) return;

    activeQuestsDiv.innerHTML = '';

    if (activeQuests.length === 0) {
        activeQuestsDiv.innerHTML = '<p style="text-align: center; color: #999;">Aucune quête active. Cherche des PNJ pour obtenir des missions !</p>';
        return;
    }

    activeQuests.forEach((quest, index) => {
        const questDiv = document.createElement('div');
        questDiv.className = `quest-item ${quest.completed ? 'quest-complete' : ''}`;

        const progress     = getQuestProgress(quest);
        const progressText = quest.completed ? 'TERMINÉE' : `${progress}/${quest.target}`;

        questDiv.innerHTML = `
            <div class="quest-title">${quest.icon} ${quest.title}</div>
            <div class="quest-progress">${quest.description.replace('{target}', quest.target)} - ${progressText}</div>
            <div class="quest-reward">Récompense: ${quest.rewards.gold} or, ${quest.rewards.exp} XP</div>
        `;

        if (quest.completed) {
            const claimBtn = document.createElement('button');
            claimBtn.textContent = 'Réclamer récompense';
            claimBtn.style.marginTop = '5px';
            claimBtn.addEventListener('click', () => claimQuestReward(index));
            questDiv.appendChild(claimBtn);
        }

        activeQuestsDiv.appendChild(questDiv);
    });
}

function getQuestProgress(quest) {
    if (!quest || !quest.type) return 0;

    switch (quest.type) {
        case 'kill':     return player.stats.enemiesKilled  || 0;
        case 'treasure': return player.stats.treasuresFound || 0;
        case 'level':    return player.level                || 1;
        case 'explore':  return player.stats.explorations   || 0;
        case 'potion':   return player.stats.potionsUsed    || 0;
        case 'spend':    return player.stats.goldSpent      || 0;
        default:         return 0;
    }
}

function checkQuestProgress() {
    activeQuests.forEach(quest => {
        if (!quest.completed) {
            const progress = getQuestProgress(quest);
            if (progress >= quest.target) {
                quest.completed = true;
                showNotification(`Quête terminée: ${quest.title}`);
                showMessage(`Tu as terminé la quête "${quest.title}" ! Tu peux maintenant réclamer ta récompense !`);
            }
        }
    });
    updateQuestDisplay();
}

function claimQuestReward(questIndex) {
    if (questIndex < 0 || questIndex >= activeQuests.length) return;

    const quest = activeQuests[questIndex];
    if (quest.completed) {
        player.gold += quest.rewards.gold;
        gainExp(quest.rewards.exp);

        showMessage(`Tu réclames ta récompense pour "${quest.title}" : ${quest.rewards.gold} or et ${quest.rewards.exp} XP !`);
        showNotification('Récompense réclamée !');

        completedQuests.push(quest);
        activeQuests.splice(questIndex, 1);

        updateUI();
        updateQuestDisplay();
    }
}

function createQuest(templateKey) {
    const template = questTemplates[templateKey];
    if (!template) return null;

    return {
        ...template,
        completed: false,
        startTime: Date.now()
    };
}

function getAvailableQuest() {
    const availableTemplates = Object.keys(questTemplates).filter(key => {
        const alreadyActive       = activeQuests.some(q => q.title === questTemplates[key].title);
        const recentlyCompleted   = completedQuests.some(q =>
            q.title === questTemplates[key].title &&
            Date.now() - q.startTime < 300000
        );
        return !alreadyActive && !recentlyCompleted;
    });

    if (availableTemplates.length === 0) return null;

    const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    return createQuest(randomTemplate);
}

function meetQuestGiver() {
    const giver          = questGivers[Math.floor(Math.random() * questGivers.length)];
    const availableQuest = getAvailableQuest();

    if (!availableQuest) {
        showMessage(`${giver.name} : "${giver.dialogue}" Mais tu as déjà assez de missions pour le moment. Reviens plus tard !`);
        return;
    }

    showMessage(`${giver.name} : "${giver.dialogue}"`);

    setTimeout(() => {
        showMessage(`Mission proposée: "${availableQuest.title}" - ${availableQuest.description.replace('{target}', availableQuest.target)}`);

        const acceptBtn  = document.createElement('button');
        acceptBtn.textContent = 'Accepter la mission';
        acceptBtn.className   = 'npc-button';

        const declineBtn = document.createElement('button');
        declineBtn.textContent = 'Refuser';
        declineBtn.className   = 'npc-button';

        acceptBtn.addEventListener('click', () => {
            activeQuests.push(availableQuest);
            showMessage('Mission acceptée ! Tu peux voir tes quêtes actives dans le panneau ci-dessus.');
            showNotification('Nouvelle mission !');
            updateQuestDisplay();
            removeNPCButtons();
        });

        declineBtn.addEventListener('click', () => {
            showMessage(`${giver.name} : "Dommage... Peut-être une autre fois !"`);
            removeNPCButtons();
        });

        const story = safeGetElement('story');
        if (story) {
            story.appendChild(acceptBtn);
            story.appendChild(declineBtn);
        }
    }, 2000);
}

function removeNPCButtons() {
    document.querySelectorAll('.npc-button').forEach(btn => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
    });
}

function hideAllButtons() {
    const buttonIds = ['exploreBtn', 'attackBtn', 'fleeBtn', 'useItemBtn', 'shopBtn', 'questBtn', 'restBtn'];
    buttonIds.forEach(id => {
        const btn = safeGetElement(id);
        if (btn) btn.style.display = 'none';
    });
}

// CORRECTION #5 : désactivation rapide des boutons pour éviter les clics pendant les délais
function disableActionButtons() {
    ['attackBtn', 'fleeBtn', 'useItemBtn', 'exploreBtn'].forEach(id => {
        const btn = safeGetElement(id);
        if (btn) btn.disabled = true;
    });
}

function enableActionButtons() {
    ['attackBtn', 'fleeBtn', 'useItemBtn', 'exploreBtn'].forEach(id => {
        const btn = safeGetElement(id);
        if (btn) btn.disabled = false;
    });
}

function showButtonsForState(state) {
    hideAllButtons();
    enableActionButtons();

    switch (state) {
        case GAME_STATES.EXPLORING:
            ['exploreBtn', 'shopBtn', 'questBtn', 'restBtn'].forEach(id => {
                const btn = safeGetElement(id);
                if (btn) btn.style.display = 'inline-block';
            });
            if (hasUsableItems()) {
                const btn = safeGetElement('useItemBtn');
                if (btn) btn.style.display = 'inline-block';
            }
            break;

        case GAME_STATES.COMBAT:
            ['attackBtn', 'fleeBtn'].forEach(id => {
                const btn = safeGetElement(id);
                if (btn) btn.style.display = 'inline-block';
            });
            if (hasUsableItems()) {
                const btn = safeGetElement('useItemBtn');
                if (btn) btn.style.display = 'inline-block';
            }
            break;
    }
}

function changeGameState(newState) {
    currentGameState = newState;
    showButtonsForState(newState);

    if (newState !== GAME_STATES.COMBAT) {
        currentEnemy = null;
        updateEnemyUI();
    }
}

function hasUsableItems() {
    return player.inventory.some(item => item.includes('potion') || item.includes('Potion'));
}

// CORRECTION #1 : la somme des poids est maintenant calculée dynamiquement
// Ancienne version : weights = [30,20,10,15,8,10,12,3,2] → total = 110 (bug !)
// Nouvelle version : total calculé automatiquement → tous les événements sont atteignables
function getRandomEvent() {
    const events  = ['enemy', 'treasure', 'merchant', 'nothing', 'rest', 'potion', 'trap', 'boss', 'levelUp'];
    const weights = [30, 20, 10, 15, 8, 10, 12, 3, 2];

    const totalWeight = weights.reduce((sum, w) => sum + w, 0); // = 110
    const random      = Math.random() * totalWeight;             // entre 0 et 110

    let cumulative = 0;
    for (let i = 0; i < events.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
            return events[i];
        }
    }
    return 'nothing';
}

function getRandomEnemy() {
    const enemyTypes = Object.keys(enemies);
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    return { ...enemies[randomType] };
}

function gainExp(amount) {
    if (amount <= 0) return;

    player.exp += amount;
    showNotification(`+${amount} EXP`);

    if (player.exp >= player.maxExp) {
        levelUp();
    }
    updateUI();
    checkQuestProgress();
}

function levelUp() {
    player.level++;
    player.exp        = Math.max(0, player.exp - player.maxExp);
    player.maxExp     = Math.floor(player.maxExp * 1.2);
    player.maxHealth += 20;
    player.health     = player.maxHealth;
    player.attack    += 2;
    player.defense   += 1;

    showNotification(`NIVEAU ${player.level} !`);
    showMessage(`Félicitations ! Tu atteins le niveau ${player.level} ! Tes statistiques ont augmenté !`);
    checkQuestProgress();
}

function removeShopButtons() {
    document.querySelectorAll('.shop-button').forEach(btn => {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
    });
}

function closeShop() {
    removeShopButtons();
    changeGameState(GAME_STATES.EXPLORING);
    showMessage('Tu quittes le magasin. Bonne aventure !');
}

// ========== ÉVÉNEMENTS DE JEU ==========
function setupEventListeners() {

    // Explorer
    const exploreBtn = safeGetElement('exploreBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            player.stats.explorations++;
            const event = getRandomEvent();

            switch (event) {
                case 'enemy':
                case 'boss':
                    currentEnemy = getRandomEnemy();
                    if (event === 'boss') {
                        currentEnemy.health    *= 2;
                        currentEnemy.maxHealth *= 2;
                        currentEnemy.attack    += 5;
                        currentEnemy.exp       *= 2;
                        currentEnemy.gold[0]   *= 2;
                        currentEnemy.gold[1]   *= 2;
                        currentEnemy.name       = currentEnemy.name + ' (Boss)';
                    }
                    showMessage(`${currentEnemy.name} apparaît ! Prépare-toi au combat !`);
                    changeGameState(GAME_STATES.COMBAT);
                    updateEnemyUI();
                    break;

                case 'treasure':
                    player.stats.treasuresFound++;
                    const goldFound = Math.floor(Math.random() * 30) + 10;
                    player.gold += goldFound;
                    showMessage(`<img src="images/tresor.png" alt="Trésor" style="max-width:100px; display:block; margin:10px auto;">`);
                    addMessage(`Tu découvres un coffre contenant ${goldFound} pièces d'or !`);
                    showNotification(`+${goldFound} or`);
                    updateUI();
                    break; 

                case 'merchant':
                    showMessage('Un marchand mystérieux apparaît et disparaît, laissant derrière lui une petite bourse...');
                    const merchantGold = Math.floor(Math.random() * 20) + 5;
                    player.gold += merchantGold;
                    showNotification(`+${merchantGold} or`);
                    updateUI();
                    break;

                case 'potion':
                    const potionTypes  = ['Potion de soin', 'Grande potion'];
                    const foundPotion  = potionTypes[Math.floor(Math.random() * potionTypes.length)];
                    player.inventory.push(foundPotion);
                    showMessage(`Tu trouves une ${foundPotion} cachée dans les buissons !`);
                    showNotification('Objet trouvé !');
                    updateUI();
                    break;

                case 'trap':
                    showMessage(`<img src="images/trap.png" alt="Piège" style="max-width:100px"><br>Tu tombes dans un piège !`);
                    const trapDamage = Math.floor(Math.random() * 15) + 5;
                    player.health    = Math.max(0, player.health - trapDamage);
                    showMessage(`Tu tombes dans un piège ! Tu perds ${trapDamage} PV !`);
                    showNotification(`-${trapDamage} PV`);
                    updateUI();
                    if (player.health <= 0) {
                        showMessage('Tu es mort... Ton aventure se termine ici.');
                        changeGameState(GAME_STATES.GAME_OVER);
                    }
                    break;

                case 'rest':
                    const restHeal = Math.floor(player.maxHealth * 0.3);
                    player.health  = Math.min(player.maxHealth, player.health + restHeal);
                    showMessage(`Tu trouves un endroit paisible pour te reposer. Tu récupères ${restHeal} PV.`);
                    showNotification(`+${restHeal} PV`);
                    updateUI();
                    break;

                case 'levelUp':
                    gainExp(50);
                    showMessage('Tu sens une étrange énergie t\'envahir...');
                    break;

                default:
                    const messages = [
                        'Tu avances dans un brouillard épais...',
                        'Un aigle survole les environs...',
                        'Le vent souffle doucement à travers les arbres...',
                        'Les ombres dansent autour de toi...'
                    ];
                    showMessage(messages[Math.floor(Math.random() * messages.length)]);
            }

            checkQuestProgress();
        });
    }

    // Combat - Attaquer
    const attackBtn = safeGetElement('attackBtn');
    if (attackBtn) {
        attackBtn.addEventListener('click', () => {
            if (!currentEnemy) return;

            // CORRECTION #3 : utilisation de addMessage() pour accumuler les messages de combat
            const playerDamage = Math.max(1, player.attack + Math.floor(Math.random() * 5) - currentEnemy.defense);
            currentEnemy.health -= playerDamage;

            showMessage(`⚔️ Tu attaques ${currentEnemy.name} et infliges ${playerDamage} dégâts !`);

            if (currentEnemy.health <= 0) {
                const expGained  = currentEnemy.exp;
                const goldGained = Math.floor(Math.random() * (currentEnemy.gold[1] - currentEnemy.gold[0] + 1)) + currentEnemy.gold[0];

                player.stats.enemiesKilled++;
                player.gold += goldGained;

                addMessage(`💀 ${currentEnemy.name} est vaincu ! Tu gagnes ${goldGained} or.`);
                showNotification(`+${goldGained} or`);

                gainExp(expGained);

                // CORRECTION #5 : désactiver les boutons immédiatement pour éviter les clics pendant le délai
                disableActionButtons();

                setTimeout(() => {
                    showMessage('🏆 Victoire ! Tu peux continuer ton exploration.');
                    changeGameState(GAME_STATES.EXPLORING);
                    checkQuestProgress();
                }, 1500);

            } else {
                const enemyDamage = Math.max(1, currentEnemy.attack + Math.floor(Math.random() * 3) - player.defense);
                player.health    -= enemyDamage;

                addMessage(`💢 ${currentEnemy.name} contre-attaque et t'inflige ${enemyDamage} dégâts !`);

                updateEnemyUI();
                updateUI();

                if (player.health <= 0) {
                    disableActionButtons();
                    setTimeout(() => {
                        showMessage('💀 Tu es mort... Ton aventure se termine ici.');
                        changeGameState(GAME_STATES.GAME_OVER);
                    }, 1500);
                }
            }
        });
    }

    // Combat - Fuir
    const fleeBtn = safeGetElement('fleeBtn');
    if (fleeBtn) {
        fleeBtn.addEventListener('click', () => {
            // CORRECTION #5 : désactiver immédiatement pour éviter les clics pendant le délai de 2s
            disableActionButtons();

            const success = Math.random() > 0.25;

            if (success) {
                showMessage('🏃 Tu prends la fuite avec succès !');
                setTimeout(() => {
                    changeGameState(GAME_STATES.EXPLORING);
                }, 1500);
            } else {
                const fleeDamage = Math.floor(Math.random() * 10) + 3;
                player.health    = Math.max(0, player.health - fleeDamage);
                showMessage(`Tu essaies de fuir mais ${currentEnemy.name} t'inflige ${fleeDamage} dégâts !`);
                showNotification(`-${fleeDamage} PV`);
                updateUI();

                setTimeout(() => {
                    if (player.health <= 0) {
                        showMessage('💀 Tu es mort... Ton aventure se termine ici.');
                        changeGameState(GAME_STATES.GAME_OVER);
                    } else {
                        addMessage('Tu réussis finalement à t\'échapper !');
                        changeGameState(GAME_STATES.EXPLORING);
                    }
                }, 2000);
            }
        });
    }

    // Utiliser une potion
    const useItemBtn = safeGetElement('useItemBtn');
    if (useItemBtn) {
        useItemBtn.addEventListener('click', () => {
            const potions = player.inventory.filter(item => item.includes('potion') || item.includes('Potion'));

            if (potions.length === 0) {
                showMessage("Tu n'as pas d'objet utilisable !");
                return;
            }

            const usedPotion  = potions[0];
            const potionIndex = player.inventory.indexOf(usedPotion);
            player.inventory.splice(potionIndex, 1);

            player.stats.potionsUsed++;

            const healAmount  = usedPotion.includes('Grande') ? 80 : 40;
            const oldHealth   = player.health;
            player.health     = Math.min(player.maxHealth, player.health + healAmount);
            const actualHeal  = player.health - oldHealth;

            showMessage(`🧪 Tu utilises ${usedPotion} et récupères ${actualHeal} PV !`);
            showNotification(`+${actualHeal} PV`);
            updateUI();
            showButtonsForState(currentGameState);
            checkQuestProgress();
        });
    }

    // Chercher des quêtes
    const questBtn = safeGetElement('questBtn');
    if (questBtn) {
        questBtn.addEventListener('click', () => {
            showMessage('Tu cherches des PNJ ayant besoin d\'aide...');
            setTimeout(() => {
                if (Math.random() < 0.7) {
                    meetQuestGiver();
                } else {
                    showMessage('Tu ne trouves personne ayant besoin d\'aide pour le moment. Essaie de nouveau plus tard !');
                }
            }, 1500);
        });
    }

    // Se reposer
    const restBtn = safeGetElement('restBtn');
    if (restBtn) {
        restBtn.addEventListener('click', () => {
            if (player.health === player.maxHealth) {
                showMessage('Tu es déjà en pleine forme !');
                return;
            }
            const cost = 10;
            if (player.gold < cost) {
                showMessage("Il te faut 10 pièces d'or pour te reposer dans une auberge.");
                return;
            }
            player.gold              -= cost;
            player.stats.goldSpent   += cost;
            player.health             = player.maxHealth;
            showMessage('Tu te reposes dans une auberge confortable pour 10 or. Santé restaurée !');
            showNotification('Santé restaurée !');
            updateUI();
            checkQuestProgress();
        });
    }

    // Magasin
    const shopBtn = safeGetElement('shopBtn');
    if (shopBtn) {
        shopBtn.addEventListener('click', () => {
            if (document.querySelector('.shop-button')) {
                showMessage('Le magasin est déjà ouvert !');
                return;
            }

            changeGameState(GAME_STATES.SHOPPING);
            showMessage(`🏪 Bienvenue au magasin ! Tu as ${player.gold} pièces d'or.`);

            Object.keys(shopItems).forEach(itemKey => {
                const item = shopItems[itemKey];
                const btn  = document.createElement('button');

                // CORRECTION #2 : afficher "(possédé)" pour les équipements uniques déjà achetés
                const alreadyOwned = item.unique && player.inventory.includes(item.name);
                btn.textContent    = alreadyOwned
                    ? `${item.name} (possédé)`
                    : `${item.name} (${item.price} or)`;

                btn.className = 'shop-button';
                btn.disabled  = player.gold < item.price || alreadyOwned;

                btn.addEventListener('click', () => {
                    // CORRECTION #2 : double vérification côté logique
                    if (item.unique && player.inventory.includes(item.name)) {
                        showMessage(`Tu possèdes déjà ${item.name} !`);
                        return;
                    }

                    if (player.gold >= item.price) {
                        player.gold              -= item.price;
                        player.stats.goldSpent   += item.price;

                        if (item.effect === 'heal') {
                            player.inventory.push(item.name);
                        } else if (item.effect === 'attack') {
                            player.attack        += item.value;
                            player.inventory.push(item.name);
                        } else if (item.effect === 'defense') {
                            player.defense       += item.value;
                            player.inventory.push(item.name);
                        }

                        showMessage(`Tu achètes ${item.name} pour ${item.price} or !`);
                        showNotification('Achat effectué !');
                        updateUI();
                        closeShop();
                        checkQuestProgress();
                    }
                });

                const story = safeGetElement('story');
                if (story) story.appendChild(btn);
            });

            const exitBtn       = document.createElement('button');
            exitBtn.textContent  = 'Quitter le magasin';
            exitBtn.className    = 'shop-button';
            exitBtn.addEventListener('click', closeShop);

            const story = safeGetElement('story');
            if (story) story.appendChild(exitBtn);
        });
    }

    // Sauvegarder
    const saveBtn = safeGetElement('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const saveData = { player, activeQuests, completedQuests };
            try {
                localStorage.setItem('goldOfWarSave', JSON.stringify(saveData));
                showNotification('Partie sauvegardée !');
            } catch (e) {
                console.error('Erreur de sauvegarde:', e);
                showNotification('Erreur de sauvegarde !');
            }
        });
    }

    // Charger
    const loadBtn = safeGetElement('loadBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            try {
                const save = localStorage.getItem('goldOfWarSave');
                if (save) {
                    const saveData = JSON.parse(save);

                    if (saveData.player) {
                        player          = { ...player, ...saveData.player };
                        activeQuests    = saveData.activeQuests    || [];
                        completedQuests = saveData.completedQuests || [];

                        // Rétrocompatibilité : ajouter les stats si absentes
                        if (!player.stats) {
                            player.stats = { enemiesKilled: 0, treasuresFound: 0, explorations: 0, potionsUsed: 0, goldSpent: 0 };
                        }
                    } else {
                        player          = { ...player, ...saveData };
                        if (!player.stats) {
                            player.stats = { enemiesKilled: 0, treasuresFound: 0, explorations: 0, potionsUsed: 0, goldSpent: 0 };
                        }
                        activeQuests    = [];
                        completedQuests = [];
                    }

                    updateUI();
                    updateQuestDisplay();
                    changeGameState(GAME_STATES.EXPLORING);
                    showNotification('Partie chargée !');
                    showMessage('Sauvegarde chargée ! Ton aventure reprend...');
                } else {
                    showNotification('Aucune sauvegarde trouvée !');
                }
            } catch (e) {
                console.error('Erreur de chargement:', e);
                showNotification('Erreur de chargement !');
            }
        });
    }

    // Nouvelle partie
    const resetBtn = safeGetElement('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir recommencer une nouvelle partie ?')) {
                player = {
                    name: 'Héros', health: 100, maxHealth: 100, gold: 50,
                    level: 1, exp: 0, maxExp: 100, attack: 10, defense: 5,
                    inventory: ['épée rouillée'],
                    stats: { enemiesKilled: 0, treasuresFound: 0, explorations: 0, potionsUsed: 0, goldSpent: 0 }
                };
                activeQuests    = [];
                completedQuests = [];
                updateUI();
                updateQuestDisplay();
                changeGameState(GAME_STATES.EXPLORING);
                showMessage('Nouvelle aventure ! Que le courage soit avec toi !');
                showNotification('Nouvelle partie !');
            }
        });
    }
}

// ========== INITIALISATION ==========
function initializeGame() {
    initializeDOMElements();
    setupEventListeners();
    updateUI();
    updateQuestDisplay();
    changeGameState(GAME_STATES.EXPLORING);
    showMessage('Bienvenue, brave aventurier ! Ton voyage commence maintenant...');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}
