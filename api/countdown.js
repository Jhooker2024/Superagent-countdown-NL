// api/countdown.js — pixel-by-pixel replica of the provided image
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { DateTime } from 'luxon';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/* FONT (required for weight). Falls back but we also hard-thicken glyphs. */
try {
  const fp = path.join(__dirname, '..', 'fonts', 'Inter-Bold.ttf');
  if (fs.existsSync(fp)) GlobalFonts.registerFromPath(fp, 'InterBold');
} catch {}

/* Colors measured from the reference */
const COLOR = {
  background: '#000000',  // Black background
  
  timerTop:   '#5A4A8A',  // Lighter purple/indigo top
  timerMid:   '#4A3A7A',  // Medium purple/indigo middle  
  timerBot:   '#3A2A6A',  // Darker purple/indigo bottom
  timerShadow:'rgba(0,0,0,0.20)',

  panelTop:   '#F8F8F0',  // Off-white/cream top
  panelBot:   '#F0F0E8',  // Off-white/cream bottom
  panelEdge:  '#D0D0D0',  // Light gray edge
  panelShadow:'rgba(0,0,0,0.12)',
  panelLine:  '#C8C8C8',  // Horizontal line color

  hinge:      '#000000',  // Pure black hinge

  digit:      '#4A3A7A',  // Dark blue/purple digits (matching timer)
  label:      '#FFFFFF'   // White labels
};

// Target moment (Amsterdam)
const TARGET = DateTime.fromISO('2025-10-01T00:00:00', { zone: 'Europe/Amsterdam' });

export default async function handler(req, res, isGif = false) {
  try {
    // Master aspect from your image: 1144 × 590 (0.515)
    const widthCSS  = clamp(req.query.width, 600, 2000, 1144);
    const dpr       = clamp(req.query.dpr,   1, 3, 2);
    const heightCSS = Math.round(widthCSS * (590 / 1144));

    const canvas = createCanvas(widthCSS * dpr, heightCSS * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, widthCSS, heightCSS);

    // ---- time ----
    const now = DateTime.now().setZone('Europe/Amsterdam');
    let diff = TARGET.diff(now, ['days', 'hours', 'minutes']).toObject();
    if (TARGET <= now) diff = { days:0, hours:0, minutes:0 };

    const DD = String(Math.max(0, Math.floor(diff.days ?? 0))).padStart(2,'0');
    const HH = String(Math.max(0, Math.floor(diff.hours ?? 0))).padStart(2,'0');
    const MM = String(Math.max(0, Math.floor(diff.minutes ?? 0))).padStart(2,'0');

    // ---- background ----
    drawBackground(ctx, 0, 0, widthCSS, heightCSS);
    
    // ---- timer container ----
    drawTimerContainer(ctx, 0, 0, widthCSS, heightCSS, Math.round(heightCSS * 0.17));

    // ---- layout (locked to reference proportions) ----
    const padX       = r(widthCSS  * 0.08);    // left margin
    const padY       = r(heightCSS * 0.12);    // top margin to panel
    const groupGap   = r(widthCSS  * 0.06);    // gap between groups
    const panelGap   = r(widthCSS  * 0.015);   // gap between digits in a group

    const panelW     = r(widthCSS  * 0.12);    // wider for more rectangular shape
    const panelH     = r(heightCSS * 0.35);    // shorter for more rectangular shape
    const panelR     = r(panelH    * 0.12);    // smaller radius for more rectangular look

    const hingeY     = padY + Math.floor(panelH / 2);
    const hingeInset = r(panelW * 0.088);      // inset from panel sides
    const pinW       = r(panelW * 0.050);
    const pinH       = r(panelH * 0.072);
    const pinR       = r(pinH * 0.26);

    const digitPx    = r(panelH * 0.65); // Back to original width        // better proportioned digits
    const labelPx    = r(heightCSS * 0.070);
    const labelY     = padY + panelH + r(heightCSS * 0.066);

    let x = padX;

    const drawGroup = (digits, label) => {
      const groupWidth = panelW * digits.length + panelGap * (digits.length - 1);
      const cxGroup    = x + groupWidth / 2;

      for (let i = 0; i < digits.length; i++) {
        const px = x + i * (panelW + panelGap);
        drawPanel(ctx, px, padY, panelW, panelH, panelR);
        drawHingeLine(ctx, px, hingeY, panelW, hingeInset);
        drawHingePins(ctx, px, padY, panelW, panelH, pinW, pinH, pinR);
        drawDigitBold(ctx, digits[i], px, padY, panelW, panelH, digitPx);
      }

      drawLabel(ctx, label, cxGroup, labelY, labelPx);
      x += groupWidth + groupGap;
    };

    drawGroup(DD, 'DAGEN');
    drawGroup(HH, 'UREN');
    drawGroup(MM, 'MINUTEN');

    // Draw WALTER image below the countdown
    await drawWalterImage(ctx, widthCSS, heightCSS, padY, panelH, labelY, labelPx);

    if (isGif) {
      // Generate animated GIF with flip animation
      const frames = await generateFlipAnimation(widthCSS, heightCSS, dpr, DD, HH, MM, padX, padY, groupGap, panelGap, panelW, panelH, panelR, labelY, labelPx);
      
      // Create a simple animated response by returning frames as a multi-part response
      res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=frame');
      res.setHeader('Cache-Control', 'no-cache');
      
      // Send each frame with a delay
      let frameIndex = 0;
      const sendFrame = () => {
        if (frameIndex < frames.length) {
          res.write(`--frame\r\nContent-Type: image/png\r\nContent-Length: ${frames[frameIndex].length}\r\n\r\n`);
          res.write(frames[frameIndex]);
          res.write('\r\n');
          frameIndex++;
          setTimeout(sendFrame, 100); // 100ms delay between frames
        } else {
          res.end();
        }
      };
      sendFrame();
      return;
    } else {
      const png = canvas.toBuffer('image/png');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.status(200).send(png);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('Render error');
  }
}

/* ===== drawing ===== */

function drawBackground(ctx, x, y, w, h) {
  // Solid medium gray background
  ctx.fillStyle = COLOR.background;
  ctx.fillRect(x, y, w, h);
}

function drawTimerContainer(ctx, x, y, w, h, r) {
  // Realistic timer container with physical depth
  rr(ctx, x, y, w, h, r);

  // Realistic purple/indigo gradient with proper lighting
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0.00, '#6A5A9A');  // Lighter top with highlight
  g.addColorStop(0.30, '#5A4A8A');  // Main color
  g.addColorStop(0.70, '#4A3A7A');  // Mid tone
  g.addColorStop(1.00, '#3A2A6A');  // Darker bottom
  ctx.fillStyle = g;
  ctx.fill();

  // Add inner bevel highlight
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  rr(ctx, x + 2, y + 2, w - 4, h - 4, r - 2);
  ctx.stroke();
  ctx.restore();

  // Add realistic drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 6;
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = 'transparent';
  ctx.fill();
  ctx.restore();

  // Add subtle inner shadow for depth
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  rr(ctx, x + 1, y + 1, w - 2, h - 2, r - 1);
  ctx.stroke();
  ctx.restore();
}

