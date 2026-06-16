import { useState } from 'react'
import { TUTORIAL_SECTIONS } from '../lib/tutorialContent.js'

// Lightweight first-run walkthrough. Steps through the same content as the
// Tutorial tab, then sets a localStorage flag so it shows only once.

export default function FirstRunOverlay({ onClose, onOpenTutorial }) {
  const [i, setI] = useState(0)
  const s = TUTORIAL_SECTIONS[i]
  const last = i === TUTORIAL_SECTIONS.length - 1

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(4,4,9,0.86)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:440, background:'#0c0c18', border:`1px solid ${s.color}44`, borderRadius:16, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}>
        {/* progress dots */}
        <div style={{ display:'flex', gap:5, padding:'16px 20px 0' }}>
          {TUTORIAL_SECTIONS.map((sec,j) => (
            <div key={sec.id} style={{ flex:1, height:3, borderRadius:2, background: j<=i ? s.color : '#1e1e2e', transition:'background .2s' }}/>
          ))}
        </div>

        <div style={{ padding:'24px 26px 8px' }}>
          <div style={{ width:54, height:54, borderRadius:13, background:`${s.color}1a`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:16 }}>{s.icon}</div>
          <div style={{ fontSize:10, fontFamily:'monospace', color:s.color, letterSpacing:'0.16em', marginBottom:8 }}>
            {i===0 ? 'GETTING STARTED' : `STEP ${i+1} OF ${TUTORIAL_SECTIONS.length}`}
          </div>
          <h2 style={{ margin:'0 0 12px', fontSize:22, fontWeight:400, color:'#f0ebe0' }}>{s.title}</h2>
          <p style={{ margin:'0 0 16px', fontSize:14, color:'#a8a398', lineHeight:1.8 }}>{s.overview}</p>
          {i > 0 && (
            <ul style={{ margin:'0 0 8px', paddingLeft:18, display:'flex', flexDirection:'column', gap:6 }}>
              {s.detail.slice(0,3).map((d,j) => (
                <li key={j} style={{ fontSize:12, color:'#7a7568', lineHeight:1.6 }}>{d}</li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'12px 22px 22px' }}>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#5a5550', fontSize:12, fontFamily:'monospace', cursor:'pointer' }}>Skip</button>
          <div style={{ display:'flex', gap:8 }}>
            {i > 0 && (
              <button onClick={()=>setI(i-1)} style={{ padding:'9px 16px', background:'transparent', border:'1px solid #2a2a3e', borderRadius:8, color:'#a8a398', fontSize:13, fontFamily:'monospace', cursor:'pointer' }}>Back</button>
            )}
            {last
              ? <button onClick={onClose} style={{ padding:'9px 20px', background:`${s.color}22`, border:`1px solid ${s.color}`, borderRadius:8, color:s.color, fontSize:13, fontFamily:'monospace', cursor:'pointer' }}>Get started</button>
              : <button onClick={()=>setI(i+1)} style={{ padding:'9px 20px', background:`${s.color}22`, border:`1px solid ${s.color}`, borderRadius:8, color:s.color, fontSize:13, fontFamily:'monospace', cursor:'pointer' }}>Next</button>
            }
          </div>
        </div>

        <div style={{ padding:'0 22px 18px', textAlign:'center' }}>
          <button onClick={()=>{ onClose(); onOpenTutorial && onOpenTutorial() }} style={{ background:'none', border:'none', color:'#3a3a55', fontSize:11, fontFamily:'monospace', cursor:'pointer', textDecoration:'underline' }}>
            View full tutorial anytime in Tools → Tutorial
          </button>
        </div>
      </div>
    </div>
  )
}
