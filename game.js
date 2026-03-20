<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gold of War</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>⚔️ Gold of War ⚔️</h1>

        <div class="game-layout">
            <!-- Panneau gauche : statistiques du joueur -->
            <div class="stats-panel">
                <h2>🧙 Héros</h2>
                <div class="stat-item">
                    <span>Nom :</span>
                    <span id="playerName">Héros</span>
                </div>
                <div class="stat-item">
                    <span>Niveau :</span>
                    <span id="playerLevel">1</span>
                </div>
                <div class="stat-item">
                    <span>PV :</span>
                    <span><span id="playerHealth">100</span> / <span id="playerMaxHealth">100</span></span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill health-fill" id="healthFill" style="width: 100%;"></div>
                </div>
                <div class="stat-item">
                    <span>XP :</span>
                    <span><span id="playerExp">0</span> / <span id="playerMaxExp">100</span></span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill exp-fill" id="expFill" style="width: 0%;"></div>
                </div>
                <div class="stat-item">
                    <span>Or :</span>
                    <span id="playerGold">50</span>
                </div>
                <div class="stat-item">
                    <span>Attaque :</span>
                    <span id="playerAttack">10</span>
                </div>
                <div class="stat-item">
                    <span>Défense :</span>
                    <span id="playerDefense">5</span>
                </div>
                <div class="stat-item">
                    <span>Inventaire :</span>
                    <span id="playerInventory">épée rouillée</span>
                </div>
            </div>

            <!-- Panneau central : ennemi -->
            <div class="enemy-panel">
                <h2>👾 Ennemi</h2>
                <div id="enemy-info" style="display: none;">
                    <div class="enemy-stats">
                        <img id="enemyImage" src="" alt="" style="display: none; max-width: 150px; margin: 0 auto 10px; display: block;">
                        <div class="stat-item">
                            <span>Nom :</span>
                            <span id="enemyName">-</span>
                        </div>
                        <div class="stat-item">
                            <span>PV :</span>
                            <span><span id="enemyHealth">0</span> / <span id="enemyMaxHealth">0</span></span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill health-fill" id="enemyHealthFill" style="width: 100%;"></div>
                        </div>
                        <div class="stat-item">
                            <span>Attaque :</span>
                            <span id="enemyAttack">0</span>
                        </div>
                        <div class="stat-item">
                            <span>Défense :</span>
                            <span id="enemyDefense">0</span>
                        </div>
                    </div>
                </div>
                <p id="no-enemy-msg" style="text-align: center; color: #999; margin-top: 20px;">Aucun ennemi en vue. Explore pour en trouver !</p>
            </div>

            <!-- Panneau droit : quêtes -->
            <div class="quests-panel">
                <h2>📜 Quêtes actives</h2>
                <div id="active-quests">
                    <p style="text-align: center; color: #999;">Aucune quête active. Cherche des PNJ pour obtenir des missions !</p>
                </div>
            </div>
        </div>

        <!-- Zone de narration -->
        <div class="story-section">
            <div id="story">
                <p>Bienvenue, brave aventurier ! Ton voyage commence maintenant...</p>
            </div>

            <!-- Boutons d'action -->
            <div class="controls">
                <button id="exploreBtn">🗺️ Explorer</button>
                <button id="attackBtn" style="display: none;">⚔️ Attaquer</button>
                <button id="fleeBtn" style="display: none;">🏃 Fuir</button>
                <button id="useItemBtn" style="display: none;">🧪 Utiliser potion</button>
                <button id="shopBtn">🏪 Magasin</button>
                <button id="questBtn">📜 Chercher des quêtes</button>
                <button id="restBtn">🏨 Se reposer (10 or)</button>
            </div>
        </div>

        <!-- Boutons utilitaires -->
        <div class="utility-buttons">
            <button id="saveBtn">💾 Sauvegarder</button>
            <button id="loadBtn">📂 Charger</button>
            <button id="resetBtn">🔄 Nouvelle partie</button>
        </div>
    </div>

    <script src="game.js"></script>
</body>
</html>
