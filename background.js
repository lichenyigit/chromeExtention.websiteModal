// 发送消息的辅助函数
async function sendToggleMessage(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, { action: "toggleModal" }, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}

// 带重试的发送消息
async function sendMessageWithRetry(tabId, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await sendToggleMessage(tabId);
            console.log('消息发送成功，响应:', response);
            return response;
        } catch (error) {
            console.log(`第 ${i + 1} 次尝试失败:`, error.message);
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }
    throw new Error('发送消息失败，已重试 ' + maxRetries + ' 次');
}

// 监听扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
    console.log('扩展图标被点击，标签页:', tab.url);

    // 先尝试发送消息
    try {
        await sendToggleMessage(tab.id);
        console.log('消息发送成功');
    } catch (error) {
        console.log('content script未注入，正在动态注入...', error.message);

        // 如果失败，说明content script未注入，手动注入
        try {
            await chrome.scripting.insertCSS({
                target: { tabId: tab.id, allFrames: false },
                files: ['content/css.css']
            });
            await chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: false },
                files: ['content/js.js']
            });

            console.log('脚本注入完成，等待初始化...');

            // 等待脚本初始化后重试发送消息
            await new Promise(resolve => setTimeout(resolve, 300));
            await sendMessageWithRetry(tab.id);
            console.log('动态注入后消息发送成功');
        } catch (injectError) {
            console.error('动态注入失败:', injectError.message);
        }
    }
});

