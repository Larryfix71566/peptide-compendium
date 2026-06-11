export default function HomePage({ categories, onSelectPeptide }) {
  const SUMMARIES = {
    ghrp:      'Stimulate natural GH release from the pituitary. Foundation of most peptide protocols for lean mass, fat loss, recovery, and anti-aging.',
    ghrh:      'Provide the hypothalamic signal that triggers pituitary GH production. Always paired with a GHRP for synergistic effect.',
    repair:    'Accelerate healing of tendons, ligaments, gut lining, and wounds. BPC-157 and TB-500 are the gold standard injury recovery pairing.',
    fatloss:   'Target fat metabolism through lipolysis stimulation, appetite suppression, and improved insulin sensitivity without sacrificing muscle.',
    neuro:     'Enhance cognitive function, neuroprotection, and neuroplasticity. From nootropics to NAD+ — the tools of brain optimization.',
    longevity: 'Address the root hallmarks of aging: telomere shortening, immune senescence, mitochondrial decline, and neuroendocrine dysfunction.',
    sexual:    'Address sexual function through central brain pathways and hormonal cascades, not just vascular mechanisms like PDE5 inhibitors.',
    cardio:    'Support immune competence, cardiovascular protection, and the body\'s antimicrobial defenses through thymic and immune peptides.',
    skin:      'Drive collagen synthesis, reduce expression lines, and support skin structural integrity through cosmeceutical signal peptides.',
  }

  const PRINCIPLES = [
    { icon: '⏱', title: 'Fasted Administration', body: 'Most injectable peptides — especially GH secretagogues — require a fasted state (2+ hours post-meal). Insulin elevation directly blunts GH release and lipolytic activity.' },
    { icon: '🔄', title: 'Synergistic Stacking', body: 'Peptides work best in complementary pairs. The canonical example: Mod GRF 1-29 + Ipamorelin co-injected produces 3-10x more GH than either alone due to dual receptor activation.' },
    { icon: '📅', title: 'Cycle On and Off', body: 'Most peptides require cycling to prevent receptor desensitization. GHRPs typically run 8-12 weeks on, 4 weeks off. Continuous use leads to diminishing returns.' },
    { icon: '🌙', title: 'Bedtime Timing', body: 'Growth hormone peptides are most effective at bedtime — they amplify the natural GH pulse that occurs during slow-wave sleep, typically 1-2 hours after sleep onset.' },
    { icon: '⚗️', title: 'Quality Sourcing', body: 'Peptide purity varies dramatically across suppliers. Many compounds degrade rapidly if improperly stored or reconstituted. Lyophilized peptides should be refrigerated after reconstitution.' },
    { icon: '🩺', title: 'Medical Supervision', body: 'This reference is educational. Many compounds are research chemicals not approved for human use. Blood work and physician oversight are strongly recommended for any peptide protocol.' },
  ]

  return (
    <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'thin', scrollbarColor: '#1e1e2e transparent' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #0d1a1a 50%, #0a0a14 100%)', padding: '60px 60px 48px', borderBottom: '1px solid #131320' }}>
        <div style={{ maxWidth: 900 }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#2dd4bf', letterSpacing: '0.18em', marginBottom: 14 }}>
            PEPTIDE REFERENCE GUIDE
          </div>
          <h1 style={{ margin: '0 0 18px', fontSize: 42, fontWeight: 300, color: '#f0ebe0', lineHeight: 1.2, letterSpacing: '0.01em' }}>
            The Peptide Compendium
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 16, color: '#8a857a', lineHeight: 1.9, maxWidth: 720 }}>
            Peptides are short chains of amino acids — the body's own signaling molecules — that direct biological processes with remarkable specificity.
            Unlike traditional drugs that broadly block or stimulate receptors, peptides mimic endogenous signals to promote healing, regulate hormones,
            sharpen cognition, and slow age-related decline. This compendium covers {categories.reduce((a, c) => a + c.peptides.length, 0)} compounds
            across {categories.length} categories with detailed mechanisms, dosing protocols, stacking guidance, and timing optimization.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: `${categories.reduce((a,c) => a + c.peptides.length, 0)} Compounds`, color: '#2dd4bf' },
              { label: `${categories.length} Categories`, color: '#60a5fa' },
              { label: 'Stacking Guides', color: '#fb923c' },
              { label: 'Dosing Timing', color: '#a78bfa' },
            ].map(({ label, color }) => (
              <span key={label} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.06em', background: `${color}15`, color, border: `1px solid ${color}33` }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* What are Peptides */}
      <div style={{ padding: '48px 60px', borderBottom: '1px solid #131320', maxWidth: 1100 }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#2dd4bf', letterSpacing: '0.16em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 18, height: 1, background: '#2dd4bf', opacity: 0.5 }} />
          WHAT ARE PEPTIDES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#b8b3a8', lineHeight: 1.85 }}>
              Peptides are defined as chains of 2–50 amino acids. They are structurally distinct from proteins (which are longer chains) and from
              individual amino acid supplements. The body produces thousands of endogenous peptides — from insulin (51 amino acids) to the
              dipeptides that signal tissue repair after injury.
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#b8b3a8', lineHeight: 1.85 }}>
              Synthetic peptides are designed to mimic or amplify these endogenous signals. Because they target specific receptors,
              they can achieve targeted effects — stimulating GH release from the pituitary without affecting cortisol, for example,
              or healing gut mucosa without systemic immunosuppression.
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#b8b3a8', lineHeight: 1.85 }}>
              Most therapeutic peptides are administered subcutaneously (just under the skin) using small insulin syringes, as peptide bonds
              are broken down in the digestive system before absorption. Exceptions exist — BPC-157 and KPV have oral bioavailability for
              GI-specific effects, and intranasal delivery (Semax, Selank) efficiently crosses the blood-brain barrier.
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#b8b3a8', lineHeight: 1.85 }}>
              The regulatory landscape varies widely. Some peptides are FDA-approved prescription drugs (Semaglutide, Sermorelin).
              Others are approved internationally but used off-label in the US. Many are research chemicals with promising preclinical
              data but limited human trials. This compendium distinguishes clearly between these categories.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div style={{ padding: '48px 60px', borderBottom: '1px solid #131320' }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#2dd4bf', letterSpacing: '0.16em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 18, height: 1, background: '#2dd4bf', opacity: 0.5 }} />
          BROWSE BY CATEGORY
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {categories.map(cat => (
            <div key={cat.id}
              style={{ background: '#0c0c18', border: `1px solid #1a1a28`, borderLeft: `3px solid ${cat.color_hex}`, borderRadius: 8, padding: '18px 20px', cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0f0f20'}
              onMouseLeave={e => e.currentTarget.style.background = '#0c0c18'}
              onClick={() => onSelectPeptide(cat.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cat.color_hex}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                  ◆
                </div>
                <div>
                  <div style={{ fontSize: 13, fontFamily: 'monospace', color: cat.color_hex, fontWeight: 600 }}>{cat.label}</div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#3a3a55', marginTop: 1 }}>{cat.peptides.length} compounds</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#6a6560', lineHeight: 1.65 }}>{SUMMARIES[cat.id]}</p>
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {cat.peptides.slice(0, 4).map(p => (
                  <span key={p.id} onClick={e => { e.stopPropagation(); onSelectPeptide(cat.id, p) }}
                    style={{ fontSize: 10, fontFamily: 'monospace', color: '#4a4a6a', padding: '2px 8px', background: '#0e0e1c', borderRadius: 4, border: '1px solid #1e1e2e', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.color = cat.color_hex; e.currentTarget.style.borderColor = cat.color_hex + '66' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#4a4a6a'; e.currentTarget.style.borderColor = '#1e1e2e' }}>
                    {p.name}
                  </span>
                ))}
                {cat.peptides.length > 4 && (
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#2a2a3e', padding: '2px 8px' }}>+{cat.peptides.length - 4} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Principles */}
      <div style={{ padding: '48px 60px', borderBottom: '1px solid #131320' }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#2dd4bf', letterSpacing: '0.16em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 18, height: 1, background: '#2dd4bf', opacity: 0.5 }} />
          KEY PRINCIPLES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {PRINCIPLES.map(p => (
            <div key={p.title} style={{ background: '#0c0c18', border: '1px solid #1a1a28', borderRadius: 8, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#c4bfb0', fontWeight: 600 }}>{p.title}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#6a6560', lineHeight: 1.7 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: '24px 60px 40px' }}>
        <div style={{ padding: '14px 20px', background: '#08080f', border: '1px solid #131320', borderRadius: 8, fontSize: 11, fontFamily: 'monospace', color: '#2d2d45', lineHeight: 1.8 }}>
          ⚠ This compendium is for educational and research purposes only. Dosing and stacking information reflects published research literature and community protocols.
          It is NOT a prescription or medical recommendation. Many compounds listed are research chemicals not approved for human use in all jurisdictions.
          Consult a qualified healthcare provider before considering any peptide therapy.
        </div>
      </div>

    </div>
  )
}
