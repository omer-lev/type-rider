const quotes_endpoint = 'https://api.quotable.io/random?minLength=70?maxLength=100';

const text = document.getElementById('text');
const carot = document.getElementById('carot');
const timer = document.getElementById('timer');
const redo = document.getElementById('redo');

let seconds = 0;
let timerLoop = null;
let holdTimeout, delInterval;

var words = [];
var currentVal = "";
var wordIdx = 0;
var letterIdx = 0;
var currentWord, currentLetter;


const fetchQuote = async () => {
    const res = await fetch(quotes_endpoint);
    const quote = await res.json();
    var content = quote.content;

    content = content.toLowerCase();
    content = content.replaceAll(",", " ");
    content = content.replaceAll(";", " ");
    content = content.replaceAll(":", " ");
    content = content.replaceAll("-", " ");
    content = content.replaceAll("'", "");
    content = content.replaceAll('"', "");
    content = content.replaceAll(".", " ");
    
    content = content.split(" ").filter(x => x != "");

    return content;
};

const start = () => {    
    timerLoop = setInterval(() => {
        seconds++;
        timer.innerHTML = seconds;
    }, 1000);
};

const gameOver = () => {
    clearInterval(timerLoop);
    timerLoop = null;
    
    let correctWords = 0;

    for (let i = 0; i < document.getElementsByTagName('h3').length; i++) {
        const h3 = document.getElementsByTagName('h3')[i];

        h3.getAttribute('id') == "correctWord" && correctWords++;
    }

    const wpm = Math.floor(correctWords * (60 / seconds));
    
    seconds = 0;

    timer.innerHTML = `${wpm} WPM`;
};

const fixInput = (currentLetter, start=false) => {
    const x = currentLetter.offsetLeft;
    const y = currentLetter.offsetTop;
    const w = currentLetter.offsetWidth;
    const c_h = carot.offsetHeight;
    const c_w = carot.offsetWidth;

    start ? carot.style.left = `${x - c_w}px` : carot.style.left = `${x + w}px`
    
    carot.style.top = `${y + c_h / 4}px`;
}

const checkWord = (input, value) => {
    if (input == value) return true;
};

const isLetter = (input) => {
    return (input.length == 1 && /^[a-z]+$/i.test(input))
};

const getPrevInput = (idx) => {
    const prevInput = document.getElementsByTagName('h3')[idx];
    var val = "";

    for (let i = 0; i < prevInput.children.length; i++) {
        const letter = prevInput.children[i];

        letter.getAttribute('id') == "correct" ? val += letter.innerHTML : val += "#";
    }

    return val;
};

const delLetter = () => {
    if (letterIdx == 0 && wordIdx != 0) {
        wordIdx--;
        currentWord = document.getElementsByTagName('h3')[wordIdx];

        currentWord.style.border = 'none';
        currentWord.removeAttribute('id');

        letterIdx = currentWord.children.length;
        currentLetter = currentWord.children[letterIdx - 1];
        
        currentVal = getPrevInput(wordIdx);

        fixInput(currentLetter);
    } 
    else if (letterIdx != 0) {
        letterIdx--;

        currentLetter = currentWord.children[letterIdx];

        if (letterIdx >= words[wordIdx].length) {
            currentLetter.parentNode.removeChild(currentLetter);

            currentLetter = currentWord.children[letterIdx-1];

            fixInput(currentLetter);
        } else {
            currentLetter.removeAttribute('id');
            fixInput(currentLetter, true);
        }

        currentVal = currentVal.substring(0, currentVal.length - 1);
    }
};

const holdDelete = () => {
    holdTimeout = setTimeout(() => {
        delInterval = setInterval(() => {
            delLetter();
        }, 40);
    }, 400);
};

const setup = async () => {
    clearInterval(timerLoop);
    timerLoop = null;
    seconds = 0;
    timer.innerHTML = 0;

    wordIdx = 0;
    letterIdx = 0;
    currentVal = "";
    correctWords = 0;

    text.innerHTML = "";

    words = await fetchQuote();

    for (let i = 0; i < words.length; i++) {
        var word = document.createElement('h3');
    
        for (let j = 0; j < words[i].length; j++) {
            var letter = document.createElement('letter');
    
            letter.innerHTML = words[i][j];
    
            word.append(letter);
        }
    
        text.append(word);
    }

    fixInput(document.getElementsByTagName('letter')[0], true);
};
setup();


document.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    const pressed = e.key;
    currentWord = document.getElementsByTagName('h3')[wordIdx];
    currentLetter = letterIdx < currentWord.children.length && currentWord.children[letterIdx];
    
    if (isLetter(pressed)) {
        !timerLoop && start();

        currentVal += pressed;
    }

    switch (pressed) {
        case "Backspace":
            holdDelete();

            delLetter(letterIdx, wordIdx, currentWord, currentLetter);

            break;

        case " ":
            e.target == redo && e.preventDefault(); // prevent redo press with spacebar

            if (!checkWord(currentVal, words[wordIdx])) {
                currentWord.style.borderBottom = '2px solid rgba(255, 0, 0, 0.6)';
            } else {
                currentWord.setAttribute('id', 'correctWord');
            }

            wordIdx++;
            letterIdx = 0;
            currentVal = "";

            if (wordIdx == words.length) {
                gameOver();
            } else {
                fixInput(document.getElementsByTagName('h3')[wordIdx], true);
            }

            break;
    
        case currentLetter.innerHTML:
            currentLetter.setAttribute('id', 'correct');
            break;

        default:
            if (isLetter(pressed)) {
                if (currentVal.length > currentWord.children.length) {
                    var letter = document.createElement('letter');
                    
                    letter.innerHTML = pressed;
                    currentLetter = letter;

                    currentWord.append(letter);
                }
                currentLetter.setAttribute('id', 'incorrect');
            }
            break;
    }


    if (isLetter(pressed)) {
        letterIdx++;

        fixInput(currentLetter);
    }        
});

document.addEventListener('keyup', (e) => {
    if (e.repeat) return;

    if (e.key == "Backspace") {
        clearTimeout(holdTimeout);
        clearInterval(delInterval); 
    }
});