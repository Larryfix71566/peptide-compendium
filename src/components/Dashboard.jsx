import { useState, useMemo } from 'react'
import {
  fetchCycles, saveCycle, updateCycle, deleteCycle,
  fetchVials, saveVial, updateVial, deleteVial,
  fetchDoseLogs, saveDoseLog, deleteDoseLog,
} from '../lib/supabase.js'
import {
  cycleDay, cycleProgress, daysRemaining, isOnDay, vialStatus, vialAgeDays,
  expectedDosesToDate, fmtDate, fmtDateTime, todayISO,
} from '../lib/cycleHelpers.js'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'

const ACCENT = '#60a5fa'
const TABS = [
  { id:'today',     label:'Today',     icon:'◉' },
  { id:'overview',  label:'Overview',  icon:'◈' },
  { id:'analytics', label:'Analytics', icon:'◧' },
  { id:'cycles',    label:'Cycles',    icon:'⟳' },
]

export default function Dashboard({ userKey, allPeptides, cycles, vials, doseLogs, reload, bp }) {
  const [tab, setTab] = useState('today')
  const isMobile = bp === 'mobile'
  const px = isMobile ? '16px' : '48px'

  const activeCycles = cycles.filter(c => c.status === 'active')

  return (
    <div style={{ overflowY:'auto', flex:1, scrollbarWidth:'thin', scrollbarColor:'#1e1e2e transparent' }}>
      <div style={{ background:'linear-gradient(135deg,#0a0a14 0%,#0d1320 50%,#0a0a14 100%)', padding:`32px ${px} 0`, borderBottom:'1px solid #131320' }}>
        <div style={{ fontSize:11, fontFamily:'monospace', color:ACCENT, letterSpacing:'0.18em', marginBottom:10 }}>DASHBOARD</div>
        <h1 style={{ margin:'0 0 18px', fontSize:isMobile?26:32, fontWeight:300, color:'#f0ebe0' }}>Tracking & Protocols</h1>
        <div style={{ display:'flex', gap:2, overflowX:'auto', scrollbarWidth:'none' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', background: tab===t.id ? `${ACCENT}1a` : 'transparent',
                border:'none', borderBottom:`2px solid ${tab===t.id ? ACCENT : 'transparent'}`, color: tab===t.id ? ACCENT : '#8a8598',
                cursor:'pointer', fontSize:13, fontFamily:'monospace', whiteSpace:'nowrap' }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:`28px ${px} 48px` }}>
        {tab==='today'     && <TodayTab     userKey={userKey} cycles={activeCycles} vials={vials} doseLogs={doseLogs} allPeptides={allPeptides} reload={reload} isMobile={isMobile}/>}
        {tab==='overview'  && <OverviewTab  cycles={cycles} vials={vials} doseLogs={doseLogs} allPeptides={allPeptides} isMobile={isMobile}/>}
        {tab==='analytics' && <AnalyticsTab cycles={cycles} vials={vials} doseLogs={doseLogs} allPeptides={allPeptides} isMobile={isMobile}/>}
        {tab==='cycles'    && <CyclesTab    userKey={userKey} cycles={cycles} vials={vials} allPeptides={allPeptides} reload={reload} isMobile={isMobile}/>}
      </div>
    </div>
  )
}

function peptideName(allPeptides, id) {
  const p = allPeptides.find(x => x.id === id)
  return p ? p.name : id
}

