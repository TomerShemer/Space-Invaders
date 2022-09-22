'use strict'

var gAlienSpeed
var gIntervalAliens

var gAliensShootingInterval
var gIsAlienShooting
var gAlienShotInterval

// The following two variables represent the part of the matrix 
// (some rows) that we should shift (left, right, and bottom) 
// We need to update those when: 
// (1) shifting down and 
// (2) last alien was cleared from row 
var gAliensTopRowIdx
var gAliensBottomRowIdx
var gAliensLeftIdx
var gAliensRightIdx

var gPrevDirection
var gAliensDirection

var gIsAlienFreeze

var gAlienBugPlaster


function createAliens(board) {
    for (var i = 0; i < aliensRowCount; i++) {
        for (var j = 0; j < aliensRowLength; j++) {
            var alienImg
            switch (i) {
                case 0:
                    alienImg = ALIEN1
                    break
                case 1:
                    alienImg = ALIEN2
                    break
                case 2:
                    alienImg = ALIEN3
                    break
                case 3:
                    alienImg = ALIEN4
                    break

            }
            board[i][j].gameObject = alienImg
            gGame.aliensCount++
        }
    }
}

function handleAlienHit(pos) {
    clearInterval(gShotInterval)
    gHero.isShoot = false

    //Model
    gGame.aliensCount--
    gBoard[pos.i][pos.j].gameObject = null

    //Dom
    // updateCell(pos, DEAD_ALIEN)
    // setTimeout(updateCell, 50, pos)
    updateCell(pos)

    updateScore(10)
    checkVictory()

    checkAlienColCount()
    checkAlienRowCount()

}

function checkAlienColCount() {
    var isLeftColAlive = false
    var isRightColAlive = false

    for (var i = gAliensTopRowIdx; i <= gAliensBottomRowIdx; i++) {
        var leftColObj = gBoard[i][gAliensLeftIdx].gameObject
        var rightColObj = gBoard[i][gAliensRightIdx].gameObject
        if (leftColObj === ALIEN1 || leftColObj === ALIEN2 ||
            leftColObj === ALIEN3 || leftColObj === ALIEN4) isLeftColAlive = true
        if (rightColObj === ALIEN1 || rightColObj === ALIEN2 ||
            rightColObj === ALIEN3 || rightColObj === ALIEN4) isRightColAlive = true
    }

    if (gAliensLeftIdx === gAliensRightIdx) return

    if (!isLeftColAlive) {
        gAliensLeftIdx++
        checkAlienColCount()
    }
    if (!isRightColAlive) {
        gAliensRightIdx--
        checkAlienColCount()
    }
}

function checkAlienRowCount() {
    var isBottomRowAlive = false

    for (var i = gAliensLeftIdx; i <= gAliensRightIdx; i++) {
        var bottomRowObj = gBoard[gAliensBottomRowIdx][i].gameObject
        if (bottomRowObj === ALIEN1 || bottomRowObj === ALIEN2 ||
            bottomRowObj === ALIEN3 || bottomRowObj === ALIEN4) isBottomRowAlive = true
    }

    if (gAliensBottomRowIdx === gAliensTopRowIdx) return
    if (!isBottomRowAlive) {
        gAliensBottomRowIdx--
        checkAlienRowCount()
    }
}

function shiftBoardRight(board, fromI, toI) {
    for (var i = toI; i >= fromI; i--) {
        for (var j = gAliensRightIdx; j >= gAliensLeftIdx; j--) {
            //copy to right cell
            if (board[i][j + 1].gameObject === LASER ||
                board[i][j + 1].gameObject === SUPER_LASER) {
                board[i][j].gameObject = null
                handleAlienHit({ i: i, j: j })
            } else {
                board[i][j + 1].gameObject = board[i][j].gameObject
                board[i][j].gameObject = null
            }
        }
    }
    gAliensLeftIdx++
    gAliensRightIdx++
    if (gAliensRightIdx === BOARD_SIZE - 1) {
        gAliensDirection = 'down'
        gPrevDirection = 'right'
    }
}

