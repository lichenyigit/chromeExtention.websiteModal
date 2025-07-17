//页面上添加右侧图标
function AddMenu() {
    let modelWidth = 30, modelHeight = 70 //遮幕的宽高
    const html = `<div class="tip" id="video_curtain_tip" rounded-container>
                       <img src="https://alohahija-cdn.oss-cn-shanghai.aliyuncs.com/img/modal.png" />
                  </div>
                  <div class="modal" id="modal" >
                    <div class="move" id="move"></div>
                  </div>
                  `;

    // 确保在body最底部插入
    if (document.body) {
        // 移除已存在的元素（如果有的话）
        const existingTip = document.getElementById("video_curtain_tip");
        const existingModal = document.getElementById("modal");
        if (existingTip) existingTip.remove();
        if (existingModal) existingModal.remove();
        
        // 在body最底部插入新元素
        document.body.insertAdjacentHTML('beforeend', html);
        console.log('HTML 已插入到 body 底部');
    } else {
        console.log('body 元素不存在，等待 body 加载');
        // 如果 body 还不存在，等待它加载
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

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver((mutations, obs) => {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            obs.disconnect(); // 停止观察
            // 计算视频元素的绝对位置
            const videoPosition = videoElement.getBoundingClientRect();
            // 获取视频元素的高度，用于计算底部位置
            const videoHeight = videoElement.offsetHeight;

            // 获取当前网址
            const currentUrl = window.location.href;
            
            // 尝试从本地存储恢复位置
            chrome.storage.local.get([currentUrl], function(result) {
                let modalPosition;
                
                if (result[currentUrl]) {
                    // 使用保存的位置
                    modalPosition = result[currentUrl];
                    console.log('从本地存储恢复位置:', modalPosition);
                } else {
                    // 使用默认位置（视频底部）
                    modalPosition = {
                        left: videoPosition.left + videoPosition.width * 5 / 200,
                        width: videoPosition.width * 95 / 100,
                        top: videoPosition.top + videoHeight - modelHeight - 50
                    };
                    console.log('使用默认位置:', modalPosition);
                }

                //设置model的left和top
                const modal = document.querySelector('.modal');
                modal.style.left = modalPosition.left + 'px';
                modal.style.top = modalPosition.top + 'px';
                modal.style.width = modalPosition.width + 'px';
                modal.style.height = modelHeight + 'px';
            });
        }
    });

    // 开始观察整个文档的变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
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

// 立即执行的日志
console.log('=== 脚本开始加载 ===');

window.onload = function () {
    console.log('=== 开始执行 ===');
    console.log('window.onload 事件触发');
    
    if (document.getElementById("video_curtain_tip") == null) {
        console.log('未找到 video_curtain_tip 元素，准备添加菜单');
        AddMenu();
    } else {
        console.log('已存在 video_curtain_tip 元素');
    }

    const modal = document.getElementById("modal");
    console.log('modal 元素状态:', modal ? '存在' : '不存在');
    if (modal) {
        console.log('开始初始化拖拽功能');
        dragElement(modal);
    }

    const tip = document.getElementById("video_curtain_tip");
    console.log('tip 元素状态:', tip ? '存在' : '不存在');
    if (tip) {
        console.log('添加点击事件监听器');
        tip.addEventListener('click', function () {
            console.log('点击了 tip 元素');
            const modal = document.getElementById("modal");
            if (modal) {
                if (modal.style.display == "" || modal.style.display == "none") {
                    console.log('显示 modal');
                    modal.style.display = "inline";
                } else if (modal.style.display == "inline") {
                    console.log('隐藏 modal');
                    modal.style.display = "none";
                }
            }
        });
    }
    console.log('=== 初始化完成 ===');
};