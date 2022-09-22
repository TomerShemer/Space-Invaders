'use strict'

const LASER_SPEED = 150
const SUPER_LASER_SPEED = 50

var gHero = {
    pos: { i: 13, j: 5 },
    isShoot: false,
    isExplosive: false,
    isSuperShot: false,
    superShotAmmo: 3,
    lives: 3,
    shieldAmmo: 3,
    isInvul: false,
}

var gShotInterval

//PLASTER
var gShotTime
var gPlasterInterval

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
        case 'n':
            if (gHero.isShoot) return
            gHero.isExplosive = true
            shoot()
            break
        case 'x':
            if (!gHero.superShotAmmo || gHero.isShoot) return
            gHero.isSuperShot = true
            gHero.superShotAmmo--
            document.querySelector('.super-ammo').innerText = gHero.superShotAmmo
            shoot()
            break
        case 'z':
            if (!gHero.shieldAmmo || gHero.isInvul) return
            useShield()
            updateCell(gHero.pos, INVUL_HERO)
            break
        case 'p':
            startGame()
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
    var heroImg = gHero.isInvul ? INVUL_HERO : HERO
    gHero.pos.j += dir
    gBoard[gHero.pos.i][gHero.pos.j].gameObject = heroImg

    //Dom
    updateCell(gHero.pos, heroImg)

    // console.log('gHero', gHero)
}

// Sets an interval for shooting (blinking) the laser up towards aliens 
function shoot() {
    if (!gGame.isOn) return
    gShotTime = Date.now()
    gHero.isShoot = true
    var shotPos = { i: gHero.pos.i - 1, j: gHero.pos.j }
    var shotInterval = gHero.isSuperShot ? SUPER_LASER_SPEED : LASER_SPEED
    gShotInterval = setInterval(blinkLaser, shotInterval, shotPos)

    // fixes bug where isShoot is stuck on true
    gPlasterInterval = setInterval(function () {
        var timeSinceShot = Date.now() - gShotTime
        if (timeSinceShot > 3250) {
            clearInterval(gPlasterInterval)
            gHero.isShoot = false
            gHero.isExplosive = false
            gHero.isSuperShot = false
        }
    }, 5000)
}

// renders a LASER at specific cell for short time and 
// removes it 
function blinkLaser(pos) {
    if (pos.i === -1) {
        clearInterval(gShotInterval)
        gHero.isShoot = false
        gHero.isSuperShot = false
        return
    }

    const currCell = gBoard[pos.i][pos.j].gameObject

    if (!currCell) {
        if (gHero.isSuperShot) {
            updateCell(pos, SUPER_LASER)
            setTimeout(updateCell, SUPER_LASER_SPEED, { i: pos.i, j: pos.j })
        } else {
            updateCell(pos, LASER)
            setTimeout(updateCell, LASER_SPEED, { i: pos.i, j: pos.j })
        }
        pos.i--
    } else if (currCell === ALIEN1 ||
        currCell === ALIEN2 ||
        currCell === ALIEN3 ||
        currCell === ALIEN4) {
        gHero.isShoot = false
        if (gHero.isExplosive) {
            blowUpNegs(pos)
            gHero.isExplosive = false
        } else {
            handleAlienHit(pos)
            if (gHero.isSuperShot) gHero.isSuperShot = false
        }
    } else if (currCell === SPACE_CANDY) {
        gHero.isShoot = false
        clearInterval(gShotInterval)
        clearInterval(gIntervalAliens)
        updateScore(50)
        updateCell({ i: pos.i, j: pos.j })
        setTimeout(function () {
            gIntervalAliens = setInterval(moveAliens, alienSpeed)
        }, 5000)
    } else if (currCell === BUNKER) {
        updateCell({ i: pos.i, j: pos.j })
        clearInterval(gShotInterval)
        gHero.isShoot = false
    }
}

function blowUpNegs(pos) {
    clearInterval(gShotInterval)
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > BOARD_SIZE - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > BOARD_SIZE - 1) continue
            var currCell = gBoard[i][j]
            if (currCell.gameObject !== ALIEN1 &&
                currCell.gameObject !== ALIEN2 &&
                currCell.gameObject !== ALIEN3 &&
                currCell.gameObject !== ALIEN4) continue

            handleAlienHit({ i, j })
        }
    }
}

function useShield() {
    gHero.shieldAmmo--
    gHero.isInvul = true
    setTimeout(() => {
        gHero.isInvul = false
        updateCell(gHero.pos, HERO)
    }, 5000)
    document.querySelector('.shield').innerText = gHero.shieldAmmo
}