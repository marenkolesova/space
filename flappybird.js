//body
let board;
// холст
let boardWidth = 360;
let boardHeight = 640;

let context;

// bird параметры
const bird = {
    x: boardWidth / 8,
    y: boardHeight / 2,
    width: 34,
    height: 24,
    image: './image/flappybird.png',
};

let birdImg;

//pipes параметры
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

const openingSpace = boardHeight / 4;

let gameOver = false;

// физика
const velocityX = -2;
let velocityY = 0;
const gravity = 0.4;

let score = 0;

/** при запуске */
const onloadHandler = () => {
    board = document.getElementById('board');

    console.log(document.body);
    boardHeight = document.documentElement.clientHeight;
    boardWidth = document.body.offsetWidth;

    pipeX = boardWidth;

    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext('2d'); //used for drawing

    birdImg = new Image();
    birdImg.src = bird.image;

    const birdImgLoadHandler = () => {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    birdImg.onload = birdImgLoadHandler;

    topPipeImg = new Image();
    topPipeImg.src = './image/toppipe.png';

    bottomPipeImg = new Image();
    bottomPipeImg.src = './image/bottompipe.png';

    // обновляет экран одновременно с браузером, движение элементов
    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds

    document.addEventListener('keydown', moveBird);
};

const restart = () => {
    score = 0;
    bird.y = boardHeight / 2;
    pipeArray = [];
    gameOver = false;
};

// jump height
const moveBird = () => {
    velocityY = -6;

    if (gameOver) {
        restart();
    }
};

/** Обновление экрана */
const update = () => {
    requestAnimationFrame(update);

    if (gameOver) {
        // console.log('gameOver update');
        return;
    }
    // jump
    context.clearRect(0, 0, board.width, board.height);
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        const pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // score counter
    context.fillStyle = 'white';
    context.font = '45px sans-serif';
    context.fillText(score, 5, 45);
};

/** Добавление препятствий */
const placePipes = () => {
    if (gameOver) {
        // console.log('gameOver placePipes');
        return;
    }

    // появление препятствий рандомно
    const randomPipeY =
        pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    pipeArray.push({
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    });
    pipeArray.push({
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    });
};

// убеждаемся, что птичка врезалась в препятствие
const detectCollision = (bird, pipe) => {
    return (
        bird.x < pipe.x + pipe.width && //a's top left corner doesn't reach b's top right corner
        bird.x + bird.width > pipe.x && //a's top right corner passes b's top left corner
        bird.y < pipe.y + pipe.height && //a's top left corner doesn't reach b's bottom left corner
        bird.y + bird.height > pipe.y
    ); //a's bottom left corner passes b's top left corner
};

// загрузка окна = функция1
window.onload = onloadHandler;
