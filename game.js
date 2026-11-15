// ==========================================
// TWI-LIL - SPACE ADVENTURE
// JSON-BASED GAME ENGINE + EXPLORABLE STATION
// ==========================================

// CANVAS
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

// SCREENS
const startScreen = document.getElementById("start-screen");
const questionScreen = document.getElementById("question-screen");

// BUTTONS
const startButton = document.getElementById("start-button");
const continueButton = document.getElementById("continue-button");

// TEXT ELEMENTS
const questionTitle = document.getElementById("question-title");
const questionText = document.getElementById("question-text");
const answerOptions = document.getElementById("answer-options");
const feedback = document.getElementById("feedback");

// STATISTICS
const scoreDisplay = document.getElementById("score");
const energyDisplay = document.getElementById("energy");
const shieldDisplay = document.getElementById("shield");
const radiationDisplay = document.getElementById("radiation");
const missionDisplay = document.getElementById("mission-number");

// ==========================================
// GAME DATA
// ==========================================

let adventure;
let nodes = {};
let endings = {};

let gameState = {};
let currentNode = null;
let nextNode = null;
let pendingNode = null;

let score = 0;
let gameOver = false;
let gameStarted = false;
let gameMode = "exploration";

// ==========================================
// MINIGAMES
// ==========================================

let pendingMinigame = null;
let activeMinigame = null;
let minigameNextNode = null;

let minigameStep = 0;
let alignmentPosition = 10;
let minigameMessage = "";

// ==========================================
// SCENE / STATION DATA
// ==========================================

let scene = "exterior";
let currentRoom = "hallway";

const stationRooms = {

    hallway: {
        name: "CENTRAL HALLWAY",
        subtitle: "Choose a room to explore",

        doors: [
            { x: 240, y: 17, w: 38, h: 20, label: "COCKPIT", target: "cockpit", spawnX: 240, spawnY: 235 },
            { x: 17, y: 128, w: 20, h: 38, label: "ENGINEERING", target: "engineering", spawnX: 445, spawnY: 135 },
            { x: 443, y: 128, w: 20, h: 38, label: "LIVING QUARTERS", target: "living", spawnX: 35, spawnY: 135 },
            { x: 112, y: 243, w: 38, h: 20, label: "HYDROPONICS", target: "hydroponics", spawnX: 240, spawnY: 235 },
            { x: 330, y: 243, w: 38, h: 20, label: "EVA ROOM", target: "eva", spawnX: 240, spawnY: 235 },
            { x: 221, y: 243, w: 38, h: 20, label: "EXIT", target: "exterior", spawnX: 375, spawnY: 202 }
        ],

        furniture: [
            { x: 75, y: 103, w: 65, h: 22, type: "bench" },
            { x: 340, y: 103, w: 65, h: 22, type: "bench" },
            { x: 207, y: 91, w: 66, h: 30, type: "console" }
        ]
    },

    cockpit: {
        name: "COCKPIT",
        subtitle: "Navigation and station controls",

        doors: [
            { x: 221, y: 243, w: 38, h: 20, label: "HALLWAY", target: "hallway", spawnX: 240, spawnY: 235 }
        ],

        furniture: [
            { x: 65, y: 35, w: 85, h: 30, type: "console" },
            { x: 330, y: 35, w: 85, h: 30, type: "console" },
            { x: 175, y: 25, w: 130, h: 24, type: "window" },
            { x: 82, y: 165, w: 65, h: 35, type: "seat" },
            { x: 333, y: 165, w: 65, h: 35, type: "seat" },
            { x: 195, y: 155, w: 90, h: 35, type: "console" }
        ]
    },

    engineering: {
        name: "ENGINEERING",
        subtitle: "Power, machinery and repairs",

        doors: [
            { x: 443, y: 116, w: 20, h: 38, label: "HALLWAY", target: "hallway", spawnX: 45, spawnY: 145 }
        ],

        furniture: [
            { x: 55, y: 35, w: 95, h: 48, type: "machine" },
            { x: 180, y: 35, w: 115, h: 48, type: "machine" },
            { x: 330, y: 35, w: 90, h: 48, type: "machine" },
            { x: 75, y: 155, w: 75, h: 48, type: "machine" },
            { x: 185, y: 170, w: 110, h: 30, type: "console" },
            { x: 330, y: 155, w: 75, h: 48, type: "machine" }
        ]
    },

    living: {
        name: "LIVING QUARTERS",
        subtitle: "A quiet place for the crew",

        doors: [
            { x: 17, y: 116, w: 20, h: 38, label: "HALLWAY", target: "hallway", spawnX: 435, spawnY: 145 }
        ],

        furniture: [
            { x: 55, y: 40, w: 125, h: 48, type: "bed" },
            { x: 300, y: 40, w: 125, h: 48, type: "bed" },
            { x: 85, y: 145, w: 70, h: 42, type: "table" },
            { x: 325, y: 145, w: 70, h: 42, type: "table" },
            { x: 205, y: 45, w: 70, h: 28, type: "plant" }
        ]
    },

    hydroponics: {
        name: "HYDROPONICS",
        subtitle: "Growing fresh food in space",

        doors: [
            { x: 221, y: 17, w: 38, h: 20, label: "HALLWAY", target: "hallway", spawnX: 130, spawnY: 220 }
        ],

        furniture: [
            { x: 45, y: 48, w: 105, h: 38, type: "plants" },
            { x: 185, y: 48, w: 105, h: 38, type: "plants" },
            { x: 330, y: 48, w: 105, h: 38, type: "plants" },
            { x: 45, y: 145, w: 105, h: 38, type: "plants" },
            { x: 185, y: 145, w: 105, h: 38, type: "plants" },
            { x: 330, y: 145, w: 105, h: 38, type: "plants" }
        ]
    },

    eva: {
        name: "EVA ROOM",
        subtitle: "Prepare for an external spacewalk",

        doors: [
            { x: 221, y: 17, w: 38, h: 20, label: "HALLWAY", target: "hallway", spawnX: 350, spawnY: 220 }
        ],

        furniture: [
            { x: 55, y: 42, w: 82, h: 65, type: "suit" },
            { x: 345, y: 42, w: 82, h: 65, type: "suit" },
            { x: 170, y: 45, w: 140, h: 35, type: "console" },
            { x: 85, y: 155, w: 90, h: 42, type: "machine" },
            { x: 305, y: 155, w: 90, h: 42, type: "machine" }
        ]
    }
};

// ==========================================
// MISSION ROOM MAPPING
// ==========================================

