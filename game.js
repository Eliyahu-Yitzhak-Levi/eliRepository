'use strict'


var gGame = {
    isOn: false,
    showCellsCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

var gLevel = {
    SIZE: 6,
    MINES: 4
}
var gFirstMove = true
var gNotBombs
var gBombs = []

var gBoard

const FLOOR = ' FLOOR'
const BOMB = ' BOMB'



function init() {

    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard, '.Sweeper-inner')
    // bombPlacer(gBoard)
    // bombPlacer(gBoard)
    gNotBombs = getNotBombs(gBoard)
    // console.log('NOT BOMBS ARRAY : ', gNotBombs)
    // console.log('BOMBS ARRAY : ', gBombs)

}



function createCell(i, j) {
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
    });

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

    if (cell.isMine || cell.isShown) { // if its a show cell, return , same for a mine.
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
    console.log(board[initialClickI][initialClickJ]);

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
    var arr = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]
            if (currCell.isMine === false) {
                arr.push(currCell)
            }

        }

    }
    return arr
}


function winOrLose() {
    // Check if all non-mine cells in gNotBombs are not marked
    for (var i = 0; i < gNotBombs.length; i++) {
        if (gNotBombs[i].isMarked) {
            return false // If any non-mine cell is marked, return false
        }
    }

    // Check if all mine cells in gBombs are marked
    for (var i = 0; i < gBombs.length; i++) {
        if (!gBombs[i].isMarked) {
            return false // If any mine cell is not marked, return false
        }
    }

    // Check if the number of marked mines is equal to the total number of mines
    return gGame.markedCount === gLevel.MINES
}


function endGame() {
    gGame.isOn = false
    if (winOrLose() === true) {
        console.log('you won')
        for (var i = 0; i < gNotBombs.length; i++) {


        }
    }
    else (console.log('you lose'))
}

function flagOrPress(event, elBtn) {

    event.preventDefault()
    var currCell = gBoard[elBtn.dataset.i][elBtn.dataset.j]
    var currCellI = +elBtn.dataset.i
    var currCellJ = +elBtn.dataset.j

    const imgElement = document.createElement('img')
    const flag = elBtn.querySelector('.flag')


    if (gFirstMove === true && event.button === 0) {
        gFirstMove = false
        currCell.minesAroundCount = 0
        bombPlacer(gBoard, currCellI, currCellJ) // bombPlacer is called ONLY after the 1st move, currCellI and currCellJ are sent as the intialClick param
    }

    currCell.minesAroundCount = countBombs(currCellI, currCellJ);

    if (event.button === 0) {
        console.log('LEFT MOUSE CLICK');
        if (currCell.isMarked === true) {
            return;
        }

        if (currCell.isMine === true) {
            revealBombs();
            endGame();
        } else {
            if (currCell.minesAroundCount === 0) {
                revealEmptyPlaces(currCellI, currCellJ, gBoard);
            } else {
                elBtn.innerText = currCell.minesAroundCount;
                elBtn.classList.add('revealed');
            }
        }
    }
}
