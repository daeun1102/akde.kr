const memo = document.getElementById("memo1");
const header = memo.querySelector(".memo-header");
const closeBtn = memo.querySelector(".close-btn");
const minBtn = memo.querySelector(".min-btn");
const resizeHandles = memo.querySelectorAll(".resize-handle");

// ===== 추가: 최소 크기(사라짐 방지) =====
const MIN_W = 180;
const MIN_H = 110;
const clamp = (v, min) => Math.max(v, min);

// 삭제
closeBtn.addEventListener("click", () => memo.remove());


// ===== 드래그 이동 =====
let isDragging = false, offsetX = 0, offsetY = 0;

// 🔁 교체: 헤더 드래그 시작 핸들러
header.addEventListener("mousedown", (e) => {
  // 버튼/리사이즈 핸들 클릭 시 이동 금지
  if (
    e.target === minBtn ||
    e.target === closeBtn ||
    e.target.closest(".resize-handle")
  ) return;

  // ✅ 축소 상태에서도 드래그 허용 (이 줄을 두지 말 것!)
  // if (memo.classList.contains("minimized")) return;

  isDragging = true;
  offsetX = e.clientX - memo.offsetLeft;
  offsetY = e.clientY - memo.offsetTop;
  document.body.style.userSelect = "none";

  // 선택: 드래그 시작 시 맨 앞으로
  memo.style.zIndex = (parseInt(memo.style.zIndex || "1000", 10) + 1).toString();
});


document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  memo.style.left = (e.clientX - offsetX) + "px";
  memo.style.top  = (e.clientY - offsetY) + "px";
});

// ===== 리사이즈 =====
let isResizing = false, currentHandle = null;

resizeHandles.forEach(handle => {
  handle.addEventListener("mousedown", (e) => {
    if (memo.classList.contains("minimized")) return; // 축소 상태면 리사이즈 금지

    isResizing = true;
    currentHandle = handle;
    e.preventDefault();
    document.body.style.userSelect = "none"; // 텍스트 선택 방지
  });
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;

  const rect = memo.getBoundingClientRect();

  if (currentHandle.classList.contains("right")) {
    const w = clamp(e.clientX - rect.left, MIN_W);
    memo.style.width = w + "px";

  } else if (currentHandle.classList.contains("left")) {
    const w = clamp(rect.right - e.clientX, MIN_W);
    memo.style.width = w + "px";
    memo.style.left  = (rect.right - w) + "px";

  } else if (currentHandle.classList.contains("bottom")) {
    const h = clamp(e.clientY - rect.top, MIN_H);
    memo.style.height = h + "px";

  } else if (currentHandle.classList.contains("top")) {
    const h = clamp(rect.bottom - e.clientY, MIN_H);
    memo.style.height = h + "px";
    memo.style.top    = (rect.bottom - h) + "px";

  } else if (currentHandle.classList.contains("br")) {
    const w = clamp(e.clientX - rect.left, MIN_W);
    const h = clamp(e.clientY - rect.top,  MIN_H);
    memo.style.width  = w + "px";
    memo.style.height = h + "px";

  } else if (currentHandle.classList.contains("bl")) {
    const w = clamp(rect.right - e.clientX, MIN_W);
    const h = clamp(e.clientY - rect.top,  MIN_H);
    memo.style.width  = w + "px";
    memo.style.left   = (rect.right - w) + "px";
    memo.style.height = h + "px";

  } else if (currentHandle.classList.contains("tr")) {
    const w = clamp(e.clientX - rect.left,  MIN_W);
    const h = clamp(rect.bottom - e.clientY, MIN_H);
    memo.style.width  = w + "px";
    memo.style.height = h + "px";
    memo.style.top    = (rect.bottom - h) + "px";

  } else if (currentHandle.classList.contains("tl")) {
    const w = clamp(rect.right - e.clientX, MIN_W);
    const h = clamp(rect.bottom - e.clientY, MIN_H);
    memo.style.width  = w + "px";
    memo.style.left   = (rect.right - w) + "px";
    memo.style.height = h + "px";
    memo.style.top    = (rect.bottom - h) + "px";
  }
});

// 공통 mouseup 정리
document.addEventListener("mouseup", () => {
  isDragging = false;
  isResizing = false;
  currentHandle = null;
  document.body.style.userSelect = ""; // 선택 가능 복구
});

// 상단에 같이 선언 (기존 변수들 아래에)
const HEADER_H = 24;

// 기존 minBtn 클릭 핸들러 전체 교체
function setMinimized(on) {
  const content = memo.querySelector(".memo-content");
  const handles = memo.querySelectorAll(".resize-handle");

  if (on) {
    // 현재 높이 저장 후 헤더 높이로 강제
    memo.dataset.prevH = memo.style.height || memo.getBoundingClientRect().height + "px";
    memo.classList.add("minimized");
    memo.style.height = HEADER_H + "px";
    memo.style.minHeight = HEADER_H + "px";
    memo.style.overflow = "hidden";

    // 내용/핸들 완전 숨김
    if (content) content.style.display = "none";
    handles.forEach(h => (h.style.display = "none"));
  } else {
    memo.classList.remove("minimized");
    memo.style.height = memo.dataset.prevH || "";
    memo.style.minHeight = "";
    memo.style.overflow = "";

    if (content) content.style.display = "";
    handles.forEach(h => (h.style.display = ""));
  }

  // 버튼 기호 전환
  minBtn.textContent = on ? "+" : "−";
}

// 클릭 시 토글
minBtn.addEventListener("click", () => {
  setMinimized(!memo.classList.contains("minimized"));
});


