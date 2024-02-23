//body
let board;
// холст
let boardWidth = 360;
let boardHeight = 640;

let context;

// hero параметры
const hero = {
    x: boardWidth / 8,
    y: boardHeight / 2,
    width: 256,
    height: 256,
    image: './image/ufo.png',
};

let heroImg;

//stones параметры
let stoneArray = [];
let stoneWidth = 64; //width/height ratio = 384/3072 = 1/8
let stoneHeight = 512;
let stoneX = boardWidth;
let stoneY = 0;

let topStoneImg;
let bottomStoneImg;

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

    stoneX = boardWidth;

    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext('2d'); //used for drawing

    heroImg = new Image();
    heroImg.src = hero.image;

    const heroImgLoadHandler = () => {
        context.drawImage(heroImg, hero.x, hero.y, hero.width, hero.height);
    };

    heroImg.onload = heroImgLoadHandler;

    topStoneImg = new Image();
    topStoneImg.src = './image/stone1.png';

    bottomStoneImg = new Image();
    bottomStoneImg.src = './image/stone2.png';

    // обновляет экран одновременно с браузером, движение элементов
    requestAnimationFrame(update);
    setInterval(placeStones, 1500); //every 1.5 seconds

    document.addEventListener('keydown', moveBird);
};

const restart = () => {
    score = 0;
    hero.y = boardHeight / 2;
    stoneArray = [];
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
    hero.y = Math.max(hero.y + velocityY, 0);
    context.drawImage(heroImg, hero.x, hero.y, hero.width, hero.height);

    if (hero.y > board.height) {
        gameOver = true;
    }

    // stones
    for (let i = 0; i < stoneArray.length; i++) {
        const stone = stoneArray[i];
        stone.x += velocityX;
        context.drawImage(
            stone.img,
            stone.x,
            stone.y,
            stone.width,
            stone.height
        );

        if (!stone.passed && hero.x > stone.x + stone.width) {
            score += 0.5;
            stone.passed = true;
        }

        if (detectCollision(hero, stone)) {
            gameOver = true;
        }
    }

    // score counter
    context.fillStyle = 'white';
    context.font = '45px sans-serif';
    context.fillText(score, 5, 45);
};

/** Добавление препятствий */
const placeStones = () => {
    if (gameOver) {
        // console.log('gameOver placeStones');
        return;
    }

    // появление препятствий рандомно
    const randomStoneY =
        stoneY - stoneHeight / 4 - Math.random() * (stoneHeight / 2);
    stoneArray.push({
        img: topStoneImg,
        x: stoneX,
        y: randomStoneY,
        width: stoneWidth,
        height: stoneHeight,
        passed: false,
    });
    stoneArray.push({
        img: bottomStoneImg,
        x: stoneX,
        y: randomStoneY + stoneHeight + openingSpace,
        width: stoneWidth,
        height: stoneHeight,
        passed: false,
    });
};

// убеждаемся, что птичка врезалась в препятствие
const detectCollision = (currentHero, stone) => {
    return (
        currentHero.x < stone.x + stone.width && //a's top left corner doesn't reach b's top right corner
        currentHero.x + currentHero.width > stone.x && //a's top right corner passes b's top left corner
        currentHero.y < stone.y + stone.height && //a's top left corner doesn't reach b's bottom left corner
        currentHero.y + currentHero.height > stone.y
    ); //a's bottom left corner passes b's top left corner
};

// загрузка окна = функция1
window.onload = onloadHandler;
