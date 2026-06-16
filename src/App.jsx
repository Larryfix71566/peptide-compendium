import { useState, useEffect, useRef } from 'react'
import { fetchAll, fetchStacks, loadFavorites, addFavorite, removeFavorite,
         fetchCycles, fetchVials, fetchDoseLogs } from './lib/supabase.js'
import HomePage from './components/HomePage.jsx'
import ProfileModal from './components/ProfileModal.jsx'
import StacksPage from './components/StacksPage.jsx'
import StackDetailView from './components/StackDetailView.jsx'
import ReconstitutionPage from './components/ReconstitutionPage.jsx'
import Dashboard from './components/Dashboard.jsx'

// ── Breakpoint ────────────────────────────────────────────────
function useBreakpoint() {
  const get = () => { const w=window.innerWidth; return w<768?'mobile':w<1100?'tablet':'desktop' }
  const [bp,setBp] = useState(get)
  useEffect(() => {
    const fn=()=>setBp(get())
    window.addEventListener('resize',fn)
    return ()=>window.removeEventListener('resize',fn)
  },[])
  return bp
}

// ── Category order: Option D ──────────────────────────────────
const STANDARD_ORDER  = ['ghrp','ghrh','repair','fatloss','neuro','longevity','sexual','cardio','skin']
const CONDITION_ORDER = ['diabetes','menopause']

// ── Helpers ───────────────────────────────────────────────────
function statusColor(s) {
  if (s.includes('FDA-Approved')) return '#34d399'
  if (s.includes('Approved'))     return '#60a5fa'
  if (s.includes('Clinical'))     return '#fbbf24'
  if (s.includes('OTC')||s.includes('Supplement')) return '#a78bfa'
  return '#6b7280'
}