// ── TODAY TAB ─────────────────────────────────────────────────
function TodayTab({ userKey, cycles, vials, doseLogs, allPeptides, reload, isMobile }) {
  const today = todayISO()
  const todayLogs = doseLogs.filter(l => l.logged_at.slice(0,10) === today)

  const dueToday = cycles.filter(c => isOnDay(c)).map(c => {
    const logged = todayLogs.find(l => l.cycle_id === c.id && !l.skipped)
    return { cycle:c, logged: !!logged, logId: logged?.id }
  })

  const expiringVials = vials.filter(v => {
    const s = vialStatus(v); return s.level === 'warning' || s.level === 'expired'
  })

  async function logDose(cycle) {
    await saveDoseLog({
      user_key:userKey, cycle_id:cycle.id, peptide_id:cycle.peptide_id,
      dose_amount:cycle.dose_amount, logged_at:new Date().toISOString(),
    })
    reload()
  }
  async function undoDose(logId) { await deleteDoseLog(logId); reload() }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap:12 }}>
        <Stat label="ACTIVE CYCLES" value={cycles.length} accent={ACCENT}/>
        <Stat label="DUE TODAY" value={dueToday.length} accent="#fbbf24"/>
        <Stat label="LOGGED TODAY" value={todayLogs.filter(l=>!l.skipped).length} accent="#34d399"/>
        <Stat label="VIAL ALERTS" value={expiringVials.length} accent={expiringVials.length?'#f87171':'#34d399'}/>
      </div>

      <Section title="TODAY'S DOSES" accent={ACCENT}>
        {dueToday.length === 0
          ? <Empty>No doses scheduled today. {cycles.length===0 && 'Start a cycle in the Cycles tab.'}</Empty>
          : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {dueToday.map(({cycle, logged, logId}) => (
                <div key={cycle.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#0c0c18', border:`1px solid ${logged?'#34d39933':'#1a1a28'}`, borderRadius:8 }}>
                  <button onClick={()=> logged ? undoDose(logId) : logDose(cycle)}
                    style={{ width:26, height:26, borderRadius:6, flexShrink:0, cursor:'pointer',
                      background: logged?'#34d39922':'transparent', border:`1.5px solid ${logged?'#34d399':'#3a3a55'}`,
                      color:'#34d399', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {logged ? '✓' : ''}
                  </button>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, color: logged?'#34d399':'#d4cfc4', fontFamily:'monospace' }}>{peptideName(allPeptides, cycle.peptide_id)}</div>
                    <div style={{ fontSize:11, color:'#5a5550', fontFamily:'monospace', marginTop:2 }}>
                      {cycle.dose_amount} · {cycle.frequency} · day {cycleDay(cycle)}{cycle.planned_days?`/${cycle.planned_days}`:''}
                    </div>
                  </div>
                  {logged && <span style={{ fontSize:10, fontFamily:'monospace', color:'#34d399' }}>DONE</span>}
                </div>
              ))}
            </div>
        }
      </Section>

      {expiringVials.length > 0 && (
        <Section title="VIAL ALERTS" accent="#f87171">
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {expiringVials.map(v => {
              const s = vialStatus(v)
              return (
                <div key={v.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#0c0c18', border:`1px solid ${s.color}33`, borderLeft:`3px solid ${s.color}`, borderRadius:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:'#d4cfc4', fontFamily:'monospace' }}>{v.label || peptideName(allPeptides, v.peptide_id)}</div>
                    <div style={{ fontSize:11, color:s.color, fontFamily:'monospace', marginTop:2 }}>{s.label} · {v.mg_strength}mg in {v.bac_water_ml}mL</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── OVERVIEW TAB ──────────────────────────────────────────────
function OverviewTab({ cycles, vials, doseLogs, allPeptides, isMobile }) {
  const active = cycles.filter(c => c.status==='active')

  // 7-day heatmap
  const days = []
  for (let i=6; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i)
    const iso = d.toISOString().slice(0,10)
    const count = doseLogs.filter(l => l.logged_at.slice(0,10)===iso && !l.skipped).length
    days.push({ iso, count, label: d.toLocaleDateString('en-US',{weekday:'short'}) })
  }
  const maxCount = Math.max(...days.map(d=>d.count), 1)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <Section title="ACTIVE CYCLE PROGRESS" accent={ACCENT}>
        {active.length===0
          ? <Empty>No active cycles.</Empty>
          : <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {active.map(c => {
                const prog = cycleProgress(c)
                const rem = daysRemaining(c)
                return (
                  <div key={c.id}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:13, color:'#d4cfc4', fontFamily:'monospace' }}>{peptideName(allPeptides, c.peptide_id)}</span>
                      <span style={{ fontSize:11, color:'#5a5550', fontFamily:'monospace' }}>
                        day {cycleDay(c)}{c.planned_days?` / ${c.planned_days}`:''}{rem!==null?` · ${rem}d left`:''}
                      </span>
                    </div>
                    <div style={{ height:8, background:'#0c0c18', borderRadius:4, overflow:'hidden', border:'1px solid #1a1a28' }}>
                      <div style={{ height:'100%', width:`${(prog||0)*100}%`, background:`linear-gradient(90deg,${ACCENT}88,${ACCENT})`, transition:'width .3s' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
        }
      </Section>

      <Section title="LAST 7 DAYS" accent="#34d399">
        <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:100 }}>
          {days.map(d => (
            <div key={d.iso} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ flex:1, width:'100%', display:'flex', alignItems:'flex-end' }}>
                <div style={{ width:'100%', height:`${(d.count/maxCount)*100}%`, minHeight: d.count?8:2,
                  background: d.count ? `${'#34d399'}${d.count>=maxCount?'':'aa'}` : '#1a1a28', borderRadius:'4px 4px 0 0' }}/>
              </div>
              <span style={{ fontSize:9, fontFamily:'monospace', color:'#5a5550' }}>{d.label}</span>
              <span style={{ fontSize:10, fontFamily:'monospace', color: d.count?'#34d399':'#3a3a55' }}>{d.count}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="CYCLES ENDING SOON" accent="#fbbf24">
        {(() => {
          const ending = active.filter(c => { const r = daysRemaining(c); return r!==null && r<=7 })
          return ending.length===0
            ? <Empty>Nothing ending in the next 7 days.</Empty>
            : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {ending.map(c => (
                  <div key={c.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', background:'#0c0c18', border:'1px solid #fbbf2433', borderRadius:8 }}>
                    <span style={{ fontSize:13, color:'#d4cfc4', fontFamily:'monospace' }}>{peptideName(allPeptides, c.peptide_id)}</span>
                    <span style={{ fontSize:12, color:'#fbbf24', fontFamily:'monospace' }}>{daysRemaining(c)}d left</span>
                  </div>
                ))}
              </div>
        })()}
      </Section>
    </div>
  )
}

// ── ANALYTICS TAB ─────────────────────────────────────────────
function AnalyticsTab({ cycles, vials, doseLogs, allPeptides, isMobile }) {
  // Doses over last 30 days
  const series = useMemo(() => {
    const arr = []
    for (let i=29; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i)
      const iso = d.toISOString().slice(0,10)
      const count = doseLogs.filter(l => l.logged_at.slice(0,10)===iso && !l.skipped).length
      arr.push({ date: d.toLocaleDateString('en-US',{month:'numeric',day:'numeric'}), doses: count })
    }
    return arr
  }, [doseLogs])

  // Doses per peptide
  const byPeptide = useMemo(() => {
    const m = {}
    doseLogs.filter(l=>!l.skipped).forEach(l => { m[l.peptide_id] = (m[l.peptide_id]||0)+1 })
    return Object.entries(m).map(([id,count]) => ({ name: peptideName(allPeptides,id), count })).sort((a,b)=>b.count-a.count).slice(0,8)
  }, [doseLogs, allPeptides])

  // Cost analysis
  const totalCost = vials.reduce((s,v) => s + (Number(v.vial_cost)||0), 0)
  const totalDoses = doseLogs.filter(l=>!l.skipped).length
  const costPerDose = totalDoses>0 ? totalCost/totalDoses : 0

  const COLORS = ['#60a5fa','#34d399','#fbbf24','#f472b6','#a78bfa','#2dd4bf','#fb923c','#f87171']

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap:12 }}>
        <Stat label="TOTAL DOSES" value={totalDoses} accent={ACCENT}/>
        <Stat label="TOTAL SPENT" value={`$${totalCost.toFixed(0)}`} accent="#34d399"/>
        <Stat label="COST / DOSE" value={`$${costPerDose.toFixed(2)}`} accent="#fbbf24"/>
        <Stat label="VIALS" value={vials.length} accent="#a78bfa"/>
      </div>

      <Section title="DOSES — LAST 30 DAYS" accent={ACCENT}>
        <div style={{ height:200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a28"/>
              <XAxis dataKey="date" tick={{ fill:'#5a5550', fontSize:9, fontFamily:'monospace' }} interval={isMobile?6:3}/>
              <YAxis tick={{ fill:'#5a5550', fontSize:9, fontFamily:'monospace' }} allowDecimals={false}/>
              <Tooltip contentStyle={{ background:'#0c0c18', border:'1px solid #2a2a3e', borderRadius:6, fontSize:12, fontFamily:'monospace' }} labelStyle={{ color:'#a8a398' }}/>
              <Line type="monotone" dataKey="doses" stroke={ACCENT} strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {byPeptide.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:24 }}>
          <Section title="DOSES BY PEPTIDE" accent="#34d399">
            <div style={{ height:220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byPeptide} layout="vertical" margin={{ left:10, right:10 }}>
                  <XAxis type="number" tick={{ fill:'#5a5550', fontSize:9, fontFamily:'monospace' }} allowDecimals={false}/>
                  <YAxis type="category" dataKey="name" tick={{ fill:'#8a8598', fontSize:9, fontFamily:'monospace' }} width={90}/>
                  <Tooltip contentStyle={{ background:'#0c0c18', border:'1px solid #2a2a3e', borderRadius:6, fontSize:12 }}/>
                  <Bar dataKey="count" fill="#34d399" radius={[0,4,4,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
          <Section title="DOSE DISTRIBUTION" accent="#a78bfa">
            <div style={{ height:220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byPeptide} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                    {byPeptide.map((e,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'#0c0c18', border:'1px solid #2a2a3e', borderRadius:6, fontSize:12 }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>
      )}

      {totalDoses === 0 && <Empty>No dose data yet. Log doses in the Today tab to see analytics.</Empty>}
    </div>
  )
}

// ── CYCLES TAB ────────────────────────────────────────────────
function CyclesTab({ userKey, cycles, vials, allPeptides, reload, isMobile }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function handleSave(form) {
    if (editing) await updateCycle(editing.id, form)
    else await saveCycle({ ...form, user_key:userKey })
    setShowForm(false); setEditing(null); reload()
  }
  async function setStatus(c, status) { await updateCycle(c.id, { status }); reload() }
  async function remove(c) { if (confirm('Delete this cycle and its dose logs?')) { await deleteCycle(c.id); reload() } }

  const active = cycles.filter(c=>c.status==='active')
  const other  = cycles.filter(c=>c.status!=='active')

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <button onClick={()=>{ setEditing(null); setShowForm(true) }}
        style={{ alignSelf:'flex-start', padding:'10px 18px', background:`${ACCENT}1a`, border:`1px solid ${ACCENT}55`, borderRadius:8, color:ACCENT, fontSize:13, fontFamily:'monospace', cursor:'pointer' }}>
        + Start New Cycle
      </button>

      {showForm && <CycleForm cycle={editing} allPeptides={allPeptides} vials={vials} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditing(null)}}/>}

      <Section title="ACTIVE" accent="#34d399">
        {active.length===0 ? <Empty>No active cycles.</Empty>
          : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {active.map(c => <CycleRow key={c.id} c={c} allPeptides={allPeptides} onEdit={()=>{setEditing(c);setShowForm(true)}} onPause={()=>setStatus(c,'paused')} onComplete={()=>setStatus(c,'completed')} onDelete={()=>remove(c)}/>)}
            </div>}
      </Section>

      {other.length>0 && (
        <Section title="PAUSED & COMPLETED" accent="#6a6560">
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {other.map(c => <CycleRow key={c.id} c={c} allPeptides={allPeptides} dim onEdit={()=>{setEditing(c);setShowForm(true)}} onResume={()=>setStatus(c,'active')} onDelete={()=>remove(c)}/>)}
          </div>
        </Section>
      )}
    </div>
  )
}

function CycleRow({ c, allPeptides, dim, onEdit, onPause, onResume, onComplete, onDelete }) {
  return (
    <div style={{ padding:'14px 16px', background:'#0c0c18', border:'1px solid #1a1a28', borderRadius:8, opacity: dim?0.6:1 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, color:'#d4cfc4', fontFamily:'monospace' }}>{peptideName(allPeptides, c.peptide_id)}</div>
          <div style={{ fontSize:11, color:'#5a5550', fontFamily:'monospace', marginTop:3 }}>
            {c.dose_amount} · {c.frequency} · {c.route}
          </div>
          <div style={{ fontSize:11, color:'#5a5550', fontFamily:'monospace', marginTop:2 }}>
            Started {fmtDate(c.start_date)} · day {cycleDay(c)}{c.planned_days?` of ${c.planned_days}`:''}
            {c.on_days?` · ${c.on_days}on/${c.off_days}off`:''}
          </div>
        </div>
        <span style={{ fontSize:9, fontFamily:'monospace', padding:'2px 8px', borderRadius:4,
          background: c.status==='active'?'#34d39922':c.status==='paused'?'#fbbf2422':'#3a3a5522',
          color: c.status==='active'?'#34d399':c.status==='paused'?'#fbbf24':'#6a6560' }}>{c.status.toUpperCase()}</span>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
        <MiniBtn onClick={onEdit}>Edit</MiniBtn>
        {onPause && <MiniBtn onClick={onPause}>Pause</MiniBtn>}
        {onResume && <MiniBtn onClick={onResume} accent="#34d399">Resume</MiniBtn>}
        {onComplete && <MiniBtn onClick={onComplete} accent="#60a5fa">Complete</MiniBtn>}
        <MiniBtn onClick={onDelete} accent="#f87171">Delete</MiniBtn>
      </div>
    </div>
  )
}

function CycleForm({ cycle, allPeptides, vials, onSave, onCancel }) {
  const [peptideId, setPeptideId] = useState(cycle?.peptide_id || allPeptides[0]?.id || '')
  const [startDate, setStartDate] = useState(cycle?.start_date || todayISO())
  const [plannedDays, setPlannedDays] = useState(cycle?.planned_days || 56)
  const [doseAmount, setDoseAmount] = useState(cycle?.dose_amount || '')
  const [frequency, setFrequency] = useState(cycle?.frequency || '')
  const [route, setRoute] = useState(cycle?.route || 'Subcutaneous')
  const [onDays, setOnDays] = useState(cycle?.on_days || '')
  const [offDays, setOffDays] = useState(cycle?.off_days || '')

  // Auto-fill dose/freq/route from peptide defaults
  function onPeptideChange(id) {
    setPeptideId(id)
    const p = allPeptides.find(x=>x.id===id)
    if (p && !cycle) {
      setDoseAmount(p.dosing || '')
      setFrequency(p.frequency || '')
      setRoute(p.route || 'Subcutaneous')
    }
  }

  const inp = { width:'100%', boxSizing:'border-box', padding:'9px 12px', background:'#0f0f20', border:'1px solid #2a2a3e', borderRadius:6, color:'#ddd8cc', fontSize:13, fontFamily:'monospace', outline:'none' }
  const lbl = { display:'block', fontSize:9, fontFamily:'monospace', color:'#6a6a8a', letterSpacing:'0.1em', marginBottom:5 }

  return (
    <div style={{ padding:'20px', background:'#0a0a14', border:`1px solid ${ACCENT}33`, borderRadius:10 }}>
      <div style={{ fontSize:13, fontFamily:'monospace', color:ACCENT, marginBottom:16 }}>{cycle?'Edit':'New'} Cycle</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div style={{ gridColumn:'1 / -1' }}>
          <label style={lbl}>PEPTIDE</label>
          <select value={peptideId} onChange={e=>onPeptideChange(e.target.value)} style={{...inp, cursor:'pointer'}}>
            {allPeptides.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div><label style={lbl}>START DATE</label><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inp}/></div>
        <div><label style={lbl}>PLANNED DAYS</label><input type="number" value={plannedDays} onChange={e=>setPlannedDays(parseInt(e.target.value)||0)} style={inp}/></div>
        <div><label style={lbl}>DOSE</label><input value={doseAmount} onChange={e=>setDoseAmount(e.target.value)} placeholder="250 mcg" style={inp}/></div>
        <div><label style={lbl}>FREQUENCY</label><input value={frequency} onChange={e=>setFrequency(e.target.value)} placeholder="1x daily AM" style={inp}/></div>
        <div><label style={lbl}>ROUTE</label><input value={route} onChange={e=>setRoute(e.target.value)} style={inp}/></div>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ flex:1 }}><label style={lbl}>ON DAYS</label><input type="number" value={onDays} onChange={e=>setOnDays(e.target.value)} placeholder="opt." style={inp}/></div>
          <div style={{ flex:1 }}><label style={lbl}>OFF DAYS</label><input type="number" value={offDays} onChange={e=>setOffDays(e.target.value)} placeholder="opt." style={inp}/></div>
        </div>
      </div>
      <div style={{ display:'flex', gap:10, marginTop:18 }}>
        <button onClick={()=>onSave({ peptide_id:peptideId, start_date:startDate, planned_days:plannedDays||null, dose_amount:doseAmount, frequency, route, on_days:onDays?parseInt(onDays):null, off_days:offDays?parseInt(offDays):null })}
          style={{ padding:'9px 20px', background:`${ACCENT}22`, border:`1px solid ${ACCENT}`, borderRadius:6, color:ACCENT, fontSize:13, fontFamily:'monospace', cursor:'pointer' }}>Save</button>
        <button onClick={onCancel} style={{ padding:'9px 20px', background:'transparent', border:'1px solid #2a2a3e', borderRadius:6, color:'#8a8598', fontSize:13, fontFamily:'monospace', cursor:'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

// ── Shared primitives ─────────────────────────────────────────
function Stat({ label, value, accent }) {
  return (
    <div style={{ background:'#0c0c18', border:`1px solid ${accent}33`, borderTop:`2px solid ${accent}`, borderRadius:8, padding:'14px 16px' }}>
      <div style={{ fontSize:9, fontFamily:'monospace', color:'#6a6a8a', letterSpacing:'0.1em', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:24, color:accent, fontFamily:'monospace', fontWeight:500 }}>{value}</div>
    </div>
  )
}
function Section({ title, accent, children }) {
  return (
    <section>
      <div style={{ fontSize:10, fontFamily:'monospace', color:accent, letterSpacing:'0.14em', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ display:'inline-block', width:18, height:1, background:accent, opacity:0.5 }}/>{title}
      </div>
      {children}
    </section>
  )
}
function Empty({ children }) {
  return <div style={{ padding:'20px', background:'#08080f', border:'1px dashed #1e1e2e', borderRadius:8, fontSize:12, fontFamily:'monospace', color:'#4a4a6a', textAlign:'center' }}>{children}</div>
}
function MiniBtn({ children, onClick, accent='#8a8598' }) {
  return <button onClick={onClick} style={{ padding:'5px 12px', background:'transparent', border:`1px solid ${accent}44`, borderRadius:5, color:accent, fontSize:11, fontFamily:'monospace', cursor:'pointer' }}>{children}</button>
}
