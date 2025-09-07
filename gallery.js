let current = 3; // start at middle
const total = 5;
let autoScroll;

function updateCarousel() {
  document.querySelector("main#carousel").style.setProperty("--position", current);
  const radio = document.getElementById("slide" + current);
  if (radio) radio.checked = true;
}

function nextSlide() {
  current = current + 1 > total ? 1 : current + 1;
  updateCarousel();
}

function prevSlide() {
  current = current - 1 < 1 ? total : current - 1;
  updateCarousel();
}

function startAutoScroll() {
  autoScroll = setInterval(nextSlide, 4000);
}
function stopAutoScroll() {
  clearInterval(autoScroll);
}

document.querySelectorAll("input[name='slider']").forEach((radio, idx) => {
  radio.addEventListener("change", () => {
    current = idx + 1;
    updateCarousel();
  });
});

window.addEventListener("load", () => {
  updateCarousel();
  startAutoScroll();
  const carouselBox = document.querySelector(".carousel-box");
  carouselBox.addEventListener("mouseenter", stopAutoScroll);
  carouselBox.addEventListener("mouseleave", startAutoScroll);
});
