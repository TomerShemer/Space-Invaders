'use strict'

const BOARD_SIZE = 14
var aliensRowLength = 8
var aliensRowCount = 3

const HERO = '♆'
const INVUL_HERO = '🔱'
const ALIEN1 = '👾'
const ALIEN2 = '👽'
const ALIEN3 = '👹'
const ALIEN4 = '👻'
const ALIEN_SHOT = '⚡'
const DEAD_HERO = '💥'
const LASER = '💠'
const SUPER_LASER = '🔸'
const SPACE_CANDY = '🍬'
const LIFE = '💖'
const BUNKER = '🌟'

const HIT_AUDIO = new Audio('sound/glass-breaking.mp3')
const SHIELD_AUDIO = new Audio('sound/shield-guard.mp3')
const LASER_AUDIO = new Audio('sound/lasershot.mp3')
const SUPER_LASER_AUDIO = new Audio('sound/swing-whoosh.mp3')
const GAME_TRACK = new Audio('sound/retro-wave-style-track.mp3')

var gIsMusicPlaying = true


var gDifficulty = {
    easy: {
        rowLength: 4,
        rowCount: 3,
        speed: 1500
    },
    medium: {
        rowLength: 8,
        rowCount: 3,
        speed: 1000
    },
    hard: {
        rowLength: 10,
        rowCount: 4,
        speed: 500
    }
}

var gBoard
var gGame = {
    isOn: false,
    aliensCount: 0,
    isWin: false,
    score: 0,
    candyInterval: null,
}


function init(difficulty = gDifficulty.medium) {
    // difficulty
    aliensRowLength = difficulty.rowLength
    aliensRowCount = difficulty.rowCount

    // gGame
    clearInterval(gGame.candyInterval)
    gGame.isOn = false
    gGame.aliensCount = 0
    gGame.isWin = false
    gGame.score = 0
    gGame.candyInterval = setInterval(createSpaceCandy, 10000)

    // gHero
    gHero.pos = { i: 13, j: 5 }
    gHero.isShoot = false
    gHero.isExplosive = false
    gHero.isSuperShot = false
    gHero.superShotAmmo = 3
    gHero.lives = 3
    gHero.shieldAmmo = 3
    gHero.isInvul = false

    // board
    gBoard = createBoard()
    createAliens(gBoard)
    createHero(gBoard)
    renderBoard()


    // Aliens
    clearInterval(gIntervalAliens)
    clearInterval(gAliensShootingInterval)
    clearInterval(gAlienShotInterval)
    clearInterval(gAlienBugPlaster)
    gAlienSpeed = difficulty.speed
    gIsAlienFreeze = true
    gAliensTopRowIdx = 0
    gAliensBottomRowIdx = aliensRowCount - 1
    gAliensLeftIdx = 0
    gAliensRightIdx = aliensRowLength - 1
    gAliensDirection = 'right'
    gIsAlienShooting = false
    gIntervalAliens = setInterval(moveAliens, gAlienSpeed)
    gAliensShootingInterval = setInterval(alienShoot, 6500)
    gAlienBugPlaster = setInterval(areAlienDeadPlaster, 3000)

    // Dom
    document.querySelector('.modal').style.visibility = 'hidden'
    document.querySelector('.start-btn').style.backgroundColor = 'white'
    document.querySelector('.start-btn').innerText = 'Start Game'
    document.querySelector('.score').innerText = 0
    document.querySelector('.super-ammo').innerText = gHero.superShotAmmo
    document.querySelector('.lives').innerText = gHero.lives

    // Music
    if (gIsMusicPlaying) GAME_TRACK.play()

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
            if (i === 10) {
                if (j === 2 || j === 3 || j === 6
                    || j === 7 || j === 10 || j === 11)
                    board[i][j].gameObject = BUNKER
            }
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
    if (gameObject === HERO && gHero.isInvul) {
        gameObject = INVUL_HERO
    }
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
    clearInterval(gAlienShotInterval)
    clearInterval(gGame.candyInterval)
    clearInterval(gAlienBugPlaster)
}

function showModal() {
    const message = gGame.isWin ? 'Victory' : 'Defeat'
    document.querySelector('.modal-score').innerText = gGame.score
    document.querySelector('.modal h2').innerText = message

    document.querySelector('.modal').style.visibility = 'visible'
}

function createSpaceCandy() {
    if (!gAliensTopRowIdx || !gGame.isOn) return
    var randColIdx = getRandomInt(0, BOARD_SIZE)
    gBoard[0][randColIdx].gameObject = SPACE_CANDY
    updateCell({ i: 0, j: randColIdx }, SPACE_CANDY)
    setTimeout(function () {
        gBoard[0][randColIdx].gameObject = null
        updateCell({ i: 0, j: randColIdx })
    }, 5000)
}

function playMusic() {
    if (gIsMusicPlaying) {
        GAME_TRACK.pause()
        document.querySelector('.music-btn').innerText = 'Play Music'
        document.querySelector('.music-btn').style.backgroundColor = 'green'
        gIsMusicPlaying = false
    } else {
        document.querySelector('.music-btn').innerText = 'Stop Music'
        document.querySelector('.music-btn').style.backgroundColor = 'red'
        GAME_TRACK.play()
        gIsMusicPlaying = true
    }
}