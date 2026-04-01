const SUBCATEGORY_ORDER = [
  'Healing & Recovery',
  'GH Axis',
  'Fat Loss & Metabolic',
  'Mitochondrial & Longevity',
  'Cognitive & Neuro',
  'Immune & Thymic',
  'Sexual Function',
]

function StackCard({ stack, onSelect, peptideMap }) {
  const peptides = stack.peptideRoles.map(r => peptideMap[r.peptide_id]).filter(Boolean)
  return (
    <div
      onClick={() => onSelect(stack)}
      style={{ background:'#0c0c18', border:`1px solid #1a1a28`,
        borderLeft:`3px solid ${stack.color_hex}`, borderRadius:8,
        padding:'18px 20px', cursor:'pointer', transition:'background .15s' }}
      onMouseEnter={e => e.currentTarget.style.background='#0f0f22'}
      onMouseLeave={e => e.currentTarget.style.background='#0c0c18'}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:10 }}>
        <div style={{ width:36, height:36, borderRadius:8, background:`${stack.color_hex}18`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
          ⚗
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, color:'#d4cfc4', fontWeight:'normal', marginBottom:3 }}>{stack.name}</div>
          {stack.nickname && (
            <div style={{ fontSize:10, fontFamily:'monospace', color: stack.color_hex, opacity:0.8 }}>
              {stack.nickname}
            </div>
          )}
        </div>
        <div style={{ fontSize:11, color: stack.color_hex, opacity:0.5 }}>→</div>
      </div>

      {/* Overview snippet */}
      <p style={{ margin:'0 0 12px', fontSize:12, color:'#6a6560', lineHeight:1.65,
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
        {stack.overview}
      </p>

      {/* Peptide pills */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
        {peptides.map(p => (
          <span key={p.id} style={{ fontSize:10, fontFamily:'monospace', color: stack.color_hex,
            padding:'2px 8px', background:`${stack.color_hex}15`, borderRadius:4,
            border:`1px solid ${stack.color_hex}33` }}>
            {p.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function StacksPage({ stacks, onSelectStack, allCategories }) {
  // Build a quick peptide lookup map from all categories
  const peptideMap = {}
  allCategories.forEach(cat => {
    const pool = cat.isCondition
      ? (cat.subcategories || []).flatMap(s => s.peptides)
      : (cat.peptides || [])
    pool.forEach(p => { if (!peptideMap[p.id]) peptideMap[p.id] = p })
  })

  // Group stacks by subcategory in defined order
  const grouped = {}
  SUBCATEGORY_ORDER.forEach(sub => { grouped[sub] = [] })
  stacks.forEach(stack => {
    if (!grouped[stack.subcategory]) grouped[stack.subcategory] = []
    grouped[stack.subcategory].push(stack)
  })

  const totalStacks = stacks.length

  return (
    <div style={{ overflowY:'auto', flex:1, scrollbarWidth:'thin', scrollbarColor:'#1e1e2e transparent' }}>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg, #0a0a14 0%, #0d1218 50%, #0a0a14 100%)',
        padding:'48px 60px 40px', borderBottom:'1px solid #131320' }}>
        <div style={{ maxWidth:900 }}>
          <div style={{ fontSize:11, fontFamily:'monospace', color:'#a78bfa', letterSpacing:'0.18em', marginBottom:12 }}>
            STACKS & BLENDS
          </div>
          <h1 style={{ margin:'0 0 16px', fontSize:38, fontWeight:300, color:'#f0ebe0', lineHeight:1.2 }}>
            Research Peptide Stacks
          </h1>
          <p style={{ margin:'0 0 20px', fontSize:15, color:'#8a857a', lineHeight:1.85, maxWidth:720 }}>
            Peptides work best in complementary combinations. These {totalStacks} named stacks represent
            the most established multi-peptide protocols — each pairing compounds with non-overlapping
            mechanisms for additive or synergistic effects. Browse by goal, then drill into individual
            peptides for complete detail.
          </p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {SUBCATEGORY_ORDER.map(sub => {
              const count = (grouped[sub] || []).length
              if (!count) return null
              return (
                <span key={sub} style={{ padding:'4px 12px', borderRadius:20, fontSize:11,
                  fontFamily:'monospace', background:'#a78bfa15', color:'#a78bfa',
                  border:'1px solid #a78bfa33' }}>
                  {sub} ({count})
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stacks by subcategory */}
      {SUBCATEGORY_ORDER.map(sub => {
        const subStacks = grouped[sub] || []
        if (!subStacks.length) return null
        return (
          <div key={sub} style={{ padding:'40px 60px 0', borderBottom:'1px solid #131320', paddingBottom:40 }}>
            <div style={{ fontSize:10, fontFamily:'monospace', color:'#a78bfa',
              letterSpacing:'0.16em', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ display:'inline-block', width:18, height:1, background:'#a78bfa', opacity:0.5 }} />
              {sub.toUpperCase()}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:14 }}>
              {subStacks.map(stack => (
                <StackCard key={stack.id} stack={stack} onSelect={onSelectStack} peptideMap={peptideMap} />
              ))}
            </div>
          </div>
        )
      })}

      {/* Disclaimer */}
      <div style={{ padding:'32px 60px 40px' }}>
        <div style={{ padding:'14px 20px', background:'#08080f', border:'1px solid #131320',
          borderRadius:8, fontSize:11, fontFamily:'monospace', color:'#2d2d45', lineHeight:1.8 }}>
          ⚠ Stack protocols are for educational and research purposes only. Combining multiple peptides
          increases complexity, interaction potential, and monitoring requirements. Many compounds listed
          are research chemicals not approved for human use. Consult a qualified healthcare provider
          before considering any peptide protocol.
        </div>
      </div>
    </div>
  )
}
