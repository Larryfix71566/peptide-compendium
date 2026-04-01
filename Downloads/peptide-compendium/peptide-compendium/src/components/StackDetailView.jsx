function SecLabel({ color, children }) {
  return (
    <div style={{ fontSize:9, color, fontFamily:'monospace', letterSpacing:'0.16em',
      marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ display:'inline-block', width:18, height:1, background:color, opacity:0.5 }} />
      {children}
    </div>
  )
}

function InfoBlock({ label, value, color }) {
  return (
    <div style={{ background:'#09090f', border:'1px solid #181828', borderRadius:7,
      padding:'14px 16px', borderTop:`2px solid ${color}44` }}>
      <div style={{ fontSize:9, color:'#3a3a55', fontFamily:'monospace', letterSpacing:'0.14em', marginBottom:6 }}>{label}</div>
      <p style={{ margin:0, fontSize:13, color:'#b8b3a8', lineHeight:1.7 }}>{value}</p>
    </div>
  )
}

export default function StackDetailView({ stack, peptideMap, onSelectPeptide, allCategories }) {
  const col = stack.color_hex
  const peptides = stack.peptideRoles.map(r => ({
    ...(peptideMap[r.peptide_id] || {}),
    role: r.role,
    peptide_id: r.peptide_id,
  })).filter(p => p.id)

  // Find the primary category for each peptide (for navigation)
  const catForPeptide = {}
  allCategories.forEach(cat => {
    const pool = cat.isCondition
      ? (cat.subcategories || []).flatMap(s => s.peptides)
      : (cat.peptides || [])
    pool.forEach(p => { if (!catForPeptide[p.id] && !cat.isCondition) catForPeptide[p.id] = cat })
  })

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'36px 48px 48px',
      scrollbarWidth:'thin', scrollbarColor:'#181828 transparent' }}>

      {/* Header */}
      <div style={{ marginBottom:6 }}>
        <div style={{ fontSize:10, fontFamily:'monospace', color:col, letterSpacing:'0.14em', marginBottom:8 }}>
          {stack.subcategory.toUpperCase()}
        </div>
        <h1 style={{ margin:'0 0 6px', fontSize:30, fontWeight:'normal', color:'#f0ebe0' }}>
          {stack.name}
        </h1>
        {stack.nickname && (
          <div style={{ fontSize:13, color:'#4a4a6a', fontFamily:'monospace', marginBottom:10 }}>
            {stack.nickname}
          </div>
        )}
        {/* Component peptide pills */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:12 }}>
          {peptides.map(p => (
            <span key={p.id} style={{ padding:'4px 14px', background:`${col}1a`, color:col,
              borderRadius:5, fontSize:12, fontFamily:'monospace', border:`1px solid ${col}33`,
              cursor:'pointer' }}
              onClick={() => {
                const cat = catForPeptide[p.id]
                if (cat) onSelectPeptide(cat, p)
              }}>
              {p.name} ↗
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height:1, background:`linear-gradient(90deg, ${col}44 0%, transparent 80%)`,
        margin:'20px 0 28px' }} />

      <div style={{ display:'flex', flexDirection:'column', gap:28 }}>

        {/* Overview */}
        <section>
          <SecLabel color={col}>STACK OVERVIEW</SecLabel>
          <p style={{ margin:0, lineHeight:1.85, color:'#b8b3a8', fontSize:14 }}>{stack.overview}</p>
        </section>

        {/* Synergy */}
        <section>
          <SecLabel color={col}>WHY THESE PEPTIDES WORK TOGETHER</SecLabel>
          <div style={{ background:`${col}06`, border:`1px solid ${col}22`,
            borderLeft:`3px solid ${col}`, borderRadius:'0 7px 7px 0', padding:'16px 20px' }}>
            <p style={{ margin:0, fontSize:14, color:'#c4bfb0', lineHeight:1.85 }}>{stack.synergy}</p>
          </div>
        </section>

        {/* Component peptides with roles */}
        <section>
          <SecLabel color={col}>COMPONENT PEPTIDES & ROLES</SecLabel>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {peptides.map((p, i) => (
              <div key={p.id} style={{ background:'#09090f', border:'1px solid #181828',
                borderRadius:8, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'stretch' }}>
                  {/* Color band */}
                  <div style={{ width:3, background:col, flexShrink:0 }} />
                  <div style={{ flex:1, padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <span style={{ fontSize:10, fontFamily:'monospace', color: col,
                        background:`${col}15`, padding:'2px 8px', borderRadius:4 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize:14, color:'#d4cfc4', fontFamily:'monospace' }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize:10, fontFamily:'monospace', color:'#3a3a55' }}>
                        {p.class}
                      </span>
                      <button
                        onClick={() => {
                          const cat = catForPeptide[p.id]
                          if (cat) onSelectPeptide(cat, p)
                        }}
                        style={{ marginLeft:'auto', background:'transparent', border:`1px solid ${col}44`,
                          borderRadius:4, padding:'2px 10px', cursor:'pointer', fontSize:10,
                          fontFamily:'monospace', color:col }}>
                        View Detail →
                      </button>
                    </div>
                    <p style={{ margin:0, fontSize:12, color:'#6a6560', lineHeight:1.65 }}>{p.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Protocol */}
        <section>
          <SecLabel color={col}>PROTOCOL & DOSING</SecLabel>
          <InfoBlock label="FULL STACK PROTOCOL" value={stack.protocol} color={col} />
        </section>

        {/* Timing */}
        {stack.timing_notes && (
          <section>
            <SecLabel color={col}>TIMING GUIDANCE</SecLabel>
            <div style={{ background:'#09090f', border:'1px solid #181828',
              borderLeft:`3px solid ${col}55`, borderRadius:'0 7px 7px 0', padding:'14px 18px' }}>
              <p style={{ margin:0, fontSize:13, color:'#7a7568', lineHeight:1.85, fontStyle:'italic' }}>
                {stack.timing_notes}
              </p>
            </div>
          </section>
        )}

        {/* Avoid */}
        {stack.avoid_notes && (
          <section>
            <SecLabel color={col}>WHAT TO AVOID</SecLabel>
            <div style={{ background:'#1a0808', border:'1px solid #f8717133',
              borderLeft:'3px solid #f87171', borderRadius:'0 7px 7px 0', padding:'14px 18px' }}>
              <p style={{ margin:0, fontSize:13, color:'#c87878', lineHeight:1.85 }}>
                {stack.avoid_notes}
              </p>
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <div style={{ padding:'10px 16px', background:'#07070c', border:'1px solid #131320',
          borderRadius:6, fontSize:10, color:'#272737', fontFamily:'monospace', lineHeight:1.7 }}>
          This stack protocol is for educational and research purposes only. It is NOT a prescription
          or medical recommendation. Many compounds are research chemicals not approved for human use.
          Consult a qualified healthcare provider before any use.
        </div>
      </div>
    </div>
  )
}
