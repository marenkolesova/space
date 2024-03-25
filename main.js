// Элемент для инициализации canvas
let board;
let boardWidth = 360;
let boardHeight = 640;

let context;

// Все фоны одинаковых размеров, поэтому достаточно одной переменной
let bgImgWidth;

// Фоновые объекты
// Планеты
let bgImgArray = [];
let bgImg;
const bgOffset = 5;
let setBgImgQueue;

// Звезды
let starsImgArray = [];
let starsImg;
const starsOffset = 3;
let setStarsQueue;

// hero параметры
const hero = {
    x: boardWidth / 8,
    y: boardHeight / 2,
    width: 64,
    height: 45,
    image: './image/ufo.png',
};

let heroImg;

// stones параметры
let stoneArray = [];
let stoneWidth = 64; //width/height ratio = 384/3072 = 1/8
let stoneHeight = 64;

let stoneImg;
let stoneCoolImg;

// Флаг окончания игры
let gameOver = false;

// физика
const velocityX = -2;
let velocityY = 0;
const gravity = 0.4;

let score = 0;

let speedCorrect = 1;

/** Инициализация работы с фонами */
const initBackgrounds = () => {
    // Пропорция для фонов
    bgImgWidth = Math.round((4096 * boardHeight) / 1360);

    // 4096 X 1360
    starsImg = new Image();
    starsImg.src = './image/starsbg.png';

    const starsImgLoadHandler = () => {
        setStarsQueue = setBackgroundQueue(starsImgArray, starsImg);
        setStarsQueue(0);
    };
    starsImg.onload = starsImgLoadHandler;

    // 4096 X 1360
    bgImg = new Image();
    bgImg.src = './image/spacebg.png';

    const bgImgLoadHandler = () => {
        setBgImgQueue = setBackgroundQueue(bgImgArray, bgImg);
        setBgImgQueue(boardWidth);
    };
    bgImg.onload = bgImgLoadHandler;
};

/** Инициализация игрового поля */
const initBoardSize = () => {
    board = document.getElementById('board');

    boardHeight = document.documentElement.clientHeight;
    boardWidth = document.documentElement.clientWidth;

    board.height = boardHeight;
    board.width = boardWidth;

    if (boardWidth < 1000) {
        speedCorrect = 0.5;
    } else if (boardWidth < 500) {
        speedCorrect = 0.25;
    }
};

/** Инициализация препятствий и тарелки */
const initGameObjects = () => {
    context = board.getContext('2d');

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
};

/** Обработка изменения размеров экрана */
const resizeHandler = () => {
    initBoardSize();

    // Пропорция для фонов
    bgImgWidth = Math.round((4096 * boardHeight) / 1360);

    bgImgArray.forEach((el) => {
        el.height = boardHeight;
        el.width = bgImgWidth;
    });

    starsImgArray.forEach((el) => {
        el.height = boardHeight;
        el.width = bgImgWidth;
    });
};

/** Запуск игры */
const onloadHandler = () => {
    initBoardSize();
    initBackgrounds();
    initGameObjects();

    // Движение тарелки по нажатию клавиатуры
    document.addEventListener('keydown', moveHero);
    // Движение тарелки по нажатию мыши
    document.addEventListener('mousedown', moveHero);
    // Движение тарелки по касанию экрана
    board.addEventListener('touchstart', moveHero);

    // Пересчет пропорций при изменении размера экрана
    window.addEventListener('resize', resizeHandler);

    // обновляет экран одновременно с браузером, движение элементов
    requestAnimationFrame(update);

    // Добавляем препятствие каждые полсекунды
    setInterval(placeStones, 500);
};

// Новая игра
const restart = () => {
    score = 0;
    hero.y = boardHeight / 2;
    stoneArray = [];
    gameOver = false;
};

// Взлет
const moveHero = () => {
    velocityY = -6;

    if (gameOver) {
        restart();
    }
};

// Счет
const displayScore = () => {
    context.fillStyle = 'white';
    context.font = '45px sans-serif';
    context.fillText(score, 5, 45);
};

/** Обновление экрана */
const update = () => {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Отрисовка фонов
    setBgImgQueue && setBgImgQueue();
    for (let i = 0; i < bgImgArray.length; i++) {
        const bg = bgImgArray[i];
        bg.x -= bgOffset;

        context.drawImage(bg.img, bg.x, 0, bg.width, bg.height);
    }
    setStarsQueue && setStarsQueue();
    for (let i = 0; i < starsImgArray.length; i++) {
        const stars = starsImgArray[i];
        stars.x -= starsOffset;

        context.drawImage(stars.img, stars.x, 0, stars.width, stars.height);
    }

    // Отрисовка препятствий
    for (let i = 0; i < stoneArray.length; i++) {
        const stone = stoneArray[i];
        stone.x += velocityX * stone.speed * speedCorrect + velocityX;

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

    // Физика прыжка, отрисовка тарелки
    velocityY += gravity;
    hero.y = Math.max(hero.y + velocityY, 0);
    context.drawImage(heroImg, hero.x, hero.y, hero.width, hero.height);

    // Вылет за пределы низа экрана
    if (hero.y > board.height) {
        gameOver = true;
    }

    // Обновление счета
    displayScore();
};

/** Очередь фонов */
const setBackgroundQueue = (bgArray, img) => {
    const resultFunction = (startX) => {
        // удаляем пролетевший кусок фона
        if (bgArray.length === 2) {
            const firstBg = bgArray[0];

            if (firstBg.x < -bgImgWidth) {
                bgArray.splice(0, 1);
            }
        }

        if (bgArray.length === 1) {
            const currentBg = bgArray[0];
            // Добавляем продолжение фона
            if (currentBg.x > -boardWidth) {
                bgArray.push({
                    img: img,
                    x: currentBg.x + bgImgWidth,
                    y: 0,
                    width: bgImgWidth,
                    height: boardHeight,
                });
            }
        } else if (startX !== undefined) {
            // Добавляем стартовый фон
            bgArray.push({
                img: img,
                x: startX,
                y: 0,
                width: bgImgWidth,
                height: boardHeight,
            });
        }
    };

    return resultFunction;
};

/** Добавление препятствий */
const placeStones = () => {
    if (gameOver) {
        return;
    }
    const currentStoneImg = Math.random() > 0.5 ? stoneImg : stoneCoolImg;

    const stoneSpeed = Math.random() * 10;
    // появление препятствий рандомно
    const randomStoneY = Math.random() * boardHeight - stoneHeight;

    // удаляем пролетевшие камни
    stoneArray = stoneArray.filter((o) => o.x > -stoneWidth);

    stoneArray.push({
        img: currentStoneImg,
        x: boardWidth,
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

// Ловим столкновение
const detectCollision = (currentHero, stone) => {
    return (
        currentHero.x < stone.x + stone.width &&
        currentHero.x + currentHero.width > stone.x &&
        currentHero.y < stone.y + stone.height &&
        currentHero.y + currentHero.height > stone.y
    );
};

// Запускаем игру после срабатывания события загрузки окна
window.onload = onloadHandler;
