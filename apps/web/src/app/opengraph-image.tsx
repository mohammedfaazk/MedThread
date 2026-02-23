import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MedThread - Medical Community Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 20,
            }}
          >
            🏥 MedThread
          </div>
          <div
            style={{
              fontSize: 40,
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Connect with verified doctors and join the trusted medical community
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
