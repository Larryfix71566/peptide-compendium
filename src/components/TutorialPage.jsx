import { useState } from 'react'
import { TUTORIAL_SECTIONS } from '../lib/tutorialContent.js'

const ACCENT = '#fbbf24'

export default function TutorialPage({ bp, onNavigate }) {
  const isMobile = bp === 'mobile'
  const px = isMobile ? '16px' : '60px'
  const [open, setOpen] = useState(() => new Set(['welcome']))

  const toggle = id => setOpen(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  return (
    <div style={{ overflowY:'auto', flex:1, scrollbarWidth:'thin', scrollbarColor:'#1e1e2e transparent' }}>
      <div style={{ background:'linear-gradient(135deg,#0a0a14 0%,#15120a 50%,#0a0a14 100%)', padding:`40px ${px} 32px`, borderBottom:'1px solid #131320' }}>
        <div style={{ fontSize:11, fontFamily:'monospace', color:ACCENT, letterSpacing:'0.18em', marginBottom:12 }}>TUTORIAL & HELP</div>
        <h1 style={{ margin:'0 0 12px', fontSize:isMobile?28:34, fontWeight:300, color:'#f0ebe0' }}>How to use this app</h1>
        <p style={{ margin:0, fontSize:14, color:'#8a857a', lineHeight:1.8, maxWidth:680 }}>
          A quick guide to every feature. Tap any section to expand the step-by-step. New here? Start at the top and work down.
        </p>
      </div>

      <div style={{ padding:`28px ${px} 48px`, maxWidth:860, display:'flex', flexDirection:'column', gap:12 }}>
        {TUTORIAL_SECTIONS.map((s, i) => {
          const isOpen = open.has(s.id)
          return (
            <div key={s.id} style={{ background:'#0c0c18', border:`1px solid ${isOpen?s.color+'44':'#1a1a28'}`, borderRadius:10, overflow:'hidden' }}>
              <button onClick={()=>toggle(s.id)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
                <div style={{ width:38, height:38, borderRadius:9, background:`${s.color}1a`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{s.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontFamily:'monospace', color:s.color, marginBottom:3 }}>STEP {i+1}</div>
                  <div style={{ fontSize:16, color:'#e8e3d8' }}>{s.title}</div>
                </div>
                <span style={{ color:s.color, fontSize:14, flexShrink:0 }}>{isOpen?'▲':'▼'}</span>
              </button>
              <div style={{ padding:'0 18px 18px 70px' }}>
                <p style={{ margin:'0 0 12px', fontSize:13, color:'#a8a398', lineHeight:1.75 }}>{s.overview}</p>
                {isOpen && (
                  <ol style={{ margin:0, paddingLeft:18, display:'flex', flexDirection:'column', gap:8 }}>
                    {s.detail.map((d,j) => (
                      <li key={j} style={{ fontSize:13, color:'#8a857a', lineHeight:1.65, paddingLeft:4 }}>{d}</li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )
        })}

        <div style={{ marginTop:12, padding:'14px 18px', background:'#08080f', border:'1px solid #131320', borderRadius:8, fontSize:11, fontFamily:'monospace', color:'#2d2d45', lineHeight:1.8 }}>
          ⚠ This application is for educational and research purposes only. It is not medical advice, a prescription, or a recommendation. Consult a qualified healthcare provider before considering any peptide or protocol.
        </div>
      </div>
    </div>
  )
}
