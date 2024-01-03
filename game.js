'use strict'


var gGame = {
    isOn: false,
    showCellsCount: 0,
    markedCount: 0,
    secsPassed: 0,
}



var gLevel = {
    SIZE: 0,
    MINES: 0
}

var gClues = 3
var gLifes = 3
var gTimerInterval
var gFirstMove = true
var gNotBombs
var gBombs = []

var gBoard

const FLOOR = ' FLOOR'
const BOMB = ' BOMB'



function init() {
    gFirstMove = true
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard, '.Sweeper-inner')
}



function createCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
    }
}

function buildBoard(size) {
    const board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = createCell()
        }
    }
    return board
}

function renderBoard(mat, selector) { // makes a board, takes a mat and a selector to add the HTML mat into it.

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            var cellClass = getClassName({ i, j })
            const cell = mat[i][j] // WHATS IN THE CELL? WALL, PACMAN, FOOD
            if (cell.isMine === false) {
                cellClass += FLOOR
            } else if (cell.isMine === true) {
                cellClass += BOMB
            }

            strHTML += `<td><button
            class="${cellClass}"
            data-i = "${i}"
            data-j = "${j}"
            onclick="flagOrPress(event , this)" 
            oncontextmenu="handleContextMenu(event)">
            <img src='button.PNG' alt="" class="flag"></img>
            </button></td>` // MAKES A TEMPLATE STRING WITH CLASS NAME AND WHATS IN IT

        }
        strHTML += '</tr>'
    }

    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector) // WHERE U ADD THE HTML TABLE.
    elContainer.innerHTML = strHTML

}



function startTimer() {
    var seconds = 0
    var minutes = 0
    var hours = 0

    gTimerInterval = setInterval(() => {
        seconds++

        if (seconds === 60) {
            seconds = 0
            minutes++

            if (minutes === 60) {
                minutes = 0
                hours++
            }
        }

        var time =
            (hours < 10 ? '0' : '') + hours + ':' +
            (minutes < 10 ? '0' : '') + minutes + ':' +
            (seconds < 10 ? '0' : '') + seconds

        var elTimer = document.querySelector('.timer span')
        elTimer.innerText = time
    }, 1000)
}



function setDifficulty(elBtn) {
    var elFlagsAmount = document.querySelector('.flagAmount span')
    elFlagsAmount.innerText = gLevel.MINES


    if (elBtn.innerText === 'Easy ||') {
        console.log('easy');
        gLevel.SIZE = 5
        gLevel.MINES = 2
        elFlagsAmount.innerText = gLevel.MINES
        var elTimerAndFlagAmount = document.querySelector('.flagAndTimer')
        elTimerAndFlagAmount.style.display = 'flex'
        startTimer()
        init()

    } else if (elBtn.innerText === 'Intermidate ||') {
        console.log('inter');
        gLevel.SIZE = 10
        gLevel.MINES = 30
        elFlagsAmount.innerText = gLevel.MINES
        var elTimerAndFlagAmount = document.querySelector('.flagAndTimer')
        elTimerAndFlagAmount.style.display = 'flex'
        startTimer()
        init()

    } else if (elBtn.innerText === 'Hard ||') {
        console.log('hard');
        gLevel.SIZE = 20
        gLevel.MINES = 60
        elFlagsAmount.innerText = gLevel.MINES
        var elTimerAndFlagAmount = document.querySelector('.flagAndTimer')
        elTimerAndFlagAmount.style.display = 'flex'
        startTimer()
        init()
    } else if (elBtn.innerText === 'Custom size') {
        console.log('custom');
        gLevel.SIZE = +prompt('Board size : ')
        gLevel.MINES = +prompt('How many mines bro?')
        elFlagsAmount.innerText = gLevel.MINES
        var elTimerAndFlagAmount = document.querySelector('.flagAndTimer')
        elTimerAndFlagAmount.style.display = 'flex'
        startTimer()
        init()
    }



}