function getRoomForNode(node) {

    if (!node || !node.room) return null;

    const roomNames = {
        cockpit: "cockpit",
        engineering: "engineering",
        living_quarters: "living",
        hydroponics_greenhouse: "hydroponics",
        eva_room: "eva",
        eva: "eva"
    };

    return roomNames[node.room] || node.room;
}

function getMissionRoomName(node) {

    const room = getRoomForNode(node);

    const roomNames = {
        cockpit: "COCKPIT",
        engineering: "ENGINEERING",
        living: "LIVING QUARTERS",
        hydroponics: "HYDROPONICS",
        eva: "EVA ROOM"
    };

    return roomNames[room] || room;
}

// ==========================================
// PLAYER
// ==========================================

const player = {
    x: 55,
    y: 202,
    width: 12,
    height: 18,
    speed: 1.8,
    velocityY: 0,
    jumping: false,
    facing: "right"
};

const groundY = 220;

let keys = {};
let animationFrame = 0;
let playerAnimationTick = 0;
let previousPlayerX = null;
let previousPlayerY = null;

// ==========================================
// LOAD JSON
// ==========================================

async function loadAdventure() {

    console.log("start button clicked");

    try {

        const response = await fetch("./missions.json");

        if (!response.ok) {
            throw new Error("Could not load missions.json");
        }

        const data = await response.json();
        adventure = data.space_adventure;

        if (!adventure || !adventure.nodes || !adventure.endings) {
            throw new Error("Invalid adventure structure");
        }

        adventure.nodes.forEach(node => {
            nodes[node.id] = node;
        });

        adventure.endings.forEach(ending => {
            endings[ending.id] = ending;
        });

        console.log("Twi-Lil JSON loaded successfully!");

        resetGame();

        gameStarted = true;
        gameMode = "exploration";
        scene = "exterior";
        currentRoom = "hallway";

        pendingNode = adventure.start_node;

        startScreen.classList.add("hidden");
        questionScreen.classList.add("hidden");

    } catch (error) {

        console.error("Error loading adventure:", error);

        questionScreen.classList.remove("hidden");
        questionTitle.textContent = "TRANSMISSION ERROR";
        questionText.textContent =
            "The mission data could not be loaded. Check missions.json and use Live Server.";

        answerOptions.innerHTML = "";
        feedback.textContent = "";
    }
}

// ==========================================
// INITIALIZE GAME
// ==========================================

function resetGame() {

    gameState = { ...adventure.start_state };

    score = 0;
    gameOver = false;
    currentNode = null;
    nextNode = null;

    scene = "exterior";
    currentRoom = "hallway";

    player.x = 55;
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.jumping = false;
    player.facing = "right";

    scoreDisplay.textContent = score;

    updateStats();

    pendingMinigame = null;
    activeMinigame = null;
    minigameNextNode = null;
    minigameStep = 0;
    alignmentPosition = 10;
    minigameMessage = "";
}

// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStats() {

    energyDisplay.textContent = gameState.energy;
    shieldDisplay.textContent = gameState.shield;
    radiationDisplay.textContent = gameState.radiation;
}

// ==========================================
// CHECK LOSE CONDITIONS
// ==========================================

function checkLoseConditions() {

    for (const condition of adventure.lose_conditions) {

        const value = gameState[condition.stat];
        let lost = false;

        switch (condition.operator) {

            case "<=": lost = value <= condition.value; break;
            case ">=": lost = value >= condition.value; break;
            case "<": lost = value < condition.value; break;
            case ">": lost = value > condition.value; break;
            case "==": lost = value === condition.value; break;
        }

        if (lost) return condition.ending;
    }

    return null;
}

// ==========================================
// APPLY ONE STAT MODIFICATION
// ==========================================

function modifyStat(stat, amount) {

    const limits = adventure.stat_limits[stat];

    if (!limits || typeof amount !== "number") {
        return null;
    }

    gameState[stat] += amount;

    gameState[stat] = Math.max(
        limits.min,
        Math.min(limits.max, gameState[stat])
    );

    updateStats();

    return checkLoseConditions();
}

// ==========================================
// APPLY ANSWER EFFECTS
// ==========================================

function applyEffects(option) {

    const effects = option.effects || {};
    const order = adventure.answer_rules.effect_application_order;

    for (const stat of order) {

        if (typeof effects[stat] !== "number") continue;

        const ending = modifyStat(stat, effects[stat]);

        if (ending) return ending;
    }

    return null;
}

// ==========================================
// DISPLAY A STORY NODE
// ==========================================

function showNode(nodeId) {

    if (endings[nodeId]) {
        showEnding(nodeId);
        return;
    }

    const node = nodes[nodeId];

    if (!node) {

        questionTitle.textContent = "MISSION ERROR";
        questionText.textContent =
            "The next mission could not be found: " + nodeId;

        answerOptions.innerHTML = "";
        feedback.textContent = "";

        continueButton.classList.add("hidden");
        questionScreen.classList.remove("hidden");

        console.error("Missing node:", nodeId);

        return;
    }

    currentNode = node;
    nextNode = null;
    gameOver = false;
    gameMode = "mission";

    questionTitle.textContent = node.scene_title;
    questionText.textContent = node.story.replace(/\*/g, "");

    answerOptions.innerHTML = "";
    feedback.textContent = "";

    continueButton.classList.add("hidden");

    const nodeIndex = adventure.nodes.findIndex(
        item => item.id === nodeId
    );

    missionDisplay.textContent =
        String(nodeIndex + 1).padStart(2, "0");

    node.options.forEach(option => {

        const button = document.createElement("button");

        button.className = "answer-button";
        button.textContent = option.text.replace(/\*/g, "");

        button.addEventListener("click", () => {
            selectAnswer(option);
        });

        answerOptions.appendChild(button);
    });

    questionScreen.classList.remove("hidden");
}

// ==========================================
// SELECT ANSWER
// ==========================================

function selectAnswer(option) {

    if (gameOver || nextNode !== null) return;

    const buttons = answerOptions.querySelectorAll("button");

    buttons.forEach(button => {
        button.disabled = true;
    });

    if (!option.is_correct) {
        gameState.failed_attempts++;
    } else {
        score += 100;
        scoreDisplay.textContent = score;
    }

    const ending = applyEffects(option);

    if (ending) {
        showEnding(ending);
        return;
    }

    const result = option.result || "";
    const lesson = option.lesson || "";

    feedback.textContent =
        result.replace(/\*/g, "") +
        "\n\n" +
        lesson.replace(/\*/g, "");

    feedback.style.color =
        option.is_correct ? "#ffdb79" : "#f28bb5";

    nextNode = option.next;

    // Only correct answers can activate a minigame.
    pendingMinigame =
        option.is_correct && currentNode.minigame
            ? currentNode.minigame
            : null;

    continueButton.textContent = "CONTINUE";
    continueButton.classList.remove("hidden");
}

