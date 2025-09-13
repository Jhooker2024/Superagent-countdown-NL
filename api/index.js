// Vercel serverless function - redirect to countdown
export default function handler(req, res) {
  res.redirect(301, '/api/countdown.png');
}