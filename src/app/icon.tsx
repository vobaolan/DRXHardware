import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d16',
          borderRadius: '50%',
          border: '1.5px solid #38bdf8',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: 11,
          letterSpacing: '-0.5px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxShadow: '0 0 6px rgba(56, 189, 248, 0.6)',
        }}
      >
        DRX
      </div>
    ),
    { ...size }
  );
}
