import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchAll, fetchFavorites, toggleFavoriteRemote, supabase } from './lib/supabase.js'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

// ── Helpers ───────────────────────────────────────────────────

function statusColor(status) {
  if (status.includes('FDA-Approved')) return '#34d399'
  if (status.includes('Approved'))     return '#60a5fa'
  if (status.includes('Clinical'))     return '#fbbf24'
  if (status.includes('OTC') || status.includes('Supplement')) return '#a78bfa'
  return '#6b7280'
}

function parseItemText(text, peptideLookup) {
  const names = Object.keys(peptideLookup).sort((a, b) => b.length - a.length)
  const segments = []
  let remaining = text
  while (remaining.length > 0) {
    let matched = false
    for (const name of names) {
      const idx = remaining.toLowerCase().indexOf(name)
      if (idx === 0) {
        segments.push({ text: remaining.slice(0, name.length), match: peptideLookup[name] })
        remaining = remaining.slice(name.length)
        matched = true
        break
      } else if (idx > 0) {
        segments.push({ text: remaining.slice(0, idx), match: null })
        segments.push({ text: remaining.slice(idx, idx + name.length), match: peptideLookup[name] })
        remaining = remaining.slice(idx + name.length)
        matched = true
        break
      }
    }
    if (!matched) {
      segments.push({ text: remaining, match: null })
      break
    }
  }
  return segments
}

// ── Hooks ─────────────────────────────────────────────────────

function useTheme() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('peptide_theme') || 'dark'
  )
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('peptide_theme', theme)
  }, [theme])
  return [theme, setTheme]
}

