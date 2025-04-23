// 游戏常量
const GRID_SIZE = 20; // 网格大小
const GRID_COUNT = 20; // 网格数量
const GAME_SPEED = 150; // 游戏速度(毫秒)

// 游戏变量
let canvas, ctx;
let snake, food;
let direction, nextDirection;
let gameInterval;
let score, highScore;
let isPaused = false;
let isGameOver = false;

// DOM元素
let scoreElement, highScoreElement, finalScoreElement;
let gameOverElement, startButton, pauseButton, restartButton;

// 初始化游戏
function init() {
    // 获取Canvas和上下文
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // 获取DOM元素
    scoreElement = document.getElementById('score');
    highScoreElement = document.getElementById('high-score');
    finalScoreElement = document.getElementById('final-score');
    gameOverElement = document.getElementById('game-over');
    startButton = document.getElementById('start-button');
    pauseButton = document.getElementById('pause-button');
    restartButton = document.getElementById('restart-button');

    // 添加事件监听器
    document.addEventListener('keydown', handleKeyPress);
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    restartButton.addEventListener('click', startGame);

    // 加载最高分
    highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;

    // 初始化游戏状态
    resetGame();
}

// 重置游戏状态
function resetGame() {
    // 初始化蛇
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];

    // 初始化方向 (右)
    direction = 'right';
    nextDirection = 'right';

    // 生成食物
    generateFood();

    // 重置分数
    score = 0;
    scoreElement.textContent = score;

    // 重置游戏状态
    isGameOver = false;
    gameOverElement.style.display = 'none';
}

// 开始游戏
function startGame() {
    if (isGameOver || !gameInterval) {
        resetGame();
        gameInterval = setInterval(gameLoop, GAME_SPEED);
        startButton.innerHTML = '<i class="fas fa-redo"></i>重新开始';
        isPaused = false;
    } else {
        // 如果游戏已经在运行，则重新开始
        clearInterval(gameInterval);
        resetGame();
        gameInterval = setInterval(gameLoop, GAME_SPEED);
        isPaused = false;
    }
}

// 暂停/继续游戏
function togglePause() {
    if (isGameOver) return;

    if (isPaused) {
        gameInterval = setInterval(gameLoop, GAME_SPEED);
        pauseButton.innerHTML = '<i class="fas fa-pause"></i>暂停';
        isPaused = false;
    } else {
        clearInterval(gameInterval);
        pauseButton.innerHTML = '<i class="fas fa-play"></i>继续';
        isPaused = true;
    }
}

// 游戏主循环
function gameLoop() {
    update();
    draw();
}