// ==========================================
// CONTINUE TO NEXT MISSION
// ==========================================

function nextMission() {

    if (gameOver) {
        restartGame();
        return;
    }

    if (!nextNode) return;

    const destination = nextNode;
    nextNode = null;

    // Start the minigame before moving to the next node.
    if (pendingMinigame) {

        activeMinigame = pendingMinigame;
        pendingMinigame = null;

        minigameNextNode = destination;
        minigameStep = 0;
        alignmentPosition = 10;
        minigameMessage = "";

        gameMode = "minigame";

        questionScreen.classList.add("hidden");

        return;
    }

    // If the destination is an ending, show it.
    if (endings[destination]) {
        showNode(destination);
        return;
    }

    // Otherwise, the next mission becomes pending.
    pendingNode = destination;

    gameMode = "exploration";

    questionScreen.classList.add("hidden");
}

// ==========================================
// MINIGAME LOGIC
// ==========================================

function handleMinigameKey(event) {

    if (!activeMinigame) return;

    // CIRCUIT REPAIR
    if (activeMinigame === "circuit_repair") {

        if (event.key.toLowerCase() === "e") {

            minigameStep++;

            if (minigameStep >= 3) {
                finishMinigame();
            } else {
                minigameMessage =
                    "Connection repaired! Continue with the next one.";
            }
        }

        return;
    }

    // PLANT, WATER AND HARVEST
    if (activeMinigame === "plant_water_harvest") {

        if (event.key.toLowerCase() === "e") {

            minigameStep++;

            if (minigameStep >= 3) {
                finishMinigame();
            } else {
                const actions = [
                    "Plant the seeds.",
                    "Water the plants.",
                    "Harvest the crops."
                ];

                minigameMessage = actions[minigameStep];
            }
        }

        return;
    }

    // REENTRY ALIGNMENT
    if (activeMinigame === "reentry_alignment") {

        if (event.key === "ArrowRight") {
            alignmentPosition = Math.min(100, alignmentPosition + 5);
        }

        if (event.key === "ArrowLeft") {
            alignmentPosition = Math.max(0, alignmentPosition - 5);
        }

        if (event.key.toLowerCase() === "e") {

            if (
                alignmentPosition >= 45 &&
                alignmentPosition <= 65
            ) {
                finishMinigame();
            } else {
                minigameMessage =
                    "Not aligned yet. Adjust the indicator!";
            }
        }
    }
}

// ==========================================
// FINISH MINIGAME
// ==========================================

function finishMinigame() {

    const destination = minigameNextNode;

    activeMinigame = null;
    minigameNextNode = null;
    minigameStep = 0;

    // Minigames do not modify player statistics.

    if (endings[destination]) {
        showNode(destination);
        return;
    }

    pendingNode = destination;
    gameMode = "exploration";
}

// ==========================================
// DRAW MINIGAME
// ==========================================

function drawMinigame() {

    if (!activeMinigame) return;

    // Background panel
    drawRect(45, 48, 390, 175, "#342e50");
    drawRect(51, 54, 378, 163, "#514568");

    ctx.textAlign = "center";

    ctx.fillStyle = "#ffdb79";
    ctx.font = "bold 15px monospace";

    let title = "";

    if (activeMinigame === "circuit_repair") {
        title = "CIRCUIT REPAIR";
    }

    if (activeMinigame === "plant_water_harvest") {
        title = "HYDROPONICS TASK";
    }

    if (activeMinigame === "reentry_alignment") {
        title = "REENTRY ALIGNMENT";
    }

    ctx.fillText(title, 240, 78);

    ctx.fillStyle = "#fff0dc";
    ctx.font = "10px monospace";

    // CIRCUIT REPAIR VISUALS
    if (activeMinigame === "circuit_repair") {

        ctx.fillText(
            "Repair all three connections",
            240,
            105
        );

        for (let i = 0; i < 3; i++) {

            const x = 155 + i * 85;

            drawRect(
                x,
                125,
                35,
                25,
                i < minigameStep ? "#83b77b" : "#76638b"
            );

            drawRect(x + 12, 132, 11, 11, "#ffdb79");
        }

        ctx.fillText(
            "Press E to repair the next connection",
            240,
            180
        );
    }

    // PLANT, WATER AND HARVEST VISUALS
    if (activeMinigame === "plant_water_harvest") {

        const actions = [
            "PLANT THE SEEDS",
            "WATER THE PLANTS",
            "HARVEST THE CROPS"
        ];

        const plants = [
            "🌱",
            "🌿",
            "🌾"
        ];

        ctx.fillText(
            actions[Math.min(minigameStep, 2)],
            240,
            105
        );

        for (let i = 0; i < 3; i++) {

            const x = 145 + i * 85;

            drawRect(
                x,
                125,
                40,
                35,
                i < minigameStep ? "#83b77b" : "#76638b"
            );

            ctx.fillStyle = "#fff0dc";
            ctx.font = "17px monospace";

            ctx.fillText(
                plants[Math.min(minigameStep, 2)],
                x + 20,
                150
            );
        }

        ctx.fillStyle = "#fff0dc";
        ctx.font = "10px monospace";

        ctx.fillText(
            "Press E to perform the action",
            240,
            185
        );
    }

    // REENTRY ALIGNMENT VISUALS
    if (activeMinigame === "reentry_alignment") {

        ctx.fillText(
            "Move the indicator into the green zone",
            240,
            105
        );

        // Alignment bar
        drawRect(100, 135, 280, 18, "#76638b");

        // Target zone
        drawRect(226, 135, 56, 18, "#83b77b");

        // Player indicator
        drawRect(
            100 + alignmentPosition * 2.8 - 4,
            130,
            8,
            28,
            "#ffdb79"
        );

        ctx.fillText(
            "LEFT / RIGHT to move  |  E to confirm",
            240,
            185
        );
    }

    if (minigameMessage) {

        ctx.fillStyle = "#ffdb79";
        ctx.font = "9px monospace";

        ctx.fillText(
            minigameMessage,
            240,
            204
        );
    }

    ctx.textAlign = "left";
}

// ==========================================
// DISPLAY ENDING
// ==========================================

