// WORKING COUNTDOWN - GUARANTEED TO SHOW NUMBERS
import { createCanvas } from '@napi-rs/canvas';
import { DateTime } from 'luxon';

const TARGET = DateTime.fromISO('2025-10-01T00:00:00', { zone: 'Europe/Amsterdam' });

export default async function handler(req, res) {
  try {
    const width = 1200;
    const height = 600;
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Calculate time
    const now = DateTime.now().setZone('Europe/Amsterdam');
    let diff = TARGET.diff(now, ['days', 'hours', 'minutes']).toObject();
    if (TARGET <= now) diff = { days: 0, hours: 0, minutes: 0 };

    const DD = String(Math.max(0, Math.floor(diff.days ?? 0))).padStart(2, '0');
    const HH = String(Math.max(0, Math.floor(diff.hours ?? 0))).padStart(2, '0');
    const MM = String(Math.max(0, Math.floor(diff.minutes ?? 0))).padStart(2, '0');

    console.log('COUNTDOWN:', DD, HH, MM);

    // Purple background
    ctx.fillStyle = '#4840BB';
    ctx.fillRect(0, 0, width, height);

    // Draw three panels
    const panelWidth = 200;
    const panelHeight = 120;
    const startX = 200;
    const startY = 200;

    // Days panel
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(startX, startY, panelWidth, panelHeight);
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, panelWidth, panelHeight);
    
    // Days number - BIG AND BOLD
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(DD, startX + panelWidth/2, startY + panelHeight/2);
    
    // Days label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('DAGEN', startX + panelWidth/2, startY + panelHeight + 40);

    // Hours panel
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(startX + panelWidth + 50, startY, panelWidth, panelHeight);
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX + panelWidth + 50, startY, panelWidth, panelHeight);
    
    // Hours number - BIG AND BOLD
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(HH, startX + panelWidth + 50 + panelWidth/2, startY + panelHeight/2);
    
    // Hours label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('UREN', startX + panelWidth + 50 + panelWidth/2, startY + panelHeight + 40);

    // Minutes panel
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(startX + (panelWidth + 50) * 2, startY, panelWidth, panelHeight);
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX + (panelWidth + 50) * 2, startY, panelWidth, panelHeight);
    
    // Minutes number - BIG AND BOLD
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(MM, startX + (panelWidth + 50) * 2 + panelWidth/2, startY + panelHeight/2);
    
    // Minutes label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('MINUTEN', startX + (panelWidth + 50) * 2 + panelWidth/2, startY + panelHeight + 40);

    // WALTER text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('WALTER', width/2, 500);

    const png = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.status(200).send(png);
  } catch (e) {
    console.error('ERROR:', e);
    res.status(500).send('Error: ' + e.message);
  }
}