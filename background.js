// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
    console.log('扩展图标被点击，标签页:', tab.url);
    
    // 向当前活动标签页发送消息，切换遮幕显示/隐藏
    chrome.tabs.sendMessage(tab.id, { action: "toggleModal" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('发送消息失败:', chrome.runtime.lastError.message);
        } else {
            console.log('收到响应:', response);
        }
    });
});