function showEnding(endingId) {

    const ending = endings[endingId];

    if (!ending) {
        console.error("Ending not found:", endingId);
        return;
    }

    gameOver = true;
    nextNode = null;

    questionTitle.textContent = ending.scene_title;
    questionText.textContent = ending.story;

    answerOptions.innerHTML = "";

    feedback.textContent =
        "ENERGY: " + gameState.energy +
        " | SHIELD: " + gameState.shield +
        " | RADIATION: " + gameState.radiation +
        " | STARS: " + score;

    continueButton.textContent = "PLAY AGAIN";
    continueButton.classList.remove("hidden");

    questionScreen.classList.remove("hidden");
}

// ==========================================
// RESTART
// ==========================================

function restartGame() {

    resetGame();

    gameOver = false;
    gameMode = "exploration";

    pendingNode = adventure.start_node;

    questionScreen.classList.add("hidden");
    continueButton.classList.add("hidden");
}

// ==========================================
// PIXEL ART HELPERS
// ==========================================

function drawRect(x, y, w, h, color) {

    ctx.fillStyle = color;

    ctx.fillRect(
        Math.round(x),
        Math.round(y),
        Math.round(w),
        Math.round(h)
    );
}

function drawPixelWindow(x, y, w, h) {

    drawRect(x, y, w, h, "#342e50");
    drawRect(x + 3, y + 3, w - 6, h - 6, "#6d83b5");

    drawRect(x + 5, y + 5, 8, 4, "#fff0c7");
    drawRect(x + w - 13, y + h - 9, 7, 4, "#b18bd2");

    drawRect(x + w / 2 - 1, y + 3, 2, h - 6, "#d7c6dc");
    drawRect(x + 3, y + h / 2 - 1, w - 6, 2, "#d7c6dc");
}

function drawPlant(x, y) {

    drawRect(x + 5, y + 12, 12, 7, "#b96f69");

    drawRect(x + 9, y + 6, 4, 8, "#6b9b70");
    drawRect(x + 4, y + 5, 7, 5, "#83b77b");
    drawRect(x + 12, y + 2, 7, 6, "#83b77b");
    drawRect(x + 13, y + 8, 6, 4, "#a4c77e");
}

// ==========================================
// DRAW DOORS
// ==========================================

function drawDoor(door, highlighted) {

    const horizontal = door.w > door.h;

    drawRect(door.x, door.y, door.w, door.h, "#392f4d");

    drawRect(
        door.x + (horizontal ? 4 : 0),
        door.y + (horizontal ? 0 : 4),
        door.w - (horizontal ? 8 : 0),
        door.h - (horizontal ? 0 : 8),
        highlighted ? "#f2c879" : "#b87991"
    );

    if (horizontal) {

        drawRect(
            door.x + 8,
            door.y + 3,
            door.w - 16,
            door.h - 6,
            "#776080"
        );

        drawRect(
            door.x + door.w - 11,
            door.y + 8,
            3,
            3,
            "#ffdf91"
        );

    } else {

        drawRect(
            door.x + 3,
            door.y + 8,
            door.w - 6,
            door.h - 16,
            "#776080"
        );

        drawRect(
            door.x + 8,
            door.y + door.h - 11,
            3,
            3,
            "#ffdf91"
        );
    }
}

// ==========================================
// FURNITURE PIXEL ART DETAILS
// ==========================================

function drawScreen(x, y, w, h, color = "#83C7DC") {

    drawRect(x, y, w, h, "#211C3B");
    drawRect(x + 2, y + 2, w - 4, h - 4, "#514477");
    drawRect(x + 4, y + 4, w - 8, h - 8, color);

    // Screen reflections
    drawRect(x + 5, y + 5, Math.max(2, w / 4), 2, "#FFF5DF");

    // Tiny interface details
    if (w > 25) {
        drawRect(x + 5, y + h - 8, 5, 2, "#FFDB79");
        drawRect(x + 13, y + h - 8, 7, 2, "#B18BD2");
    }
}

function drawIndicator(x, y, color) {
    drawRect(x, y, 5, 5, "#211C3B");
    drawRect(x + 1, y + 1, 3, 3, color);
}

function drawPipe(x, y, w, color = "#83C7DC") {

    drawRect(x, y, w, 5, "#514477");
    drawRect(x + 2, y + 1, w - 4, 2, color);

    drawRect(x, y - 2, 5, 9, "#9876B5");
    drawRect(x + w - 5, y - 2, 5, 9, "#9876B5");
}

// ==========================================
// DRAW FURNITURE - STARLIGHT PIXEL ART
// ==========================================

