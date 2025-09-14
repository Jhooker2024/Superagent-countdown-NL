# Walter Countdown

A countdown timer that displays the time remaining until October 1st, 2025 in Amsterdam timezone. Features both static PNG and animated GIF outputs.

## Features

- Real-time countdown display
- High-quality PNG output
- Animated GIF with flip effects
- Responsive sizing with query parameters
- Custom font support with fallbacks
- Netlify serverless deployment ready

## API Endpoints

- `/api/countdown.png` - Static PNG image
- `/api/countdown.gif` - Animated GIF
- Query parameters:
  - `width` - Image width (600-2000px, default: 1144)
  - `dpr` - Device pixel ratio (1-3, default: 2)

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/api/countdown.png`

## Netlify Deployment

1. Connect your repository to Netlify
2. Set build command: `npm install`
3. Set publish directory: `public`
4. Deploy!

The project is configured with:
- `netlify.toml` for build settings
- Serverless functions in `netlify/functions/`
- Static assets in `public/`

## Dependencies

- `@napi-rs/canvas` - Canvas rendering
- `luxon` - Date/time handling
