import { useState } from 'react'

export default function ProfileModal({ onConfirm }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const trimmed = key.trim()
    if (trimmed.length < 3) { setError('Profile key must be at least 3 characters'); return }
    onConfirm(trimmed)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex',
      alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#0e0e1a', border:'1px solid #1e1e2e', borderRadius:12,
        padding:'36px 40px', maxWidth:440, width:'90%', boxShadow:'0 24px 64px rgba(0,0,0,0.8)' }}>

        {/* Icon */}
        <div style={{ width:52, height:52, borderRadius:12, background:'rgba(45,212,191,0.12)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:20 }}>
          ⬡
        </div>

        <h2 style={{ margin:'0 0 8px', fontSize:22, fontWeight:'normal', color:'#f0ebe0' }}>
          Welcome to Peptide Compendium
        </h2>
        <p style={{ margin:'0 0 24px', fontSize:13, color:'#6a6560', lineHeight:1.7 }}>
          Enter a profile key to save your favorites across devices. Choose anything memorable —
          a word, phrase, or short code. Anyone with the same key can access the same favorites,
          so treat it like a shared passphrase.
        </p>

        <div style={{ marginBottom:8 }}>
          <input
            value={key}
            onChange={e => { setKey(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. larry-peptides-2026"
            autoFocus
            style={{ width:'100%', boxSizing:'border-box', padding:'12px 14px',
              background:'#07070e', border:`1px solid ${error ? '#f87171' : '#1e1e2e'}`,
              borderRadius:7, color:'#ddd8cc', fontSize:14, fontFamily:'monospace', outline:'none' }}
          />
          {error && <div style={{ fontSize:11, color:'#f87171', marginTop:6, fontFamily:'monospace' }}>{error}</div>}
        </div>

        <p style={{ margin:'0 0 24px', fontSize:11, color:'#2d2d45', fontFamily:'monospace', lineHeight:1.6 }}>
          To use on another device: enter the exact same key. Favorites sync instantly.
        </p>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={handleSubmit}
            style={{ flex:1, padding:'12px', background:'#2dd4bf', border:'none', borderRadius:7,
              color:'#07070e', fontSize:13, fontFamily:'monospace', fontWeight:600, cursor:'pointer',
              letterSpacing:'0.06em' }}>
            SET PROFILE KEY
          </button>
          <button onClick={() => onConfirm('__guest__')}
            style={{ padding:'12px 16px', background:'transparent', border:'1px solid #1e1e2e',
              borderRadius:7, color:'#4a4a6a', fontSize:12, fontFamily:'monospace', cursor:'pointer' }}>
            Skip (no sync)
          </button>
        </div>

      </div>
    </div>
  )
}
