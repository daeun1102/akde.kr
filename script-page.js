document.addEventListener("DOMContentLoaded", () => {
  const imageList = [
    "images/random.png",
    "images/random2.png",
    "images/random3.png",
    "images/random4.png"
  ];

  const container = document.getElementById("random-image-container");
  if (!container) {
    console.error("❌ 랜덤 이미지 컨테이너 없음!");
    return;
  }

  imageList.forEach((src) => {
    const wrapper = document.createElement("div");
    wrapper.className = "random-image-wrapper";
    wrapper.style.position = "absolute";

    const imageWidth = 300;
    const imageHeight = 300;

    const posX = Math.random() * (window.innerWidth - imageWidth);
    const posY = Math.random() * (window.innerHeight - imageHeight);

    wrapper.style.left = `${posX}px`;
    wrapper.style.top = `${posY}px`;

    const img = document.createElement("img");
    img.src = src;
    img.className = src.includes("random.png") ? "random-image smaller" : "random-image";

    const xBtn = document.createElement("div");
    xBtn.className = "x-hit-area";
    xBtn.onclick = () => wrapper.remove();

    wrapper.appendChild(img);
    wrapper.appendChild(xBtn);
    container.appendChild(wrapper);
  });
});