// 更新游戏状态
function update() {
    // 更新方向
    direction = nextDirection;

    // 获取蛇头
    const head = {...snake[0]};

    // 根据方向移动蛇头
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }

    // 检查游戏结束条件
    if (isCollision(head)) {
        gameOver();
        return;
    }

    // 将新头部添加到蛇身
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;

        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        // 生成新食物
        generateFood();
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制网格背景
    drawGrid();

    // 绘制蛇
    drawSnake();

    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    // 绘制背景图案
    for (let i = 0; i < GRID_COUNT; i++) {
        for (let j = 0; j < GRID_COUNT; j++) {
            // 创建棋盘格效果
            if ((i + j) % 2 === 0) {
                ctx.fillStyle = '#1a1d24';
            } else {
                ctx.fillStyle = '#232931';
            }
            ctx.fillRect(i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
    }

    // 绘制边界线
    ctx.strokeStyle = '#393e46';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// 绘制蛇
function drawSnake() {
    // 首先绘制蛇身，这样蛇头会在上面
    for (let i = snake.length - 1; i >= 0; i--) {
        const segment = snake[i];

        // 准备绘制圆角矩形
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        const size = GRID_SIZE - 2; // 稍微小一点，留出间隙
        const radius = GRID_SIZE / 4; // 圆角半径

        // 设置颜色
        if (i === 0) {
            // 蛇头使用CSS变量中的颜色
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--snake-head-color').trim();
        } else {
            // 蛇身使用渐变色
            const baseColor = getComputedStyle(document.documentElement).getPropertyValue('--snake-body-color').trim();
            // 将颜色转换为RGB格式以进行操作
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);

            // 根据位置调整颜色亮度
            const brightness = Math.max(0.7, 1 - (i * 0.03));
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${brightness})`;
        }

        // 绘制圆角矩形
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + size - radius, y);
        ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
        ctx.lineTo(x + size, y + size - radius);
        ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        ctx.lineTo(x + radius, y + size);
        ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        // 添加光滑效果
        if (i > 0) { // 只给蛇身添加光滑
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/3, size/4, 0, Math.PI * 2);
            ctx.fill();
        }

        // 为蛇头添加眼睛
        if (i === 0) {
            drawSnakeEyes(segment);
        }
    }
}

// 绘制蛇眼睛
function drawSnakeEyes(head) {
    const eyeSize = GRID_SIZE / 4.5;
    const eyeOffset = GRID_SIZE / 3;
    const x = head.x * GRID_SIZE;
    const y = head.y * GRID_SIZE;
    const size = GRID_SIZE - 2;

    // 定义眼睛位置
    let leftEyeX, leftEyeY, rightEyeX, rightEyeY;

    // 根据方向设置眼睛位置
    switch(direction) {
        case 'up':
            leftEyeX = x + size/3;
            leftEyeY = y + size/3;
            rightEyeX = x + size - size/3;
            rightEyeY = y + size/3;
            break;
        case 'down':
            leftEyeX = x + size/3;
            leftEyeY = y + size - size/3;
            rightEyeX = x + size - size/3;
            rightEyeY = y + size - size/3;
            break;
        case 'left':
            leftEyeX = x + size/3;
            leftEyeY = y + size/3;
            rightEyeX = x + size/3;
            rightEyeY = y + size - size/3;
            break;
        case 'right':
            leftEyeX = x + size - size/3;
            leftEyeY = y + size/3;
            rightEyeX = x + size - size/3;
            rightEyeY = y + size - size/3;
            break;
    }

    // 绘制眼睛外圈(白色)
    ctx.fillStyle = 'white';

    // 左眼
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // 右眼
    ctx.beginPath();
    ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // 绘制眼睛阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // 绘制瞳孔(黑色)
    ctx.fillStyle = '#222';

    // 计算瞳孔偏移
    let pupilOffsetX = 0;
    let pupilOffsetY = 0;
    const pupilOffset = eyeSize / 4;

    switch(direction) {
        case 'up':
            pupilOffsetY = -pupilOffset;
            break;
        case 'down':
            pupilOffsetY = pupilOffset;
            break;
        case 'left':
            pupilOffsetX = -pupilOffset;
            break;
        case 'right':
            pupilOffsetX = pupilOffset;
            break;
    }

    // 左瞳孔
    ctx.beginPath();
    ctx.arc(
        leftEyeX + pupilOffsetX,
        leftEyeY + pupilOffsetY,
        eyeSize / 2,
        0, Math.PI * 2
    );
    ctx.fill();

    // 右瞳孔
    ctx.beginPath();
    ctx.arc(
        rightEyeX + pupilOffsetX,
        rightEyeY + pupilOffsetY,
        eyeSize / 2,
        0, Math.PI * 2
    );
    ctx.fill();

    // 添加眼睛高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    // 左眼高光
    ctx.beginPath();
    ctx.arc(
        leftEyeX - pupilOffsetX/2,
        leftEyeY - pupilOffsetY/2,
        eyeSize / 6,
        0, Math.PI * 2
    );
    ctx.fill();

    // 右眼高光
    ctx.beginPath();
    ctx.arc(
        rightEyeX - pupilOffsetX/2,
        rightEyeY - pupilOffsetY/2,
        eyeSize / 6,
        0, Math.PI * 2
    );
    ctx.fill();
}

// 绘制食物
function drawFood() {
    const x = food.x * GRID_SIZE;
    const y = food.y * GRID_SIZE;
    const centerX = x + GRID_SIZE / 2;
    const centerY = y + GRID_SIZE / 2;
    const radius = GRID_SIZE / 2 - 2;

    // 使用CSS变量中的食物颜色
    const foodColor = getComputedStyle(document.documentElement).getPropertyValue('--food-color').trim();
    const foodHighlight = getComputedStyle(document.documentElement).getPropertyValue('--food-highlight').trim();

    // 创建彩色光晕效果
    const gradient = ctx.createRadialGradient(
        centerX - radius/3, centerY - radius/3, radius/10,
        centerX, centerY, radius
    );
    gradient.addColorStop(0, foodHighlight);
    gradient.addColorStop(1, foodColor);

    // 绘制食物主体
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // 添加光晕效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(
        centerX - radius / 3,
        centerY - radius / 3,
        radius / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // 添加食物边框
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 添加食物脉动效果
    const pulseSize = radius * (1 + Math.sin(Date.now() / 200) * 0.05);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.stroke();
}

// 生成食物
function generateFood() {
    // 创建一个临时食物位置
    let newFood;
    let isValidPosition;

    // 循环直到找到一个有效位置
    do {
        isValidPosition = true;
        newFood = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };

        // 检查食物是否与蛇身重叠
        for (const segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                isValidPosition = false;
                break;
            }
        }
    } while (!isValidPosition);

    food = newFood;
}

// 检查碰撞
function isCollision(position) {
    // 检查墙壁碰撞
    if (
        position.x < 0 ||
        position.y < 0 ||
        position.x >= GRID_COUNT ||
        position.y >= GRID_COUNT
    ) {
        return true;
    }

    // 检查自身碰撞 (从第1个开始，因为第0个是头部自己)
    for (let i = 1; i < snake.length; i++) {
        if (position.x === snake[i].x && position.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// 处理按键事件
function handleKeyPress(event) {
    // 防止方向键滚动页面
    if ([37, 38, 39, 40, 32].includes(event.keyCode)) {
        event.preventDefault();
    }

    // 空格键暂停/继续
    if (event.keyCode === 32) { // 空格键
        togglePause();
        return;
    }

    // 如果游戏暂停或结束，不处理方向键
    if (isPaused || isGameOver) return;

    // 根据按键设置下一个方向
    switch(event.keyCode) {
        case 38: // 上箭头
        case 87: // W键
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        case 40: // 下箭头
        case 83: // S键
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        case 37: // 左箭头
        case 65: // A键
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        case 39: // 右箭头
        case 68: // D键
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
    }
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    isGameOver = true;

    // 显示游戏结束界面
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';

    // 添加动画效果
    gameOverElement.style.opacity = '0';
    gameOverElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
    gameOverElement.style.transition = 'opacity 0.3s, transform 0.3s';

    // 使用setTimeout确保过渡效果生效
    setTimeout(() => {
        gameOverElement.style.opacity = '1';
        gameOverElement.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 50);
}

// 当页面加载完成时初始化游戏
window.addEventListener('load', init);