function drawPanel(ctx, x, y, w, h, r) {
  // Draw two separate flip cards stacked
  const cardHeight = h / 2;
  const cardSpacing = 3; // Larger gap for more realistic separation
  
  // Bottom card (behind)
  const bottomY = y + cardHeight + cardSpacing;
  drawFlipCard(ctx, x, bottomY, w, cardHeight, r, true);
  
  // Top card (in front)
  const topY = y;
  drawFlipCard(ctx, x, topY, w, cardHeight, r, false);
  
  // Draw the hinge line between cards
  drawHingeBetweenCards(ctx, x, y + cardHeight, w, cardSpacing);
}

function drawFlipCard(ctx, x, y, w, h, r, isBottom) {
  // Enhanced photorealistic drop shadow for physical flip card
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = isBottom ? 12 : 8;
  ctx.shadowOffsetY = isBottom ? 8 : 4;
  ctx.shadowOffsetX = isBottom ? 3 : 2;
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // Enhanced realistic card material gradient
  const pg = ctx.createLinearGradient(0, y, 0, y + h);
  if (isBottom) {
    // Bottom card - more aged cardboard look
    pg.addColorStop(0, '#F5F5F0');
    pg.addColorStop(0.2, '#F0F0EB');
    pg.addColorStop(0.5, '#E8E8E0');
    pg.addColorStop(0.8, '#D8D8D0');
    pg.addColorStop(1, '#C8C8C0');
  } else {
    // Top card - fresh white cardboard with subtle texture
    pg.addColorStop(0, '#FFFFFF');
    pg.addColorStop(0.05, '#FEFEFE');
    pg.addColorStop(0.3, '#FCFCF8');
    pg.addColorStop(0.7, '#F8F8F4');
    pg.addColorStop(0.95, '#F2F2EE');
    pg.addColorStop(1, '#ECECE8');
  }
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = pg;
  ctx.fill();

  // Enhanced photorealistic beveled edge effect
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 3;
  rr(ctx, x + 1, y + 1, w - 2, h - 2, r - 1);
  ctx.stroke();
  ctx.restore();

  // Add subtle inner highlight
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  rr(ctx, x + 2, y + 2, w - 4, h - 4, r - 2);
  ctx.stroke();
  ctx.restore();

  // Add inner shadow for depth
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  rr(ctx, x + 3, y + 3, w - 6, h - 6, r - 3);
  ctx.stroke();
  ctx.restore();

  // Outer edge with realistic cardboard shadow
  ctx.lineWidth = 1;
  ctx.strokeStyle = isBottom ? '#B8B8B0' : '#C8C8C0';
  rr(ctx, x, y, w, h, r);
  ctx.stroke();
}

