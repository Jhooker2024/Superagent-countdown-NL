const { DateTime } = require('luxon');

const TARGET = DateTime.fromISO('2025-10-01T00:00:00', { zone: 'Europe/Amsterdam' });

exports.handler = async (event, context) => {
  try {
    const now = DateTime.now().setZone('Europe/Amsterdam');
    let diff = TARGET.diff(now, ['days', 'hours', 'minutes']).toObject();
    if (TARGET <= now) diff = { days:0, hours:0, minutes:0 };

    const DD = String(Math.max(0, Math.floor(diff.days ?? 0))).padStart(2,'0');
    const HH = String(Math.max(0, Math.floor(diff.hours ?? 0))).padStart(2,'0');
    const MM = String(Math.max(0, Math.floor(diff.minutes ?? 0))).padStart(2,'0');

    // Return SVG instead of canvas
    const svg = `
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#4840BB;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4840BB;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="800" height="400" fill="url(#bg)" rx="20"/>
      
      <!-- Timer Container -->
      <rect x="50" y="50" width="700" height="300" fill="#4840BB" stroke="rgba(255,255,255,0.2)" stroke-width="2" rx="20"/>
      
      <!-- Days Panel -->
      <g transform="translate(150, 100)">
        <rect x="0" y="0" width="80" height="120" fill="#FFFFFF" rx="12" filter="url(#shadow)"/>
        <line x1="8" y1="60" x2="72" y2="60" stroke="#000000" stroke-width="3"/>
        <circle cx="12" cy="60" r="4" fill="#000000"/>
        <circle cx="68" cy="60" r="4" fill="#000000"/>
        <text x="40" y="70" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#4840BB">${DD[0]}</text>
        <text x="40" y="140" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#FFFFFF">DAGEN</text>
      </g>
      
      <g transform="translate(250, 100)">
        <rect x="0" y="0" width="80" height="120" fill="#FFFFFF" rx="12" filter="url(#shadow)"/>
        <line x1="8" y1="60" x2="72" y2="60" stroke="#000000" stroke-width="3"/>
        <circle cx="12" cy="60" r="4" fill="#000000"/>
        <circle cx="68" cy="60" r="4" fill="#000000"/>
        <text x="40" y="70" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#4840BB">${DD[1]}</text>
      </g>
      
      <!-- Hours Panel -->
      <g transform="translate(400, 100)">
        <rect x="0" y="0" width="80" height="120" fill="#FFFFFF" rx="12" filter="url(#shadow)"/>
        <line x1="8" y1="60" x2="72" y2="60" stroke="#000000" stroke-width="3"/>
        <circle cx="12" cy="60" r="4" fill="#000000"/>
        <circle cx="68" cy="60" r="4" fill="#000000"/>
        <text x="40" y="70" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#4840BB">${HH[0]}</text>
        <text x="40" y="140" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#FFFFFF">UREN</text>
      </g>
      
      <g transform="translate(500, 100)">
        <rect x="0" y="0" width="80" height="120" fill="#FFFFFF" rx="12" filter="url(#shadow)"/>
        <line x1="8" y1="60" x2="72" y2="60" stroke="#000000" stroke-width="3"/>
        <circle cx="12" cy="60" r="4" fill="#000000"/>
        <circle cx="68" cy="60" r="4" fill="#000000"/>
        <text x="40" y="70" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#4840BB">${HH[1]}</text>
      </g>
      
      <!-- Minutes Panel -->
      <g transform="translate(550, 100)">
        <rect x="0" y="0" width="80" height="120" fill="#FFFFFF" rx="12" filter="url(#shadow)"/>
        <line x1="8" y1="60" x2="72" y2="60" stroke="#000000" stroke-width="3"/>
        <circle cx="12" cy="60" r="4" fill="#000000"/>
        <circle cx="68" cy="60" r="4" fill="#000000"/>
        <text x="40" y="70" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#4840BB">${MM[0]}</text>
        <text x="40" y="140" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#FFFFFF">MINUTEN</text>
      </g>
      
      <g transform="translate(650, 100)">
        <rect x="0" y="0" width="80" height="120" fill="#FFFFFF" rx="12" filter="url(#shadow)"/>
        <line x1="8" y1="60" x2="72" y2="60" stroke="#000000" stroke-width="3"/>
        <circle cx="12" cy="60" r="4" fill="#000000"/>
        <circle cx="68" cy="60" r="4" fill="#000000"/>
        <text x="40" y="70" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#4840BB">${MM[1]}</text>
      </g>
      
      <!-- WALTER Text -->
      <text x="400" y="350" text-anchor="middle" font-family="Arial" font-size="48" font-weight="bold" fill="#FFFFFF">WALTER</text>
    </svg>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60'
      },
      body: svg
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Error generating countdown'
    };
  }
};
