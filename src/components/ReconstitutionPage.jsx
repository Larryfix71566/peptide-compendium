import { useState, useMemo } from 'react'

const ACCENT = '#2dd4bf'
const SYRINGES = {
  'U-100': { units: 100, label: 'U-100 (100 units = 1 mL)' },
  'U-50':  { units: 50,  label: 'U-50 (50 units = 0.5 mL)' },
  'U-40':  { units: 40,  label: 'U-40 (40 units = 1 mL)' },
}

function Field({ label, children, hint }) {
  return (
    <div style={{ flex:1, minWidth:140 }}>
      <label style={{ display:'block', fontSize:9, fontFamily:'monospace', color:'#6a6a8a', letterSpacing:'0.12em', marginBottom:6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize:9, color:'#3a3a55', fontFamily:'monospace', marginTop:4 }}>{hint}</div>}
    </div>
  )
}
const inp = { width:'100%', boxSizing:'border-box', padding:'9px 12px', background:'#0f0f20', border:'1px solid #2a2a3e', borderRadius:6, color:'#ddd8cc', fontSize:14, fontFamily:'monospace', outline:'none' }

export default function ReconstitutionPage() {
  const [mg, setMg]           = useState(5)
  const [water, setWater]     = useState(2)
  const [dose, setDose]       = useState(250)      // mcg
  const [syringe, setSyringe] = useState('U-100')

  const concentration = useMemo(() => (mg > 0 && water > 0 ? (mg / water) : 0), [mg, water]) // mg/mL
  const concMcgPerMl  = concentration * 1000
  const doseMl        = concMcgPerMl > 0 ? (dose / concMcgPerMl) : 0
  const sUnits        = SYRINGES[syringe].units
  const drawUnits     = doseMl * sUnits  // units on the chosen syringe (U-100: 1mL=100u)

  // Matrix rows: 1..10 mg in the same water volume
  const matrix = useMemo(() => {
    const rows = []
    for (let m = 1; m <= 10; m++) {
      const conc = water > 0 ? (m / water) * 1000 : 0 // mcg/mL
      const ml = conc > 0 ? dose / conc : 0
      rows.push({ mg: m, concMcgPerMl: conc, ml, units: ml * sUnits })
    }
    return rows
  }, [water, dose, sUnits])

  const tickMax = sUnits
  const drawClamped = Math.min(Math.max(drawUnits, 0), tickMax)

  return (
    <div style={{ overflowY:'auto', flex:1, scrollbarWidth:'thin', scrollbarColor:'#1e1e2e transparent' }}>
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0a0a14 0%,#0d1518 50%,#0a0a14 100%)', padding:'40px 60px 32px', borderBottom:'1px solid #131320' }}>
        <div style={{ fontSize:11, fontFamily:'monospace', color:ACCENT, letterSpacing:'0.18em', marginBottom:12 }}>RECONSTITUTION CALCULATOR</div>
        <h1 style={{ margin:'0 0 12px', fontSize:34, fontWeight:300, color:'#f0ebe0' }}>Peptide Dosing Calculator</h1>
        <p style={{ margin:0, fontSize:14, color:'#8a857a', lineHeight:1.8, maxWidth:680 }}>
          Enter your vial strength, bacteriostatic water volume, and target dose. The calculator returns the exact volume and the units to draw on your insulin syringe, with a live reference matrix below.
        </p>
      </div>

      <div style={{ padding:'32px 60px 48px', maxWidth:1000 }}>
        {/* Inputs */}
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:24 }}>
          <Field label="VIAL STRENGTH (MG)" hint="Total peptide in vial">
            <input type="number" value={mg} min={0} step={0.5} onChange={e=>setMg(parseFloat(e.target.value)||0)} style={inp}/>
          </Field>
          <Field label="BAC WATER (ML)" hint="Volume you'll add">
            <input type="number" value={water} min={0} step={0.5} onChange={e=>setWater(parseFloat(e.target.value)||0)} style={inp}/>
          </Field>
          <Field label="TARGET DOSE (MCG)" hint="Per injection">
            <input type="number" value={dose} min={0} step={50} onChange={e=>setDose(parseFloat(e.target.value)||0)} style={inp}/>
          </Field>
          <Field label="SYRINGE TYPE">
            <select value={syringe} onChange={e=>setSyringe(e.target.value)} style={{...inp, cursor:'pointer'}}>
              {Object.entries(SYRINGES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
        </div>

        {/* Result */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:28 }}>
          <ResultCard label="CONCENTRATION" value={`${concentration.toFixed(2)} mg/mL`} sub={`${Math.round(concMcgPerMl)} mcg/mL`} accent={ACCENT}/>
          <ResultCard label="DRAW VOLUME" value={`${doseMl.toFixed(3)} mL`} sub={`for ${dose} mcg`} accent={ACCENT}/>
          <ResultCard label={`DRAW ON ${syringe}`} value={`${drawUnits.toFixed(1)} units`} sub={`to the ${Math.round(drawUnits)} tick`} accent={ACCENT} big/>
        </div>

        {/* Syringe visual */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:10, fontFamily:'monospace', color:ACCENT, letterSpacing:'0.14em', marginBottom:12 }}>SYRINGE FILL ({syringe})</div>
          <SyringeBar units={sUnits} fill={drawClamped} accent={ACCENT}/>
          {drawUnits > tickMax && (
            <div style={{ marginTop:8, fontSize:11, fontFamily:'monospace', color:'#f87171' }}>
              ⚠ Dose exceeds one {syringe} syringe ({tickMax} units). You'd need {(drawUnits/tickMax).toFixed(1)} syringes — consider a higher concentration.
            </div>
          )}
        </div>

        {/* Live matrix */}
        <div style={{ fontSize:10, fontFamily:'monospace', color:ACCENT, letterSpacing:'0.14em', marginBottom:14 }}>
          REFERENCE MATRIX — {dose} MCG DOSE, {water} ML WATER, {syringe}
        </div>
        <div style={{ overflowX:'auto', border:'1px solid #1a1a28', borderRadius:8 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'monospace', fontSize:12 }}>
            <thead>
              <tr style={{ background:'#0c0c18' }}>
                <Th>Vial mg</Th><Th>Concentration</Th><Th>Draw mL</Th><Th>{syringe} units</Th><Th>Syringe</Th>
              </tr>
            </thead>
            <tbody>
              {matrix.map(r => {
                const over = r.units > sUnits
                const isCurrent = r.mg === Number(mg)
                return (
                  <tr key={r.mg} style={{ background: isCurrent ? `${ACCENT}12` : 'transparent', borderTop:'1px solid #131320' }}>
                    <Td accent={isCurrent}>{r.mg} mg{isCurrent ? ' ←' : ''}</Td>
                    <Td>{Math.round(r.concMcgPerMl)} mcg/mL</Td>
                    <Td>{r.ml.toFixed(3)} mL</Td>
                    <Td accent={isCurrent} warn={over}>{r.units.toFixed(1)}{over ? ' ⚠' : ''}</Td>
                    <Td><MiniSyringe units={sUnits} fill={Math.min(r.units,sUnits)} accent={ACCENT}/></Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop:24, padding:'12px 16px', background:'#08080f', border:'1px solid #131320', borderRadius:8, fontSize:11, fontFamily:'monospace', color:'#2d2d45', lineHeight:1.8 }}>
          ⚠ Educational tool only. Verify all calculations independently before any use. Not medical advice.
        </div>
      </div>
    </div>
  )
}