function drawHingeBetweenCards(ctx, x, y, w, spacing) {
  // Draw the hinge line between the two cards
  const hingeY = y + spacing / 2;
  
  // Main hinge line - solid black
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 6, hingeY);
  ctx.lineTo(x + w - 6, hingeY);
  ctx.stroke();
  
  // Add shadow below hinge
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 6, hingeY + 1);
  ctx.lineTo(x + w - 6, hingeY + 1);
  ctx.stroke();
  
  // Add hinge pins (larger and more realistic)
  const pinSize = 5;
  const pinY = hingeY - pinSize / 2;
  
  // Left pin - solid black
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + 10, pinY + pinSize/2, pinSize, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
  
  // Right pin - solid black
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + w - 10, pinY + pinSize/2, pinSize, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
  
  // Enhanced pin highlights for realistic metallic look
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(x + 10 - 1, pinY + pinSize/2 - 1, pinSize/3, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(x + w - 10 - 1, pinY + pinSize/2 - 1, pinSize/3, 0, 2 * Math.PI);
  ctx.fill();
  
  // Additional smaller highlight for more realistic metal
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(x + 10 - 2, pinY + pinSize/2 - 2, pinSize/4, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(x + w - 10 - 2, pinY + pinSize/2 - 2, pinSize/4, 0, 2 * Math.PI);
  ctx.fill();
}

function drawMetalRingsBetweenCards(ctx, x, ringY, w) {
  // Draw rings positioned between top and bottom cards (like your reference)
  const ringRadius = 6;
  const ringThickness = 2;
  
  // Left ring
  const leftRingX = x + 12;
  drawMetalRing(ctx, leftRingX, ringY, ringRadius, ringThickness);
  
  // Right ring  
  const rightRingX = x + w - 12;
  drawMetalRing(ctx, rightRingX, ringY, ringRadius, ringThickness);
  
  // Center ring for wider cards
  if (w > 70) {
    const centerRingX = x + w / 2;
    drawMetalRing(ctx, centerRingX, ringY, ringRadius, ringThickness);
  }
}

function drawMetalRing(ctx, centerX, centerY, radius, thickness) {
  // Create cylindrical metal ring like your reference image
  ctx.save();
  
  // Ring shadow for depth
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;
  
  // Metallic silver gradient
  const ringGradient = ctx.createLinearGradient(
    centerX - radius, centerY - radius,
    centerX + radius, centerY + radius
  );
  ringGradient.addColorStop(0, '#C8C8C8');
  ringGradient.addColorStop(0.3, '#B0B0B0');
  ringGradient.addColorStop(0.5, '#A0A0A0');
  ringGradient.addColorStop(0.7, '#909090');
  ringGradient.addColorStop(1, '#808080');
  
  // Draw ring body (cylindrical)
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = ringGradient;
  ctx.fill();
  
  // Draw inner hole
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - thickness, 0, 2 * Math.PI);
  ctx.fillStyle = '#000000';
  ctx.fill();
  
  ctx.restore();
  
  // Add realistic metallic highlights
  ctx.save();
  
  // Top highlight (like light hitting the top of a cylinder)
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - thickness/2, -Math.PI/4, Math.PI/4);
  ctx.stroke();
  
  // Side highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - thickness/3, Math.PI/6, Math.PI/2);
  ctx.stroke();
  
  // Inner edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - thickness + 0.5, 0, 2 * Math.PI);
  ctx.stroke();
  
  ctx.restore();
}