function drawFurniture(item) {

    const x = item.x;
    const y = item.y;
    const w = item.w;
    const h = item.h;

    switch (item.type) {

        // ==================================
        // FUTURISTIC CONSOLE
        // ==================================

        case "console":

            // Shadow
            drawRect(x + 3, y + h - 3, w - 6, 5, "#211C3B");

            // Main body
            drawRect(x, y + 7, w, h - 7, "#302747");
            drawRect(x + 3, y + 9, w - 6, h - 12, "#514477");

            // Top surface
            drawRect(x + 3, y + 2, w - 6, 9, "#9876B5");
            drawRect(x + 5, y + 3, w - 10, 3, "#D5B5D8");

            // Main display
            if (w > 40) {
                drawScreen(x + 8, y + 13, w * 0.42, Math.min(15, h - 17));
            } else {
                drawScreen(x + 5, y + 13, w - 10, Math.min(12, h - 17));
            }

            // Control buttons
            drawIndicator(x + w - 17, y + 14, "#83C7DC");
            drawIndicator(x + w - 9, y + 14, "#FFDB79");

            drawRect(x + 5, y + h - 4, w - 10, 2, "#83C7DC");

            break;

        // ==================================
        // HALLWAY BENCH
        // ==================================

        case "bench":

            drawRect(x + 5, y + h - 2, w - 10, 5, "#211C3B");

            // Legs
            drawRect(x + 8, y + h - 5, 5, 7, "#9876B5");
            drawRect(x + w - 13, y + h - 5, 5, 7, "#9876B5");

            // Seat
            drawRect(x, y + 5, w, h - 5, "#514477");
            drawRect(x + 3, y + 1, w - 6, 9, "#D58AA9");
            drawRect(x + 5, y + 3, w - 10, 3, "#F3C6D2");

            // Decorative divisions
            drawRect(x + w / 2 - 1, y + 3, 2, 5, "#9876B5");

            break;

        // ==================================
        // ENGINEERING MACHINE
        // ==================================

        case "machine":

            // Shadow
            drawRect(x + 4, y + h - 2, w - 8, 5, "#211C3B");

            // Main casing
            drawRect(x, y, w, h, "#302747");
            drawRect(x + 3, y + 3, w - 6, h - 6, "#514477");

            // Metallic borders
            drawRect(x + 3, y + 3, w - 6, 3, "#9876B5");
            drawRect(x + 3, y + h - 6, w - 6, 3, "#9876B5");

            // Main display
            drawScreen(
                x + 8,
                y + 9,
                Math.min(30, w - 16),
                Math.min(19, h - 15),
                "#83C7DC"
            );

            // Energy indicators
            drawIndicator(x + w - 16, y + 10, "#A4C77E");
            drawIndicator(x + w - 16, y + 20, "#FFDB79");

            // Cooling vents
            for (let i = 0; i < 3; i++) {
                drawRect(
                    x + 8 + i * 8,
                    y + h - 8,
                    5,
                    2,
                    "#B18BD2"
                );
            }

            // Side lights
            drawRect(x + w - 5, y + 4, 2, h - 8, "#83C7DC");

            break;

        // ==================================
        // COZY SPACE BED
        // ==================================

        case "bed":

            // Shadow
            drawRect(x + 5, y + h - 2, w - 10, 5, "#211C3B");

            // Bed frame
            drawRect(x, y + 5, w, h - 5, "#514477");
            drawRect(x + 3, y + 3, w - 6, h - 7, "#9876B5");

            // Mattress
            drawRect(x + 6, y + 7, w - 12, h - 14, "#FFF5DF");

            // Blanket
            drawRect(x + 36, y + 8, w - 43, h - 16, "#B18BD2");
            drawRect(x + 39, y + 11, w - 49, 4, "#D5B5D8");

            // Pillow
            drawRect(x + 9, y + 9, 23, 13, "#F3C6D2");
            drawRect(x + 12, y + 11, 17, 2, "#FFF5DF");

            // Small star decoration
            drawRect(x + w - 17, y + h - 13, 3, 3, "#FFDB79");

            // Bedside glow
            drawRect(x + 5, y + h - 3, w - 10, 2, "#83C7DC");

            break;

        // ==================================
        // LIVING QUARTERS TABLE
        // ==================================

        case "table":

            // Legs
            drawRect(x + 7, y + h - 10, 6, 12, "#514477");
            drawRect(x + w - 13, y + h - 10, 6, 12, "#514477");

            // Table body
            drawRect(x, y + 6, w, h - 6, "#9876B5");
            drawRect(x + 3, y + 2, w - 6, h - 10, "#D9B49A");
            drawRect(x + 5, y + 4, w - 10, 3, "#F3D4B6");

            // Small flower pot
            drawRect(x + w / 2 - 5, y + 9, 10, 8, "#B96F69");
            drawRect(x + w / 2 - 3, y + 5, 3, 6, "#A4C77E");
            drawRect(x + w / 2 + 1, y + 4, 4, 5, "#83B77B");

            break;

        // ==================================
        // DECORATIVE PLANT
        // ==================================

        case "plant":

            // Shadow
            drawRect(x + w / 2 - 8, y + h - 2, 16, 3, "#514477");

            // Pot
            drawRect(x + w / 2 - 8, y + h - 12, 16, 10, "#B96F69");
            drawRect(x + w / 2 - 9, y + h - 13, 18, 3, "#D58AA9");

            // Leaves
            drawRect(x + w / 2 - 2, y + 8, 4, h - 19, "#6B9B70");

            drawRect(x + w / 2 - 13, y + 8, 12, 7, "#83B77B");
            drawRect(x + w / 2 + 2, y + 3, 12, 7, "#A4C77E");
            drawRect(x + w / 2 - 10, y + 1, 8, 7, "#6B9B70");

            drawRect(x + w / 2 + 4, y + 12, 9, 6, "#83B77B");

            break;

        // ==================================
        // HYDROPONIC PLANT BEDS
        // ==================================

        case "plants":

            // Container
            drawRect(x, y + 7, w, h - 7, "#302747");
            drawRect(x + 3, y + 9, w - 6, h - 12, "#8B9D72");

            // Soil
            drawRect(x + 5, y + 12, w - 10, h - 17, "#675B55");

            // Growing plants
            for (let p = 0; p < 4; p++) {

                const plantX = x + 10 + p * ((w - 35) / 3);

                drawRect(plantX + 4, y + 15, 3, 13, "#6B9B70");

                drawRect(plantX, y + 13, 7, 5, "#83B77B");
                drawRect(plantX + 5, y + 10, 8, 6, "#A4C77E");
                drawRect(plantX + 7, y + 18, 7, 5, "#83B77B");

                drawRect(plantX + 3, y + 26, 9, 3, "#B18BD2");
            }

            // Grow lights
            drawRect(x + 5, y + 2, w - 10, 4, "#514477");
            drawRect(x + 8, y + 3, w - 16, 2, "#A4C77E");

            break;

        // ==================================
        // COCKPIT SEATS
        // ==================================

        case "seat":

            // Shadow
            drawRect(x + 7, y + h - 2, w - 14, 5, "#211C3B");

            // Base
            drawRect(x + 7, y + 13, w - 14, h - 13, "#514477");

            // Backrest
            drawRect(x + 5, y, w - 10, 19, "#D58AA9");
            drawRect(x + 9, y + 3, w - 18, 11, "#F3C6D2");

            // Seat cushion
            drawRect(x + 10, y + 20, w - 20, 10, "#9876B5");
            drawRect(x + 13, y + 22, w - 26, 4, "#B18BD2");

            // Armrests
            drawRect(x, y + 17, 9, 12, "#514477");
            drawRect(x + w - 9, y + 17, 9, 12, "#514477");

            // Small controls
            drawIndicator(x + 5, y + h - 9, "#83C7DC");

            break;

        // ==================================
        // EVA SPACE SUIT
        // ==================================

        case "suit":

            // Display cabinet
            drawRect(x, y, w, h, "#302747");
            drawRect(x + 3, y + 3, w - 6, h - 6, "#514477");

            // Glass frame
            drawRect(x + 18, y + 4, w - 36, h - 8, "#83C7DC");
            drawRect(x + 21, y + 7, w - 42, h - 14, "#D9D9E8");

            // Helmet
            drawRect(x + w / 2 - 13, y + 7, 26, 16, "#FFF5DF");
            drawRect(x + w / 2 - 10, y + 10, 20, 9, "#83C7DC");
            drawRect(x + w / 2 - 7, y + 11, 7, 3, "#E5F7FA");

            // Body
            drawRect(x + w / 2 - 13, y + 24, 26, 24, "#FFF5DF");

            // Arms
            drawRect(x + w / 2 - 19, y + 25, 7, 18, "#F3C6D2");
            drawRect(x + w / 2 + 12, y + 25, 7, 18, "#F3C6D2");

            // Chest display
            drawRect(x + w / 2 - 6, y + 29, 12, 9, "#514477");
            drawRect(x + w / 2 - 4, y + 31, 8, 4, "#83C7DC");

            // Boots
            drawRect(x + w / 2 - 11, y + 48, 9, 6, "#9876B5");
            drawRect(x + w / 2 + 2, y + 48, 9, 6, "#9876B5");

            // Cabinet status light
            drawIndicator(x + 7, y + 8, "#A4C77E");

            break;

        // ==================================
        // SPACE WINDOW
        // ==================================

        case "window":

            drawPixelWindow(x, y, w, h);

            break;
    }
}

