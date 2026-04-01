-- ============================================================
-- STACKS & BLENDS MIGRATION
-- Run in Supabase SQL Editor after all previous migrations
-- ============================================================

-- ── Tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stacks (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  nickname     TEXT,
  subcategory  TEXT NOT NULL,
  color_hex    TEXT NOT NULL DEFAULT '#2dd4bf',
  overview     TEXT NOT NULL,
  synergy      TEXT NOT NULL,
  protocol     TEXT NOT NULL,
  timing_notes TEXT,
  avoid_notes  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stack_peptides (
  id          SERIAL PRIMARY KEY,
  stack_id    TEXT NOT NULL REFERENCES stacks(id),
  peptide_id  TEXT NOT NULL REFERENCES peptides(id),
  role        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(stack_id, peptide_id)
);

ALTER TABLE stacks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_peptides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read stacks"         ON stacks;
DROP POLICY IF EXISTS "Public read stack_peptides" ON stack_peptides;

CREATE POLICY "Public read stacks"         ON stacks         FOR SELECT USING (true);
CREATE POLICY "Public read stack_peptides" ON stack_peptides FOR SELECT USING (true);

-- ── Stack Seed Data ───────────────────────────────────────────

INSERT INTO stacks (id, name, nickname, subcategory, color_hex, overview, synergy, protocol, timing_notes, avoid_notes, sort_order) VALUES

-- HEALING & RECOVERY
('wolverine',
 'Wolverine Stack',
 'BPC-157 + TB-500',
 'Healing & Recovery',
 '#fb923c',
 'The most widely researched and clinically used peptide healing combination. Named after the Marvel superhero known for rapid regeneration, this stack is the gold standard for injury recovery, tendon and ligament repair, and systemic tissue healing.',
 'BPC-157 and TB-500 target completely different mechanisms in the healing cascade — making them additive rather than redundant. BPC-157 acts locally, promoting angiogenesis, upregulating growth factor receptors, and activating the FAK-paxillin pathway for cell migration near the injection site. TB-500 acts systemically — a single injection distributes throughout the body via circulation, driving G-actin sequestration and cell migration to all injured tissues simultaneously. Together they cover local repair signaling (BPC-157) and systemic cell recruitment (TB-500).',
 'BPC-157: 250-500 mcg subcutaneous daily near injury site (or systemic abdominal). TB-500: 2-2.5 mg subcutaneous twice weekly (e.g. Monday and Thursday) during 4-6 week loading phase, then 1x weekly maintenance. Run as separate injections — do not mix in same syringe.',
 'BPC-157: inject in morning, fasting optional. TB-500: any time, no food restrictions. Separate injections by at least a few hours on loading days. Cycle: 8-12 weeks, then assess.',
 'Avoid chronic NSAIDs (blunt healing cascade both peptides rely on). Avoid high-dose corticosteroids. Active malignancy is a contraindication for TB-500 due to angiogenic properties.',
 0),

('klow_blend',
 'Klow Blend',
 'BPC-157 + TB-500 + KPV + GHK-Cu',
 'Healing & Recovery',
 '#fb923c',
 'The most comprehensive peptide healing stack available, targeting every phase of the healing cascade. Sometimes called the Klow Blend in research circles, this four-peptide combination covers inflammation control, cell migration, angiogenesis, and structural collagen remodeling — the complete sequence from injury through full tissue repair.',
 'Each peptide targets a distinct phase: KPV inhibits NF-kB to control initial inflammation without blocking the healing cascade. BPC-157 drives angiogenesis and local growth factor signaling in the proliferative phase. TB-500 drives systemic cell migration and tissue remodeling. GHK-Cu activates over 4,000 genes for collagen synthesis and structural remodeling in the final phase. No mechanism overlap — pure additive coverage.',
 'BPC-157: 250-500 mcg daily subcutaneous. TB-500: 2-2.5 mg 2x weekly loading, then 1x weekly. KPV: 500 mcg-1 mg daily (oral for gut, subcutaneous for systemic). GHK-Cu: topical 2x daily for skin/surface wounds; injectable 1-2 mg 3x weekly for systemic connective tissue. Typical full-stack cycle: 8-12 weeks.',
 'KPV oral before meals if using for gut healing. BPC-157 morning fasted for systemic use, or near injury site. TB-500 any time. GHK-Cu topical AM/PM. Pre-blended single-vial versions exist commercially for convenience.',
 'Avoid combining with strong immunosuppressants — KPV and BPC-157 both modulate immune signaling. Active malignancy contraindication remains for TB-500.',
 1),

('gut_protocol',
 'Gut Healing Protocol',
 'BPC-157 + KPV (Oral)',
 'Healing & Recovery',
 '#fb923c',
 'A targeted oral protocol for GI conditions including IBD, Crohn''s disease, leaky gut, and intestinal inflammation. Both peptides have documented oral bioavailability for GI-specific effects — a rare property among therapeutic peptides that makes this stack uniquely accessible and effective for intestinal repair.',
 'BPC-157 oral route reaches the gut mucosa directly, promoting angiogenesis, repairing tight junctions via FAK-paxillin pathway, and modulating enteric nervous system function. KPV inhibits intestinal NF-kB signaling to reduce the inflammatory tone that perpetuates mucosal damage. Together they address both the structural integrity deficit (BPC-157) and the inflammatory driver (KPV) that characterize most GI conditions.',
 'BPC-157: 200-500 mcg dissolved in water, taken 20-30 minutes before meals, 1-2x daily. KPV: 500 mcg-1 mg oral capsule or dissolved in water, 20-30 minutes before meals. Both can be taken at the same time in the same glass of water. Cycle: 8-12 weeks for chronic conditions; some use ongoing.',
 'Pre-meal timing is critical for both — maximizes mucosal contact time before food dilutes concentration. No injection required for this gut-specific protocol.',
 'Avoid high-dose NSAIDs and alcohol during the protocol — both impair the gut barrier repair these peptides are driving.',
 2),

-- GH AXIS
('core_gh',
 'Core GH Stack',
 'Mod GRF 1-29 + Ipamorelin',
 'GH Axis',
 '#2dd4bf',
 'The canonical growth hormone secretagogue protocol and the most widely prescribed peptide combination in anti-aging and HRT medicine. Mod GRF 1-29 (CJC-1295 without DAC) provides the GHRH signal; Ipamorelin provides the GHRP signal. Together they produce GH pulses 3-10x greater than either compound alone.',
 'The pituitary requires two simultaneous signals to produce a maximal GH pulse: a GHRH signal (mimicked by Mod GRF 1-29) and a GHRP signal (mimicked by Ipamorelin). This mirrors the natural dual-signal mechanism the hypothalamus uses. Either compound alone produces a modest pulse. Together they produce synergistic amplification — the defining characteristic that makes this combination so effective and why it became the gold standard.',
 'Mod GRF 1-29: 100-200 mcg. Ipamorelin: 200-300 mcg. Draw both into the same insulin syringe and inject simultaneously — one injection delivers both. Frequency: 1-3x daily. Bedtime is the most important dose. If dosing once daily, always bedtime. Cycle: 12-16 weeks, 4 weeks off.',
 'Always inject fasted — minimum 90 minutes post-meal. Wait 30-45 minutes post-injection before eating. Bedtime dose is most impactful as it amplifies the natural GH pulse during slow-wave sleep. If dosing 2x daily: bedtime + pre-workout fasted. If 3x daily: morning fasted, pre-workout fasted, bedtime.',
 'Never inject within 90 minutes of eating. Avoid somatostatin analogs. Do not add a second GHRP to the same injection — receptor saturation reduces returns.',
 3),

('triple_gh',
 'Triple GH Stack',
 'Mod GRF 1-29 + Ipamorelin + MK-677',
 'GH Axis',
 '#2dd4bf',
 'An advanced GH optimization protocol combining pulsatile injectable GH stimulation with sustained oral GH/IGF-1 elevation. The injectable duo produces acute GH pulses; MK-677 maintains a continuous GH and IGF-1 baseline between pulses. Together they maximize total GH axis activity across the full 24-hour cycle.',
 'The Core GH Stack produces high, defined GH pulses but levels return to baseline between injections. MK-677 fills this gap by maintaining tonic GH/IGF-1 elevation through continuous ghrelin receptor occupancy. The combination creates both the acute peaks (critical for fat loss and recovery) and the sustained baseline (critical for IGF-1-driven anabolic effects and sleep quality). Three complementary mechanisms — no receptor competition when timed correctly.',
 'Mod GRF 1-29 + Ipamorelin: co-inject at bedtime (most important) and optionally pre-workout. MK-677: 10-25 mg orally each evening. Start MK-677 at 10 mg and titrate up over 2-3 weeks to minimize water retention and hunger. Monitor fasting blood glucose periodically.',
 'MK-677 evening timing minimizes daytime hunger side effects. Injectable peptides: fasted state essential. MK-677 can be taken with or without food. On workout days: inject pre-workout fasted + bedtime; MK-677 in the evening.',
 'Monitor fasting blood glucose — MK-677 can impair insulin sensitivity. Avoid in active cancer due to IGF-1 elevation. Do not add additional GHRPs (receptor saturation with MK-677 already present).',
 4),

('cjc_dac_weekly',
 'CJC-DAC Weekly Stack',
 'CJC-1295 (DAC) + Ipamorelin',
 'GH Axis',
 '#2dd4bf',
 'A convenient once-weekly GH protocol combining long-acting CJC-1295 with DAC for sustained GHRH signaling and mid-week Ipamorelin pulses for additional GH spikes. Suited to users who prefer minimal injection frequency while maintaining meaningful GH axis activity.',
 'CJC-1295 with DAC binds albumin in circulation, extending its half-life to 6-8 days and creating a sustained GH bleed rather than discrete pulses. This tonic elevation differs from the physiologically pulsatile approach of Mod GRF 1-29 but offers practical convenience. Adding Ipamorelin mid-week creates acute GH pulses on top of the sustained GHRH background, increasing total GH output significantly beyond CJC-DAC alone.',
 'CJC-1295 DAC: 1-2 mg subcutaneous once weekly (e.g. every Monday morning). Ipamorelin: 200-300 mcg subcutaneous 1-2x on Wednesday/Thursday (mid-week between CJC-DAC doses). Cycle: 8-12 weeks, 4 weeks off.',
 'CJC-1295 DAC: no strict fasting requirement given its long half-life and tonic mechanism. Ipamorelin: inject fasted. Monday injection creates GH elevation that peaks mid-week — adding Ipamorelin Wednesday-Thursday amplifies the natural peak of the CJC-DAC curve.',
 'Do not combine with Mod GRF 1-29 — two GHRH sources compete for the same receptor. CJC-1295 DAC already occupies GHRH receptors for a week; adding another GHRH compound is redundant and wasteful.',
 5),

-- FAT LOSS & METABOLIC
('glp1_gh_recomp',
 'GLP-1 + GH Recomposition Stack',
 'Semaglutide + CJC-1295/Ipamorelin',
 'Fat Loss & Metabolic',
 '#f472b6',
 'The fastest-growing clinical peptide stack of 2025-2026. Combines the proven fat loss of GLP-1 therapy with GH secretagogues to prevent the muscle wasting that occurs with aggressive GLP-1-driven weight reduction. Addresses the primary clinical weakness of semaglutide monotherapy — body composition quality during weight loss.',
 'Semaglutide powerfully reduces caloric intake and drives 15-20% body weight loss, but approximately 25-40% of that weight loss comes from lean mass (muscle), not fat. GH peptides counter this by maintaining anabolic signaling and preserving lean mass during the caloric deficit. The result is fat-preferential weight loss — the toned, athletic outcome rather than the "skinny fat" outcome that occurs with GLP-1 monotherapy.',
 'Semaglutide: per standard titration protocol (0.25 mg weekly x4 weeks then titrate). CJC-1295 (no DAC) + Ipamorelin: 100-200 mcg + 200-300 mcg co-injected at bedtime 5x weekly. High protein intake (1g per lb body weight) and resistance training are non-negotiable companions to this stack.',
 'Semaglutide: same day each week, any time. GH peptides: bedtime, fasted. On the day of semaglutide injection, timing relative to GH peptides is not critical — they work through entirely different systems.',
 'Reduce insulin or sulfonylurea doses if applicable — semaglutide significantly lowers blood glucose. Monitor for hypoglycemia. Avoid aggressive caloric restriction below 1200 kcal — semaglutide already suppresses appetite significantly and extreme restriction accelerates muscle loss.',
 6),

('nextgen_metabolic',
 'Next-Gen Metabolic Stack',
 'Tirzepatide + CJC-1295/Ipamorelin',
 'Fat Loss & Metabolic',
 '#f472b6',
 'The most aggressive evidence-based fat loss and body recomposition stack available. Tirzepatide''s dual GLP-1/GIP mechanism produces 20-25% body weight reduction — superior to semaglutide — while GH secretagogues preserve and build lean mass during the aggressive caloric reduction. Suited to patients with significant metabolic dysfunction where maximum fat loss is the primary goal.',
 'Tirzepatide''s GIP co-agonism produces greater weight loss than GLP-1 monotherapy and better GI tolerability. The muscle loss risk is proportionally higher at greater weight loss magnitudes, making GH peptide co-administration even more important than with semaglutide. GH axis restoration creates a strongly anabolic environment that directly counteracts the catabolic pressure of aggressive caloric restriction.',
 'Tirzepatide: per standard titration (2.5 mg weekly x4 weeks then titrate every 4 weeks to target dose). CJC-1295 (no DAC) + Ipamorelin: 100-200 mcg + 200-300 mcg co-injected at bedtime. Resistance training 3-4x weekly and high protein intake are essential. DEXA scan or body composition tracking every 3 months recommended.',
 'Tirzepatide: same day each week. GH peptides: bedtime fasted. On tirzepatide injection days, GLP-1 side effects (nausea) peak at 4-8 hours — schedule tirzepatide injection for a time that minimizes disruption to the bedtime GH protocol.',
 'Never combine with semaglutide — tirzepatide already includes full GLP-1 agonism. Do not add additional GHRPs to the bedtime injection — one GHRP + one GHRH is optimal.',
 7),

('direct_lipo',
 'Direct Lipolysis Stack',
 'AOD-9604 + Ipamorelin + Mod GRF 1-29',
 'Fat Loss & Metabolic',
 '#f472b6',
 'A GLP-1-free fat loss and body recomposition stack for patients who cannot use or prefer to avoid GLP-1 agonists. AOD-9604 provides targeted fat burning via beta-3 adrenergic receptor activation; GH peptides drive lean mass preservation, recovery, and secondary metabolic benefits. No appetite suppression, no GI side effects.',
 'AOD-9604 acts on beta-3 adrenergic receptors in adipose tissue to directly stimulate lipolysis and inhibit lipogenesis — completely independent of the GH and IGF-1 axes. This means it adds direct fat burning without affecting the GH pulse produced by the secretagogue stack. The GH peptides simultaneously drive lean mass preservation, improve sleep quality, and support connective tissue health. Fully complementary, zero mechanism overlap.',
 'AOD-9604: 300-500 mcg subcutaneous in the morning fasted. Mod GRF 1-29 + Ipamorelin: 100-200 mcg + 200-300 mcg co-injected at bedtime fasted. AOD-9604 and GH peptides are injected at different times of day — morning vs bedtime. Cycle: 12-16 weeks.',
 'AOD-9604: morning fasted injection — this is critical. Insulin from food completely blocks beta-3 adrenergic lipolysis. Morning fasted exercise after AOD-9604 amplifies fat burning significantly. GH peptides: bedtime fasted as always.',
 'Avoid beta-blockers with AOD-9604 — they antagonize beta-3 adrenergic receptors and block the mechanism. Do not inject AOD-9604 and insulin close in time — insulin is profoundly anti-lipolytic.',
 8),

-- MITOCHONDRIAL & LONGEVITY
('mito_dual',
 'Mito Dual Stack',
 'MOTS-c + SS-31',
 'Mitochondrial & Longevity',
 '#34d399',
 'The foundational mitochondrial optimization protocol. MOTS-c and SS-31 address mitochondrial dysfunction from completely opposite and non-overlapping angles — making this the most mechanistically coherent two-peptide combination in the entire longevity space. Widely described as: if SS-31 is the mechanic repairing your current engine, MOTS-c is the factory building you a new one.',
 'SS-31 selectively concentrates at the inner mitochondrial membrane and restores cardiolipin integrity — the structural lipid that organizes the electron transport chain complexes. This repairs existing mitochondria, reduces ROS leak, and restores ATP production in damaged organelles. MOTS-c, encoded within mitochondrial DNA itself, activates AMPK and PGC-1a to drive mitochondrial biogenesis — the creation of new, healthy mitochondria. Together: repair existing mitochondria (SS-31) + build new ones (MOTS-c) = comprehensive mitochondrial restoration.',
 'MOTS-c: 5-10 mg subcutaneous 3-5x weekly, ideally pre-workout (exercise amplifies AMPK synergistically). SS-31: 0.05-0.25 mg/kg subcutaneous daily. Both can be injected on the same days. Cycle: 12 weeks on, 4 weeks off. Repeat 2x yearly or maintain at lower maintenance frequency.',
 'MOTS-c pre-workout (30-60 min before exercise) produces the greatest metabolic benefit. SS-31 any time — no food timing restrictions. On co-injection days, inject from separate syringes into different sites.',
 'Monitor blood glucose carefully with MOTS-c — significantly improves insulin sensitivity; risk of hypoglycemia with concurrent glucose-lowering medications. Avoid high-calorie processed food diet — blunts MOTS-c metabolic benefits.',
 9),

('mitt_stack',
 'MITT-Stack',
 'MOTS-c + SS-31 + NAD+',
 'Mitochondrial & Longevity',
 '#34d399',
 'The complete mitochondrial restoration triad — addressing structure (SS-31), signaling (MOTS-c), and fuel (NAD+) simultaneously. These are the three axes that determine whether mitochondria produce abundant energy or operate in survival mode. Recognized in the longevity research community as the MITT-Stack (Mitochondrial Integration and Transformation Triad).',
 'SS-31 repairs the membrane where energy production happens. MOTS-c signals the cell to build new mitochondria and metabolically reprogram. NAD+ is the redox currency that both processes require to function — and levels decline 50% between age 20 and 50. New mitochondria built by MOTS-c need charged batteries (NAD+) to function. The membrane SS-31 repairs requires NAD+-dependent enzymes to run. Each amplifies the effectiveness of the others — genuine three-way synergy.',
 'MOTS-c: 5-10 mg subcutaneous 3-5x weekly pre-workout. SS-31: 0.05-0.25 mg/kg subcutaneous daily. NAD+: oral NMN/NR 500-1000 mg daily with TMG (to prevent methylation depletion), or IV NAD+ 250-500 mg 1-3x weekly for faster replenishment. Take TMG alongside NAD+ precursors always. Cycle: 12 weeks on, 4 weeks off for injectables; NAD+ precursors can be continuous.',
 'MOTS-c pre-workout. SS-31 any time. NAD+ morning. Do not drink alcohol the evening of an IV NAD+ session — alcohol immediately consumes NAD+ via alcohol dehydrogenase, wasting the therapy. Resveratrol 500 mg daily activates SIRT1 that NAD+ fuels — a powerful complement.',
 'Monitor blood glucose with MOTS-c and NAD+ combination — both improve insulin sensitivity significantly. Avoid high-dose niacin simultaneously with NAD+ precursors — same pathway, risk of overload.',
 10),

('russian_longevity',
 'Russian Longevity Protocol',
 'Epitalon + Thymalin',
 'Mitochondrial & Longevity',
 '#34d399',
 'The most clinically evidenced longevity peptide combination in existence, developed by the Khavinson Institute in St. Petersburg over 40+ years of research. A 6-year human study demonstrated a 2.5x reduction in mortality when this combination was administered annually. Epitalon addresses the neuroendocrine and telomere axis; Thymalin addresses the immune senescence axis — the two primary biological drivers of aging.',
 'Epitalon activates telomerase to elongate telomeres, restores pineal gland melatonin production and circadian regulation, and normalizes the hypothalamic-pituitary axis. Thymalin restores thymic function and T-cell production — addressing the immunosenescence that leaves aging individuals vulnerable to infection and malignancy. These two mechanisms address fundamentally different hallmarks of aging with no overlap — they are the classic yin and yang of the Russian anti-aging approach.',
 'Run both simultaneously in concurrent courses. Epitalon: 5-10 mg subcutaneous daily for 10-20 consecutive days. Thymalin: 10 mg subcutaneous daily for 10 consecutive days. Do not skip days during the course. Repeat 1-2x per year — traditionally spring (March-April) and fall (September-October). Add low-dose melatonin 0.5-1 mg at bedtime during the course to amplify circadian normalization.',
 'Epitalon: bedtime administration for circadian normalization benefit. Thymalin: morning injection. Both on the same 10-day schedule running concurrently.',
 'Avoid in active malignancy without oncologist oversight — telomerase activation and immune enhancement are both double-edged in cancer. Avoid with immunosuppressive drugs (Thymalin directly opposes their mechanism). Avoid high-dose melatonin (>5 mg) — counterproductive to Epitalon pineal restoration goal.',
 11),

('peak_performance_quad',
 'Peak Performance Quad',
 'CJC-1295/Ipamorelin + MOTS-c + SS-31',
 'Mitochondrial & Longevity',
 '#34d399',
 'An advanced performance and anti-aging protocol combining GH axis optimization with comprehensive mitochondrial restoration. The GH peptides drive hormonal rejuvenation and body composition; MOTS-c and SS-31 address the cellular energy machinery that determines how well the body responds to GH signals. Four peptides, four non-overlapping mechanisms.',
 'GH axis decline and mitochondrial dysfunction are two independent but parallel drivers of age-related performance decline. GH peptides restore anabolic hormonal signaling that drives lean mass, fat loss, and recovery. MOTS-c and SS-31 ensure that the cells receiving those GH signals have the mitochondrial capacity to act on them — GH-driven protein synthesis and repair require substantial cellular energy. Addressing both simultaneously produces outcomes neither approach achieves alone.',
 'CJC-1295 (no DAC) + Ipamorelin: 100-200 mcg + 200-300 mcg co-injected at bedtime 5x weekly. MOTS-c: 5-10 mg subcutaneous 3-5x weekly pre-workout (can overlap with GH injection days). SS-31: 0.05-0.25 mg/kg daily. Practical schedule: Mon-Fri bedtime GH injections; Mon/Wed/Fri morning MOTS-c pre-workout; SS-31 daily any time.',
 'GH peptides: bedtime fasted. MOTS-c: pre-workout morning. SS-31: any time, no food restrictions. On days with both GH peptides and MOTS-c: inject MOTS-c in the morning pre-workout, GH stack at bedtime. Different times of day — no interaction.',
 'Monitor blood glucose — GH peptides and MOTS-c both affect insulin sensitivity, in different directions; net effect requires monitoring. Avoid adding additional GHRPs or GHRHs to the stack.',
 12),

-- COGNITIVE & NEURO
('russian_nootropic',
 'Russian Nootropic Stack',
 'Semax + Selank',
 'Cognitive & Neuro',
 '#a78bfa',
 'The canonical cognitive enhancement peptide combination, developed in Russia and now gaining mainstream adoption globally. Pre-blended 1:1 ratio vials are commercially available from multiple suppliers. Semax provides cognitive stimulation and BDNF upregulation; Selank provides anxiolytic balance and GABA modulation — together producing focused, calm cognition without the anxiety edge of either compound alone.',
 'Semax is stimulating — it rapidly elevates BDNF, activates dopaminergic and serotonergic systems, and drives neuroplasticity and focus. Used alone it can produce an anxious, overstimulated edge that limits its utility. Selank modulates GABA-A receptors and serotonin to produce anxiolysis without sedation — it takes the edge off Semax stimulation and adds memory-consolidating effects. The combined effect: enhanced cognitive performance with emotional stability — the ideal nootropic state.',
 'Semax: 200-600 mcg intranasal. Selank: 250-500 mcg intranasal. Administer 5-10 minutes apart (Selank first to establish the anxiolytic baseline, then Semax). Use 2-3 drops per nostril each. If using pre-blended vial: same dose per the blend ratio. Cycle: 2-4 weeks on, 1-2 weeks off. Morning and early afternoon only — never in the evening.',
 'Always dose in the morning or early afternoon only. Semax stimulating effects persist for 4-8 hours and will disrupt sleep if dosed after 2pm. Selank first, Semax 10-15 minutes later produces the smoothest cognitive onset. Store refrigerated — both peptides degrade faster at room temperature than most injectables.',
 'Never use MAO inhibitors with this stack — serotonin syndrome risk. Avoid full-dose stimulant medications concurrently. Never administer in the afternoon or evening.',
 13),

('triple_nootropic',
 'Triple Nootropic Stack',
 'Semax + Selank + Cerebrolysin',
 'Cognitive & Neuro',
 '#a78bfa',
 'An advanced clinical-grade cognitive optimization protocol combining the Russian nootropic duo with Cerebrolysin — a standardized neuropeptide mixture with decades of clinical trial data for neurological conditions. Used in high-performance executive protocols and for neurological recovery applications.',
 'Semax and Selank address neurotransmitter optimization — dopamine/serotonin stimulation and GABA anxiolysis respectively. Cerebrolysin operates at a different level entirely — it provides exogenous neurotrophic factors (NGF, BDNF analogs, CNTF) that directly support neuronal survival, dendritic sprouting, and synaptic plasticity. The combination covers acute cognitive state optimization (Semax/Selank) and structural neural support and repair (Cerebrolysin). Particularly powerful for neurological recovery, post-concussion protocols, or peak executive performance.',
 'Semax + Selank: intranasal morning protocol as per Russian Nootropic Stack. Cerebrolysin: 5-30 mL IV infusion or IM injection, daily for 10-20 day courses. Practical protocol: run Cerebrolysin in 10-20 day courses 2-3x per year; use Semax + Selank intranasal on the same days or independently as needed.',
 'Semax + Selank: morning only. Cerebrolysin: morning IV or IM during the course. Do not interrupt a Cerebrolysin course midway — neurotrophic cascade effects build throughout the protocol. Cognitive improvements often noticed at days 5-10 of a Cerebrolysin course.',
 'Contraindicated in porcine protein allergy (Cerebrolysin is porcine-derived). Do not combine Dihexa at full doses with this stack — excessive synaptogenesis risk. Avoid MAOIs.',
 14),

('cognitive_repair',
 'Cognitive + Repair Stack',
 'Semax + BPC-157',
 'Cognitive & Neuro',
 '#a78bfa',
 'A neuroprotective and cognitive enhancement combination targeting both the cognitive and physical dimensions of brain health. Semax drives BDNF upregulation and cognitive performance; BPC-157 provides neuroprotection, gut-brain axis support, and serotonin modulation — complementary mechanisms with no overlap.',
 'Semax enhances cognition through BDNF upregulation, dopaminergic/serotonergic activation, and neuroplasticity promotion. BPC-157 complements this through a different route — it modulates the gut-brain axis via enteric nervous system effects, provides direct neuroprotection against excitotoxicity, and modulates dopamine and serotonin systems through NO pathway effects. For individuals under high cognitive load or recovering from neurological stress, combining central BDNF support (Semax) with peripheral neuroprotection and gut-brain axis modulation (BPC-157) creates comprehensive brain support.',
 'Semax: 200-600 mcg intranasal morning. BPC-157: 200-500 mcg subcutaneous daily (systemic), or oral for gut-brain axis effects. Both can be used on the same days without interaction. Semax: 2-4 week on/off cycles. BPC-157: continuous if desired given excellent safety profile.',
 'Semax: morning only, never past early afternoon. BPC-157: timing flexible — morning fasted for systemic effect, or oral pre-meal for gut-brain benefits.',
 'Semax: avoid MAOIs, late dosing. BPC-157: avoid chronic NSAIDs and corticosteroids.',
 15),

-- IMMUNE & THYMIC
('thymic_dual',
 'Thymic Immune Restoration Stack',
 'Thymalin + Thymosin Alpha-1',
 'Immune & Thymic',
 '#60a5fa',
 'A comprehensive two-peptide immune restoration protocol targeting both thymic T-cell production (Thymalin) and mature immune cell activation (Thymosin Alpha-1). Together they address the full spectrum of age-related immunosenescence — the gradual collapse of immune function that begins in middle age and accelerates dramatically at menopause and andropause.',
 'Thymalin restores thymic epithelial function and normalizes T-lymphocyte production — addressing the upstream production deficit of immunosenescence. Thymosin Alpha-1 potentiates and activates the mature immune cells already in circulation — dendritic cell activation, NK cell enhancement, TLR expression upregulation, and CD8+ cytotoxic T-cell amplification. Together they cover immune production (Thymalin) and immune activation (Thymosin Alpha-1) — the two distinct failure points of the aging immune system.',
 'Thymalin: 10 mg subcutaneous daily for 10 consecutive days, 1-2x per year (spring/fall). Thymosin Alpha-1: 1.6 mg subcutaneous twice weekly (Monday/Thursday), year-round or during seasonal courses. Run Thymalin courses with concurrent Thymosin Alpha-1 for maximum immune restoration during the active course period.',
 'Thymalin: morning injection, 10 consecutive days without interruption. Thymosin Alpha-1: Monday/Thursday for consistent 3-4 day spacing. Vitamin D3 10,000 IU daily is a powerful synergistic companion — directly supports T-cell function that both peptides are restoring.',
 'Active autoimmune disease is a relative contraindication — amplifying T-cell activity may worsen autoimmune attack. Immunosuppressive drugs directly oppose both peptides'' mechanisms. Use with caution and physician oversight in transplant patients on immunosuppression.',
 16),

-- SEXUAL FUNCTION
('sexual_performance',
 'Sexual Performance Stack',
 'PT-141 + Testosterone Support',
 'Sexual Function',
 '#f97316',
 'The most clinically validated approach to sexual dysfunction combining PT-141''s central desire activation (FDA-approved for HSDD in women) with hormonal optimization. PT-141 restores libido and arousal through hypothalamic MC4R agonism independently of hormone levels; testosterone optimization addresses the androgen foundation of sexual function. Together they address both the central desire pathway and the hormonal environment simultaneously.',
 'Sexual dysfunction in both men and women typically has two components: central desire failure (loss of libido and arousal drive, mediated by hypothalamic pathways) and peripheral hormonal deficiency (low testosterone reducing baseline sexual interest and function). PT-141 addresses the central component through MC4R and MC3R agonism in the limbic system, completely independent of hormone levels. Testosterone addresses the hormonal component. Neither alone addresses both — the combination is additive and covers the full clinical picture.',
 'PT-141: 0.5-2 mg subcutaneous 45-60 minutes before activity, maximum once every 3 days. Pre-medicate with ondansetron 4 mg 30 minutes before PT-141 to minimize nausea. Testosterone: per physician protocol (TRT). Can be combined with PDE5 inhibitors (sildenafil, tadalafil) for additive peripheral vascular effects alongside PT-141''s central action.',
 'PT-141: evening as-needed, 45-60 minutes before activity. Peak effect at 60-90 minutes, duration 6-12 hours. Start at 0.5 mg to assess nausea tolerance before going to higher doses. The pre-medication with ondansetron is strongly recommended.',
 'Absolute contraindication with nitrate medications (nitroglycerin) — severe hypotension risk. Do not combine with Melanotan II — excessive pan-melanocortin receptor stimulation. Avoid MAO inhibitors.',
 17)

ON CONFLICT (id) DO NOTHING;

-- ── Stack Peptide Assignments ─────────────────────────────────

INSERT INTO stack_peptides (stack_id, peptide_id, role, sort_order) VALUES

-- Wolverine Stack
('wolverine','bpc157','Local angiogenesis, growth factor signaling, FAK-paxillin cell migration, gut cytoprotection',0),
('wolverine','tb500','Systemic G-actin sequestration, cell migration throughout entire body, angiogenesis, anti-inflammatory',1),

-- Klow Blend
('klow_blend','bpc157','Local angiogenesis and growth factor signaling in the proliferative healing phase',0),
('klow_blend','tb500','Systemic cell migration and broad tissue remodeling',1),
('klow_blend','kpv','NF-kB inhibition to control initial inflammation without blocking healing cascade',2),
('klow_blend','ghkcu','Collagen I, III, IV synthesis and structural tissue remodeling in final healing phase',3),

-- Gut Protocol
('gut_protocol','bpc157','Gut mucosal repair, tight junction restoration, enteric nervous system modulation, angiogenesis',0),
('gut_protocol','kpv','Intestinal NF-kB anti-inflammatory signaling, LPS translocation reduction, barrier integrity',1),

-- Core GH Stack
('core_gh','modgrf','GHRH signal to pituitary — amplifies GH synthesis and release readiness',0),
('core_gh','ipamorelin','Selective GHRP signal — triggers clean GH pulse without cortisol or prolactin elevation',1),

-- Triple GH Stack
('triple_gh','modgrf','Pulsatile GHRH signal for discrete acute GH pulses',0),
('triple_gh','ipamorelin','Selective GHRP signal co-administered with Mod GRF for 3-10x amplified GH pulse',1),
('triple_gh','mk677','Oral sustained GH/IGF-1 baseline between injectable pulses; IGF-1 elevation and sleep improvement',2),

-- CJC-DAC Weekly
('cjc_dac_weekly','cjc1295dac','Long-acting GHRH analog — provides week-long GH bleed via albumin binding',0),
('cjc_dac_weekly','ipamorelin','Mid-week pulsatile GH spike on top of CJC-DAC tonic background',1),

-- GLP-1 + GH Recomp
('glp1_gh_recomp','semaglutide','GLP-1 agonism — caloric intake reduction, glucose management, 15-20% body weight loss',0),
('glp1_gh_recomp','modgrf','GHRH signal for GH preservation during caloric deficit',1),
('glp1_gh_recomp','ipamorelin','Clean GHRP to maintain GH pulsatility and lean mass during GLP-1 weight loss',2),

-- Next-Gen Metabolic
('nextgen_metabolic','tirzepatide','Dual GLP-1/GIP agonism — superior weight loss and glucose control',0),
('nextgen_metabolic','modgrf','GHRH signal to preserve lean mass during aggressive tirzepatide weight loss',1),
('nextgen_metabolic','ipamorelin','GHRP for GH pulsatility and anabolic preservation during weight loss',2),

-- Direct Lipo Stack
('direct_lipo','aod9604','Beta-3 adrenergic direct lipolysis — fat burning independent of GH axis or hormones',0),
('direct_lipo','ipamorelin','Clean GH pulse for lean mass preservation and recovery',1),
('direct_lipo','modgrf','GHRH signal to amplify Ipamorelin GH pulse for maximum anabolic support',2),

-- Mito Dual
('mito_dual','motsc','AMPK/PGC-1a activation — mitochondrial biogenesis and metabolic reprogramming',0),
('mito_dual','ss31','Cardiolipin repair at inner mitochondrial membrane — restores existing mitochondria',1),

-- MITT-Stack
('mitt_stack','motsc','AMPK activation and mitochondrial biogenesis — builds new mitochondria',0),
('mitt_stack','ss31','Cardiolipin structural repair — fixes existing mitochondrial membrane integrity',1),
('mitt_stack','nadplus','Redox currency for both processes — fuels sirtuins, PARP repair, and electron transport chain',2),

-- Russian Longevity Protocol
('russian_longevity','epitalon','Telomerase activation, pineal-circadian restoration, neuroendocrine normalization',0),
('russian_longevity','thymalin','Thymic function restoration, T-cell production normalization, immune senescence reversal',1),

-- Peak Performance Quad
('peak_performance_quad','cjc1295dac','Long-acting GHRH for sustained GH/IGF-1 elevation',0),
('peak_performance_quad','ipamorelin','Clean GHRP pulsatile GH signals for body composition and recovery',1),
('peak_performance_quad','motsc','Mitochondrial biogenesis — ensures cells have capacity to respond to GH signals',2),
('peak_performance_quad','ss31','Mitochondrial membrane repair — preserves energy production infrastructure',3),

-- Russian Nootropic
('russian_nootropic','semax','BDNF upregulation, dopaminergic/serotonergic activation, cognitive stimulation and neuroplasticity',0),
('russian_nootropic','selank','GABAergic anxiolysis, serotonin stabilization — removes Semax overstimulation edge',1),

-- Triple Nootropic
('triple_nootropic','semax','Cognitive stimulation, BDNF, dopamine and serotonin optimization',0),
('triple_nootropic','selank','Anxiolytic balance, GABA modulation, emotional stability under cognitive load',1),
('triple_nootropic','cerebrolysin','Exogenous neurotrophic factors (NGF/BDNF analogs), neuronal survival, dendritic repair',2),

-- Cognitive + Repair
('cognitive_repair','semax','Central BDNF upregulation, cognitive stimulation, dopaminergic optimization',0),
('cognitive_repair','bpc157','Neuroprotection, gut-brain axis modulation, serotonin/NO pathway support',1),

-- Thymic Dual
('thymic_dual','thymalin','Thymic T-cell production restoration — upstream production deficit',0),
('thymic_dual','ta1','Mature immune cell activation — dendritic cells, NK cells, CD8+ T-cell potentiation',1),

-- Sexual Performance
('sexual_performance','pt141','Central MC4R agonism — hypothalamic sexual desire and arousal activation',0),
('sexual_performance','kisspeptin','HPG axis GnRH pulsatility — hormonal foundation of sexual function',1)

ON CONFLICT (stack_id, peptide_id) DO NOTHING;

