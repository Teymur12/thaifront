'use client'

import { useState, useCallback } from 'react'

export default function HesabatModal({ onComplete }) {
  const [hecVaxtPos, setHecVaxtPos] = useState({ x: null, y: null })
  const [answered, setAnswered] = useState(false)

  const runAway = useCallback(() => {
    const margin = 80
    const btnW = 140
    const btnH = 44
    const maxX = window.innerWidth - btnW - margin
    const maxY = window.innerHeight - btnH - margin
    const randomX = Math.floor(Math.random() * (maxX - margin) + margin)
    const randomY = Math.floor(Math.random() * (maxY - margin) + margin)
    setHecVaxtPos({ x: randomX, y: randomY })
  }, [])

  const handleNeVaxtIstesen = () => {
    setAnswered(true)
    setTimeout(() => {
      onComplete && onComplete()
    }, 1200)
  }

  return (
    <>
      <div
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
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            padding: '40px 30px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
            textAlign: 'center',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤗🥺</div>
          <p
            style={{
              fontSize: '18px',
              color: '#1e293b',
              fontWeight: '600',
              lineHeight: '1.6',
              margin: '0 0 30px 0',
            }}
          >
            qucaqlayib bagislamaq ne vaxt olacaq????
          </p>

          {answered ? (
            <p style={{ fontSize: '24px', color: '#10b981', fontWeight: '700' }}>
              🥰 Bilirdim! Teşekkürler!
            </p>
          ) : (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>

              {/* "Nə vaxt istəsən" - klikləmək olar, modalu bağlayır */}
              <button
                onClick={handleNeVaxtIstesen}
                style={{
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.55)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.4)'
                }}
              >
                Nə vaxt istəsən 🥰
              </button>

              {/* "Heç vaxt" - hover/click-da qaçır */}
              <button
                onMouseEnter={runAway}
                onClick={runAway}
                style={{
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #e11d48, #be123c)',
                  color: '#fff',
                  cursor: 'not-allowed',
                  boxShadow: '0 4px 14px rgba(225,29,72,0.4)',
                  position: hecVaxtPos.x !== null ? 'fixed' : 'relative',
                  left: hecVaxtPos.x !== null ? hecVaxtPos.x : 'auto',
                  top: hecVaxtPos.y !== null ? hecVaxtPos.y : 'auto',
                  zIndex: 99999,
                  transition: 'left 0.18s cubic-bezier(.25,.8,.25,1), top 0.18s cubic-bezier(.25,.8,.25,1)',
                  userSelect: 'none',
                }}
              >
                Heç vaxt 😤
              </button>

            </div>
          )}
        </div>
      </div>
    </>
  )
}
