// Vercel serverless function using @vercel/og for image generation
import { ImageResponse } from '@vercel/og';
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

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            backgroundImage: 'linear-gradient(180deg, #6A5A9A 0%, #5A4A8A 30%, #4A3A7A 70%, #3A2A6A 100%)',
            borderRadius: '20px',
            padding: '40px',
          }}
        >
          {/* Timer Container */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            {/* Days */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#F8F8F0',
                  borderRadius: '12px',
                  padding: '20px 30px',
                  marginBottom: '15px',
                  border: '2px solid #C8C8C0',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: '#4A3A7A',
                    fontFamily: 'Inter, Arial, sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {DD}
                </div>
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, Arial, sans-serif',
                }}
              >
                DAGEN
              </div>
            </div>

            {/* Hours */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#F8F8F0',
                  borderRadius: '12px',
                  padding: '20px 30px',
                  marginBottom: '15px',
                  border: '2px solid #C8C8C0',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: '#4A3A7A',
                    fontFamily: 'Inter, Arial, sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {HH}
                </div>
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, Arial, sans-serif',
                }}
              >
                UREN
              </div>
            </div>

            {/* Minutes */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#F8F8F0',
                  borderRadius: '12px',
                  padding: '20px 30px',
                  marginBottom: '15px',
                  border: '2px solid #C8C8C0',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: '#4A3A7A',
                    fontFamily: 'Inter, Arial, sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {MM}
                </div>
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, Arial, sans-serif',
                }}
              >
                MINUTEN
              </div>
            </div>
          </div>

          {/* WALTER Text */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              fontFamily: 'Inter, Arial, sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            WALTER
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 600,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response('Error generating countdown', { status: 500 });
  }
}
