// Beautiful flip card countdown using SVG - exact design restoration
import { DateTime } from 'luxon';

const TARGET = DateTime.fromISO('2025-10-01T00:00:00', { zone: 'Europe/Amsterdam' });

export default async function handler(req, res) {
  try {
    const now = DateTime.now().setZone('Europe/Amsterdam');
    let diff = TARGET.diff(now, ['days', 'hours', 'minutes']).toObject();
    if (TARGET <= now) diff = { days: 0, hours: 0, minutes: 0 };

    const DD = String(Math.max(0, Math.floor(diff.days ?? 0))).padStart(2, '0');
    const HH = String(Math.max(0, Math.floor(diff.hours ?? 0))).padStart(2, '0');
    const MM = String(Math.max(0, Math.floor(diff.minutes ?? 0))).padStart(2, '0');

    const width = 1200;
    const height = 600;

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="timerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#4840BB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4840BB;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#F8F8F0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F0F0E8;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="4" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
    <filter id="cardShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.6)"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="#4840BB"/>
  
  <!-- Timer container -->
  <rect x="0" y="0" width="${width}" height="${height * 0.17}" rx="20" fill="url(#timerGrad)" filter="url(#shadow)"/>
  
  <!-- Days Panel -->
  <g transform="translate(150, 100)">
    <rect x="0" y="0" width="120" height="80" rx="8" fill="url(#panelGrad)" stroke="#C8C8C0" stroke-width="1" filter="url(#cardShadow)"/>
    <rect x="0" y="40" width="120" height="40" rx="8" fill="url(#panelGrad)" stroke="#C8C8C0" stroke-width="1" filter="url(#cardShadow)"/>
    <line x1="0" y1="40" x2="120" y2="40" stroke="#000000" stroke-width="3"/>
    <text x="60" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#4840BB">${DD}</text>
    <text x="60" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF">DAGEN</text>
  </g>
  
  <!-- Hours Panel -->
  <g transform="translate(450, 100)">
    <rect x="0" y="0" width="120" height="80" rx="8" fill="url(#panelGrad)" stroke="#C8C8C0" stroke-width="1" filter="url(#cardShadow)"/>
    <rect x="0" y="40" width="120" height="40" rx="8" fill="url(#panelGrad)" stroke="#C8C8C0" stroke-width="1" filter="url(#cardShadow)"/>
    <line x1="0" y1="40" x2="120" y2="40" stroke="#000000" stroke-width="3"/>
    <text x="60" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#4840BB">${HH}</text>
    <text x="60" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF">UREN</text>
  </g>
  
  <!-- Minutes Panel -->
  <g transform="translate(750, 100)">
    <rect x="0" y="0" width="120" height="80" rx="8" fill="url(#panelGrad)" stroke="#C8C8C0" stroke-width="1" filter="url(#cardShadow)"/>
    <rect x="0" y="40" width="120" height="40" rx="8" fill="url(#panelGrad)" stroke="#C8C8C0" stroke-width="1" filter="url(#cardShadow)"/>
    <line x1="0" y1="40" x2="120" y2="40" stroke="#000000" stroke-width="3"/>
    <text x="60" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#4840BB">${MM}</text>
    <text x="60" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF">MINUTEN</text>
  </g>
  
  <!-- WALTER Text -->
  <text x="${width/2}" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#FFFFFF">WALTER</text>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.status(200).send(svg);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error: ' + e.message);
  }
}