function drawHingeLine(ctx, x, yCenter, w, inset) {
  const y = Math.round(yCenter) + 0.5; // crisp
  ctx.fillStyle = COLOR.hinge;
  ctx.globalAlpha = 0.95;
  ctx.fillRect(x + inset, y - 0.5, w - inset*2, 1);
  ctx.globalAlpha = 1;
}

function drawHingePins(ctx, x, y, w, h, pw, ph, pr) {
  const cy = y + Math.floor(h / 2) - Math.round(ph / 2);
  const lx = x + Math.round(w * 0.050);
  const rx = x + w - Math.round(w * 0.050) - pw;
  
  // Draw realistic hinge pins with 3D effect
  const drawPin = (px, py) => {
    // Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    rrect(ctx, px, py, pw, ph, pr, '#1A1A1A');
    ctx.restore();
    
    // Main pin
    rrect(ctx, px, py, pw, ph, pr, '#2A2A2A');
    
    // Highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    rrect(ctx, px, py, pw, ph, pr, 'transparent');
    ctx.stroke();
  };
  
  drawPin(lx, cy);
  drawPin(rx, cy);
}

function drawDigitBold(ctx, d, x, y, w, h, px) {
  const cardHeight = h / 2;
  const cardSpacing = 3;
  const cx = x + w / 2;
  const centerY = y + cardHeight; // Where the cards meet
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = chooseFont(px);

  const digitText = String(d);
  
  // Create a temporary canvas to render the digit
  const tempCanvas = createCanvas(px * 2, px * 2);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.textAlign = 'center';
  tempCtx.textBaseline = 'middle';
  tempCtx.font = chooseFont(px);
  
  // Draw the digit on temporary canvas
  tempCtx.fillStyle = '#2A1A5A';
  tempCtx.fillText(digitText, px, px);
  
  // Get image data
  const imageData = tempCtx.getImageData(0, 0, px * 2, px * 2);
  const data = imageData.data;
  
  // Exact 50/50 split point
  const splitPoint = px; // This is exactly half of px * 2
  const topHeight = px;
  const bottomHeight = px;
  
  // Create top half image data
  const topImageData = tempCtx.createImageData(px * 2, topHeight);
  const topData = topImageData.data;
  
  // Create bottom half image data  
  const bottomImageData = tempCtx.createImageData(px * 2, bottomHeight);
  const bottomData = bottomImageData.data;
  
  // Copy top half (first portion of rows)
  for (let row = 0; row < topHeight; row++) {
    for (let col = 0; col < px * 2; col++) {
      const sourceIndex = (row * px * 2 + col) * 4;
      const destIndex = (row * px * 2 + col) * 4;
      topData[destIndex] = data[sourceIndex];
      topData[destIndex + 1] = data[sourceIndex + 1];
      topData[destIndex + 2] = data[sourceIndex + 2];
      topData[destIndex + 3] = data[sourceIndex + 3];
    }
  }
  
  // Copy bottom half (second portion of rows)
  for (let row = 0; row < bottomHeight; row++) {
    for (let col = 0; col < px * 2; col++) {
      const sourceIndex = ((row + splitPoint) * px * 2 + col) * 4;
      const destIndex = (row * px * 2 + col) * 4;
      bottomData[destIndex] = data[sourceIndex];
      bottomData[destIndex + 1] = data[sourceIndex + 1];
      bottomData[destIndex + 2] = data[sourceIndex + 2];
      bottomData[destIndex + 3] = data[sourceIndex + 3];
    }
  }
  
  // Draw top half on top card
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 12, y + 8, w - 24, cardHeight - 16);
  ctx.clip();
  
  const topCardCenterY = y + cardHeight / 2;
  const topX = cx - px;
  const topY = topCardCenterY - px * 0.7; // Move top half higher
  
  // Create temporary canvas for top half
  const topCanvas = createCanvas(px * 2, px);
  const topCtx = topCanvas.getContext('2d');
  topCtx.putImageData(topImageData, 0, 0);
  
  // Draw top half on top card
  ctx.drawImage(topCanvas, topX, topY);
  
  ctx.restore();
  
  // Draw bottom half on bottom card
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 12, y + cardHeight + cardSpacing + 8, w - 24, cardHeight - 16);
  ctx.clip();
  
  const bottomCardCenterY = y + cardHeight + cardSpacing + cardHeight / 2;
  const bottomX = cx - px;
  const bottomY = bottomCardCenterY - px * 0.3; // Move bottom half lower
  
  // Create temporary canvas for bottom half
  const bottomCanvas = createCanvas(px * 2, px);
  const bottomCtx = bottomCanvas.getContext('2d');
  bottomCtx.putImageData(bottomImageData, 0, 0);
  
  // Draw bottom half on bottom card
  ctx.drawImage(bottomCanvas, bottomX, bottomY);
  
  ctx.restore();
}

