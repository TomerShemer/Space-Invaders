'use strict'

const BOARD_SIZE = 14
const ALIENS_ROW_LENGTH = 8
const ALIENS_ROW_COUNT = 3

const HERO = '♆'
const ALIEN = '👽'
const DEAD_ALIEN = '💥'
const LASER = '⤊'


var gBoard
var gGame = {
    isOn: false,
    aliensCount: 0,
    isWin: false,
    score: 0,

}


function init() {
    // gGame
    gGame.isOn = false
    gGame.aliensCount = 0
    gGame.isWin = false
    gGame.score = 0

    // gHero
    gHero.pos = { i: 13, j: 5 }
    gHero.isShoot = false

    // board
    gBoard = createBoard()
    createAliens(gBoard)
    createHero(gBoard)
    renderBoard()

    // Aliens
    gIsAlienFreeze = true
    gAliensTopRowIdx = 0
    gAliensBottomRowIdx = ALIENS_ROW_COUNT - 1
    gAliensLeftIdx = 0
    gAliensRightIdx = ALIENS_ROW_LENGTH - 1
    gAliensDirection = 'right'
    gIntervalAliens = setInterval(moveAliens, ALIEN_SPEED)

    // Dom
    document.querySelector('.modal').style.visibility = 'hidden'
    document.querySelector('.start-btn').style.backgroundColor = 'white'
    document.querySelector('.start-btn').innerText = 'Start Game'
    document.querySelector('.score').innerText = 0
}

function startGame() {
    if (!gGame.isOn) {
        gGame.isOn = true
        gIsAlienFreeze = false
        document.querySelector('.start-btn').style.backgroundColor = 'green'
        document.querySelector('.start-btn').innerText = 'Pause Game'

    } else {
        gGame.isOn = false
        gIsAlienFreeze = true
        document.querySelector('.start-btn').style.backgroundColor = 'white'
        document.querySelector('.start-btn').innerText = 'Continue Game'

    }
}


function createBoard() {
    const board = []
    for (var i = 0; i < BOARD_SIZE; i++) {
        board[i] = []
        for (var j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = createCell()
            if (i === 13) board[i][j].type = 'earth'
        }
    }
    return board
}

function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < BOARD_SIZE; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < BOARD_SIZE; j++) {
            // var gameObject = gBoard[i][j].gameObject || ''
            var gameObject = gBoard[i][j].gameObject
            if (gameObject === LASER ||
                gameObject === DEAD_ALIEN ||
                !gameObject) gameObject = ''

            strHTML += `<td data-i="${i}" data-j="${j}">${gameObject}</td>`
        }
        strHTML += '<tr>'
    }
    document.querySelector('tbody').innerHTML = strHTML
}

function createCell(gameObject = null) {
    return {
        type: 'sky',
        gameObject,
    }
}

function updateCell(pos, gameObject = null) {
    gBoard[pos.i][pos.j].gameObject = gameObject;
    var elCell = getElCell(pos);
    elCell.innerHTML = gameObject || '';
}

function updateScore(diff) {
    gGame.score += diff
    var elScore = document.querySelector('.score')
    elScore.innerText = gGame.score
}

function checkVictory() {
    if (!gGame.aliensCount) {
        gGame.isWin = true
        gameOver()
    }
}

function gameOver() {
    gGame.isOn = false
    showModal()
    clearInterval(gIntervalAliens)
}

function showModal() {
    const message = gGame.isWin ? 'Victory' : 'Defeat'
    document.querySelector('.modal-score').innerText = gGame.score
    document.querySelector('.modal h2').innerText = message

    document.querySelector('.modal').style.visibility = 'visible'
}