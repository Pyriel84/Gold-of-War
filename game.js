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
    // Statistiques pour les quêtes
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

// PNJ qui donnent des quêtes
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

// Ennemis possibles
const enemies = {
    goblin: { name: 'Gobelin', health: 30, maxHealth: 30, attack: 8, defense: 2, exp: 15, gold: [5, 15] },
    orc: { name: 'Orc', health: 50, maxHealth: 50, attack: 12, defense: 4, exp: 25, gold: [10, 25] },
    troll: { name: 'Troll', health: 80, maxHealth: 80, attack: 15, defense: 6, exp: 40, gold: [20, 40] },
    dragon: { name: 'Dragon', health: 150, maxHealth: 150, attack: 25, defense: 10, exp: 100, gold: [50, 100] },
    skeleton: { name: 'Squelette', health: 40, maxHealth: 40, attack: 10, defense: 3, exp: 20, gold: [8, 20] }
};

// Objets du magasin
const shopItems = {
    potion: { name: 'Potion de soin', price: 15, effect: 'heal', value: 40 },
    sword: { name: 'Épée en acier', price: 80, effect: 'attack', value: 5 },
    armor: { name: 'Armure de cuir', price: 120, effect: 'defense', value: 3 },
    bigPotion: { name: 'Grande potion', price: 35, effect: 'heal', value: 80 }
};

// Éléments DOM - avec vérification d'existence
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
        'enemyAttack', 'enemyDefense'
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

