//页面上添加右侧图标
const MODEL_HEIGHT = 70; // 遮幕的高度

// 定位遮幕的函数（根据 video 或窗口）
function positionModal(modal, callback) {
    const currentUrl = window.location.href;
    const videoElement = document.querySelector('video');

    // 尝试从本地存储恢复位置
    chrome.storage.local.get([currentUrl], function(result) {
        let modalPosition;

        if (result[currentUrl]) {
            // 使用保存的位置
            modalPosition = result[currentUrl];
            console.log('从本地存储恢复位置:', modalPosition);
        } else if (videoElement) {
            // 有 video 元素，使用 video 定位
            const videoPosition = videoElement.getBoundingClientRect();
            const videoHeight = videoElement.offsetHeight;
            modalPosition = {
                left: videoPosition.left + videoPosition.width * 5 / 200,
                width: videoPosition.width * 95 / 100,
                top: videoPosition.top + videoHeight - MODEL_HEIGHT - 50
            };
            console.log('使用 video 元素定位:', modalPosition);
        } else {
            // 没有 video 元素，使用浏览器可视窗口底部定位
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            modalPosition = {
                left: windowWidth * 0.05,
                width: windowWidth * 0.9,
                top: windowHeight - MODEL_HEIGHT - 50
            };
            console.log('无 video 元素，使用窗口底部定位:', modalPosition);
        }

        // 设置 modal 的位置
        modal.style.left = modalPosition.left + 'px';
        modal.style.top = modalPosition.top + 'px';
        modal.style.width = modalPosition.width + 'px';
        modal.style.height = MODEL_HEIGHT + 'px';

        // 标记已定位
        modal.dataset.positioned = 'true';

        if (callback) callback();
    });
}

function AddMenu() {
    const html = `<div class="modal" id="modal" >
                    <div class="move" id="move"></div>
                  </div>
                  `;

    // 确保在body最底部插入
    if (document.body) {
        const existingModal = document.getElementById("modal");
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', html);
        console.log('HTML 已插入到 body 底部');
    } else {
        console.log('body 元素不存在，等待 body 加载');
        const observer = new MutationObserver((mutations, obs) => {
            if (document.body) {
                obs.disconnect();
                document.body.insertAdjacentHTML('beforeend', html);
                console.log('HTML 已插入到 body 底部（延迟插入）');
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    console.log('init modal sdk ...');

    const modal = document.querySelector('.modal');

    // 先检查是否已有 video 元素
    const videoElement = document.querySelector('video');
    if (videoElement) {
        // 已有 video，直接定位
        positionModal(modal);
    } else {
        // 没有 video，使用 MutationObserver 等待 video 出现
        const observer = new MutationObserver((mutations, obs) => {
            const videoElement = document.querySelector('video');
            if (videoElement) {
                obs.disconnect();
                console.log('检测到 video 元素出现');
                positionModal(modal);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;


    function dragMouseDown(e) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
        
        // 保存当前位置到本地存储
        const currentUrl = window.location.href;
        const modalPosition = {
            left: parseInt(elmnt.style.left),
            top: parseInt(elmnt.style.top),
            width: parseInt(elmnt.style.width)
        };
        
        chrome.storage.local.set({[currentUrl]: modalPosition}, function() {
            console.log('位置已保存到本地存储:', modalPosition);
        });
    }

    if (document.getElementById("move")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById("move").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }
}

// 确保 modal 始终在最高层级
function ensureTopLayer() {
    const modal = document.getElementById("modal");
    if (!modal || modal.style.display === "none" || modal.style.display === "") {
        return; // modal 不存在或未显示时不处理
    }

    // 遍历页面所有元素，找到最高的 z-index
    let maxZ = 0;
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        if (el === modal || el.closest('#modal')) return; // 跳过 modal 自身
        const z = parseInt(window.getComputedStyle(el).zIndex);
        if (!isNaN(z) && z > maxZ) {
            maxZ = z;
        }
    });

    // 设置 modal 的 z-index 比最高的还高
    const newZ = Math.min(maxZ + 10, 2147483647);
    if (parseInt(modal.style.zIndex) !== newZ) {
        modal.style.zIndex = newZ;
        console.log('更新 modal z-index:', newZ);
    }
}

// 定时检测，确保始终在最上层
setInterval(ensureTopLayer, 500);

// 立即执行的日志
console.log('=== 脚本开始加载 ===');

// 将消息监听器移到最外层，确保脚本加载后立即可以接收消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "toggleModal") {
        console.log('收到切换遮幕消息');
        let modal = document.getElementById("modal");

        // 如果 modal 不存在，先创建它
        if (!modal) {
            console.log('Modal 不存在，先创建');
            AddMenu();
            modal = document.getElementById("modal");
            if (modal) {
                dragElement(modal);
            }
        }

        if (modal) {
            if (modal.style.display == "" || modal.style.display == "none") {
                // 显示遮幕前，检查是否已定位
                if (modal.dataset.positioned !== 'true') {
                    console.log('遮幕未定位，进行定位');
                    positionModal(modal, function() {
                        console.log('显示 modal');
                        modal.style.display = "inline";
                        sendResponse({success: true, visible: true});
                    });
                    return true; // 异步响应
                } else {
                    console.log('显示 modal');
                    modal.style.display = "inline";
                }
            } else if (modal.style.display == "inline") {
                console.log('隐藏 modal');
                modal.style.display = "none";
            }
            sendResponse({success: true, visible: modal.style.display === "inline"});
        } else {
            sendResponse({success: false, message: "Modal not found"});
        }
    }
    return true; // 保持消息通道开放
});

window.onload = function () {
    console.log('=== 开始执行 ===');
    console.log('window.onload 事件触发');
    
    // 注释掉 tip 元素的检查，改为只检查 modal
    // if (document.getElementById("video_curtain_tip") == null) {
    if (document.getElementById("modal") == null) {
        console.log('未找到 modal 元素，准备添加菜单');
        AddMenu();
    } else {
        console.log('已存在 modal 元素');
    }

    const modal = document.getElementById("modal");
    console.log('modal 元素状态:', modal ? '存在' : '不存在');
    if (modal) {
        console.log('开始初始化拖拽功能');
        dragElement(modal);
    }

    console.log('=== 初始化完成 ===');
};