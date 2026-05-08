import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchAll, fetchFavorites, toggleFavoriteRemote, fetchUserProfile, upsertUserProfile, supabase } from './lib/supabase.js'
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
    localStorage.getItem('peptide_theme') || 'light'
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

// ── Research Section ──────────────────────────────────────────

const STUDY_TYPE_CONFIG = {
  human:    { label: 'Human Clinical Studies', icon: '◉' },
  animal:   { label: 'Animal / Preclinical',   icon: '◎' },
  in_vitro: { label: 'In Vitro / Cell Studies', icon: '◌' },
  review:   { label: 'Reviews & Meta-Analyses', icon: '◈' },
}

function ResearchSection({ research, color }) {
  const grouped = {}
  ;(research || []).forEach(r => {
    if (!grouped[r.study_type]) grouped[r.study_type] = []
    grouped[r.study_type].push(r)
  })

  const order   = ['human', 'animal', 'in_vitro', 'review']
  const present = order.filter(t => grouped[t]?.length)
  if (present.length === 0) return null

  return (
    <section>
      <SecLabel color={color}>RESEARCH REFERENCES</SecLabel>
      <div className="research-groups">
        {present.map(type => (
          <div key={type} className="research-group">
            <div className="research-group__label">
              <span className="research-group__icon" style={{ color }}>{STUDY_TYPE_CONFIG[type].icon}</span>
              {STUDY_TYPE_CONFIG[type].label}
              <span className="research-group__count">{grouped[type].length}</span>
            </div>
            <div className="research-group__items">
              {grouped[type].map(r => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="research-item"
                >
                  <span className="research-item__title">{r.title}</span>
                  <span className="research-item__meta">
                    {r.year && <span className="research-item__year">{r.year}</span>}
                    <span className="research-item__link-icon" style={{ color }}>↗</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
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

        {/* Overview */}
        {peptide.overview && (
          <section>
            <SecLabel color={col}>OVERVIEW</SecLabel>
            <p className="detail__body">{peptide.overview}</p>
          </section>
        )}

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

        {/* Research */}
        <ResearchSection research={peptide.research} color={col} />

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

function SidebarAuth({ user, userProfile, onSignOut }) {
  const [mode, setMode]         = useState('signin')    // 'signin' | 'create' | 'forgot'
  const [authType, setAuthType] = useState('pin')       // 'pin' | 'password'
  const [email, setEmail]       = useState('')
  const [credential, setCred]   = useState('')
  const [displayName, setName]  = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [info, setInfo]         = useState(null)

  const isPIN     = authType === 'pin'
  const minLen    = isPIN ? 4 : 8
  const credValid = credential.length >= minLen
  const canSubmit = email.trim() && credValid && !loading

  const handleCredChange = (e) => {
    const val = e.target.value
    setCred(isPIN ? val.replace(/\D/g, '') : val)
  }

  const switchAuthType = () => {
    setAuthType(t => t === 'pin' ? 'password' : 'pin')
    setCred('')
    setError(null)
  }

  const switchMode = (next) => {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    if (mode === 'forgot') {
      if (!email.trim()) { setLoading(false); return }
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      })
      setLoading(false)
      if (err) setError(err.message)
      else setInfo('Recovery email sent — check your inbox.')
      return
    }

    if (!canSubmit) { setLoading(false); return }

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: credential,
      })
      setLoading(false)
      if (err) setError('Incorrect credentials or no account found')
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password: credential,
      })
      setLoading(false)
      if (err) { setError(err.message); return }
      if (displayName.trim() && data?.user) {
        try { await upsertUserProfile(data.user.id, { display_name: displayName.trim() }) }
        catch {}
      }
      setInfo('Account created! You are now signed in.')
    }
  }

  if (user) {
    return (
      <div className="sidebar__auth">
        <div className="sidebar__auth-user">
          <span className="sidebar__auth-dot">●</span>
          <span className="sidebar__auth-email" title={user.email}>
            {userProfile?.display_name || user.email}
          </span>
          <button className="sidebar__auth-signout" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    )
  }

  if (mode === 'forgot') {
    return (
      <div className="sidebar__auth">
        <form className="sidebar__auth-form" onSubmit={handleSubmit}>
          <input
            className="sidebar__auth-input"
            type="email"
            placeholder="Your account email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
          <button className="sidebar__auth-btn" type="submit" disabled={!email.trim() || loading}>
            {loading ? '...' : 'Send Recovery Email'}
          </button>
        </form>
        <button className="sidebar__auth-toggle" onClick={() => switchMode('signin')}>
          Back to sign in
        </button>
        {error && <div className="sidebar__auth-error">{error}</div>}
        {info  && <div className="sidebar__auth-sent">{info}</div>}
      </div>
    )
  }

  return (
    <div className="sidebar__auth">
      <form className="sidebar__auth-form" onSubmit={handleSubmit}>
        <input
          className="sidebar__auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
        {mode === 'create' && (
          <input
            className="sidebar__auth-input"
            type="text"
            placeholder="Display name (optional)"
            value={displayName}
            onChange={e => setName(e.target.value)}
          />
        )}
        <input
          className="sidebar__auth-input"
          type="password"
          inputMode={isPIN ? 'numeric' : 'text'}
          placeholder={isPIN ? 'PIN (4–6 digits)' : 'Password (8+ characters)'}
          maxLength={isPIN ? 6 : undefined}
          value={credential}
          onChange={handleCredChange}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        />
        <button className="sidebar__auth-type-toggle" type="button" onClick={switchAuthType}>
          {isPIN ? 'Use a password instead' : 'Use a PIN instead'}
        </button>
        {mode === 'signin' && (
          <button className="sidebar__auth-type-toggle" type="button" onClick={() => switchMode('forgot')}>
            Forgot password / PIN?
          </button>
        )}
        <button className="sidebar__auth-btn" type="submit" disabled={!canSubmit}>
          {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <button className="sidebar__auth-toggle" onClick={() => switchMode(mode === 'signin' ? 'create' : 'signin')}>
        {mode === 'signin' ? 'New here? Create account' : 'Already have an account? Sign in'}
      </button>
      {error && <div className="sidebar__auth-error">{error}</div>}
      {info  && <div className="sidebar__auth-sent">{info}</div>}
    </div>
  )
}

// ── Password Reset Modal ──────────────────────────────────────

function PasswordResetModal({ onComplete }) {
  const [authType, setAuthType] = useState('pin')
  const [credential, setCred]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const isPIN     = authType === 'pin'
  const minLen    = isPIN ? 4 : 8
  const credValid = credential.length >= minLen

  const handleCredChange = (e) => {
    const val = e.target.value
    setCred(isPIN ? val.replace(/\D/g, '') : val)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!credValid) return
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password: credential })
    setLoading(false)
    if (err) setError(err.message)
    else onComplete()
  }

  return (
    <div className="peptide-modal-overlay">
      <div className="peptide-modal" style={{ maxWidth: 360 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--text-bright)', fontFamily: 'var(--font-mono)' }}>
          SET NEW PASSWORD
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Choose a new PIN or password for your account.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            className="sidebar__auth-input"
            type="password"
            inputMode={isPIN ? 'numeric' : 'text'}
            placeholder={isPIN ? 'New PIN (4–6 digits)' : 'New password (8+ characters)'}
            maxLength={isPIN ? 6 : undefined}
            value={credential}
            onChange={handleCredChange}
            autoComplete="new-password"
            autoFocus
          />
          <button className="sidebar__auth-type-toggle" type="button"
            onClick={() => { setAuthType(t => t === 'pin' ? 'password' : 'pin'); setCred('') }}>
            {isPIN ? 'Use a password instead' : 'Use a PIN instead'}
          </button>
          <button className="sidebar__auth-btn" type="submit" disabled={!credValid || loading}>
            {loading ? '...' : 'Set New Password'}
          </button>
        </form>
        {error && <div className="sidebar__auth-error" style={{ marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────

function Sidebar({ categories, selectedKey, onSelect, favorites, onToggleFav,
                   favFilter, onToggleFavFilter, search, onSearch,
                   theme, onTheme, sidebarClass, user, userProfile, onSignOut, onReorder,
                   selectedStack, onSelectStack }) {
  const [expanded, setExpanded] = useState({})

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

      <SidebarAuth user={user} userProfile={userProfile} onSignOut={onSignOut} />

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

// ── Home Page ─────────────────────────────────────────────────

const CAT_SUMMARIES = {
  ghrp:      'Stimulate natural GH release from the pituitary. Foundation of most peptide protocols for lean mass, fat loss, recovery, and anti-aging.',
  ghrh:      'Provide the hypothalamic signal that triggers pituitary GH production. Always paired with a GHRP for synergistic effect.',
  repair:    'Accelerate healing of tendons, ligaments, gut lining, and wounds. BPC-157 and TB-500 are the gold standard injury recovery pairing.',
  fatloss:   'Target fat metabolism through lipolysis stimulation, appetite suppression, and improved insulin sensitivity without sacrificing muscle.',
  neuro:     'Enhance cognitive function, neuroprotection, and neuroplasticity. From nootropics to NAD+ — the tools of brain optimization.',
  longevity: 'Address the root hallmarks of aging: telomere shortening, immune senescence, mitochondrial decline, and neuroendocrine dysfunction.',
  sexual:    'Address sexual function through central brain pathways and hormonal cascades, not just vascular mechanisms like PDE5 inhibitors.',
  cardio:    'Protect mitochondrial function in cardiomyocytes, modulate cardiovascular inflammation, and support systemic immune competence.',
  skin:      'Drive collagen synthesis, reduce expression lines, and support skin structural integrity through cosmeceutical signal peptides.',
  diabetes:  'Regulate glucose metabolism, stimulate insulin secretion, protect peripheral nerves, and drive body weight reduction.',
  menopause: 'Support hormonal signaling, reduce vasomotor symptoms, restore libido, and address the neurological dimensions of female aging.',
  stacks:    'Curated multi-peptide protocols combining compounds with complementary mechanisms for synergistic outcomes.',
}

const PRINCIPLES = [
  { icon: '⏱', title: 'Fasted Administration', body: 'Most injectable peptides — especially GH secretagogues — require a fasted state (2+ hours post-meal). Insulin elevation directly blunts GH release and lipolytic activity.' },
  { icon: '◎', title: 'Synergistic Stacking',  body: 'Peptides work best in complementary pairs. The canonical example: Mod GRF 1-29 + Ipamorelin co-injected produces 3–10x more GH than either alone due to dual receptor activation.' },
  { icon: '◷', title: 'Cycle On and Off',       body: 'Most peptides require cycling to prevent receptor desensitization. GHRPs typically run 8–12 weeks on, 4 weeks off. Continuous use leads to diminishing returns.' },
  { icon: '◑', title: 'Bedtime Timing',         body: 'Growth hormone peptides are most effective at bedtime — they amplify the natural GH pulse that occurs during slow-wave sleep, typically 1–2 hours after sleep onset.' },
  { icon: '◈', title: 'Quality Sourcing',       body: 'Peptide purity varies dramatically across suppliers. Many compounds degrade rapidly if improperly stored or reconstituted. Lyophilized peptides should be refrigerated after reconstitution.' },
  { icon: '✦', title: 'Medical Supervision',    body: 'This reference is educational. Many compounds are research chemicals not approved for human use. Blood work and physician oversight are strongly recommended for any peptide protocol.' },
]

function HomePage({ categories, onSelectPeptide, onSelectStack, onOpenSidebar, isMobile }) {
  const peptideCats = categories.filter(c => c.id !== 'stacks')
  const stacksCat   = categories.find(c => c.id === 'stacks')
  const totalCompounds = peptideCats.reduce((a, c) => a + (c.peptides?.length || 0), 0)
  const totalStacks    = stacksCat?.stacks?.length || 0

  return (
    <div className="home">

      {/* Hero */}
      <div className="home__hero">
        {isMobile && (
          <button className="hamburger home__hamburger" onClick={onOpenSidebar}>☰</button>
        )}
        <div className="home__hero-eyebrow">PEPTIDE REFERENCE GUIDE</div>
        <h1 className="home__hero-title">The Peptide Compendium</h1>
        <p className="home__hero-body">
          Peptides are short chains of amino acids — the body's own signaling molecules — that direct biological
          processes with remarkable specificity. Unlike traditional drugs that broadly block or stimulate receptors,
          peptides mimic endogenous signals to promote healing, regulate hormones, sharpen cognition, and slow
          age-related decline. This compendium covers {totalCompounds} compounds across {peptideCats.length} categories
          with detailed mechanisms, dosing protocols, stacking guidance, and timing optimization.
        </p>
        <div className="home__hero-tags">
          {[
            { label: `${totalCompounds} Compounds`,  color: '#2dd4bf' },
            { label: `${peptideCats.length} Categories`, color: '#60a5fa' },
            { label: `${totalStacks} Stacks`,        color: '#f59e0b' },
            { label: 'Stacking Guides',               color: '#fb923c' },
            { label: 'Dosing Protocols',              color: '#a78bfa' },
          ].map(({ label, color }) => (
            <span key={label} className="home__hero-tag" style={{ '--tag-color': color }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* What are Peptides */}
      <div className="home__section">
        <div className="home__section-label">WHAT ARE PEPTIDES</div>
        <div className="home__two-col">
          <p className="home__body-text">
            Peptides are defined as chains of 2–50 amino acids. They are structurally distinct from proteins (which
            are longer chains) and from individual amino acid supplements. The body produces thousands of endogenous
            peptides — from insulin (51 amino acids) to the dipeptides that signal tissue repair after injury.
            Synthetic peptides are designed to mimic or amplify these endogenous signals with targeted specificity.
          </p>
          <p className="home__body-text">
            Most therapeutic peptides are administered subcutaneously using small insulin syringes, as peptide bonds
            are broken down in the digestive system before absorption. Exceptions exist — BPC-157 and KPV have oral
            bioavailability for GI-specific effects, and intranasal delivery (Semax, Selank) efficiently crosses the
            blood-brain barrier. Regulatory status ranges from FDA-approved drugs to research chemicals.
          </p>
        </div>
      </div>

      {/* Browse by Category */}
      <div className="home__section">
        <div className="home__section-label">BROWSE BY CATEGORY</div>
        <div className="home__cat-grid">
          {categories.map(cat => {
            const isStacks = cat.id === 'stacks'
            const items    = isStacks ? (cat.stacks || []) : (cat.peptides || [])
            const count    = items.length
            const summary  = CAT_SUMMARIES[cat.id] || ''
            return (
              <div
                key={cat.id}
                className="home__cat-card"
                style={{ '--accent': cat.color_hex }}
                onClick={() => {
                  if (isStacks) { if (items[0]) onSelectStack(items[0], cat) }
                  else          { if (items[0]) onSelectPeptide(items[0], cat) }
                }}
              >
                <div className="home__cat-card-top">
                  <div className="home__cat-icon">◆</div>
                  <div>
                    <div className="home__cat-name">{cat.label}</div>
                    <div className="home__cat-count">{count} {isStacks ? 'stacks' : 'compounds'}</div>
                  </div>
                </div>
                <p className="home__cat-desc">{summary}</p>
                <div className="home__cat-chips">
                  {items.slice(0, 4).map(item => (
                    <button
                      key={item.id}
                      className="home__cat-chip"
                      onClick={e => {
                        e.stopPropagation()
                        if (isStacks) onSelectStack(item, cat)
                        else          onSelectPeptide(item, cat)
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
                  {items.length > 4 && (
                    <span className="home__cat-more">+{items.length - 4} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Principles */}
      <div className="home__section">
        <div className="home__section-label">KEY PRINCIPLES</div>
        <div className="home__principles-grid">
          {PRINCIPLES.map(p => (
            <div key={p.title} className="home__principle-card">
              <div className="home__principle-header">
                <span className="home__principle-icon">{p.icon}</span>
                <span className="home__principle-title">{p.title}</span>
              </div>
              <p className="home__principle-body">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="home__section home__section--last">
        <div className="home__disclaimer">
          This compendium is for educational and research purposes only. Dosing and stacking information reflects
          published research literature and community protocols. It is NOT a prescription or medical recommendation.
          Many compounds listed are research chemicals not approved for human use in all jurisdictions. Consult a
          qualified healthcare provider before considering any peptide therapy.
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
  const [userProfile, setUserProfile] = useState(null)
  const [recoveryMode, setRecoveryMode] = useState(false)
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
    const [remote, profile] = await Promise.all([
      fetchFavorites(userId),
      fetchUserProfile(userId),
    ])
    setUserProfile(profile)
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
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true)
        return
      }
      const u = session?.user ?? null
      setUser(u)
      if (u) loadRemoteFavorites(u.id)
    })
    return () => subscription.unsubscribe()
  }, [loadRemoteFavorites])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
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
      {recoveryMode && (
        <PasswordResetModal onComplete={() => setRecoveryMode(false)} />
      )}
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
        userProfile={userProfile}
        onSignOut={handleSignOut}
        onReorder={handleReorder}
        selectedStack={selectedStack}
        onSelectStack={handleSelectStack}
      />

      <main className="main-content">
        {(selectedPeptide || selectedStack) && (
          <BreadcrumbBar
            peptide={selectedPeptide}
            category={selectedCategory}
            stack={selectedStack}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        )}
        {!selectedPeptide && !selectedStack
          ? <HomePage
              categories={orderedCategories}
              onSelectPeptide={(peptide, cat) => handleSelect(`${cat.id}||${peptide.id}`, peptide, cat)}
              onSelectStack={handleSelectStack}
              onOpenSidebar={() => setSidebarOpen(true)}
              isMobile={isMobile}
            />
          : selectedStack
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
