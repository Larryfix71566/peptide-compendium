// Cycle + dosing calculation helpers

export function daysBetween(a, b) {
  const ms = new Date(b).setHours(0,0,0,0) - new Date(a).setHours(0,0,0,0)
  return Math.round(ms / 86400000)
}

export function cycleDay(cycle) {
  // 1-indexed day of cycle (day 1 = start date)
  return daysBetween(cycle.start_date, new Date()) + 1
}

export function cycleProgress(cycle) {
  if (!cycle.planned_days) return null
  const day = cycleDay(cycle)
  return Math.min(Math.max(day / cycle.planned_days, 0), 1)
}

export function daysRemaining(cycle) {
  if (!cycle.planned_days) return null
  return Math.max(cycle.planned_days - cycleDay(cycle) + 1, 0)
}

// Is today an "on" day given on/off cycling (e.g. 5 on / 2 off)?
export function isOnDay(cycle, date = new Date()) {
  if (!cycle.on_days || !cycle.off_days) return true // continuous
  const d = daysBetween(cycle.start_date, date)
  if (d < 0) return false
  const period = cycle.on_days + cycle.off_days
  return (d % period) < cycle.on_days
}

// Vial degradation: peptides typically stable ~30 days reconstituted
export function vialAgeDays(vial) {
  if (!vial.reconstituted_at) return null
  return daysBetween(vial.reconstituted_at, new Date())
}
export function vialStatus(vial) {
  const age = vialAgeDays(vial)
  if (age === null) return { level:'unknown', label:'Not reconstituted', color:'#6a6560' }
  if (age > 30) return { level:'expired', label:`${age}d — past 30d`, color:'#f87171' }
  if (age > 24) return { level:'warning', label:`${age}d — expiring soon`, color:'#fbbf24' }
  return { level:'fresh', label:`${age}d old`, color:'#34d399' }
}

// Concentration helpers
export function concMcgPerMl(mg, waterMl) {
  if (!mg || !waterMl) return 0
  return (mg / waterMl) * 1000
}
export function doseToUnits(doseMcg, mg, waterMl, syringeUnits = 100) {
  const conc = concMcgPerMl(mg, waterMl)
  if (!conc) return 0
  const ml = doseMcg / conc
  return ml * syringeUnits
}

// Adherence: logged non-skipped doses / expected doses to date
export function expectedDosesToDate(cycle, dosesPerDay = 1) {
  const day = Math.min(cycleDay(cycle), cycle.planned_days || cycleDay(cycle))
  if (day <= 0) return 0
  if (!cycle.on_days || !cycle.off_days) return day * dosesPerDay
  const period = cycle.on_days + cycle.off_days
  const fullPeriods = Math.floor(day / period)
  const remainder = day % period
  const onDays = fullPeriods * cycle.on_days + Math.min(remainder, cycle.on_days)
  return onDays * dosesPerDay
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' })
}
export function fmtDateTime(d) {
  return new Date(d).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })
}
export function todayISO() {
  return new Date().toISOString().slice(0,10)
}

// Parse a dose string like "250 mcg", "2.5mg", "1 mg" into mcg (number)
export function parseDoseMcg(doseStr) {
  if (!doseStr) return null
  const s = String(doseStr).toLowerCase().replace(/,/g,'')
  const m = s.match(/([\d.]+)\s*(mcg|ug|mg|iu)?/)
  if (!m) return null
  const val = parseFloat(m[1])
  if (isNaN(val)) return null
  const unit = m[2] || 'mcg'
  if (unit === 'mg') return val * 1000
  if (unit === 'iu') return null // IU can't convert without peptide-specific factor
  return val // mcg or ug
}

// Full conversion: dose string + vial -> { units, ml, conc } or null
export function doseDisplayUnits(doseStr, mgStrength, bacWaterMl, syringeUnits = 100) {
  const mcg = parseDoseMcg(doseStr)
  if (mcg == null || !mgStrength || !bacWaterMl) return null
  const conc = concMcgPerMl(mgStrength, bacWaterMl)   // mcg/mL
  if (!conc) return null
  const ml = mcg / conc
  return { units: ml * syringeUnits, ml, conc, mcg }
}

export const SYRINGE_UNITS = { 'U-100': 100, 'U-50': 50, 'U-40': 40 }
