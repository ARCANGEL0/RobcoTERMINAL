// friend.mjs

import { getScreen, showTemplateScreen, addTemplate, clear } from "../../util/screens.js";
import { type, waitForKey,input, cleanInput,isPrintable,moveCaretToEnd  } from "../../util/io.js";

import pause from "../../util/pause.js";
import { typeSound } from "../../sound/index.js"
import say from "../../util/speak.js";

const output = [
    ">>> ERROR: DATA CORRUPTION DETECTED [0x80070057]",
    ">>> REBOOTING... [0xC000021A]",
    ">>> SYSTEM MALFUNCTION: REPAIR REQUIRED [0x0000001E]",
    ">>> LOG: TRACE IN PROGRESS [0xC0000409]",

];

// Game states
const state = {
    selectedRow: 0,
    selectedColumn: null,
    bufferSlots: [],
    gameStarted: false,
    gameOver: false,
    timer: 75.50 * 1000,
}

let timerState = {
    startTime: new Date().getTime(),
    lastTime: new Date().getTime(),
}
let gameScreen
const sequences = [
    "55 BD",
    "BD BD",
    "BD E9"
];

async function breach() {
    
    clear();
	say("BREACH DETECTED", 0.5, 0.8);
	return new Promise(async resolve => {
        console.log('breaching')
gameScreen = getScreen("breach");
            let output = document.createElement("div");
        output.classList.add("output");
        output.style.padding = "8vh 2vw"; 
        gameScreen.appendChild(output);

        addTemplate("console", gameScreen);

        const matrixElement = document.getElementById('matrix');

        const values = ['E9', '7A', 'BD', '55', '1C'];
    
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            row.classList.add("row")
            for (let k = 0; k < 6; k++) {
                const item = document.createElement('td');
                item.innerText = values[Math.floor(Math.random() * values.length)];
                item.classList.add('item');
                item.classList.add('row-' + i.toString());
                item.classList.add('column-' + k.toString());
                row.appendChild(item);
            }
            matrixElement.appendChild(row);
        }
    
       
    })

}



function initGame() {
    highlightItems();
    document.querySelectorAll('.item').forEach(elem => {elem.addEventListener('click', selectItem)})
}

function highlightItems() {
    const rowOrColumn = state.selectedRow !== null ? 'row' : 'column';
    const rowOrColumnNumber = state.selectedRow !== null ? state.selectedRow : state.selectedColumn;
    const selectedRow = document.querySelectorAll(`.${rowOrColumn}-${rowOrColumnNumber}`);
    selectedRow.forEach(elem => {
        if (elem.className.includes('inactive')) {
            return;
        }
        elem.classList.add('active');
    });
}

function resetHighlight() {
    const rowOrColumn = state.selectedRow !== null ? 'row' : 'column';
    const rowOrColumnNumber = state.selectedRow !== null ? state.selectedRow : state.selectedColumn;
    const selectedRow = document.querySelectorAll(`.${rowOrColumn}-${rowOrColumnNumber}`);
    selectedRow.forEach(elem => {
        elem.classList.remove('active');
    });
}

function selectItem(e) {
    if (state.gameOver) {
        return;
    }
    if (!e.target.className.includes('active')) {
        return;
    }
    if (!state.gameStarted) {
        startGame();
    }
    if (state.bufferSlots.length < 5) {
        state.bufferSlots.push(e.target.innerText);
        updateBufferSlots();
    }
    if (state.selectedColumn === null) {
        resetHighlight();
        state.selectedRow = null;
        const columnNumber = Array.from(e.target.classList).find(item => item.includes('column')).split('-')[1];
        state.selectedColumn = columnNumber;
        highlightItems();
    } else {
        resetHighlight();
        state.selectedColumn = null;
        const rowNumber = Array.from(e.target.classList).find(item => item.includes('row')).split('-')[1];
        state.selectedRow = rowNumber;
        highlightItems();
    }
    e.target.classList.add('inactive');
    checkSequences();
    if (state.bufferSlots.length === 5) {
        state.gameStarted = false;
        state.gameOver = true;
        resetHighlight();
        return;
    }
}

function updateBufferSlots() {
    state.bufferSlots.forEach((buffer, index) => {
        document.getElementById('buffer-box-' + index).innerText = buffer;
    })
}

function checkSequences() {
    const joinedBuffers = state.bufferSlots.join(' ');
    const index = sequences.findIndex(sequence => joinedBuffers.includes(sequence))
    if (index > -1) {
        sequences[index] = "XXXX";
        document.getElementById('sequence-' + index).classList.add('done');
    };
}

function startGame() {
    state.gameStarted = true;
    timerState = {
        startTime: new Date().getTime(),
        lastTime: new Date().getTime(),
    }
    requestAnimationFrame(timer);
}

function timer() {
    if (state.gameStarted) {
        const now = new Date().getTime();
        state.timer -= now - timerState.lastTime;
        const displayTimer = (state.timer / 1000).toFixed(2);
        if (state.timer <= 0) {
            state.timer = 0;            
            resetHighlight();
            state.gameOver = true;
            state.gameStarted = false;
        }
        if (state.timer > 0) {
            requestAnimationFrame(timer);
        }
        document.getElementById('breach-timer-value').innerHTML = displayTimer;
        timerState.lastTime = now;
    }
}

function initMatrix() {
    const matrixElement = document.getElementById('matrix');

    const values = ['E9', '7A', 'BD', '55', '1C'];

    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        row.classList.add("row")
        for (let k = 0; k < 6; k++) {
            const item = document.createElement('td');
            item.innerText = values[Math.floor(Math.random() * values.length)];
            item.classList.add('item');
            item.classList.add('row-' + i.toString());
            item.classList.add('column-' + k.toString());
            row.appendChild(item);
        }
        matrixElement.appendChild(row);
    }
}

// Closure for game start
function start() {
    initMatrix();
    initGame();
}

const templates = ["breach"];
const stylesheets = ["breach"];


export { output, templates , stylesheets};
export default breach;