function playAgain() {
    gLevel.MINES = 0
    gLevel.SIZE = 0
    gGame.markedCount = 0
    clearInterval(gTimerInterval)
    var elTimer = document.querySelector('.timer span')
    elTimer.innerText = '00:00:00'

    var elFlagsAmount = document.querySelector('.flagAmount span')
    elFlagsAmount.innerText = ''

    var elTimerAndFlagAmount = document.querySelector('.flagAndTimer')
    elTimerAndFlagAmount.style.display = 'none'


    var elModal = document.querySelector('.modal')
    elModal.style.display = 'none'

    init()

}



function handleContextMenu(event) {
    event.preventDefault();
    simulateLeftClick(event)
    // You can add your context menu logic here if needed
}

function simulateLeftClick(event) {
    // Creates a new moustEvent that mimicks a left click
    const leftClickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: 2,
    }
    );

    //targets the element that I clicked, and sends it over there, in my case it creates a fake left click only its a right click.
    event.target.dispatchEvent(leftClickEvent);
}


function countBombs(rowIdx, colIdx) {
    var negs = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (gBoard[i][j].isMine === true) negs++;
        }
    }
    return negs
}


function revealEmptyPlaces(row, col, board) {
    if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
        return
    } // cheaks the row and colums dont slip out of the board

    const cell = board[row][col] // current cell chosen

    cell.minesAroundCount = countBombs(row, col) // counts the bombs around the cell

    if (cell.isMine || cell.isShown || cell.isMarked) { // if its a show cell, return , same for a mine.
        return
    }

    cell.isShown = true; // if not by default we make it shown

    // DOM select the button in that row and colum
    const cellButton = document.querySelector(`[data-i="${row}"][data-j="${col}"]`); // retrives the button that has a certain I and J.

    for (var i = row - 1; i <= row + 1; i++) { // neg loop
        for (var j = col - 1; j <= col + 1; j++) {

            if (cell.minesAroundCount === 0) { // if its a 0 in that cell, make it empty
                cellButton.innerHTML = ''
                cellButton.classList.add('revealed');
                revealEmptyPlaces(i, j, board) // recursivly call the function again, looking for more '0'
            } else if (cell.minesAroundCount > 0) { // if its not a 0 in that cell, 
                cellButton.innerText = countBombs(row, col) // update the number
                cellButton.classList.add('revealed') // just add a reveal, which shows the number, and return it
                continue
            }

        }
    }

}



function bombPlacer(board, initialClickI, initialClickJ) { // MODIFIED VERSION, MAKES SURE THE 1ST CLICK IS NOT A BOMB using intialClickI and initialClickJ 
    //as prameters to start the game and they are sent to the flagOrClick function when the click is left click
    var bombsPlaced = 0;
    board[initialClickI][initialClickJ].minesAroundCount = 0 // WHY WONT THIS LINE WORK
    console.log(board[initialClickI][initialClickJ])

    while (bombsPlaced < gLevel.MINES) {
        var randomI = getRandomIntInclusive(0, board.length - 1);
        var randomJ = getRandomIntInclusive(0, board[0].length - 1);

        if (randomI !== initialClickI || randomJ !== initialClickJ) {
            if (!board[randomI][randomJ].isMine) {
                board[randomI][randomJ].isMine = true;
                gBombs.push(board[randomI][randomJ]);
                bombsPlaced++;
            }
        }
    }
    console.log(gBombs);
    gFirstMove = false;
}




// function bombPlacer(board) { 1ST VERSION OF BOMBPLACER, WITHOUT BONUS although bonus is not completed yet, a bug I cant find :(
//     for (var i = 0; i < gLevel.MINES; i++) {
//         var randomCellIbomb = getRandomIntInclusive(0, board.length - 1)
//         var randomCellJbomb = getRandomIntInclusive(0, board[0].length - 1)
//         console.log('i : ', randomCellIbomb);
//         console.log('j : ', randomCellJbomb);
//         board[randomCellIbomb][randomCellJbomb].isMine = true
//         gBombs.push(board[randomCellIbomb][randomCellJbomb])
//     }
// }

