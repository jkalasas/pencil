/**
 * @param {Element} element
 */
function getElementPosition(element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + window.scrollX, y: rect.top + window.scrollY };
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

const notebookElem = document.querySelector("#notebook");

const canvas = notebookElem.querySelector("canvas.paper");
let canvasWidth = notebookElem.offsetWidth;
let canvasHeight = notebookElem.offsetHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let canvasPos = getElementPosition(canvas);

let ctx = canvas.getContext("2d");
ctx.lineCap = "round";
ctx.lineWidth = 5;

window.addEventListener("resize", () => {
  const canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  canvasWidth = notebookElem.offsetWidth;
  canvasHeight = notebookElem.offsetHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvasPos = getElementPosition(canvas);
  ctx.putImageData(canvasData, 0, 0);
  ctx.lineWidth = 5;
});

const pencilElem = notebookElem.querySelector(".pencil");
const clearBtn = notebookElem.querySelector(".btn-clear");

let isWriting = false;
let currentColor = null;
let activeColorBtn;

const colorBtns = notebookElem.querySelectorAll(".toolbar > .btn-color");

if (colorBtns.length === 0) currentColor = "#52575d";
else {
  activeColorBtn = colorBtns[0];
  activeColorBtn.classList.add("active");
  currentColor = activeColorBtn.style.getPropertyValue("--color");
}
colorBtns.forEach((colorBtn) => {
  colorBtn.addEventListener("click", () => {
    currentColor = colorBtn.style.getPropertyValue("--color");
    if (activeColorBtn) activeColorBtn.classList.remove("active");
    activeColorBtn = colorBtn;
    colorBtn.classList.add("active");
  });
});

const fullscreenBtn = notebookElem.querySelector(".toolbar .btn-fullscreen");

fullscreenBtn.addEventListener("click", toggleFullScreen);

const draw = (x, y) => {
  if (!isWriting) return;

  ctx.lineTo(x, y);
  ctx.stroke();
};

const startDraw = (e) => {
  isWriting = true;
  ctx.strokeStyle = currentColor;
  ctx.beginPath();
  notebookElem.classList.add("cursor-none");

  const x = e.pageX - canvasPos.x;
  const y = e.pageY - canvasPos.y;

  pencilElem.animate(
    {
      left: x + "px",
      top: y + "px",
    },
    { duration: 100, fill: "forwards" }
  );
};

const stopDraw = () => {
  isWriting = false;
  ctx.closePath();
  notebookElem.classList.remove("cursor-none");
};

const renderMove = (x, y) => {
  if (!isWriting) return;

  pencilElem.animate(
    {
      left: x + "px",
      top: y + "px",
    },
    { duration: 100, fill: "forwards" }
  );

  draw(x, y);
};

clearBtn.addEventListener("click", (e) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
});

notebookElem.addEventListener("mousedown", startDraw);
notebookElem.addEventListener("mouseup", stopDraw);
notebookElem.addEventListener("mousemove", (e) => {
  const x = e.pageX - canvasPos.x;
  const y = e.pageY - canvasPos.y;

  renderMove(x, y);
});

notebookElem.addEventListener("touchstart", startDraw);
notebookElem.addEventListener("touchend", stopDraw);
notebookElem.addEventListener("touchmove", (e) => {
  const touch = e.changedTouches[0];

  const x = touch.pageX - canvasPos.x;
  const y = touch.pageY - canvasPos.y;

  renderMove(x, y);
});

const loadingScreen = document.querySelector(".loading-screen");
loadingScreen.addEventListener("click", () => {
  loadingScreen.classList.add("hidden");
});