function drawLabel(ctx, text, cx, y, px) {
  ctx.fillStyle = COLOR.label;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = chooseFont(px);
  ctx.fillText(text, cx, y);
}

async function drawWalterImage(ctx, widthCSS, heightCSS, padY, panelH, labelY, labelPx) {
  try {
    // Check if image file exists and has content
    const walterImagePath = path.join(__dirname, '..', 'walter-text.png');
    const fs = await import('fs');
    
    if (!fs.existsSync(walterImagePath) || fs.statSync(walterImagePath).size === 0) {
      console.log('WALTER image file is empty or missing, using text fallback');
      drawWalterText(ctx, widthCSS, heightCSS, padY, panelH, labelY, labelPx);
      return;
    }
    
    const walterImage = await loadImage(walterImagePath);
    
    // Calculate position - center it below the countdown
    const walterY = heightCSS * 0.8;
    const walterWidth = r(widthCSS * 0.3); // Scale to 30% of canvas width
    const walterHeight = r(walterWidth * (walterImage.height / walterImage.width));
    const walterX = (widthCSS - walterWidth) / 2;
    
    // Draw the image
    ctx.drawImage(walterImage, walterX, walterY - walterHeight/2, walterWidth, walterHeight);
  } catch (error) {
    console.log('Could not load WALTER image:', error.message);
    // Fallback to text if image fails to load
    drawWalterText(ctx, widthCSS, heightCSS, padY, panelH, labelY, labelPx);
  }
}

function drawWalterText(ctx, widthCSS, heightCSS, padY, panelH, labelY, labelPx) {
  // Fallback text version
  const walterY = heightCSS * 0.8;
  const walterPx = r(widthCSS * 0.12);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${walterPx}px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
  ctx.fillText('WALTER', widthCSS / 2, walterY);
}

async function generateFlipAnimation(widthCSS, heightCSS, dpr, DD, HH, MM, padX, padY, groupGap, panelGap, panelW, panelH, panelR, labelY, labelPx) {
  const frames = [];
  const frameCount = 16; // More frames for smoother animation
  const fps = 12; // Frames per second
  
  // Calculate which digits need to flip based on time change
  const now = DateTime.now().setZone('Europe/Amsterdam');
  const nextMinute = now.plus({ minutes: 1 }).startOf('minute');
  const nextHour = now.plus({ hours: 1 }).startOf('hour');
  const nextDay = now.plus({ days: 1 }).startOf('day');
  
  const timeToNextMinute = nextMinute.diff(now).as('seconds');
  const timeToNextHour = nextHour.diff(now).as('seconds');
  const timeToNextDay = nextDay.diff(now).as('seconds');
  
  for (let frame = 0; frame < frameCount; frame++) {
    const canvas = createCanvas(widthCSS * dpr, heightCSS * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, widthCSS, heightCSS);
    
    // Draw background
    drawBackground(ctx, 0, 0, widthCSS, heightCSS);
    
    // Draw timer container
    drawTimerContainer(ctx, 0, 0, widthCSS, heightCSS, Math.round(heightCSS * 0.17));
    
    // Calculate flip progress with easing
    const rawProgress = frame / (frameCount - 1);
    const flipProgress = easeInOutCubic(rawProgress); // Smooth easing
    
    // Draw groups with flip animation
    let x = padX;
    
    const drawGroupWithFlip = (digits, label, shouldFlip, flipFrame) => {
      const groupWidth = panelW * digits.length + panelGap * (digits.length - 1);
      const cxGroup = x + groupWidth / 2;
      
      for (let i = 0; i < digits.length; i++) {
        const px = x + i * (panelW + panelGap);
        const digitFlip = shouldFlip ? flipFrame : 0;
        
        drawPanelWithFlip(ctx, px, padY, panelW, panelH, panelR, digitFlip);
        drawHingeBetweenCards(ctx, px, padY + panelH, panelW, 3);
        drawDigitBoldWithFlip(ctx, digits[i], px, padY, panelW, panelH, r(panelH * 0.65), digitFlip);
      }
      
      drawLabel(ctx, label, cxGroup, labelY, labelPx);
      x += groupWidth + groupGap;
    };
    
    // Determine which digits should flip
    const minutesFlip = timeToNextMinute < 5 ? flipProgress : 0; // Flip if within 5 seconds of minute change
    const hoursFlip = timeToNextHour < 5 ? flipProgress : 0; // Flip if within 5 seconds of hour change  
    const daysFlip = timeToNextDay < 5 ? flipProgress : 0; // Flip if within 5 seconds of day change
    
    drawGroupWithFlip(DD, 'DAGEN', daysFlip > 0, daysFlip);
    drawGroupWithFlip(HH, 'UREN', hoursFlip > 0, hoursFlip);
    drawGroupWithFlip(MM, 'MINUTEN', minutesFlip > 0, minutesFlip);
    
    // Draw WALTER text
    await drawWalterImage(ctx, widthCSS, heightCSS, padY, panelH, labelY, labelPx);
    
    frames.push(canvas.toBuffer('image/png'));
  }
  
  return frames;
}

