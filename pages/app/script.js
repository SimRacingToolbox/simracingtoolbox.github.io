// List of images and corresponding page redirects
const imageList = [
  {
    src: "/assets/games/acc logo (2).png",
    page: "/pages/app/acc/index.html"
  },
  {
    src: "/assets/games/lmu logo (1).png",
    page: "/pages/app/lmu/index.html"
  },
];

let currentIndex = 0;

const carouselImage = document.getElementById("carouselImage");
const prevBtn = document.getElementById("prevImage");
const nextBtn = document.getElementById("nextImage");
const startBtn = document.getElementById("startBtn");

function updateCarouselImage() {
  carouselImage.src = imageList[currentIndex].src;
}

// Carousel navigation
prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
  updateCarouselImage();
});

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % imageList.length;
  updateCarouselImage();
});

// Start button navigation
startBtn.addEventListener("click", () => {
  window.location.href = imageList[currentIndex].page;
});

// Swipe support (mobile)
let startX = 0;

carouselImage.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

carouselImage.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 30) {
    nextBtn.click();
  } else if (endX - startX > 30) {
    prevBtn.click();
  }
});
