
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
            url = "https://en.wikipedia.org/wiki/Main_Page"
            description = "An important reason for this denial is that the genocide enabled the establishment of a Turkish nation-state; recognition would contradict Turkey's founding myths. The Turkish state's century-long denial of the genocide sets it apart from other cases of genocide."
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
    
    const generateShareText = () => {
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
    }
    
    const copyShareText = () => {
        navigator.clipboard.writeText(shareText)
        notin('Copied results to the clipboard')
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
                            showMessage(true)
                            isGameOver = true;
                            //Save state of end game to be iterated over after, somehow get only the colors.
                            generateShareText()
                            return
                        } else {
                            if (currentRow >= maxGuesses - 1) {
                                isGameOver = true
                                showMessage(false)
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
        const messageElement = messageDisplay.children.length > 0 ? messageDisplay.children[0] : document.createElement('div') 
        const innerMessageElement = document.createElement("p")
        innerMessageElement.textContent = message
        messageElement.append(innerMessageElement)
        setTimeout(() => {
            messageElement.removeChild(innerMessageElement)
            if (messageElement.children.length == 0) {
                messageDisplay.style.display = "none"
            }
        }, 3000)
        if (messageDisplay.children.length == 0) {
            messageDisplay.append(messageElement)
        }
        messageDisplay.style.display = "flex"
    }
    
    const showMessage = (correct) => {
        // "Magnificent!<p>HELLO!<p>
        let message = correct ? "Congratulations!" : "Game over!"
        const messageElement = messageDisplay.children.length > 0 ? messageDisplay.children[0] : document.createElement('div') 
        const titleElement = document.createElement('p')
        titleElement.textContent = message
        messageElement.append(titleElement)
        const answerElement = document.createElement('h2')
        answerElement.textContent = wordle.toUpperCase().split("").join(" ")
        messageElement.append(answerElement)
        const descriptionElement = document.createElement('p')
        descriptionElement.textContent = description
        messageElement.append(descriptionElement)
        const urlElement = document.createElement('a')
        urlElement.href = url
        urlElement.textContent = url
        urlElement.target = "_blank"
        messageElement.append(urlElement)
        const buttonContainerElement = document.createElement('p')
        const buttonElement = document.createElement('button')
        buttonElement.innerHTML = "Share"
        buttonElement.onclick = copyShareText
        buttonElement.style.padding = "5px"
        buttonElement.style.color = "#000"
        buttonContainerElement.append(buttonElement)
        messageElement.append(buttonContainerElement)
        messageDisplay.append(messageElement)
        messageDisplay.style.display = "flex"
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
