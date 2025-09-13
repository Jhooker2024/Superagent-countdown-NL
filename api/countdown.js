// WORKING COUNTDOWN - HTML solution that definitely works on Railway
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

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>WALTER Countdown</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #4840BB;
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .timer-container {
            background: linear-gradient(180deg, #4840BB 0%, #3A2A6A 100%);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            margin-bottom: 40px;
        }
        .countdown {
            display: flex;
            gap: 40px;
            justify-content: center;
            align-items: center;
        }
        .time-group {
            text-align: center;
        }
        .time-value {
            background: linear-gradient(180deg, #F8F8F0 0%, #F0F0E8 100%);
            color: #4840BB;
            padding: 20px 30px;
            border-radius: 12px;
            font-size: 64px;
            font-weight: bold;
            margin-bottom: 15px;
            border: 2px solid #C8C8C0;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            min-width: 120px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .time-label {
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
        .walter {
            font-size: 72px;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
    </style>
</head>
<body>
    <div class="timer-container">
        <div class="countdown">
            <div class="time-group">
                <div class="time-value">${DD}</div>
                <div class="time-label">DAGEN</div>
            </div>
            <div class="time-group">
                <div class="time-value">${HH}</div>
                <div class="time-label">UREN</div>
            </div>
            <div class="time-group">
                <div class="time-value">${MM}</div>
                <div class="time-label">MINUTEN</div>
            </div>
        </div>
    </div>
    <div class="walter">WALTER</div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.status(200).send(html);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error: ' + e.message);
  }
}