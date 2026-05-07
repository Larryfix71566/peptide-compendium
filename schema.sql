-- ============================================================
-- PEPTIDE COMPENDIUM - SUPABASE SCHEMA + SEED DATA
-- Paste this entire file into the Supabase SQL Editor and run
-- ============================================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS stack_items CASCADE;
DROP TABLE IF EXISTS side_effects CASCADE;
DROP TABLE IF EXISTS benefits CASCADE;
DROP TABLE IF EXISTS peptides CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ── Tables ────────────────────────────────────────────────────

CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  color_hex   TEXT NOT NULL,
  icon        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE peptides (
  id          TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  name        TEXT NOT NULL,
  aka         TEXT NOT NULL,
  class       TEXT NOT NULL,
  status      TEXT NOT NULL,
  mechanism   TEXT NOT NULL,
  dosing      TEXT NOT NULL,
  frequency   TEXT NOT NULL,
  cycle       TEXT NOT NULL,
  route       TEXT NOT NULL,
  notes       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE benefits (
  id          SERIAL PRIMARY KEY,
  peptide_id  TEXT NOT NULL REFERENCES peptides(id),
  benefit     TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE side_effects (
  id          SERIAL PRIMARY KEY,
  peptide_id  TEXT NOT NULL REFERENCES peptides(id),
  effect      TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE stack_items (
  id          SERIAL PRIMARY KEY,
  peptide_id  TEXT NOT NULL REFERENCES peptides(id),
  type        TEXT NOT NULL CHECK (type IN ('do','dont')),
  item        TEXT NOT NULL,
  reason      TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ── RLS Policies (allow public read) ─────────────────────────

ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE peptides    ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE side_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories"   ON categories   FOR SELECT USING (true);
CREATE POLICY "Public read peptides"     ON peptides     FOR SELECT USING (true);
CREATE POLICY "Public read benefits"     ON benefits     FOR SELECT USING (true);
CREATE POLICY "Public read side_effects" ON side_effects FOR SELECT USING (true);
CREATE POLICY "Public read stack_items"  ON stack_items  FOR SELECT USING (true);

-- ── Categories ───────────────────────────────────────────────

INSERT INTO categories VALUES
  ('ghrp',     'GH Secretagogues',      '#2dd4bf', 'arrow-up-circle',  0),
  ('ghrh',     'GHRH Analogs',           '#60a5fa', 'activity',         1),
  ('repair',   'Tissue Repair',          '#fb923c', 'plus-circle',      2),
  ('fatloss',  'Fat Loss & Metabolic',   '#f472b6', 'zap',              3),
  ('neuro',    'Cognitive & Neuro',      '#a78bfa', 'cpu',              4),
  ('longevity','Anti-Aging & Longevity', '#34d399', 'sparkles',         5),
  ('sexual',   'Sexual Function',        '#f97316', 'heart',            6),
  ('cardio',   'Cardiovascular',         '#f87171', 'shield',           7),
  ('skin',     'Skin, Hair & Collagen',  '#fbbf24', 'star',             8);

-- ── Peptides ─────────────────────────────────────────────────

INSERT INTO peptides VALUES
('ghrp2','ghrp','GHRP-2','Growth Hormone Releasing Peptide-2','Ghrelin Mimetic','Research Chemical',
'Stimulates GH release from the anterior pituitary via GHS-R1a receptor. Produces a strong, acute GH pulse. Mild cortisol and prolactin elevation at higher doses. Works synergistically with GHRH analogs.',
'100-300 mcg per injection','2-3x daily, fasted state','8-12 weeks on / 4 weeks off','Subcutaneous injection',
'Stack with Mod GRF 1-29 or CJC-1295 for synergistic GH release. Administer in fasted state (2 hrs post-meal). Hunger side effect useful during bulk phases.',0),

('ipamorelin','ghrp','Ipamorelin','NNC 26-0161','Selective GHRP','Research Chemical',
'Highly selective GHS-R1a agonist. Stimulates GH release without meaningful cortisol, prolactin, or ACTH elevation. The cleanest GHRP available. Mimics the endogenous GH pulse pattern.',
'200-300 mcg per injection','1-3x daily; bedtime dose most impactful','12-16 weeks; longer cycles tolerated','Subcutaneous injection',
'The gold standard GHRP. Bedtime dosing maximizes the natural GH pulse during slow-wave sleep. The canonical stack is Ipamorelin + Mod GRF 1-29.',1),

('mk677','ghrp','MK-677','Ibutamoren / Nutrobal','Oral GHS (Non-Peptide)','Research Chemical',
'Orally active non-peptide ghrelin mimetic. Binds GHS-R1a to sustainably elevate GH and IGF-1 over 24 hours. Long half-life creates tonic rather than pulsatile GH elevation. Crosses the blood-brain barrier.',
'10-25 mg orally','Once daily (evening preferred)','16+ week cycles; some use year-round','Oral',
'Oral convenience is a major advantage. Monitor fasting glucose in pre-diabetic individuals. Doses above 25 mg yield diminishing returns with more side effects.',2),

('hexarelin','ghrp','Hexarelin','Examorelin','Potent GHRP','Research Chemical',
'The most potent GHRP. Strong GHS-R1a agonist producing the largest GH pulses of all GHRPs. Also binds the CD36 receptor on cardiac tissue for direct cardioprotection. Rapid receptor desensitization limits long-term use.',
'100-200 mcg per injection','2x daily (limited by desensitization)','4-6 weeks maximum, then extended break','Subcutaneous injection',
'Rapid tachyphylaxis is the main limiting factor. Effectiveness drops noticeably after 4-6 weeks. Cardioprotective mechanism via CD36 is unique among GHRPs.',3),

('sermorelin','ghrh','Sermorelin','GHRH (1-29)','GHRH Analog','FDA-Approved (Rx)',
'Synthetic analog of the first 29 amino acids of endogenous GHRH. Stimulates the pituitary to produce and secrete GH through the natural hypothalamic-pituitary axis, preserving pituitary sensitivity and feedback mechanisms.',
'200-500 mcg','Once daily, subcutaneous at bedtime','3-6+ months; often long-term','Subcutaneous injection',
'FDA-approved for pediatric GH deficiency. Most prescribed GHRH analog in anti-aging and HRT clinics. Weaker GH stimulus than CJC-1295 but very physiological.',0),

('modgrf','ghrh','Mod GRF 1-29','CJC-1295 without DAC','GHRH Analog','Research Chemical',
'Stabilized form of GHRH (1-29) with four amino acid substitutions to resist enzymatic degradation. Half-life of approximately 30 minutes produces a defined, pulsatile GH release. Does NOT bind albumin. Must be co-administered with a GHRP.',
'100-200 mcg per injection','2-3x daily, always co-dosed with a GHRP','12-16 weeks','Subcutaneous injection',
'The definitive GHRH for pulsatile GH protocols. The canonical stack is Mod GRF 1-29 + Ipamorelin injected simultaneously. Must be administered fasted.',1),

('tesamorelin','ghrh','Tesamorelin','Egrifta','Stabilized GHRH Analog','FDA-Approved (Rx)',
'GHRH analog with a trans-3-hexenoic acid modification for enhanced stability. FDA-approved for HIV-associated lipodystrophy. Potent targeted visceral adipose tissue reduction via sustained GH/IGF-1 elevation.',
'1-2 mg subcutaneous','Once daily','6-12 months; FDA-approved for long-term','Subcutaneous injection',
'Most clinically validated GHRH analog for fat loss. Human trials demonstrate visceral fat reduction and cognitive decline prevention in older adults.',2),

('cjc1295dac','ghrh','CJC-1295 (with DAC)','DAC:GRF','Long-Acting GHRH Analog','Research Chemical',
'Modified GHRH analog with a Drug Affinity Complex (DAC) lysine substitution that enables covalent binding to circulating albumin. Extends half-life from minutes to 6-8 days, creating a sustained GH bleed rather than discrete pulses.',
'1-2 mg per injection','Once weekly','8-12 weeks','Subcutaneous injection',
'Creates tonic GH elevation vs. the pulsatile release that is more physiologically normal. Once-weekly dosing is convenient. Not typically co-administered with GHRPs due to the continuous bleed effect.',3),

('bpc157','repair','BPC-157','Body Protection Compound-157','Pentadecapeptide','Research Chemical',
'15-amino acid partial sequence of human gastric juice protein. Upregulates GH receptors, promotes angiogenesis, modulates nitric oxide synthesis, activates the FAK-paxillin pathway for cell migration, and exerts cytoprotective effects on GI mucosa.',
'200-500 mcg per injection; oral effective for GI','1-2x daily; inject near injury site or subcutaneous','4-12 weeks depending on injury severity','Subcutaneous, intramuscular, or oral',
'One of the most researched healing peptides with exceptional safety profile. Oral route effective for GI issues. Stacking with TB-500 is synergistic.',0),

('tb500','repair','TB-500','Thymosin Beta-4','Thymic Peptide Fragment','Research Chemical',
'Synthetic fragment of Thymosin Beta-4. Promotes G-actin sequestration enabling cell migration and tissue remodeling. Stimulates angiogenesis. Highly systemic; circulates to sites of injury throughout the body regardless of injection location.',
'2-2.5 mg per injection','Loading: 2x weekly x 4-6 wks; Maintenance: 1x weekly','Loading 4-6 weeks; maintenance ongoing','Subcutaneous injection',
'Key advantage: fully systemic action. A single injection reaches all injured tissues simultaneously. The BPC-157 + TB-500 stack is the gold standard for healing.',1),

('ghkcu','repair','GHK-Cu','Copper Tripeptide-1','Copper-Binding Tripeptide','Research / Cosmeceutical',
'Naturally occurring tripeptide (Gly-His-Lys) with high copper affinity. Activates over 4,000 genes related to wound healing, tissue remodeling, and anti-aging. Stimulates collagen I, III, and IV synthesis, promotes angiogenesis, activates antioxidant enzymes.',
'Topical: 0.1-1% formulation; Injectable: 1-2 mg','Topical: AM and PM daily; Injectable: 3-5x weekly','Topical: continuous; Injectable: 8-12 weeks','Topical (most common) or subcutaneous',
'Found naturally in human plasma; levels decline with age. Most popular as a topical for skin and scalp. One of the most evidence-backed anti-aging topical ingredients.',2),

('kpv','repair','KPV','Lys-Pro-Val','Alpha-MSH Tripeptide Fragment','Research Chemical',
'C-terminal tripeptide of alpha-melanocyte stimulating hormone. Exerts anti-inflammatory effects via MC1R agonism and NF-kB pathway inhibition. Demonstrated gut-specific anti-inflammatory effects with oral and topical bioavailability.',
'500 mcg - 1 mg','1-2x daily; oral for gut, topical for skin','8-12 weeks','Oral, topical, or subcutaneous',
'Emerging peptide with compelling GI anti-inflammatory data. Oral bioavailability makes it unique. Often paired with BPC-157 for comprehensive gut healing protocols.',3),

('ara290','repair','ARA-290','Cibinetide','Non-Erythropoietic EPO Analog','Clinical Trials',
'11-amino acid peptide derived from erythropoietin that selectively activates the tissue-protective receptor (EPOR/betacR heterodimer) without stimulating erythropoiesis. Promotes small fiber nerve repair and regeneration.',
'4 mg subcutaneous','Daily x 28 days (standard clinical protocol)','28-day courses; repeat as needed','Subcutaneous injection',
'In clinical trials for sarcoidosis-associated small fiber neuropathy and diabetic neuropathy. No erythropoietic effects. Corneal confocal microscopy studies show measurable nerve fiber regeneration.',4),

('aod9604','fatloss','AOD-9604','Advanced Obesity Drug 9604','HGH Fragment','Research Chemical / GRAS',
'Modified fragment of human GH (amino acids 176-191). Stimulates lipolysis and inhibits lipogenesis by mimicking GH fat-metabolizing domain. Does NOT affect IGF-1, blood glucose, or anabolic pathways. Activates beta-3 adrenergic receptors in adipose tissue.',
'300-500 mcg','Once daily, fasted (morning preferred)','12-16 weeks','Subcutaneous injection',
'FDA GRAS status. Significantly safer metabolic profile than HGH for fat loss. Best results in a caloric deficit. Does not interfere with natural GH axis.',0),

('frag176','fatloss','Fragment 176-191','HGH Frag 176-191','HGH C-Terminal Fragment','Research Chemical',
'The C-terminal fragment of HGH responsible for its lipolytic activity. Activates beta-3 adrenergic receptors in adipose tissue, directly stimulating fat breakdown while inhibiting fat deposition.',
'250-500 mcg','2x daily (morning fasted + pre-workout or bedtime)','8-12 weeks','Subcutaneous injection',
'Best results in a caloric deficit. Split dosing maximizes lipolytic windows. Mechanistically nearly identical to AOD-9604. Does not cause GH-related side effects.',1),

('semaglutide','fatloss','Semaglutide','Ozempic / Wegovy / Rybelsus','GLP-1 Receptor Agonist','FDA-Approved (Rx)',
'Long-acting GLP-1 receptor agonist. Stimulates glucose-dependent insulin secretion, suppresses glucagon, slows gastric emptying, and acts on hypothalamic GLP-1 receptors to reduce appetite and food intake.',
'0.25 mg titrate to 2.4 mg (Wegovy); 0.5-2 mg (Ozempic)','Once weekly subcutaneous','Long-term ongoing; FDA-approved for chronic use','Subcutaneous injection or oral (Rybelsus)',
'Most clinically validated peptide for weight loss. Titration protocol critical to minimize GI side effects. Resistance training and high protein intake are strongly recommended to preserve muscle.',2),

('tirzepatide','fatloss','Tirzepatide','Mounjaro / Zepbound','Dual GLP-1 / GIP Agonist','FDA-Approved (Rx)',
'First-in-class twincretin that co-agonizes both GLP-1 and GIP receptors. GIP co-agonism improves adipose tissue function and provides additive weight loss beyond GLP-1 alone.',
'2.5 mg titrate to 15 mg','Once weekly subcutaneous','Long-term ongoing; FDA-approved','Subcutaneous injection',
'Currently the most effective FDA-approved anti-obesity medication. Outperforms semaglutide in head-to-head SURMOUNT trials. Prescription-only.',3),

('semax','neuro','Semax','ACTH(4-10)-Pro8-Gly-Pro','ACTH Analog Nootropic','Approved (Russia) / Research (US)',
'Heptapeptide analog of ACTH 4-7 with C-terminal extension for stability. Increases BDNF and NGF expression in hippocampus and cortex, activates dopamine and serotonin systems, and promotes neuroplasticity. Intranasal route provides efficient CNS delivery.',
'200-900 mcg','1-2x daily, intranasal','2-4 weeks on, 1-2 weeks off','Intranasal (preferred) or subcutaneous',
'Approved in Russia for stroke treatment. Among the best-studied nootropic peptides. Often stacked with Selank for complementary anxiolytic and cognitive effects.',0),

('selank','neuro','Selank','TP-7 / Tuftsin Analog','Anxiolytic Neuropeptide','Approved (Russia) / Research (US)',
'Synthetic heptapeptide analog of tuftsin. Modulates GABAergic and serotonergic systems, increases BDNF expression, and inhibits enkephalin-degrading enzymes prolonging endorphin activity. Produces anxiolytic effects without sedation, tolerance, or dependence.',
'250-500 mcg','1-2x daily, intranasal','10-14 days on; break as needed','Intranasal',
'Non-addictive anxiolytic compared favorably to benzodiazepines without the dependence, sedation, or cognitive blunting. Approved in Russia for anxiety disorders.',1),

('dihexa','neuro','Dihexa','PNB-0408','HGF/MET Potentiator','Research Chemical',
'Potent hepatocyte growth factor (HGF) potentiator derived from angiotensin IV. Binds and activates the HGF/MET receptor with extremely high affinity. Reported to be seven orders of magnitude more potent than BDNF in promoting synaptogenesis. Crosses the blood-brain barrier.',
'10-30 mg oral or transdermal','2-3x per week (high potency - less is more)','4-6 weeks; conservative cycling recommended','Oral or transdermal',
'Extremely potent nootropic. Effects described as long-lasting weeks after dosing cycle. Research chemical with very limited human data; use conservatively and err toward lower doses.',2),

('nadplus','neuro','NAD+','Nicotinamide Adenine Dinucleotide','Essential Coenzyme','Supplement / IV Therapy',
'Central coenzyme in cellular metabolism. Serves as electron carrier in oxidative phosphorylation and substrate for sirtuins (SIRT1-7) and PARPs for DNA repair. NAD+ levels decline 50% between ages 40-60. Supplementation activates sirtuin-mediated longevity pathways.',
'250-1000 mg IV; 500+ mg oral (NMN/NR precursors)','IV: 1-3x weekly or loading course; Oral: daily','IV loading: 5-10 day courses; oral ongoing','IV (fastest), oral precursors (NMN, NR), subcutaneous',
'IV administration rapidly replenishes levels but is uncomfortable. Oral NMN/NR precursors are far more convenient. Synergistic with resveratrol, TMG, and exercise.',3),

('cerebrolysin','neuro','Cerebrolysin','FPE 1070','Neuropeptide Mixture','Approved (EU/Asia) / Research (US)',
'Standardized mixture of low-molecular-weight neuropeptides and free amino acids derived from purified porcine brain proteins. Mimics NGF and BDNF. Promotes neuronal survival, dendritic sprouting, neuroplasticity, and neuroprotection against excitotoxicity.',
'5-30 mL IV or IM','Daily for 10-20 day treatment courses','10-20 day courses; 2-4x per year','IV infusion or intramuscular injection',
'Widely prescribed in Eastern Europe, Asia, and Latin America for stroke, TBI, and dementia. Decades of clinical evidence. Requires IV/IM administration.',4),

('epitalon','longevity','Epitalon','Epithalamin / Tetrapeptide-28','Pineal Peptide Bioregulator','Research Chemical',
'Synthetic tetrapeptide derived from bovine pineal gland extract. Activates telomerase (hTERT), leading to telomere elongation in somatic cells. Normalizes the hypothalamic-pituitary axis, restores circadian melatonin production, and regulates neuroendocrine function.',
'5-10 mg per injection','Daily for 10-20 day courses','10-20 day courses, 1-2x per year','Subcutaneous injection or IV',
'40+ years of Russian research including a 15-year human study showing significant mortality reduction. Foundational to serious longevity protocols. Often paired with Thymalin.',0),

('thymalin','longevity','Thymalin','Thymic Peptide Bioregulator','Thymic Peptide','Research Chemical',
'Peptide bioregulator extracted from calf thymus tissue. Restores thymic function, normalizes T-lymphocyte production, and corrects age-related immunosenescence. The thymus shrinks and loses function with age; Thymalin directly addresses this.',
'10 mg per injection','Daily for 10-day courses','10-day courses, 1-2x per year (spring/fall)','Subcutaneous injection',
'6-year Russian study showed 2.5x reduction in mortality when Thymalin + Epitalon were combined annually. Thymic rejuvenation is a core anti-aging strategy.',1),

('motsc','longevity','MOTS-c','Mitochondrial ORF of 12S rRNA Type-C','Mitochondria-Derived Peptide','Research Chemical',
'Unique 16-amino acid peptide encoded within mitochondrial DNA. Activates AMPK and the folate cycle, regulating mitochondrial metabolism, fatty acid oxidation, and insulin sensitivity. Produces exercise-mimetic metabolic effects.',
'5-10 mg','3-5x per week subcutaneous','8-12 weeks','Subcutaneous injection',
'Emerging longevity and metabolic peptide. Animal data shows dramatic metabolic improvements. Synergistic with exercise. Human trial data expanding rapidly.',2),

('humanin','longevity','Humanin','HNG (S14G-Humanin)','Mitochondria-Derived Peptide','Research Chemical',
'21-amino acid peptide encoded within mitochondrial DNA. Activates cell survival pathways (JAK2/STAT3, IGFBP3/FPRL1). Protects neurons against Alzheimer''s-related toxicity, improves insulin sensitivity, and protects cardiac and endothelial cells.',
'2-4 mg subcutaneous (HNG analog; S14G variant)','3x per week','8-12 weeks','Subcutaneous injection',
'The S14G modification (HNG) makes the synthetic analog 1000x more potent than native Humanin. Low humanin levels are a biomarker for metabolic disease and aging. Synergistic with MOTS-c.',3),

('ss31','longevity','SS-31','Elamipretide / Bendavia','Mitochondria-Targeted Peptide','Clinical Trials',
'Tetrapeptide that selectively partitions to the inner mitochondrial membrane via electrostatic interaction with cardiolipin. Stabilizes cardiolipin structure, preserving the electron transport chain, reducing reactive oxygen species production, and restoring mitochondrial membrane potential.',
'0.05-0.25 mg/kg subcutaneous','Daily subcutaneous injection','4-12 weeks (clinical); ongoing in some research','Subcutaneous injection',
'In Phase 2/3 clinical trials for heart failure and mitochondrial myopathy. One of the most mechanistically compelling longevity peptides. Mitochondrial dysfunction is upstream of virtually all age-related disease.',4),

('pt141','sexual','PT-141','Bremelanotide / Vyleesi','Melanocortin Receptor Agonist','FDA-Approved (Rx) / Research',
'Cyclic peptide analog of alpha-MSH. Agonizes MC3R and MC4R receptors in the hypothalamus and limbic system, directly activating neural pathways for sexual motivation and arousal. Acts centrally on desire rather than peripherally on blood flow.',
'0.5-2 mg subcutaneous','As needed, 45-60 min before activity; max 1x per 3 days','As-needed basis','Subcutaneous injection or nasal spray',
'FDA-approved as Vyleesi for premenopausal women with HSDD. Can be combined with PDE5 inhibitors for additive effect. Pre-medicate with anti-nausea medication 30 min prior.',0),

('melanotan2','sexual','Melanotan II','MT-II','Non-Selective Melanocortin Agonist','Research Chemical (Not FDA-Approved)',
'Non-selective synthetic analog of alpha-MSH that agonizes MC1R through MC5R. MC1R activation drives melanogenesis; MC4R activation produces aphrodisiac and appetite-suppressing effects; MC3R contributes to energy homeostasis.',
'0.25-1 mg subcutaneous (start very low)','Daily during loading; as needed for maintenance','Loading: 1-2 weeks; maintenance doses as needed','Subcutaneous injection',
'NOT FDA-approved. Riskier profile than PT-141 due to non-selective melanocortin agonism. Dermatological monitoring required. Can darken and change existing moles. Start at 0.25 mg.',1),

('kisspeptin','sexual','Kisspeptin-10','Metastin (45-54)','GnRH Stimulating Neuropeptide','Clinical Trials / Research',
'Decapeptide fragment of kisspeptin that acts on KISS1R (GPR54) in hypothalamic GnRH neurons. Its pulsatile release triggers GnRH to LH/FSH to testosterone/estrogen cascade.',
'100-1000 mcg subcutaneous or IV','Pulsatile (every 90 min via pump) or 1-2x daily subcutaneous','Not yet standardized; research protocol dependent','Subcutaneous or IV',
'Emerging therapy for hypogonadism and infertility. Pulsatile administration mimics natural kisspeptin signaling and is more effective than continuous infusion.',2),

('ta1','cardio','Thymosin Alpha-1','Ta1 / Zadaxin','Thymic Immunomodulator','Approved (International) / Research (US)',
'Naturally occurring 28-amino acid thymic peptide. Potent immune modulator. Activates dendritic cells, increases TLR expression, enhances T-helper cell differentiation, and boosts NK cell and CD8+ T-cell cytotoxic activity.',
'1.6 mg subcutaneous','2x weekly','6 months (clinical); 4-8 weeks for general immune support','Subcutaneous injection',
'FDA-approved in 35+ countries for hepatitis and certain cancers. Widely used in integrative oncology. Particularly relevant for post-COVID immune dysregulation and long-COVID.',0),

('ll37','cardio','LL-37','Cathelicidin / hCAP18','Human Cathelicidin','Research Chemical / Cosmeceutical',
'The only human cathelicidin. Disrupts microbial membranes via electrostatic interaction (broad-spectrum mechanism that does not readily develop resistance). Also acts as a chemokine: recruiting immune cells, promoting angiogenesis, stimulating wound closure, and modulating TLR signaling.',
'1-5 mg topical or 0.5-2 mg injectable','Topical: daily; Injectable: 3-5x weekly','2-4 weeks acute; topical ongoing','Topical (preferred) or subcutaneous',
'Produced naturally by neutrophils, NK cells, and epithelial cells. Deficiency linked to increased susceptibility to Staph aureus and TB. Increased by vitamin D3.',1),

('collagen','skin','Collagen Peptides','Hydrolyzed Collagen / Types I, II, III','Structural Protein Hydrolysate','OTC Supplement',
'Enzymatically hydrolyzed collagen yielding bioactive di- and tripeptides (Pro-Hyp, Hyp-Gly) absorbed intact and accumulating in skin and cartilage tissue. Stimulate fibroblast collagen synthesis and provide building blocks for endogenous collagen production.',
'10-20 g oral daily','Daily, with vitamin C (required cofactor)','Benefits accumulate at 8-12 weeks; ongoing use recommended','Oral (powder, capsule, liquid)',
'Most accessible and widely used peptide supplement. Type I + III for skin, hair, and structural support; Type II for joint cartilage. Always pair with vitamin C.',0),

('matrixyl','skin','Palmitoyl Pentapeptide-4','Matrixyl','Signal Peptide (Cosmeceutical)','Cosmeceutical (OTC)',
'Palmitoylated pentapeptide that acts as a matrikine, signaling tissue damage and triggering repair. Binds TGF-beta receptors on fibroblasts, stimulating synthesis of collagen I, III, fibronectin, and hyaluronic acid.',
'3-8 ppm in topical formulation','AM and/or PM daily application','Continuous; measurable wrinkle reduction at 4-8 weeks','Topical',
'One of the most evidence-backed cosmeceutical ingredients with multiple placebo-controlled clinical trials. Matrixyl 3000 blends Palmitoyl Pentapeptide-4 + Palmitoyl Tripeptide-1.',1),

('snap8','skin','Snap-8','Acetyl Octapeptide-3','Neurotransmitter-Inhibiting Peptide','Cosmeceutical (OTC)',
'Octapeptide analog of the N-terminal end of SNAP-25. Competes with SNAP-25 for the SNARE complex, reducing acetylcholine release from motor neurons, producing localized topical relaxation of expression muscles. A topical Botox-like mechanism.',
'3-10 ppm in topical formulation','1-2x daily topical application','Continuous; builds effect over weeks of use','Topical',
'A gentler topical alternative to botulinum toxin that works on the same pathway. Primarily targets dynamic expression wrinkles. Combine with moisturizing peptides and hyaluronic acid.',2);

-- ── Benefits ─────────────────────────────────────────────────

INSERT INTO benefits (peptide_id, benefit, sort_order) VALUES
('ghrp2','Strong GH pulse stimulation',0),('ghrp2','Lean muscle support',1),('ghrp2','Enhanced recovery',2),('ghrp2','Elevated appetite',3),('ghrp2','Improved sleep quality',4),
('ipamorelin','Clean selective GH release',0),('ipamorelin','Minimal hormonal side effects',1),('ipamorelin','Fat loss and recomposition',2),('ipamorelin','Improved deep sleep (SWS)',3),('ipamorelin','Connective tissue repair',4),('ipamorelin','Anti-aging effects',5),
('mk677','Sustained GH and IGF-1 elevation',0),('mk677','Significant muscle mass gains',1),('mk677','Bone mineral density',2),('mk677','Improved sleep architecture',3),('mk677','Skin, hair and nail improvement',4),('mk677','Oral - no injections',5),
('hexarelin','Most powerful GH release',0),('hexarelin','Direct cardioprotection (CD36)',1),('hexarelin','Tendon and joint healing',2),('hexarelin','Muscle growth',3),('hexarelin','Neurological protective effects',4),
('sermorelin','Physiological GH stimulation',0),('sermorelin','Preserves pituitary function',1),('sermorelin','Anti-aging body composition',2),('sermorelin','Improved sleep quality',3),('sermorelin','Bone density support',4),
('modgrf','Pulsatile GH release pattern',0),('modgrf','Synergistic with GHRPs',1),('modgrf','Muscle growth and fat loss',2),('modgrf','Improved recovery',3),('modgrf','Physiological GH mimicry',4),
('tesamorelin','Visceral fat reduction (primary)',0),('tesamorelin','Improved lipid profile',1),('tesamorelin','Cognitive function improvement',2),('tesamorelin','GH and IGF-1 elevation',3),('tesamorelin','Clinically validated efficacy',4),
('cjc1295dac','Week-long GH/IGF-1 elevation',0),('cjc1295dac','Muscle growth and fat loss',1),('cjc1295dac','Single weekly injection',2),('cjc1295dac','Significant IGF-1 increase',3),('cjc1295dac','Recovery and repair',4),
('bpc157','Tendon and ligament healing',0),('bpc157','Gut lining repair (IBD, leaky gut)',1),('bpc157','Joint and cartilage healing',2),('bpc157','Neuroprotection',3),('bpc157','Systemic anti-inflammatory',4),('bpc157','Accelerated wound healing',5),
('tb500','Systemic tissue repair',0),('tb500','Muscle and tendon healing',1),('tb500','Reduced inflammation',2),('tb500','Cardiac muscle protection',3),('tb500','Hair follicle stimulation',4),('tb500','Improved flexibility',5),
('ghkcu','Collagen and elastin synthesis',0),('ghkcu','Wound healing acceleration',1),('ghkcu','Skin rejuvenation and anti-aging',2),('ghkcu','Hair follicle stimulation',3),('ghkcu','Antioxidant protection',4),
('kpv','GI tract inflammation (IBD, Crohns)',0),('kpv','Colitis and leaky gut',1),('kpv','Wound healing',2),('kpv','Skin inflammation and eczema',3),('kpv','Antimicrobial properties',4),
('ara290','Peripheral neuropathy pain relief',0),('ara290','Nerve fiber regeneration',1),('ara290','Corneal nerve repair',2),('ara290','Anti-inflammatory',3),('ara290','Metabolic improvement in T2DM',4),
('aod9604','Targeted fat loss (especially visceral)',0),('aod9604','No IGF-1 or blood glucose effects',1),('aod9604','No anabolic side effects',2),('aod9604','Secondary cartilage repair benefits',3),('aod9604','Safe metabolic profile',4),
('frag176','Direct lipolysis stimulation',0),('frag176','Inhibits lipogenesis (fat storage)',1),('frag176','No anabolic or IGF-1 effects',2),('frag176','Does not affect glucose metabolism',3),('frag176','Highly targeted fat-burning',4),
('semaglutide','15-20%+ total body weight loss',0),('semaglutide','Type 2 diabetes management',1),('semaglutide','Cardiovascular risk reduction',2),('semaglutide','Appetite suppression',3),('semaglutide','Improved lipid profiles',4),
('tirzepatide','20-25%+ total body weight loss',0),('tirzepatide','Type 2 diabetes management',1),('tirzepatide','Cardiovascular protection',2),('tirzepatide','Improved lipids and fatty liver',3),('tirzepatide','Better GI tolerability vs semaglutide',4),
('semax','Memory consolidation and recall',0),('semax','Focus and concentration',1),('semax','Neuroprotection post-stroke/TBI',2),('semax','Anxiety reduction',3),('semax','ADHD symptom improvement',4),
('selank','Anxiety reduction without sedation',0),('selank','Memory and learning enhancement',1),('selank','Anti-depressant effects',2),('selank','Immune modulation',3),('selank','No withdrawal risk',4),
('dihexa','Powerful synaptogenesis',0),('dihexa','Memory formation enhancement',1),('dihexa','Cognitive enhancement',2),('dihexa','Potential neurodegeneration therapy',3),('dihexa','Executive function support',4),
('nadplus','Cellular energy and mental clarity',0),('nadplus','DNA damage repair',1),('nadplus','Neuroprotection and cognitive function',2),('nadplus','Mitochondrial biogenesis',3),('nadplus','Anti-aging longevity signaling',4),
('cerebrolysin','Neuroplasticity enhancement',0),('cerebrolysin','Cognitive performance',1),('cerebrolysin','Neuroprotection',2),('cerebrolysin','Stroke and TBI recovery',3),('cerebrolysin','Alzheimer''s and dementia support',4),
('epitalon','Telomere elongation and protection',0),('epitalon','Circadian rhythm normalization',1),('epitalon','Melatonin regulation',2),('epitalon','Anti-aging endocrine effects',3),('epitalon','Longevity (human mortality data)',4),
('thymalin','Thymic function restoration',0),('thymalin','T-cell production normalization',1),('thymalin','Immune senescence reversal',2),('thymalin','Reduced susceptibility to infection',3),('thymalin','Longevity (6-year mortality data)',4),
('motsc','Improved insulin sensitivity',0),('motsc','Enhanced fatty acid oxidation',1),('motsc','Exercise performance enhancement',2),('motsc','Longevity signaling',3),('motsc','Mitochondrial optimization',4),
('humanin','Neuroprotection (anti-Alzheimers)',0),('humanin','Improved insulin sensitivity',1),('humanin','Cardiovascular protection',2),('humanin','Longevity signaling pathway activation',3),('humanin','Metabolic health improvement',4),
('ss31','Mitochondrial membrane protection',0),('ss31','Reduced oxidative stress (ROS)',1),('ss31','Cardiac function improvement',2),('ss31','Skeletal muscle function in aging',3),('ss31','Energy metabolism restoration',4),
('pt141','Increased libido in both sexes',0),('pt141','Erectile dysfunction support',1),('pt141','Female sexual arousal disorder (FSAD)',2),('pt141','Works independent of testosterone',3),
('melanotan2','Skin tanning without UV exposure',0),('melanotan2','Libido and sexual arousal enhancement',1),('melanotan2','Spontaneous erections in men',2),('melanotan2','Appetite suppression',3),
('kisspeptin','LH and FSH stimulation',0),('kisspeptin','Endogenous testosterone increase',1),('kisspeptin','Fertility support (male and female)',2),('kisspeptin','Libido improvement',3),('kisspeptin','HPG axis support',4),
('ta1','Immune system enhancement',0),('ta1','Antiviral activity (hepatitis B/C, COVID)',1),('ta1','Anti-tumor immune response',2),('ta1','Sepsis management',3),('ta1','Post-COVID immune dysregulation',4),
('ll37','Broad-spectrum antimicrobial',0),('ll37','Anti-biofilm activity',1),('ll37','Wound healing and angiogenesis',2),('ll37','Immune modulation',3),('ll37','Skin barrier support',4),
('collagen','Skin elasticity and hydration',0),('collagen','Wrinkle depth reduction',1),('collagen','Joint cartilage support',2),('collagen','Hair and nail strength',3),('collagen','Gut lining integrity',4),
('matrixyl','Wrinkle depth reduction (clinical data)',0),('matrixyl','Collagen I and III synthesis stimulation',1),('matrixyl','Skin firmness and elasticity',2),('matrixyl','Photoaging reversal',3),
('snap8','Expression line softening',0),('snap8','Forehead and crows feet improvement',1),('snap8','Botox-alternative mechanism',2),('snap8','Preventive anti-aging for expression wrinkles',3);

-- ── Side Effects ─────────────────────────────────────────────

INSERT INTO side_effects (peptide_id, effect, sort_order) VALUES
('ghrp2','Increased hunger',0),('ghrp2','Mild cortisol elevation',1),('ghrp2','Prolactin increase at high doses',2),('ghrp2','Water retention',3),
('ipamorelin','Mild water retention',0),('ipamorelin','Occasional tingling',1),('ipamorelin','Slight hunger',2),
('mk677','Water retention (common)',0),('mk677','Increased appetite',1),('mk677','Potential blood glucose elevation',2),('mk677','Fatigue initially',3),
('hexarelin','Significant cortisol elevation',0),('hexarelin','Prolactin increase',1),('hexarelin','Rapid desensitization',2),('hexarelin','Water retention',3),
('sermorelin','Injection site reactions',0),('sermorelin','Flushing',1),('sermorelin','Headache',2),('sermorelin','Dizziness (rare)',3),
('modgrf','Transient flushing',0),('modgrf','Mild water retention',1),('modgrf','Headache (rare)',2),
('tesamorelin','Fluid retention',0),('tesamorelin','Arthralgia',1),('tesamorelin','Peripheral edema',2),('tesamorelin','Potential glucose elevation',3),
('cjc1295dac','Water retention',0),('cjc1295dac','Fatigue',1),('cjc1295dac','Potential desensitization with prolonged use',2),
('bpc157','Minimal reported side effects',0),('bpc157','Mild nausea (rare)',1),('bpc157','Dizziness (rare)',2),
('tb500','Head rush / lightheadedness (transient)',0),('tb500','Fatigue initially',1),('tb500','Rare: nausea',2),
('ghkcu','Generally very well tolerated',0),('ghkcu','Potential copper sensitivity (rare)',1),('ghkcu','Mild skin irritation (rare)',2),
('kpv','Minimal known side effects',0),('kpv','Occasional mild nausea (oral)',1),
('ara290','Injection site reaction',0),('ara290','Generally well tolerated in trials',1),
('aod9604','Minimal - one of the safest profiles',0),('aod9604','Injection site reactions',1),('aod9604','Rare headache',2),
('frag176','Minimal known side effects',0),('frag176','Transient hunger possible',1),('frag176','Injection site reactions',2),
('semaglutide','Nausea and vomiting (common, especially early)',0),('semaglutide','Diarrhea/constipation',1),('semaglutide','Muscle mass loss risk',2),('semaglutide','Pancreatitis (rare)',3),
('tirzepatide','Nausea (less than semaglutide in trials)',0),('tirzepatide','GI effects during titration',1),('tirzepatide','Muscle mass considerations',2),('tirzepatide','Pancreatitis (rare)',3),
('semax','Stimulating (may affect sleep if late dose)',0),('semax','Headache (rare)',1),('semax','Anxiety at high doses (rare)',2),
('selank','Very well tolerated',0),('selank','Mild sedation at high doses',1),('selank','Rare: headache',2),
('dihexa','Limited human safety data',0),('dihexa','Theoretical: excessive synaptogenesis risk',1),('dihexa','Stimulating effects',2),
('nadplus','IV: flushing, chest tightness (rate-dependent)',0),('nadplus','Oral: generally well tolerated',1),('nadplus','GI upset at high oral doses',2),
('cerebrolysin','Generally well tolerated',0),('cerebrolysin','Rare: dizziness during infusion',1),('cerebrolysin','Allergic reactions possible',2),
('epitalon','Exceptionally well tolerated',0),('epitalon','No significant adverse effects in trials',1),
('thymalin','Very well tolerated',0),('thymalin','Minimal adverse effects in long-term studies',1),
('motsc','Limited human data',0),('motsc','Generally well tolerated in studies',1),('motsc','Potential hypoglycemia with exercise',2),
('humanin','Limited human data',0),('humanin','Generally well tolerated in animal models',1),
('ss31','Injection site reactions',0),('ss31','Generally well tolerated in human trials',1),
('pt141','Nausea (most common; dose-dependent)',0),('pt141','Facial flushing',1),('pt141','Transient blood pressure increase',2),('pt141','Skin darkening with repeated use',3),
('melanotan2','Significant nausea (often severe initially)',0),('melanotan2','Facial flushing',1),('melanotan2','Darkening/changing of moles',2),('melanotan2','Blood pressure changes',3),
('kisspeptin','Generally well tolerated in trials',0),('kisspeptin','Transient LH/FSH surges',1),('kisspeptin','Potential desensitization with continuous dosing',2),
('ta1','Generally very well tolerated',0),('ta1','Rare: injection site reaction',1),('ta1','Rare: flu-like symptoms initially',2),
('ll37','Pro-inflammatory at high concentrations',0),('ll37','Injection site irritation',1),('ll37','Caution in autoimmune conditions',2),
('collagen','Generally very safe',0),('collagen','Rare: GI discomfort',1),('collagen','Potential allergic reaction (bovine/marine)',2),
('matrixyl','Excellent safety profile',0),('matrixyl','Rare: contact sensitivity',1),('matrixyl','Non-irritating',2),
('snap8','Very well tolerated',0),('snap8','No systemic effects',1),('snap8','No paralysis (topical only)',2);

-- ── Stack Items ───────────────────────────────────────────────

INSERT INTO stack_items (peptide_id, type, item, reason, sort_order) VALUES
-- GHRP-2
('ghrp2','do','Mod GRF 1-29 / CJC-1295 (no DAC)','Classic GHRH+GHRP synergy. Amplifies GH pulse 3-10x vs either alone. Inject simultaneously.',0),
('ghrp2','do','BPC-157','GHRP-2 drives systemic GH; BPC-157 accelerates local tissue repair. No receptor competition.',1),
('ghrp2','do','TB-500','Systemic healing synergy. TB-500 drives cell migration while GHRP-2 elevates GH for recovery.',2),
('ghrp2','do','Testosterone / TRT','GH and testosterone have complementary anabolic pathways. Safe to combine.',3),
('ghrp2','dont','Another GHRP (same injection)','GHS-R1a receptor saturation. Two GHRPs compete for the same receptor. Only one GHRP per injection.',0),
('ghrp2','dont','Insulin (same timing)','Both affect blood glucose. Concurrent use risks hypoglycemia. Space by 1-2 hours.',1),
('ghrp2','dont','High-fat/carb meal within 2 hrs','Elevated glucose and fatty acids blunt GH release. Always inject fasted.',2),
('ghrp2','dont','Somatostatin analogs (Octreotide)','Directly inhibits GH release from pituitary. Completely negates GHRP-2 mechanism.',3),
-- Ipamorelin
('ipamorelin','do','Mod GRF 1-29 (co-inject simultaneously)','THE definitive stack. Produces GH pulses 3-10x greater than either alone. Most widely used peptide combination in clinical practice.',0),
('ipamorelin','do','BPC-157 + TB-500','Triple healing stack. Ipamorelin supports systemic GH for recovery; repair peptides handle tissue-level healing.',1),
('ipamorelin','do','Epitalon','Excellent longevity stack. Ipamorelin addresses GH axis; Epitalon addresses telomere and circadian function.',2),
('ipamorelin','do','Sermorelin or Tesamorelin','Any GHRH analog pairs with Ipamorelin for the core GHRH+GHRP synergistic protocol.',3),
('ipamorelin','dont','GHRP-2 or GHRP-6 in same injection','GHS-R1a receptor saturation. Only one GHRP per injection window. Adding another provides no benefit.',0),
('ipamorelin','dont','Somatostatin analogs','Directly blocks GH release. Completely counteracts Ipamorelin mechanism.',1),
('ipamorelin','dont','Food within 90 minutes of injection','Insulin and nutrients suppress GH release. Administer only in a fasted state.',2),
-- MK-677
('mk677','do','Ipamorelin + Mod GRF 1-29','MK-677 provides sustained GH/IGF-1 baseline; injectable peptides provide acute pulsatile spikes. Maximizes total GH axis activity.',0),
('mk677','do','Epitalon + Thymalin (longevity stack)','MK-677 handles GH/IGF-1 axis; Epitalon handles telomeres and circadian; Thymalin handles immune rejuvenation.',1),
('mk677','do','Collagen peptides + Vitamin C','MK-677 elevates GH which drives collagen synthesis. Pairing with collagen and cofactor Vitamin C maximizes connective tissue benefits.',2),
('mk677','dont','Other GHRPs at same time of day','GHS-R1a receptor saturation. MK-677 already occupies ghrelin receptors for 24 hours.',0),
('mk677','dont','High-carbohydrate diet without glucose monitoring','MK-677 worsens insulin resistance. High-carb eating compounds blood glucose elevation.',1),
('mk677','dont','Active cancer or strong family history','MK-677 significantly elevates IGF-1. Elevated IGF-1 is associated with accelerated tumor growth.',2),
-- Hexarelin
('hexarelin','do','Mod GRF 1-29','GHRH co-administration maximizes the GH pulse even at lower Hexarelin doses, potentially reducing desensitization pressure.',0),
('hexarelin','do','BPC-157','Short-burst healing stack. Hexarelin potent GH pulse combined with BPC-157 tissue repair for acute injury recovery.',1),
('hexarelin','do','Cabergoline (low dose)','Hexarelin significantly raises prolactin. Cabergoline 0.25-0.5 mg twice weekly helps manage this side effect.',2),
('hexarelin','dont','Other GHRPs simultaneously','Receptor competition and compounded prolactin/cortisol elevation. Never stack two GHRPs.',0),
('hexarelin','dont','Prolactin-raising drugs (antipsychotics)','Hexarelin already raises prolactin significantly. Adding prolactin-elevating medications can cause gynecomastia.',1),
('hexarelin','dont','Long-term use beyond 6 weeks','Rapid GHS-R1a desensitization renders Hexarelin ineffective. Maximum 6 weeks then a break.',2),
-- Sermorelin
('sermorelin','do','Ipamorelin','The most popular clinical combination. Sermorelin provides the GHRH signal; Ipamorelin provides the GHRP signal. Together they mimic natural GH physiology.',0),
('sermorelin','do','Testosterone / HRT','Sermorelin is commonly used alongside TRT. Sex hormones and GH axis are synergistic for body composition and anti-aging.',1),
('sermorelin','do','Epitalon','Sermorelin restores GH axis function; Epitalon restores pineal and circadian and telomere integrity.',2),
('sermorelin','dont','CJC-1295 with DAC simultaneously','Two GHRH analogs compete for the same receptor. Choose one GHRH and one GHRP, not two GHRHs.',0),
('sermorelin','dont','Somatostatin analogs (Octreotide)','Somatostatin is the physiological antagonist of GHRH. These drugs directly block the GH release Sermorelin is trying to stimulate.',1),
('sermorelin','dont','Exogenous recombinant HGH','Supraphysiologic exogenous GH suppresses endogenous GHRH receptor sensitivity.',2),
-- Mod GRF 1-29
('modgrf','do','Ipamorelin (co-inject simultaneously)','The gold standard stack. Produces GH pulses 3-10x greater than either alone.',0),
('modgrf','do','GHRP-2 (co-inject)','Stronger GH pulse than Ipamorelin at the cost of more side effects.',1),
('modgrf','do','BPC-157 + TB-500','The GH pulse from Mod GRF creates an anabolic/repair environment. Complementary to healing peptides.',2),
('modgrf','dont','CJC-1295 with DAC simultaneously','Two GHRH sources means receptor competition with no added benefit. Choose Mod GRF 1-29 (pulsatile) OR CJC-1295 DAC (sustained), never both.',0),
('modgrf','dont','Using without a GHRP','Mod GRF 1-29 has very limited GH-stimulating power without a GHRP co-signal. Always pair with a GHRP.',1),
('modgrf','dont','Injecting with food in stomach','Glucose and fatty acids suppress the pituitary GH response. Always inject fasted, at minimum 90 minutes post-meal.',2),
-- Tesamorelin
('tesamorelin','do','Ipamorelin','Tesamorelin (GHRH) + Ipamorelin (GHRP) is a clinically elegant combination. Tesamorelin drives fat loss; Ipamorelin adds clean GH pulses.',0),
('tesamorelin','do','AOD-9604','Both drive fat loss via different mechanisms. Additive lipolytic effect.',1),
('tesamorelin','do','Metformin or Berberine','Tesamorelin can elevate blood glucose. Insulin sensitizers help offset this.',2),
('tesamorelin','dont','Sermorelin or Mod GRF 1-29 simultaneously','Never combine two GHRH compounds. They compete for the same receptor.',0),
('tesamorelin','dont','Somatostatin analogs','Directly block GH release and negate Tesamorelin entire mechanism.',1),
('tesamorelin','dont','Unmanaged diabetes','Tesamorelin raises blood glucose. Diabetics must monitor closely.',2),
-- CJC-1295 with DAC
('cjc1295dac','do','Ipamorelin (mid-week)','CJC-1295 DAC provides the baseline GH elevation; Ipamorelin adds pulsatile GH spikes. Adding Ipamorelin mid-week works well.',0),
('cjc1295dac','do','BPC-157 + TB-500','GH elevation from CJC-1295 DAC creates an anabolic environment that synergizes with tissue repair peptides.',1),
('cjc1295dac','dont','Sermorelin or Mod GRF 1-29 simultaneously','Two GHRH analogs compete for GHRH receptors. Redundant and wasteful. Choose one GHRH source only.',0),
('cjc1295dac','dont','Daily aggressive GHRP use','CJC-1295 DAC already provides a GH bleed. Aggressive daily GHRP dosing on top can over-stimulate IGF-1.',1),
-- BPC-157
('bpc157','do','TB-500 (Thymosin Beta-4)','The premier healing stack. BPC-157 promotes local angiogenesis; TB-500 drives systemic cell migration. Complementary and non-competing mechanisms.',0),
('bpc157','do','Ipamorelin + Mod GRF 1-29','GH peptides create an anabolic/repair environment while BPC-157 handles tissue-specific healing.',1),
('bpc157','do','Collagen peptides + Vitamin C','BPC-157 creates the repair environment; collagen peptides and Vitamin C provide the structural building blocks.',2),
('bpc157','do','KPV (oral, gut protocols)','Both have gut-protective and anti-inflammatory properties. Comprehensive gut healing stack.',3),
('bpc157','dont','NSAIDs (Ibuprofen, Naproxen)','NSAIDs blunt the inflammatory cascade that BPC-157 uses for healing.',0),
('bpc157','dont','High-dose corticosteroids','Steroids suppress the immune and healing response. Contradicts BPC-157 healing mechanism.',1),
('bpc157','dont','Alcohol during healing protocol','Alcohol impairs protein synthesis, angiogenesis, and sleep quality. All of which BPC-157 relies on.',2),
-- TB-500
('tb500','do','BPC-157','The premier healing stack. TB-500 drives systemic actin and cell migration; BPC-157 drives angiogenesis and cytoprotection.',0),
('tb500','do','Ipamorelin + Mod GRF 1-29','GH axis peptides provide the anabolic environment. TB-500 then accelerates cell migration into that environment.',1),
('tb500','do','GHK-Cu','TB-500 handles cell migration systemically; GHK-Cu drives collagen synthesis.',2),
('tb500','dont','Immunosuppressive drugs','TB-500 modulates the immune response for healing. Immunosuppressants may blunt this mechanism.',0),
('tb500','dont','Active malignancy','TB-500 promotes angiogenesis and cell migration, the same pathways used by tumors. Contraindicated with active cancer.',1),
('tb500','dont','Chronic NSAIDs','Chronic NSAID use blunts the inflammatory signaling that TB-500 healing mechanisms rely on.',2),
-- GHK-Cu
('ghkcu','do','BPC-157 + TB-500','GHK-Cu drives collagen synthesis; BPC-157 drives angiogenesis; TB-500 drives cell migration. Together they cover all phases of wound healing.',0),
('ghkcu','do','Retinoids (topical, PM)','Retinoids drive cell turnover and collagen synthesis. Apply GHK-Cu AM, retinoids PM.',1),
('ghkcu','do','Vitamin C (oral + topical)','Vitamin C is a required cofactor for collagen hydroxylation. GHK-Cu drives genetic upregulation; Vitamin C enables enzymatic synthesis.',2),
('ghkcu','dont','High-dose zinc supplementation','Copper and zinc compete for intestinal absorption. High-dose zinc can induce copper deficiency.',0),
('ghkcu','dont','High-concentration AHAs at same time','Strongly acidic pH from high-dose AHAs can destabilize the GHK-Cu copper chelate.',1),
-- KPV
('kpv','do','BPC-157 (oral, gut protocol)','BPC-157 heals gut mucosa via angiogenesis and cytoprotection; KPV reduces gut inflammation via NF-kB inhibition. Synergistic and non-competing.',0),
('kpv','do','LL-37','KPV has antimicrobial and anti-inflammatory properties; LL-37 has direct antimicrobial activity. Together for gut dysbiosis with inflammation.',1),
('kpv','dont','Melanotan II simultaneously','Both act on melanocortin receptors. Receptor competition and unpredictable combined effects.',0),
('kpv','dont','Strong immunosuppressants (biologics)','KPV modulates the same inflammatory pathways as biologic drugs. Combined use may cause excessive immune suppression.',1),
-- ARA-290
('ara290','do','BPC-157','BPC-157 has documented neuroprotective effects; ARA-290 promotes peripheral nerve fiber regeneration. Complementary neuroprotective stack.',0),
('ara290','do','Alpha-Lipoic Acid (ALA)','ALA is the evidence-based standard for diabetic neuropathy. ARA-290 may act additively for nerve repair.',1),
('ara290','dont','Recombinant EPO or ESAs','ARA-290 was specifically designed to separate tissue protection from erythropoiesis. Combining with EPO reintroduces the erythropoietic risks.',0),
-- AOD-9604
('aod9604','do','Ipamorelin + Mod GRF 1-29','AOD-9604 handles direct lipolysis; GH peptides drive recovery and lean mass. Clean body recomposition stack.',0),
('aod9604','do','Semaglutide or Tirzepatide','AOD-9604 directly burns fat via lipolysis; GLP-1 agonists reduce caloric intake via appetite suppression. Complementary mechanisms.',1),
('aod9604','do','MOTS-c','MOTS-c improves mitochondrial fat oxidation; AOD-9604 promotes lipolysis. Both improve fat metabolism via completely different pathways.',2),
('aod9604','dont','Fragment 176-191 simultaneously','AOD-9604 and Fragment 176-191 are essentially the same compound. Stacking them is redundant.',0),
('aod9604','dont','Insulin injections close in time','Insulin is profoundly anti-lipolytic. It completely blocks the fat-burning mechanism AOD-9604 is activating.',1),
('aod9604','dont','Beta-blockers','AOD-9604 acts via beta-3 adrenergic receptors. Beta-blockers antagonize adrenergic receptors and significantly blunt AOD-9604 mechanism.',2),
-- Fragment 176-191
('frag176','do','Ipamorelin + Mod GRF 1-29','Fragment 176-191 handles targeted fat loss; GH peptides handle recovery and lean mass. The most balanced recomposition stack.',0),
('frag176','do','Semaglutide','Appetite suppression (semaglutide) + direct lipolysis (Fragment 176-191) = dual-mechanism fat loss.',1),
('frag176','dont','AOD-9604 simultaneously','Essentially the same compound. Stacking is redundant - choose one.',0),
('frag176','dont','Beta-blockers (Propranolol, Metoprolol)','Beta-blockers block adrenergic receptors - directly antagonizing Fragment 176-191 mechanism.',1),
-- Semaglutide
('semaglutide','do','Resistance training + high protein diet','Semaglutide causes muscle loss alongside fat loss. Resistance training and protein adequacy are non-negotiable to preserve lean mass.',0),
('semaglutide','do','Ipamorelin + Mod GRF 1-29','GH peptides help preserve lean mass and counteract muscle loss that occurs with GLP-1-driven weight loss.',1),
('semaglutide','do','Metformin (T2DM context)','Semaglutide + Metformin is standard care for T2DM and provides additive glucose lowering.',2),
('semaglutide','dont','Insulin or sulfonylureas without dose adjustment','Semaglutide lowers blood glucose. Combined without dose reduction, severe hypoglycemia can occur.',0),
('semaglutide','dont','Tirzepatide simultaneously','Tirzepatide already includes GLP-1 agonism. Combining is redundant and dangerous.',1),
('semaglutide','dont','History of medullary thyroid carcinoma or MEN2','Black box contraindication. GLP-1 agonists are absolutely contraindicated in these patients.',2),
-- Tirzepatide
('tirzepatide','do','Ipamorelin + Mod GRF 1-29','GH peptides counteract muscle mass loss that occurs with aggressive tirzepatide-driven weight loss.',0),
('tirzepatide','do','Resistance training + high protein diet','Essential companion to any GLP-1/GIP agonist. Muscle preservation is the most critical co-intervention.',1),
('tirzepatide','dont','Semaglutide or any other GLP-1 agonist','Tirzepatide already contains full GLP-1 agonism. Adding semaglutide significantly increases adverse effects.',0),
('tirzepatide','dont','Insulin without dose adjustment','Risk of severe hypoglycemia. Requires physician management.',1),
-- Semax
('semax','do','Selank','The canonical cognitive stack. Semax is stimulating and BDNF-boosting; Selank is anxiolytic and GABA-modulating.',0),
('semax','do','NAD+ / NMN','Semax enhances neuroplasticity signaling; NAD+ fuels the neuronal energy metabolism those signals require.',1),
('semax','do','BPC-157','BPC-157 has neuroprotective and serotonin-modulating properties that complement Semax neurotrophic effects.',2),
('semax','dont','MAO inhibitors (MAOIs)','Semax modulates dopamine and serotonin. Combining with MAOIs creates risk of serotonin syndrome.',0),
('semax','dont','Stimulant medications (Adderall, Ritalin) at full dose','Semax is stimulating via dopaminergic mechanisms. Combining may cause excessive CNS stimulation.',1),
('semax','dont','Late afternoon or evening dosing','Semax stimulating effects can significantly disrupt sleep. Administer only in the morning.',2),
-- Selank
('selank','do','Semax','The premier nootropic stack. Semax provides cognitive stimulation and BDNF; Selank counteracts Semax anxiogenic edge.',0),
('selank','do','Magnesium glycinate (oral)','Magnesium modulates NMDA receptors and has anxiolytic properties. Complements Selank GABA modulation.',1),
('selank','dont','Benzodiazepines','Both act on GABAergic systems. Combining risks excessive CNS depression. Selank is a benzo alternative, not addition.',0),
('selank','dont','Alcohol','Alcohol is a GABA agonist. Combining with Selank produces excessive CNS depression.',1),
-- Dihexa
('dihexa','do','NAD+ / NMN','Dihexa drives synaptogenesis; NAD+ provides the neuronal energy to sustain newly formed synaptic connections.',0),
('dihexa','do','Lion''s Mane mushroom extract','Lion''s Mane stimulates NGF production; Dihexa stimulates HGF/MET-driven synaptogenesis. Complementary neurotrophic pathways.',1),
('dihexa','dont','Semax simultaneously at full doses','Both are extremely potent synaptogenesis promoters. The combination may cause excessive neuroplasticity.',0),
('dihexa','dont','Daily use','Daily Dihexa use risks HGF/MET receptor desensitization and potential for dysregulated synaptic growth. Use 2-3x per week maximum.',1),
-- NAD+
('nadplus','do','Resveratrol / Pterostilbene','Resveratrol activates SIRT1, the primary sirtuin that NAD+ fuels. Providing both the activator and the fuel maximizes longevity pathway activation.',0),
('nadplus','do','TMG (Trimethylglycine)','NAD+ synthesis consumes methyl groups. TMG replenishes methyl groups, preventing NAD+ supplementation from causing methylation deficiency.',1),
('nadplus','do','MOTS-c + Humanin','NAD+ plus mitochondria-derived peptides = comprehensive mitochondrial optimization.',2),
('nadplus','dont','High-dose niacin simultaneously','High-dose niacin and NAD+ via NMN/NR both affect the same metabolic pathway. Can cause excessive niacin-flush symptoms.',0),
('nadplus','dont','Alcohol (evening of IV NAD+)','Alcohol is metabolized via NAD+-consuming pathways and depletes NAD+. Drinking after IV NAD+ wastes the therapy.',1),
-- Cerebrolysin
('cerebrolysin','do','NAD+ IV (co-administration during clinic visits)','Cerebrolysin provides neurotrophic factors; NAD+ provides the mitochondrial fuel for neurons to use those signals.',0),
('cerebrolysin','do','Semax (intranasal, during course)','Semax amplifies endogenous BDNF; Cerebrolysin provides exogenous NGF/BDNF analogs. Additive neurotrophic support.',1),
('cerebrolysin','dont','Dihexa simultaneously at high doses','Both are powerful synaptogenesis promoters. Combining at full doses could cause excessive neuroplasticity.',0),
('cerebrolysin','dont','Porcine protein allergy patients','Cerebrolysin is derived from porcine brain. Absolute contraindication in patients with pork allergy.',1),
-- Epitalon
('epitalon','do','Thymalin','The classic Russian longevity protocol. Epitalon restores pineal and neuroendocrine function; Thymalin restores thymic immune function.',0),
('epitalon','do','NAD+ / NMN','Epitalon addresses telomere integrity; NAD+ addresses mitochondrial energy and DNA repair.',1),
('epitalon','do','Melatonin (low dose 0.5-1 mg, bedtime)','Low-dose supplemental melatonin during the course can enhance the circadian normalization effect.',2),
('epitalon','dont','High-dose melatonin (>5 mg)','Epitalon works partly by restoring the pineal gland own melatonin production. High-dose exogenous melatonin may suppress endogenous production.',0),
('epitalon','dont','Active malignancy without oncologist oversight','Telomerase activation is Epitalon longevity mechanism but cancer cells also exploit telomerase. Requires oncologist consultation.',1),
-- Thymalin
('thymalin','do','Epitalon','The definitive longevity stack with the strongest human evidence. Thymalin restores immune function; Epitalon restores neuroendocrine and telomere integrity.',0),
('thymalin','do','Thymosin Alpha-1','Thymalin restores thymic T-cell production; Thymosin Alpha-1 activates mature immune cells. Complementary immune restoration.',1),
('thymalin','do','Vitamin D3 + K2','Vitamin D3 is essential for T-cell function and immune regulation, directly supporting Thymalin goal.',2),
('thymalin','dont','Immunosuppressive drugs (for autoimmune conditions)','Thymalin restores and amplifies immune function. If immunosuppression is medically required, Thymalin may counteract it.',0),
('thymalin','dont','Corticosteroid therapy','Corticosteroids suppress T-cell activity and thymic function, directly opposing Thymalin mechanism.',1),
-- MOTS-c
('motsc','do','Humanin','Both are mitochondria-derived peptides. MOTS-c activates AMPK and metabolic pathways; Humanin activates JAK2/STAT3 cell survival.',0),
('motsc','do','NAD+ / NMN','MOTS-c and NAD+ both target mitochondrial function via different pathways.',1),
('motsc','do','Exercise (resistance + aerobic)','MOTS-c levels naturally rise with exercise. Exogenous MOTS-c combined with exercise training produces additive metabolic improvements.',2),
('motsc','dont','Insulin or sulfonylureas without glucose monitoring','MOTS-c improves insulin sensitivity. Combined with insulin or insulin-releasing drugs, hypoglycemia risk increases.',0),
-- Humanin
('humanin','do','MOTS-c','Both are mitochondria-derived peptides. MOTS-c regulates metabolic AMPK signaling; Humanin activates cell survival signaling.',0),
('humanin','do','SS-31','SS-31 protects mitochondrial membrane integrity; Humanin activates downstream cell survival signaling.',1),
('humanin','dont','JAK inhibitors (Tofacitinib, Baricitinib)','Humanin works via JAK2/STAT3 activation. JAK inhibitors directly block this pathway, negating Humanin mechanism.',0),
-- SS-31
('ss31','do','MOTS-c','SS-31 protects mitochondrial membrane integrity; MOTS-c regulates mitochondrial metabolic signaling (AMPK).',0),
('ss31','do','NAD+ / NMN','NAD+ supports the electron transport chain that SS-31 is protecting. SS-31 preserves the membrane; NAD+ fuels the enzymes on it.',1),
('ss31','do','CoQ10 (Ubiquinol)','CoQ10 is an electron carrier within the same mitochondrial electron transport chain that SS-31 protects.',2),
('ss31','dont','Mitochondria-disrupting antibiotics (Aminoglycosides)','Some antibiotics damage mitochondrial membranes. While SS-31 may mitigate this, the combination should be monitored.',0),
-- PT-141
('pt141','do','Sildenafil (Viagra) or Tadalafil (Cialis)','PT-141 acts centrally on desire; PDE5 inhibitors act peripherally on blood flow. Additive and complementary for ED with low libido.',0),
('pt141','do','Testosterone (TRT)','TRT addresses androgen-related libido reduction; PT-141 addresses central desire pathways independent of testosterone.',1),
('pt141','do','Ondansetron (anti-nausea, 30 min prior)','PT-141 commonly causes nausea at effective doses. Pre-medicating with an anti-emetic significantly improves tolerability.',2),
('pt141','dont','Nitrate medications (Nitroglycerin)','PT-141 combined with nitrates can cause severe hypotension.',0),
('pt141','dont','Melanotan II simultaneously','Both act on melanocortin receptors. Combining causes excessive and unpredictable pan-melanocortin receptor stimulation. Choose one.',1),
('pt141','dont','MAO inhibitors','PT-141 has CNS activity through dopaminergic and serotonergic pathways. MAOIs may have unpredictable CNS interactions.',2),
-- Melanotan II
('melanotan2','do','Sunscreen / controlled UV exposure','MT-II dramatically sensitizes melanocytes. Without sunscreen, brief sun exposure can cause severe over-tanning.',0),
('melanotan2','do','Ondansetron (anti-nausea pre-medication)','MT-II causes severe nausea, especially during the loading phase. Pre-medicating with Zofran is strongly recommended.',1),
('melanotan2','dont','PT-141 simultaneously','Both are melanocortin agonists. Combining causes excessive, unpredictable pan-melanocortin receptor stimulation. Choose one.',0),
('melanotan2','dont','Patients with atypical moles or melanoma history','MT-II activates MC1R and can stimulate existing melanocytes. Absolute contraindication in melanoma patients.',1),
-- Kisspeptin-10
('kisspeptin','do','hCG (human Chorionic Gonadotropin)','Kisspeptin-10 stimulates LH release; hCG mimics LH at the testicular level. Together they address both the hypothalamic signal and testicular response.',0),
('kisspeptin','do','Enclomiphene or Clomiphene','SERMs block estrogen feedback at the hypothalamus, amplifying GnRH/LH release. Combined with Kisspeptin-10, creates additive HPG axis stimulation.',1),
('kisspeptin','dont','Testosterone (exogenous TRT) simultaneously','Exogenous testosterone suppresses the HPG axis via negative feedback. It shuts down the very GnRH/LH pathway Kisspeptin-10 is trying to stimulate.',0),
('kisspeptin','dont','Continuous (non-pulsatile) administration','Continuous infusion desensitizes KISS1R, suppressing rather than stimulating GnRH. Pulsatile administration is essential for efficacy.',1),
-- Thymosin Alpha-1
('ta1','do','Thymalin','Thymalin restores thymic T-cell production; Thymosin Alpha-1 activates mature immune cells. Complementary immune enhancement.',0),
('ta1','do','LL-37','Thymosin Alpha-1 enhances adaptive immunity; LL-37 provides direct innate antimicrobial defense.',1),
('ta1','do','Vitamin D3 (5000-10000 IU)','Vitamin D3 is a primary regulator of T-cell function and innate immunity, directly synergistic with Thymosin Alpha-1.',2),
('ta1','dont','Immunosuppressive drugs (Tacrolimus, Mycophenolate)','Thymosin Alpha-1 amplifies the immune system, directly opposing immunosuppressive drugs.',0),
('ta1','dont','Active severe autoimmune disease','Enhancing T-cell activity in conditions like lupus or MS may exacerbate the autoimmune attack.',1),
-- LL-37
('ll37','do','Vitamin D3 (5000-10000 IU daily)','Vitamin D3 is the primary inducer of endogenous LL-37 gene expression. Supplementing D3 boosts both exogenous LL-37 activity and endogenous production.',0),
('ll37','do','BPC-157 (wound healing protocol)','LL-37 kills pathogens and recruits immune cells; BPC-157 drives angiogenesis and tissue repair.',1),
('ll37','do','Thymosin Alpha-1','LL-37 enhances innate immunity; Thymosin Alpha-1 enhances adaptive immunity. Together they comprehensively support both arms of the immune system.',2),
('ll37','dont','Topical corticosteroids at same site','Corticosteroids suppress the inflammatory recruitment signals that LL-37 uses to coordinate wound healing.',0),
('ll37','dont','Patients with systemic lupus erythematosus (SLE)','LL-37 forms complexes with self-DNA that can trigger TLR9, a known driver of lupus pathology.',1),
-- Collagen
('collagen','do','Vitamin C (500-1000 mg)','Vitamin C is the mandatory cofactor for collagen-stabilizing enzymes. Without it, collagen synthesis is impaired regardless of substrate availability.',0),
('collagen','do','GHK-Cu (topical)','Oral collagen provides systemic substrate; GHK-Cu activates fibroblast genes that synthesize it.',1),
('collagen','do','BPC-157','BPC-157 upregulates GH receptors and promotes tissue repair. Combined with collagen peptides, creates an environment optimized for connective tissue rebuilding.',2),
('collagen','dont','Very high-dose zinc without copper balance','Collagen synthesis requires copper-dependent enzymes. Very high zinc suppresses copper absorption.',0),
-- Matrixyl
('matrixyl','do','GHK-Cu (topical)','Both stimulate collagen synthesis via different fibroblast pathways. Matrixyl via TGF-beta, GHK-Cu via direct gene activation. Additive collagen output.',0),
('matrixyl','do','Retinol / Tretinoin (PM)','Retinoids drive cell turnover and additional collagen synthesis. Apply Matrixyl AM, retinoids PM.',1),
('matrixyl','do','Snap-8 (co-formulation)','Matrixyl restores collagen to reduce static wrinkles; Snap-8 relaxes expression lines. Together they address both types of facial lines.',2),
('matrixyl','dont','Very high-concentration AHAs (>10%) at same time','Strongly acidic pH from high-dose AHAs can potentially degrade the palmitoyl-peptide bond in Matrixyl.',0),
-- Snap-8
('snap8','do','Matrixyl (Palmitoyl Pentapeptide-4)','Snap-8 reduces dynamic expression lines; Matrixyl reduces static collagen-loss wrinkles. Together they address both types of facial lines.',0),
('snap8','do','GHK-Cu','Snap-8 reduces muscle-driven lines; GHK-Cu builds structural collagen. Relaxing the muscle + rebuilding the matrix = additive wrinkle improvement.',1),
('snap8','dont','Botulinum toxin injections at same area','Both Snap-8 and botulinum toxin inhibit neuromuscular signaling. Combining at the same muscle group may cause over-relaxation.',0),
('snap8','dont','Strong physical exfoliation immediately before application','Aggressive exfoliation compromises the skin barrier and may allow deeper penetration beyond intended levels.',1);

-- ══════════════════════════════════════════════════════════════
-- ADDENDUM — Run ONLY these statements to add new features.
-- DO NOT re-run the full file above (it will DROP all existing data).
-- Paste this section into the Supabase SQL Editor and run it.
-- ══════════════════════════════════════════════════════════════

-- ── 1. Add cross-category column to peptides ─────────────────
ALTER TABLE peptides ADD COLUMN IF NOT EXISTS cross_category_ids TEXT NOT NULL DEFAULT '';

-- ── 2. User favorites table (requires Supabase Auth enabled) ─
-- Drop the old anonymous user_key-based table and replace with auth-based
DROP TABLE IF EXISTS user_favorites CASCADE;
CREATE TABLE user_favorites (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fav_key    TEXT NOT NULL,
  UNIQUE(user_id, fav_key)
);
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorites"
  ON user_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. New categories ─────────────────────────────────────────
INSERT INTO categories VALUES
  ('diabetes',  'Diabetes & Metabolic',  '#38bdf8', 'activity',  9),
  ('menopause', 'Menopause & Hormonal',  '#e879f9', 'heart',    10)
ON CONFLICT (id) DO NOTHING;

-- ── 4. Cross-list existing peptides ──────────────────────────
UPDATE peptides SET cross_category_ids = 'diabetes'  WHERE id IN ('semaglutide','tirzepatide','ara290');
UPDATE peptides SET cross_category_ids = 'menopause' WHERE id IN ('pt141','kisspeptin','epitalon','thymalin');
-- Cross-list stack-adjacent peptides into more discoverable categories
UPDATE peptides SET cross_category_ids = 'longevity' WHERE id IN ('ta1','ll37','nadplus');
UPDATE peptides SET cross_category_ids = 'repair'    WHERE id = 'collagen';

-- ── 5. New peptides ───────────────────────────────────────────
INSERT INTO peptides VALUES
('retatrutide','diabetes','Retatrutide','LY3437943','Triple Incretin Agonist (GLP-1/GIP/Glucagon)','Clinical Trials',
'First-in-class triple agonist of GLP-1, GIP, and glucagon receptors. GLP-1 component suppresses appetite and slows gastric emptying; GIP component improves insulin secretion and adipose tissue function; glucagon component drives hepatic glucose production and energy expenditure. Combined activation yields superior weight loss and metabolic improvements beyond dual or single incretin agonism.',
'1-12 mg (Phase 3 titration protocol starting at 1 mg)','Once weekly subcutaneous','Long-term; Phase 3 ongoing','Subcutaneous injection',
'Phase 2 data showed approximately 24% body weight reduction at highest doses — superior to semaglutide and tirzepatide head-to-head. TRIUMPH Phase 3 program ongoing. Titration protocol is critical to minimize GI side effects. May become the most effective anti-obesity medication upon FDA approval.',10),

('cpeptide','diabetes','C-Peptide','Connecting Peptide / Proinsulin C-Peptide','Endogenous Pancreatic Peptide','Clinical Trials',
'31-amino acid peptide released equimolar with insulin from pancreatic beta cells. Activates Na⁺/K⁺-ATPase and eNOS via GPCRs, improving microvascular blood flow to peripheral nerves and kidneys. Promotes neuronal survival and axonal regeneration. Levels are absent in T1DM and reduced in advanced T2DM. Repleting C-peptide addresses a deficiency absent from standard insulin therapy.',
'600 pmol/kg/min IV infusion (acute); 0.5-1 nmol/kg subcutaneous (maintenance)','3-5x weekly (subcutaneous protocols)','12-24 weeks','Subcutaneous injection or IV infusion',
'Not commercially available as a standalone pharmaceutical; research-grade compounds used in trials. Most relevant for T1DM peripheral neuropathy where C-peptide is completely absent. Multiple Phase 2 trials show measurable nerve fiber density improvement and nephropathy protection.',11),

('oxytocin','menopause','Oxytocin','OXT / Love Hormone / Pitocin','Hypothalamic Neuropeptide','FDA-Approved (Rx, obstetric) / Research (other indications)',
'9-amino acid cyclic peptide produced in the hypothalamic paraventricular nucleus. Binds OXTR receptors throughout the brain and peripheral tissues. Modulates the HPA stress axis, reduces cortisol release, and promotes social bonding and mood. Suppresses menopausal vasomotor symptoms (hot flashes) via thermoregulatory centers in the hypothalamus. Supports vaginal epithelial health and lubrication via peripheral OXTR activation. Intranasal route provides efficient CNS delivery.',
'10-40 IU intranasal; 2-10 IU subcutaneous (research protocols)','Intranasal: as needed for symptoms; SubQ: 3-5x weekly','Ongoing; intranasal as-needed basis','Intranasal spray (preferred for CNS effects) or subcutaneous',
'FDA-approved only for obstetric use (Pitocin, Syntocinon). Research into menopausal symptom relief is active with promising Phase 2 data for hot flash reduction and mood support. Lower doses are preferred — higher doses can paradoxically increase anxiety in some individuals. Short half-life requires frequent dosing or use of analogues.',12);

-- ── 6. Benefits for new peptides ─────────────────────────────
INSERT INTO benefits (peptide_id, benefit, sort_order) VALUES
('retatrutide','Superior weight loss (>20% body weight)',0),
('retatrutide','Type 2 diabetes glycemic control',1),
('retatrutide','Outperforms semaglutide and tirzepatide in trials',2),
('retatrutide','Hepatic fat reduction (NAFLD/NASH)',3),
('retatrutide','Improved lipid profile',4),
('retatrutide','Cardiovascular risk reduction',5),
('cpeptide','Peripheral neuropathy reversal (T1DM)',0),
('cpeptide','Renal protection (nephropathy)',1),
('cpeptide','Microvascular blood flow improvement',2),
('cpeptide','Retinopathy protection',3),
('cpeptide','Nerve fiber density improvement',4),
('oxytocin','Hot flash frequency and severity reduction',0),
('oxytocin','Mood and anxiety improvement',1),
('oxytocin','Enhanced sexual arousal and lubrication',2),
('oxytocin','Social bonding and wellbeing',3),
('oxytocin','Sleep quality improvement',4),
('oxytocin','Cortisol and stress reduction',5);

-- ── 7. Side effects for new peptides ─────────────────────────
INSERT INTO side_effects (peptide_id, effect, sort_order) VALUES
('retatrutide','Nausea (dose-dependent during titration)',0),
('retatrutide','GI effects (diarrhea, constipation) during titration',1),
('retatrutide','Hypoglycemia risk with concurrent insulin',2),
('retatrutide','Muscle mass loss (resistance training required)',3),
('retatrutide','Long-term safety data still accumulating (Phase 3)',4),
('cpeptide','Generally well tolerated in trials',0),
('cpeptide','Mild injection site reactions',1),
('cpeptide','Limited long-term data available',2),
('cpeptide','Primarily researched in T1DM; less T2DM data',3),
('oxytocin','Mild headache (intranasal, transient)',0),
('oxytocin','Nausea at high doses',1),
('oxytocin','Paradoxical anxiety (rare, higher doses)',2),
('oxytocin','Mild water retention (antidiuretic effect)',3),
('oxytocin','Short half-life requires frequent administration',4);

-- ── 8. Stack items for new peptides ──────────────────────────
INSERT INTO stack_items (peptide_id, type, item, reason, sort_order) VALUES
-- Retatrutide
('retatrutide','do','Resistance training + high protein diet','Retatrutide drives aggressive weight loss including lean mass. Resistance training and protein adequacy are non-negotiable to preserve muscle during therapy.',0),
('retatrutide','do','Ipamorelin + Mod GRF 1-29','GH peptides counteract lean muscle loss that accompanies dramatic weight reduction with potent incretin agonists.',1),
('retatrutide','dont','Semaglutide or Tirzepatide simultaneously','Retatrutide already contains full GLP-1 and GIP agonism. Adding other GLP-1/GIP drugs is redundant and compounds adverse GI effects.',0),
('retatrutide','dont','Insulin without physician dose adjustment','Retatrutide significantly lowers blood glucose. Concurrent insulin without reduction creates severe hypoglycemia risk.',1),
('retatrutide','dont','History of medullary thyroid carcinoma or MEN2','Class-wide contraindication for all GLP-1 agonists. Absolute contraindication.',2),
-- C-Peptide
('cpeptide','do','ARA-290','ARA-290 promotes peripheral nerve fiber regeneration via EPO tissue-protective receptor; C-Peptide improves microvascular blood flow to nerves. Complementary neuropathy repair mechanisms.',0),
('cpeptide','do','Alpha-Lipoic Acid (ALA)','ALA is the evidence-based standard supplement for diabetic neuropathy. C-Peptide may act additively by improving nerve blood supply while ALA reduces oxidative stress.',1),
('cpeptide','do','BPC-157','BPC-157 has documented neuroprotective and angiogenic effects. Combined with C-Peptide microvascular improvements, potential for enhanced peripheral nerve repair.',2),
('cpeptide','dont','Use in T2DM patients with adequate C-Peptide levels','C-Peptide repletion is only beneficial when deficient. T2DM patients with preserved beta cell function may not benefit and risks are unclear.',0),
('cpeptide','dont','Exogenous insulin without glucose monitoring','Both C-Peptide and insulin affect glucose metabolism. Combined use requires careful glucose monitoring.',1),
-- Oxytocin
('oxytocin','do','PT-141 (Bremelanotide)','Oxytocin supports emotional and psychological arousal; PT-141 activates central MC3R/MC4R for physical desire. Together they address both the emotional and neurological dimensions of sexual function.',0),
('oxytocin','do','Magnesium glycinate (oral)','Magnesium supports the anxiolytic and calming properties of oxytocin and reduces HPA axis reactivity.',1),
('oxytocin','do','Kisspeptin-10','Kisspeptin supports HPG axis hormonal signaling; oxytocin supports mood, bonding, and vasomotor symptoms. Complementary hormonal and neurological support for menopause.',2),
('oxytocin','dont','SSRIs or SNRIs without physician oversight','Oxytocin and serotonin systems interact closely. Oxytocin receptor signaling modulates serotonergic tone. Combined effects are variable and require monitoring.',0),
('oxytocin','dont','High-dose use (>40 IU intranasal)','Paradoxical anxiogenic effects emerge at high doses in some individuals. The dose-response relationship for oxytocin is not linear — less is more.',1);

-- ══════════════════════════════════════════════════════════════
-- ADDENDUM 2 — Popular Stacks feature
-- Run ONLY this section in Supabase SQL Editor (not the full file)
-- ══════════════════════════════════════════════════════════════

-- ── Tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS popular_stacks (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  tagline     TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stack_members (
  id          SERIAL PRIMARY KEY,
  stack_id    TEXT NOT NULL REFERENCES popular_stacks(id),
  peptide_id  TEXT NOT NULL REFERENCES peptides(id),
  role        TEXT NOT NULL,
  note        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ── RLS Policies ──────────────────────────────────────────────

ALTER TABLE popular_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_members  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read popular_stacks" ON popular_stacks FOR SELECT USING (true);
CREATE POLICY "Public read stack_members"  ON stack_members  FOR SELECT USING (true);

-- ── Stacks category ───────────────────────────────────────────

INSERT INTO categories VALUES
  ('stacks', 'Popular Stacks', '#f59e0b', 'layers', 11)
ON CONFLICT (id) DO NOTHING;

-- ── Seed: popular stacks ──────────────────────────────────────

INSERT INTO popular_stacks VALUES
  ('gh_pulse',    'The GH Pulse Protocol',    'Classic pulsatile GH optimization',
   'The most well-validated peptide protocol for growth hormone optimization. Ipamorelin triggers a clean, selective GH pulse from the pituitary without elevating cortisol or prolactin. Mod GRF 1-29 amplifies and extends that pulse by acting on the GHRH receptor. Together they mimic the body''s natural pulsatile GH release pattern with 3–5x the amplitude. Bedtime dosing maximizes overlap with slow-wave sleep, when the largest endogenous GH pulse occurs. Most users report improved body composition, enhanced recovery, and deeper sleep within 4–8 weeks.',
   0),
  ('healing',     'The Wolverine Stack',      'Ultimate tissue repair & injury recovery',
   'Named for the X-Men character with near-instant regeneration, this is the most evidence-backed peptide healing protocol available. BPC-157 drives local angiogenesis, activates growth factor receptor pathways at the injury site, and exerts cytoprotective effects on surrounding tissue. TB-500 (Thymosin Beta-4) promotes systemic actin sequestration enabling cell migration, differentiation, and anti-inflammatory signaling throughout the body regardless of injection location. Together they address healing from two distinct, deeply synergistic mechanisms: BPC-157 concentrates effects at the injury; TB-500 amplifies the systemic repair response. Used by athletes, post-surgical patients, and biohackers for soft tissue injuries, tendon and ligament repair, gut lining restoration, and accelerated post-surgery recovery.',
   1),
  ('longevity_duo', 'The Longevity Duo',      'Epigenetic anti-aging & immune restoration',
   'Two of the most compelling longevity peptides in the bioregulator category. Epitalon (Epithalamin) is a tetrapeptide derived from the pineal gland that elongates telomeres, normalizes circadian rhythms, and regulates melatonin. Thymalin is a thymic peptide bioregulator that restores thymic function and T-cell production — the immune system''s anti-aging backbone. Human longevity studies (Khavinson, 2003–2010) showed significant reductions in all-cause mortality in elderly subjects receiving these bioregulators. Both are best run in short annual or biannual cycles of 10 days each.',
   2),
  ('cognitive',   'The Cognitive Stack',      'Focus, memory & anxiety optimization',
   'A Russian-developed nootropic peptide pairing with complementary cognitive mechanisms. Semax (ACTH analog) upregulates BDNF, enhances dopaminergic and serotonergic tone, and improves working memory, focus, and neuroprotection. Selank (Tuftsin analog) provides anxiolytic effects without sedation, enhances memory consolidation, and modulates the immune system. Together they address both the performance and anxiety dimensions of cognitive function — Semax sharpens drive and recall while Selank prevents stress-induced cognitive interference. Both are nasal spray formulations that avoid first-pass metabolism.',
   3),
  ('metabolic',   'Metabolic Optimization',   'Mitochondrial longevity & insulin sensitivity',
   'Three mitochondria-derived peptides that collectively address the core metabolic hallmarks of aging: declining insulin sensitivity, reduced mitochondrial efficiency, and impaired cellular energy production. MOTS-c acts as a mitochondrial hormone that activates AMPK, mimicking the metabolic effects of exercise. Humanin protects neurons and cardiomyocytes from insulin resistance-driven apoptosis. SS-31 (Elamipretide) stabilizes the inner mitochondrial membrane, reducing reactive oxygen species and restoring ATP production. Used together, these three address cellular energy metabolism from complementary angles.',
   4),
  ('fat_loss',    'Fat Loss Protocol',        'Multi-mechanism weight & body composition',
   'A three-compound fat loss protocol targeting different mechanisms simultaneously. AOD-9604 directly stimulates lipolysis (fat breakdown) in adipocytes via the beta-3 adrenergic pathway without affecting blood glucose or IGF-1. Semaglutide provides powerful GLP-1-mediated appetite suppression, gastric emptying delay, and insulin sensitization — clinically proven to produce 15–20%+ body weight loss. Ipamorelin adds a clean GH pulse that preserves lean muscle mass during aggressive caloric restriction, preventing the muscle loss that typically accompanies significant weight reduction. Together they address fat mobilization, appetite control, and muscle preservation.',
   5),
  ('glow',        'The Glow Protocol',        'Skin radiance, collagen & anti-aging',
   'A layered skin rejuvenation protocol built around complementary peptide mechanisms at every level of collagen biology. GHK-Cu (Copper Tripeptide-1) operates at the gene expression level — activating over 4,000 genes to upregulate collagen synthesis and suppress the MMPs that break it down. Collagen peptides with Vitamin C provide the raw structural substrate, ensuring fibroblasts have material to work with. Matrixyl (Palmitoyl Pentapeptide-4) triggers a matrikine signaling cascade via TGF-beta, adding a second independent collagen synthesis pathway. Snap-8 (optional) completes the protocol by targeting expression-driven dynamic wrinkles through gentle neuromuscular inhibition — the same mechanism as Botox but topically. Together these four address static wrinkles, skin texture, elasticity, and expression lines from four non-competing angles.',
   6)
ON CONFLICT (id) DO NOTHING;

-- ── Seed: stack members ───────────────────────────────────────

INSERT INTO stack_members (stack_id, peptide_id, role, note, sort_order) VALUES
  -- GH Pulse Protocol
  ('gh_pulse', 'ipamorelin', 'Core',     'Administer 200–300 mcg subcutaneously. The primary GH pulse trigger — clean and selective with no cortisol/prolactin elevation. Dose 30 min before bed for maximum overlap with slow-wave sleep GH pulse.', 0),
  ('gh_pulse', 'modgrf',     'Core',     'Administer 100 mcg subcutaneously in the same injection as Ipamorelin (same syringe). Acts on GHRH receptor to amplify and extend the pulse. The combination produces 3–5x greater GH release than either compound alone.', 1),

  -- Ultimate Healing Stack
  ('healing', 'bpc157', 'Core',          'Administer 250–500 mcg subcutaneously near the injury site or orally for GI conditions. Once or twice daily. The primary local angiogenesis and growth factor driver. Most effective when dosed as close to the injury as practical.', 0),
  ('healing', 'tb500',  'Core',          'Administer 2–2.5 mg subcutaneously twice weekly. Drives systemic cell migration, differentiation, and anti-inflammatory signaling. Works at a distance from the injury site — the systemic complement to BPC-157''s local action.', 1),

  -- Longevity Duo
  ('longevity_duo', 'epitalon',  'Core', 'Administer 5–10 mg subcutaneously once daily for 10 consecutive days. Run 1–2 cycles per year. Pineal gland bioregulator; elongates telomeres and normalizes circadian rhythm. Best timed in late evening to support melatonin regulation.', 0),
  ('longevity_duo', 'thymalin',  'Core', 'Administer 5–10 mg subcutaneously once daily for 10 consecutive days. Run concurrent with Epitalon or in alternating cycles. Thymic peptide bioregulator; restores T-cell production and immune competence that declines with age.', 1),

  -- Cognitive Stack
  ('cognitive', 'semax',  'Core',        'Administer 200–600 mcg intranasally (nasal spray). Once or twice daily, mornings preferred. BDNF upregulator and dopamine/serotonin modulator. Stack with Selank for the anxiety-cognitive split — Semax drives performance, Selank manages stress interference.', 0),
  ('cognitive', 'selank', 'Core',        'Administer 250–500 mcg intranasally (nasal spray). Once or twice daily, can dose alongside Semax. GABAergic anxiolytic with memory-enhancing properties. No tolerance, dependence, or sedation. Prevents the anxiety-driven cognitive disruption that blunts Semax''s nootropic effects.', 1),

  -- Metabolic Optimization
  ('metabolic', 'motsc',   'Core',       'Administer 5–10 mg subcutaneously 3–5x weekly, ideally pre-workout. Mitochondrial hormone that activates AMPK — the same pathway engaged by metformin and exercise. Dramatically improves insulin sensitivity and fatty acid oxidation.', 0),
  ('metabolic', 'humanin', 'Core',       'Administer 2–4 mg subcutaneously 3x weekly. Protects neurons and cardiomyocytes from insulin resistance-related apoptosis. Works synergistically with MOTS-c to address both the signaling and protective aspects of metabolic aging.', 1),
  ('metabolic', 'ss31',    'Optional',   'Administer 1–3 mg subcutaneously daily. Stabilizes the inner mitochondrial membrane cardiolipin, reducing ROS and restoring ATP production. Add to MOTS-c + Humanin for comprehensive mitochondrial support; optional if cost is a constraint.', 2),

  -- Fat Loss Protocol
  ('fat_loss', 'semaglutide', 'Core',    'Administer 0.25–2.4 mg subcutaneously once weekly (titration protocol). The primary appetite suppression and metabolic driver — GLP-1 RA with the strongest clinical evidence for weight loss. Titrate slowly to minimize GI side effects.', 0),
  ('fat_loss', 'aod9604',    'Core',     'Administer 300–500 mcg subcutaneously once daily, fasted. Directly activates lipolysis in adipocytes via the beta-3 adrenergic receptor without affecting glucose or IGF-1. Complements semaglutide''s appetite effects with direct fat mobilization.', 1),
  ('fat_loss', 'ipamorelin',  'Optional','Administer 200–300 mcg subcutaneously at bedtime. Add during aggressive cutting phases to preserve lean muscle mass. GH pulse from Ipamorelin maintains anabolic signaling while in a caloric deficit — critical for body recomposition vs. simple weight loss.', 2),

  -- The Glow Protocol
  ('glow', 'ghkcu',    'Core',     'Apply as a 1% topical serum AM and PM, or 1–2 mg subcutaneously 3–5x weekly for systemic skin support. The cornerstone of the stack — GHK-Cu activates over 4,000 skin-relevant genes, dramatically upregulating collagen I, III, and elastin synthesis while suppressing MMP-driven collagen breakdown. Levels decline sharply with age; restoring them is the most mechanistically direct anti-aging intervention available topically.', 0),
  ('glow', 'collagen', 'Core',     'Take 10–20 g oral collagen peptides (hydrolyzed, Types I and III) daily with 500–1000 mg Vitamin C. Vitamin C is the mandatory cofactor for the collagen-stabilizing enzymes prolyl and lysyl hydroxylase — without it, the peptides cannot be incorporated into functional collagen fibers. Provides the structural substrate that GHK-Cu''s gene activation is signaling fibroblasts to build.', 1),
  ('glow', 'matrixyl', 'Core',     'Apply as a topical serum (Matrixyl 3000 formulation, 3–8 ppm) once or twice daily. Palmitoyl Pentapeptide-4 acts as a matrikine — a fragment that signals tissue damage to fibroblasts, triggering TGF-beta-mediated collagen I, III, and fibronectin synthesis. Multiple placebo-controlled trials show measurable wrinkle depth reduction at 8 weeks. Best layered over GHK-Cu after absorption.', 2),
  ('glow', 'snap8',    'Optional', 'Apply as a topical serum (3–10 ppm formulation) daily to expression-prone areas (forehead, crow''s feet, glabellar lines). Snap-8 competes with SNAP-25 in the SNARE complex, gently reducing acetylcholine-driven muscle contraction — the same mechanism as botulinum toxin but topically and reversibly. Addresses the dynamic wrinkles that collagen peptides cannot reach. Add when targeting expression lines specifically.', 3);

-- ══════════════════════════════════════════════════════════════
-- ADDENDUM 3 — Update Wolverine name + 13 new stacks
-- Run ONLY this section in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ── Rename Ultimate Healing Stack → The Wolverine Stack ───────
UPDATE popular_stacks SET
  name    = 'The Wolverine Stack',
  tagline = 'Ultimate tissue repair & injury recovery',
  description = 'Named for the X-Men character with near-instant regeneration, this is the most evidence-backed peptide healing protocol available. BPC-157 drives local angiogenesis, activates growth factor receptor pathways at the injury site, and exerts cytoprotective effects on surrounding tissue. TB-500 (Thymosin Beta-4) promotes systemic actin sequestration enabling cell migration, differentiation, and anti-inflammatory signaling throughout the body regardless of injection location. Together they address healing from two distinct, deeply synergistic mechanisms: BPC-157 concentrates effects at the injury; TB-500 amplifies the systemic repair response. Used by athletes, post-surgical patients, and biohackers for soft tissue injuries, tendon and ligament repair, gut lining restoration, and accelerated post-surgery recovery.'
WHERE id = 'healing';

-- ── 13 new popular stacks ─────────────────────────────────────

INSERT INTO popular_stacks VALUES
  ('athlete',        'The Athlete''s Stack',         'Performance, recovery & injury prevention',
   'The canonical protocol for serious athletes who want to train harder with faster turnaround between sessions. The Wolverine Stack handles active injuries; this stack adds the GH axis layer for preventing injury before it happens, accelerating baseline recovery, and driving the adaptations that training demands. BPC-157 addresses micro-damage at tendon and ligament attachment points. TB-500 provides systemic anti-inflammatory and cell migration coverage. Ipamorelin + Mod GRF 1-29 pulse GH nightly to drive IGF-1-mediated protein synthesis, tissue remodeling, and deep sleep recovery. All four work through non-competing mechanisms and are safe to run simultaneously.',
   7),
  ('gut_repair',     'Gut Repair Protocol',          'GI lining restoration & inflammation control',
   'A targeted oral protocol for gut lining repair — the only peptide stack that can be administered entirely by mouth. BPC-157 is uniquely orally bioavailable for GI applications: it promotes angiogenesis in intestinal mucosa, activates cytoprotective pathways in gastric epithelium, and accelerates healing of ulcers, IBD lesions, and leaky gut. KPV (alpha-MSH fragment) suppresses NF-kB-driven intestinal inflammation with selectivity for gut tissue, relevant for Crohn''s, colitis, and post-antibiotic dysbiosis. Collagen peptides (Types I and III) restore structural integrity of the gut epithelial matrix. All three are orally active, making this the most accessible healing protocol — no injections required.',
   8),
  ('immune_defense', 'Immune Defense Stack',         'Adaptive immunity, thymic renewal & innate defense',
   'A three-layer immune optimization protocol covering every arm of immune function. Thymosin Alpha-1 activates the adaptive immune arm — enhancing dendritic cell maturation, T-helper 1 differentiation, NK cell cytotoxicity, and TLR expression. Thymalin restores thymic output, addressing the root cause of immune aging: the progressive atrophy of the thymus that begins in the 20s and eliminates new T-cell production by the 60s. LL-37 (human cathelicidin) covers innate defense with direct broad-spectrum antimicrobial activity and immune cell recruitment to infection sites. Used in integrative oncology, post-COVID immune dysregulation, recurrent infections, and serious longevity protocols that take immune competence seriously.',
   9),
  ('sleep_recovery', 'Sleep & Recovery Stack',       'Deep sleep, GH pulse & circadian restoration',
   'Three compounds that each improve sleep quality through distinct mechanisms — their combination is deeply synergistic and addresses both the quantity and architecture of restorative sleep. Ipamorelin''s bedtime subcutaneous injection times a clean GH pulse to coincide with the natural slow-wave sleep peak. MK-677 extends GH elevation duration and has been shown in clinical trials to significantly improve REM sleep architecture and sleep quality scores. Epitalon normalizes melatonin secretion via pineal gland restoration and resets the circadian clock at the epigenetic level. The combination produces deeper slow-wave sleep, more consistent sleep-wake timing, superior overnight recovery, and improved body composition effects from the amplified GH environment.',
   10),
  ('brain',          'The Brain Stack',              'Peak cognitive performance & synaptogenesis',
   'An aggressive nootropic protocol for peak cognitive performance or early cognitive decline intervention. Dihexa (HGF/MET potentiator) is arguably the most potent synaptogenesis promoter ever studied — reported to be seven orders of magnitude more potent than BDNF in forming new synaptic connections via the MET receptor pathway. Semax (ACTH analog) independently upregulates BDNF and NGF gene expression, activates dopaminergic and serotonergic tone, and enhances working memory and executive function. NAD+ provides the mitochondrial fuel neurons need to sustain the new synaptic connections being formed — without adequate cellular energy, plasticity signals cannot be executed. This stack should be cycled conservatively at 2–3x per week for Dihexa and not combined with other powerful synaptogenesis agents.',
   11),
  ('neuroprotection','Neuroprotection Protocol',     'Stroke & TBI recovery, dementia prevention',
   'A clinically-grounded neuroprotective protocol built from compounds with the strongest human evidence for neurological repair and prevention. Cerebrolysin provides a standardized mixture of exogenous neuropeptides including BDNF and NGF analogs that directly promote neuronal survival, dendritic sprouting, and protection against excitotoxicity — widely prescribed in Eastern Europe and Asia for stroke, TBI, and dementia. Semax amplifies endogenous BDNF and NGF gene expression and activates neurotrophic signaling independently, creating two parallel neurotrophic inputs. NAD+ restores the mitochondrial energy production and sirtuin-mediated DNA repair that neurons require to execute plasticity and recovery. Less aggressive than the Brain Stack but backed by substantially more clinical data.',
   12),
  ('recomposition',  'Body Recomposition',           'Lean mass gain + targeted fat loss',
   'A clean body recomposition protocol that simultaneously builds lean mass and burns fat without appetite suppression, GI side effects, or glucose disruption. Ipamorelin + Mod GRF 1-29 produce a pulsatile GH burst that drives IGF-1 production, protein synthesis, and overnight tissue remodeling — the anabolic foundation of any recomposition effort. Fragment 176-191 (HGH C-terminal fragment) directly activates beta-3 adrenergic receptors in adipose tissue, stimulating lipolysis independently of the GH axis. Critically, Fragment 176-191 does not raise IGF-1, does not affect blood glucose, and has no anabolic side effects — it purely mobilizes stored fat. The result is lean mass accrual driven by the GH pulse alongside targeted fat oxidation driven by the Fragment.',
   13),
  ('mens_vitality',  'Men''s Vitality Stack',        'HPG axis, libido & GH without testosterone',
   'A male hormonal and sexual wellness protocol that optimizes testosterone, libido, and GH through the body''s own signaling pathways — no exogenous hormones, no HPG suppression, no PCT required. Kisspeptin-10 stimulates hypothalamic GnRH neurons, triggering the full LH → testosterone cascade and naturally elevating endogenous testosterone. PT-141 activates central melanocortin receptors (MC3R and MC4R) in the limbic system for libido and desire, working independently of testosterone levels so it remains effective even when hormone levels are suboptimal. Ipamorelin adds GH axis optimization for energy, body composition, and sleep quality. This stack preserves and enhances the body''s own hormonal machinery rather than replacing it.',
   14),
  ('womens_wellness','Women''s Wellness Stack',      'Menopause, hormones, libido & longevity',
   'A comprehensive female hormonal optimization protocol designed for perimenopause and menopause, addressing the hormonal, neurological, sexual, and longevity dimensions of female aging simultaneously. Oxytocin reduces vasomotor symptoms (hot flash frequency and severity), improves mood and stress resilience, and supports vaginal epithelial health via peripheral OXTR activation. PT-141 addresses central arousal and desire independent of estrogen levels — the neurological component of female sexual dysfunction that hormones alone don''t solve. Kisspeptin-10 supports the HPG axis to help maintain endogenous estrogen and progesterone signaling for as long as possible. Epitalon normalizes the circadian and melatonin disruption that worsens during menopause, improves sleep architecture, and provides telomere protection for long-term cellular health.',
   15),
  ('cardiovascular', 'Cardiovascular Protection',   'Mitochondrial heart health & cardioprotection',
   'A cardioprotective longevity protocol targeting the mitochondrial and cellular mechanisms underlying heart disease and cardiac aging. SS-31 (Elamipretide) stabilizes cardiolipin on the inner mitochondrial membrane of cardiomyocytes, preventing the ROS production and ATP synthesis failure that underlies heart failure — currently in Phase 3 trials for heart failure with preserved ejection fraction. Humanin activates JAK2/STAT3 cell survival pathways specifically in cardiac and endothelial cells, protecting against ischemia-related apoptosis and insulin resistance-driven cardiomyocyte death. Thymosin Alpha-1 modulates the inflammatory environment surrounding cardiovascular tissue and provides the systemic immune competence that prevents infection-triggered cardiac events. All three have compelling human trial data with cardiovascular primary or secondary endpoints.',
   16),
  ('diabetic_neuro', 'Diabetic Neuropathy Stack',   'Peripheral nerve repair for T1DM & T2DM',
   'The most mechanistically targeted protocol for diabetic peripheral neuropathy — a condition affecting 50% of long-term diabetics that standard insulin therapy cannot address. C-Peptide replaces a hormone entirely absent in T1DM and depleted in advanced T2DM: it improves microvascular blood flow to peripheral nerves via Na⁺/K⁺-ATPase and eNOS activation and promotes neuronal survival and axonal regeneration. ARA-290 activates the tissue-protective EPO receptor (EPOR/betacR heterodimer) to directly stimulate small fiber nerve regeneration without affecting red blood cell production or blood pressure. Multiple Phase 2 clinical trials for both compounds demonstrate measurable small fiber nerve density increases on corneal confocal microscopy — one of the few interventions showing actual structural nerve repair rather than symptomatic relief. Pair with alpha-lipoic acid 600 mg oral daily as a well-validated adjunct.',
   17),
  ('full_longevity', 'Complete Longevity Protocol', 'The four hallmarks of aging addressed simultaneously',
   'The most comprehensive longevity stack assembled from compounds with actual human mortality and morbidity data. Epitalon elongates telomeres via telomerase (hTERT) activation and restores pineal circadian function — a 15-year Russian cohort study showed significant all-cause mortality reduction. Thymalin restores thymic T-cell production, directly reversing the immune senescence that leaves aging individuals vulnerable to infection and cancer — a 6-year study showed 2.5x mortality reduction when combined with Epitalon. NAD+ addresses the mitochondrial energy collapse and sirtuin/PARP dysfunction that drives cellular aging at the biochemical level; levels decline 50% between age 40 and 60. MOTS-c activates AMPK and the folate cycle, mimicking the metabolic effects of exercise and caloric restriction — the two most validated longevity interventions in biology. Together these four compounds address the four leading mechanistic hallmarks of aging: telomere attrition, immune senescence, mitochondrial dysfunction, and metabolic dysregulation.',
   18),
  ('skin_hair',      'Skin & Hair Stack',           'Hair follicle renewal & structural skin support',
   'A targeted protocol for hair follicle health, scalp rejuvenation, and structural skin support that works through regenerative rather than hormonal mechanisms. GHK-Cu directly stimulates hair follicle keratinocyte proliferation and extends the anagen (active growth) phase by activating the same gene networks that govern follicle cycling — it also suppresses the DHT-related follicle miniaturization pathway at the gene expression level without blocking androgen receptors systemically. TB-500 promotes cell migration into hair follicles and supports scalp angiogenesis, ensuring follicles receive the blood supply they need to sustain growth. Collagen peptides (Types I and III) restore the structural dermal matrix surrounding follicles that provides mechanical support and anchoring for the hair shaft. Unlike minoxidil or finasteride, this stack works through entirely regenerative mechanisms and is compatible with — or an enhancement to — existing hair loss treatments.',
   19)
ON CONFLICT (id) DO NOTHING;

-- ── Stack members for 13 new stacks ──────────────────────────

INSERT INTO stack_members (stack_id, peptide_id, role, note, sort_order) VALUES

  -- The Athlete's Stack
  ('athlete', 'bpc157',    'Core',     'Administer 250–500 mcg subcutaneously near high-load tendon/ligament attachment points (knees, shoulders, elbows) or near any micro-damage sites. Once daily post-workout. Primary local angiogenesis and growth factor signaling driver. Also run orally (500 mcg) if GI integrity is a training concern.', 0),
  ('athlete', 'tb500',     'Core',     'Administer 2–2.5 mg subcutaneously twice weekly. Systemic anti-inflammatory and cell migration coverage for every tissue stressed during training simultaneously — injection location does not matter. Loading phase: 2x weekly for 4–6 weeks. Maintenance: 1x weekly thereafter.', 1),
  ('athlete', 'ipamorelin', 'Core',    'Administer 200–300 mcg subcutaneously 30 minutes before bed, every night. The clean GH pulse driver — no cortisol or prolactin elevation. Always co-inject with Mod GRF 1-29 for full synergistic effect. Drives IGF-1-mediated protein synthesis and tissue remodeling during overnight recovery.', 2),
  ('athlete', 'modgrf',    'Core',     'Administer 100 mcg subcutaneously in the same syringe as Ipamorelin at bedtime. The GHRH receptor signal that amplifies Ipamorelin''s GH pulse 3–5x. These two must be co-injected simultaneously — they work on different receptors and their combined signal produces a GH pulse far exceeding either alone.', 3),

  -- Gut Repair Protocol
  ('gut_repair', 'bpc157',  'Core',    'Administer 500 mcg orally on an empty stomach (dissolve in water), twice daily — morning and evening. Oral route is specifically effective for GI conditions, unlike most peptides. Primary driver of intestinal mucosal angiogenesis and cytoprotection. Run 8–12 weeks for IBD/leaky gut; shorter courses for acute GI insult.', 0),
  ('gut_repair', 'kpv',     'Core',    'Administer 500 mcg–1 mg orally once or twice daily, alongside BPC-157. Targets NF-kB inflammatory pathways specifically within gut epithelial cells. Unique selectivity for GI tissue makes it an ideal companion to BPC-157''s angiogenic mechanism. Particularly relevant for Crohn''s and ulcerative colitis.', 1),
  ('gut_repair', 'collagen','Core',    'Take 15–20 g hydrolyzed collagen (Types I and III) orally daily with 500 mg Vitamin C (mandatory cofactor). Supports intestinal epithelial structural integrity — the physical gut barrier that BPC-157 and KPV are rebuilding at the cellular level. Widely available as powder; add to morning drink. Ongoing supplementation recommended.', 2),

  -- Immune Defense Stack
  ('immune_defense', 'ta1',     'Core',    'Administer 1.6 mg subcutaneously twice weekly. Primary adaptive immune activator — stimulates dendritic cells, enhances T-helper 1 differentiation, and amplifies NK cell cytotoxicity. FDA-approved in 35+ countries; in the US used off-label. Standard clinical course: 6 months. For acute infection or post-COVID: 4–8 week pulse.', 0),
  ('immune_defense', 'thymalin','Core',    'Administer 5–10 mg subcutaneously once daily for 10 consecutive days, 1–2 courses per year. Thymic peptide bioregulator that restores T-cell production at the source — the thymus. Best combined with Thymosin Alpha-1 to address both thymic output and peripheral immune cell activation simultaneously.', 1),
  ('immune_defense', 'll37',    'Core',    'Apply topically to affected areas (wound care, skin infections) or administer 0.5–2 mg subcutaneously 3–5x weekly for systemic innate immune support. Human cathelicidin covering innate defense. Particularly relevant for recurrent bacterial infections, biofilm-forming pathogens, and post-antibiotic recovery where innate immune competence is compromised.', 2),

  -- Sleep & Recovery Stack
  ('sleep_recovery', 'ipamorelin', 'Core',   'Administer 200–300 mcg subcutaneously 30 minutes before bed. Co-inject with Mod GRF 1-29 if available for maximum GH pulse. Bedtime timing is essential — the Ipamorelin-triggered GH pulse must coincide with slow-wave sleep onset. Most users notice sleep depth improvement within 1–2 weeks.', 0),
  ('sleep_recovery', 'mk677',     'Core',    'Administer 10–25 mg orally at bedtime (same timing as Ipamorelin injection). Oral GH secretagogue that provides sustained GH/IGF-1 elevation through the night. Clinical trials show significant improvement in REM sleep and sleep quality scores at 2 weeks. Start at 10 mg to minimize next-day grogginess; titrate to 25 mg over 2–4 weeks.', 1),
  ('sleep_recovery', 'epitalon',  'Core',    'Administer 5–10 mg subcutaneously once daily for 10 consecutive days, 1–2 courses per year (typically spring and fall). Run as a sleep-focused course alongside the nightly Ipamorelin/MK-677 protocol. Pineal restoration and melatonin normalization effects are cumulative — most notable improvement after the full 10-day course. Time injections in the evening.', 2),

  -- The Brain Stack
  ('brain', 'dihexa',  'Core',     'Administer 10–20 mg orally or transdermally 2–3x per week (never daily). The most potent compound in the stack — extraordinarily powerful HGF/MET synaptogenesis promoter. Start at 10 mg. Effects are long-lasting and cumulative; many users report effects persisting weeks after a cycle ends. Do not combine with Cerebrolysin or other potent neuroplasticity agents simultaneously.', 0),
  ('brain', 'semax',   'Core',     'Administer 200–600 mcg intranasally in the morning on days Dihexa is taken. BDNF and NGF upregulator via gene expression — provides the neurotrophic signaling environment that makes new synaptic connections more stable. Stimulating: morning administration only. Dose 30–60 minutes after waking.', 1),
  ('brain', 'nadplus', 'Core',     'Administer 500 mg oral NMN or NR daily (ongoing), or IV NAD+ 500–1000 mg during clinic sessions. Provides the mitochondrial ATP and sirtuin activation that neurons require to execute and sustain the synaptic growth being driven by Dihexa and Semax. Without adequate cellular energy, neuroplasticity signals cannot be fully executed.', 2),

  -- Neuroprotection Protocol
  ('neuroprotection', 'cerebrolysin', 'Core', 'Administer 5–10 mL IV infusion or 2–5 mL IM injection daily for a 10–20 day course. Provides exogenous neuropeptide mixture including BDNF/NGF analogs. Most impactful in post-stroke and TBI contexts within the first 6 months. For preventive use, 2–4 courses per year. IV administration produces faster effects; IM is more practical for outpatient protocols.', 0),
  ('neuroprotection', 'semax',        'Core', 'Administer 300–600 mcg intranasally in the morning during the Cerebrolysin course (and ongoing between courses). Amplifies endogenous BDNF and NGF expression via ACTH receptor signaling, providing a second independent neurotrophic input alongside Cerebrolysin''s exogenous peptide supply. Morning-only dosing due to stimulating effects.', 1),
  ('neuroprotection', 'nadplus',      'Core', 'Administer IV NAD+ 500–1000 mg during clinic visits (ideally same sessions as Cerebrolysin), or oral NMN/NR 500+ mg daily as maintenance. Neurons require substantial ATP to execute repair and plasticity. NAD+ restores the mitochondrial energy and sirtuin-mediated DNA repair capacity that the neuroprotective signals from Cerebrolysin and Semax depend on.', 2),

  -- Body Recomposition
  ('recomposition', 'ipamorelin', 'Core',    'Administer 200–300 mcg subcutaneously at bedtime, always co-injected with Mod GRF 1-29. Primary anabolic signal: drives IGF-1-mediated protein synthesis and lean mass accrual overnight. Preserve muscle during any caloric deficit. No cortisol or prolactin elevation at standard doses.', 0),
  ('recomposition', 'modgrf',    'Core',     'Administer 100 mcg subcutaneously co-injected with Ipamorelin at bedtime. Amplifies the GH pulse 3–5x. Essential — Ipamorelin without Mod GRF produces a significantly smaller GH response. Same syringe, same injection.', 1),
  ('recomposition', 'frag176',   'Core',     'Administer 250–500 mcg subcutaneously twice daily — once fasted in the morning, once pre-workout or at bedtime. Directly activates beta-3 adrenergic lipolysis in adipocytes with zero effect on glucose, IGF-1, or anabolic pathways. Pure fat mobilization. Fasted administration maximizes the lipolytic window.', 2),

  -- Men's Vitality Stack
  ('mens_vitality', 'kisspeptin', 'Core',    'Administer 100–500 mcg subcutaneously 1–2x daily. Stimulates hypothalamic GnRH neurons to trigger the full LH → testosterone cascade. Pulsatile or twice-daily dosing is more effective than continuous infusion, which can desensitize KISS1R. Effects on LH and testosterone are measurable within hours; sustained elevation requires ongoing dosing.', 0),
  ('mens_vitality', 'pt141',     'Core',     'Administer 0.5–2 mg subcutaneously 45–60 minutes before activity, as needed (max every 3 days). Central MC3R/MC4R agonist for desire and arousal — works via the brain, not blood flow, so it''s effective even when testosterone is suboptimal. Pre-medicate with 4–8 mg ondansetron 30 minutes prior to minimize nausea at higher doses.', 1),
  ('mens_vitality', 'ipamorelin', 'Optional','Administer 200–300 mcg subcutaneously at bedtime with Mod GRF 1-29. Add for GH axis optimization, sleep quality, and body composition improvement. The combination of enhanced testosterone signaling (Kisspeptin) + GH pulsing (Ipamorelin) + central libido activation (PT-141) covers the complete male vitality picture without a single exogenous hormone.', 2),

  -- Women's Wellness Stack
  ('womens_wellness', 'oxytocin',   'Core',     'Administer 20–40 IU intranasally as needed for vasomotor symptoms (hot flashes) and mood support, or 5–10 mg subcutaneously 3–5x weekly for sustained hormonal support. Start low (10 IU intranasal) and titrate — paradoxical anxiety can occur at higher doses in some individuals. Most impactful for hot flash severity, mood, and sexual arousal.', 0),
  ('womens_wellness', 'pt141',      'Core',     'Administer 0.5–1.5 mg subcutaneously 45–60 minutes before activity, as needed. Addresses the central neurological component of female sexual dysfunction that declining estrogen alone doesn''t explain. Works on MC3R/MC4R in the limbic system for desire and arousal. FDA-approved as Vyleesi for premenopausal HSDD; highly relevant in perimenopause.', 1),
  ('womens_wellness', 'kisspeptin', 'Core',     'Administer 100–300 mcg subcutaneously 1–2x daily. Supports hypothalamic GnRH pulsatility to help maintain endogenous estrogen and progesterone signaling during the perimenopause transition. Also enhances libido via independent HPG axis effects. Pulsatile dosing critical — avoid continuous infusion.', 2),
  ('womens_wellness', 'epitalon',   'Optional', 'Administer 5–10 mg subcutaneously once daily for 10 consecutive days, 1–2 courses per year. Normalizes melatonin and circadian disruption that worsens during menopause. Improves sleep architecture, provides telomere protection, and restores pineal neuroendocrine function. Optional layer for women prioritizing longevity alongside symptom management.', 3),

  -- Cardiovascular Protection
  ('cardiovascular', 'ss31',    'Core',     'Administer 0.1–0.25 mg/kg subcutaneously daily. Stabilizes cardiolipin on the inner mitochondrial membrane of cardiomyocytes, preventing electron transport chain dysfunction and ROS production. The most targeted mitochondrial cardioprotectant available. Currently in Phase 3 trials for HFpEF. Most impactful for individuals with known cardiovascular risk factors.', 0),
  ('cardiovascular', 'humanin', 'Core',     'Administer 2–4 mg subcutaneously 3x weekly (use the S14G-Humanin analog — 1000x more potent than native). Activates JAK2/STAT3 cell survival pathways in cardiomyocytes and endothelial cells. Works downstream of SS-31: SS-31 preserves mitochondrial membrane integrity; Humanin activates the cell survival signaling that uses the energy SS-31 is restoring.', 1),
  ('cardiovascular', 'ta1',     'Optional', 'Administer 1.6 mg subcutaneously twice weekly. Modulates the chronic low-grade inflammation surrounding cardiovascular tissue (inflammaging) and provides systemic immune surveillance against infection-triggered cardiac events. Add for individuals with elevated inflammatory markers, post-COVID cardiac involvement, or immune-compromised cardiovascular risk profiles.', 2),

  -- Diabetic Neuropathy Stack
  ('diabetic_neuro', 'cpeptide', 'Core',    'Administer 0.5–1 nmol/kg subcutaneously 3–5x weekly (maintenance protocol). Repletes the C-Peptide deficit that insulin therapy cannot address — absent in T1DM, depleted in advanced T2DM. Improves microvascular blood flow to peripheral nerves via Na⁺/K⁺-ATPase and eNOS. Most relevant for T1DM peripheral neuropathy where C-Peptide is completely absent. Phase 2 trials show measurable nerve fiber density improvement at 12 weeks.', 0),
  ('diabetic_neuro', 'ara290',   'Core',    'Administer 4 mg subcutaneously once daily for 28 days (standard clinical protocol). Activates the tissue-protective EPO receptor to stimulate small fiber nerve regeneration without erythropoietic effects. Multiple Phase 2 trials show corneal nerve fiber density increases. Run concurrent with or sequential to C-Peptide for additive nerve repair via complementary mechanisms.', 1),

  -- Complete Longevity Protocol
  ('full_longevity', 'epitalon',  'Core',    'Administer 5–10 mg subcutaneously once daily for 10 consecutive days, twice yearly (spring and fall). Telomerase activator, telomere elongator, pineal gland bioregulator. The foundational longevity intervention — 40+ years of Russian research with a 15-year human cohort showing significant all-cause mortality reduction. Run concurrently with Thymalin for maximum synergy.', 0),
  ('full_longevity', 'thymalin',  'Core',    'Administer 5–10 mg subcutaneously once daily for 10 consecutive days, twice yearly concurrent with Epitalon. Thymic peptide bioregulator addressing immune senescence at its root cause. The 6-year Khavinson study showed 2.5x reduction in all-cause mortality specifically when combined with Epitalon. These two should always be run together.', 1),
  ('full_longevity', 'nadplus',   'Core',    'Administer oral NMN or NR 500–1000 mg daily (ongoing), or IV NAD+ 500 mg loading courses quarterly. NAD+ levels decline 50% between age 40 and 60, impairing sirtuin activation, DNA repair, and mitochondrial function. Daily oral supplementation is the most practical approach; IV loading courses provide rapid replenishment. Do not neglect TMG co-supplementation to prevent methyl group depletion.', 2),
  ('full_longevity', 'motsc',     'Core',    'Administer 5–10 mg subcutaneously 3–5x weekly, ideally pre-workout. Mitochondrial-derived peptide that activates AMPK, replicating the metabolic longevity effects of exercise and caloric restriction at the cellular level. Addresses the fourth pillar of this stack — metabolic dysregulation — that Epitalon, Thymalin, and NAD+ do not directly target. Synergistic with exercise.', 3),

  -- Skin & Hair Stack
  ('skin_hair', 'ghkcu',   'Core',     'Apply 1% GHK-Cu serum topically to scalp daily (AM), and optionally administer 1–2 mg subcutaneously 3x weekly for systemic follicle support. Directly stimulates hair follicle keratinocyte proliferation, extends the anagen growth phase, and suppresses follicle miniaturization gene expression. The cornerstone of the stack — without GHK-Cu''s gene activation, the other members are working without a primary signal.', 0),
  ('skin_hair', 'tb500',   'Core',     'Administer 2–2.5 mg subcutaneously twice weekly. Systemic Thymosin Beta-4 promotes cell migration into hair follicles throughout the scalp and supports scalp angiogenesis — ensuring follicles receive the blood supply required to sustain active growth. Works synergistically with GHK-Cu''s proliferative signal by ensuring migrating progenitor cells can reach follicles and that nutrient delivery is adequate.', 1),
  ('skin_hair', 'collagen', 'Optional','Take 10–15 g hydrolyzed collagen (Types I and III) orally daily with 500 mg Vitamin C. Restores the dermal collagen matrix surrounding hair follicles that provides mechanical support and anchoring for the hair shaft. Also benefits skin texture and elasticity throughout the scalp. Add for individuals with significant hair thinning where structural dermal loss may be contributing.', 2);
