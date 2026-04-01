import { useState, useEffect, useRef } from 'react'
import { fetchAll, fetchStacks, loadFavorites, addFavorite, removeFavorite } from './lib/supabase.js'
import HomePage from './components/HomePage.jsx'
import ProfileModal from './components/ProfileModal.jsx'
import StacksPage from './components/StacksPage.jsx'
import StackDetailView from './components/StackDetailView.jsx'

// ── Helpers ───────────────────────────────────────────────────

function statusColor(s) {
  if (s.includes('FDA-Approved')) return '#34d399'
  if (s.includes('Approved'))     return '#60a5fa'
  if (s.includes('Clinical'))     return '#fbbf24'
  if (s.includes('OTC') || s.includes('Supplement')) return '#a78bfa'
  return '#6b7280'
}

// ── Primitives ────────────────────────────────────────────────

function StatusPill({ status }) {
  const c = statusColor(status)
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 10px',
    borderRadius:20, fontSize:10, fontFamily:'monospace', letterSpacing:'0.05em', whiteSpace:'nowrap',
    border:`1px solid ${c}44`, color:c, background:`${c}15` }}>{status}</span>
}

function SecLabel({ color, children }) {
  return <div style={{ fontSize:9, color, fontFamily:'monospace', letterSpacing:'0.16em',
    marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
    <span style={{ display:'inline-block', width:18, height:1, background:color, opacity:0.5 }} />
    {children}
  </div>
}

function InfoCard({ label, value, color, highlight }) {
  return <div style={{ background: highlight ? `${color}08` : '#09090f',
    border:`1px solid ${highlight ? color + '33' : '#181828'}`,
    borderRadius:7, padding:'13px 16px', borderTop:`2px solid ${color}${highlight ? '88' : '44'}` }}>
    <div style={{ fontSize:9, color:'#3a3a55', fontFamily:'monospace', letterSpacing:'0.14em', marginBottom:5 }}>{label}</div>
    <div style={{ fontSize:13, color: highlight ? '#f0ebe0' : '#ddd8cc', fontFamily:'monospace', lineHeight:1.55 }}>{value}</div>
  </div>
}

function StackPanel({ title, isDo, items }) {
  const c = isDo ? '#34d399' : '#f87171'
  return <div style={{ flex:1, background:'#09090f', border:'1px solid #181828', borderRadius:8, overflow:'hidden' }}>
    <div style={{ padding:'11px 14px', borderBottom:'1px solid #181828',
      display:'flex', alignItems:'center', gap:7, background:`${c}08` }}>
      <span style={{ color:c, fontSize:14, fontWeight:'bold' }}>{isDo ? '✓' : '✕'}</span>
      <span style={{ fontSize:10, fontFamily:'monospace', letterSpacing:'0.12em', color:c }}>{title}</span>
    </div>
    <div>
      {items.map((item, i) => <div key={item.id || i} style={{ padding:'10px 14px',
        borderBottom: i < items.length-1 ? '1px solid #0e0e18' : 'none' }}>
        <div style={{ fontSize:12, fontFamily:'monospace', color:'#c4bfb0', marginBottom:4 }}>{item.item}</div>
        <div style={{ fontSize:12, color:'#5a5550', lineHeight:1.6 }}>{item.reason}</div>
      </div>)}
      {items.length === 0 && <div style={{ padding:'10px 14px', fontSize:12, color:'#3a3a55', fontFamily:'monospace' }}>None listed</div>}
    </div>
  </div>
}

// ── Featured In Stacks (cross-link on peptide pages) ──────────

function FeaturedInStacks({ peptideId, stacks, onSelectStack, color }) {
  const featured = stacks.filter(s => s.peptideRoles.some(r => r.peptide_id === peptideId))
  if (!featured.length) return null

  // Group by subcategory
  const bySubcat = {}
  featured.forEach(s => {
    if (!bySubcat[s.subcategory]) bySubcat[s.subcategory] = []
    bySubcat[s.subcategory].push(s)
  })

  return (
    <section>
      <SecLabel color={color}>FEATURED IN STACKS</SecLabel>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {Object.entries(bySubcat).map(([sub, subStacks]) => (
          <div key={sub}>
            <div style={{ fontSize:9, fontFamily:'monospace', color:'#3a3a55',
              letterSpacing:'0.12em', marginBottom:6 }}>{sub.toUpperCase()}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {subStacks.map(stack => (
                <button key={stack.id} onClick={() => onSelectStack(stack)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px',
                    background:`${stack.color_hex}0d`, border:`1px solid ${stack.color_hex}33`,
                    borderRadius:6, cursor:'pointer', textAlign:'left' }}
                  onMouseEnter={e => e.currentTarget.style.background=`${stack.color_hex}1a`}
                  onMouseLeave={e => e.currentTarget.style.background=`${stack.color_hex}0d`}>
                  <span style={{ fontSize:12, fontFamily:'monospace', color: stack.color_hex }}>
                    ⚗ {stack.name}
                  </span>
                  <span style={{ fontSize:10, fontFamily:'monospace', color:'#3a3a55' }}>
                    {stack.nickname}
                  </span>
                  <span style={{ fontSize:10, color: stack.color_hex, opacity:0.6 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Dosing Timing Section ─────────────────────────────────────

function DosingTimingSection({ timing, color }) {
  if (!timing) return null
  const rows = [
    { label:'OPTIMAL TIMING',    v: timing.optimal_timing },
    timing.loading_phase     && { label:'LOADING PHASE',      v: timing.loading_phase },
    timing.maintenance_phase && { label:'MAINTENANCE PHASE',  v: timing.maintenance_phase },
    timing.off_cycle         && { label:'OFF-CYCLE',          v: timing.off_cycle },
  ].filter(Boolean)
  return (
    <section>
      <SecLabel color={color}>DOSING TIMING & OPTIMIZATION</SecLabel>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:10, marginBottom:12 }}>
        {rows.map(row => (
          <div key={row.label} style={{ background:'#09090f', border:'1px solid #181828',
            borderRadius:7, padding:'13px 16px', borderTop:`2px solid ${color}22` }}>
            <div style={{ fontSize:9, color:'#3a3a55', fontFamily:'monospace', letterSpacing:'0.14em', marginBottom:6 }}>{row.label}</div>
            <div style={{ fontSize:13, color:'#b8b3a8', lineHeight:1.6 }}>{row.v}</div>
          </div>
        ))}
      </div>
      {timing.timing_notes && (
        <div style={{ background:'#09090f', border:'1px solid #181828',
          borderLeft:`3px solid ${color}55`, borderRadius:'0 7px 7px 0', padding:'14px 18px' }}>
          <p style={{ margin:0, fontSize:13, color:'#7a7568', lineHeight:1.85, fontStyle:'italic' }}>{timing.timing_notes}</p>
        </div>
      )}
    </section>
  )
}

// ── Condition Detail View ─────────────────────────────────────

function ConditionDetailView({ peptide, category, isFav, onToggleFav, stacks, onSelectStack }) {
  const col = category.color_hex
  const ctx = peptide.conditionContext
  const conditionBenefits = ctx?.condition_benefits
    ? ctx.condition_benefits.split('|').filter(Boolean) : peptide.benefits

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'36px 48px 48px',
      scrollbarWidth:'thin', scrollbarColor:'#181828 transparent' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:6, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ margin:'0 0 6px', fontSize:30, fontWeight:'normal', color:'#f0ebe0' }}>{peptide.name}</h1>
          <div style={{ fontSize:13, color:'#4a4a6a', fontFamily:'monospace', marginBottom:10 }}>{peptide.aka}</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ padding:'3px 12px', background:`${col}1a`, color:col, borderRadius:4, fontSize:11, fontFamily:'monospace', border:`1px solid ${col}33` }}>{peptide.class}</span>
            {peptide.subcategory && <span style={{ padding:'3px 12px', background:`${col}0d`, color:`${col}cc`, borderRadius:4, fontSize:11, fontFamily:'monospace', border:`1px solid ${col}22` }}>{peptide.subcategory}</span>}
            <StatusPill status={peptide.status} />
          </div>
        </div>
        <button onClick={onToggleFav} style={{ background: isFav ? `${col}18` : 'transparent', border:`1px solid ${isFav ? col : '#1e1e2e'}`, borderRadius:8, padding:'9px 16px', cursor:'pointer', color: isFav ? col : '#3a3a55', fontSize:20, flexShrink:0 }}>{isFav ? '★' : '☆'}</button>
      </div>
      <div style={{ height:1, background:`linear-gradient(90deg, ${col}44 0%, transparent 80%)`, margin:'20px 0 28px' }} />
      <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
        {ctx?.condition_rationale && (
          <section>
            <SecLabel color={col}>WHY THIS PEPTIDE FOR {category.label.toUpperCase()}</SecLabel>
            <div style={{ background:`${col}08`, border:`1px solid ${col}22`, borderLeft:`3px solid ${col}`, borderRadius:'0 7px 7px 0', padding:'16px 20px' }}>
              <p style={{ margin:0, fontSize:14, color:'#c4bfb0', lineHeight:1.85 }}>{ctx.condition_rationale}</p>
            </div>
          </section>
        )}
        <section>
          <SecLabel color={col}>HOW THIS APPLIES TO {category.label.toUpperCase()}</SecLabel>
          <p style={{ margin:0, lineHeight:1.85, color:'#b8b3a8', fontSize:14 }}>{ctx?.condition_mechanism || peptide.mechanism}</p>
        </section>
        <section>
          <SecLabel color={col}>BENEFITS FOR {category.label.toUpperCase()}</SecLabel>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {conditionBenefits.map((b,i) => <span key={i} style={{ padding:'5px 13px', background:`${col}12`, color:col, borderRadius:5, fontSize:12, fontFamily:'monospace', border:`1px solid ${col}2a` }}>{b}</span>)}
          </div>
        </section>
        <section>
          <SecLabel color={col}>DOSING & ADMINISTRATION</SecLabel>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(185px, 1fr))', gap:10 }}>
            <InfoCard label="DOSE" value={peptide.dosing} color={col} />
            <InfoCard label="FREQUENCY" value={peptide.frequency} color={col} />
            <InfoCard label="CYCLE LENGTH" value={peptide.cycle} color={col} />
            <InfoCard label="ROUTE" value={peptide.route} color={col} />
            {ctx?.condition_dosing_note && <InfoCard label={`${category.label.toUpperCase()} DOSING NOTE`} value={ctx.condition_dosing_note} color={col} highlight={true} />}
          </div>
        </section>
        <DosingTimingSection timing={peptide.dosingTiming} color={col} />
        {ctx?.condition_stack_note && (
          <section>
            <SecLabel color={col}>STACKING FOR {category.label.toUpperCase()}</SecLabel>
            <div style={{ background:'#09090f', border:`1px solid ${col}22`, borderLeft:`3px solid ${col}66`, borderRadius:'0 7px 7px 0', padding:'15px 20px' }}>
              <p style={{ margin:0, fontSize:13, color:'#a8a398', lineHeight:1.85 }}>{ctx.condition_stack_note}</p>
            </div>
          </section>
        )}
        <FeaturedInStacks peptideId={peptide.id} stacks={stacks} onSelectStack={onSelectStack} color={col} />
        <section>
          <SecLabel color={col}>SIDE EFFECTS & CONSIDERATIONS</SecLabel>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:8 }}>
            {peptide.sideEffects.map((fx,i) => <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'#7a7568' }}><span style={{ color:'#272737', marginTop:5, flexShrink:0, fontSize:8 }}>■</span>{fx}</div>)}
          </div>
        </section>
        <section>
          <SecLabel color={col}>GENERAL STACKING GUIDE</SecLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <StackPanel title="STACK WITH" isDo={true} items={peptide.stackDos} />
            <StackPanel title="AVOID COMBINING" isDo={false} items={peptide.stackDonts} />
          </div>
        </section>
        <section>
          <SecLabel color={col}>CLINICAL NOTES</SecLabel>
          <div style={{ background:'#09090f', border:'1px solid #181828', borderLeft:`3px solid ${col}66`, borderRadius:'0 7px 7px 0', padding:'15px 20px' }}>
            <p style={{ margin:0, fontSize:13, color:'#7a7568', lineHeight:1.85, fontStyle:'italic' }}>{peptide.notes}</p>
          </div>
        </section>
        <div style={{ padding:'10px 16px', background:'#07070c', border:'1px solid #131320', borderRadius:6, fontSize:10, color:'#272737', fontFamily:'monospace', lineHeight:1.7 }}>
          This reference is for educational and research purposes only. It is NOT a prescription or medical recommendation. Consult a qualified healthcare provider before any use.
        </div>
      </div>
    </div>
  )
}

