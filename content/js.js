//页面上添加右侧图标
function AddMenu() {

    const html = `<div class="tip" id="tip" rounded-container>
                       <img src="https://alohahija-cdn.oss-cn-shanghai.aliyuncs.com/img/modal.png" />
                  </div>
                  <div class="modal" id="modal" >
                    <div class="move" id="move"></div>
                  </div>
                  `;
    document.body.insertAdjacentHTML(`afterbegin`, html);//追加html
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById("move")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById("move").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

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
    }
}


window.onload = function () {
    AddMenu();
    dragElement(document.getElementById(("modal")));
    document.getElementById("tip").addEventListener('click', function () {
        const modal = document.getElementById("modal")
        if (modal.style.display == "" || modal.style.display == "none")
            modal.style.display = "inline"
        else if (modal.style.display == "inline")
            modal.style.display = "none"
    })
}