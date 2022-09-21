'use strict'

const LASER_SPEED = 150

var gHero = {
    pos: { i: 13, j: 5 },
    isShoot: false
}

var gShotInterval

// creates the hero and place it on board 
function createHero(board) {
    board[gHero.pos.i][gHero.pos.j].gameObject = HERO
}

// Handle game keys 
function onKeyDown(ev) {
    // console.log('ev', ev)
    switch (ev.key) {
        case 'ArrowRight':
            moveHero(1)
            break
        case 'ArrowLeft':
            moveHero(-1)
            break
        case ' ':
            if (!gHero.isShoot) shoot()
            break

    }
}

// Move the hero right (1) or left (-1) 
function moveHero(dir) {
    if (gHero.pos.j === 0 && dir === -1
        || gHero.pos.j === BOARD_SIZE - 1 && dir === 1
        || !gGame.isOn) return
    //Remove hero from current Cell
    //Model
    gBoard[gHero.pos.i][gHero.pos.j].gameObject = null

    //Dom
    updateCell(gHero.pos)
    //Add hero to next cell
    //Model
    gHero.pos.j += dir
    gBoard[gHero.pos.i][gHero.pos.j].gameObject = HERO

    //Dom
    updateCell(gHero.pos, HERO)

    // console.log('gHero', gHero)
}

// Sets an interval for shooting (blinking) the laser up towards aliens 
function shoot() {
    if (!gGame.isOn) return
    gHero.isShoot = true
    var shotPos = { i: gHero.pos.i - 1, j: gHero.pos.j }
    gShotInterval = setInterval(blinkLaser, LASER_SPEED, shotPos)
}

// renders a LASER at specific cell for short time and 
// removes it 
function blinkLaser(pos) {
    if (pos.i === -1) {
        clearInterval(gShotInterval)
        gHero.isShoot = false
        return
    }

    const currCell = gBoard[pos.i][pos.j].gameObject
    // if (!currCell) {
    //     updateCell(pos, LASER)
    //     setTimeout(updateCell, LASER_SPEED, { i: pos.i, j: pos.j })
    //     pos.i--
    // } else {
    //     gHero.isShoot = false
    //     console.log('hitting alien')
    //     handleAlienHit(pos)
    // }


    if (currCell !== ALIEN) {
        updateCell(pos, LASER)
        setTimeout(updateCell, LASER_SPEED, { i: pos.i, j: pos.j })
        pos.i--
    } else {
        gHero.isShoot = false
        console.log('hitting alien')
        handleAlienHit(pos)

    }

}