function addMessage(message) {
    const story = safeGetElement('story');
    if (story) {
        story.innerHTML += `<p>${message}</p>`;
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
        ['playerName', player.name],
        ['playerHealth', player.health],
        ['playerMaxHealth', player.maxHealth],
        ['playerGold', player.gold],
        ['playerLevel', player.level],
        ['playerExp', player.exp],
        ['playerMaxExp', player.maxExp],
        ['playerAttack', player.attack],
        ['playerDefense', player.defense],
        ['playerInventory', player.inventory.join(', ') || 'Vide']
    ];
    
    elements.forEach(([id, value]) => {
        const element = safeGetElement(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // Barres de progression
    const healthPercent = (player.health / player.maxHealth) * 100;
    const expPercent = (player.exp / player.maxExp) * 100;
    
    const healthFill = safeGetElement('healthFill');
    const expFill = safeGetElement('expFill');
    
    if (healthFill) healthFill.style.width = healthPercent + '%';
    if (expFill) expFill.style.width = expPercent + '%';
}

function updateEnemyUI() {
    const enemyInfo = safeGetElement('enemy-info');
    if (!enemyInfo) return;
    
    if (currentEnemy) {
        const elements = [
            ['enemyName', currentEnemy.name],
            ['enemyHealth', currentEnemy.health],
            ['enemyMaxHealth', currentEnemy.maxHealth],
            ['enemyAttack', currentEnemy.attack],
            ['enemyDefense', currentEnemy.defense]
        ];
        
        elements.forEach(([id, value]) => {
            const element = safeGetElement(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        enemyInfo.style.display = 'block';
    } else {
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
        
        const progress = getQuestProgress(quest);
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
    
    switch(quest.type) {
        case 'kill': return player.stats.enemiesKilled || 0;
        case 'treasure': return player.stats.treasuresFound || 0;
        case 'level': return player.level || 1;
        case 'explore': return player.stats.explorations || 0;
        case 'potion': return player.stats.potionsUsed || 0;
        case 'spend': return player.stats.goldSpent || 0;
        default: return 0;
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
        showNotification(`Récompense réclamée !`);
        
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
        // Vérifier si cette quête n'est pas déjà active ou récemment complétée
        const alreadyActive = activeQuests.some(q => q.title === questTemplates[key].title);
        const recentlyCompleted = completedQuests.some(q => 
            q.title === questTemplates[key].title && 
            Date.now() - q.startTime < 300000 // 5 minutes
        );
        return !alreadyActive && !recentlyCompleted;
    });
    
    if (availableTemplates.length === 0) return null;
    
    const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    return createQuest(randomTemplate);
}

function meetQuestGiver() {
    const giver = questGivers[Math.floor(Math.random() * questGivers.length)];
    const availableQuest = getAvailableQuest();
    
    if (!availableQuest) {
        showMessage(`${giver.name} : "${giver.dialogue}" Mais tu as déjà assez de missions pour le moment. Reviens plus tard !`);
        return;
    }
    
    showMessage(`${giver.name} : "${giver.dialogue}"`);
    
    setTimeout(() => {
        showMessage(`Mission proposée: "${availableQuest.title}" - ${availableQuest.description.replace('{target}', availableQuest.target)}`);
        
        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'Accepter la mission';
        acceptBtn.className = 'npc-button';
        
        const declineBtn = document.createElement('button');
        declineBtn.textContent = 'Refuser';
        declineBtn.className = 'npc-button';
        
        acceptBtn.addEventListener('click', () => {
            activeQuests.push(availableQuest);
            showMessage(`Mission acceptée ! Tu peux voir tes quêtes actives dans le panneau ci-dessus.`);
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
        if (btn.parentNode) {
            btn.parentNode.removeChild(btn);
        }
    });
}

function hideAllButtons() {
    const buttonIds = ['exploreBtn', 'attackBtn', 'fleeBtn', 'useItemBtn', 'shopBtn', 'questBtn', 'restBtn'];
    buttonIds.forEach(id => {
        const btn = safeGetElement(id);
        if (btn) btn.style.display = 'none';
    });
}

function showButtonsForState(state) {
    hideAllButtons();
    
    switch(state) {
        case GAME_STATES.EXPLORING:
            const exploringButtons = ['exploreBtn', 'shopBtn', 'questBtn', 'restBtn'];
            exploringButtons.forEach(id => {
                const btn = safeGetElement(id);
                if (btn) btn.style.display = 'inline-block';
            });
            
            if (hasUsableItems()) {
                const useItemBtn = safeGetElement('useItemBtn');
                if (useItemBtn) useItemBtn.style.display = 'inline-block';
            }
            break;
            
        case GAME_STATES.COMBAT:
            const combatButtons = ['attackBtn', 'fleeBtn'];
            combatButtons.forEach(id => {
                const btn = safeGetElement(id);
                if (btn) btn.style.display = 'inline-block';
            });
            
            if (hasUsableItems()) {
                const useItemBtn = safeGetElement('useItemBtn');
                if (useItemBtn) useItemBtn.style.display = 'inline-block';
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
    return player.inventory.some(item => 
        item.includes('potion') || item.includes('Potion')
    );
}

function getRandomEvent() {
    const events = ['enemy', 'treasure', 'merchant', 'nothing', 'rest', 'potion', 'trap', 'boss', 'levelUp'];
    const weights = [30, 20, 10, 15, 8, 10, 12, 3, 2]; // Probabilités en %
    
    const random = Math.random() * 100;
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
    player.exp = Math.max(0, player.exp - player.maxExp);
    player.maxExp = Math.floor(player.maxExp * 1.2);
    player.maxHealth += 20;
    player.health = player.maxHealth;
    player.attack += 2;
    player.defense += 1;
    
    showNotification(`NIVEAU ${player.level} !`);
    showMessage(`Félicitations ! Tu atteins le niveau ${player.level} ! Tes statistiques ont augmenté !`);
    checkQuestProgress();
}

function removeShopButtons() {
    document.querySelectorAll('.shop-button').forEach(btn => {
        if (btn.parentNode) {
            btn.parentNode.removeChild(btn);
        }
    });
}

function closeShop() {
    removeShopButtons();
    changeGameState(GAME_STATES.EXPLORING);
    showMessage("Tu quittes le magasin. Bonne aventure !");
}

// ========== ÉVÉNEMENTS DE JEU ==========
function setupEventListeners() {
    // Explorer
    const exploreBtn = safeGetElement('exploreBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            player.stats.explorations++;
            const event = getRandomEvent();

            switch(event) {
                case 'enemy':
                case 'boss':
                    currentEnemy = getRandomEnemy();
                    if (event === 'boss') {
                        currentEnemy.health *= 2;
                        currentEnemy.maxHealth *= 2;
                        currentEnemy.attack += 5;
                        currentEnemy.exp *= 2;
                        currentEnemy.gold[0] *= 2;
                        currentEnemy.gold[1] *= 2;
                        currentEnemy.name = currentEnemy.name + ' (Boss)';
                    }
                    showMessage(`${currentEnemy.name} apparaît ! Prépare-toi au combat !`);
                    changeGameState(GAME_STATES.COMBAT);
                    updateEnemyUI();
                    break;

                case 'treasure':
                    player.stats.treasuresFound++;
                    const goldFound = Math.floor(Math.random() * 30) + 10;
                    player.gold += goldFound;
                    showMessage(`Tu découvres un coffre contenant ${goldFound} pièces d'or !`);
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
                    const potionTypes = ['Potion de soin', 'Grande potion'];
                    const foundPotion = potionTypes[Math.floor(Math.random() * potionTypes.length)];
                    player.inventory.push(foundPotion);
                    showMessage(`Tu trouves une ${foundPotion} cachée dans les buissons !`);
                    showNotification(`Objet trouvé !`);
                    updateUI();
                    break;

                case 'trap':
                    const damage = Math.floor(Math.random() * 15) + 5;
                    player.health = Math.max(0, player.health - damage);
                    showMessage(`Tu tombes dans un piège ! Tu perds ${damage} PV !`);
                    showNotification(`-${damage} PV`);
                    updateUI();
                    
                    if (player.health <= 0) {
                        showMessage('Tu es mort... Ton aventure se termine ici.');
                        changeGameState(GAME_STATES.GAME_OVER);
                    }
                    break;

                case 'rest':
                    const healAmount = Math.floor(player.maxHealth * 0.3);
                    player.health = Math.min(player.maxHealth, player.health + healAmount);
                    showMessage(`Tu trouves un endroit paisible pour te reposer. Tu récupères ${healAmount} PV.`);
                    showNotification(`+${healAmount} PV`);
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

    // Combat
    const attackBtn = safeGetElement('attackBtn');
    if (attackBtn) {
        attackBtn.addEventListener('click', () => {
            if (!currentEnemy) return;

            // Attaque du joueur
            const playerDamage = Math.max(1, player.attack + Math.floor(Math.random() * 5) - currentEnemy.defense);
            currentEnemy.health -= playerDamage;
            
            let message = `Tu attaques ${currentEnemy.name} et infliges ${playerDamage} dégâts !`;

            if (currentEnemy.health <= 0) {
                // Ennemi vaincu
                player.stats.enemiesKilled++;
                const expGained = currentEnemy.exp;
                const goldGained = Math.floor(Math.random() * (currentEnemy.gold[1] - currentEnemy.gold[0] + 1)) + currentEnemy.gold[0];
                
                message += ` ${currentEnemy.name} est vaincu !`;
                showMessage(message);
                
                player.gold += goldGained;
                gainExp(expGained);
                showNotification(`+${goldGained} or`);
                
                setTimeout(() => {
                    showMessage('Victoire ! Tu peux continuer ton exploration.');
                    changeGameState(GAME_STATES.EXPLORING);
                    checkQuestProgress();
                }, 2000);
            } else {
                // Ennemi contre-attaque
                const enemyDamage = Math.max(1, currentEnemy.attack + Math.floor(Math.random() * 3) - player.defense);
                player.health -= enemyDamage;
                message += ` ${currentEnemy.name} contre-attaque et t'inflige ${enemyDamage} dégâts !`;
                
                showMessage(message);
                updateEnemyUI();
                updateUI();
                
                if (player.health <= 0) {
                    setTimeout(() => {
                        showMessage('Tu es mort... Ton aventure se termine ici.');
                        changeGameState(GAME_STATES.GAME_OVER);
                    }, 1500);
                }
            }
        });
    }

    const fleeBtn = safeGetElement('fleeBtn');
    if (fleeBtn) {
        fleeBtn.addEventListener('click', () => {
            const success = Math.random() > 0.25; // 75% de chance de réussir
            
            if (success) {
                showMessage("Tu prends la fuite avec succès !");
                setTimeout(() => {
                    changeGameState(GAME_STATES.EXPLORING);
                }, 1500);
            } else {
                const damage = Math.floor(Math.random() * 10) + 3;
                player.health = Math.max(0, player.health - damage);
                showMessage(`Tu essaies de fuir mais ${currentEnemy.name} t'inflige ${damage} dégâts ! Tu réussis finalement à t'échapper.`);
                showNotification(`-${damage} PV`);
                updateUI();
                
                setTimeout(() => {
                    if (player.health <= 0) {
                        showMessage('Tu es mort... Ton aventure se termine ici.');
                        changeGameState(GAME_STATES.GAME_OVER);
                    } else {
                        changeGameState(GAME_STATES.EXPLORING);
                    }
                }, 2000);
            }
        });
    }

    // Utilisation d'objets
    const useItemBtn = safeGetElement('useItemBtn');
    if (useItemBtn) {
        useItemBtn.addEventListener('click', () => {
            const potions = player.inventory.filter(item => item.includes('potion') || item.includes('Potion'));
            
            if (potions.length === 0) {
                showMessage("Tu n'as pas d'objet utilisable !");
                return;
            }

            const usedPotion = potions[0];
            const potionIndex = player.inventory.indexOf(usedPotion);
            player.inventory.splice(potionIndex, 1);
            
            player.stats.potionsUsed++;
            
            let healAmount = 40;
            if (usedPotion.includes('Grande')) {
                healAmount = 80;
            }
            
            const oldHealth = player.health;
            player.health = Math.min(player.maxHealth, player.health + healAmount);
            const actualHeal = player.health - oldHealth;
            
            showMessage(`Tu utilises ${usedPotion} et récupères ${actualHeal} PV !`);
            showNotification(`+${actualHeal} PV`);
            updateUI();
            showButtonsForState(currentGameState);
            checkQuestProgress();
        });
    }

    // Quêtes
    const questBtn = safeGetElement('questBtn');
    if (questBtn) {
        questBtn.addEventListener('click', () => {
            showMessage('Tu cherches des PNJ ayant besoin d\'aide...');
            
            setTimeout(() => {
                const chance = Math.random();
                if (chance < 0.7) { // 70% de chance de trouver un PNJ
                    meetQuestGiver();
                } else {
                    showMessage('Tu ne trouves personne ayant besoin d\'aide pour le moment. Essaie de nouveau plus tard !');
                }
            }, 1500);
        });
    }

    // Repos
    const restBtn = safeGetElement('restBtn');
    if (restBtn) {
        restBtn.addEventListener('click', () => {
            if (player.health === player.maxHealth) {
                showMessage("Tu es déjà en pleine forme !");
                return;
            }
            
            const cost = 10;
            if (player.gold < cost) {
                showMessage("Il te faut 10 pièces d'or pour te reposer dans une auberge.");
                return;
            }
            
            player.gold -= cost;
            player.stats.goldSpent += cost;
            player.health = player.maxHealth;
            showMessage(`Tu te reposes dans une auberge confortable pour 10 or. Santé restaurée !`);
            showNotification("Santé restaurée !");
            updateUI();
            checkQuestProgress();
        });
    }

    // Magasin
    const shopBtn = safeGetElement('shopBtn');
    if (shopBtn) {
        shopBtn.addEventListener('click', () => {
            if (document.querySelector('.shop-button')) {
                showMessage("Le magasin est déjà ouvert !");
                return;
            }
            
            changeGameState(GAME_STATES.SHOPPING);
            showMessage(`Bienvenue au magasin ! Tu as ${player.gold} pièces d'or.`);

            Object.keys(shopItems).forEach(itemKey => {
                const item = shopItems[itemKey];
                const btn = document.createElement('button');
                btn.textContent = `${item.name} (${item.price} or)`;
                btn.className = 'shop-button';
                btn.disabled = player.gold < item.price;
                
                btn.addEventListener('click', () => {
                    if (player.gold >= item.price) {
                        player.gold -= item.price;
                        player.stats.goldSpent += item.price;
                        
                        if (item.effect === 'heal') {
                            player.inventory.push(item.name);
                        } else if (item.effect === 'attack') {
                            player.attack += item.value;
                            player.inventory.push(item.name);
                        } else if (item.effect === 'defense') {
                            player.defense += item.value;
                            player.inventory.push(item.name);
                        }
                        
                        showMessage(`Tu achètes ${item.name} pour ${item.price} or !`);
                        showNotification("Achat effectué !");
                        updateUI();
                        closeShop();
                        checkQuestProgress();
                    }
                });
                
                const story = safeGetElement('story');
                if (story) {
                    story.appendChild(btn);
                }
            });
            
            const exitBtn = document.createElement('button');
            exitBtn.textContent = 'Quitter le magasin';
            exitBtn.className = 'shop-button';
            exitBtn.addEventListener('click', closeShop);
            
            const story = safeGetElement('story');
            if (story) {
                story.appendChild(exitBtn);
            }
        });
    }

    // Sauvegarde/Chargement
    const saveBtn = safeGetElement('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const saveData = {
                player: player,
                activeQuests: activeQuests,
                completedQuests: completedQuests
            };
            try {
                localStorage.setItem('goldOfWarSave', JSON.stringify(saveData));
                showNotification('Partie sauvegardée !');
            } catch(e) {
                console.error('Erreur de sauvegarde:', e);
                showNotification('Erreur de sauvegarde !');
            }
        });
    }

    const loadBtn = safeGetElement('loadBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            try {
                const save = localStorage.getItem('goldOfWarSave');
                if (save) {
                    const saveData = JSON.parse(save);
                    
                    // Rétrocompatibilité avec les anciennes sauvegardes
                    if (saveData.player) {
                        player = { ...player, ...saveData.player };
                        activeQuests = saveData.activeQuests || [];
                        completedQuests = saveData.completedQuests || [];
                        
                        // Ajouter les nouvelles propriétés si elles n'existent pas
                        if (!player.stats) {
                            player.stats = {
                                enemiesKilled: 0,
                                treasuresFound: 0,
                                explorations: 0,
                                potionsUsed: 0,
                                goldSpent: 0
                            };
                        }
                    } else {
                        // Ancienne sauvegarde (juste le joueur)
                        player = { ...player, ...saveData };
                        if (!player.stats) {
                            player.stats = {
                                enemiesKilled: 0,
                                treasuresFound: 0,
                                explorations: 0,
                                potionsUsed: 0,
                                goldSpent: 0
                            };
                        }
                        activeQuests = [];
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
            } catch(e) {
                console.error('Erreur de chargement:', e);
                showNotification('Erreur de chargement !');
            }
        });
    }

    const resetBtn = safeGetElement('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir recommencer une nouvelle partie ?')) {
                player = {
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
                activeQuests = [];
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

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}