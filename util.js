'use strict'





function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}



function renderBoard(mat, selector) { // makes a board, takes a mat and a selector to add the HTML mat into it.

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            //var cellClass = getClassName({ i, j })
            const cell = mat[i][j] // WHATS IN THE CELL? WALL, PACMAN, FOOD
            const className = `cell cell-${i}-${j}` // A CLASS WITH I AND J changes accordingly 

            strHTML += `<td class="${className}">${cell}</td>` // MAKES A TEMPLATE STRING WITH CLASS NAME AND WHATS IN IT
        }
        strHTML += '</tr>'
    }

    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector) // WHERE U ADD THE HTML TABLE.
    elContainer.innerHTML = strHTML

}

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    // const elCell = document.querySelector(`[data-i="${location.i}"][data-j="${location.j}"]`)
    elCell.innerHTML = value
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getClassName(position) {// receives an object of i and j, therfor dot notion here works (its like assgining position = {i , j})
    const cellClass = `cell cell-${position.i}-${position.j}` // template string of a cell to be added into every td in the HTML,
    // with a uniqe class of the current position of given {i , j} for example : cell-3-4  // cell-${i}-${j}`
    return cellClass
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}



// function countNegs(rowIdx, colIdx,CELLVALUE) {
//     var negs = 0

//     for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
//         if(i < 0 || i >= gBoard.length) continue
//         for(var j = colIdx - 1; j <= colIdx + 1; j++){
//             if(j < 0 || j >= gBoard[i].length) continue
//             if(i === rowIdx && j === colIdx) continue
//             if(gBoard[i][j] === CELLVALUE) negs++
//         }
//     }
//     return negs
// }


// function outerMatrixLines(board) {
//     for (var i = 0; i < board.length; i++) {
//         for (var j = 0; j < board[i].length; j++) {
//             if (i === 0 || i === board.length - 1 || j === 0 || j === board[i].length - 1) { // identifies the outer layer of the matrix !!!!!!!!!!!!!!!!!!!!!!!!!!!
//                 board[i][j] = { type: WALL, gameElement: null } // places within the specified cell an object with 2 properties
//             } else { // gameElement means whats on the cell, GAMER, BALL, etc
//                 board[i][j] = { type: FLOOR, gameElement: null } // places within the specified cell an object with 2 properties
//             }
//         }
//     }
// }