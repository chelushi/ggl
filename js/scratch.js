class ScratchCard {
    constructor() {
        this.canvas = document.getElementById('scratchCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.rows = 4;
        this.cols = 5;
        this.cellWidth = 100;
        this.cellHeight = 80;
        this.padding = 10;
        
        // 设置中奖号码
        this.winningNumbers = [3, 6, 8, 16, 20, 66, 88, 99];
        
        // 设置奖励文字
        this.rewards = [
            '奶茶！！',
            '冰！！',
            '蛋糕！！',
            '糖葫芦！'
        ];
        
        // 设置奖励概率
        this.rewardProbabilities = [40, 25, 10, 25];
        
        // 设置中奖区域数量的概率
        this.winningAreaProbabilities = [35, 30, 15, 10, 6, 4];
        
        // 创建临时画布
        this.numberCanvas = document.createElement('canvas');
        this.numberCtx = this.numberCanvas.getContext('2d');
        
        this.scratchCanvas = document.createElement('canvas');
        this.scratchCtx = this.scratchCanvas.getContext('2d');
        
        // 创建奖品刮开层画布
        this.rewardCanvas = document.createElement('canvas');
        this.rewardCtx = this.rewardCanvas.getContext('2d');
        
        // 加载图案图片
        this.patternImages = [];
        this.rewardPatternImages = []; // 用于奖品刮开层的图案
        this.normalImages = []; // 用于非中奖区域的图片
        this.loadPatternImages();
    }

    // 加载图案图片
    loadPatternImages() {
        // 定义图案图片路径数组
        const patternPaths = [
            'images/pattern1.png',  // 主刮开层图案
        ];

        const rewardPatternPaths = [
            'images/reward_pattern1.png',  // 奖品刮开层图案1
            'images/reward_pattern2.jpg',  // 奖品刮开层图案2
            'images/reward_pattern3.jpg',  // 奖品刮开层图案3
            'images/reward_pattern4.jpg',  // 奖品刮开层图案4
            'images/reward_pattern5.jpg'   // 奖品刮开层图案5
        ];

        // 定义普通图片路径数组（至少20张）
        const normalImagePaths = [
            'images/normal1.png',
            'images/normal2.png',
            'images/normal3.jpg',
            'images/normal4.jpg',
            'images/normal5.jpg',
            'images/normal6.jpg',
            'images/normal7.jpg',
            'images/normal8.jpg',
            'images/normal9.jpg',
            'images/normal10.jpg',
            'images/normal11.jpg',
            'images/normal12.jpg',
            'images/normal13.jpg',
            'images/normal14.jpg',
            'images/normal15.jpg',
            'images/normal16.jpg',
            'images/normal17.jpg',
            'images/normal18.jpg',
            'images/normal19.jpg',
            'images/normal20.jpg'
        ];

        let loadedImages = 0;
        const totalImages = patternPaths.length + rewardPatternPaths.length + normalImagePaths.length;

        // 加载主刮开层图案
        patternPaths.forEach((path, index) => {
            const img = new Image();
            img.onload = () => {
                this.patternImages[index] = img;
                loadedImages++;
                
                if (loadedImages === totalImages) {
                    this.init();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load pattern image: ${path}`);
                loadedImages++;
                if (loadedImages === totalImages) {
                    this.init();
                }
            };
            img.src = path;
        });

        // 加载奖品刮开层图案
        rewardPatternPaths.forEach((path, index) => {
            const img = new Image();
            img.onload = () => {
                this.rewardPatternImages[index] = img;
                loadedImages++;
                
                if (loadedImages === totalImages) {
                    this.init();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load reward pattern image: ${path}`);
                loadedImages++;
                if (loadedImages === totalImages) {
                    this.init();
                }
            };
            img.src = path;
        });

        // 加载普通图片
        normalImagePaths.forEach((path, index) => {
            const img = new Image();
            img.onload = () => {
                this.normalImages[index] = img;
                loadedImages++;
                
                if (loadedImages === totalImages) {
                    this.init();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load normal image: ${path}`);
                loadedImages++;
                if (loadedImages === totalImages) {
                    this.init();
                }
            };
            img.src = path;
        });
    }

    // 随机打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 从数组中随机选择不重复的元素
    selectRandomUnique(array, count) {
        const shuffled = [...array];
        this.shuffleArray(shuffled);
        return shuffled.slice(0, count);
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.generateNewCard();
    }

    setupCanvas() {
        // 设置画布大小以适应新的布局
        this.canvas.width = this.cols * this.cellWidth + (this.cols + 1) * this.padding;
        this.canvas.height = this.rows * this.cellHeight + (this.rows + 1) * this.padding + 60;
        
        // 设置临时画布大小
        this.numberCanvas.width = this.canvas.width;
        this.numberCanvas.height = this.canvas.height;
        this.scratchCanvas.width = this.canvas.width;
        this.scratchCanvas.height = this.canvas.height;
        this.rewardCanvas.width = this.canvas.width;
        this.rewardCanvas.height = this.canvas.height;
    }

    setupEventListeners() {
        // 触摸事件
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // 鼠标事件
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseout', this.handleMouseUp.bind(this));

        // 按钮事件
        document.getElementById('newCard').addEventListener('click', () => this.generateNewCard());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareToWeChat());
    }

    generateNewCard() {
        // 清空所有画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.numberCtx.clearRect(0, 0, this.numberCanvas.width, this.numberCanvas.height);
        this.scratchCtx.clearRect(0, 0, this.scratchCanvas.width, this.scratchCanvas.height);
        this.rewardCtx.clearRect(0, 0, this.rewardCanvas.width, this.rewardCanvas.height);
        
        // 绘制背景
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.numberCtx.fillStyle = '#ffffff';
        this.numberCtx.fillRect(0, 0, this.numberCanvas.width, this.numberCanvas.height);
        this.scratchCtx.fillStyle = '#ffffff';
        this.scratchCtx.fillRect(0, 0, this.scratchCanvas.width, this.scratchCanvas.height);
        this.rewardCtx.fillStyle = '#ffffff';
        this.rewardCtx.fillRect(0, 0, this.rewardCanvas.width, this.rewardCanvas.height);
        
        // 生成中奖号码（从8个号码中随机选择一个）
        this.winningNumber = this.winningNumbers[Math.floor(Math.random() * this.winningNumbers.length)];
        
        // 绘制中奖号码
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 24px Microsoft YaHei';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`你好呀`, this.canvas.width / 2, 30);
        
        // 生成所有可用号码（0-100，除去中奖号码）
        const availableNumbers = Array.from({length: 101}, (_, i) => i)
            .filter(num => num !== this.winningNumber);
        
        // 随机打乱可用号码
        for (let i = availableNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
        }
        
        // 根据概率决定中奖区域数量（0-5个）
        const random = Math.random() * 100;
        let sum = 0;
        let winningAreaCount = 0;
        
        // 计算概率总和
        for (let i = 0; i < this.winningAreaProbabilities.length; i++) {
            sum += this.winningAreaProbabilities[i];
            if (random < sum) {
                winningAreaCount = i;
                break;
            }
        }
        
        // 确保至少有一个中奖区域
        if (winningAreaCount === 0) {
            winningAreaCount = 1;
        }
        
        // 生成中奖区域索引
        const winningAreaIndices = new Set();
        while (winningAreaIndices.size < winningAreaCount) {
            winningAreaIndices.add(Math.floor(Math.random() * (this.rows * this.cols)));
        }
        
        // 随机选择图片
        const selectedNormalImages = this.selectRandomUnique(this.normalImages, this.rows * this.cols - winningAreaCount);
        const selectedRewardPattern = this.rewardPatternImages[Math.floor(Math.random() * this.rewardPatternImages.length)];
        
        // 生成每个区域的数字和奖品
        this.cells = [];
        let availableIndex = 0;
        let normalImageIndex = 0;
        
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const areaIndex = row * this.cols + col;
                let number, reward, image;
                
                if (winningAreaIndices.has(areaIndex)) {
                    // 中奖区域：使用中奖号码和随机选择的中奖图片
                    number = this.winningNumber;
                    reward = this.selectReward();
                    image = selectedRewardPattern;
                } else {
                    // 非中奖区域：从可用号码中选择一个未使用的号码和随机选择的普通图片
                    number = availableNumbers[availableIndex++];
                    reward = null;
                    image = selectedNormalImages[normalImageIndex++];
                }
                
                this.cells[row][col] = {
                    number: number,
                    reward: reward,
                    image: image,
                    isScratched: false,
                    scratchedArea: 0
                };
            }
        }
        
        // 绘制所有区域
        this.drawAllCells();
    }

    drawAllCells() {
        // 清空所有画布
        this.numberCtx.clearRect(0, 0, this.numberCanvas.width, this.numberCanvas.height);
        this.scratchCtx.clearRect(0, 0, this.scratchCanvas.width, this.scratchCanvas.height);
        this.rewardCtx.clearRect(0, 0, this.rewardCanvas.width, this.rewardCanvas.height);
        
        // 绘制中奖号码（在数字层）
        this.numberCtx.fillStyle = '#000000';
        this.numberCtx.font = 'bold 24px Microsoft YaHei';
        this.numberCtx.textAlign = 'center';
        this.numberCtx.textBaseline = 'middle';
        this.numberCtx.fillText(`你好呀！！！`, this.canvas.width / 2, 30);
        
        // 在临时画布上绘制数字和图案
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = col * this.cellWidth + (col + 1) * this.padding;
                const y = row * this.cellHeight + (row + 1) * this.padding + 60;
                
                // 绘制区域背景
                this.numberCtx.fillStyle = '#f0f0f0';
                this.numberCtx.fillRect(x, y, this.cellWidth, this.cellHeight);
                
                // 绘制边框
                this.numberCtx.strokeStyle = '#cccccc';
                this.numberCtx.strokeRect(x, y, this.cellWidth, this.cellHeight);
                
                const cell = this.cells[row][col];
                
                if (cell.number === this.winningNumber) {
                    // 中奖区域：绘制中奖图片
                    if (cell.image) {
                        this.numberCtx.drawImage(cell.image, x, y, this.cellWidth, this.cellHeight);
                    }
                    
                    // 绘制奖品刮开层
                    if (cell.image) {
                        this.rewardCtx.drawImage(cell.image, x, y, this.cellWidth, this.cellHeight);
                    }
                    
                    // 绘制奖品文字（在数字层，被刮开层覆盖）
                    this.numberCtx.fillStyle = '#ff0000';
                    this.numberCtx.font = 'bold 24px Microsoft YaHei';
                    this.numberCtx.textAlign = 'center';
                    this.numberCtx.textBaseline = 'middle';
                    this.numberCtx.fillText(cell.reward, x + this.cellWidth / 2, y + this.cellHeight / 2);
                } else {
                    // 非中奖区域：绘制普通图片
                    if (cell.image) {
                        this.numberCtx.drawImage(cell.image, x, y, this.cellWidth, this.cellHeight);
                    }
                }
            }
        }
        
        // 绘制整个刮刮层（使用一张大图）
        const pattern = this.patternImages[0];
        if (pattern) {
            // 创建图案
            const patternCanvas = document.createElement('canvas');
            patternCanvas.width = this.canvas.width;
            patternCanvas.height = this.canvas.height;
            const patternCtx = patternCanvas.getContext('2d');
            
            // 绘制图片并平铺
            for (let i = 0; i < this.canvas.width; i += pattern.width) {
                for (let j = 0; j < this.canvas.height; j += pattern.height) {
                    patternCtx.drawImage(pattern, i, j);
                }
            }
            
            // 将图案应用到刮刮层
            this.scratchCtx.drawImage(patternCanvas, 0, 0);
        }
        
        // 更新主画布
        this.updateMainCanvas();
    }

    updateMainCanvas() {
        // 清空主画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制数字层
        this.ctx.drawImage(this.numberCanvas, 0, 0);
        
        // 绘制奖品刮开层
        this.ctx.drawImage(this.rewardCanvas, 0, 0);
        
        // 绘制主刮刮层
        this.ctx.drawImage(this.scratchCanvas, 0, 0);
    }

    getCellAtPosition(x, y) {
        // 检查是否在中奖号码区域
        if (y < 60) {
            return { row: -1, col: -1, isHeader: true }; // 特殊标记中奖号码区域
        }
        
        // 调整y坐标，减去中奖号码区域的高度
        y -= 60;
        
        // 计算行列
        const row = Math.floor(y / (this.cellHeight + this.padding));
        const col = Math.floor(x / (this.cellWidth + this.padding));
        
        // 检查是否在有效范围内
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return { row, col, isHeader: false };
        }
        return null;
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.isDrawing = true;
        this.lastX = touch.clientX - rect.left;
        this.lastY = touch.clientY - rect.top;
        this.scratch(this.lastX, this.lastY);
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing) return;
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        
        this.scratchLine(this.lastX, this.lastY, currentX, currentY);
        this.lastX = currentX;
        this.lastY = currentY;
    }

    handleTouchEnd() {
        this.isDrawing = false;
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.isDrawing = true;
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        this.scratch(this.lastX, this.lastY);
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        this.scratchLine(this.lastX, this.lastY, currentX, currentY);
        this.lastX = currentX;
        this.lastY = currentY;
    }

    handleMouseUp() {
        this.isDrawing = false;
    }

    scratch(x, y) {
        const cell = this.getCellAtPosition(x, y);
        if (cell) {
            // 检查是否在中奖区域
            if (!cell.isHeader && this.cells[cell.row][cell.col].number === this.winningNumber) {
                // 先刮开主刮开层
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.arc(x, y, 15, 0, Math.PI * 2);
                this.scratchCtx.fill();
                this.scratchCtx.globalCompositeOperation = 'source-over';
                
                // 更新刮开区域
                const cellData = this.scratchCtx.getImageData(
                    cell.col * this.cellWidth + (cell.col + 1) * this.padding,
                    cell.row * this.cellHeight + (cell.row + 1) * this.padding + 60,
                    this.cellWidth,
                    this.cellHeight
                );
                
                let scratchedPixels = 0;
                for (let i = 3; i < cellData.data.length; i += 4) {
                    if (cellData.data[i] === 0) scratchedPixels++;
                }
                
                this.cells[cell.row][cell.col].scratchedArea = scratchedPixels / (this.cellWidth * this.cellHeight);
                
                // 如果主刮开层刮开足够多，开始刮开奖品刮开层
                if (this.cells[cell.row][cell.col].scratchedArea >= 0.8) {
                    this.rewardCtx.globalCompositeOperation = 'destination-out';
                    this.rewardCtx.beginPath();
                    this.rewardCtx.arc(x, y, 15, 0, Math.PI * 2);
                    this.rewardCtx.fill();
                    this.rewardCtx.globalCompositeOperation = 'source-over';
                }
            } else {
                // 非中奖区域或中奖号码区域：正常刮开
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.arc(x, y, 15, 0, Math.PI * 2);
                this.scratchCtx.fill();
                this.scratchCtx.globalCompositeOperation = 'source-over';
                
                if (!cell.isHeader) {
                    // 更新刮开区域
                    const cellData = this.scratchCtx.getImageData(
                        cell.col * this.cellWidth + (cell.col + 1) * this.padding,
                        cell.row * this.cellHeight + (cell.row + 1) * this.padding + 60,
                        this.cellWidth,
                        this.cellHeight
                    );
                    
                    let scratchedPixels = 0;
                    for (let i = 3; i < cellData.data.length; i += 4) {
                        if (cellData.data[i] === 0) scratchedPixels++;
                    }
                    
                    this.cells[cell.row][cell.col].scratchedArea = scratchedPixels / (this.cellWidth * this.cellHeight);
                }
            }
            
            this.updateMainCanvas();
        }
    }

    scratchLine(fromX, fromY, toX, toY) {
        const cell = this.getCellAtPosition(fromX, fromY);
        if (cell) {
            // 检查是否在中奖区域
            if (!cell.isHeader && this.cells[cell.row][cell.col].number === this.winningNumber) {
                // 先刮开主刮开层
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.moveTo(fromX, fromY);
                this.scratchCtx.lineTo(toX, toY);
                this.scratchCtx.lineWidth = 30;
                this.scratchCtx.lineCap = 'round';
                this.scratchCtx.lineJoin = 'round';
                this.scratchCtx.stroke();
                this.scratchCtx.globalCompositeOperation = 'source-over';
                
                // 更新刮开区域
                const cellData = this.scratchCtx.getImageData(
                    cell.col * this.cellWidth + (cell.col + 1) * this.padding,
                    cell.row * this.cellHeight + (cell.row + 1) * this.padding + 60,
                    this.cellWidth,
                    this.cellHeight
                );
                
                let scratchedPixels = 0;
                for (let i = 3; i < cellData.data.length; i += 4) {
                    if (cellData.data[i] === 0) scratchedPixels++;
                }
                
                this.cells[cell.row][cell.col].scratchedArea = scratchedPixels / (this.cellWidth * this.cellHeight);
                
                // 如果主刮开层刮开足够多，开始刮开奖品刮开层
                if (this.cells[cell.row][cell.col].scratchedArea >= 0.8) {
                    this.rewardCtx.globalCompositeOperation = 'destination-out';
                    this.rewardCtx.beginPath();
                    this.rewardCtx.moveTo(fromX, fromY);
                    this.rewardCtx.lineTo(toX, toY);
                    this.rewardCtx.lineWidth = 30;
                    this.rewardCtx.lineCap = 'round';
                    this.rewardCtx.lineJoin = 'round';
                    this.rewardCtx.stroke();
                    this.rewardCtx.globalCompositeOperation = 'source-over';
                }
            } else {
                // 非中奖区域或中奖号码区域：正常刮开
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.moveTo(fromX, fromY);
                this.scratchCtx.lineTo(toX, toY);
                this.scratchCtx.lineWidth = 30;
                this.scratchCtx.lineCap = 'round';
                this.scratchCtx.lineJoin = 'round';
                this.scratchCtx.stroke();
                this.scratchCtx.globalCompositeOperation = 'source-over';
                
                if (!cell.isHeader) {
                    // 更新刮开区域
                    const cellData = this.scratchCtx.getImageData(
                        cell.col * this.cellWidth + (cell.col + 1) * this.padding,
                        cell.row * this.cellHeight + (cell.row + 1) * this.padding + 60,
                        this.cellWidth,
                        this.cellHeight
                    );
                    
                    let scratchedPixels = 0;
                    for (let i = 3; i < cellData.data.length; i += 4) {
                        if (cellData.data[i] === 0) scratchedPixels++;
                    }
                    
                    this.cells[cell.row][cell.col].scratchedArea = scratchedPixels / (this.cellWidth * this.cellHeight);
                }
            }
            
            this.updateMainCanvas();
        }
    }

    shareToWeChat() {
        // 配置微信分享参数
        wx.ready(function() {
            // 分享给朋友
            wx.updateAppMessageShareData({
                title: '来玩刮刮乐！',
                desc: '试试你的运气，看看能刮出什么大奖！',
                link: window.location.href,
                imgUrl: 'https://your-domain.com/share-image.jpg', // 替换为你的分享图片URL
                success: function() {
                    alert('分享成功！');
                },
                fail: function(res) {
                    console.error('分享失败', res);
                    alert('分享失败，请重试');
                }
            });

            // 分享到朋友圈
            wx.updateTimelineShareData({
                title: '来玩刮刮乐！',
                desc: '试试你的运气，看看能刮出什么大奖！',
                link: window.location.href,
                imgUrl: 'https://your-domain.com/share-image.jpg', // 替换为你的分享图片URL
                success: function() {
                    alert('分享成功！');
                },
                fail: function(res) {
                    console.error('分享失败', res);
                    alert('分享失败，请重试');
                }
            });
        });
    }

    // 添加设置中奖区域概率的方法
    setWinningAreaProbabilities(probabilities) {
        // 验证概率数组
        if (!Array.isArray(probabilities) || probabilities.length !== 6) {
            console.error('概率数组必须是长度为6的数组');
            return false;
        }

        // 验证概率值是否在0-100之间
        if (!probabilities.every(p => p >= 0 && p <= 100)) {
            console.error('概率值必须在0-100之间');
            return false;
        }

        // 验证概率总和是否为100
        const sum = probabilities.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 100) > 0.01) { // 使用0.01作为浮点数比较的容差
            console.error('概率总和必须为100');
            return false;
        }

        // 如果0个中奖区域的概率不为0，自动调整其他概率
        if (probabilities[0] > 0) {
            const total = probabilities.slice(1).reduce((a, b) => a + b, 0);
            const ratio = (100 - probabilities[0]) / total;
            probabilities = probabilities.map((p, i) => {
                if (i === 0) return p;
                return Math.round(p * ratio);
            });
        }

        this.winningAreaProbabilities = probabilities;
        return true;
    }

    // 添加设置奖励概率的方法
    setRewardProbabilities(probabilities) {
        // 验证概率数组
        if (!Array.isArray(probabilities) || probabilities.length !== this.rewards.length) {
            console.error('概率数组长度必须与奖励数量相同');
            return false;
        }

        // 验证概率值是否在0-100之间
        if (!probabilities.every(p => p >= 0 && p <= 100)) {
            console.error('概率值必须在0-100之间');
            return false;
        }

        // 验证概率总和是否为100
        const sum = probabilities.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 100) > 0.01) { // 使用0.01作为浮点数比较的容差
            console.error('概率总和必须为100');
            return false;
        }

        this.rewardProbabilities = probabilities;
        return true;
    }

    // 根据概率选择奖励
    selectReward() {
        const random = Math.random() * 100;
        let sum = 0;
        
        for (let i = 0; i < this.rewardProbabilities.length; i++) {
            sum += this.rewardProbabilities[i];
            if (random < sum) {
                return this.rewards[i];
            }
        }
        
        // 如果随机数大于所有概率之和，返回最后一个奖励
        return this.rewards[this.rewards.length - 1];
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    new ScratchCard();
}); 