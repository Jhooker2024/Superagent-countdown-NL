import { ImageResponse } from '@vercel/og';
import { DateTime } from 'luxon';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const TARGET = DateTime.fromISO('2025-10-01T00:00:00', { zone: 'Europe/Amsterdam' });
    const now = DateTime.now().setZone('Europe/Amsterdam');
    let diff = TARGET.diff(now, ['days', 'hours', 'minutes']).toObject();
    if (TARGET <= now) diff = { days:0, hours:0, minutes:0 };

    const DD = String(Math.max(0, Math.floor(diff.days ?? 0))).padStart(2,'0');
    const HH = String(Math.max(0, Math.floor(diff.hours ?? 0))).padStart(2,'0');
    const MM = String(Math.max(0, Math.floor(diff.minutes ?? 0))).padStart(2,'0');

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
            backgroundColor: 'transparent',
            backgroundImage: 'linear-gradient(135deg, #4840BB 0%, #4840BB 100%)',
            borderRadius: '20px',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '40px',
              padding: '40px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {DD.split('').map((digit, i) => (
                  <div
                    key={i}
                    style={{
                      width: '80px',
                      height: '120px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: '#4840BB',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {digit}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '8px',
                        right: '8px',
                        height: '3px',
                        backgroundColor: '#000000',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '12px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#000000',
                        borderRadius: '50%',
                        transform: 'translateY(-50%)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '12px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#000000',
                        borderRadius: '50%',
                        transform: 'translateY(-50%)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  marginTop: '16px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                DAGEN
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {HH.split('').map((digit, i) => (
                  <div
                    key={i}
                    style={{
                      width: '80px',
                      height: '120px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: '#4840BB',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {digit}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '8px',
                        right: '8px',
                        height: '3px',
                        backgroundColor: '#000000',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '12px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#000000',
                        borderRadius: '50%',
                        transform: 'translateY(-50%)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '12px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#000000',
                        borderRadius: '50%',
                        transform: 'translateY(-50%)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  marginTop: '16px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                UREN
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {MM.split('').map((digit, i) => (
                  <div
                    key={i}
                    style={{
                      width: '80px',
                      height: '120px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: '#4840BB',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {digit}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '8px',
                        right: '8px',
                        height: '3px',
                        backgroundColor: '#000000',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '12px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#000000',
                        borderRadius: '50%',
                        transform: 'translateY(-50%)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '12px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#000000',
                        borderRadius: '50%',
                        transform: 'translateY(-50%)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  marginTop: '16px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                MINUTEN
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginTop: '40px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            WALTER
          </div>
        </div>
      ),
      {
        width: 800,
        height: 400,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response('Render error', { status: 500 });
  }
}