// ==========================================
// EXTERIOR BACKGROUND
// ==========================================

function drawBackground() {

    ctx.fillStyle = "#17152c";
    ctx.fillRect(0, 0, 480, 270);

    for (let i = 0; i < 65; i++) {

        const x = (i * 83 + 17) % 480;
        const y = (i * 47 + 11) % 210;

        ctx.fillStyle =
            i % 3 === 0 ? "#ffdb79" : "#fff5df";

        ctx.fillRect(x, y, 2, 2);
    }

    // Distant planet
    drawRect(35, 65, 34, 34, "#514477");
    drawRect(29, 75, 46, 15, "#514477");

    drawRect(42, 69, 13, 8, "#a58ac4");
    drawRect(55, 85, 9, 7, "#a58ac4");

    // Main planet
    drawRect(350, 105, 70, 14, "#7956a5");
    drawRect(340, 119, 90, 35, "#7956a5");
    drawRect(350, 154, 70, 15, "#7956a5");
    drawRect(365, 169, 40, 8, "#7956a5");

    drawRect(355, 125, 15, 12, "#b18bd2");
    drawRect(390, 145, 22, 10, "#b18bd2");

    drawRect(329, 146, 110, 5, "#f2c4a6");
    drawRect(341, 155, 86, 3, "#f2c4a6");

    // Ground
    drawRect(0, 220, 480, 50, "#514477");
    drawRect(0, 220, 480, 5, "#8d73a9");

    // Research station
    drawRect(390, 194, 25, 26, "#f28bb5");
    drawRect(397, 199, 11, 8, "#fff5df");
    drawRect(400, 185, 5, 9, "#ffdb79");
}

// ==========================================
// DRAW COMMANDER
// ==========================================

function drawPlayer() {
    const x = Math.round(player.x);
    const y = Math.round(player.y);

    // Detect whether the player moved since the previous frame
    const moving =
        previousPlayerX !== null &&
        (Math.abs(player.x - previousPlayerX) > 0.1 ||
         Math.abs(player.y - previousPlayerY) > 0.1);

    previousPlayerX = player.x;
    previousPlayerY = player.y;

    playerAnimationTick++;

    // Tiny idle breathing and walking animation
    const walkPhase = Math.floor(playerAnimationTick / 7) % 2;

    let bodyBob = 0;
    let legLeft = 0;
    let legRight = 0;
    let armLeft = 0;
    let armRight = 0;
    let backpackSway = 0;

    if (moving) {
        bodyBob = walkPhase === 0 ? 0 : -1;

        legLeft = walkPhase === 0 ? 0 : 1;
        legRight = walkPhase === 0 ? 1 : 0;

        armLeft = walkPhase === 0 ? 1 : 0;
        armRight = walkPhase === 0 ? 0 : 1;

        backpackSway = walkPhase === 0 ? 0 : 1;
    } else {
        // Gentle breathing while standing still
        bodyBob = Math.floor(playerAnimationTick / 24) % 2 === 0 ? 0 : -1;
    }

    const bodyY = y + bodyBob;

    // Backpack: tiny movement while walking
    drawRect(
        x - 3 + backpackSway,
        bodyY + 5,
        4,
        9,
        "#e58bad"
    );

    // Backpack detail
    drawRect(x - 2 + backpackSway, bodyY + 7, 2, 4, "#9876b5");

    // Helmet
    drawRect(x + 2, bodyY, 10, 9, "#fff5df");

    // Helmet glass
    drawRect(x + 5, bodyY + 2, 6, 5, "#83c7dc");

   // Small permanent visor shine
    drawRect(x + 6, bodyY + 3, 2, 1, "#fff5df");

    // Occasional visor sparkle
    const visorSparkle = playerAnimationTick % 240 < 5;

    if (visorSparkle) {
        drawRect(x + 9, bodyY + 2, 1, 1, "#fff5df");
        drawRect(x + 8, bodyY + 3, 2, 1, "#fff5df");
    }

    // Suit
    drawRect(x + 2, bodyY + 9, 10, 6, "#f28bb5");

    // Arms: alternate slightly during walking
    drawRect(x, bodyY + 9 + armLeft, 3, 5, "#fff5df");
    drawRect(x + 11, bodyY + 9 + armRight, 3, 5, "#fff5df");

    // Legs: alternate to create a tiny walking cycle
    drawRect(x + 3, bodyY + 15 + legLeft, 3, 3, "#fff5df");
    drawRect(x + 9, bodyY + 15 + legRight, 3, 3, "#fff5df");

    // Suit detail
    drawRect(x + 5, bodyY + 10, 3, 3, "#ffdb79");
}

// ==========================================
// TWI-LIL - PIXEL ART DECORATIONS
// ==========================================

function drawWallPanel(x, y, w, h) {
    drawRect(x, y, w, h, "#302747");
    drawRect(x + 2, y + 2, w - 4, h - 4, "#514477");
    drawRect(x + 4, y + 4, w - 8, 2, "#9876B5");
    drawRect(x + 5, y + h - 4, 3, 2, "#83C7DC");
}

function drawSpaceLight(x, y) {
    drawRect(x, y, 20, 8, "#514477");
    drawRect(x + 3, y + 2, 14, 3, "#FFDB79");
    drawRect(x + 5, y + 5, 10, 1, "#FFF5DF");
}

function drawFloorDetails() {

    // Decorative floor tiles
    for (let y = 22; y < 250; y += 24) {
        for (let x = 22; x < 460; x += 30) {

            const alternate = ((x / 30 + y / 24) % 2 === 0);

            drawRect(
                x,
                y,
                27,
                21,
                alternate ? "#D9C9D5" : "#C9BED1"
            );

            // Tiny metallic floor details
            drawRect(x + 3, y + 3, 2, 2, "#B18BD2");
            drawRect(x + 23, y + 17, 2, 2, "#A5A0C5");
        }
    }

    // Central walkway
    drawRect(190, 65, 100, 140, "#B9B0C9");
    drawRect(194, 69, 92, 132, "#D9C9D5");

    // Floor lights
    for (let y = 85; y < 195; y += 35) {
        drawRect(200, y, 3, 9, "#83C7DC");
        drawRect(277, y, 3, 9, "#83C7DC");
    }
}