function ResultCard({ label, value, sub, accent, big }) {
  return (
    <div style={{ background:'#0c0c18', border:`1px solid ${accent}33`, borderTop:`2px solid ${accent}`, borderRadius:8, padding:'16px 18px' }}>
      <div style={{ fontSize:9, fontFamily:'monospace', color:'#6a6a8a', letterSpacing:'0.12em', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize: big ? 26 : 20, color: accent, fontFamily:'monospace', fontWeight:500 }}>{value}</div>
      {sub && <div style={{ fontSize:10, fontFamily:'monospace', color:'#5a5550', marginTop:4 }}>{sub}</div>}
    </div>
  )
}

function SyringeBar({ units, fill, accent }) {
  const pct = units > 0 ? (fill / units) * 100 : 0
  const ticks = []
  const step = units / 10
  for (let i = 0; i <= 10; i++) ticks.push(Math.round(i * step))
  return (
    <div>
      <div style={{ position:'relative', height:38, background:'#0c0c18', border:'1px solid #2a2a3e', borderRadius:'6px', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, bottom:0, width:`${Math.min(pct,100)}%`, background:`linear-gradient(90deg,${accent}33,${accent}66)`, borderRight:`2px solid ${accent}`, transition:'width .2s' }}/>
        {ticks.map((t,i) => (
          <div key={i} style={{ position:'absolute', left:`${(i/10)*100}%`, top:0, bottom:0, borderLeft: i===0?'none':'1px solid #1e1e2e', display:'flex', alignItems:'flex-end', paddingBottom:2 }}>
            <span style={{ fontSize:7, fontFamily:'monospace', color:'#4a4a6a', marginLeft:2 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniSyringe({ units, fill, accent }) {
  const pct = units > 0 ? (fill / units) * 100 : 0
  return (
    <div style={{ position:'relative', height:14, width:90, background:'#0a0a14', border:'1px solid #2a2a3e', borderRadius:3, overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, bottom:0, width:`${Math.min(pct,100)}%`, background:`${accent}55`, borderRight:`1.5px solid ${accent}` }}/>
    </div>
  )
}

function Th({ children }) {
  return <th style={{ textAlign:'left', padding:'10px 14px', fontSize:9, color:'#6a6a8a', letterSpacing:'0.1em', fontWeight:'normal', whiteSpace:'nowrap' }}>{children}</th>
}
function Td({ children, accent, warn }) {
  return <td style={{ padding:'9px 14px', color: warn ? '#f87171' : accent ? '#2dd4bf' : '#a8a398', whiteSpace:'nowrap' }}>{children}</td>
}