// ── Standard Detail View ──────────────────────────────────────

function DetailView({ peptide, category, isFav, onToggleFav, stacks, onSelectStack }) {
  if (!peptide) return null
  if (category.isCondition) return <ConditionDetailView peptide={peptide} category={category} isFav={isFav} onToggleFav={onToggleFav} stacks={stacks} onSelectStack={onSelectStack} />

  const col = category.color_hex
  const t   = peptide.dosingTiming

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'36px 48px 48px', scrollbarWidth:'thin', scrollbarColor:'#181828 transparent' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:6, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ margin:'0 0 6px', fontSize:30, fontWeight:'normal', color:'#f0ebe0' }}>{peptide.name}</h1>
          <div style={{ fontSize:13, color:'#4a4a6a', fontFamily:'monospace', marginBottom:10 }}>{peptide.aka}</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ padding:'3px 12px', background:`${col}1a`, color:col, borderRadius:4, fontSize:11, fontFamily:'monospace', border:`1px solid ${col}33` }}>{peptide.class}</span>
            <StatusPill status={peptide.status} />
          </div>
        </div>
        <button onClick={onToggleFav} style={{ background: isFav ? `${col}18` : 'transparent', border:`1px solid ${isFav ? col : '#1e1e2e'}`, borderRadius:8, padding:'9px 16px', cursor:'pointer', color: isFav ? col : '#3a3a55', fontSize:20, flexShrink:0 }}>{isFav ? '★' : '☆'}</button>
      </div>
      <div style={{ height:1, background:`linear-gradient(90deg, ${col}44 0%, transparent 80%)`, margin:'20px 0 28px' }} />
      <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
        <section>
          <SecLabel color={col}>MECHANISM OF ACTION</SecLabel>
          <p style={{ margin:0, lineHeight:1.85, color:'#b8b3a8', fontSize:14 }}>{peptide.mechanism}</p>
        </section>
        <section>
          <SecLabel color={col}>BENEFITS & INDICATIONS</SecLabel>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {peptide.benefits.map((b,i) => <span key={i} style={{ padding:'5px 13px', background:`${col}12`, color:col, borderRadius:5, fontSize:12, fontFamily:'monospace', border:`1px solid ${col}2a` }}>{b}</span>)}
          </div>
        </section>
        <section>
          <SecLabel color={col}>DOSING & ADMINISTRATION</SecLabel>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(185px, 1fr))', gap:10 }}>
            <InfoCard label="DOSE" value={peptide.dosing} color={col} />
            <InfoCard label="FREQUENCY" value={peptide.frequency} color={col} />
            <InfoCard label="CYCLE LENGTH" value={peptide.cycle} color={col} />
            <InfoCard label="ROUTE" value={peptide.route} color={col} />
          </div>
        </section>
        <DosingTimingSection timing={t} color={col} />
        <FeaturedInStacks peptideId={peptide.id} stacks={stacks} onSelectStack={onSelectStack} color={col} />
        <section>
          <SecLabel color={col}>SIDE EFFECTS & CONSIDERATIONS</SecLabel>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:8 }}>
            {peptide.sideEffects.map((fx,i) => <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'#7a7568' }}><span style={{ color:'#272737', marginTop:5, flexShrink:0, fontSize:8 }}>■</span>{fx}</div>)}
          </div>
        </section>
        <section>
          <SecLabel color={col}>STACKING GUIDE</SecLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <StackPanel title="STACK WITH" isDo={true} items={peptide.stackDos} />
            <StackPanel title="AVOID COMBINING" isDo={false} items={peptide.stackDonts} />
          </div>
        </section>
        <section>
          <SecLabel color={col}>CLINICAL NOTES</SecLabel>
          <div style={{ background:'#09090f', border:'1px solid #181828', borderLeft:`3px solid ${col}66`, borderRadius:'0 7px 7px 0', padding:'15px 20px' }}>
            <p style={{ margin:0, fontSize:13, color:'#7a7568', lineHeight:1.85, fontStyle:'italic' }}>{peptide.notes}</p>
          </div>
        </section>
        <div style={{ padding:'10px 16px', background:'#07070c', border:'1px solid #131320', borderRadius:6, fontSize:10, color:'#272737', fontFamily:'monospace', lineHeight:1.7 }}>
          This reference is for educational and research purposes only. It is NOT a prescription or medical recommendation. Many compounds are research chemicals not approved for human use. Consult a qualified healthcare provider before any use.
        </div>
      </div>
    </div>
  )
}