function useBreakpoint() {
  const get = () =>
    window.innerWidth <= 640  ? 'mobile' :
    window.innerWidth <= 1024 ? 'tablet' : 'desktop'
  const [bp, setBp] = useState(get)
  useEffect(() => {
    const handler = () => setBp(get())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return bp
}

// ── Theme Toggle ──────────────────────────────────────────────

function ThemeToggle({ theme, onTheme }) {
  const options = [
    { id: 'dark',  label: 'Dark',  icon: '◑' },
    { id: 'dim',   label: 'Dim',   icon: '◐' },
    { id: 'light', label: 'Light', icon: '○' },
  ]
  return (
    <div className="theme-toggle">
      {options.map(o => (
        <button
          key={o.id}
          className={`theme-btn${theme === o.id ? ' active' : ''}`}
          onClick={() => onTheme(o.id)}
          title={o.label}
        >
          {o.icon} {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Status Pill ───────────────────────────────────────────────

function StatusPill({ status }) {
  const c = statusColor(status)
  return (
    <span className="status-pill" style={{ '--accent': c }}>
      {status}
    </span>
  )
}

// ── Section Label ─────────────────────────────────────────────

function SecLabel({ color, children }) {
  return (
    <div className="sec-label" style={{ '--accent': color }}>
      <span className="sec-label__line" />
      {children}
    </div>
  )
}

// ── Dosing Card ───────────────────────────────────────────────

function DosingCard({ label, value, color }) {
  return (
    <div className="dosing-card" style={{ '--accent': color }}>
      <div className="dosing-card__label">{label}</div>
      <div className="dosing-card__value">{value}</div>
    </div>
  )
}

// ── Stack Panel ───────────────────────────────────────────────

function StackPanel({ title, isDo, items, peptideLookup, onPeptideClick }) {
  const icon = isDo ? '✓' : '✕'
  const mod  = isDo ? 'stack-panel--do' : 'stack-panel--avoid'
  return (
    <div className={`stack-panel ${mod}`}>
      <div className="stack-panel__header">
        <span className="stack-panel__icon">{icon}</span>
        <span className="stack-panel__title">{title}</span>
      </div>
      <div>
        {items.map((item) => (
          <div key={item.id} className="stack-panel__item">
            <div className="stack-panel__item-name">
              {peptideLookup
                ? parseItemText(item.item, peptideLookup).map((seg, i) =>
                    seg.match ? (
                      <button
                        key={i}
                        className="stack-panel__item-link"
                        onClick={() => onPeptideClick(seg.match.peptide, seg.match.category)}
                      >
                        {seg.text}
                      </button>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    )
                  )
                : item.item}
            </div>
            <div className="stack-panel__item-reason">{item.reason}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="stack-panel__empty">None listed</div>
        )}
      </div>
    </div>
  )
}

// ── Detail View ───────────────────────────────────────────────

function DetailView({ peptide, category, isFav, onToggleFav, peptideLookup, onPeptideClick }) {
  if (!peptide) {
    return (
      <div className="detail detail--empty">
        <div className="detail__empty-icon">⬡</div>
        <div className="detail__empty-text">SELECT A PEPTIDE TO VIEW DETAILS</div>
      </div>
    )
  }

  const col = category.color_hex

  return (
    <div className="detail detail--content" style={{ '--accent': col }}>

      {/* Header */}
      <div className="detail__header">
        <div>
          <h1 className="detail__title">{peptide.name}</h1>
          <div className="detail__aka">{peptide.aka}</div>
          <div className="detail__tags">
            <span className="detail__class-tag">{peptide.class}</span>
            <StatusPill status={peptide.status} />
          </div>
        </div>
        <button
          className={`detail__fav-btn${isFav ? ' active' : ''}`}
          onClick={onToggleFav}
        >
          {isFav ? '★' : '☆'}
        </button>
      </div>

      {/* Gradient divider */}
      <div className="detail__divider" />

      <div className="detail__content">

        {/* Mechanism */}
        <section>
          <SecLabel color={col}>MECHANISM OF ACTION</SecLabel>
          <p className="detail__body">{peptide.mechanism}</p>
        </section>

        {/* Benefits */}
        <section>
          <SecLabel color={col}>BENEFITS &amp; INDICATIONS</SecLabel>
          <div className="detail__benefits">
            {peptide.benefits.map((b, i) => (
              <span key={i} className="detail__benefit-tag">{b}</span>
            ))}
          </div>
        </section>

        {/* Dosing */}
        <section>
          <SecLabel color={col}>DOSING &amp; ADMINISTRATION</SecLabel>
          <div className="detail__dosing-grid">
            <DosingCard label="DOSE"         value={peptide.dosing}    color={col} />
            <DosingCard label="FREQUENCY"    value={peptide.frequency} color={col} />
            <DosingCard label="CYCLE LENGTH" value={peptide.cycle}     color={col} />
            <DosingCard label="ROUTE"        value={peptide.route}     color={col} />
          </div>
        </section>

        {/* Side Effects */}
        <section>
          <SecLabel color={col}>SIDE EFFECTS &amp; CONSIDERATIONS</SecLabel>
          <div className="detail__fx-grid">
            {peptide.sideEffects.map((fx, i) => (
              <div key={i} className="detail__fx-item">
                <span className="detail__fx-bullet">■</span>
                {fx}
              </div>
            ))}
          </div>
        </section>

        {/* Stacking Guide */}
        <section>
          <SecLabel color={col}>STACKING GUIDE</SecLabel>
          <div className="detail__stack-grid">
            <StackPanel title="STACK WITH"      isDo={true}  items={peptide.stackDos}   peptideLookup={peptideLookup} onPeptideClick={onPeptideClick} />
            <StackPanel title="AVOID COMBINING" isDo={false} items={peptide.stackDonts} peptideLookup={peptideLookup} onPeptideClick={onPeptideClick} />
          </div>
        </section>

        {/* Notes */}
        <section>
          <SecLabel color={col}>CLINICAL NOTES</SecLabel>
          <div className="detail__notes">
            <p className="detail__notes-text">{peptide.notes}</p>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="detail__disclaimer">
          This reference is for educational and research purposes only. Dosing and stacking
          information reflects research literature and is NOT a prescription or medical
          recommendation. Many compounds are research chemicals not approved for human use.
          Consult a qualified healthcare provider before any use.
        </div>

      </div>
    </div>
  )
}

// ── Sidebar Auth ─────────────────────────────────────────────

function SidebarAuth({ user, onSignOut }) {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    if (err) { setError(err.message) } else { setSent(true) }
  }

  if (user) {
    return (
      <div className="sidebar__auth">
        <div className="sidebar__auth-user">
          <span className="sidebar__auth-dot">●</span>
          <span className="sidebar__auth-email" title={user.email}>{user.email}</span>
          <button className="sidebar__auth-signout" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="sidebar__auth">
        <div className="sidebar__auth-sent">✓ Check your email for the sign-in link</div>
        <button className="sidebar__auth-resend" onClick={() => setSent(false)}>Try again</button>
      </div>
    )
  }

  return (
    <div className="sidebar__auth">
      <form className="sidebar__auth-form" onSubmit={handleSend}>
        <input
          className="sidebar__auth-input"
          type="email"
          placeholder="Email to save favorites..."
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button className="sidebar__auth-btn" type="submit" disabled={loading}>
          {loading ? '...' : 'Send Magic Link'}
        </button>
      </form>
      {error && <div className="sidebar__auth-error">{error}</div>}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────

function Sidebar({ categories, selectedKey, onSelect, favorites, onToggleFav,
                   favFilter, onToggleFavFilter, search, onSearch,
                   theme, onTheme, sidebarClass, user, onSignOut, onReorder,
                   selectedStack, onSelectStack }) {
  const [expanded, setExpanded] = useState({ ghrp: true })

  const totalCount = categories.reduce((a, c) => a + (c.peptides?.length || 0) + (c.stacks?.length || 0), 0)
  const favCount   = Object.values(favorites).filter(Boolean).length
  const isDraggable = !search && !favFilter

  const visible = categories.map(cat => {
    if (cat.id === 'stacks') {
      return { ...cat, _items: cat.stacks || [] }
    }
    const peptides = (cat.peptides || []).filter(p => {
      const matchS = !search || [p.name, p.aka, p.class]
        .join(' ').toLowerCase().includes(search.toLowerCase())
      const matchF = !favFilter || favorites[`${cat.id}||${p.id}`]
      return matchS && matchF
    })
    return { ...cat, _items: peptides }
  }).filter(c => c._items.length > 0)

  const toggle = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const handleDragEnd = (result) => {
    if (!result.destination || result.source.index === result.destination.index) return
    const ids = visible.map(c => c.id)
    const [moved] = ids.splice(result.source.index, 1)
    ids.splice(result.destination.index, 0, moved)
    onReorder(ids)
  }

  return (
    <aside className={`sidebar${sidebarClass ? ' ' + sidebarClass : ''}`}>

      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-label">REFERENCE GUIDE</div>
        <div className="sidebar__brand-title">Peptide Compendium</div>
        <div className="sidebar__brand-count">
          {totalCount} compounds · {categories.length} categories
        </div>
        <ThemeToggle theme={theme} onTheme={onTheme} />
      </div>

      {/* Search */}
      <div className="sidebar__search">
        <div className="sidebar__search-wrap">
          <span className="sidebar__search-icon">⌕</span>
          <input
            className="sidebar__search-input"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search peptides..."
          />
          {search && (
            <button className="sidebar__search-clear" onClick={() => onSearch('')}>×</button>
          )}
        </div>
      </div>

      {/* Favorites toggle */}
      <div className="sidebar__favs">
        <button
          className={`sidebar__favs-btn${favFilter ? ' active' : ''}`}
          onClick={onToggleFavFilter}
        >
          <span className="sidebar__favs-icon">{favFilter ? '★' : '☆'}</span>
          <span>FAVORITES</span>
          {favCount > 0 && (
            <span className="sidebar__fav-count">{favCount}</span>
          )}
        </button>
      </div>

      {/* Nav */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories" isDropDisabled={!isDraggable}>
          {(droppableProvided) => (
            <nav
              className="sidebar__nav"
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
            >
              {visible.length === 0 && (
                <div className="sidebar__empty">No results found</div>
              )}
              {visible.map((cat, index) => {
                const open = !!expanded[cat.id]
                const isStacks = cat.id === 'stacks'
                return (
                  <Draggable
                    key={cat.id}
                    draggableId={cat.id}
                    index={index}
                    isDragDisabled={!isDraggable}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`sidebar__cat${snapshot.isDragging ? ' dragging' : ''}`}
                        style={{ '--accent': cat.color_hex, ...provided.draggableProps.style }}
                      >
                        {/* Category header */}
                        <div className="sidebar__cat-header">
                          {isDraggable && (
                            <span
                              className="sidebar__drag-handle"
                              {...provided.dragHandleProps}
                              title="Drag to reorder"
                            >⠿</span>
                          )}
                          <button className="sidebar__cat-btn" onClick={() => toggle(cat.id)}>
                            <span className="sidebar__cat-icon">◆</span>
                            <div className="sidebar__cat-info">
                              <div className="sidebar__cat-name">{cat.label}</div>
                              <div className="sidebar__cat-count">{cat._items.length} {isStacks ? 'stacks' : 'compounds'}</div>
                            </div>
                            <span className={`sidebar__chevron${open ? ' open' : ''}`}>▼</span>
                          </button>
                        </div>

                        {/* Items */}
                        {open && isStacks && cat._items.map(stack => {
                          const active = selectedStack?.id === stack.id
                          return (
                            <button
                              key={stack.id}
                              className="sidebar__peptide-btn"
                              data-active={active}
                              onClick={() => onSelectStack(stack, cat)}
                            >
                              <div className="sidebar__peptide-info">
                                <div className="sidebar__peptide-name">{stack.name}</div>
                                <div className="sidebar__peptide-class">{stack.tagline}</div>
                              </div>
                            </button>
                          )
                        })}

                        {open && !isStacks && cat._items.map(p => {
                          const key    = `${cat.id}||${p.id}`
                          const active = selectedKey === key
                          const fav    = !!favorites[key]
                          return (
                            <button
                              key={p.id}
                              className="sidebar__peptide-btn"
                              data-active={active}
                              onClick={() => onSelect(key, p, cat)}
                            >
                              <div className="sidebar__peptide-info">
                                <div className="sidebar__peptide-name">{p.name}</div>
                                <div className="sidebar__peptide-class">{p.class}</div>
                              </div>
                              {fav && <span className="sidebar__fav-star">★</span>}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {droppableProvided.placeholder}
            </nav>
          )}
        </Droppable>
      </DragDropContext>

      <SidebarAuth user={user} onSignOut={onSignOut} />

      <div className="sidebar__footer">
        RESEARCH REFERENCE ONLY — NOT MEDICAL ADVICE
      </div>
    </aside>
  )
}

// ── Stacks Detail View ────────────────────────────────────────

function StacksDetailView({ stack, category, peptideLookup, onPeptideClick }) {
  const col = category.color_hex
  return (
    <div className="detail detail--content" style={{ '--accent': col }}>

      {/* Header */}
      <div className="detail__header">
        <div>
          <h1 className="detail__title">{stack.name}</h1>
          <div className="detail__aka">{stack.tagline}</div>
          <div className="detail__tags">
            <span className="detail__class-tag">Popular Stack</span>
          </div>
        </div>
      </div>

      <div className="detail__divider" />

      <div className="detail__content">

        {/* Rationale */}
        <section>
          <SecLabel color={col}>PROTOCOL RATIONALE</SecLabel>
          <p className="detail__body">{stack.description}</p>
        </section>

        {/* Member peptides */}
        <section>
          <SecLabel color={col}>STACK MEMBERS</SecLabel>
          <div className="stack-members">
            {(stack.members || []).map(m => {
              const entry = peptideLookup[m.peptide_name?.toLowerCase()]
              return (
                <div key={m.id} className="stack-member">
                  <div className="stack-member__header">
                    <div className="stack-member__name-row">
                      {entry ? (
                        <button
                          className="stack-member__name-link"
                          onClick={() => onPeptideClick(entry.peptide, entry.category)}
                        >
                          {m.peptide_name}
                        </button>
                      ) : (
                        <span className="stack-member__name-link">{m.peptide_name}</span>
                      )}
                      <span className={`stack-member__role stack-member__role--${m.role.toLowerCase().replace(/\s+/g, '-')}`}>
                        {m.role}
                      </span>
                    </div>
                    {entry && (
                      <div className="stack-member__meta">
                        <StatusPill status={entry.peptide.status} />
                      </div>
                    )}
                  </div>
                  <p className="stack-member__note">{m.note}</p>
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}

// ── Peptide Modal ─────────────────────────────────────────────

function PeptideModal({ peptide, category, favorites, onToggleFav, peptideLookup, onPeptideClick, onClose }) {
  const key = `${category.id}||${peptide.id}`

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="peptide-modal-overlay" onClick={onClose}>
      <div className="peptide-modal" onClick={e => e.stopPropagation()}>
        <button className="peptide-modal__close" onClick={onClose}>✕</button>
        <div className="peptide-modal__body">
          <DetailView
            peptide={peptide}
            category={category}
            isFav={!!favorites[key]}
            onToggleFav={() => onToggleFav(key)}
            peptideLookup={peptideLookup}
            onPeptideClick={onPeptideClick}
          />
        </div>
      </div>
    </div>
  )
}

// ── Loading Screen ────────────────────────────────────────────

function LoadingScreen({ error }) {
  return (
    <div className="loading">
      <div className="loading__icon">⬡</div>
      <div className="loading__info">
        <div className="loading__title">Peptide Compendium</div>
        <div className="loading__subtitle">REFERENCE GUIDE</div>
      </div>
      {error ? (
        <div className="loading__error">Error: {error}</div>
      ) : (
        <div className="loading__dots">
          <div className="loading__dot" />
          <div className="loading__dot" />
          <div className="loading__dot" />
        </div>
      )}
    </div>
  )
}

// ── Breadcrumb Bar ────────────────────────────────────────────

function BreadcrumbBar({ peptide, category, stack, onOpenSidebar }) {
  return (
    <div className="breadcrumb">
      <button className="hamburger" onClick={onOpenSidebar}>☰</button>
      {peptide ? (
        <>
          <span className="breadcrumb__category" style={{ '--accent': category.color_hex }}>
            {category.label}
          </span>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__peptide">{peptide.name}</span>
          <div className="breadcrumb__status">
            <StatusPill status={peptide.status} />
          </div>
        </>
      ) : stack ? (
        <>
          <span className="breadcrumb__category" style={{ '--accent': category.color_hex }}>
            {category.label}
          </span>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__peptide">{stack.name}</span>
        </>
      ) : (
        <span className="breadcrumb__empty">SELECT A COMPOUND FROM THE SIDEBAR</span>
      )}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────

export default function App() {
  const [categories, setCategories]         = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [selectedKey, setSelectedKey]       = useState(null)
  const [selectedPeptide, setSelectedPeptide]   = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('peptide_favs') || '{}') }
    catch { return {} }
  })
  const [favFilter, setFavFilter]     = useState(false)
  const [search, setSearch]           = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser]               = useState(null)
  const [popupPeptide, setPopupPeptide]   = useState(null)
  const [popupCategory, setPopupCategory] = useState(null)
  const [selectedStack, setSelectedStack] = useState(null)
  const [catOrder, setCatOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('peptide_cat_order') || 'null') }
    catch { return null }
  })

  const [theme, setTheme] = useTheme()
  const bp       = useBreakpoint()
  const isMobile = bp === 'mobile'

  const orderedCategories = useMemo(() => {
    if (!catOrder) return categories
    const orderMap = Object.fromEntries(catOrder.map((id, i) => [id, i]))
    return [...categories].sort((a, b) => (orderMap[a.id] ?? 999) - (orderMap[b.id] ?? 999))
  }, [categories, catOrder])

  const handleReorder = (ids) => {
    setCatOrder(ids)
    try { localStorage.setItem('peptide_cat_order', JSON.stringify(ids)) } catch {}
  }

  const peptideLookup = useMemo(() => {
    const map = {}
    categories.forEach(cat => {
      cat.peptides.forEach(p => {
        if (p.category_id === cat.id) {
          map[p.name.toLowerCase()] = { peptide: p, category: cat }
        }
      })
    })
    return map
  }, [categories])

  // Close drawer when resizing to tablet/desktop
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false)
  }, [isMobile])

  useEffect(() => {
    fetchAll()
      .then(data => { setCategories(data); setLoading(false) })
      .catch(err  => { setError(err.message); setLoading(false) })
  }, [])

  const loadRemoteFavorites = useCallback(async (userId) => {
    const remote = await fetchFavorites(userId)
    const local  = JSON.parse(localStorage.getItem('peptide_favs') || '{}')
    const merged = { ...remote }
    for (const [k, v] of Object.entries(local)) {
      if (v && !merged[k]) {
        await toggleFavoriteRemote(userId, k, true)
        merged[k] = true
      }
    }
    setFavorites(merged)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadRemoteFavorites(u.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadRemoteFavorites(u.id)
    })
    return () => subscription.unsubscribe()
  }, [loadRemoteFavorites])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handlePopupOpen  = (peptide, category) => { setPopupPeptide(peptide); setPopupCategory(category) }
  const handlePopupClose = () => { setPopupPeptide(null); setPopupCategory(null) }

  const toggleFav = (key) => {
    setFavorites(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (user) {
        toggleFavoriteRemote(user.id, key, next[key])
      } else {
        try { localStorage.setItem('peptide_favs', JSON.stringify(next)) } catch {}
      }
      return next
    })
  }

  const handleSelect = (key, peptide, category) => {
    setSelectedKey(key)
    setSelectedPeptide(peptide)
    setSelectedCategory(category)
    setSelectedStack(null)
    if (isMobile) setSidebarOpen(false)
  }

  const handleSelectStack = (stack, category) => {
    setSelectedStack(stack)
    setSelectedCategory(category)
    setSelectedKey(null)
    setSelectedPeptide(null)
    if (isMobile) setSidebarOpen(false)
  }

  if (loading || error) return <LoadingScreen error={error} />

  return (
    <div className="app">
      {popupPeptide && (
        <PeptideModal
          peptide={popupPeptide}
          category={popupCategory}
          favorites={favorites}
          onToggleFav={toggleFav}
          peptideLookup={peptideLookup}
          onPeptideClick={handlePopupOpen}
          onClose={handlePopupClose}
        />
      )}

      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        sidebarClass={isMobile && sidebarOpen ? 'open' : ''}
        categories={orderedCategories}
        selectedKey={selectedKey}
        onSelect={handleSelect}
        favorites={favorites}
        onToggleFav={toggleFav}
        favFilter={favFilter}
        onToggleFavFilter={() => setFavFilter(f => !f)}
        search={search}
        onSearch={setSearch}
        theme={theme}
        onTheme={setTheme}
        user={user}
        onSignOut={handleSignOut}
        onReorder={handleReorder}
        selectedStack={selectedStack}
        onSelectStack={handleSelectStack}
      />

      <main className="main-content">
        <BreadcrumbBar
          peptide={selectedPeptide}
          category={selectedCategory}
          stack={selectedStack}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        {selectedStack
          ? <StacksDetailView
              stack={selectedStack}
              category={selectedCategory}
              peptideLookup={peptideLookup}
              onPeptideClick={handlePopupOpen}
            />
          : <DetailView
              peptide={selectedPeptide}
              category={selectedCategory}
              isFav={!!favorites[selectedKey]}
              onToggleFav={() => selectedKey && toggleFav(selectedKey)}
              peptideLookup={peptideLookup}
              onPeptideClick={handlePopupOpen}
            />
        }
      </main>
    </div>
  )
}
