// Vercel serverless function entry point
import countdownHandler from './countdown.js';

export default async function handler(req, res) {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Handle different routes
  if (req.url === '/api/countdown.png' || req.url === '/') {
    await countdownHandler(req, res, false);
  } else if (req.url === '/api/countdown.gif') {
    await countdownHandler(req, res, true);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
}