function StatusPill({ status }) {
  const c=statusColor(status)
  return <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 10px',borderRadius:20,fontSize:10,fontFamily:'monospace',letterSpacing:'0.05em',whiteSpace:'nowrap',border:`1px solid ${c}44`,color:c,background:`${c}15` }}>{status}</span>
}
function SecLabel({ color, children }) {
  return <div style={{ fontSize:9,color,fontFamily:'monospace',letterSpacing:'0.16em',marginBottom:10,display:'flex',alignItems:'center',gap:8 }}>
    <span style={{ display:'inline-block',width:18,height:1,background:color,opacity:0.5 }}/>{children}
  </div>
}
function InfoCard({ label, value, color, highlight }) {
  return <div style={{ background:highlight?`${color}08`:'#09090f',border:`1px solid ${highlight?color+'33':'#181828'}`,borderRadius:7,padding:'13px 16px',borderTop:`2px solid ${color}${highlight?'88':'44'}` }}>
    <div style={{ fontSize:9,color:'#3a3a55',fontFamily:'monospace',letterSpacing:'0.14em',marginBottom:5 }}>{label}</div>
    <div style={{ fontSize:13,color:highlight?'#f0ebe0':'#ddd8cc',fontFamily:'monospace',lineHeight:1.55 }}>{value}</div>
  </div>
}
function StackPanel({ title, isDo, items }) {
  const c=isDo?'#34d399':'#f87171'
  return <div style={{ flex:1,background:'#09090f',border:'1px solid #181828',borderRadius:8,overflow:'hidden' }}>
    <div style={{ padding:'11px 14px',borderBottom:'1px solid #181828',display:'flex',alignItems:'center',gap:7,background:`${c}08` }}>
      <span style={{ color:c,fontSize:14,fontWeight:'bold' }}>{isDo?'✓':'✕'}</span>
      <span style={{ fontSize:10,fontFamily:'monospace',letterSpacing:'0.12em',color:c }}>{title}</span>
    </div>
    <div>
      {items.map((item,i)=><div key={item.id||i} style={{ padding:'10px 14px',borderBottom:i<items.length-1?'1px solid #0e0e18':'none' }}>
        <div style={{ fontSize:12,fontFamily:'monospace',color:'#c4bfb0',marginBottom:4 }}>{item.item}</div>
        <div style={{ fontSize:12,color:'#5a5550',lineHeight:1.6 }}>{item.reason}</div>
      </div>)}
      {items.length===0&&<div style={{ padding:'10px 14px',fontSize:12,color:'#3a3a55',fontFamily:'monospace' }}>None listed</div>}
    </div>
  </div>
}
function MobileStackingGuide({ stackDos, stackDonts }) {
  const [tab,setTab]=useState('do')
  const items=tab==='do'?stackDos:stackDonts
  const c=tab==='do'?'#34d399':'#f87171'
  return <div>
    <div style={{ display:'flex' }}>
      <button onClick={()=>setTab('do')} style={{ flex:1,padding:'8px',fontSize:11,fontFamily:'monospace',background:tab==='do'?'rgba(52,211,153,0.12)':'#09090f',border:'1px solid #181828',borderBottom:tab==='do'?'2px solid #34d399':'1px solid #181828',color:tab==='do'?'#34d399':'#6a6560',cursor:'pointer',borderRadius:'6px 0 0 0' }}>✓ Stack With ({stackDos.length})</button>
      <button onClick={()=>setTab('dont')} style={{ flex:1,padding:'8px',fontSize:11,fontFamily:'monospace',background:tab==='dont'?'rgba(248,113,113,0.12)':'#09090f',border:'1px solid #181828',borderBottom:tab==='dont'?'2px solid #f87171':'1px solid #181828',borderLeft:'none',color:tab==='dont'?'#f87171':'#6a6560',cursor:'pointer',borderRadius:'0 6px 0 0' }}>✕ Avoid ({stackDonts.length})</button>
    </div>
    <div style={{ background:'#09090f',border:'1px solid #181828',borderTop:'none',borderRadius:'0 0 6px 6px' }}>
      {items.map((item,i)=><div key={item.id||i} style={{ padding:'12px 14px',borderBottom:i<items.length-1?'1px solid #0e0e18':'none' }}>
        <div style={{ fontSize:12,fontFamily:'monospace',color:c,marginBottom:4 }}>{item.item}</div>
        <div style={{ fontSize:12,color:'#5a5550',lineHeight:1.6 }}>{item.reason}</div>
      </div>)}
      {items.length===0&&<div style={{ padding:'12px 14px',fontSize:12,color:'#3a3a55',fontFamily:'monospace' }}>None listed</div>}
    </div>
  </div>
}
function FeaturedInStacks({ peptideId, stacks, onSelectStack, color }) {
  const featured=stacks.filter(s=>s.peptideRoles.some(r=>r.peptide_id===peptideId))
  if(!featured.length) return null
  const bySubcat={}
  featured.forEach(s=>{ if(!bySubcat[s.subcategory])bySubcat[s.subcategory]=[]; bySubcat[s.subcategory].push(s) })
  return <section>
    <SecLabel color={color}>FEATURED IN STACKS</SecLabel>
    <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
      {Object.entries(bySubcat).map(([sub,subStacks])=>(
        <div key={sub}>
          <div style={{ fontSize:9,fontFamily:'monospace',color:'#3a3a55',letterSpacing:'0.12em',marginBottom:6 }}>{sub.toUpperCase()}</div>
          <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
            {subStacks.map(stack=>(
              <button key={stack.id} onClick={()=>onSelectStack(stack)}
                style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:`${stack.color_hex}0d`,border:`1px solid ${stack.color_hex}33`,borderRadius:6,cursor:'pointer',textAlign:'left' }}
                onMouseEnter={e=>e.currentTarget.style.background=`${stack.color_hex}1a`}
                onMouseLeave={e=>e.currentTarget.style.background=`${stack.color_hex}0d`}>
                <span style={{ fontSize:12,fontFamily:'monospace',color:stack.color_hex }}>⚗ {stack.name}</span>
                <span style={{ fontSize:10,color:stack.color_hex,opacity:0.6 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
}
function DosingTimingSection({ timing, color }) {
  if(!timing) return null
  const rows=[
    {label:'OPTIMAL TIMING',v:timing.optimal_timing},
    timing.loading_phase&&{label:'LOADING PHASE',v:timing.loading_phase},
    timing.maintenance_phase&&{label:'MAINTENANCE PHASE',v:timing.maintenance_phase},
    timing.off_cycle&&{label:'OFF-CYCLE',v:timing.off_cycle},
  ].filter(Boolean)
  return <section>
    <SecLabel color={color}>DOSING TIMING & OPTIMIZATION</SecLabel>
    <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10,marginBottom:12 }}>
      {rows.map(r=>(
        <div key={r.label} style={{ background:'#09090f',border:'1px solid #181828',borderRadius:7,padding:'13px 16px',borderTop:`2px solid ${color}22` }}>
          <div style={{ fontSize:9,color:'#3a3a55',fontFamily:'monospace',letterSpacing:'0.14em',marginBottom:6 }}>{r.label}</div>
          <div style={{ fontSize:13,color:'#b8b3a8',lineHeight:1.6 }}>{r.v}</div>
        </div>
      ))}
    </div>
    {timing.timing_notes&&<div style={{ background:'#09090f',border:'1px solid #181828',borderLeft:`3px solid ${color}55`,borderRadius:'0 7px 7px 0',padding:'14px 18px' }}>
      <p style={{ margin:0,fontSize:13,color:'#7a7568',lineHeight:1.85,fontStyle:'italic' }}>{timing.timing_notes}</p>
    </div>}
  </section>
}

// ── Detail Views ──────────────────────────────────────────────
function DetailView({ peptide, category, isFav, onToggleFav, stacks, onSelectStack, bp }) {
  if(!peptide) return null
  if(category.isCondition) return <ConditionDetailView peptide={peptide} category={category} isFav={isFav} onToggleFav={onToggleFav} stacks={stacks} onSelectStack={onSelectStack} bp={bp}/>
  const col=category.color_hex
  const isMobile=bp==='mobile'
  const px=isMobile?'16px':'48px'
  return (
    <div style={{ flex:1,overflowY:'auto',padding:`28px ${px} 48px`,scrollbarWidth:'thin',scrollbarColor:'#181828 transparent' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:6,flexWrap:'wrap' }}>
        <div style={{ flex:1,minWidth:0 }}>
          <h1 style={{ margin:'0 0 5px',fontSize:isMobile?22:30,fontWeight:'normal',color:'#f0ebe0' }}>{peptide.name}</h1>
          <div style={{ fontSize:12,color:'#4a4a6a',fontFamily:'monospace',marginBottom:8 }}>{peptide.aka}</div>
          <div style={{ display:'flex',gap:7,flexWrap:'wrap',alignItems:'center' }}>
            <span style={{ padding:'3px 10px',background:`${col}1a`,color:col,borderRadius:4,fontSize:10,fontFamily:'monospace',border:`1px solid ${col}33` }}>{peptide.class}</span>
            <StatusPill status={peptide.status}/>
          </div>
        </div>
        <button onClick={onToggleFav} style={{ background:isFav?`${col}18`:'transparent',border:`1px solid ${isFav?col:'#1e1e2e'}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',color:isFav?col:'#3a3a55',fontSize:18,flexShrink:0 }}>{isFav?'★':'☆'}</button>
      </div>
      <div style={{ height:1,background:`linear-gradient(90deg,${col}44 0%,transparent 80%)`,margin:'16px 0 24px' }}/>
      <div style={{ display:'flex',flexDirection:'column',gap:24 }}>
        <section><SecLabel color={col}>MECHANISM OF ACTION</SecLabel><p style={{ margin:0,lineHeight:1.85,color:'#b8b3a8',fontSize:isMobile?13:14 }}>{peptide.mechanism}</p></section>
        <section><SecLabel color={col}>BENEFITS & INDICATIONS</SecLabel><div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>{peptide.benefits.map((b,i)=><span key={i} style={{ padding:'4px 11px',background:`${col}12`,color:col,borderRadius:5,fontSize:11,fontFamily:'monospace',border:`1px solid ${col}2a` }}>{b}</span>)}</div></section>
        <section>
          <SecLabel color={col}>DOSING & ADMINISTRATION</SecLabel>
          <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(auto-fit,minmax(185px,1fr))',gap:9 }}>
            <InfoCard label="DOSE" value={peptide.dosing} color={col}/>
            <InfoCard label="FREQUENCY" value={peptide.frequency} color={col}/>
            <InfoCard label="CYCLE LENGTH" value={peptide.cycle} color={col}/>
            <InfoCard label="ROUTE" value={peptide.route} color={col}/>
          </div>
        </section>
        <DosingTimingSection timing={peptide.dosingTiming} color={col}/>
        <FeaturedInStacks peptideId={peptide.id} stacks={stacks} onSelectStack={onSelectStack} color={col}/>
        <section><SecLabel color={col}>SIDE EFFECTS & CONSIDERATIONS</SecLabel><div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(auto-fill,minmax(200px,1fr))',gap:8 }}>{peptide.sideEffects.map((fx,i)=><div key={i} style={{ display:'flex',alignItems:'flex-start',gap:8,fontSize:13,color:'#7a7568' }}><span style={{ color:'#272737',marginTop:5,flexShrink:0,fontSize:8 }}>■</span>{fx}</div>)}</div></section>
        <section><SecLabel color={col}>STACKING GUIDE</SecLabel>{isMobile?<MobileStackingGuide stackDos={peptide.stackDos} stackDonts={peptide.stackDonts}/>:<div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}><StackPanel title="STACK WITH" isDo={true} items={peptide.stackDos}/><StackPanel title="AVOID COMBINING" isDo={false} items={peptide.stackDonts}/></div>}</section>
        <section><SecLabel color={col}>CLINICAL NOTES</SecLabel><div style={{ background:'#09090f',border:'1px solid #181828',borderLeft:`3px solid ${col}66`,borderRadius:'0 7px 7px 0',padding:'14px 18px' }}><p style={{ margin:0,fontSize:13,color:'#7a7568',lineHeight:1.85,fontStyle:'italic' }}>{peptide.notes}</p></div></section>
        <div style={{ padding:'10px 14px',background:'#07070c',border:'1px solid #131320',borderRadius:6,fontSize:10,color:'#272737',fontFamily:'monospace',lineHeight:1.7 }}>Educational and research purposes only. NOT a medical recommendation. Consult a healthcare provider before any use.</div>
      </div>
    </div>
  )
}

function ConditionDetailView({ peptide, category, isFav, onToggleFav, stacks, onSelectStack, bp }) {
  const col=category.color_hex
  const ctx=peptide.conditionContext
  const isMobile=bp==='mobile'
  const px=isMobile?'16px':'48px'
  const conditionBenefits=ctx?.condition_benefits?ctx.condition_benefits.split('|').filter(Boolean):peptide.benefits
  return (
    <div style={{ flex:1,overflowY:'auto',padding:`28px ${px} 48px`,scrollbarWidth:'thin',scrollbarColor:'#181828 transparent' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:6,flexWrap:'wrap' }}>
        <div style={{ flex:1,minWidth:0 }}>
          <h1 style={{ margin:'0 0 5px',fontSize:isMobile?22:30,fontWeight:'normal',color:'#f0ebe0' }}>{peptide.name}</h1>
          <div style={{ fontSize:12,color:'#4a4a6a',fontFamily:'monospace',marginBottom:8 }}>{peptide.aka}</div>
          <div style={{ display:'flex',gap:7,flexWrap:'wrap',alignItems:'center' }}>
            <span style={{ padding:'3px 10px',background:`${col}1a`,color:col,borderRadius:4,fontSize:10,fontFamily:'monospace',border:`1px solid ${col}33` }}>{peptide.class}</span>
            {peptide.subcategory&&<span style={{ padding:'3px 10px',background:`${col}0d`,color:`${col}cc`,borderRadius:4,fontSize:10,fontFamily:'monospace',border:`1px solid ${col}22` }}>{peptide.subcategory}</span>}
            <StatusPill status={peptide.status}/>
          </div>
        </div>
        <button onClick={onToggleFav} style={{ background:isFav?`${col}18`:'transparent',border:`1px solid ${isFav?col:'#1e1e2e'}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',color:isFav?col:'#3a3a55',fontSize:18,flexShrink:0 }}>{isFav?'★':'☆'}</button>
      </div>
      <div style={{ height:1,background:`linear-gradient(90deg,${col}44 0%,transparent 80%)`,margin:'16px 0 24px' }}/>
      <div style={{ display:'flex',flexDirection:'column',gap:24 }}>
        {ctx?.condition_rationale&&<section><SecLabel color={col}>WHY THIS PEPTIDE FOR {category.label.toUpperCase()}</SecLabel><div style={{ background:`${col}08`,border:`1px solid ${col}22`,borderLeft:`3px solid ${col}`,borderRadius:'0 7px 7px 0',padding:'14px 18px' }}><p style={{ margin:0,fontSize:isMobile?13:14,color:'#c4bfb0',lineHeight:1.85 }}>{ctx.condition_rationale}</p></div></section>}
        <section><SecLabel color={col}>HOW THIS APPLIES TO {category.label.toUpperCase()}</SecLabel><p style={{ margin:0,lineHeight:1.85,color:'#b8b3a8',fontSize:isMobile?13:14 }}>{ctx?.condition_mechanism||peptide.mechanism}</p></section>
        <section><SecLabel color={col}>BENEFITS FOR {category.label.toUpperCase()}</SecLabel><div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>{conditionBenefits.map((b,i)=><span key={i} style={{ padding:'4px 11px',background:`${col}12`,color:col,borderRadius:5,fontSize:11,fontFamily:'monospace',border:`1px solid ${col}2a` }}>{b}</span>)}</div></section>
        <section>
          <SecLabel color={col}>DOSING & ADMINISTRATION</SecLabel>
          <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(auto-fit,minmax(185px,1fr))',gap:9 }}>
            <InfoCard label="DOSE" value={peptide.dosing} color={col}/>
            <InfoCard label="FREQUENCY" value={peptide.frequency} color={col}/>
            <InfoCard label="CYCLE LENGTH" value={peptide.cycle} color={col}/>
            <InfoCard label="ROUTE" value={peptide.route} color={col}/>
            {ctx?.condition_dosing_note&&<InfoCard label={`${category.label.toUpperCase()} NOTE`} value={ctx.condition_dosing_note} color={col} highlight={true}/>}
          </div>
        </section>
        <DosingTimingSection timing={peptide.dosingTiming} color={col}/>
        {ctx?.condition_stack_note&&<section><SecLabel color={col}>STACKING FOR {category.label.toUpperCase()}</SecLabel><div style={{ background:'#09090f',border:`1px solid ${col}22`,borderLeft:`3px solid ${col}66`,borderRadius:'0 7px 7px 0',padding:'14px 18px' }}><p style={{ margin:0,fontSize:13,color:'#a8a398',lineHeight:1.85 }}>{ctx.condition_stack_note}</p></div></section>}
        <FeaturedInStacks peptideId={peptide.id} stacks={stacks} onSelectStack={onSelectStack} color={col}/>
        <section><SecLabel color={col}>SIDE EFFECTS</SecLabel><div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(auto-fill,minmax(200px,1fr))',gap:8 }}>{peptide.sideEffects.map((fx,i)=><div key={i} style={{ display:'flex',alignItems:'flex-start',gap:8,fontSize:13,color:'#7a7568' }}><span style={{ color:'#272737',marginTop:5,flexShrink:0,fontSize:8 }}>■</span>{fx}</div>)}</div></section>
        <section><SecLabel color={col}>GENERAL STACKING GUIDE</SecLabel>{isMobile?<MobileStackingGuide stackDos={peptide.stackDos} stackDonts={peptide.stackDonts}/>:<div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}><StackPanel title="STACK WITH" isDo={true} items={peptide.stackDos}/><StackPanel title="AVOID COMBINING" isDo={false} items={peptide.stackDonts}/></div>}</section>
        <section><SecLabel color={col}>CLINICAL NOTES</SecLabel><div style={{ background:'#09090f',border:'1px solid #181828',borderLeft:`3px solid ${col}66`,borderRadius:'0 7px 7px 0',padding:'14px 18px' }}><p style={{ margin:0,fontSize:13,color:'#7a7568',lineHeight:1.85,fontStyle:'italic' }}>{peptide.notes}</p></div></section>
        <div style={{ padding:'10px 14px',background:'#07070c',border:'1px solid #131320',borderRadius:6,fontSize:10,color:'#272737',fontFamily:'monospace',lineHeight:1.7 }}>Educational and research purposes only. NOT a medical recommendation. Consult a healthcare provider before any use.</div>
      </div>
    </div>
  )
}

// ── Mobile Nav ────────────────────────────────────────────────
function MobileNav({ categories, stacks, selectedPeptide, onSelectPeptide, onSelectStack,
                     favorites, search, onSearch, onHome, showHome, showStacks, onShowStacks,
                     onShowRecon, onShowDashboard, showRecon, showDashboard }) {
  const [menuOpen,setMenuOpen]=useState(false)
  const [activeCat,setActiveCat]=useState(null)
  const standardCats=STANDARD_ORDER.map(id=>categories.find(c=>c.id===id)).filter(Boolean)
  const conditionCats=CONDITION_ORDER.map(id=>categories.find(c=>c.id===id)).filter(Boolean)
  return (
    <>
      <div style={{ background:'#0c0c18',borderBottom:'1px solid #1e1e2e',padding:'10px 14px',display:'flex',alignItems:'center',gap:10,flexShrink:0 }}>
        <button onClick={()=>{onHome();setMenuOpen(false);setActiveCat(null)}} style={{ background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,flexShrink:0 }}>
          <div style={{ width:28,height:28,borderRadius:7,background:'rgba(45,212,191,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>⬡</div>
          <span style={{ fontSize:12,color:showHome?'#2dd4bf':'#c8c3b8',whiteSpace:'nowrap' }}>Peptide Compendium</span>
        </button>
        <div style={{ flex:1,position:'relative' }}>
          <span style={{ position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'#6a6a8a',fontSize:13 }}>⌕</span>
          <input value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search..."
            style={{ width:'100%',boxSizing:'border-box',padding:'7px 26px 7px 26px',background:'#0f0f20',border:'1px solid #2a2a3e',borderRadius:6,color:'#c8c3b8',fontSize:12,fontFamily:'monospace',outline:'none' }}/>
          {search&&<button onClick={()=>onSearch('')} style={{ position:'absolute',right:7,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#3a3a55',cursor:'pointer',fontSize:14 }}>×</button>}
        </div>
      </div>
      {search&&(()=>{
        const results=[];const seen=new Set()
        categories.forEach(cat=>{
          const pool=cat.isCondition?(cat.subcategories||[]).flatMap(s=>s.peptides):(cat.peptides||[])
          pool.forEach(p=>{
            if(seen.has(p.id))return
            if([p.name,p.aka,p.class].join(' ').toLowerCase().includes(search.toLowerCase())){results.push({p,cat});seen.add(p.id)}
          })
        })
        return <div style={{ background:'#0c0c18',borderBottom:'1px solid #1e1e2e',maxHeight:'50vh',overflowY:'auto' }}>
          <div style={{ padding:'6px 14px',fontSize:9,fontFamily:'monospace',color:'#2dd4bf',letterSpacing:'0.12em',background:'#2dd4bf08' }}>{results.length} RESULTS</div>
          {results.map(({p,cat})=>(
            <button key={p.id} onClick={()=>{onSelectPeptide(cat,p);onSearch('');setMenuOpen(false);setActiveCat(null)}}
              style={{ width:'100%',display:'flex',alignItems:'center',gap:10,padding:'11px 14px',background:'transparent',border:'none',borderBottom:'1px solid #0e0e18',cursor:'pointer',textAlign:'left',borderLeft:`2px solid ${cat.color_hex}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontFamily:'monospace',color:'#d4cfc4' }}>{p.name}</div>
                <div style={{ fontSize:10,fontFamily:'monospace',color:cat.color_hex,opacity:0.8,marginTop:1 }}>{cat.label}</div>
              </div>
            </button>
          ))}
          {results.length===0&&<div style={{ padding:'16px 14px',fontSize:12,fontFamily:'monospace',color:'#4a4a6a' }}>No compounds found</div>}
        </div>
      })()}
      {menuOpen&&(
        <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.9)',zIndex:200,display:'flex',flexDirection:'column' }}>
          <div style={{ background:'#090912',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #1e1e2e' }}>
            <span style={{ fontSize:11,fontFamily:'monospace',color:'#c8c3b8',letterSpacing:'0.1em' }}>CATEGORIES</span>
            <button onClick={()=>setMenuOpen(false)} style={{ background:'none',border:'none',color:'#6a6560',cursor:'pointer',fontSize:20,lineHeight:1 }}>✕</button>
          </div>
          <div style={{ overflowY:'auto',flex:1 }}>
            <div style={{ padding:'8px 16px 4px',fontSize:8,fontFamily:'monospace',color:'#3a3a55',letterSpacing:'0.14em',background:'#07070c' }}>STANDARD CATEGORIES</div>
            {standardCats.map(cat=>(
              <button key={cat.id} onClick={()=>{setActiveCat(cat);setMenuOpen(false)}}
                style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',background:'transparent',border:'none',borderBottom:'1px solid #0e0e18',cursor:'pointer',textAlign:'left' }}>
                <div style={{ width:10,height:10,borderRadius:'50%',background:cat.color_hex,flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontFamily:'monospace',color:'#c8c3b8' }}>{cat.label}</div>
                  <div style={{ fontSize:10,fontFamily:'monospace',color:'#3a3a55',marginTop:1 }}>{cat.peptides.length} compounds</div>
                </div>
                <span style={{ color:'#3a3a55',fontSize:11 }}>›</span>
              </button>
            ))}
            <div style={{ padding:'8px 16px 4px',fontSize:8,fontFamily:'monospace',color:'#3a3a55',letterSpacing:'0.14em',background:'#07070c',borderTop:'1px solid #1a1a2e' }}>CONDITION PROTOCOLS</div>
            {conditionCats.map(cat=>(
              <button key={cat.id} onClick={()=>{setActiveCat(cat);setMenuOpen(false)}}
                style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',background:'rgba(248,113,113,0.03)',border:'none',borderBottom:'1px solid #0e0e18',cursor:'pointer',textAlign:'left' }}>
                <div style={{ width:10,height:10,borderRadius:'50%',background:cat.color_hex,flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontFamily:'monospace',color:'#d4a8c4' }}>✦ {cat.label}</div>
                  <div style={{ fontSize:10,fontFamily:'monospace',color:'#3a3a55',marginTop:1 }}>{cat.peptides.length} compounds</div>
                </div>
                <span style={{ color:'#3a3a55',fontSize:11 }}>›</span>
              </button>
            ))}
            <div style={{ padding:'8px 16px 4px',fontSize:8,fontFamily:'monospace',color:'#3a3a55',letterSpacing:'0.14em',background:'#07070c',borderTop:'1px solid #1a1a2e' }}>PROTOCOLS</div>
            <button onClick={()=>{onShowStacks();setMenuOpen(false)}}
              style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',background:'rgba(167,139,250,0.04)',border:'none',borderBottom:'1px solid #0e0e18',cursor:'pointer',textAlign:'left' }}>
              <div style={{ width:10,height:10,borderRadius:2,background:'#a78bfa',flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontFamily:'monospace',color:'#a78bfa' }}>⚗ Stacks & Blends</div>
                <div style={{ fontSize:10,fontFamily:'monospace',color:'#3a3a55',marginTop:1 }}>18 stacks · 7 subcategories</div>
              </div>
              <span style={{ color:'#3a3a55',fontSize:11 }}>›</span>
            </button>
            <div style={{ padding:'8px 16px 4px',fontSize:8,fontFamily:'monospace',color:'#3a3a55',letterSpacing:'0.14em',background:'#07070c',borderTop:'1px solid #1a1a2e' }}>TOOLS</div>
            <button onClick={()=>{onShowRecon();setMenuOpen(false)}}
              style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',background:'rgba(45,212,191,0.04)',border:'none',borderBottom:'1px solid #0e0e18',cursor:'pointer',textAlign:'left' }}>
              <div style={{ width:10,height:10,borderRadius:2,background:'#2dd4bf',flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontFamily:'monospace',color:'#2dd4bf' }}>🧪 Reconstitution</div>
                <div style={{ fontSize:10,fontFamily:'monospace',color:'#3a3a55',marginTop:1 }}>Dosing calculator + matrix</div>
              </div>
              <span style={{ color:'#3a3a55',fontSize:11 }}>›</span>
            </button>
            <button onClick={()=>{onShowDashboard();setMenuOpen(false)}}
              style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',background:'rgba(96,165,250,0.04)',border:'none',borderBottom:'1px solid #0e0e18',cursor:'pointer',textAlign:'left' }}>
              <div style={{ width:10,height:10,borderRadius:2,background:'#60a5fa',flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontFamily:'monospace',color:'#60a5fa' }}>◈ Dashboard</div>
                <div style={{ fontSize:10,fontFamily:'monospace',color:'#3a3a55',marginTop:1 }}>Cycles · dosing · analytics</div>
              </div>
              <span style={{ color:'#3a3a55',fontSize:11 }}>›</span>
            </button>
          </div>
        </div>
      )}
      {activeCat&&(
        <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,background:'#07070e',zIndex:200,display:'flex',flexDirection:'column' }}>
          <div style={{ background:'#090912',padding:'12px 16px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid #1e1e2e',flexShrink:0 }}>
            <button onClick={()=>{setActiveCat(null);setMenuOpen(true)}} style={{ background:'none',border:'none',color:'#6a6560',cursor:'pointer',fontSize:18,lineHeight:1,padding:'0 4px' }}>‹</button>
            <div style={{ width:8,height:8,borderRadius:'50%',background:activeCat.color_hex }}/>
            <span style={{ fontSize:13,fontFamily:'monospace',color:activeCat.color_hex }}>{activeCat.label}</span>
            <button onClick={()=>setActiveCat(null)} style={{ marginLeft:'auto',background:'none',border:'none',color:'#6a6560',cursor:'pointer',fontSize:18 }}>✕</button>
          </div>
          <div style={{ flex:1,overflowY:'auto' }}>
            {activeCat.isCondition
              ?(activeCat.subcategories||[]).map(sub=>(
                <div key={sub.name}>
                  <div style={{ padding:'8px 16px 4px',fontSize:8,fontFamily:'monospace',color:activeCat.color_hex,letterSpacing:'0.14em',background:`${activeCat.color_hex}0a`,borderBottom:`1px solid ${activeCat.color_hex}22` }}>{sub.name.toUpperCase()}</div>
                  {sub.peptides.map(p=>(
                    <button key={p.id} onClick={()=>{onSelectPeptide(activeCat,p);setActiveCat(null)}}
                      style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',background:'transparent',border:'none',borderBottom:'1px solid #0e0e18',cursor:'pointer',textAlign:'left' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13,fontFamily:'monospace',color:'#c8c3b8' }}>{p.name}</div>
                        <div style={{ fontSize:10,fontFamily:'monospace',color:'#3a3a55',marginTop:1 }}>{p.class}</div>
                      </div>
                      {!!favorites[p.id]&&<span style={{ color:'#f97316',fontSize:11 }}>★</span>}
                      <span style={{ color:'#3a3a55',fontSize:11 }}>›</span>
                    </button>
                  ))}
                </div>
              ))
              :(activeCat.peptides||[]).map(p=>(
                <button key={p.id} onClick={()=>{onSelectPeptide(activeCat,p);setActiveCat(null)}}
                  style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'13px 16px',background:'transparent',border:'none',borderBottom:'1px solid #0e0e18',cursor:'pointer',textAlign:'left',borderLeft:`2px solid ${selectedPeptide?.id===p.id?activeCat.color_hex:'transparent'}` }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontFamily:'monospace',color:selectedPeptide?.id===p.id?activeCat.color_hex:'#c8c3b8' }}>{p.name}</div>
                    <div style={{ fontSize:10,fontFamily:'monospace',color:'#3a3a55',marginTop:1 }}>{p.class}</div>
                  </div>
                  {!!favorites[p.id]&&<span style={{ color:'#f97316',fontSize:11 }}>★</span>}
                  <span style={{ color:'#3a3a55',fontSize:11 }}>›</span>
                </button>
              ))
            }
          </div>
        </div>
      )}
      <div style={{ position:'fixed',bottom:0,left:0,right:0,zIndex:100,background:'#090912',borderTop:'1px solid #1e1e2e',display:'flex',justifyContent:'space-around',padding:'6px 0 8px',paddingBottom:'calc(6px + env(safe-area-inset-bottom,0px))' }}>
        {[
          {id:'home',icon:'⬡',label:'Home',action:()=>{onHome();setMenuOpen(false);setActiveCat(null)}},
          {id:'browse',icon:'◇',label:'Browse',action:()=>{setMenuOpen(true);setActiveCat(null)}},
          {id:'dashboard',icon:'◈',label:'Dashboard',action:()=>{onShowDashboard();setMenuOpen(false);setActiveCat(null)}},
          {id:'recon',icon:'🧪',label:'Recon',action:()=>{onShowRecon();setMenuOpen(false);setActiveCat(null)}},
          {id:'stacks',icon:'⚗',label:'Stacks',action:()=>{onShowStacks();setMenuOpen(false);setActiveCat(null)}},
        ].map(tab=>{
          const isActive=tab.id==='home'?showHome:tab.id==='stacks'?showStacks:tab.id==='dashboard'?showDashboard:tab.id==='recon'?showRecon:tab.id==='browse'?menuOpen:false
          return <button key={tab.id} onClick={tab.action} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:2,background:'none',border:'none',cursor:'pointer',padding:'0 8px',minWidth:46 }}>
            <span style={{ fontSize:17,color:isActive?'#2dd4bf':'#4a4a6a',lineHeight:1 }}>{tab.icon}</span>
            <span style={{ fontSize:9,fontFamily:'monospace',color:isActive?'#2dd4bf':'#4a4a6a',letterSpacing:'0.02em' }}>{tab.label}</span>
          </button>
        })}
      </div>
    </>
  )
}

// ── Desktop/Tablet Top Nav ────────────────────────────────────
function PeptideDropItem({ p, cat, selected, favorites, onClick }) {
  const isActive=selected?.id===p.id
  return <button onClick={onClick}
    style={{ display:'flex',alignItems:'center',gap:8,padding:'11px 18px',background:isActive?`${cat.color_hex}12`:'transparent',border:'none',borderLeft:`2px solid ${isActive?cat.color_hex:'transparent'}`,cursor:'pointer',textAlign:'left' }}
    onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background='#0c0c1a'}}
    onMouseLeave={e=>{e.currentTarget.style.background=isActive?`${cat.color_hex}12`:'transparent'}}>
    <div style={{ flex:1,minWidth:0 }}>
      <div style={{ fontSize:12,fontFamily:'monospace',color:isActive?cat.color_hex:'#a8a398',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{p.name}</div>
      <div style={{ fontSize:9,fontFamily:'monospace',color:'#2d2d45',marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{p.class}</div>
    </div>
    {!!favorites[p.id]&&<span style={{ color:'#f97316',fontSize:10,flexShrink:0 }}>★</span>}
  </button>
}

function TopNav({ categories, activeCatId, selectedPeptide, onSelectPeptide,
                  favorites, favFilter, onToggleFavFilter, search, onSearch,
                  onHome, showHome, onShowStacks, showStacks, bp,
                  onShowRecon, onShowDashboard, showRecon, showDashboard }) {
  const [openCat,setOpenCat]=useState(null)
  const navRef=useRef(null)
  const favCount=Object.keys(favorites).length
  const isTablet=bp==='tablet'
  const STACK_COLOR='#a78bfa'
  const standardCats=STANDARD_ORDER.map(id=>categories.find(c=>c.id===id)).filter(Boolean)
  const conditionCats=CONDITION_ORDER.map(id=>categories.find(c=>c.id===id)).filter(Boolean)
  const openCategory=categories.find(c=>c.id===openCat)

  useEffect(()=>{
    const handler=e=>{if(navRef.current&&!navRef.current.contains(e.target))setOpenCat(null)}
    document.addEventListener('mousedown',handler)
    return()=>document.removeEventListener('mousedown',handler)
  },[])

  const handlePeptideClick=(cat,p)=>{onSelectPeptide(cat,p);setOpenCat(null)}
  const tabStyle=(cat,isOpen,isActive)=>({
    display:'flex',alignItems:'center',gap:6,padding:isTablet?'9px 11px':'10px 14px',
    background:isOpen?`${cat.color_hex}22`:'transparent',border:'none',
    borderBottom:`2px solid ${isActive||isOpen?cat.color_hex:'transparent'}`,
    color:isActive||isOpen?cat.color_hex:cat.isCondition?'#c4a8c4':'#a8a398',
    cursor:'pointer',whiteSpace:'nowrap',fontSize:isTablet?10:11,fontFamily:'monospace',
    letterSpacing:'0.03em',transition:'all .15s',flexShrink:0,
  })

  return (
    <div ref={navRef} style={{ flexShrink:0,background:'#0c0c18',borderBottom:'1px solid #1e1e2e',position:'relative',zIndex:100 }}>
      <div style={{ display:'flex',alignItems:'center',gap:14,padding:'12px 20px',borderBottom:'1px solid #1e1e2e' }}>
        <button onClick={()=>{onHome();setOpenCat(null)}} style={{ background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,flexShrink:0 }}>
          <div style={{ width:30,height:30,borderRadius:7,background:'rgba(45,212,191,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>⬡</div>
          <div>
            <div style={{ fontSize:13,color:showHome?'#2dd4bf':'#c8c3b8',whiteSpace:'nowrap' }}>Peptide Compendium</div>
            <div style={{ fontSize:8,fontFamily:'monospace',color:'#4a4a6a',letterSpacing:'0.12em' }}>REFERENCE GUIDE</div>
          </div>
        </button>
        <div style={{ flex:1,position:'relative',maxWidth:380 }}>
          <span style={{ position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'#6a6a8a',fontSize:13 }}>⌕</span>
          <input value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search compounds..."
            style={{ width:'100%',boxSizing:'border-box',padding:'7px 28px 7px 30px',background:'#0f0f20',border:'1px solid #2a2a3e',borderRadius:6,color:'#c8c3b8',fontSize:12,fontFamily:'monospace',outline:'none' }}/>
          {search&&<button onClick={()=>onSearch('')} style={{ position:'absolute',right:7,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#3a3a55',cursor:'pointer',fontSize:14 }}>×</button>}
        </div>
        <button onClick={onToggleFavFilter} style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:6,cursor:'pointer',flexShrink:0,background:favFilter?'#1e1208':'transparent',border:`1px solid ${favFilter?'#f97316aa':'#2a2a3e'}`,color:favFilter?'#f97316':'#8a8598',fontSize:11,fontFamily:'monospace' }}>
          <span style={{ fontSize:13 }}>{favFilter?'★':'☆'}</span>
          {!isTablet&&<span>FAVORITES</span>}
          {favCount>0&&<span style={{ background:'#f9731622',color:'#f97316',borderRadius:10,padding:'0 5px',fontSize:10 }}>{favCount}</span>}
        </button>
      </div>
      {/* Tools row — interactive tools, separated above reference categories */}
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'7px 16px',background:'#0a0a12',borderBottom:'1px solid #15151f' }}>
        <span style={{ fontSize:8,fontFamily:'monospace',color:'#3a3a55',letterSpacing:'0.16em',flexShrink:0 }}>TOOLS</span>
        <button onClick={()=>{onShowDashboard();setOpenCat(null);onSearch('')}}
          style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:6,background:showDashboard?'#60a5fa1f':'transparent',border:`1px solid ${showDashboard?'#60a5fa66':'#1e1e2e'}`,color:showDashboard?'#60a5fa':'#a8a398',cursor:'pointer',whiteSpace:'nowrap',fontSize:isTablet?10:11,fontFamily:'monospace',transition:'all .15s',flexShrink:0 }}>
          <span>◈</span><span>Dashboard</span>
        </button>
        <button onClick={()=>{onShowRecon();setOpenCat(null);onSearch('')}}
          style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:6,background:showRecon?'#2dd4bf1f':'transparent',border:`1px solid ${showRecon?'#2dd4bf66':'#1e1e2e'}`,color:showRecon?'#2dd4bf':'#a8a398',cursor:'pointer',whiteSpace:'nowrap',fontSize:isTablet?10:11,fontFamily:'monospace',transition:'all .15s',flexShrink:0 }}>
          <span>🧪</span><span>Reconstitution</span>
        </button>
      </div>
      <div style={{ display:'flex',alignItems:'center',padding:'4px 16px 0',gap:8 }}>
        <span style={{ fontSize:8,fontFamily:'monospace',color:'#3a3a55',letterSpacing:'0.16em',flexShrink:0 }}>BROWSE</span>
      </div>
      <div style={{ display:'flex',alignItems:'stretch',overflowX:'auto',padding:'0 12px',scrollbarWidth:'none',gap:1 }}>
        {standardCats.map(cat=>{
          const isOpen=openCat===cat.id;const isActive=activeCatId===cat.id&&!showHome&&!showStacks
          return <button key={cat.id} onClick={()=>{setOpenCat(p=>p===cat.id?null:cat.id);onSearch('')}} style={tabStyle(cat,isOpen,isActive)}>
            <span>{cat.label}</span><span style={{ fontSize:8,opacity:0.5 }}>{isOpen?'▲':'▼'}</span>
          </button>
        })}
        <div style={{ width:1,background:'#1e1e2e',margin:'8px 6px',flexShrink:0 }}/>
        {conditionCats.map(cat=>{
          const isOpen=openCat===cat.id;const isActive=activeCatId===cat.id&&!showHome&&!showStacks
          return <button key={cat.id} onClick={()=>{setOpenCat(p=>p===cat.id?null:cat.id);onSearch('')}} style={tabStyle(cat,isOpen,isActive)}>
            <span style={{ fontSize:8,opacity:0.7 }}>✦</span><span>{cat.label}</span><span style={{ fontSize:8,opacity:0.5 }}>{isOpen?'▲':'▼'}</span>
          </button>
        })}
        <div style={{ width:1,background:'#1e1e2e',margin:'8px 6px',flexShrink:0 }}/>
        <button onClick={()=>{onShowStacks();setOpenCat(null);onSearch('')}}
          style={{ display:'flex',alignItems:'center',gap:6,padding:isTablet?'9px 11px':'10px 14px',background:showStacks?`${STACK_COLOR}22`:'transparent',border:'none',borderBottom:`2px solid ${showStacks?STACK_COLOR:'transparent'}`,color:showStacks?STACK_COLOR:'#a8a398',cursor:'pointer',whiteSpace:'nowrap',fontSize:isTablet?10:11,fontFamily:'monospace',transition:'all .15s',flexShrink:0 }}>
          <span>⚗</span><span>Stacks & Blends</span>
        </button>
      </div>
      {search&&(()=>{
        const results=[];const seen=new Set()
        categories.forEach(cat=>{
          const pool=cat.isCondition?(cat.subcategories||[]).flatMap(s=>s.peptides):(cat.peptides||[])
          pool.forEach(p=>{
            if(seen.has(p.id))return
            if([p.name,p.aka,p.class].join(' ').toLowerCase().includes(search.toLowerCase())){results.push({p,cat});seen.add(p.id)}
          })
        })
        return <div style={{ position:'absolute',top:'100%',left:0,right:0,background:'#0c0c18',borderBottom:'1px solid #1e1e2e',borderTop:'1px solid #2dd4bf33',boxShadow:'0 8px 32px rgba(0,0,0,0.7)',maxHeight:'60vh',overflowY:'auto',zIndex:200 }}>
          <div style={{ padding:'7px 18px',borderBottom:'1px solid #1e1e2e',fontSize:9,fontFamily:'monospace',color:'#2dd4bf',letterSpacing:'0.14em',background:'#2dd4bf08' }}>{results.length} RESULT{results.length!==1?'S':''} FOR "{search.toUpperCase()}"</div>
          {results.length===0?<div style={{ padding:'18px 20px',fontSize:12,fontFamily:'monospace',color:'#4a4a6a' }}>No compounds found</div>
            :<div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))' }}>
              {results.map(({p,cat})=>(
                <button key={p.id} onClick={()=>{handlePeptideClick(cat,p);onSearch('')}}
                  style={{ display:'flex',alignItems:'center',gap:9,padding:'11px 18px',background:'transparent',border:'none',borderLeft:`2px solid ${cat.color_hex}66`,cursor:'pointer',textAlign:'left' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#0f0f20'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:12,fontFamily:'monospace',color:'#d4cfc4',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize:10,fontFamily:'monospace',color:cat.color_hex,marginTop:2,opacity:0.8 }}>{cat.label}</div>
                  </div>
                </button>
              ))}
            </div>
          }
        </div>
      })()}
      {!search&&openCat&&openCategory&&(()=>{
        const cat=openCategory
        if(cat.isCondition) return <div style={{ position:'absolute',top:'100%',left:0,right:0,background:'#090912',borderBottom:'1px solid #131320',borderTop:`1px solid ${cat.color_hex}33`,boxShadow:'0 8px 32px rgba(0,0,0,0.6)',maxHeight:'60vh',overflowY:'auto' }}>
          {(cat.subcategories||[]).map(sub=>(
            <div key={sub.name}>
              <div style={{ padding:'7px 18px 5px',fontSize:8,fontFamily:'monospace',color:cat.color_hex,letterSpacing:'0.14em',background:`${cat.color_hex}0a`,borderBottom:`1px solid ${cat.color_hex}22` }}>{sub.name.toUpperCase()}</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))' }}>
                {sub.peptides.map(p=><PeptideDropItem key={`${cat.id}-${p.id}`} p={p} cat={cat} selected={selectedPeptide} favorites={favorites} onClick={()=>handlePeptideClick(cat,p)}/>)}
              </div>
            </div>
          ))}
        </div>
        const favFiltered=favFilter?(cat.peptides||[]).filter(p=>!!favorites[p.id]):(cat.peptides||[])
        return <div style={{ position:'absolute',top:'100%',left:0,right:0,background:'#0c0c18',borderBottom:'1px solid #1e1e2e',borderTop:`1px solid ${cat.color_hex}33`,boxShadow:'0 8px 32px rgba(0,0,0,0.6)',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))' }}>
          {favFiltered.length===0?<div style={{ padding:'18px 20px',fontSize:12,fontFamily:'monospace',color:'#4a4a6a' }}>No compounds found</div>
            :favFiltered.map(p=><PeptideDropItem key={p.id} p={p} cat={cat} selected={selectedPeptide} favorites={favorites} onClick={()=>handlePeptideClick(cat,p)}/>)}
        </div>
      })()}
    </div>
  )
}

// ── iPad Split Pane ───────────────────────────────────────────
function TabletSplitPane({ activeCatId, categories, selectedPeptide, onSelectPeptide, favorites, favFilter }) {
  const cat=categories.find(c=>c.id===activeCatId)
  if(!cat) return <div style={{ width:200,borderRight:'1px solid #1e1e2e',background:'#090912',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><span style={{ fontSize:11,fontFamily:'monospace',color:'#2d2d45' }}>Select a category</span></div>
  const pool=cat.isCondition
    ?(cat.subcategories||[]).flatMap(s=>s.peptides.map(p=>({...p,_sub:s.name})))
    :(cat.peptides||[]).map(p=>({...p,_sub:null}))
  const filtered=favFilter?pool.filter(p=>!!favorites[p.id]):pool
  const groups=cat.isCondition
    ?(cat.subcategories||[]).map(s=>({name:s.name,items:filtered.filter(p=>p._sub===s.name)})).filter(g=>g.items.length)
    :[{name:null,items:filtered}]
  return (
    <div style={{ width:200,borderRight:'1px solid #1e1e2e',background:'#090912',display:'flex',flexDirection:'column',flexShrink:0,overflowY:'auto',scrollbarWidth:'thin',scrollbarColor:'#181828 transparent' }}>
      <div style={{ padding:'10px 12px 8px',borderBottom:'1px solid #1e1e2e',flexShrink:0 }}>
        <div style={{ fontSize:9,fontFamily:'monospace',color:cat.color_hex,letterSpacing:'0.1em',marginBottom:2 }}>{cat.isCondition?'✦ ':''}{cat.label.toUpperCase()}</div>
        <div style={{ fontSize:9,fontFamily:'monospace',color:'#3a3a55' }}>{cat.peptides.length} compounds</div>
      </div>
      <div style={{ flex:1,overflowY:'auto' }}>
        {groups.map(group=>(
          <div key={group.name||'all'}>
            {group.name&&<div style={{ padding:'6px 12px 3px',fontSize:7,fontFamily:'monospace',color:cat.color_hex,letterSpacing:'0.12em',background:`${cat.color_hex}08`,borderBottom:`1px solid ${cat.color_hex}22` }}>{group.name.toUpperCase()}</div>}
            {group.items.map(p=>(
              <button key={p.id} onClick={()=>onSelectPeptide(cat,p)}
                style={{ width:'100%',display:'flex',alignItems:'center',gap:7,padding:'9px 12px',background:selectedPeptide?.id===p.id?`${cat.color_hex}12`:'transparent',border:'none',borderLeft:`2px solid ${selectedPeptide?.id===p.id?cat.color_hex:'transparent'}`,cursor:'pointer',textAlign:'left',borderBottom:'1px solid #0e0e18' }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:11,fontFamily:'monospace',color:selectedPeptide?.id===p.id?cat.color_hex:'#a8a398',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize:8,fontFamily:'monospace',color:'#2d2d45',marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{p.class}</div>
                </div>
                {!!favorites[p.id]&&<span style={{ color:'#f97316',fontSize:9,flexShrink:0 }}>★</span>}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Loading ───────────────────────────────────────────────────
function LoadingScreen({ error }) {
  return <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'#07070e',gap:20 }}>
    <div style={{ width:64,height:64,borderRadius:'50%',background:'rgba(45,212,191,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>⬡</div>
    <div>
      <div style={{ fontSize:20,fontWeight:'normal',color:'#f0ebe0',textAlign:'center' }}>Peptide Compendium</div>
      <div style={{ fontSize:9,fontFamily:'monospace',color:'#4a4a6a',letterSpacing:'0.14em',textAlign:'center',marginTop:4 }}>REFERENCE GUIDE</div>
    </div>
    {error?<div style={{ fontSize:12,fontFamily:'monospace',color:'#f87171',background:'#1a0a0a',border:'1px solid #f8717133',borderRadius:6,padding:'10px 18px',maxWidth:360,textAlign:'center' }}>Error: {error}</div>
      :<><div style={{ display:'flex',gap:6 }}>{[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:'50%',background:'#2dd4bf',opacity:0.6,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite alternate` }}/>)}</div><style>{`@keyframes pulse{from{opacity:.2}to{opacity:1}}`}</style></>
    }
  </div>
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const bp=useBreakpoint()
  const [categories,setCategories]=useState([])
  const [stacks,setStacks]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState(null)
  const [selectedPeptide,setSelectedPeptide]=useState(null)
  const [selectedCategory,setSelectedCategory]=useState(null)
  const [selectedStack,setSelectedStack]=useState(null)
  const [showHome,setShowHome]=useState(true)
  const [showStacks,setShowStacks]=useState(false)
  const [showRecon,setShowRecon]=useState(false)
  const [showDashboard,setShowDashboard]=useState(false)
  const [favorites,setFavorites]=useState({})
  const [favFilter,setFavFilter]=useState(false)
  const [search,setSearch]=useState('')
  const [userKey,setUserKey]=useState(()=>localStorage.getItem('peptide_user_key')||null)
  const [showProfileModal,setShowProfileModal]=useState(false)
  const [cycles,setCycles]=useState([])
  const [vials,setVials]=useState([])
  const [doseLogs,setDoseLogs]=useState([])

  useEffect(()=>{if(!userKey)setShowProfileModal(true)},[])

  const reloadTracking=()=>{
    if(!userKey||userKey==='__guest__')return
    Promise.all([fetchCycles(userKey),fetchVials(userKey),fetchDoseLogs(userKey)])
      .then(([c,v,d])=>{setCycles(c);setVials(v);setDoseLogs(d)})
  }
  useEffect(reloadTracking,[userKey])

  useEffect(()=>{
    Promise.all([fetchAll(),fetchStacks()])
      .then(([cats,stks])=>{setCategories(cats);setStacks(stks);setLoading(false)})
      .catch(err=>{setError(err.message);setLoading(false)})
  },[])

  useEffect(()=>{
    if(!userKey||userKey==='__guest__')return
    loadFavorites(userKey).then(rows=>{
      const map={};rows.forEach(r=>{map[r.peptide_id]=true});setFavorites(map)
    })
  },[userKey])

  const handleProfileConfirm=(key)=>{
    localStorage.setItem('peptide_user_key',key);setUserKey(key);setShowProfileModal(false)
  }
  const toggleFav=async(peptide,category)=>{
    const pid=peptide.id;const isCurrent=!!favorites[pid]
    setFavorites(prev=>{const n={...prev};if(isCurrent)delete n[pid];else n[pid]=true;return n})
    if(userKey&&userKey!=='__guest__'){
      if(isCurrent)await removeFavorite(userKey,pid);else await addFavorite(userKey,pid,category?.id)
    }
  }
  const handleSelectPeptide=(cat,peptide)=>{
    if(!peptide)return
    setSelectedCategory(cat);setSelectedPeptide(peptide);setSelectedStack(null);setShowHome(false);setShowStacks(false);setShowRecon(false);setShowDashboard(false)
  }
  const handleSelectStack=(stack)=>{
    setSelectedStack(stack);setSelectedPeptide(null);setSelectedCategory(null);setShowHome(false);setShowStacks(false);setShowRecon(false);setShowDashboard(false)
  }
  const handleShowStacks=()=>{
    setShowStacks(true);setShowHome(false);setSelectedPeptide(null);setSelectedCategory(null);setSelectedStack(null);setShowRecon(false);setShowDashboard(false)
  }
  const handleShowRecon=()=>{
    setShowRecon(true);setShowHome(false);setShowStacks(false);setSelectedPeptide(null);setSelectedCategory(null);setSelectedStack(null);setShowDashboard(false)
  }
  const handleShowDashboard=()=>{
    setShowDashboard(true);setShowHome(false);setShowStacks(false);setSelectedPeptide(null);setSelectedCategory(null);setSelectedStack(null);setShowRecon(false)
    reloadTracking()
  }
  const handleStartStackCycles=async(stack,peptides)=>{
    if(!userKey||userKey==='__guest__'){alert('Set up a profile first to track cycles.');return}
    if(!confirm(`Create ${peptides.length} cycles from "${stack.name}"? You can set vial concentration on each afterward.`))return
    const { saveCycle }=await import('./lib/supabase.js')
    const today=new Date().toISOString().slice(0,10)
    for(const p of peptides){
      await saveCycle({ user_key:userKey, peptide_id:p.peptide_id, start_date:today, planned_days:56,
        dose_amount:p.dosing||'', frequency:p.frequency||'', route:p.route||'Subcutaneous', syringe_type:'U-100' })
    }
    reloadTracking()
    handleShowDashboard()
    alert(`${peptides.length} cycles created. Edit each in the Cycles tab to add vial concentration for unit conversion.`)
  }
  const handleHome=()=>{
    setShowHome(true);setShowStacks(false);setSelectedPeptide(null);setSelectedCategory(null);setSelectedStack(null);setShowRecon(false);setShowDashboard(false)
  }
  const handleHomeCategoryClick=(catId,peptide)=>{
    const cat=categories.find(c=>c.id===catId);if(!cat)return
    const p=peptide||cat.peptides[0];if(p)handleSelectPeptide(cat,p)
  }
  const peptideMap={}
  categories.forEach(cat=>{
    const pool=cat.isCondition?(cat.subcategories||[]).flatMap(s=>s.peptides):(cat.peptides||[])
    pool.forEach(p=>{if(!peptideMap[p.id])peptideMap[p.id]=p})
  })
  const allPeptides=Object.values(peptideMap)

  const isFav=selectedPeptide?!!favorites[selectedPeptide.id]:false
  const isMobile=bp==='mobile'
  const isTablet=bp==='tablet'
  const view=showHome?'home':showDashboard?'dashboard':showRecon?'recon':showStacks?'stacks':selectedStack?'stackDetail':'peptide'

  if(loading||error)return <LoadingScreen error={error}/>

  const Breadcrumb=()=>(
    <div style={{ padding:'9px 24px',borderBottom:'1px solid #131320',background:'#090912',display:'flex',alignItems:'center',gap:9,flexShrink:0 }}>
      {selectedStack?(
        <><span style={{ color:'#a78bfa',fontSize:10,fontFamily:'monospace',cursor:'pointer' }} onClick={handleShowStacks}>Stacks & Blends</span>
          <span style={{ color:'#272737',fontSize:10 }}>›</span>
          <span style={{ color:'#a78bfa',fontSize:10,fontFamily:'monospace',opacity:0.7 }}>{selectedStack.subcategory}</span>
          <span style={{ color:'#272737',fontSize:10 }}>›</span>
          <span style={{ color:'#a8a398',fontSize:10,fontFamily:'monospace' }}>{selectedStack.name}</span>
        </>
      ):selectedPeptide?(
        <><span style={{ color:selectedCategory?.color_hex,fontSize:10,fontFamily:'monospace',cursor:'pointer' }} onClick={()=>handleHomeCategoryClick(selectedCategory.id)}>{selectedCategory?.label}</span>
          {selectedPeptide.subcategory&&<><span style={{ color:'#272737',fontSize:10 }}>›</span><span style={{ color:selectedCategory?.color_hex+'88',fontSize:10,fontFamily:'monospace' }}>{selectedPeptide.subcategory}</span></>}
          <span style={{ color:'#272737',fontSize:10 }}>›</span>
          <span style={{ color:'#a8a398',fontSize:10,fontFamily:'monospace' }}>{selectedPeptide.name}</span>
          <div style={{ marginLeft:'auto' }}><StatusPill status={selectedPeptide.status}/></div>
        </>
      ):(
        <span style={{ color:'#272737',fontSize:10,fontFamily:'monospace' }}>SELECT A COMPOUND FROM THE NAVIGATION ABOVE</span>
      )}
    </div>
  )

  if(isMobile) return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh',background:'#07070e',color:'#ddd8cc',fontFamily:"Georgia,'Times New Roman',serif",overflow:'hidden' }}>
      {showProfileModal&&<ProfileModal onConfirm={handleProfileConfirm}/>}
      <MobileNav categories={categories} stacks={stacks} selectedPeptide={selectedPeptide}
        onSelectPeptide={handleSelectPeptide} onSelectStack={handleSelectStack}
        favorites={favorites} search={search} onSearch={setSearch}
        onHome={handleHome} showHome={showHome} showStacks={showStacks} onShowStacks={handleShowStacks}
        onShowRecon={handleShowRecon} onShowDashboard={handleShowDashboard}
        showRecon={showRecon} showDashboard={showDashboard}/>
      <div style={{ flex:1,overflow:'hidden',display:'flex',flexDirection:'column',paddingBottom:56 }}>
        {view==='home'&&<HomePage categories={categories} onSelectPeptide={handleHomeCategoryClick}/>}
        {view==='recon'&&<ReconstitutionPage/>}
        {view==='dashboard'&&<Dashboard userKey={userKey} allPeptides={allPeptides} cycles={cycles} vials={vials} doseLogs={doseLogs} reload={reloadTracking} bp={bp}/>}
        {view==='stacks'&&<StacksPage stacks={stacks} onSelectStack={handleSelectStack} allCategories={categories}/>}
        {view==='stackDetail'&&(
          <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
            <div style={{ padding:'9px 16px',borderBottom:'1px solid #131320',background:'#090912',display:'flex',alignItems:'center',gap:8,flexShrink:0 }}>
              <button onClick={handleShowStacks} style={{ background:'none',border:'none',cursor:'pointer',color:'#a78bfa',fontSize:16 }}>‹</button>
              <span style={{ fontSize:10,fontFamily:'monospace',color:'#a78bfa' }}>{selectedStack.name}</span>
            </div>
            <StackDetailView stack={selectedStack} peptideMap={peptideMap} onSelectPeptide={handleSelectPeptide} allCategories={categories} onStartCycles={handleStartStackCycles}/>
          </div>
        )}
        {view==='peptide'&&(
          <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
            {selectedPeptide
              ?<DetailView peptide={selectedPeptide} category={selectedCategory} isFav={isFav} onToggleFav={()=>toggleFav(selectedPeptide,selectedCategory)} stacks={stacks} onSelectStack={handleSelectStack} bp={bp}/>
              :<div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14,color:'#1e1e2e' }}>
                <div style={{ fontSize:48,opacity:0.12 }}>⬡</div>
                <div style={{ fontSize:11,fontFamily:'monospace',letterSpacing:'0.12em',opacity:0.4,textAlign:'center',padding:'0 20px' }}>TAP BROWSE TO EXPLORE COMPOUNDS</div>
              </div>
            }
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh',background:'#07070e',color:'#ddd8cc',fontFamily:"Georgia,'Times New Roman',serif",overflow:'hidden' }}>
      {showProfileModal&&<ProfileModal onConfirm={handleProfileConfirm}/>}
      <TopNav categories={categories} activeCatId={selectedCategory?.id} selectedPeptide={selectedPeptide}
        onSelectPeptide={handleSelectPeptide} favorites={favorites} favFilter={favFilter}
        onToggleFavFilter={()=>setFavFilter(f=>!f)} search={search} onSearch={setSearch}
        onHome={handleHome} showHome={showHome} onShowStacks={handleShowStacks}
        showStacks={showStacks||!!selectedStack} bp={bp}
        onShowRecon={handleShowRecon} onShowDashboard={handleShowDashboard}
        showRecon={showRecon} showDashboard={showDashboard}/>
      <div style={{ flex:1,overflow:'hidden',display:'flex',flexDirection:'column' }}>
        {view==='home'&&<HomePage categories={categories} onSelectPeptide={handleHomeCategoryClick}/>}
        {view==='recon'&&<ReconstitutionPage/>}
        {view==='dashboard'&&<Dashboard userKey={userKey} allPeptides={allPeptides} cycles={cycles} vials={vials} doseLogs={doseLogs} reload={reloadTracking} bp={bp}/>}
        {view==='stacks'&&<StacksPage stacks={stacks} onSelectStack={handleSelectStack} allCategories={categories}/>}
        {(view==='stackDetail'||view==='peptide')&&(
          <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
            <Breadcrumb/>
            <div style={{ flex:1,display:'flex',overflow:'hidden' }}>
              {isTablet&&view==='peptide'&&selectedCategory&&(
                <TabletSplitPane activeCatId={selectedCategory.id} categories={categories}
                  selectedPeptide={selectedPeptide} onSelectPeptide={handleSelectPeptide}
                  favorites={favorites} favFilter={favFilter}/>
              )}
              <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
                {view==='stackDetail'&&<StackDetailView stack={selectedStack} peptideMap={peptideMap} onSelectPeptide={handleSelectPeptide} allCategories={categories} onStartCycles={handleStartStackCycles}/>}
                {view==='peptide'&&(selectedPeptide
                  ?<DetailView peptide={selectedPeptide} category={selectedCategory} isFav={isFav} onToggleFav={()=>toggleFav(selectedPeptide,selectedCategory)} stacks={stacks} onSelectStack={handleSelectStack} bp={bp}/>
                  :<div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,color:'#1e1e2e' }}>
                    <div style={{ fontSize:56,opacity:0.12 }}>⬡</div>
                    <div style={{ fontSize:11,fontFamily:'monospace',letterSpacing:'0.12em',opacity:0.4 }}>SELECT A PEPTIDE FROM THE CATEGORY MENU ABOVE</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {userKey&&userKey!=='__guest__'&&(
        <div style={{ position:'fixed',bottom:12,right:16,fontSize:9,fontFamily:'monospace',color:'#2d2d45',display:'flex',alignItems:'center',gap:5,cursor:'pointer' }}
          onClick={()=>setShowProfileModal(true)}>
          <span style={{ color:'#34d399',fontSize:8 }}>●</span>Syncing as: {userKey}
        </div>
      )}
    </div>
  )
}
