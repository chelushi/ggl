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
        
        // 添加动画相关属性
        this.animationFrame = null;
        this.scratchEffect = {
            radius: 15,
            lineWidth: 30,
            opacity: 0.8
        };
        
        // 设置中奖号码
        this.winningNumbers = [3, 6, 8, 16, 20, 66, 88, 99];
        
        // 设置奖励文字
        this.rewards = [
            '奶茶！',
            '冰！！',
            '蛋糕！',
            '糖葫芦'
        ];
        
        // 设置奖励概率
        this.rewardProbabilities = [40, 25, 10, 25];
        
        // 设置中奖区域数量的概率
        this.winningAreaProbabilities = [35, 35, 12, 8, 6, 4];
        // this.winningAreaProbabilities = [100, 0, 0, 0, 0, 0];

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

        // 修改画布尺寸，为右侧区域留出空间
        this.rightAreaWidth = 100; // 右侧区域宽度
        this.canvas.width = this.cols * this.cellWidth + (this.cols + 1) * this.padding + this.rightAreaWidth;

        // 添加右侧区域刮开状态
        this.rightAreaScratched = false;
        this.rightAreaScratchedArea = 0;
    }

    // 加载图案图片
    loadPatternImages() {
        // 定义图案图片路径数组
        const rewardPatternPaths = [
            'images/reward_pattern1.jpg',  // 奖品刮开层图案1
            'images/reward_pattern2.jpg',  // 奖品刮开层图案2
            'images/reward_pattern3.jpg',  // 奖品刮开层图案3
            'images/reward_pattern4.jpg',  // 奖品刮开层图案4
            'images/reward_pattern5.jpg',  // 奖品刮开层图案5
            'images/reward_pattern6.jpg',  // 奖品刮开层图案6
            'images/reward_pattern7.jpg',  // 奖品刮开层图案7
            'images/reward_pattern8.jpg',  // 奖品刮开层图案8
            'images/reward_pattern9.jpg',  // 奖品刮开层图案9
        ];

        // 定义普通图片路径数组（至少20张）
        const normalImagePaths = [
            'images/normal1.png',
            'images/normal2.png',
            'images/normal3.png',
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
            'images/normal20.jpg',
            'images/normal21.jpg',
            'images/normal22.jpg',
            'images/normal23.jpg',
            'images/normal24.jpg',
            'images/normal25.jpg',
            'images/normal26.jpg',
            'images/normal27.jpg',
            'images/normal28.jpg',
            'images/normal29.jpg',
            'images/normal30.jpg',
            'images/normal31.jpg',
            'images/normal32.jpg',
            'images/normal33.jpg',
            'images/normal34.jpg',
            'images/normal35.jpg',
            'images/normal36.jpg',
            'images/normal37.jpg'
        ];

        let loadedImages = 0;
        const totalImages = rewardPatternPaths.length + normalImagePaths.length;

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
        this.canvas.width = this.cols * this.cellWidth + (this.cols + 1) * this.padding + this.rightAreaWidth;
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
        // 添加淡出效果
        this.canvas.style.opacity = '0';
        
        setTimeout(() => {
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
            this.ctx.fillText(`你好呀！！！HwH`, this.canvas.width / 2, 30);
            
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
            
            // 生成中奖区域索引
            const winningAreaIndices = new Set();
            while (winningAreaIndices.size < winningAreaCount) {
                winningAreaIndices.add(Math.floor(Math.random() * (this.rows * this.cols)));
            }
            
            // 随机选择图片
            const selectedNormalImages = this.selectRandomUnique(this.normalImages, this.rows * this.cols - winningAreaCount);
            const selectedRewardPatterns = this.selectRandomUnique(this.rewardPatternImages, winningAreaCount);
            
            // 生成每个区域的数字和奖品
            this.cells = [];
            let availableIndex = 0;
            let normalImageIndex = 0;
            let rewardPatternIndex = 0;
            
            for (let row = 0; row < this.rows; row++) {
                this.cells[row] = [];
                for (let col = 0; col < this.cols; col++) {
                    const areaIndex = row * this.cols + col;
                    let number, reward, image;
                    
                    if (winningAreaIndices.has(areaIndex)) {
                        // 中奖区域：使用中奖号码和随机选择的中奖图片
                        number = this.winningNumber;
                        reward = this.selectReward();
                        image = selectedRewardPatterns[rewardPatternIndex++];
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
            
            // 添加淡入效果
            this.canvas.style.opacity = '1';
        }, 500);
    }

    drawAllCells() {
        // 清空所有画布
        this.numberCtx.clearRect(0, 0, this.numberCanvas.width, this.numberCanvas.height);
        this.scratchCtx.clearRect(0, 0, this.scratchCanvas.width, this.scratchCanvas.height);
        this.rewardCtx.clearRect(0, 0, this.rewardCanvas.width, this.rewardCanvas.height);
        
        // 绘制中奖号码（在数字层）
        this.numberCtx.fillStyle = '#000000';
        this.numberCtx.font = 'bold 28px Microsoft YaHei';
        this.numberCtx.textAlign = 'center';
        this.numberCtx.textBaseline = 'middle';
        this.numberCtx.fillText(`点开 抽我`, this.canvas.width / 2, 30);
        
        // 绘制右侧区域背景
        const rightAreaX = this.cols * this.cellWidth + (this.cols + 1) * this.padding;
        this.numberCtx.fillStyle = '#ffffff';
        this.numberCtx.fillRect(rightAreaX, 60, this.rightAreaWidth, this.canvas.height - 60);
        
        // 绘制右侧区域边框
        this.numberCtx.strokeStyle = '#cccccc';
        this.numberCtx.strokeRect(rightAreaX, 60, this.rightAreaWidth, this.canvas.height - 60);
        
        // 在右侧区域居中绘制文字
        const text = `中了 ${this.getWinningCount()}个`;
        const charHeight = 30; // 每个字符的高度
        const totalHeight = text.length * charHeight; // 文字总高度
        const startY = 60 + (this.canvas.height - 60 - totalHeight) / 2; // 计算起始Y坐标，使文字垂直居中
        
        this.numberCtx.fillStyle = '#000000';
        this.numberCtx.font = 'bold 24px Microsoft YaHei';
        this.numberCtx.textAlign = 'center';
        this.numberCtx.textBaseline = 'middle';
        
        // 从上往下绘制每个字符
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            this.numberCtx.fillText(char, rightAreaX + this.rightAreaWidth / 2, startY + i * charHeight);
        }
        
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
                        // 计算图片缩放比例
                        const scaleX = this.cellWidth / cell.image.width;
                        const scaleY = this.cellHeight / cell.image.height;
                        const scale = Math.max(scaleX, scaleY);
                        
                        // 计算缩放后的图片尺寸
                        const scaledWidth = cell.image.width * scale;
                        const scaledHeight = cell.image.height * scale;
                        
                        // 计算居中偏移
                        const offsetX = (scaledWidth - this.cellWidth) / 2;
                        const offsetY = (scaledHeight - this.cellHeight) / 2;
                        
                        // 创建临时画布用于裁剪
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = this.cellWidth;
                        tempCanvas.height = this.cellHeight;
                        const tempCtx = tempCanvas.getContext('2d');
                        
                        // 在临时画布上绘制缩放后的图片
                        tempCtx.drawImage(cell.image, -offsetX, -offsetY, scaledWidth, scaledHeight);
                        
                        // 将裁剪后的图片绘制到目标位置
                        this.numberCtx.drawImage(tempCanvas, x, y);
                    }
                    
                    // 绘制奖品刮开层
                    if (cell.image) {
                        // 计算图片缩放比例
                        const scaleX = this.cellWidth / cell.image.width;
                        const scaleY = this.cellHeight / cell.image.height;
                        const scale = Math.max(scaleX, scaleY);
                        
                        // 计算缩放后的图片尺寸
                        const scaledWidth = cell.image.width * scale;
                        const scaledHeight = cell.image.height * scale;
                        
                        // 计算居中偏移
                        const offsetX = (scaledWidth - this.cellWidth) / 2;
                        const offsetY = (scaledHeight - this.cellHeight) / 2;
                        
                        // 创建临时画布用于裁剪
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = this.cellWidth;
                        tempCanvas.height = this.cellHeight;
                        const tempCtx = tempCanvas.getContext('2d');
                        
                        // 在临时画布上绘制缩放后的图片
                        tempCtx.drawImage(cell.image, -offsetX, -offsetY, scaledWidth, scaledHeight);
                        
                        // 将裁剪后的图片绘制到目标位置
                        this.rewardCtx.drawImage(tempCanvas, x, y);
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
                        // 计算图片缩放比例
                        const scaleX = this.cellWidth / cell.image.width;
                        const scaleY = this.cellHeight / cell.image.height;
                        const scale = Math.max(scaleX, scaleY);
                        
                        // 计算缩放后的图片尺寸
                        const scaledWidth = cell.image.width * scale;
                        const scaledHeight = cell.image.height * scale;
                        
                        // 计算居中偏移
                        const offsetX = (scaledWidth - this.cellWidth) / 2;
                        const offsetY = (scaledHeight - this.cellHeight) / 2;
                        
                        // 创建临时画布用于裁剪
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = this.cellWidth;
                        tempCanvas.height = this.cellHeight;
                        const tempCtx = tempCanvas.getContext('2d');
                        
                        // 在临时画布上绘制缩放后的图片
                        tempCtx.drawImage(cell.image, -offsetX, -offsetY, scaledWidth, scaledHeight);
                        
                        // 将裁剪后的图片绘制到目标位置
                        this.numberCtx.drawImage(tempCanvas, x, y);
                    }
                }
            }
        }
        
        // 随机选择一张图片作为刮刮层封面
        const allImages = [...this.normalImages, ...this.rewardPatternImages];
        const randomIndex = Math.floor(Math.random() * allImages.length);
        const coverImage = allImages[randomIndex];
        
        if (coverImage) {
            // 创建图案
            const patternCanvas = document.createElement('canvas');
            patternCanvas.width = this.canvas.width;
            patternCanvas.height = this.canvas.height;
            const patternCtx = patternCanvas.getContext('2d');
            
            // 计算图片缩放比例
            const scaleX = this.canvas.width / coverImage.width;
            const scaleY = this.canvas.height / coverImage.height;
            const scale = Math.max(scaleX, scaleY);
            
            // 计算缩放后的图片尺寸
            const scaledWidth = coverImage.width * scale;
            const scaledHeight = coverImage.height * scale;
            
            // 计算居中偏移
            const offsetX = (scaledWidth - this.canvas.width) / 2;
            const offsetY = (scaledHeight - this.canvas.height) / 2;
            
            // 绘制缩放后的图片
            patternCtx.drawImage(coverImage, -offsetX, -offsetY, scaledWidth, scaledHeight);
            
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
        // 检查是否在右侧区域
        const rightAreaX = this.cols * this.cellWidth + (this.cols + 1) * this.padding;
        if (x >= rightAreaX && x <= rightAreaX + this.rightAreaWidth && y >= 60) {
            return { row: -1, col: -1, isHeader: true, isRightArea: true };
        }
        
        // 检查是否在中奖号码区域
        if (y < 60) {
            return { row: -1, col: -1, isHeader: true };
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

    // 添加动画效果
    animateScratch(x, y) {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        const animate = () => {
            this.scratchEffect.radius += 0.5;
            this.scratchEffect.opacity -= 0.02;

            if (this.scratchEffect.opacity > 0) {
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.arc(x, y, this.scratchEffect.radius, 0, Math.PI * 2);
                this.scratchCtx.fill();
                this.scratchCtx.globalCompositeOperation = 'source-over';
                this.updateMainCanvas();
                this.animationFrame = requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // 添加自动刮开方法
    autoScratchArea(row, col) {
        const x = col * this.cellWidth + (col + 1) * this.padding;
        const y = row * this.cellHeight + (row + 1) * this.padding + 60;
        
        // 创建临时画布用于计算刮开区域
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.cellWidth;
        tempCanvas.height = this.cellHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 复制当前区域的刮开状态
        tempCtx.drawImage(this.scratchCanvas, x, y, this.cellWidth, this.cellHeight, 0, 0, this.cellWidth, this.cellHeight);
        
        // 获取区域数据
        const cellData = tempCtx.getImageData(0, 0, this.cellWidth, this.cellHeight);
        
        // 计算未刮开的像素
        let unscratchedPixels = 0;
        for (let i = 3; i < cellData.data.length; i += 4) {
            if (cellData.data[i] > 0) unscratchedPixels++;
        }
        
        // 如果未刮开区域小于15%，则自动刮开剩余部分
        if (unscratchedPixels / (this.cellWidth * this.cellHeight) < 0.15) {
            // 完全刮开该区域
            this.scratchCtx.globalCompositeOperation = 'destination-out';
            this.scratchCtx.fillRect(x, y, this.cellWidth, this.cellHeight);
            this.scratchCtx.globalCompositeOperation = 'source-over';
            
            // 更新刮开区域
            this.cells[row][col].scratchedArea = 1;
            
            // 如果是中奖区域，同时刮开奖品层
            if (this.cells[row][col].number === this.winningNumber) {
                this.rewardCtx.globalCompositeOperation = 'destination-out';
                this.rewardCtx.fillRect(x, y, this.cellWidth, this.cellHeight);
                this.rewardCtx.globalCompositeOperation = 'source-over';
                
                // 添加中奖效果
                this.showWinningEffect(row, col);
            }
            
            this.updateMainCanvas();
        }
    }

    // 修改检查右侧区域刮开状态的方法
    checkRightAreaScratched() {
        const rightAreaX = this.cols * this.cellWidth + (this.cols + 1) * this.padding;
        const cellData = this.scratchCtx.getImageData(
            rightAreaX,
            60,
            this.rightAreaWidth,
            this.canvas.height - 60
        );
        
        let scratchedPixels = 0;
        for (let i = 3; i < cellData.data.length; i += 4) {
            if (cellData.data[i] === 0) scratchedPixels++;
        }
        
        this.rightAreaScratchedArea = scratchedPixels / (this.rightAreaWidth * (this.canvas.height - 60));
        this.rightAreaScratched = this.rightAreaScratchedArea >= 0.85; // 当刮开面积超过80%时认为完全刮开
        
        // 如果刮开面积超过80%，自动刮开剩余部分
        if (this.rightAreaScratchedArea >= 0.85 && this.rightAreaScratchedArea < 1) {
            // 完全刮开右侧区域
            this.scratchCtx.globalCompositeOperation = 'destination-out';
            this.scratchCtx.fillRect(rightAreaX, 60, this.rightAreaWidth, this.canvas.height - 60);
            this.scratchCtx.globalCompositeOperation = 'source-over';
            
            // 更新刮开状态
            this.rightAreaScratchedArea = 1;
            this.rightAreaScratched = true;
            
            // 更新主画布
            this.updateMainCanvas();
        }
    }

    // 修改scratch方法
    scratch(x, y) {
        const cell = this.getCellAtPosition(x, y);
        if (cell) {
            // 添加刮开动画效果
            this.animateScratch(x, y);
            
            // 检查是否在右侧区域
            if (cell.isRightArea) {
                // 刮开右侧区域
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.arc(x, y, this.scratchEffect.radius, 0, Math.PI * 2);
                this.scratchCtx.fill();
                this.scratchCtx.globalCompositeOperation = 'source-over';
                
                // 检查右侧区域刮开状态
                this.checkRightAreaScratched();
            } else if (!cell.isHeader && this.cells[cell.row][cell.col].number === this.winningNumber) {
                // 先刮开主刮开层
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.arc(x, y, this.scratchEffect.radius, 0, Math.PI * 2);
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
                
                // 只有当右侧区域完全刮开后，才能刮开奖品刮开层
                if (this.rightAreaScratched && this.cells[cell.row][cell.col].scratchedArea >= 0.8) {
                    this.rewardCtx.globalCompositeOperation = 'destination-out';
                    this.rewardCtx.beginPath();
                    this.rewardCtx.arc(x, y, this.scratchEffect.radius, 0, Math.PI * 2);
                    this.rewardCtx.fill();
                    this.rewardCtx.globalCompositeOperation = 'source-over';
                    
                    // 添加中奖效果
                    this.showWinningEffect(cell.row, cell.col);
                } else if (!this.rightAreaScratched) {
                    // 如果右侧区域未完全刮开，显示提示信息
                    // this.showMessage('请先刮开右侧区域查看中奖个数！');
                }
            } else {
                // 非中奖区域或中奖号码区域：正常刮开
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.arc(x, y, this.scratchEffect.radius, 0, Math.PI * 2);
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
                    
                    // 检查是否需要自动刮开
                    this.autoScratchArea(cell.row, cell.col);
                }
            }
            
            this.updateMainCanvas();
        }
    }

    // 修改scratchLine方法
    scratchLine(fromX, fromY, toX, toY) {
        const cell = this.getCellAtPosition(fromX, fromY);
        if (cell) {
            // 检查是否在右侧区域
            if (cell.isRightArea) {
                // 刮开右侧区域
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.moveTo(fromX, fromY);
                this.scratchCtx.lineTo(toX, toY);
                this.scratchCtx.lineWidth = this.scratchEffect.lineWidth;
                this.scratchCtx.lineCap = 'round';
                this.scratchCtx.lineJoin = 'round';
                this.scratchCtx.stroke();
                this.scratchCtx.globalCompositeOperation = 'source-over';
                
                // 检查右侧区域刮开状态
                this.checkRightAreaScratched();
            } else if (!cell.isHeader && this.cells[cell.row][cell.col].number === this.winningNumber) {
                // 先刮开主刮开层
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.moveTo(fromX, fromY);
                this.scratchCtx.lineTo(toX, toY);
                this.scratchCtx.lineWidth = this.scratchEffect.lineWidth;
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
                
                // 只有当右侧区域完全刮开后，才能刮开奖品刮开层
                if (this.rightAreaScratched && this.cells[cell.row][cell.col].scratchedArea >= 0.8) {
                    this.rewardCtx.globalCompositeOperation = 'destination-out';
                    this.rewardCtx.beginPath();
                    this.rewardCtx.moveTo(fromX, fromY);
                    this.rewardCtx.lineTo(toX, toY);
                    this.rewardCtx.lineWidth = this.scratchEffect.lineWidth;
                    this.rewardCtx.lineCap = 'round';
                    this.rewardCtx.lineJoin = 'round';
                    this.rewardCtx.stroke();
                    this.rewardCtx.globalCompositeOperation = 'source-over';
                } else if (!this.rightAreaScratched) {
                    // 如果右侧区域未完全刮开，显示提示信息
                    // this.showMessage('请先刮开右侧区域查看中奖个数！');
                }
            } else {
                // 非中奖区域或中奖号码区域：正常刮开
                this.scratchCtx.globalCompositeOperation = 'destination-out';
                this.scratchCtx.beginPath();
                this.scratchCtx.moveTo(fromX, fromY);
                this.scratchCtx.lineTo(toX, toY);
                this.scratchCtx.lineWidth = this.scratchEffect.lineWidth;
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
                    
                    // 检查是否需要自动刮开
                    this.autoScratchArea(cell.row, cell.col);
                }
            }
            
            this.updateMainCanvas();
        }
    }

    // 添加中奖效果
    showWinningEffect(row, col) {
        const x = col * this.cellWidth + (col + 1) * this.padding + this.cellWidth / 2;
        const y = row * this.cellHeight + (row + 1) * this.padding + 60 + this.cellHeight / 2;
        
        // 创建粒子效果
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            document.body.appendChild(particle);
            
            // 添加动画
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 5;
            const animation = particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * 100}px, ${Math.sin(angle) * 100}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            });
            
            animation.onfinish = () => particle.remove();
        }
    }

    // 修改分享方法，添加分享成功效果
    shareToWeChat() {
        // 配置微信分享参数
        wx.ready(function() {
            // 分享给朋友
            wx.updateAppMessageShareData({
                title: '来玩刮刮乐！',
                desc: '试试你的运气，看看能刮出什么大奖！',
                link: window.location.href,
                imgUrl: 'https://your-domain.com/share-image.jpg',
                success: function() {
                    // 添加分享成功效果
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.textContent = '分享成功！🎉';
                    document.body.appendChild(successMessage);
                    
                    setTimeout(() => {
                        successMessage.remove();
                    }, 2000);
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
                imgUrl: 'https://your-domain.com/share-image.jpg',
                success: function() {
                    // 添加分享成功效果
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.textContent = '分享成功！🎉';
                    document.body.appendChild(successMessage);
                    
                    setTimeout(() => {
                        successMessage.remove();
                    }, 2000);
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

    // 添加获取中奖区域个数的方法
    getWinningCount() {
        let count = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.cells[row][col].number === this.winningNumber) {
                    count++;
                }
            }
        }
        return count;
    }

    // 添加显示提示信息的方法
    showMessage(text) {
        const message = document.createElement('div');
        message.className = 'message';
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    new ScratchCard();
}); 