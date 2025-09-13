import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Create a canvas for the WALTER text
const width = 400;
const height = 100;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Black background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, width, height);

// White text
ctx.fillStyle = '#FFFFFF';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.font = 'bold 60px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';

// Create the wave effect
const text = 'WALTER';
const centerX = width / 2;
const letterSpacing = 50;
const totalWidth = (text.length - 1) * letterSpacing;
const startX = centerX - totalWidth / 2;

for (let i = 0; i < text.length; i++) {
  const letter = text[i];
  const x = startX + i * letterSpacing;
  
  // Create wave distortion
  let waveOffset = 0;
  const progress = i / (text.length - 1);
  
  if (progress < 0.33) {
    waveOffset = -15 * (0.33 - progress) / 0.33;
  } else if (progress < 0.67) {
    waveOffset = -15 + 30 * (progress - 0.33) / 0.34;
  } else {
    waveOffset = 15 - 30 * (progress - 0.67) / 0.33;
  }
  
  ctx.save();
  ctx.translate(x, height/2 + waveOffset);
  ctx.fillText(letter, 0, 0);
  ctx.restore();
}

// Save the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'walter-text.png'), buffer);
console.log('WALTER image created!');
