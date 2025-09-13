// api/countdown.js — WORKING countdown with Dutch labels
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { DateTime } from 'luxon';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Target moment (Amsterdam)
const TARGET = DateTime.fromISO('2025-10-01T00:00:00', { zone: 'Europe/Amsterdam' });

export default async function handler(req, res, isGif = false) {
  try {
    const widthCSS = 1200;
    const heightCSS = 600;
    const dpr = 2;

    const canvas = createCanvas(widthCSS * dpr, heightCSS * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Calculate time
    const now = DateTime.now().setZone('Europe/Amsterdam');
    let diff = TARGET.diff(now, ['days', 'hours', 'minutes']).toObject();
    if (TARGET <= now) diff = { days: 0, hours: 0, minutes: 0 };

    const DD = String(Math.max(0, Math.floor(diff.days ?? 0))).padStart(2, '0');
    const HH = String(Math.max(0, Math.floor(diff.hours ?? 0))).padStart(2, '0');
    const MM = String(Math.max(0, Math.floor(diff.minutes ?? 0))).padStart(2, '0');

    console.log('COUNTDOWN VALUES:', { DD, HH, MM });

    // Draw purple background
    ctx.fillStyle = '#4840BB';
    ctx.fillRect(0, 0, widthCSS, heightCSS);

    // Draw three countdown panels
    const panelWidth = 200;
    const panelHeight = 120;
    const startX = (widthCSS - (panelWidth * 3 + 100)) / 2;
    const startY = 150;

    // Days panel
    drawCountdownPanel(ctx, startX, startY, panelWidth, panelHeight, DD, 'DAGEN');
    
    // Hours panel
    drawCountdownPanel(ctx, startX + panelWidth + 50, startY, panelWidth, panelHeight, HH, 'UREN');
    
    // Minutes panel
    drawCountdownPanel(ctx, startX + (panelWidth + 50) * 2, startY, panelWidth, panelHeight, MM, 'MINUTEN');

    // Draw WALTER text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WALTER', widthCSS / 2, 450);

    const png = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.status(200).send(png);
  } catch (e) {
    console.error('ERROR:', e);
    res.status(500).send('Render error: ' + e.message);
  }
}

function drawCountdownPanel(ctx, x, y, w, h, number, label) {
  // Draw white panel
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, w, h);
  
  // Draw border
  ctx.strokeStyle = '#CCCCCC';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  
  // Draw number - BIG and BOLD
  ctx.fillStyle = '#4840BB';
  ctx.font = 'bold 80px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number, x + w/2, y + h/2 - 10);
  
  // Draw label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText(label, x + w/2, y + h + 30);
}