function revealBombs() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine === true) {
                currCell.isShown = true // MODEL
                //DOM
                var elBtn = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elBtn.classList.add('revealed')
                elBtn.innerHTML = ''
                const imgElement = document.createElement('img')
                imgElement.src = 'bomb.PNG'
                elBtn.appendChild(imgElement)

            }
        }
    }

}


function getNotBombs(board) {
    var arr = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            if (currCell.isMine === false) {
                arr.push(currCell)
            }
        }
    }
    return arr
}





function endGame() {
    gGame.isOn = false;
    var elSpan = document.querySelector('.modal span')
    var elModal = document.querySelector('.modal')
    // Check if all non-mine cells in gNotBombs are not marked
    for (var i = 0; i < gNotBombs.length; i++) {
        if (gNotBombs[i].isMarked) {
            console.log('you lost');
            elModal.style.display = 'block'
            elSpan.innerText = 'LOST!'
            clearInterval(gTimerInterval)
            return// If any non-mine cell is not marked, return false
        }
    }

    // Check if all mine cells in gBombs are marked
    for (var i = 0; i < gBombs.length; i++) {
        if (!gBombs[i].isMarked) {
            console.log('you lost');
            elModal.style.display = 'block'
            elSpan.innerText = 'LOST!'
            clearInterval(gTimerInterval)
            return // If any mine cell is not marked, return false
        }
    }

    console.log('you won');
    elModal.style.display = 'block'
    elSpan.innerText = 'WON!'
    clearInterval(gTimerInterval)
}





function flagOrPress(event, elBtn) {
    event.preventDefault()

    var elFlagsAmount = document.querySelector('.flagAmount span')
    elFlagsAmount.innerText = gLevel.MINES

    var currCell = gBoard[elBtn.dataset.i][elBtn.dataset.j]
    var currCellI = +elBtn.dataset.i
    var currCellJ = +elBtn.dataset.j

    if (gFirstMove === true && event.button === 2) {
        return
    }

    if (gFirstMove === true && event.button === 0) {
        gFirstMove = false
        currCell.minesAroundCount = 0
        bombPlacer(gBoard, currCellI, currCellJ)
        gNotBombs = getNotBombs(gBoard)

        // console.log('NOT BOMBS', gNotBombs);
        // console.log('BOMBS', gBombs);
    }

    currCell.minesAroundCount = countBombs(currCellI, currCellJ)

    if (event.button === 0) {
        // Left mouse click logic

        if (currCell.isMarked === true) {
            return
        }

        if (currCell.isMine === true) {
            revealBombs()
            gGame.isOn = false
            console.log('you lost');
            var elSpan = document.querySelector('.modal span')
            var elModal = document.querySelector('.modal')
            elModal.style.display = 'block'
            elSpan.innerText = 'LOST!'
            clearInterval(gTimerInterval)
            return


        } else {
            if (currCell.minesAroundCount === 0) {
                revealEmptyPlaces(currCellI, currCellJ, gBoard)
            } else {
                elBtn.innerText = currCell.minesAroundCount
                elBtn.classList.add('revealed')
            }
        }
    } else if (event.button === 2) {

        if (!currCell.isMarked) {

            currCell.isMarked = true

            // Created the flag image element
            const imgElementFlag = document.createElement('img')
            imgElementFlag.src = 'flag.png'
            elBtn.innerHTML = ''
            elBtn.appendChild(imgElementFlag)
            gGame.markedCount++
            elFlagsAmount.innerText = gLevel.MINES - gGame.markedCount
        } else {
            // If already marked, remove flag
            currCell.isMarked = false
            const imgElementButton = document.createElement('img')
            imgElementButton.src = 'button.png'
            elBtn.innerHTML = ''
            elBtn.appendChild(imgElementButton)
            gGame.markedCount--
            elFlagsAmount.innerText = gLevel.MINES - gGame.markedCount
        }

        if (gGame.markedCount === gLevel.MINES) {
            endGame()
        }


    }
}

