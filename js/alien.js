'use strict'

const ALIEN_SPEED = 750;

var gIntervalAliens;
// The following two variables represent the part of the matrix 
// (some rows) that we should shift (left, right, and bottom) 
// We need to update those when: 
// (1) shifting down and 
// (2) last alien was cleared from row 
var gAliensTopRowIdx
var gAliensBottomRowIdx
var gAliensLeftIdx
var gAliensRightIdx

var gIsAlienFreeze

var gPrevDirection
var gAliensDirection

function createAliens(board) {
    for (var i = 0; i < ALIENS_ROW_COUNT; i++) {
        for (var j = 0; j < ALIENS_ROW_LENGTH; j++) {
            board[i][j].gameObject = ALIEN
            gGame.aliensCount++
        }
    }
}

function handleAlienHit(pos) {
    clearInterval(gShotInterval)
    //Model
    gGame.aliensCount--
    // gHero.isShoot = false
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
        if (gBoard[i][gAliensLeftIdx].gameObject === ALIEN) isLeftColAlive = true
        if (gBoard[i][gAliensRightIdx].gameObject === ALIEN) isRightColAlive = true
    }

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
        if (gBoard[gAliensBottomRowIdx][i].gameObject === ALIEN) isBottomRowAlive = true
    }

    if (!isBottomRowAlive) {
        gAliensBottomRowIdx--
        checkAlienRowCount()
    }
}

function shiftBoardRight(board, fromI, toI) {
    for (var i = fromI; i <= toI; i++) {
        for (var j = gAliensRightIdx; j >= gAliensLeftIdx; j--) {
            //copy to right cell
            if (board[i][j + 1].gameObject === LASER) {
                // board[i][j].gameObject = null
                // board[i][j + 1].gameObject = null
                clearInterval(gShotInterval)
                handleAlienHit({ i: i, j: j + 1 })
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
    for (var i = fromI; i <= toI; i++) {
        for (var j = gAliensLeftIdx; j <= gAliensRightIdx; j++) {
            //copy to left cell
            if (board[i][j - 1].gameObject === LASER) {
                // board[i][j - 1].gameObject = null
                // board[i][j].gameObject = null
                clearInterval(gShotInterval)
                handleAlienHit({ i: i, j: j - 1 })
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
            if (board[i + 1][j].gameObject === LASER) {
                // board[i + 1][j].gameObject = null
                // board[i][j].gameObject = null
                clearInterval(gShotInterval)
                handleAlienHit({ i: i - 1, j: j })
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
    if (gIsAlienFreeze) return

    if (gAliensDirection === 'right') {
        shiftBoardRight(gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)

    } else if (gAliensDirection === 'left') {
        shiftBoardLeft(gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)

    } else {
        shiftBoardDown(gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)

    }

    renderBoard()
}

