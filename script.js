// script.js

// Game state
let currentPlayer = "X";
let isGameOver = false;
let gameMode = "multiplayer";

// UI elements
const boxes        = document.querySelectorAll(".box");
const turnText     = document.getElementById("turnText");
const winText      = document.getElementById("winText");
const modeSelector = document.getElementById("mode");
const restartBtn   = document.getElementById("restartBtn");

// Update the "Turn: X/O" display with proper color
function updateTurnText() {
    turnText.innerText = `Turn: ${currentPlayer}`;
    if (currentPlayer === "X") {
        turnText.style.color = "rgb(240, 134, 20)";
        turnText.style.webkitTextStroke = "1px rgb(240, 134, 20)";
    } else {
        turnText.style.color = "rgb(3, 165, 3)";
        turnText.style.webkitTextStroke = "1px rgb(3, 165, 3)";
    }
}

// Check for a win or draw, highlight winning cells and display result
function checkWin() {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    // get current marks
    const values = Array.from(boxes).map(box => {
        const span = box.querySelector("span");
        return span ? span.innerText : "";
    });

    // check patterns
    for (let [a,b,c] of winPatterns) {
        if (values[a] && values[a] === values[b] && values[b] === values[c]) {
            // win!
            isGameOver = true;
            winText.innerText = `${values[a]} wins!`;
            const color = values[a] === "X" ? "rgb(240, 134, 20)" : "rgb(3, 165, 3)";
            winText.style.color = color;
            winText.style.webkitTextStroke = `1px ${color}`;
            // highlight
            [a,b,c].forEach(i => boxes[i].classList.add(`win-${values[a]}`));
            return;
        }
    }

    // draw?
    if (values.every(v => v)) {
        isGameOver = true;
        winText.innerText = `It's a draw!`;
        winText.style.color = "#ccc";
        winText.style.webkitTextStroke = "1px #ccc";
    }
}

// Handle a human move (common for multiplayer and player-X in AI modes)
function handleHumanMove(box) {
    if (isGameOver || box.querySelector("span")) return;

    const mark = document.createElement("span");
    mark.classList.add(currentPlayer);
    mark.innerText = currentPlayer;
    box.appendChild(mark);

    checkWin();
    if (!isGameOver) {
        // switch turn
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateTurnText();
    }
}

// Easy AI: random empty cell
function aiEasyMove() {
    const empty = Array.from(boxes).filter(b => !b.querySelector("span"));
    if (!empty.length) return;
    const choice = empty[Math.floor(Math.random() * empty.length)];
    handleHumanMove(choice);
}

// Hard AI: minimax for "O"
function aiHardMove() {
    const board = Array.from(boxes).map(b => {
        const s = b.querySelector("span");
        return s ? s.innerText : "";
    });
    let bestVal = -Infinity, bestIdx = -1;
    board.forEach((v,i) => {
        if (!v) {
            board[i] = "O";
            const val = minimax(board, 0, false);
            board[i] = "";
            if (val > bestVal) {
                bestVal = val;
                bestIdx = i;
            }
        }
    });
    if (bestIdx !== -1) handleHumanMove(boxes[bestIdx]);
}

// Minimax helper
function minimax(board, depth, isMax) {
    const score = evaluate(board);
    if (score !== null) return score;
    if (isMax) {
        let best = -Infinity;
        board.forEach((v,i) => {
            if (!v) {
                board[i] = "O";
                best = Math.max(best, minimax(board, depth+1, false));
                board[i] = "";
            }
        });
        return best;
    } else {
        let best = Infinity;
        board.forEach((v,i) => {
            if (!v) {
                board[i] = "X";
                best = Math.min(best, minimax(board, depth+1, true));
                board[i] = "";
            }
        });
        return best;
    }
}

// Evaluate board: return +1 if O wins, -1 if X wins, 0 draw, null otherwise
function evaluate(board) {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let [a,b,c] of lines) {
        if (board[a] && board[a]===board[b] && board[b]===board[c]) {
            return board[a]==="O" ? 1 : -1;
        }
    }
    if (board.every(v=>v)) return 0;
    return null;
}

// Start or restart the game
function startGame(mode = "multiplayer") {
    // reset state
    gameMode      = mode;
    currentPlayer = "X";
    isGameOver    = false;
    winText.innerText = "";
    winText.style.color = "";
    winText.style.webkitTextStroke = "";

    // clear board
    boxes.forEach(b => {
        b.innerHTML = "";
        b.classList.remove("win-X","win-O");
    });

    updateTurnText();

    // attach handlers
    boxes.forEach(box => {
        box.onclick = () => {
            if (isGameOver || box.querySelector("span")) return;

            // human X always
            handleHumanMove(box);

            // if AI mode and game continues and it's O's turn
            if (!isGameOver && gameMode !== "multiplayer" && currentPlayer === "O") {
                setTimeout(() => {
                    if (gameMode === "easy") aiEasyMove();
                    else if (gameMode === "hard") aiHardMove();
                }, 200);
            }
        };
    });
}

// Hook up UI controls
modeSelector.onchange = () => startGame(modeSelector.value);
restartBtn.onclick     = () => startGame(modeSelector.value);

// Initialize on page load
window.onload = () => startGame(modeSelector.value || "multiplayer");
