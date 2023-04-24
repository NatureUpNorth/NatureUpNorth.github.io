
const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')

//const getNundle = async() => {
function getNundle() {
    return fetch('https://myslu.stlawu.edu/~clee/nundle/nundleWord.php')
        .then(response => response.json())
        .then(json => {
            wordle = json["data"]["nundle"]
            puzzleID = json["data"]["puzzleID"]
            initialize()
        })
        .catch(err => console.log(err))
}

getNundle()

const keys = [
    'Q',
    'W',
    'E',
    'R',
    'T',
    'Y',
    'U',
    'I',
    'O',
    'P',
    'A',
    'S',
    'D',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'ENTER',
    'Z',
    'X',
    'C',
    'V',
    'B',
    'N',
    'M',
    '«',
]

const maxGuesses = 6

let guessRows = [
]

let currentRow = 0
let currentTile = 0
let isGameOver = false

function initialize() {
    for (let row = 0; row < maxGuesses; row++) {
       guessRows.push([])
       for (let col = 0; col < wordle.length; col++) {
           guessRows[row].push('')
       }
    }
    
    guessRows.forEach((guessRow, guessRowIndex) => {
        const rowElement = document.createElement('div')
        rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)
        guessRow.forEach((_guess, guessIndex) => {
            const tileElement = document.createElement('div')
            tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
            tileElement.classList.add('tile')
            rowElement.append(tileElement)
        })
        tileDisplay.append(rowElement)
    })
    
    keys.forEach(key => {
        const buttonElement = document.createElement('button')
        buttonElement.textContent = key
        buttonElement.setAttribute('id', key)
        buttonElement.addEventListener('click', () => handleClick(key))
        keyboard.append(buttonElement)
    })
    
    
    const handlePress = (event) =>{
        const keyName = event.key.toLowerCase()
        if(!isGameOver){
            if(keyName === 'backspace'){
                deleteLetter()
                return
            }
            if(keyName === 'enter'){
                checkRow()
                return
            }
            if(keyName.match(/[a-z]/i) && keyName.length == 1){
                addLetter(keyName.toUpperCase())
            }
        }
    }
    document.addEventListener('keydown', handlePress)
    
    const handleClick = (letter) => {
        if (!isGameOver) {
            if (letter === '«') {
                deleteLetter()
                return
            }
            if (letter === 'ENTER') {
                checkRow()
                return
            }
            addLetter(letter)
            
        }
    }
    
    const addLetter = (letter) => {
        if (currentTile < wordle.length && currentRow < maxGuesses) {
            const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
            tile.textContent = letter
            guessRows[currentRow][currentTile] = letter
            tile.setAttribute('data', letter)
            currentTile++
        }
    }
    
    const deleteLetter = () => {
        if (currentTile > 0) {
            currentTile--
            const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
            tile.textContent = ''
            guessRows[currentRow][currentTile] = ''
            tile.setAttribute('data', '')
        }
    }
    
    const checkRow = () => {
        const guess = guessRows[currentRow].join('').toLowerCase()
        if (currentTile >= wordle.length) {
            fetch(`https://myslu.stlawu.edu/~clee/nundle/isValid.php?guess=${guess}`)
            
                .then(response => response.json())
                .then(response => {
                    if (!response.data.isValid) {
                        notin('word not in list')
                        return
                    } else {
                        flipTile()
                        if (guess == this.wordle) {
                            showMessage('Magnificent!')
                            isGameOver = true;
                            //Save state of end game to be iterated over after, somehow get only the colors.
                            let endGame = document.querySelector(".tile-container");
                            shareText = "NUNdle " + puzzleID + " " + (currentRow + 1) + "/" + maxGuesses + "\n\n"
                            for (let row = 0; row < currentRow; row++) {
                                for (let col = 0; col < wordle.length; col++) {
                                    let tile = document.getElementById("guessRow-" + row + "-tile-" + col)
                                    if (tile.classList.contains("grey-overlay")) { // 11036
                                        shareText += String.fromCodePoint(11036)
                                    } else {
                                        if (tile.classList.contains("yellow-overlay")) { // 129000
                                            shareText += String.fromCodePoint(129000)
                                        } else { // 129001
                                            shareText += String.fromCodePoint(129001)
                                        }
                                    }
                                }
                                shareText += "\n"
                            }
                            for (let col = 0; col < wordle.length; col++) {
                                shareText += String.fromCodePoint(129001)
                            } 
                            shareText += "\n"
                            navigator.clipboard.writeText(shareText)
                            return
                        } else {
                            if (currentRow >= maxGuesses - 1) {
                                isGameOver = true
                                showMessage('Game Over: ' + this.wordle)
                                return
                            } else {
                                currentRow++
                                currentTile = 0
                            }
                        }
                    }
                }).catch(err => console.log(err))
        }
    }
    
    const notin = (message) => {
        const messageElement = document.createElement('N')
        messageElement.textContent = message
        messageDisplay.append(messageElement)
        setTimeout(() => messageDisplay.removeChild(messageElement), 3000)
    }
    const showMessage = (message) => {
        const messageElement = document.createElement('p')
        messageElement.textContent = message
        messageDisplay.append(messageElement)
    }
    
    const addColorToKey = (keyLetter, color) => {
        const key = document.getElementById(keyLetter)
        key.classList.add(color)
    }
    
    const flipTile = () => {
        const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
        let checkWordle = this.wordle.toUpperCase()
        const guess = []
    
        rowTiles.forEach(tile => {
            guess.push({letter: tile.getAttribute('data'), color: 'grey-overlay'})
        })
    
        guess.forEach((guess, index) => {
            if (guess.letter.toLowerCase() == this.wordle[index]) {
                guess.color = 'green-overlay'
                checkWordle = checkWordle.replace(guess.letter, '')
            }
        })
    
        guess.forEach(guess => {
            if (checkWordle.includes(guess.letter)) {
                guess.color = 'yellow-overlay'
                checkWordle = checkWordle.replace(guess.letter, '')
            }
        })
    
        rowTiles.forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.add('flip')
                tile.classList.add(guess[index].color)
                addColorToKey(guess[index].letter, guess[index].color)
            }, 500 * index)
        })
    }
}
