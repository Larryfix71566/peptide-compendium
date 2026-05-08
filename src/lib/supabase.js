import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function fetchAll() {
  const [catsRes, pepRes, benRes, fxRes, stackRes, popularStacksRes, stackMembersRes, researchRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('peptides').select('*').order('sort_order'),
    supabase.from('benefits').select('*').order('sort_order'),
    supabase.from('side_effects').select('*').order('sort_order'),
    supabase.from('stack_items').select('*').order('sort_order'),
    supabase.from('popular_stacks').select('*').order('sort_order'),
    supabase.from('stack_members').select('*').order('sort_order'),
    supabase.from('peptide_research').select('*').order('year', { ascending: false }),
  ])

  if (catsRes.error) throw catsRes.error
  if (pepRes.error)  throw pepRes.error

  const benefits      = benRes.data          || []
  const sideEffects   = fxRes.data           || []
  const stackItems    = stackRes.data        || []
  const popularStacks = popularStacksRes.data || []
  const stackMembers  = stackMembersRes.data  || []
  const researchData  = researchRes.data      || []

  const peptides = pepRes.data.map(p => ({
    ...p,
    benefits:    benefits.filter(b => b.peptide_id === p.id).map(b => b.benefit),
    sideEffects: sideEffects.filter(s => s.peptide_id === p.id).map(s => s.effect),
    stackDos:    stackItems.filter(s => s.peptide_id === p.id && s.type === 'do'),
    stackDonts:  stackItems.filter(s => s.peptide_id === p.id && s.type === 'dont'),
    research:    researchData.filter(r => r.peptide_id === p.id),
  }))

  const pepById = Object.fromEntries(pepRes.data.map(p => [p.id, p.name]))

  const stacksWithMembers = popularStacks.map(stack => ({
    ...stack,
    members: stackMembers
      .filter(m => m.stack_id === stack.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(m => ({ ...m, peptide_name: pepById[m.peptide_id] || m.peptide_id })),
  }))

  return catsRes.data.map(cat => {
    if (cat.id === 'stacks') {
      return { ...cat, peptides: [], stacks: stacksWithMembers }
    }
    return {
      ...cat,
      peptides: peptides.filter(p => {
        if (p.category_id === cat.id) return true
        const extra = (p.cross_category_ids || '').split(',').map(s => s.trim()).filter(Boolean)
        return extra.includes(cat.id)
      }),
    }
  })
}

// ── Auth: user profiles ───────────────────────────────────────

export async function fetchUserProfile(userId) {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data || null
}

export async function upsertUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Auth: favorites ───────────────────────────────────────────

export async function fetchFavorites(userId) {
  const { data } = await supabase
    .from('user_favorites')
    .select('fav_key')
    .eq('user_id', userId)
  return Object.fromEntries((data || []).map(r => [r.fav_key, true]))
}

export async function toggleFavoriteRemote(userId, key, isNowFav) {
  if (isNowFav) {
    await supabase
      .from('user_favorites')
      .insert({ user_id: userId, fav_key: key })
      .select()
  } else {
    await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('fav_key', key)
  }
}
