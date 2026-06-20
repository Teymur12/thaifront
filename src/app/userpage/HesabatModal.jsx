'use client'

export default function HesabatModal({ onComplete }) {
  return (
    <div 
      onClick={onComplete}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        cursor: 'pointer'
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '480px',
        padding: '40px 30px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
        textAlign: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤗🥺</div>
        <p style={{
          fontSize: '18px',
          color: '#1e293b',
          fontWeight: '600',
          lineHeight: '1.6',
          margin: 0
        }}>
          qucaqlayib bagislamaq ne vaxt olacaq????
        </p>
      </div>
    </div>
  );
}
