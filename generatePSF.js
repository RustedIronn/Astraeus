import { createCanvas } from "canvas";
import fs from "fs";

const size = 512;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0, 0, size, size);

const center = size / 2;
const maxRadius = size / 2;

// ✚ Simple "plus" shaped diffraction spike
function drawSpike(angle) {
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(angle);

  const grad = ctx.createLinearGradient(-maxRadius, 0, maxRadius, 0);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.95)");
  grad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.strokeStyle = grad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-maxRadius, 0);
  ctx.lineTo(maxRadius, 0);
  ctx.stroke();

  ctx.restore();
}

// Draw vertical + horizontal spikes
drawSpike(0); // horizontal
drawSpike(Math.PI / 2); // vertical

// Optionally: faint secondary cross for a subtle glow
ctx.globalCompositeOperation = "lighter";
ctx.lineWidth = 2;
ctx.strokeStyle = "rgba(255,255,255,0.4)";
drawSpike(Math.PI / 4);      // diagonal 1
drawSpike((3 * Math.PI) / 4); // diagonal 2

const out = canvas.toBuffer("image/png");
fs.writeFileSync("./public/textures/psf_plus.png", out);
console.log("✅ PSF plus texture saved to /public/textures/psf_plus.png");