// Easing function for smooth animation
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function drawPanelWithFlip(ctx, x, y, w, h, r, flipProgress) {
  const cardHeight = h / 2;
  const cardSpacing = 3;
  
  // Bottom card (behind)
  const bottomY = y + cardHeight + cardSpacing;
  drawFlipCard(ctx, x, bottomY, w, cardHeight, r, true);
  
  // Top card with realistic flip animation
  const topY = y;
  const flipAngle = flipProgress * Math.PI; // 0 to 180 degrees
  
  // Add perspective and physics
  const perspective = 0.3; // Perspective strength
  const scale = 1 - (Math.sin(flipAngle) * perspective * 0.2); // Scale down as it flips
  const skewX = Math.sin(flipAngle) * 0.1; // Slight skew for realism
  
  ctx.save();
  ctx.translate(x + w/2, topY + cardHeight/2);
  ctx.scale(scale, scale);
  ctx.skewX(skewX);
  ctx.rotate(flipAngle);
  ctx.translate(-w/2, -cardHeight/2);
  
  // Add shadow during flip
  if (flipProgress > 0.1 && flipProgress < 0.9) {
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
  }
  
  drawFlipCard(ctx, 0, 0, w, cardHeight, r, false);
  ctx.restore();
  
  // Draw hinge line
  drawHingeBetweenCards(ctx, x, y + cardHeight, w, cardSpacing);
}

function drawDigitBoldWithFlip(ctx, d, x, y, w, h, px, flipProgress) {
  const cardHeight = h / 2;
  const cardSpacing = 3;
  const cx = x + w / 2;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = chooseFont(px);
  
  const digitText = String(d);
  const flipAngle = flipProgress * Math.PI;
  
  // Bottom half (always visible)
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 12, y + cardHeight + cardSpacing + 8, w - 24, cardHeight - 16);
  ctx.clip();
  
  const bottomCardCenterY = y + cardHeight + cardSpacing + cardHeight / 2;
  const bottomX = cx - px;
  const bottomY = bottomCardCenterY - px * 0.3;
  
  ctx.fillStyle = '#2A1A5A';
  ctx.fillText(digitText, bottomX + px, bottomY + px);
  ctx.restore();
  
  // Top half with enhanced flip animation
  ctx.save();
  ctx.translate(cx, y + cardHeight/2);
  
  // Add physics-based scaling and skewing
  const scale = 1 - (Math.sin(flipAngle) * 0.15); // Scale down during flip
  const skewX = Math.sin(flipAngle) * 0.05; // Slight skew
  
  ctx.scale(scale, scale);
  ctx.skewX(skewX);
  ctx.rotate(flipAngle);
  ctx.translate(-px, -px * 0.7);
  
  // Add perspective distortion
  const perspective = Math.sin(flipAngle) * 0.1;
  ctx.transform(1, 0, perspective, 1, 0, 0);
  
  ctx.beginPath();
  ctx.rect(-px + 12, -px * 0.7 + 8, w - 24, cardHeight - 16);
  ctx.clip();
  
  // Add shadow during flip
  if (flipProgress > 0.2 && flipProgress < 0.8) {
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
  }
  
  ctx.fillStyle = '#2A1A5A';
  ctx.fillText(digitText, 0, 0);
  ctx.restore();
}

/* ===== utils ===== */

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function rrect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function chooseFont(px) {
  const fams = GlobalFonts.families || [];
  const hasInter = fams.some(f => f.family === 'InterBold');
  const fam = hasInter ? 'InterBold' : 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
  return `${px}px ${fam}`;
}

function clamp(v, min, max, def) {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}
function r(n){ return Math.round(n); }

