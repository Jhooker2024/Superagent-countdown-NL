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

    console.log('Countdown values:', { DD, HH, MM });

    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw purple background with rounded corners
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#4840BB');
    gradient.addColorStop(1, '#4840BB');
    ctx.fillStyle = gradient;
    
    // Rounded rectangle for background
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.arcTo(width - 20, 20, width - 20, height - 20, 20);
    ctx.arcTo(width - 20, height - 20, 20, height - 20, 20);
    ctx.arcTo(20, height - 20, 20, 20, 20);
    ctx.arcTo(20, 20, width - 20, 20, 20);
    ctx.closePath();
    ctx.fill();

    // Add inner highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw countdown panels with your exact flip card design
    const panelW = 80;
    const panelH = 120;
    const panelSpacing = 20;
    const startX = (width - (6 * panelW + 5 * panelSpacing)) / 2;
    const startY = 80;

    const drawFlipCard = (x, y, digit, isFirstDigit) => {
      // Draw white panel with realistic shadow
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, panelW, panelH);
      
      ctx.shadowColor = 'transparent';
      
      // Add realistic card gradient
      const cardGradient = ctx.createLinearGradient(0, y, 0, y + panelH);
      cardGradient.addColorStop(0, '#FFFFFF');
      cardGradient.addColorStop(0.05, '#FEFEFE');
      cardGradient.addColorStop(0.3, '#FCFCF8');
      cardGradient.addColorStop(0.7, '#F8F8F4');
      cardGradient.addColorStop(0.95, '#F2F2EE');
      cardGradient.addColorStop(1, '#ECECE8');
      
      ctx.fillStyle = cardGradient;
      ctx.fillRect(x, y, panelW, panelH);
      
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
      
      // Add pin highlights
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(x + 12 - 1, y + panelH/2 - 1, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + panelW - 12 - 1, y + panelH/2 - 1, 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw digit
      ctx.fillStyle = '#4840BB';
      ctx.font = 'bold 48px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(digit, x + panelW/2, y + panelH/2);
      
      // Draw label for first digit of each group
      if (isFirstDigit) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(getLabel(x), x + panelW/2, y + panelH + 10);
      }
    };

    const getLabel = (x) => {
      const panelPos = (x - startX) / (panelW + panelSpacing);
      if (panelPos < 2) return 'DAGEN';
      if (panelPos < 4) return 'UREN';
      return 'MINUTEN';
    };

    // Draw all panels - 6 total (2 for each time unit)
    drawFlipCard(startX, startY, DD[0], true);
    drawFlipCard(startX + panelW + panelSpacing, startY, DD[1], false);
    drawFlipCard(startX + 2 * (panelW + panelSpacing), startY, HH[0], true);
    drawFlipCard(startX + 3 * (panelW + panelSpacing), startY, HH[1], false);
    drawFlipCard(startX + 4 * (panelW + panelSpacing), startY, MM[0], true);
    drawFlipCard(startX + 5 * (panelW + panelSpacing), startY, MM[1], false);

    // Draw WALTER text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WALTER', width/2, height - 60);

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
