// ======================= Game Variables =======================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let canvasWidth = 400;
canvas.height = 600;
canvas.width = canvasWidth;

let score = 0;
let level = 1;
let lives = 3;
let isGameRunning = false;
let currentItem;
let currentX = 100;
let currentY = 0;
let speed = 3;
let wasteTypes = ["restmüll", "papier", "glas"];
let correctSorts = 0;
let levelThresholds = { 1: 5, 2: 8, 3: 10 };

const bins = {
    restmüll: { label: "Restmüll", color: "#C0C0C0", lidOpen: false },
    papier: { label: "Papier", color: "#FFFFFF", lidOpen: false },
    glas: { label: "Glas", color: "#1E90FF", lidOpen: false },
    biomüll: { label: "Biomüll", color: "#32CD32", lidOpen: false },
    buntglas: { label: "Buntglas", color: "#FF0000", lidOpen: false },
    weißglas: { label: "Weißglas", color: "#FFFFFF", lidOpen: false }
};

const itemSymbols = {
    restmüll: ["🚬", "👕", "🧸","🍫", "🍭", "🌮"],
    papier: ["📚", "📰", "📦","📄", "📨", "📕"],
    glas: ["🥛", "🫗", "👓"],
    biomüll: ["🍌", "🍇", "🍊", "🍏", "🍓"],
    buntglas: ["🍷", "🍹", "🥂"],
    weißglas: ["🥛", "🍶", "🍶"]
};

// ======================= Game Functions =======================

function startGame() {
    isGameRunning = true;
    score = 0;
    level = 1;
    lives = 3;
    correctSorts = 0;
    wasteTypes = ["restmüll", "papier", "glas"];
    canvasWidth = 400;
    canvas.width = canvasWidth;
    updateScoreboard();
    gameLoop();
}

function increaseLevel() {
    level++;
    correctSorts = 0;
    updateScoreboard();

    if (level === 2) {
        wasteTypes.push("biomüll");
        alert("Level 2: Biomüll hinzugefügt!");
    } else if (level === 3) {
        wasteTypes.push("buntglas", "weißglas");
        canvasWidth = 500;
        canvas.width = canvasWidth;
        alert("Level 3: Neue Glasarten hinzugefügt!");
    } else if (level > 3) {
        alert("Herzlichen Glückwunsch! Du hast das Spiel gemeistert!");
        isGameRunning = false;
    }
}

function updateScoreboard() {
    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = level;
}

function getRandomItem() {
    const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
    const randomSymbol = itemSymbols[randomType][Math.floor(Math.random() * itemSymbols[randomType].length)];
    return { type: randomType, symbol: randomSymbol };
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
}

function drawItem(item) {
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.symbol, currentX + 50, currentY + 50);
}

function drawBins() {
    const binWidth = canvasWidth / wasteTypes.length;
    wasteTypes.forEach((type, index) => {
        const bin = bins[type];
        
        // Draw bin emoji icon centered in each bin area
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🗑️", (index * binWidth) + binWidth / 2, canvas.height - 70);

        // Draw the bin label below the icon in German
        ctx.font = "20px Arial";
        ctx.fillStyle = "#000";
        ctx.fillText(bin.label, (index * binWidth) + binWidth / 2, canvas.height - 20);

        // Display smiley on correct sort or sad face on incorrect sort
        if (bin.lidOpen === "correct") {
            ctx.fillText("👏😁", (index * binWidth) + binWidth / 2, canvas.height - 120);
        } else if (bin.lidOpen === "incorrect") {
            ctx.fillText("❌🥲", (index * binWidth) + binWidth / 2, canvas.height - 120);
        }
    });
}

function gameLoop() {
    if (isGameRunning) {
        drawBackground();
        drawBins();

        if (!currentItem && correctSorts < levelThresholds[level]) {
            currentItem = getRandomItem();
            currentX = Math.floor(Math.random() * wasteTypes.length) * (canvasWidth / wasteTypes.length);
            currentY = 0;
        }

        drawItem(currentItem);
        currentY += speed;

        if (currentY + 100 >= canvas.height - 100) {
            handleItemDrop();
        }

        requestAnimationFrame(gameLoop);
    }
}

function handleItemDrop() {
    const binWidth = canvasWidth / wasteTypes.length;
    const binIndex = Math.floor(currentX / binWidth);

    if (currentItem.type === wasteTypes[binIndex]) {
        score++;
        correctSorts++;
        updateScoreboard();

        const correctBin = bins[wasteTypes[binIndex]];
        correctBin.lidOpen = "correct";

        setTimeout(() => correctBin.lidOpen = false, 500);

        if (correctSorts >= levelThresholds[level]) {
            increaseLevel();
        }
    } else {
        lives--;
        bins[wasteTypes[binIndex]].lidOpen = "incorrect"; // Show ❌🥲 for incorrect sort
        if (lives === 0) {
            isGameRunning = false;
            alert("Spiel vorbei! Versuche es noch einmal.");
            return;
        }

        // Pause the game briefly and then continue
        isGameRunning = false;
        setTimeout(() => {
            bins[wasteTypes[binIndex]].lidOpen = false;
            isGameRunning = true;
            gameLoop();
        }, 1000); // Pause for 1 second
    }
    currentItem = null;
}

document.addEventListener("keydown", (event) => {
    const binWidth = canvasWidth / wasteTypes.length;
    if (event.key === "ArrowLeft" && currentX > 0) currentX -= binWidth;
    else if (event.key === "ArrowRight" && currentX < canvasWidth - binWidth) currentX += binWidth;
});

document.getElementById("startButton").addEventListener("click", startGame);
