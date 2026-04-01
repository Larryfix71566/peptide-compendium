import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Fetch all category/peptide data ───────────────────────────

export async function fetchAll() {
  const [catsRes, pepRes, benRes, fxRes, stackRes, timingRes, catPepRes, contextRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('peptides').select('*').order('sort_order'),
    supabase.from('benefits').select('*').order('sort_order'),
    supabase.from('side_effects').select('*').order('sort_order'),
    supabase.from('stack_items').select('*').order('sort_order'),
    supabase.from('dosing_timing').select('*'),
    supabase.from('category_peptides').select('*').order('sort_order'),
    supabase.from('condition_context').select('*'),
  ])

  if (catsRes.error) throw catsRes.error
  if (pepRes.error)  throw pepRes.error

  const benefits    = benRes.data    || []
  const sideEffects = fxRes.data     || []
  const stackItems  = stackRes.data  || []
  const timings     = timingRes.data || []
  const catPeps     = catPepRes.data || []
  const contexts    = contextRes.data || []

  const CONDITION_CATS = ['diabetes', 'menopause']

  const peptideMap = {}
  pepRes.data.forEach(p => {
    peptideMap[p.id] = {
      ...p,
      benefits:     benefits.filter(b => b.peptide_id === p.id).map(b => b.benefit),
      sideEffects:  sideEffects.filter(s => s.peptide_id === p.id).map(s => s.effect),
      stackDos:     stackItems.filter(s => s.peptide_id === p.id && s.type === 'do'),
      stackDonts:   stackItems.filter(s => s.peptide_id === p.id && s.type === 'dont'),
      dosingTiming: timings.find(t => t.peptide_id === p.id) || null,
    }
  })

  return catsRes.data.map(cat => {
    const isCondition = CONDITION_CATS.includes(cat.id)
    if (isCondition) {
      const junctionRows = catPeps.filter(cp => cp.category_id === cat.id)
      const subcategoryMap = {}
      junctionRows.forEach(row => {
        if (!subcategoryMap[row.subcategory]) subcategoryMap[row.subcategory] = []
        const peptide = peptideMap[row.peptide_id]
        if (!peptide) return
        const context = contexts.find(c => c.peptide_id === row.peptide_id && c.category_id === cat.id)
        subcategoryMap[row.subcategory].push({ ...peptide, conditionContext: context || null, subcategory: row.subcategory })
      })
      return {
        ...cat, isCondition: true,
        subcategories: Object.entries(subcategoryMap).map(([name, peptides]) => ({ name, peptides })),
        peptides: junctionRows.map(r => peptideMap[r.peptide_id]).filter(Boolean),
      }
    }
    return {
      ...cat, isCondition: false,
      peptides: pepRes.data.filter(p => p.category_id === cat.id).map(p => peptideMap[p.id]),
    }
  })
}

// ── Fetch all stacks ──────────────────────────────────────────

export async function fetchStacks() {
  const [stacksRes, spRes] = await Promise.all([
    supabase.from('stacks').select('*').order('sort_order'),
    supabase.from('stack_peptides').select('*').order('sort_order'),
  ])
  if (stacksRes.error) throw stacksRes.error

  const spRows = spRes.data || []

  return stacksRes.data.map(stack => ({
    ...stack,
    peptideRoles: spRows.filter(r => r.stack_id === stack.id),
  }))
}

// ── Favorites ─────────────────────────────────────────────────

export async function loadFavorites(userKey) {
  if (!userKey) return []
  const { data, error } = await supabase
    .from('user_favorites').select('peptide_id, category_id').eq('user_key', userKey)
  if (error) { console.error('loadFavorites error:', error); return [] }
  return data || []
}

export async function addFavorite(userKey, peptideId, categoryId) {
  const { error } = await supabase.from('user_favorites')
    .upsert({ user_key: userKey, peptide_id: peptideId, category_id: categoryId || null },
             { onConflict: 'user_key,peptide_id' })
  if (error) console.error('addFavorite error:', error)
}

export async function removeFavorite(userKey, peptideId) {
  const { error } = await supabase.from('user_favorites')
    .delete().eq('user_key', userKey).eq('peptide_id', peptideId)
  if (error) console.error('removeFavorite error:', error)
}