function drawWallDetails() {

    // Outer wall structure
    drawRect(8, 8, 464, 254, "#211C3B");
    drawRect(13, 13, 454, 244, "#514477");

    // Metallic wall panels
    drawWallPanel(18, 18, 85, 25);
    drawWallPanel(110, 18, 85, 25);
    drawWallPanel(285, 18, 85, 25);
    drawWallPanel(377, 18, 85, 25);

    // Lower wall panels
    drawWallPanel(18, 225, 85, 25);
    drawWallPanel(110, 225, 85, 25);
    drawWallPanel(285, 225, 85, 25);
    drawWallPanel(377, 225, 85, 25);

    // Wall borders
    drawRect(13, 13, 454, 4, "#B18BD2");
    drawRect(13, 253, 454, 4, "#B18BD2");

    // Metallic corners
    drawRect(13, 13, 7, 7, "#FFDB79");
    drawRect(460, 13, 7, 7, "#FFDB79");
    drawRect(13, 250, 7, 7, "#FFDB79");
    drawRect(460, 250, 7, 7, "#FFDB79");
}

function drawWallDecorations() {

    drawSpaceLight(45, 47);
    drawSpaceLight(415, 47);

    // Small ventilation panels
    drawRect(25, 205, 35, 10, "#302747");
    drawRect(28, 208, 29, 2, "#83C7DC");
    drawRect(28, 212, 29, 2, "#83C7DC");

    drawRect(420, 205, 35, 10, "#302747");
    drawRect(423, 208, 29, 2, "#83C7DC");
    drawRect(423, 212, 29, 2, "#83C7DC");
}

// ==========================================
// STATION BACKGROUND - STARLIGHT PIXEL ART
// ==========================================

function drawStationBackground() {

    const room = stationRooms[currentRoom];

    // Deep space wall background
    drawRect(0, 0, 480, 270, "#17152C");

    // Main wall structure
    drawWallDetails();

    // Floor
    drawRect(17, 45, 446, 177, "#C9BED1");

    drawFloorDetails();

    // Room-specific floor decoration
    if (currentRoom === "hallway") {

        // Central hallway pathway
        drawRect(35, 115, 410, 38, "#B9A9C9");
        drawRect(35, 118, 410, 3, "#9876B5");
        drawRect(35, 148, 410, 3, "#9876B5");

        // Glowing floor indicators
        for (let x = 55; x < 440; x += 35) {
            drawRect(x, 130, 8, 3, "#83C7DC");
        }

    } else if (currentRoom === "cockpit") {

        // Navigation floor markings
        drawRect(180, 55, 120, 150, "#B9A9C9");
        drawRect(185, 60, 110, 140, "#C9BED1");

        for (let y = 75; y < 190; y += 25) {
            drawRect(190, y, 4, 4, "#83C7DC");
            drawRect(286, y, 4, 4, "#83C7DC");
        }

    } else if (currentRoom === "engineering") {

        // Industrial floor markings
        for (let x = 35; x < 450; x += 40) {
            drawRect(x, 210, 20, 4, "#FFDB79");
            drawRect(x + 20, 210, 20, 4, "#302747");
        }

    } else if (currentRoom === "living") {

        // Cozy living quarters floor
        drawRect(185, 100, 110, 100, "#B9A4C9");
        drawRect(190, 105, 100, 90, "#D9C9D5");

    } else if (currentRoom === "hydroponics") {

        // Greenhouse floor
        drawRect(20, 45, 440, 175, "#B5C5A0");

        for (let x = 35; x < 450; x += 30) {
            drawRect(x, 55, 2, 155, "#8DAB7B");
        }

    } else if (currentRoom === "eva") {

        // EVA preparation floor
        drawRect(160, 55, 160, 150, "#B9B0C9");
        drawRect(165, 60, 150, 140, "#D9C9D5");

        drawRect(180, 190, 120, 4, "#83C7DC");
    }

    // Windows
    if (currentRoom === "cockpit") {

        drawPixelWindow(175, 18, 130, 25);

    } else if (currentRoom !== "hallway") {

        drawPixelWindow(195, 18, 90, 20);
    }

    // Wall decorations
    drawWallDecorations();

    // Room furniture
    room.furniture.forEach(drawFurniture);

    // Doors
    room.doors.forEach(door => drawDoor(door, false));

    // Room nameplate
    drawRect(145, 3, 190, 20, "#211C3B");
    drawRect(148, 5, 184, 16, "#514477");

    ctx.fillStyle = "#FFF5DF";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";

    ctx.fillText(room.name, 240, 17);

    ctx.textAlign = "left";
}

// ==========================================
// STATION MOVEMENT / COLLISIONS
// ==========================================

function rectanglesOverlap(a, b) {

    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

function collidesWithFurniture(x, y) {

    const playerBox = {
        x: x + 1,
        y: y + 2,
        w: player.width - 2,
        h: player.height - 3
    };

    return stationRooms[currentRoom].furniture.some(item =>
        rectanglesOverlap(playerBox, item)
    );
}

function updateStationPlayer() {

    if (!gameStarted || gameMode !== "exploration") {
        return;
    }

    let dx = 0;
    let dy = 0;

    if (keys["ArrowRight"] || keys["d"] || keys["D"]) dx++;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) dx--;
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) dy++;
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) dy--;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
    }

    const nextX = player.x + dx * player.speed;
    const nextY = player.y + dy * player.speed;

    // Horizontal movement
    if (
        nextX >= 12 &&
        nextX <= 468 - player.width &&
        !collidesWithFurniture(nextX, player.y)
    ) {
        player.x = nextX;
    }

    // Vertical movement
    if (
        nextY >= 25 &&
        nextY <= 252 - player.height &&
        !collidesWithFurniture(player.x, nextY)
    ) {
        player.y = nextY;
    }

    if (dx > 0) player.facing = "right";
    if (dx < 0) player.facing = "left";
}

// ==========================================
// DOOR INTERACTION
// ==========================================

function getNearbyDoor() {

    const room = stationRooms[currentRoom];

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    let closestDoor = null;
    let closestDistance = Infinity;

    room.doors.forEach(door => {

        const doorCenterX = door.x + door.w / 2;
        const doorCenterY = door.y + door.h / 2;

        const distance = Math.hypot(
            playerCenterX - doorCenterX,
            playerCenterY - doorCenterY
        );

        if (distance < 34 && distance < closestDistance) {
            closestDoor = door;
            closestDistance = distance;
        }
    });

    return closestDoor;
}

