const express = require('express');
const crypto = require('crypto');
const app = express();

// 你的测试号配置
const APP_ID = 'YOUR_TEST_APP_ID';
const APP_SECRET = 'YOUR_TEST_APP_SECRET';

// 生成随机字符串
function generateNonceStr() {
    return Math.random().toString(36).substr(2, 15);
}

// 生成签名
function generateSignature(timestamp, nonceStr, url) {
    const string1 = `jsapi_ticket=${getJsApiTicket()}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    return crypto.createHash('sha1').update(string1).digest('hex');
}

// 获取 jsapi_ticket（实际项目中需要缓存）
async function getJsApiTicket() {
    // 这里需要实现获取 jsapi_ticket 的逻辑
    // 实际项目中应该缓存 ticket，因为它有效期为2小时
    return 'YOUR_JSAPI_TICKET';
}

// 提供签名接口
app.get('/get-signature', async (req, res) => {
    const url = req.query.url;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = generateNonceStr();
    
    try {
        const signature = await generateSignature(timestamp, nonceStr, url);
        res.json({
            appId: APP_ID,
            timestamp: timestamp,
            nonceStr: nonceStr,
            signature: signature
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 静态文件服务
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 