// ── Top Navigation ────────────────────────────────────────────

function TopNav({ categories, activeCatId, selectedPeptide, onSelectPeptide,
                  favorites, favFilter, onToggleFavFilter, search, onSearch,
                  onHome, showHome, onShowStacks, showStacks, stacks, onSelectStack }) {
  const [openCat, setOpenCat] = useState(null)
  const navRef = useRef(null)
  const favCount = Object.keys(favorites).length
  const STACK_COLOR = '#a78bfa'

  useEffect(() => {
    const handler = e => { if (navRef.current && !navRef.current.contains(e.target)) setOpenCat(null) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handlePeptideClick = (cat, p) => { onSelectPeptide(cat, p); setOpenCat(null) }
  const openCategory = categories.find(c => c.id === openCat)

  return (
    <div ref={navRef} style={{ flexShrink:0, background:'#0c0c18', borderBottom:'1px solid #1e1e2e', position:'relative', zIndex:100 }}>

      {/* Header bar */}
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 24px', borderBottom:'1px solid #1e1e2e' }}>
        <button onClick={() => { onHome(); setOpenCat(null) }}
          style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'rgba(45,212,191,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⬡</div>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontSize:14, color: showHome ? '#2dd4bf' : '#c8c3b8', letterSpacing:'0.02em', whiteSpace:'nowrap' }}>Peptide Compendium</div>
            <div style={{ fontSize:9, fontFamily:'monospace', color:'#4a4a6a', letterSpacing:'0.12em' }}>REFERENCE GUIDE</div>
          </div>
        </button>

        {/* Search */}
        <div style={{ flex:1, position:'relative', maxWidth:400 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#6a6a8a', fontSize:14 }}>⌕</span>
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search compounds..."
            style={{ width:'100%', boxSizing:'border-box', padding:'8px 30px 8px 32px', background:'#0f0f20', border:'1px solid #2a2a3e', borderRadius:6, color:'#c8c3b8', fontSize:12, fontFamily:'monospace', outline:'none' }} />
          {search && <button onClick={() => onSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#3a3a55', cursor:'pointer', fontSize:15 }}>×</button>}
        </div>

        {/* Favorites */}
        <button onClick={onToggleFavFilter}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:6, cursor:'pointer', flexShrink:0,
            background: favFilter ? '#1e1208' : 'transparent',
            border:`1px solid ${favFilter ? '#f97316aa' : '#2a2a3e'}`,
            color: favFilter ? '#f97316' : '#8a8598', fontSize:11, fontFamily:'monospace' }}>
          <span style={{ fontSize:14 }}>{favFilter ? '★' : '☆'}</span>
          <span>FAVORITES</span>
          {favCount > 0 && <span style={{ background:'#f9731622', color:'#f97316', borderRadius:10, padding:'0 6px', fontSize:10 }}>{favCount}</span>}
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display:'flex', alignItems:'stretch', overflowX:'auto', padding:'0 16px', scrollbarWidth:'none', gap:2 }}>
        {categories.map(cat => {
          const isOpen   = openCat === cat.id
          const isActive = activeCatId === cat.id && !showHome && !showStacks
          const isCondition = cat.isCondition
          return (
            <button key={cat.id}
              onClick={() => { setOpenCat(prev => prev === cat.id ? null : cat.id); onSearch('') }}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 16px',
                background: isOpen ? `${cat.color_hex}22` : 'transparent',
                border:'none', borderBottom:`2px solid ${isActive || isOpen ? cat.color_hex : 'transparent'}`,
                color: isActive || isOpen ? cat.color_hex : isCondition ? '#c4a8c4' : '#a8a398',
                cursor:'pointer', whiteSpace:'nowrap', fontSize:11, fontFamily:'monospace',
                letterSpacing:'0.04em', transition:'all .15s', flexShrink:0 }}>
              {isCondition && <span style={{ fontSize:9, opacity:0.8 }}>✦</span>}
              <span>{cat.label}</span>
              <span style={{ fontSize:9, opacity:0.6 }}>{isOpen ? '▲' : '▼'}</span>
            </button>
          )
        })}

        {/* Stacks & Blends tab */}
        <button onClick={() => { onShowStacks(); setOpenCat(null); onSearch('') }}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 16px',
            background: showStacks ? `${STACK_COLOR}22` : 'transparent',
            border:'none', borderBottom:`2px solid ${showStacks ? STACK_COLOR : 'transparent'}`,
            color: showStacks ? STACK_COLOR : '#a8a398',
            cursor:'pointer', whiteSpace:'nowrap', fontSize:11, fontFamily:'monospace',
            letterSpacing:'0.04em', transition:'all .15s', flexShrink:0 }}>
          <span style={{ fontSize:9 }}>⚗</span>
          <span>Stacks & Blends</span>
        </button>
      </div>

      {/* Global search results */}
      {search && (() => {
        const allResults = []
        categories.forEach(cat => {
          const pool = cat.isCondition
            ? (cat.subcategories || []).flatMap(s => s.peptides)
            : (cat.peptides || [])
          pool.forEach(p => {
            if ([p.name, p.aka, p.class].join(' ').toLowerCase().includes(search.toLowerCase())) {
              allResults.push({ p, cat })
            }
          })
        })
        const seen = new Set()
        const unique = allResults.filter(({ p }) => { if (seen.has(p.id)) return false; seen.add(p.id); return true })
        return (
          <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#0c0c18',
            borderBottom:'1px solid #1e1e2e', borderTop:'1px solid #2dd4bf33',
            boxShadow:'0 8px 32px rgba(0,0,0,0.7)', maxHeight:'60vh', overflowY:'auto', zIndex:200 }}>
            <div style={{ padding:'8px 20px', borderBottom:'1px solid #1e1e2e',
              fontSize:9, fontFamily:'monospace', color:'#2dd4bf', letterSpacing:'0.14em', background:'#2dd4bf08' }}>
              {unique.length} RESULT{unique.length !== 1 ? 'S' : ''} FOR "{search.toUpperCase()}"
            </div>
            {unique.length === 0
              ? <div style={{ padding:'20px 24px', fontSize:12, fontFamily:'monospace', color:'#4a4a6a' }}>No compounds found</div>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))' }}>
                  {unique.map(({ p, cat }) => (
                    <button key={p.id} onClick={() => { handlePeptideClick(cat, p); onSearch('') }}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 20px',
                        background:'transparent', border:'none', borderLeft:`2px solid ${cat.color_hex}66`,
                        cursor:'pointer', textAlign:'left', transition:'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#0f0f20'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontFamily:'monospace', color:'#d4cfc4', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                        <div style={{ fontSize:10, fontFamily:'monospace', color: cat.color_hex, marginTop:2, opacity:0.8 }}>{cat.label}</div>
                        <div style={{ fontSize:9, fontFamily:'monospace', color:'#4a4a6a', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.class}</div>
                      </div>
                    </button>
                  ))}
                </div>
            }
          </div>
        )
      })()}

      {/* Category dropdown */}
      {!search && openCat && openCategory && (() => {
        const cat = openCategory
        if (cat.isCondition) {
          return (
            <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#090912',
              borderBottom:'1px solid #131320', borderTop:`1px solid ${cat.color_hex}33`,
              boxShadow:'0 8px 32px rgba(0,0,0,0.6)', maxHeight:'60vh', overflowY:'auto' }}>
              {cat.subcategories.map(sub => (
                <div key={sub.name}>
                  <div style={{ padding:'8px 20px 6px', fontSize:9, fontFamily:'monospace',
                    color: cat.color_hex, letterSpacing:'0.14em', background:`${cat.color_hex}0a`,
                    borderBottom:`1px solid ${cat.color_hex}22` }}>{sub.name.toUpperCase()}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))' }}>
                    {sub.peptides.map(p => <PeptideDropdownItem key={`${cat.id}-${p.id}`} p={p} cat={cat}
                      selectedPeptide={selectedPeptide} favorites={favorites}
                      onClick={() => handlePeptideClick(cat, p)} />)}
                  </div>
                </div>
              ))}
            </div>
          )
        }
        const favFiltered = favFilter
          ? (cat.peptides || []).filter(p => !!favorites[p.id])
          : (cat.peptides || [])
        return (
          <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#0c0c18',
            borderBottom:'1px solid #1e1e2e', borderTop:`1px solid ${cat.color_hex}33`,
            boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
            display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {favFiltered.length === 0
              ? <div style={{ padding:'20px 24px', fontSize:12, fontFamily:'monospace', color:'#4a4a6a' }}>No compounds found</div>
              : favFiltered.map(p => <PeptideDropdownItem key={p.id} p={p} cat={cat}
                  selectedPeptide={selectedPeptide} favorites={favorites}
                  onClick={() => handlePeptideClick(cat, p)} />)
            }
          </div>
        )
      })()}
    </div>
  )
}

