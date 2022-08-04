const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')


let nundleLength
let nundleID
let nundleFeedback
let maxGuesses = 5

const getNundle = () => {
    fetch('https://myslu.stlawu.edu/~clee/nundle/nundle.php')
        .then(response => response.json())
        .then(json => {
			// TODO:
			// error checking
            nundleLength = json['data']['puzzleLength'];
			nundleID = json['data']['puzzleID'];
            construct_game();
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

let guessRows = []

for (let count = 0; count < maxGuesses; count++) {
	guessRows.push([]);
}
let currentRow = 0
let currentTile = 0
let isGameOver = false

const construct_game = () => {
    guessRows.forEach((arr)=>{
		for (let count = 0; count < nundleLength; count++) {
			arr.push("");
		}
    });
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
}



keys.forEach(key => {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key
    buttonElement.setAttribute('id', key)
    buttonElement.addEventListener('click', () => handleClick(key))
    keyboard.append(buttonElement)
})
// what is a <div. , =>, and confusion on anything that she essentially stated was
//in another video. JSON, stuff like that


const handlePress = (event) =>{
    const keyName = event.key.toUpperCase()
    if(!isGameOver){
        if(keyName === 'BACKSPACE'){
            deleteLetter()
            return
        }
        if(keyName === 'ENTER'){
            checkRow()
            return
        }
        if((!keys.includes(keyName))){
           showMessage("Invalid Character")
        }else{
            addLetter(keyName.toUpperCase())
        }
        
        // if(keyName <= 'z' && keyName >= 'a' && keyName != 'tab' && keyName != 'shift' && keyName != 'control' && keyName != 'alt'
        // && keyName != 'meta' && keyName != 'browserforward' && keyName != 'browserback' && keyName != 'pageup' && keyName != 'pagedown'){
        //     addLetter(keyName.toUpperCase())
        // }
        
        console.log(keyName)
        //do I need a to letter function?? 

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
    if (currentTile < nundleLength && currentRow < 6) {
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
    const guess = guessRows[currentRow].join('')
    if (currentTile > 4) {
        fetch(`https://myslu.stlawu.edu/~clee/nundle/nundle.php?puzzle=${nundleID}&guess=${guess}`)
            .then(response => response.json())
            .then(json => {
				if (json['code'] == 200) {
					nundleFeedback = json['data']['feedback'];
                    flipTile()
                    if (nundleFeedback.reduce((a, b) => a + b, 0) == 2 * nundleLength) {
                        showMessage('Magnificent!')
                        isGameOver = true
                        return
                    } else {
                        if (currentRow >= maxGuesses - 1) {
                            isGameOver = true
                            showMessage('Game Over!')
                            return
                        } else {
                            currentRow++
                            currentTile = 0
                        }
                    }
                } else {
					if (json['code'] == 408) {
						showMessage('Input word is not a valid word')
						return
					} else {
						// TODO:
						// other error checking?
					}
				}
            }).catch(err => console.log(err))
    }
}

const showMessage = (message) => {
    const messageElement = document.createElement('p')
    messageElement.textContent = message
    messageDisplay.append(messageElement)
    setTimeout(() => messageDisplay.removeChild(messageElement),2000)
}

const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(color)
}

const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
    const guess = []

    rowTiles.forEach(tile => {
        guess.push({letter: tile.getAttribute('data'), color: 'grey-overlay'})
    })

    guess.forEach((guess, index) => {
        if (nundleFeedback[index] == 2) {
            guess.color = 'green-overlay'
        }
    })

    guess.forEach((guess, index) => {
        if (nundleFeedback[index] == 1) {
            guess.color = 'yellow-overlay'
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