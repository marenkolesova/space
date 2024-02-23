//body
let board;
// холст
let boardWidth = 360;
let boardHeight = 640;

let context;

// Фоновые объекты
let bgImg;
const bgOffset = 0.5;
let currentBgX = 0;

let starsImg;
const starsOffset = 0.2;
let currentStarsX = 0;

// hero параметры
const hero = {
    x: boardWidth / 8,
    y: boardHeight / 2,
    width: 64,
    height: 45,
    image: './image/ufo.png',
};

let heroImg;

//stones параметры
let stoneArray = [];
let stoneWidth = 64; //width/height ratio = 384/3072 = 1/8
let stoneHeight = 64;
let stoneX = boardWidth;
let stoneY = 0;

let stoneImg;
let stoneCoolImg;
// let bottomStoneImg;

// const openingSpace = boardHeight / 4;

let gameOver = false;

// физика
const velocityX = -2;
let velocityY = 0;
const gravity = 0.4;

let score = 0;

let speedCorrect = 1;

/** при запуске */
const onloadHandler = () => {
    board = document.getElementById('board');

    boardHeight = document.documentElement.clientHeight;
    boardWidth = document.documentElement.clientWidth;

    if (boardWidth < 1000) {
        speedCorrect = 0.5;
    } else if (boardWidth < 500) {
        speedCorrect = 0.25;
    }

    // 4096 X 1360
    bgImg = new Image();
    bgImg.height = boardHeight;
    bgImg.width = Math.round((4096 * boardHeight) / 1360);
    bgImg.src = './image/spacebg.png';

    // 4096 X 1360
    starsImg = new Image();
    starsImg.height = boardHeight;
    starsImg.width = bgImg.width;
    starsImg.src = './image/starsbg.png';

    stoneX = boardWidth;

    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext('2d'); //used for drawing

    const bgImgLoadHandler = () => {
        context.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height);
    };
    bgImg.onload = bgImgLoadHandler;

    const starsImgLoadHandler = () => {
        context.drawImage(starsImg, 0, 0, bgImg.width, bgImg.height);
    };
    starsImg.onload = starsImgLoadHandler;

    heroImg = new Image();
    heroImg.src = hero.image;

    const heroImgLoadHandler = () => {
        context.drawImage(heroImg, hero.x, hero.y, hero.width, hero.height);
    };

    heroImg.onload = heroImgLoadHandler;

    stoneImg = new Image();
    stoneImg.src = './image/stone1.png';

    stoneCoolImg = new Image();
    stoneCoolImg.src = './image/stone2.png';

    // bottomStoneImg = new Image();
    // bottomStoneImg.src = './image/stone2.png';

    // обновляет экран одновременно с браузером, движение элементов
    requestAnimationFrame(update);
    setInterval(placeStones, 500); //every 1.5 seconds

    document.addEventListener('keydown', moveBird);
    board.addEventListener('touchstart', moveBird);
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

    context.clearRect(0, 0, board.width, board.height);

    currentBgX -= bgOffset;
    if (currentBgX + bgImg.width <= boardWidth) {
        currentBgX = boardWidth;
    }
    context.drawImage(bgImg, currentBgX, 0, bgImg.width, bgImg.height);

    currentStarsX -= starsOffset;
    if (currentStarsX + starsImg.width <= boardWidth) {
        currentStarsX = boardWidth;
    }
    context.drawImage(
        starsImg,
        currentStarsX,
        0,
        starsImg.width,
        starsImg.height
    );

    // jump
    velocityY += gravity;
    hero.y = Math.max(hero.y + velocityY, 0);
    context.drawImage(heroImg, hero.x, hero.y, hero.width, hero.height);

    if (hero.y > board.height) {
        gameOver = true;
    }

    // stones
    for (let i = 0; i < stoneArray.length; i++) {
        const stone = stoneArray[i];
        stone.x += velocityX * stone.speed * speedCorrect + velocityX;
        stone.img.style.transform = 'rotate(45deg)';

        context.drawImage(
            stone.img,
            stone.x,
            stone.y,
            stone.width,
            stone.height
        );

        if (!stone.passed && hero.x > stone.x + stone.width) {
            score += 1;
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
    // if else
    const currentStoneImg = Math.random() > 0.5 ? stoneImg : stoneCoolImg;

    const stoneSpeed = Math.random() * 10;
    // появление препятствий рандомно
    const randomStoneY = Math.random() * boardHeight - stoneHeight;
    stoneArray.push({
        img: currentStoneImg,
        x: stoneX,
        y:
            randomStoneY < stoneHeight
                ? (Math.random() * boardHeight) / 4
                : randomStoneY,
        width: stoneWidth - stoneSpeed,
        height: stoneHeight - stoneSpeed,
        passed: false,
        speed: stoneSpeed,
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
