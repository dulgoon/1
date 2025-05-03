// Game Variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const scoreboard = document.getElementById('scoreboard');
const footer = document.getElementById('footer');
const inputBox = document.getElementById('input-box');
let score = 0;
let lives = 3;
let level = 1;
let wordsToType = 10;
let timeLimit = 15;
const words = [];
let intervalId, levelTimerId;
let gameSpeed = 100;

// Resize canvas
canvas.width = canvas.parentElement.offsetWidth;
canvas.height = canvas.parentElement.offsetHeight;

// Load words from wordlist
async function loadWords() {
    const response = await fetch('assets/wordlist.json');
    return response.json();
}

// Generate random word
function getRandomWord(wordList) {
    const index = Math.floor(Math.random() * wordList.length);
    return wordList[index];
}

// Add word to screen
function addWord(word) {
    words.push({
        text: word,
        x: Math.random() * (canvas.width - 100),
        y: 0,
        speed: 1 + Math.random() * 2,
        color: `hsl(${Math.random() * 360}, 70%, 70%)`,
    });
}

// Update words
function updateWords() {
    words.forEach(word => {
        word.y += word.speed;
    });

    // Check if word falls off screen
    words.forEach((word, i) => {
        if (word.y > canvas.height) {
            words.splice(i, 1);
            lives--;
            updateScoreboard();
        }
    });
}

// Draw words
function drawWords() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    words.forEach(word => {
        ctx.fillStyle = word.color;
        ctx.font = '20px Arial';
        ctx.fillText(word.text, word.x, word.y);
    });
}

// Update scoreboard
function updateScoreboard() {
    document.getElementById('score').innerText = score;
    document.getElementById('lives').innerText = lives;

    if (lives <= 0) {
        clearInterval(intervalId);
        clearTimeout(levelTimerId);
        alert('Game Over! Your final score is: ' + score);
        resetGame();
    }
}

// Handle user input
inputBox.addEventListener('input', () => {
    const input = inputBox.value.trim();
    words.forEach((word, i) => {
        if (word.text === input) {
            score++;
            words.splice(i, 1);
            updateScoreboard();

            // Check if level is complete
            if (score % wordsToType === 0) {
                clearInterval(intervalId);
                clearTimeout(levelTimerId);
                levelUp();
            }
        }
    });
    inputBox.value = '';
});

// Reset game
function resetGame() {
    lives = 3;
    score = 0;
    level = 1;
    wordsToType = 10;
    timeLimit = 15;
    words.length = 0;
    gameSpeed = 100;
    scoreboard.style.display = 'none';
    footer.style.display = 'none';
    startButton.style.display = 'inline-block';
    canvas.style.display = 'none';
    updateScoreboard();
}

// Level up
function levelUp() {
    level++;
    wordsToType += 2;
    timeLimit += 1;
    alert(`Level ${level}! Type ${wordsToType} words in ${timeLimit} seconds!`);
    startLevel();
}

// Start level
async function startLevel() {
    const wordList = await loadWords();
    words.length = 0;
    inputBox.value = '';
    inputBox.focus();

    // Reset level timer
    levelTimerId = setTimeout(() => {
        if (score % wordsToType !== 0) {
            alert('Time’s up! Game Over!');
            resetGame();
        }
    }, timeLimit * 1000);

    // Start game loop
    intervalId = setInterval(() => {
        if (Math.random() < 0.1) {
            addWord(getRandomWord(wordList));
        }
        updateWords();
        drawWords();
    }, gameSpeed);
}

// Start the game (called when Start Button is clicked)
function startGame() {
    // Hide the start button and show game elements
    startButton.style.display = 'none'; // Hide the start button
    canvas.style.display = 'block'; // Show the game canvas
    scoreboard.style.display = 'flex'; // Show the scoreboard
    footer.style.display = 'block'; // Show the input box

    // Reset game state and start the first level
    resetGame();
    startLevel();
}

// Add event listener to Start Button
startButton.addEventListener('click', startGame);