function shiftBoardLeft(board, fromI, toI) {
    for (var i = toI; i >= fromI; i--) {
        for (var j = gAliensLeftIdx; j <= gAliensRightIdx; j++) {
            //copy to left cell
            if (board[i][j - 1].gameObject === LASER ||
                board[i][j - 1].gameObject === SUPER_LASER) {
                board[i][j].gameObject = null
                handleAlienHit({ i: i, j: j })
            } else {
                board[i][j - 1].gameObject = board[i][j].gameObject
                board[i][j].gameObject = null
            }
        }
    }
    gAliensLeftIdx--
    gAliensRightIdx--
    if (gAliensLeftIdx === 0) {
        gAliensDirection = 'down'
        gPrevDirection = 'left'
    }
}

function shiftBoardDown(board, fromI, toI) {
    for (var i = toI; i >= fromI; i--) {
        for (var j = gAliensLeftIdx; j <= gAliensRightIdx; j++) {
            //copy to bottom cell
            if (board[i + 1][j].gameObject === LASER ||
                board[i + 1][j].gameObject === SUPER_LASER) {
                board[i][j].gameObject = null
                handleAlienHit({ i: i, j: j })
            } else {
                board[i + 1][j].gameObject = board[i][j].gameObject
                board[i][j].gameObject = null
            }
        }
    }
    gAliensTopRowIdx++
    gAliensBottomRowIdx++
    gAliensDirection = (gPrevDirection === 'right') ? 'left' : 'right'

    if (gAliensBottomRowIdx === BOARD_SIZE - 1) gameOver()
}

// runs the interval for moving aliens side to side and down 
// it re-renders the board every time 
// when the aliens are reaching the hero row - interval stops 
function moveAliens() {
    if (gIsAlienFreeze || !gGame.isOn) return

    switch (gAliensDirection) {
        case 'right':
            shiftBoardRight(gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
            break
        case 'left':
            shiftBoardLeft(gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
            break
        case 'down':
            shiftBoardDown(gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
            break
    }

    renderBoard()
}

function alienShoot() {
    // debugger
    if (!gGame.isOn) return
    gIsAlienShooting = true
    var shotPos = chooseAlienShooter()
    gAlienShotInterval = setInterval(alienBlinkShot, LASER_SPEED, shotPos)
}

function chooseAlienShooter() {
    var alienPoses = []
    for (var i = gAliensLeftIdx; i <= gAliensRightIdx; i++) {
        var currCell = gBoard[gAliensBottomRowIdx][i].gameObject
        if (currCell !== ALIEN1 && currCell !== ALIEN2 &&
            currCell !== ALIEN3 && currCell !== ALIEN4) continue

        alienPoses.push({ i: gAliensBottomRowIdx + 1, j: i })

    }
    var randPos = alienPoses[getRandomInt(0, alienPoses.length)]
    return randPos
}

function alienBlinkShot(pos) {
    if (pos.i === BOARD_SIZE) {
        clearInterval(gAlienShotInterval)
        gIsAlienShooting = false
        return
    }

    const currCell = gBoard[pos.i][pos.j].gameObject
    if (!currCell) {
        updateCell(pos, ALIEN_SHOT)
        setTimeout(updateCell, LASER_SPEED, { i: pos.i, j: pos.j })

        pos.i++
    } else if (currCell === HERO) {
        clearInterval(gAlienShotInterval)
        gIsAlienShooting = false
        hitHero()
    } else if (currCell === INVUL_HERO) {
        clearInterval(gAlienShotInterval)
        gIsAlienShooting = false

    } else {
        updateCell(pos)
        clearInterval(gAlienShotInterval)
        clearInterval(gShotInterval)
    }
}

function hitHero() {
    if (!gHero.lives) {
        updateCell(gHero.pos, DEAD_HERO)
        gameOver()
        return
    }
    gHero.lives--
    document.querySelector('.lives').innerText = gHero.lives
}

function areAlienDeadPlaster() {
    if (!gGame.isOn) return
    var allAlienDead = true
    for (var i = 0; i < BOARD_SIZE; i++) {
        for (var j = 0; j < BOARD_SIZE; j++) {
            var currCellObj = gBoard[i][j].gameObject
            if (currCellObj === ALIEN1 || currCellObj === ALIEN2 ||
                currCellObj === ALIEN3 || currCellObj === ALIEN4) {
                allAlienDead = false
            }
        }
    }
    if (allAlienDead) {
        gGame.isWin = true
        gameOver()
    }
}