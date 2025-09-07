// Typing text animation
const typedText = document.getElementById("typedText");
const phrases = [
  "Share, learn, and inspire with YoungMinds.",
  "Where creativity meets collaboration.",
  "Build ideas that shape the future."
];
let phraseIndex = 0, charIndex = 0, deleting = false;
function typeEffect() {
  let current = phrases[phraseIndex];
  if (!deleting) {
    typedText.textContent = current.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeEffect, 1500);
      return;
    }
  } else {
    typedText.textContent = current.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }
  setTimeout(typeEffect, deleting ? 50 : 100);
}
typeEffect();

// ================= Dot Grid =================
const canvas = document.getElementById("dotCanvas");
const ctx = canvas.getContext("2d");
let dots = [];
let mouse = { x: -1000, y: -1000 };
let ripples = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initDots();
}
function initDots() {
  dots = [];
  const gap = 35;
  for (let y = 0; y <= canvas.height; y += gap) {
    for (let x = 0; x <= canvas.width; x += gap) {
      dots.push({ x, y, size: 4 });
    }
  }
}
function drawDots() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let dot of dots) {
    let size = dot.size;
    let color = "rgba(255,255,255,0.8)";

    // Hover effect
    const dx = dot.x - mouse.x;
    const dy = dot.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const proximity = 120;
    if (dist < proximity) {
      size = 4 + (1 - dist / proximity) * 6;
      color = "rgba(200,200,200,1)";
    }

    // Ripple effect
for (let ripple of ripples) {
  const dxr = dot.x - ripple.x;
  const dyr = dot.y - ripple.y;
  const distR = Math.sqrt(dxr * dxr + dyr * dyr);

  const diff = Math.abs(distR - ripple.radius);
  if (diff < 20) {
    size = 8;
    color = "rgba(180,180,180,1)";
  }
}

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = "white";
    ctx.shadowBlur = size > 5 ? 12 : 4;
    ctx.fill();
  }
}
function animate() {
  drawDots();

  // update ripples
  ripples.forEach(r => r.radius += 6);
  ripples = ripples.filter(r => r.radius < r.max);

  requestAnimationFrame(animate);
}

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener("click", e => {
  ripples.push({ x: e.clientX, y: e.clientY, radius: 0, max: 800 });
});

resize();
animate();
window.addEventListener("resize", resize);