function PeptideDropdownItem({ p, cat, selectedPeptide, favorites, onClick }) {
  const isActive = selectedPeptide?.id === p.id
  const isFav    = !!favorites[p.id]
  return (
    <button onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 20px',
        background: isActive ? `${cat.color_hex}12` : 'transparent',
        border:'none', borderLeft:`2px solid ${isActive ? cat.color_hex : 'transparent'}`,
        cursor:'pointer', textAlign:'left', transition:'background .1s' }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='#0c0c1a' }}
      onMouseLeave={e => { e.currentTarget.style.background = isActive ? `${cat.color_hex}12` : 'transparent' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontFamily:'monospace', color: isActive ? cat.color_hex : '#a8a398', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
        <div style={{ fontSize:10, fontFamily:'monospace', color:'#2d2d45', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.class}</div>
      </div>
      {isFav && <span style={{ color:'#f97316', fontSize:10, flexShrink:0 }}>★</span>}
    </button>
  )
}

// ── Loading Screen ────────────────────────────────────────────

function LoadingScreen({ error }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#07070e', gap:20 }}>
      <div style={{ width:70, height:70, borderRadius:'50%', background:'rgba(45,212,191,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>⬡</div>
      <div>
        <div style={{ fontSize:22, fontWeight:'normal', color:'#f0ebe0', textAlign:'center' }}>Peptide Compendium</div>
        <div style={{ fontSize:10, fontFamily:'monospace', color:'#4a4a6a', letterSpacing:'0.14em', textAlign:'center', marginTop:4 }}>REFERENCE GUIDE</div>
      </div>
      {error
        ? <div style={{ fontSize:13, fontFamily:'monospace', color:'#f87171', background:'#1a0a0a', border:'1px solid #f8717133', borderRadius:6, padding:'12px 20px', maxWidth:400, textAlign:'center' }}>Error: {error}</div>
        : <><div style={{ display:'flex', gap:6 }}>{[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#2dd4bf', opacity:0.6, animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite alternate` }} />)}</div><style>{`@keyframes pulse{from{opacity:.2}to{opacity:1}}`}</style></>
      }
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────

export default function App() {
  const [categories, setCategories]               = useState([])
  const [stacks, setStacks]                       = useState([])
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState(null)
  const [selectedPeptide, setSelectedPeptide]     = useState(null)
  const [selectedCategory, setSelectedCategory]   = useState(null)
  const [selectedStack, setSelectedStack]         = useState(null)
  const [showHome, setShowHome]                   = useState(true)
  const [showStacks, setShowStacks]               = useState(false)
  const [favorites, setFavorites]                 = useState({})
  const [favFilter, setFavFilter]                 = useState(false)
  const [search, setSearch]                       = useState('')
  const [userKey, setUserKey]                     = useState(() => localStorage.getItem('peptide_user_key') || null)
  const [showProfileModal, setShowProfileModal]   = useState(false)

  useEffect(() => { if (!userKey) setShowProfileModal(true) }, [])

  useEffect(() => {
    Promise.all([fetchAll(), fetchStacks()])
      .then(([cats, stks]) => { setCategories(cats); setStacks(stks); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!userKey || userKey === '__guest__') return
    loadFavorites(userKey).then(rows => {
      const map = {}
      rows.forEach(r => { map[r.peptide_id] = true })
      setFavorites(map)
    })
  }, [userKey])

  const handleProfileConfirm = (key) => {
    localStorage.setItem('peptide_user_key', key)
    setUserKey(key)
    setShowProfileModal(false)
  }

  const toggleFav = async (peptide, category) => {
    const pid = peptide.id
    const isCurrent = !!favorites[pid]
    setFavorites(prev => { const n = {...prev}; if (isCurrent) delete n[pid]; else n[pid] = true; return n })
    if (userKey && userKey !== '__guest__') {
      if (isCurrent) await removeFavorite(userKey, pid)
      else           await addFavorite(userKey, pid, category?.id)
    }
  }

  const handleSelectPeptide = (cat, peptide) => {
    if (!peptide) return
    setSelectedCategory(cat)
    setSelectedPeptide(peptide)
    setSelectedStack(null)
    setShowHome(false)
    setShowStacks(false)
  }

  const handleSelectStack = (stack) => {
    setSelectedStack(stack)
    setSelectedPeptide(null)
    setSelectedCategory(null)
    setShowHome(false)
    setShowStacks(false)
  }

  const handleShowStacks = () => {
    setShowStacks(true)
    setShowHome(false)
    setSelectedPeptide(null)
    setSelectedCategory(null)
    setSelectedStack(null)
  }

  const handleHome = () => {
    setShowHome(true)
    setShowStacks(false)
    setSelectedPeptide(null)
    setSelectedCategory(null)
    setSelectedStack(null)
  }

  const handleHomeCategoryClick = (catId, peptide) => {
    const cat = categories.find(c => c.id === catId)
    if (!cat) return
    const p = peptide || cat.peptides[0]
    if (p) handleSelectPeptide(cat, p)
  }

  // Build peptide map for stack detail navigation
  const peptideMap = {}
  categories.forEach(cat => {
    const pool = cat.isCondition ? (cat.subcategories||[]).flatMap(s=>s.peptides) : (cat.peptides||[])
    pool.forEach(p => { if (!peptideMap[p.id]) peptideMap[p.id] = p })
  })

  const favKey = (cat, p) => `${cat.id}||${p.id}`
  const isFav  = selectedPeptide && selectedCategory ? !!favorites[selectedPeptide.id] : false

  if (loading || error) return <LoadingScreen error={error} />

  // Determine what view to show
  const view = showHome ? 'home'
    : showStacks ? 'stacks'
    : selectedStack ? 'stackDetail'
    : 'peptide'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#07070e',
      color:'#ddd8cc', fontFamily:"Georgia,'Times New Roman',serif", overflow:'hidden' }}>

      {showProfileModal && <ProfileModal onConfirm={handleProfileConfirm} />}

      <TopNav
        categories={categories}
        activeCatId={selectedCategory?.id}
        selectedPeptide={selectedPeptide}
        onSelectPeptide={handleSelectPeptide}
        favorites={favorites}
        favFilter={favFilter}
        onToggleFavFilter={() => setFavFilter(f => !f)}
        search={search}
        onSearch={setSearch}
        onHome={handleHome}
        showHome={showHome}
        onShowStacks={handleShowStacks}
        showStacks={showStacks || !!selectedStack}
        stacks={stacks}
        onSelectStack={handleSelectStack}
      />

      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>

        {view === 'home' && (
          <HomePage categories={categories} onSelectPeptide={handleHomeCategoryClick} />
        )}

        {view === 'stacks' && (
          <StacksPage stacks={stacks} onSelectStack={handleSelectStack} allCategories={categories} />
        )}

        {view === 'stackDetail' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Stack breadcrumb */}
            <div style={{ padding:'10px 48px', borderBottom:'1px solid #131320', background:'#090912',
              display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{ color:'#a78bfa', fontSize:11, fontFamily:'monospace', cursor:'pointer' }}
                onClick={handleShowStacks}>Stacks & Blends</span>
              <span style={{ color:'#272737', fontSize:11 }}>›</span>
              <span style={{ color:'#a78bfa', fontSize:11, fontFamily:'monospace', opacity:0.7 }}>{selectedStack.subcategory}</span>
              <span style={{ color:'#272737', fontSize:11 }}>›</span>
              <span style={{ color:'#a8a398', fontSize:11, fontFamily:'monospace' }}>{selectedStack.name}</span>
            </div>
            <StackDetailView
              stack={selectedStack}
              peptideMap={peptideMap}
              onSelectPeptide={handleSelectPeptide}
              allCategories={categories}
            />
          </div>
        )}

        {view === 'peptide' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Peptide breadcrumb */}
            <div style={{ padding:'10px 48px', borderBottom:'1px solid #131320', background:'#090912',
              display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              {selectedPeptide ? (
                <>
                  <span style={{ color: selectedCategory?.color_hex, fontSize:11, fontFamily:'monospace', cursor:'pointer' }}
                    onClick={() => handleHomeCategoryClick(selectedCategory.id)}>{selectedCategory?.label}</span>
                  {selectedPeptide.subcategory && <>
                    <span style={{ color:'#272737', fontSize:11 }}>›</span>
                    <span style={{ color: selectedCategory?.color_hex + '88', fontSize:11, fontFamily:'monospace' }}>{selectedPeptide.subcategory}</span>
                  </>}
                  <span style={{ color:'#272737', fontSize:11 }}>›</span>
                  <span style={{ color:'#a8a398', fontSize:11, fontFamily:'monospace' }}>{selectedPeptide.name}</span>
                  <div style={{ marginLeft:'auto' }}><StatusPill status={selectedPeptide.status} /></div>
                </>
              ) : (
                <span style={{ color:'#272737', fontSize:11, fontFamily:'monospace' }}>SELECT A COMPOUND FROM THE NAVIGATION ABOVE</span>
              )}
            </div>
            {selectedPeptide
              ? <DetailView
                  peptide={selectedPeptide}
                  category={selectedCategory}
                  isFav={isFav}
                  onToggleFav={() => toggleFav(selectedPeptide, selectedCategory)}
                  stacks={stacks}
                  onSelectStack={handleSelectStack}
                />
              : <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, color:'#1e1e2e' }}>
                  <div style={{ fontSize:64, opacity:0.15 }}>⬡</div>
                  <div style={{ fontSize:12, fontFamily:'monospace', letterSpacing:'0.14em', opacity:0.5 }}>SELECT A PEPTIDE FROM THE CATEGORY MENU ABOVE</div>
                </div>
            }
          </div>
        )}
      </div>

      {/* Profile key indicator */}
      {userKey && userKey !== '__guest__' && (
        <div style={{ position:'fixed', bottom:12, right:16, fontSize:9, fontFamily:'monospace',
          color:'#2d2d45', display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}
          onClick={() => setShowProfileModal(true)}>
          <span style={{ color:'#34d399', fontSize:8 }}>●</span>
          Syncing as: {userKey}
        </div>
      )}
    </div>
  )
}