// ==========================================
// DOOR INTERACTION
// ==========================================

function interactWithDoor() {

    if (!gameStarted || gameMode !== "exploration" || scene !== "station") {
        return;
    }

    // Check if the pending mission belongs to this room.
    if (pendingNode) {

        const mission = nodes[pendingNode];
        const requiredRoom = getRoomForNode(mission);

        if (requiredRoom === currentRoom) {

            const missionToStart = pendingNode;

            pendingNode = null;

            showNode(missionToStart);

            return;
        }
    }

    // If there is no mission in this room,
    // interact with the nearest door.
    const door = getNearbyDoor();

    if (!door) return;

    if (door.target === "exterior") {

        scene = "exterior";

        player.x = door.spawnX;
        player.y = door.spawnY;

        player.velocityY = 0;
        player.jumping = false;

        return;
    }

    currentRoom = door.target;

    player.x = door.spawnX;
    player.y = door.spawnY;
}

// ==========================================
// STATION INTERACTION PROMPT
// ==========================================

function drawStationInteractionPrompt() {

    if (pendingNode) {

        const mission = nodes[pendingNode];
        const requiredRoom = getRoomForNode(mission);

        if (requiredRoom === currentRoom) {

            ctx.fillStyle = "#342e50";
            ctx.fillRect(155, 226, 170, 22);

            ctx.fillStyle = "#ffdb79";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";

            ctx.fillText("E  RESPOND TO EMERGENCY", 240, 240);

            ctx.textAlign = "left";

            return;
        }
    }

    const door = getNearbyDoor();

    if (!door) return;

    ctx.fillStyle = "#342e50";
    ctx.fillRect(190, 226, 100, 22);

    ctx.fillStyle = "#ffdb79";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";

    ctx.fillText("E  " + door.label, 240, 240);

    ctx.textAlign = "left";
}
// ==========================================
// EXTERIOR STATION INTERACTION
// ==========================================

function interactWithTerminal() {

    if (!gameStarted || gameMode !== "exploration" || scene !== "exterior") {
        return;
    }

    const terminalX = 402;
    const terminalY = 207;

    const playerX = player.x + player.width / 2;
    const playerY = player.y + player.height / 2;

    const distance = Math.hypot(
        playerX - terminalX,
        playerY - terminalY
    );

    // Enter the station
    if (distance < 35) {

        scene = "station";
        currentRoom = "hallway";

        player.x = 234;
        player.y = 205;

        player.velocityY = 0;
        player.jumping = false;
    }
}

// ==========================================
// EXTERIOR PLAYER MOVEMENT
// ==========================================

function updatePlayer() {

    if (!gameStarted || gameMode !== "exploration" || scene !== "exterior") {
        return;
    }

    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        player.x += player.speed;
        player.facing = "right";
    }

    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        player.x -= player.speed;
        player.facing = "left";
    }

    if (
        (keys["ArrowUp"] || keys["w"] || keys["W"] || keys[" "]) &&
        !player.jumping
    ) {
        player.velocityY = -5;
        player.jumping = true;
    }

    player.y += player.velocityY;
    player.velocityY += 0.25;

    if (player.y + player.height >= groundY) {

        player.y = groundY - player.height;
        player.velocityY = 0;
        player.jumping = false;
    }

    player.x = Math.max(
        5,
        Math.min(465 - player.width, player.x)
    );
}

// ==========================================
// EXTERIOR INTERACTION PROMPT
// ==========================================

function drawInteractionPrompt() {

    if (!gameStarted || gameMode !== "exploration" || scene !== "exterior") {
        return;
    }

    const playerX = player.x + player.width / 2;
    const playerY = player.y + player.height / 2;

    const distance = Math.hypot(
        playerX - 402,
        playerY - 207
    );

    if (distance < 45) {

        ctx.fillStyle = "#ffdb79";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";

        ctx.fillText("ENTER STATION: E", 402, 178);

        ctx.textAlign = "left";
    }
}

// ==========================================
// EMERGENCY ALERT
// ==========================================

function drawEmergencyAlert() {

    if (!pendingNode) return;

    const mission = nodes[pendingNode];

    if (!mission) return;

    const roomName = getMissionRoomName(mission);

    // Emergency banner
    ctx.fillStyle = "#342e50";
    ctx.fillRect(35, 29, 410, 30);

    ctx.fillStyle = "#f28bb5";
    ctx.fillRect(35, 29, 5, 30);

    ctx.fillStyle = "#ffdb79";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";

    ctx.fillText(
        "EMERGENCY IN " + roomName + "!",
        240,
        42
    );

    ctx.fillStyle = "#fff0dc";
    ctx.font = "7px monospace";

    ctx.fillText(
        "Find the room and press E to respond",
        240,
        53
    );

    ctx.textAlign = "left";
}

// ==========================================
// DRAW GAME
// ==========================================

function drawGame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (scene === "exterior") {

        drawBackground();
        drawPlayer();
        drawInteractionPrompt();

    } else {

        drawStationBackground();
        drawPlayer();
        drawStationInteractionPrompt();
    }

    // Show pending emergency in every exploration scene.
    if (gameMode === "exploration") {
        drawEmergencyAlert();
    }

    if (gameMode === "minigame") {
        drawMinigame();
    }

    animationFrame++;
}

// ==========================================
// KEYBOARD
// ==========================================

window.addEventListener("keydown", event => {

    if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)
    ) {
        event.preventDefault();
    }

    keys[event.key] = true;

        // Minigame controls
    if (gameMode === "minigame" && !event.repeat) {

        handleMinigameKey(event);

        return;
    }

    if (event.key.toLowerCase() === "e" && !event.repeat) {

        if (scene === "exterior") {
            interactWithTerminal();
        } else {
            interactWithDoor();
        }
    }
});

window.addEventListener("keyup", event => {
    keys[event.key] = false;
});

// ==========================================
// START
// ==========================================

startButton.addEventListener("click", async () => {

    console.log("1. BUTTON CLICKED");

    startScreen.classList.add("hidden");

    console.log("2. START SCREEN HIDDEN");

    try {

        await loadAdventure();

        console.log("3. ADVENTURE LOADED");

    } catch (error) {

        console.error("START ERROR:", error);
    }
});

continueButton.addEventListener("click", nextMission);

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {

    if (scene === "exterior") {
        updatePlayer();
    } else {
        updateStationPlayer();
    }

    drawGame();

    requestAnimationFrame(gameLoop);
}

gameLoop();