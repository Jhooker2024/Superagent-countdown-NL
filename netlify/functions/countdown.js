const { createCanvas, registerFont, loadImage } = require('canvas');
const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');

// Register font
try {
  const fontPath = path.join(__dirname, '../../fonts/Inter-Bold.ttf');
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'InterBold' });
  }
} catch (e) {
  console.log('Font registration failed:', e.message);
}

const TARGET = DateTime.fromISO('2025-10-01T00:00:00', { zone: 'Europe/Amsterdam' });

exports.handler = async (event, context) => {
  try {
    const now = DateTime.now().setZone('Europe/Amsterdam');
    let diff = TARGET.diff(now, ['days', 'hours', 'minutes']).toObject();
    if (TARGET <= now) diff = { days:0, hours:0, minutes:0 };

    const DD = String(Math.max(0, Math.floor(diff.days ?? 0))).padStart(2,'0');
    const HH = String(Math.max(0, Math.floor(diff.hours ?? 0))).padStart(2,'0');
    const MM = String(Math.max(0, Math.floor(diff.minutes ?? 0))).padStart(2,'0');

    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw purple background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#4840BB');
    gradient.addColorStop(1, '#4840BB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw timer container with rounded corners
    const containerX = 50;
    const containerY = 50;
    const containerW = width - 100;
    const containerH = height - 100;
    const radius = 20;

    ctx.fillStyle = '#4840BB';
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    
    // Draw rounded rectangle
    ctx.beginPath();
    ctx.moveTo(containerX + radius, containerY);
    ctx.arcTo(containerX + containerW, containerY, containerX + containerW, containerY + containerH, radius);
    ctx.arcTo(containerX + containerW, containerY + containerH, containerX, containerY + containerH, radius);
    ctx.arcTo(containerX, containerY + containerH, containerX, containerY, radius);
    ctx.arcTo(containerX, containerY, containerX + containerW, containerY, radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw countdown panels
    const panelW = 80;
    const panelH = 120;
    const panelSpacing = 20;
    const startX = (width - (3 * panelW + 2 * panelSpacing)) / 2;
    const startY = 100;

    const drawPanel = (x, y, digit, label) => {
      // Draw white panel with shadow
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, panelW, panelH);
      
      ctx.shadowColor = 'transparent';
      
      // Draw hinge line
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + panelH/2);
      ctx.lineTo(x + panelW - 8, y + panelH/2);
      ctx.stroke();
      
      // Draw hinge pins
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(x + 12, y + panelH/2, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + panelW - 12, y + panelH/2, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw digit
      ctx.fillStyle = '#4840BB';
      ctx.font = 'bold 48px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(digit, x + panelW/2, y + panelH/2);
      
      // Draw label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x + panelW/2, y + panelH + 10);
    };

    // Draw panels
    drawPanel(startX, startY, DD, 'DAGEN');
    drawPanel(startX + panelW + panelSpacing, startY, HH, 'UREN');
    drawPanel(startX + 2 * (panelW + panelSpacing), startY, MM, 'MINUTEN');

    // Draw WALTER text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WALTER', width/2, height - 50);

    const buffer = canvas.toBuffer('image/png');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Error generating image'
    };
  }
};
