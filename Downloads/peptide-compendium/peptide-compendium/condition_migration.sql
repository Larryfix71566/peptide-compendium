-- ============================================================
-- CONDITION CATEGORIES MIGRATION
-- Run this in Supabase SQL Editor AFTER schema.sql and migration.sql
-- ============================================================

-- ── New categories ────────────────────────────────────────────

INSERT INTO categories VALUES
  ('diabetes',  'Diabetes',  '#f87171', 'activity',  9),
  ('menopause', 'Menopause', '#f472b6', 'heart',     10);

-- ── Junction table: peptide belongs to multiple categories ───

CREATE TABLE IF NOT EXISTS category_peptides (
  id          SERIAL PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  peptide_id  TEXT NOT NULL REFERENCES peptides(id),
  subcategory TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(category_id, peptide_id)
);

ALTER TABLE category_peptides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read category_peptides" ON category_peptides FOR SELECT USING (true);

-- ── Context-aware content for condition categories ────────────

CREATE TABLE IF NOT EXISTS condition_context (
  id                    SERIAL PRIMARY KEY,
  peptide_id            TEXT NOT NULL REFERENCES peptides(id),
  category_id           TEXT NOT NULL REFERENCES categories(id),
  subcategory           TEXT NOT NULL,
  condition_mechanism   TEXT NOT NULL,
  condition_benefits    TEXT NOT NULL,
  condition_dosing_note TEXT,
  condition_stack_note  TEXT,
  condition_rationale   TEXT NOT NULL,
  UNIQUE(peptide_id, category_id)
);

ALTER TABLE condition_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read condition_context" ON condition_context FOR SELECT USING (true);

-- ── User favorites table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_favorites (
  id          SERIAL PRIMARY KEY,
  user_key    TEXT NOT NULL,
  peptide_id  TEXT NOT NULL REFERENCES peptides(id),
  category_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_key, peptide_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read user_favorites"   ON user_favorites FOR SELECT USING (true);
CREATE POLICY "Public insert user_favorites" ON user_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete user_favorites" ON user_favorites FOR DELETE USING (true);

-- ── Diabetes: category_peptides assignments ───────────────────

INSERT INTO category_peptides (category_id, peptide_id, subcategory, sort_order) VALUES
('diabetes','semaglutide',  'Glucose & Insulin Management',       0),
('diabetes','tirzepatide',  'Glucose & Insulin Management',       1),
('diabetes','motsc',        'Glucose & Insulin Management',       2),
('diabetes','humanin',      'Glucose & Insulin Management',       3),
('diabetes','ara290',       'Diabetic Complications',             4),
('diabetes','ghkcu',        'Diabetic Complications',             5),
('diabetes','bpc157',       'Diabetic Complications',             6),
('diabetes','kpv',          'Diabetic Complications',             7),
('diabetes','ss31',         'Mitochondrial & Metabolic Root Cause', 8),
('diabetes','nadplus',      'Mitochondrial & Metabolic Root Cause', 9),
('diabetes','tesamorelin',  'Hormonal & Circadian Drivers',       10),
('diabetes','epitalon',     'Hormonal & Circadian Drivers',       11);

-- ── Menopause: category_peptides assignments ──────────────────

INSERT INTO category_peptides (category_id, peptide_id, subcategory, sort_order) VALUES
('menopause','kisspeptin',  'Hormonal Axis Restoration',   0),
('menopause','epitalon',    'Hormonal Axis Restoration',   1),
('menopause','sermorelin',  'Hormonal Axis Restoration',   2),
('menopause','ipamorelin',  'Hormonal Axis Restoration',   3),
('menopause','pt141',       'Sexual Function & Libido',    4),
('menopause','kisspeptin',  'Sexual Function & Libido',    5) ON CONFLICT DO NOTHING,
('menopause','tesamorelin', 'Body Composition & Fat',      6),
('menopause','aod9604',     'Body Composition & Fat',      7),
('menopause','ipamorelin',  'Body Composition & Fat',      8) ON CONFLICT DO NOTHING,
('menopause','motsc',       'Body Composition & Fat',      9),
('menopause','ghkcu',       'Skin, Hair & Collagen',       10),
('menopause','collagen',    'Skin, Hair & Collagen',       11),
('menopause','matrixyl',    'Skin, Hair & Collagen',       12),
('menopause','semax',       'Cognitive & Mood',            13),
('menopause','selank',      'Cognitive & Mood',            14),
('menopause','nadplus',     'Cognitive & Mood',            15),
('menopause','thymalin',    'Immune & Longevity',          16),
('menopause','ta1',         'Immune & Longevity',          17),
('menopause','ss31',        'Immune & Longevity',          18),
('menopause','bpc157',      'Tissue Repair & Comfort',     19),
('menopause','ghkcu',       'Tissue Repair & Comfort',     20) ON CONFLICT DO NOTHING;

-- ── Condition context: Diabetes ───────────────────────────────

INSERT INTO condition_context (peptide_id, category_id, subcategory, condition_mechanism, condition_benefits, condition_dosing_note, condition_stack_note, condition_rationale) VALUES

('semaglutide','diabetes','Glucose & Insulin Management',
'Semaglutide directly addresses the core pathology of T2DM — impaired incretin response, glucotoxicity, and progressive beta cell failure. As a GLP-1 receptor agonist it restores glucose-dependent insulin secretion, suppresses inappropriate glucagon release, slows gastric emptying to blunt post-meal glucose spikes, and acts centrally to reduce caloric intake. The SUSTAIN and PIONEER trials demonstrated HbA1c reductions of 1.5-2.0% and significant reduction in major adverse cardiovascular events (MACE), making it the preferred agent in T2DM patients with established cardiovascular disease.',
'HbA1c reduction (1.5-2.0%)|Glucose-dependent insulin secretion restoration|Cardiovascular risk reduction (MACE)|Glucagon suppression|Weight loss reducing insulin resistance|Beta cell preservation',
'For T2DM management: titrate slowly per protocol (0.25mg x4 weeks → 0.5mg → 1.0mg → 2.0mg). HbA1c monitoring every 3 months. If combining with insulin or sulfonylureas, reduce those doses proactively to prevent hypoglycemia.',
'Pair with MOTS-c for additive insulin sensitization via complementary AMPK and GLP-1 pathways. Add NAD+ to address the mitochondrial component of insulin resistance that GLP-1 agonists do not directly target. Combine with Tesamorelin if visceral adiposity is a primary driver.',
'Semaglutide is the most evidence-based peptide for T2DM management with FDA approval, decades of trials, and proven cardiovascular outcome data. It addresses the central defect of T2DM — impaired incretin signaling — while simultaneously reducing the cardiovascular risk that kills most diabetic patients. The SUSTAIN-6 trial showed 26% reduction in MACE vs placebo.'),

('tirzepatide','diabetes','Glucose & Insulin Management',
'Tirzepatide''s dual GLP-1/GIP agonism produces superior glycemic control compared to GLP-1 monotherapy. GIP receptor agonism improves insulin secretion from both first and second phase, enhances glucagon suppression, and independently improves adipose tissue insulin sensitivity. In the SURPASS trials, tirzepatide produced HbA1c reductions of 2.0-2.5% — the largest of any approved agent — with up to 40% of patients achieving normal glycemia (HbA1c <5.7%).',
'Superior HbA1c reduction (2.0-2.5%)|Normal glycemia achievable in ~40% of patients|Dual incretin mechanism|Better GI tolerability than semaglutide|Significant weight loss reducing insulin resistance|Cardiovascular protection',
'For T2DM: start at 2.5 mg weekly x4 weeks, then titrate every 4 weeks. The therapeutic dose for meaningful glucose control is typically 10-15 mg. Monitor HbA1c at 3 months. Reduce insulin doses proactively when initiating.',
'Stack with MOTS-c for mitochondrial insulin sensitization that operates via different pathways than GIP/GLP-1. Add NAD+ for beta cell protection. Consider SS-31 in patients with significant diabetic cardiovascular complications.',
'Tirzepatide represents a paradigm shift in T2DM pharmacology — the first agent to achieve near-normal glycemia in a significant proportion of patients through its unique twincretin mechanism. The SURPASS-2 trial demonstrated superiority over semaglutide 1mg on all glycemic endpoints. Currently the most powerful pharmacological glucose-lowering agent available.'),

('motsc','diabetes','Glucose & Insulin Management',
'MOTS-c activates AMPK in skeletal muscle — the primary site of glucose disposal — through a mechanism identical to Metformin but via the mitochondrial pathway rather than complex I inhibition. This drives GLUT4 translocation to the cell surface, increasing glucose uptake independent of insulin signaling. In diabetic animal models, MOTS-c administration normalized fasting glucose, improved glucose tolerance, and partially restored beta cell function through reduction of glucolipotoxicity.',
'Insulin-independent glucose uptake in muscle|AMPK activation (Metformin-like mechanism)|GLUT4 translocation stimulation|Beta cell glucolipotoxicity reduction|HbA1c improvement|Mitochondrial efficiency restoration',
'For T2DM: 5-10 mg subcutaneous 3-5x weekly. Pre-workout timing is optimal — exercise and MOTS-c activate AMPK synergistically, producing additive glucose-lowering effects. Monitor blood glucose carefully especially during and after exercise as hypoglycemia risk is significant.',
'Combine with Metformin or Berberine for additive AMPK activation via complementary mechanisms. Stack with NAD+ for comprehensive mitochondrial support. Add Semaglutide or Tirzepatide for complementary incretin-based glucose management.',
'MOTS-c represents the mitochondrial arm of glucose metabolism, operating via pathways that are largely complementary to — not duplicative of — standard T2DM medications. Its natural decline with aging partially explains why T2DM prevalence increases with age. As a mitochondria-derived peptide, it addresses the cellular energy dysfunction that underlies insulin resistance at the most fundamental level.'),

('humanin','diabetes','Glucose & Insulin Management',
'Humanin protects pancreatic beta cells from apoptosis driven by glucolipotoxicity — the cellular damage caused by chronically elevated glucose and free fatty acids in T2DM. It activates the JAK2/STAT3 survival pathway in beta cells, reducing cell death and preserving insulin secretory capacity. Human studies show an inverse correlation between circulating humanin levels and T2DM risk, and humanin levels decline significantly in established T2DM patients.',
'Pancreatic beta cell protection|Glucolipotoxicity-induced apoptosis prevention|Insulin secretory capacity preservation|Insulin sensitivity improvement|Cardiovascular protection in diabetic patients|T2DM risk biomarker (low levels = higher risk)',
'For beta cell protection: 2-4 mg subcutaneous 3x weekly using the S14G (HNG) analog which is 1000x more potent than native humanin. No specific food timing required. Monday/Wednesday/Friday schedule maintains consistent JAK2/STAT3 signaling.',
'Stack with NAD+ for comprehensive beta cell protection from both the mitochondrial (NAD+) and survival signaling (Humanin) angles. Combine with MOTS-c for complementary MDP (mitochondria-derived peptide) protocol. Add SS-31 for patients with significant diabetic cardiovascular complications.',
'Humanin is one of the few peptides with evidence of direct beta cell protection — addressing a critical gap in T2DM management where most drugs manage glucose without protecting the cells that produce insulin. Low humanin levels have been identified as an independent biomarker for T2DM risk, suggesting that humanin decline is mechanistically involved in disease progression rather than simply correlating with it.'),

('ara290','diabetes','Diabetic Complications',
'ARA-290 addresses one of the most debilitating and treatment-resistant complications of diabetes — small fiber peripheral neuropathy. It selectively activates the tissue-protective receptor (EPOR/betacR heterodimer) in peripheral nerve tissue, promoting small fiber nerve regeneration, reducing neuroinflammation, and restoring corneal nerve fiber density. Clinical trials in diabetic neuropathy patients demonstrated measurable improvement in pain scores and nerve fiber density on skin biopsy.',
'Diabetic peripheral neuropathy pain reduction|Small fiber nerve regeneration|Corneal nerve fiber density restoration|Neuroinflammation reduction|Functional improvement in neuropathy symptoms|No erythropoietic (blood-thickening) side effects',
'Standard diabetic neuropathy protocol: 4 mg subcutaneous daily for 28 consecutive days. Do not interrupt the course. Assess symptom improvement and nerve fiber density at 3-6 months post-course. Repeat 28-day courses as needed based on clinical response.',
'Pair with Alpha-Lipoic Acid (ALA) 600 mg daily — the evidence-based standard of care for diabetic neuropathy. Add NAD+ for neuronal energy support. BPC-157 may provide complementary neuroprotection via serotonin and NO pathway modulation.',
'Diabetic peripheral neuropathy affects approximately 50% of people with diabetes and is the leading cause of non-traumatic lower limb amputation. ARA-290 is one of the few compounds with clinical trial evidence showing actual nerve fiber regeneration rather than just pain symptom management. Its specificity for the tissue-protective receptor means it provides nerve repair without the thrombotic risks of full EPO.'),

('ghkcu','diabetes','Diabetic Complications',
'Diabetic wound healing failure is driven by impaired angiogenesis, reduced growth factor signaling, increased oxidative stress, and chronic inflammation in wound tissue. GHK-Cu directly addresses all four mechanisms — it stimulates VEGF and FGF expression for angiogenesis, activates over 4,000 wound-healing genes, scavenges free radicals, and inhibits NF-kB inflammatory signaling. In diabetic animal models, topical GHK-Cu normalized wound closure rates to non-diabetic levels.',
'Diabetic wound closure acceleration|Angiogenesis restoration in hypoxic wound tissue|Oxidative stress reduction|NF-kB anti-inflammatory signaling|Growth factor upregulation (VEGF, FGF)|Infection risk reduction via antimicrobial properties',
'For diabetic wound healing: topical application directly to cleaned wound bed 2x daily. For patients with widespread wound healing impairment or early-stage diabetic foot changes, systemic injectable protocol (1-2 mg subcutaneous 3-5x weekly) addresses the systemic deficit rather than just local wounds.',
'Combine topical GHK-Cu with systemic BPC-157 for comprehensive wound healing — GHK-Cu drives local collagen and angiogenesis; BPC-157 provides systemic cytoprotection and additional angiogenic signaling. Add LL-37 topically for antimicrobial cover in infected wounds.',
'Diabetic foot ulcers are among the most difficult wounds to heal in medicine, with 15-25% of diabetic patients developing them and 85% of diabetes-related amputations preceded by a foot ulcer. GHK-Cu''s ability to restore wound healing in a hyperglycemic environment — where most growth factor signaling is impaired — makes it one of the most clinically valuable peptides for this indication.'),

('bpc157','diabetes','Diabetic Complications',
'Diabetes causes significant GI complications including gastroparesis (delayed gastric emptying), intestinal permeability (leaky gut), and gut dysbiosis that worsens metabolic control through endotoxemia. BPC-157 directly addresses all three: it modulates gastric motility through enteric nervous system effects, repairs intestinal tight junctions through FAK-paxillin pathway activation, and protects the gut mucosa from the glucotoxic damage that drives GI complications in T2DM.',
'Diabetic gastroparesis improvement|Intestinal permeability (leaky gut) repair|Metabolic endotoxemia reduction|Gut microbiome environment improvement|Pancreatic cytoprotection|Neuroprotection of enteric nervous system',
'For diabetic GI complications: oral BPC-157 (200-500 mcg in water, fasted) 20-30 minutes before meals to maximize mucosal contact time. For systemic cytoprotective effects including pancreatic protection, combine with subcutaneous injection. No specific contraindications with standard T2DM medications.',
'Pair with KPV orally for comprehensive gut healing — BPC-157 heals the physical barrier; KPV reduces the inflammatory signaling that perpetuates intestinal permeability. Add oral collagen peptides and glutamine to support the structural gut repair protocol.',
'The gut-diabetes connection is increasingly recognized as a major driver of T2DM pathology — intestinal permeability allows bacterial lipopolysaccharides (LPS) to enter circulation, triggering the chronic low-grade inflammation that drives insulin resistance. BPC-157 addresses this gut-metabolic axis directly, offering a complementary mechanism to glucose-lowering medications that do not address intestinal integrity.'),

('kpv','diabetes','Diabetic Complications',
'Intestinal inflammation and permeability are mechanistically linked to T2DM progression through metabolic endotoxemia — bacterial LPS entering the portal circulation triggers hepatic inflammation and systemic insulin resistance. KPV''s MC1R agonism and NF-kB inhibition directly reduce intestinal inflammatory signaling, restore tight junction integrity, and reduce the LPS translocation that drives metabolic endotoxemia in T2DM patients.',
'Intestinal NF-kB inflammation reduction|Gut barrier integrity restoration|Metabolic endotoxemia reduction|LPS translocation prevention|Improvement of gut-driven insulin resistance|Colitis and IBD management in diabetic patients',
'For gut-driven insulin resistance: oral KPV 500 mcg - 1 mg daily, 20-30 minutes before meals. Combine with oral BPC-157 for comprehensive gut healing. No specific food restrictions. Monitor metabolic markers (fasting glucose, CRP, IL-6) to assess gut-metabolic response.',
'Stack with BPC-157 orally as the comprehensive gut healing protocol — KPV reduces inflammation; BPC-157 heals the physical barrier. Add oral collagen peptides for mucosal structural support. Probiotics complement the anti-inflammatory gut environment KPV creates.',
'The gut-brain-metabolic axis is now understood to be a primary driver of insulin resistance in many T2DM patients. KPV''s unique oral bioavailability for GI effects — rare among peptides — makes it particularly valuable for addressing the intestinal component of T2DM without requiring injection for this specific indication.'),

('ss31','diabetes','Mitochondrial & Metabolic Root Cause',
'Mitochondrial dysfunction is now recognized as upstream of insulin resistance in T2DM — impaired mitochondrial ATP production forces cells to reduce glucose uptake to match their reduced capacity to metabolize it. SS-31 restores cardiolipin integrity in the inner mitochondrial membrane, directly improving electron transport chain efficiency, reducing ROS production that damages insulin signaling proteins, and restoring the mitochondrial membrane potential that drives ATP synthesis in muscle and beta cells.',
'Mitochondrial electron transport chain restoration|ROS reduction protecting insulin signaling|Beta cell mitochondrial protection|Skeletal muscle glucose oxidation capacity|Cardiac mitochondrial function in diabetic cardiomyopathy|Cellular energy restoration',
'For diabetic mitochondrial dysfunction: 0.05-0.25 mg/kg subcutaneous daily. No food timing restrictions. Consistent daily administration maintains cardiolipin protection. Particularly valuable in patients with diabetic cardiomyopathy where cardiac mitochondrial dysfunction is advanced.',
'Stack with NAD+ for comprehensive mitochondrial support — SS-31 protects the membrane structure; NAD+ fuels the enzymes on it. Add MOTS-c for AMPK-driven mitochondrial biogenesis. CoQ10 150-300 mg daily complements SS-31 as a direct electron carrier in the same transport chain.',
'Mitochondrial dysfunction precedes insulin resistance in both T2DM and its precursors (metabolic syndrome, impaired fasting glucose), making it a root cause rather than a consequence. SS-31 is mechanistically unique in directly targeting cardiolipin — the lipid that organizes the respiratory complexes — making it a foundational intervention at the cellular origin of diabetic metabolic dysfunction.'),

('nadplus','diabetes','Mitochondrial & Metabolic Root Cause',
'NAD+ is the master regulator of cellular energy metabolism and a required cofactor for the sirtuins (SIRT1, SIRT3) that govern insulin sensitivity, glucose metabolism, and beta cell survival. In T2DM, NAD+ levels are significantly depleted due to chronic PARP activation from oxidative stress and reduced biosynthesis. Restoring NAD+ activates SIRT1 which deacetylates and activates IRS-1 (the primary insulin receptor substrate), directly improving insulin signal transduction.',
'SIRT1 activation improving insulin signal transduction|IRS-1 deacetylation restoring insulin sensitivity|Beta cell NAD+ restoration preventing apoptosis|PARP-mediated NAD+ depletion reversal|Mitochondrial biogenesis in insulin-resistant tissue|Glucose metabolism normalization',
'For T2DM: oral NMN 500-1000 mg daily with TMG (trimethylglycine) to prevent methyl depletion. IV loading courses (250-500 mg over 2-3 hours) for rapid replenishment in established T2DM. Take morning. Monitor fasting glucose as insulin sensitivity improves — existing medications may need dose adjustment.',
'Combine with Resveratrol 500 mg daily — resveratrol activates SIRT1 that NAD+ fuels. Stack with MOTS-c for comprehensive mitochondrial-metabolic support. Add SS-31 for patients with significant diabetic cardiovascular or renal complications.',
'NAD+ depletion in T2DM creates a vicious cycle — oxidative stress depletes NAD+, depleted NAD+ reduces sirtuin activity, reduced sirtuin activity worsens insulin resistance, worsened insulin resistance increases oxidative stress. Restoring NAD+ breaks this cycle at a fundamental level, making it a disease-modifying rather than purely symptomatic intervention.'),

('tesamorelin','diabetes','Hormonal & Circadian Drivers',
'Visceral adipose tissue (VAT) is an independent driver of insulin resistance — VAT releases free fatty acids and inflammatory adipokines that directly impair hepatic and peripheral insulin signaling. Tesamorelin''s potent reduction of VAT via GH/IGF-1 axis stimulation removes a primary driver of insulin resistance independent of glucose-lowering medications. Additionally, GH deficiency itself impairs glucose metabolism and body composition — Tesamorelin addresses both.',
'Visceral adipose tissue reduction (primary insulin resistance driver)|Inflammatory adipokine reduction|Hepatic insulin sensitivity improvement|GH axis restoration improving body composition|Lipid profile improvement|Complementary to glucose-lowering medications',
'For insulin resistance driven by visceral adiposity: 1-2 mg subcutaneous daily. Glucose monitoring is important — Tesamorelin can transiently elevate fasting glucose, particularly in the first 4-8 weeks. Work with physician to adjust T2DM medications as visceral fat reduces and insulin sensitivity improves.',
'Pair with Ipamorelin for complementary GH axis stimulation. Add MOTS-c for direct mitochondrial insulin sensitization. Combine with Semaglutide or Tirzepatide if both glucose management and visceral fat reduction are needed — these work via complementary mechanisms.',
'The visceral fat-diabetes connection is one of the most established in metabolic medicine. VAT is metabolically active tissue that continuously releases free fatty acids into the portal circulation, driving hepatic insulin resistance and systemic inflammation. Tesamorelin''s ability to reduce VAT through a hormonal mechanism — rather than caloric restriction — makes it uniquely valuable in patients whose visceral adiposity is a primary driver of insulin resistance.'),

('epitalon','diabetes','Hormonal & Circadian Drivers',
'Circadian rhythm disruption is now recognized as an independent risk factor for T2DM — shift workers have 40% higher T2DM incidence, and circadian misalignment impairs glucose tolerance within days. Epitalon restores the melatonin cycling controlled by the pineal gland, and melatonin directly regulates insulin secretion via MT1/MT2 receptors on pancreatic beta cells. Circadian normalization also restores the cortisol awakening response, growth hormone pulsatility, and peripheral clock gene expression in metabolic tissues.',
'Melatonin cycling restoration improving beta cell regulation|Circadian-metabolic synchronization|Cortisol rhythm normalization reducing insulin resistance|Peripheral metabolic clock gene restoration|Sleep quality improvement reducing metabolic dysregulation|Telomere protection in beta cells',
'For circadian-driven T2DM: standard Epitalon protocol — 5-10 mg subcutaneous daily for 10-20 day courses, 1-2x per year. Bedtime administration specifically supports circadian normalization. Combine with consistent sleep timing to maximize the circadian entrainment effect.',
'Pair with low-dose Melatonin (0.5-1 mg bedtime) during the course to amplify circadian normalization. Add MOTS-c and NAD+ for comprehensive metabolic restoration. Combine with Thymalin in the classic Russian longevity protocol which also demonstrated metabolic improvements.',
'The circadian-diabetes connection is supported by mechanistic, epidemiological, and clinical evidence. Melatonin receptor variants (MT2 polymorphisms) are among the strongest genetic risk factors for T2DM identified in genome-wide association studies. Epitalon''s ability to restore pineal function — the master clock of the neuroendocrine system — addresses a fundamental upstream driver of metabolic dysfunction.');

-- ── Condition context: Menopause ─────────────────────────────

INSERT INTO condition_context (peptide_id, category_id, subcategory, condition_mechanism, condition_benefits, condition_dosing_note, condition_stack_note, condition_rationale) VALUES

('kisspeptin','menopause','Hormonal Axis Restoration',
'Menopause is fundamentally a failure of kisspeptin signaling in the hypothalamus. The Kiss1 neurons in the arcuate nucleus that drive GnRH pulsatility are suppressed by the loss of negative estrogen feedback, causing the erratic then absent GnRH/LH/FSH pulsatility that defines the menopausal transition. Kisspeptin-10 supplementation partially restores this pulsatile GnRH drive, supporting residual ovarian function in perimenopause and potentially maintaining gonadotropin activity in post-menopausal women.',
'HPG axis GnRH pulsatility restoration|LH/FSH support in perimenopause|Residual ovarian function support|Central libido pathway activation (MC4R)|Hot flash reduction through hypothalamic stabilization|Hormonal transition symptom mitigation',
'For perimenopausal hormonal support: 100-500 mcg subcutaneous 1-2x daily. Pulsatile administration (morning and evening) better mimics natural kisspeptin signaling than single daily dosing. Most relevant during the perimenopause transition rather than established post-menopause.',
'Stack with Epitalon for comprehensive hypothalamic-pituitary restoration — Epitalon addresses the pineal-circadian component; Kisspeptin addresses the HPG pulsatility component. Add Sermorelin + Ipamorelin for the GH axis which also declines at menopause.',
'Kisspeptin is the most upstream intervention for menopausal hormonal disruption — it targets the hypothalamic neurons that initiate the entire reproductive hormonal cascade. While it cannot reverse menopause, it may smooth the perimenopausal transition and support residual hormonal activity. Its central role in libido regulation (via MC4R in addition to GnRH neurons) also directly addresses hypoactive sexual desire — one of the most prevalent and distressing menopausal symptoms.'),

('epitalon','menopause','Hormonal Axis Restoration',
'Russian clinical trials specifically documented Epitalon''s ability to restore menstrual cyclicity in perimenopausal women through normalization of the hypothalamic-pineal-pituitary axis. The pineal gland''s melatonin production — which Epitalon restores — is a master regulator of the reproductive axis, and melatonin decline at menopause is mechanistically linked to the loss of GnRH pulsatility. Epitalon also extends the reproductive lifespan in animal models by preserving ovarian reserve through telomerase activation.',
'Menstrual cyclicity restoration in perimenopause (clinical evidence)|Melatonin-GnRH axis normalization|Sleep quality restoration (hot flashes disrupt sleep architecture)|Circadian rhythm stabilization reducing mood dysregulation|Telomere protection in ovarian and endocrine tissue|Neuroendocrine anti-aging effects',
'Bedtime administration is specifically important for menopausal women — it aligns with the pineal gland''s natural melatonin production window and specifically addresses the sleep disruption of menopause. Standard protocol: 5-10 mg daily for 10-20 day courses, 1-2x per year.',
'The core menopause longevity stack: Epitalon + Thymalin + Ipamorelin/Sermorelin. Epitalon addresses pineal-circadian-reproductive axis; Thymalin addresses post-menopausal immune senescence; GH peptides address the GH decline that parallels estrogen loss.',
'Epitalon is unique among peptides in having documented clinical evidence specifically in perimenopausal women. The Khavinson Institute trials showed restoration of menstrual cyclicity in 42% of treated perimenopausal women — a finding not replicated by any other peptide. The pineal gland''s role as the master neuroendocrine clock makes Epitalon the most upstream intervention for menopausal neuroendocrine disruption.'),

('sermorelin','menopause','Hormonal Axis Restoration',
'GH secretion declines by 50% at menopause due to the combined loss of estrogen (which stimulates GHRH and sensitizes the pituitary) and the general age-related decline in GH pulsatility. This GH decline drives many of the body composition changes attributed to menopause — visceral fat gain, lean mass loss, skin thinning, and reduced bone density — independently of estrogen deficiency. Sermorelin restores physiological GH pulsatility through the intact hypothalamic-pituitary axis, complementing HRT rather than replacing it.',
'GH axis restoration complementing HRT|Menopausal body composition improvement (fat loss, lean mass preservation)|Skin thickness and collagen restoration|Bone mineral density support|Sleep quality improvement (GH drives SWS)|Energy and vitality restoration',
'For menopausal GH restoration: 200-500 mcg subcutaneous at bedtime. Particularly effective when combined with Ipamorelin. If on HRT (estradiol), estrogen sensitizes the pituitary to GHRH — Sermorelin may be more effective than in non-HRT users. No specific interaction with standard HRT formulations.',
'Stack with Ipamorelin at bedtime for the classic GHRH+GHRP synergistic combination. Add Epitalon for comprehensive neuroendocrine restoration. Combine with Collagen Peptides + Vitamin C to directly leverage the GH-driven collagen synthesis Sermorelin stimulates.',
'Menopausal GH decline is clinically underappreciated — most attention focuses on estrogen, but GH decline independently causes significant body composition deterioration. Many women on HRT continue to experience body composition changes because HRT does not address GH. Sermorelin fills this gap, and estrogen actually enhances GHRH sensitivity, making Sermorelin potentially more effective in women on concurrent HRT.'),

('ipamorelin','menopause','Hormonal Axis Restoration',
'Ipamorelin''s selective GHS-R1a agonism restores clean, physiological GH pulsatility without the cortisol, prolactin, or ACTH elevation that other GHRPs cause. For menopausal women, this is particularly important — cortisol is already elevated in many perimenopausal women due to HPA axis dysregulation, and adding prolactin elevation from less selective GHRPs can worsen mood and libido. Ipamorelin specifically targets GH restoration with no hormonal collateral effects.',
'Clean GH restoration without cortisol elevation|No prolactin increase (important in menopause)|Menopausal body composition improvement|Deep sleep (SWS) restoration|Connective tissue and collagen support|Anti-aging GH axis effects without hormonal side effects',
'Bedtime dosing is most important for menopausal women — GH during slow-wave sleep drives tissue repair and restoration. 200-300 mcg at bedtime co-injected with Mod GRF 1-29. If hot flashes are disrupting sleep, address sleep first (Selank, low-dose melatonin) then add Ipamorelin when sleep architecture improves.',
'The comprehensive menopausal GH stack: Ipamorelin + Mod GRF 1-29 at bedtime + Sermorelin (as an alternative GHRH). Add Collagen Peptides + GHK-Cu to capitalize on the elevated GH driving collagen synthesis. Combine with Epitalon for complete neuroendocrine restoration.',
'GH decline at menopause contributes to the visceral fat accumulation, muscle loss, skin aging, and fatigue that many women attribute entirely to estrogen deficiency. Ipamorelin''s clean hormonal profile — the only GHRP that does not elevate cortisol or prolactin — makes it the ideal GH peptide for menopausal women where hormonal balance is already disrupted.'),

('pt141','menopause','Sexual Function & Libido',
'PT-141 is the only FDA-approved pharmacological treatment for hypoactive sexual desire disorder (HSDD) in premenopausal women, and its central mechanism makes it equally relevant post-menopause. Unlike estrogen-based therapies that address vaginal atrophy and lubrication, PT-141 acts at the hypothalamic MC4R receptor to restore the central desire and arousal pathways that estrogen withdrawal suppresses. It works independent of hormone levels — making it effective even when HRT is contraindicated or insufficient.',
'Central sexual desire restoration (FDA-approved for HSDD in women)|Arousal independent of estrogen levels|Works even when HRT is contraindicated|Hypothalamic MC4R activation|Mood and wellbeing improvement|Libido restoration without systemic hormonal effects',
'For menopausal HSDD: start at 0.5 mg subcutaneous 45-60 minutes before activity. Titrate to 1-2 mg based on response and tolerability. Pre-medicate with Ondansetron 4 mg 30 minutes prior to reduce nausea. Maximum once every 3 days. Blood pressure check recommended especially if on antihypertensives.',
'Combine with topical estradiol (vaginal) to address the local atrophy component that PT-141 does not target. Stack with Kisspeptin-10 for comprehensive HPG axis + central desire restoration. Add Ipamorelin + GH peptides to address the energy and vitality component of menopausal sexual dysfunction.',
'Sexual dysfunction affects 40-60% of menopausal women and is one of the most undertreated aspects of the menopausal transition. PT-141''s FDA approval for HSDD in women specifically validates its clinical utility, and its central mechanism addresses the brain component of sexual desire that hormone replacement often fails to restore. Many women on adequate HRT still experience low libido because the central desire pathway — not just the peripheral hormonal environment — needs restoration.'),

('tesamorelin','menopause','Body Composition & Fat',
'Post-menopausal visceral fat accumulation is one of the most dramatic body composition changes in the female lifespan — women can gain 15-20% of their body fat as visceral adipose tissue within 5 years of menopause even without weight gain, driven by the loss of estrogen''s protective effect on fat distribution. Tesamorelin''s potent GH/IGF-1-driven visceral fat reduction directly counteracts this estrogen-withdrawal fat redistribution to central depots.',
'Post-menopausal visceral fat reduction|Estrogen-withdrawal fat redistribution reversal|Lipid profile improvement (triglycerides, HDL)|Cardiovascular risk reduction from VAT reduction|Body composition restoration without caloric restriction|Cognitive benefits via IGF-1 (menopause accelerates cognitive decline)',
'For menopausal visceral fat: 1-2 mg daily subcutaneous. Most significant body composition changes visible at 3-6 months. If on HRT, estrogen sensitizes the pituitary to GHRH — potentially enhancing Tesamorelin''s GH-stimulating effect. Monitor fasting glucose periodically.',
'Combine with Ipamorelin for comprehensive GH axis restoration — Tesamorelin provides the GHRH signal; Ipamorelin provides the GHRP signal; together they maximize GH output targeting visceral fat. Add AOD-9604 for additive direct lipolysis independent of the GH axis.',
'Visceral fat accumulation post-menopause is not simply about calories or activity — it is an estrogen-withdrawal effect on adipose tissue distribution that diet and exercise alone rarely fully reverse. Tesamorelin provides the most clinically validated pharmacological intervention specifically targeting this visceral fat redistribution through GH restoration.'),

('aod9604','menopause','Body Composition & Fat',
'AOD-9604 provides direct lipolysis of visceral and subcutaneous fat through beta-3 adrenergic receptor activation, completely independently of hormone levels. This makes it particularly valuable for menopausal women who cannot or choose not to use hormonal therapies — it addresses fat accumulation without any hormonal mechanism, interaction with HRT, or estrogenic effects.',
'Direct visceral fat lipolysis independent of hormones|No interaction with HRT formulations|No estrogenic or anti-estrogenic effects|Safe adjunct to hormonal and non-hormonal menopause therapies|Targeted fat loss without muscle loss risk|Secondary cartilage benefits for menopausal joint pain',
'Morning fasted injection as standard. No specific considerations for menopausal women vs standard protocol. Can be safely combined with all HRT formulations (oral estrogen, patches, pellets, rings) without interaction. No blood glucose effects — suitable for menopausal women with insulin resistance.',
'Pair with Tesamorelin for comprehensive visceral fat reduction via complementary mechanisms — Tesamorelin via GH axis; AOD-9604 via direct beta-3 adrenergic activation. Add Ipamorelin for lean mass preservation while losing fat. Combine with resistance training to maximize body recomposition.',
'Post-menopausal fat gain is driven by estrogen withdrawal affecting both fat distribution (more visceral) and metabolic rate (reduced). AOD-9604 provides a hormone-free option specifically for the fat accumulation component, making it accessible to the significant proportion of menopausal women who are not candidates for HRT or who prefer non-hormonal approaches.'),

('motsc','menopause','Body Composition & Fat',
'The metabolic slowdown of menopause is driven partly by mitochondrial dysfunction — estrogen is mitochondria-protective and its loss reduces mitochondrial biogenesis and efficiency in skeletal muscle. MOTS-c''s AMPK activation produces exercise-mimetic metabolic effects that partially compensate for this estrogen-withdrawal mitochondrial decline, improving fat oxidation, maintaining metabolic rate, and improving insulin sensitivity in the context of menopausal metabolic shift.',
'Exercise-mimetic AMPK activation|Estrogen-withdrawal metabolic slowing compensation|Fat oxidation improvement|Insulin sensitivity restoration (menopause increases insulin resistance)|Mitochondrial biogenesis in skeletal muscle|Energy levels improvement',
'Pre-workout timing for menopausal women: 5-10 mg subcutaneous 30-60 minutes before exercise. Exercise amplifies MOTS-c AMPK effects synergistically. Monitor blood glucose especially if on any glucose-lowering medication or if post-menopausal insulin resistance is significant.',
'Stack with NAD+ for comprehensive mitochondrial restoration — MOTS-c drives AMPK and mitochondrial biogenesis; NAD+ fuels the mitochondrial enzymes. Add Humanin for the complete MDP protocol. Combine with resistance training which is the most powerful intervention for menopausal metabolic rate preservation.',
'Menopausal metabolic slowing is a real physiological phenomenon — resting metabolic rate declines and fat oxidation efficiency decreases independently of body composition changes. MOTS-c addresses this at the mitochondrial level, where estrogen''s loss most directly impacts cellular metabolism, offering a mechanism-based approach to the metabolic component of menopausal body composition changes.'),

('ghkcu','menopause','Skin, Hair & Collagen',
'Estrogen is the primary driver of skin collagen production — it upregulates procollagen gene expression, increases hyaluronic acid synthesis, and maintains skin thickness and elasticity. Post-menopausal estrogen withdrawal causes 30% collagen loss in the first 5 years, with continued loss thereafter. GHK-Cu directly stimulates collagen I, III, and IV synthesis through gene activation independent of estrogen signaling, partially compensating for the lost hormonal collagen drive.',
'Post-menopausal collagen loss compensation|Estrogen-independent collagen I and III synthesis|Skin thickness restoration|Elasticity and firmness improvement|Hair follicle stimulation for menopausal hair thinning|Wound healing support for thinning post-menopausal skin',
'For post-menopausal collagen restoration: topical AM and PM as the primary protocol. The injectable protocol (1-2 mg subcutaneous 3-5x weekly) provides systemic collagen gene activation for women with significant dermal thinning or connective tissue laxity beyond topical reach. Pair consistently with Vitamin C 1000 mg daily.',
'The post-menopausal skin restoration stack: GHK-Cu (topical AM+PM) + Collagen Peptides + Vitamin C (oral daily) + Matrixyl (PM) + Snap-8 (expression lines). Together these address collagen synthesis, substrate supply, enzymatic cofactors, fibroblast signaling, and expression line formation comprehensively.',
'Post-menopausal skin aging is among the most rapid tissue aging processes in the human body — the 30% collagen loss in the first 5 post-menopausal years is far faster than the gradual age-related decline seen in men. GHK-Cu is one of the most evidence-backed interventions for this specific indication because it activates collagen synthesis through pathways that do not require estrogen, making it effective regardless of HRT status.'),

('collagen','menopause','Skin, Hair & Collagen',
'Oral collagen peptides provide the hydroxyproline-rich dipeptides (Pro-Hyp, Hyp-Gly) that accumulate preferentially in skin, joints, and connective tissue, stimulating fibroblast collagen synthesis through receptor-mediated signaling. In post-menopausal women specifically, clinical trials have shown greater improvements in skin elasticity, joint pain, and bone density compared to younger populations — likely because the post-menopausal state creates a higher demand for exogenous collagen substrate.',
'Skin elasticity and hydration restoration|Post-menopausal joint pain reduction (cartilage support)|Bone mineral density support (especially combined with Vitamin D3 and calcium)|Hair thickness improvement for menopausal hair thinning|Gut lining support|Evidence-based in post-menopausal women specifically',
'For menopausal collagen restoration: 15-20 g daily with 1000 mg Vitamin C. Post-workout timing (within 60 minutes after exercise) is optimal — exercise increases blood flow to connective tissue and the anabolic window improves collagen incorporation. Type I+III for skin and hair; add Type II for joint cartilage support.',
'The core menopausal collagen protocol: Collagen Peptides + Vitamin C (oral daily) + GHK-Cu (topical) + Matrixyl (topical). The oral collagen provides substrate; Vitamin C enables synthesis; GHK-Cu activates the fibroblast genes; Matrixyl provides the TGF-beta signaling. All four work synergistically through non-overlapping mechanisms.',
'Post-menopausal collagen loss is well-documented and clinically significant — affecting not just skin appearance but joint health, bone density, gut integrity, and pelvic floor strength. Collagen peptides are one of the few supplements with multiple randomized controlled trials specifically in post-menopausal women showing benefits across multiple tissue types, making it among the most evidence-supported interventions for this population.'),

('matrixyl','menopause','Skin, Hair & Collagen',
'Palmitoyl Pentapeptide-4 mimics a collagen fragment that signals tissue damage, triggering TGF-beta-mediated fibroblast activation for collagen I and III synthesis. In post-menopausal skin where estrogen-driven collagen signaling is absent, Matrixyl provides an alternative signaling route to maintain fibroblast activity — acting as a surrogate for the lost hormonal collagen signal through a completely different receptor pathway.',
'Estrogen-independent fibroblast collagen stimulation|TGF-beta pathway activation compensating for lost hormonal signal|Wrinkle depth reduction in post-menopausal skin|Skin firmness restoration|Fibronectin and hyaluronic acid synthesis|Photoaging reversal',
'For post-menopausal skin: AM and PM application. The PM application is particularly important — skin repair and collagen synthesis peak during sleep, and Matrixyl applied before sleep provides the fibroblast signaling for this nocturnal repair window. Consistent twice-daily application for minimum 8 weeks to see measurable results.',
'The post-menopausal topical protocol: Matrixyl (AM signal peptide) + GHK-Cu (PM copper peptide with gene activation) + Snap-8 (expression line relaxation) + daily SPF. Oral Collagen Peptides + Vitamin C provide the systemic substrate that topical peptides signal the skin to use.',
'Post-menopausal skin responds well to Matrixyl specifically because the TGF-beta pathway it activates is estrogen-independent — unlike many aspects of skin biology that are estrogen-dependent and therefore decline with menopause. Clinical trials in mature skin (the population most likely to be post-menopausal) show the strongest wrinkle depth reduction results, suggesting post-menopausal skin may be particularly responsive to Matrixyl''s fibroblast signaling.'),

('semax','menopause','Cognitive & Mood',
'Menopausal cognitive decline — commonly described as "brain fog" — is associated with declining estrogen, reduced cerebral blood flow, and decreased BDNF and NGF production. Semax directly upregulates BDNF and NGF in the hippocampus and cortex, activates dopaminergic and serotonergic systems that estrogen normally supports, and promotes neuroplasticity. It addresses the neurological component of menopause that HRT alone does not fully cover, particularly when women are not candidates for or choose not to use estrogen therapy.',
'Menopausal brain fog improvement|BDNF and NGF restoration compensating for estrogen withdrawal|Memory consolidation and recall|Focus and concentration restoration|Dopamine and serotonin system support|Neuroprotection during menopausal neurological transition',
'For menopausal cognitive support: 200-600 mcg intranasal in the morning only. Never in the evening — stimulating effects can worsen the sleep disruption that is already common in menopause. Start at lower dose (200-300 mcg) and titrate. Cycle 2-4 weeks on, 1-2 weeks off to prevent BDNF receptor desensitization.',
'The menopausal cognitive stack: Semax (morning, BDNF/dopamine) + Selank (morning or as needed, anxiolytic) + NAD+ (daily, mitochondrial). These three address the neurological, anxiety, and energetic components of menopausal cognitive dysfunction through complementary mechanisms.',
'Cognitive symptoms affect 40-60% of perimenopausal and early post-menopausal women and are among the most distressing non-vasomotor menopausal symptoms. Semax addresses the specific neurotrophin deficits (BDNF, NGF) and monoamine imbalances (dopamine, serotonin) that estrogen withdrawal causes in the brain, providing targeted cognitive support through mechanisms that are largely independent of and complementary to HRT.'),

('selank','menopause','Cognitive & Mood',
'Menopausal anxiety and mood dysregulation are driven by estrogen withdrawal''s effects on GABA-A receptor sensitivity, serotonin synthesis, and HPA axis regulation. The perimenopausal period is associated with a 2-4x increase in anxiety and depression risk. Selank''s GABAergic modulation and serotonin system support directly address these estrogen-withdrawal neurological effects, providing anxiolysis without the sedation, dependence, or cognitive blunting of benzodiazepines — critical for menopausal women who need clear cognitive function.',
'Menopausal anxiety reduction without sedation or dependence|GABA-A receptor sensitivity restoration|Serotonin system support compensating for estrogen withdrawal|Mood stabilization during hormonal transition|Sleep onset improvement (anxiety-driven insomnia)|Non-hormonal anxiolytic option for women avoiding HRT',
'For menopausal anxiety: 250-500 mcg intranasal morning or as needed before stressful situations. Unlike benzodiazepines, Selank can be used situationally without dependence concerns. Evening use is acceptable (unlike Semax) — may improve sleep onset by reducing evening anxiety. Can be used during HRT without interaction.',
'Stack with Semax for the comprehensive menopausal cognitive-mood protocol — Semax in the morning for cognitive stimulation and BDNF; Selank as needed for anxiety management without sedation. Add Magnesium Glycinate 400 mg at bedtime for NMDA modulation and sleep support. NAD+ daily for mitochondrial support.',
'Anxiety is the most prevalent menopausal psychiatric symptom, peaking in perimenopause when hormonal fluctuations are most erratic. Selank''s GABAergic mechanism directly compensates for the reduced GABA-A receptor sensitivity that estrogen withdrawal causes — estrogen is a positive allosteric modulator of GABA-A receptors, and its loss creates the neurological substrate for menopausal anxiety. Selank''s lack of dependence or tolerance makes it uniquely suitable for the chronic management this transition requires.'),

('nadplus','menopause','Cognitive & Mood',
'Estrogen is a key activator of SIRT1 — the primary sirtuin that NAD+ fuels — and estrogen withdrawal causes measurable NAD+ decline through reduced SIRT1-mediated NAD+ biosynthesis. This creates a spiral of mitochondrial dysfunction, cognitive decline, and metabolic slowing characteristic of the menopausal transition. Restoring NAD+ re-activates SIRT1 through substrate rather than hormonal activation, providing an estrogen-independent route to the longevity and neuroprotective pathways that estrogen normally supports.',
'Menopausal fatigue reversal (mitochondrial restoration)|Cognitive fog improvement via neuronal NAD+ restoration|Estrogen-SIRT1-NAD+ pathway restoration|Sleep architecture improvement|DNA repair in rapidly aging post-menopausal tissue|Cardiovascular protection as estrogen cardioprotection is lost',
'For menopausal NAD+ restoration: oral NMN 500-1000 mg daily with TMG. IV loading course (5-10 days) for rapid restoration in symptomatic women. Morning administration. If on HRT, estrogen and NAD+ have additive SIRT1-activating effects — the combination may be more effective than either alone. Monitor energy levels and sleep quality as markers of response.',
'The menopausal longevity-energy stack: NAD+ + Resveratrol + MOTS-c + Epitalon. NAD+ fuels SIRT1; Resveratrol activates SIRT1; MOTS-c drives mitochondrial biogenesis; Epitalon restores neuroendocrine cycling. Together these address menopausal aging at the cellular, mitochondrial, and neuroendocrine levels simultaneously.',
'The estrogen-SIRT1-NAD+ connection is mechanistically established — estrogen directly upregulates SIRT1 expression and activity, meaning menopause triggers a cascade of NAD+ pathway decline that amplifies the aging process independently of estrogen''s other effects. NAD+ supplementation provides an estrogen-independent route into this pathway, making it particularly valuable for post-menopausal women not on HRT where this entire cascade has been withdrawn.'),

('thymalin','menopause','Immune & Longevity',
'Estrogen is a thymic trophic factor — it directly supports thymic epithelial cell function and T-cell production. The thymus begins involuting at puberty, but estrogen withdrawal at menopause significantly accelerates this process, causing a measurable jump in immune senescence that leaves post-menopausal women more vulnerable to infection, autoimmune conditions, and malignancy. Thymalin directly restores thymic function and T-cell production independent of estrogen, partially reversing the immune vulnerability of the post-menopausal state.',
'Post-menopausal immune senescence reversal|Estrogen-withdrawal thymic decline compensation|T-cell production restoration|Reduced infection susceptibility|Autoimmune risk reduction|Cancer immune surveillance restoration',
'Standard Thymalin protocol for menopause: 10 mg subcutaneous daily for 10 consecutive days. Traditional spring and fall timing aligns with seasonal immune demands. Run concurrently with Epitalon for the classic longevity protocol that demonstrated mortality reduction. No interaction with HRT formulations.',
'The core post-menopausal longevity and immune protocol: Thymalin + Epitalon (run concurrently in the 10-20 day course) + Thymosin Alpha-1 (year-round maintenance). Add Vitamin D3 10,000 IU daily as the primary thymic and immune trophic support. Together these address thymic T-cell production, mature immune cell activation, and the circadian-neuroendocrine aging component.',
'Post-menopausal immune vulnerability is clinically significant — post-menopausal women have higher rates of certain infections, autoimmune conditions, and malignancies compared to premenopausal women of similar biological age. This is in part because estrogen''s thymic support is lost. Thymalin is the only peptide with 40 years of clinical evidence specifically demonstrating mortality reduction through immune system restoration — a benefit that is particularly relevant in the post-menopausal immune senescence context.'),

('ta1','menopause','Immune & Longevity',
'While Thymalin addresses T-cell production, Thymosin Alpha-1 activates and potentiates the mature immune cells that are already in circulation but functionally impaired by post-menopausal immune senescence. The dendritic cell activation, NK cell enhancement, and TLR expression upregulation that Thymosin Alpha-1 drives directly compensate for the reduced immune surveillance that post-menopausal women experience. Together with Thymalin, it provides both the production and activation components of thymic immune restoration.',
'Post-menopausal NK cell and CD8+ T-cell activation|Dendritic cell function restoration|TLR-mediated innate immune upregulation|Cancer immune surveillance restoration|Antiviral immunity enhancement|Complement to Thymalin (production vs activation)',
'For post-menopausal immune support: 1.6 mg subcutaneous twice weekly (Monday/Thursday). Year-round use is appropriate given the permanent nature of post-menopausal immune senescence. Combine with Thymalin during seasonal courses for comprehensive immune restoration.',
'Pair with Thymalin as the comprehensive thymic restoration protocol — Thymalin restores production; Thymosin Alpha-1 activates function. Add Vitamin D3 (10,000 IU daily) and Zinc (25-50 mg daily) as essential immune cofactors. LL-37 provides innate antimicrobial defense at the mucosal level.',
'Post-menopausal women face a double immune challenge — estrogen withdrawal both reduces thymic T-cell production (addressed by Thymalin) and impairs mature immune cell function and activation (addressed by Thymosin Alpha-1). Using both creates a comprehensive immune restoration approach that addresses the full spectrum of post-menopausal immune senescence.'),

('ss31','menopause','Immune & Longevity',
'Estrogen is mitochondria-protective in cardiac and skeletal muscle — it maintains cardiolipin synthesis, reduces mitochondrial ROS production, and preserves the electron transport chain efficiency that drives cellular energy production. Estrogen withdrawal at menopause causes measurable mitochondrial dysfunction in these tissues, contributing to the cardiovascular risk increase, fatigue, and muscle weakness of the post-menopausal state. SS-31 restores cardiolipin integrity through a completely estrogen-independent mechanism.',
'Post-menopausal cardiac mitochondrial protection|Estrogen-withdrawal cardiovascular risk mitigation|Skeletal muscle energy restoration|Fatigue reduction via mitochondrial efficiency|ROS reduction in post-menopausal tissue|Cellular energy restoration independent of hormones',
'Standard protocol for post-menopausal mitochondrial support: 0.05-0.25 mg/kg subcutaneous daily. No food timing restrictions. Particularly valuable in post-menopausal women with cardiac symptoms, significant fatigue, or early cardiovascular risk markers. Long-term use is appropriate given the permanent nature of post-menopausal mitochondrial vulnerability.',
'The post-menopausal mitochondrial-longevity stack: SS-31 + MOTS-c + NAD+ + CoQ10. SS-31 protects the membrane; MOTS-c drives biogenesis; NAD+ fuels the enzymes; CoQ10 carries electrons. Together these comprehensively address the mitochondrial dysfunction that estrogen withdrawal causes.',
'The cardiovascular risk that increases sharply at menopause is partly driven by the loss of estrogen''s mitochondrial protection in cardiac tissue. Mitochondrial dysfunction impairs the heart''s energy production capacity and increases oxidative damage. SS-31''s Phase 2/3 trial data in heart failure patients validates its cardiac mitochondrial protection mechanism, making it the most mechanistically compelling peptide for the cardiovascular vulnerability of the post-menopausal state.'),

('bpc157','menopause','Tissue Repair & Comfort',
'Menopause causes multiple tissue-level changes beyond skin and hormones: joint pain increases significantly (up to 50% of menopausal women report new or worsening joint pain), gut motility changes, vaginal atrophy, and connective tissue laxity (contributing to pelvic floor dysfunction). BPC-157 addresses joint and connective tissue repair through FAK-paxillin pathway activation, gut motility through enteric nervous system modulation, and inflammation through systemic NO regulation.',
'Menopausal joint pain and inflammation reduction|Connective tissue repair for laxity and instability|Gut motility normalization for menopausal GI symptoms|Tendon and ligament integrity support|Anti-inflammatory effects without NSAID side effects|Systemic tissue cytoprotection',
'For menopausal joint and tissue support: subcutaneous injection near affected joints or systemic (abdomen/thigh) for widespread joint involvement. 200-500 mcg daily or twice daily. Oral BPC-157 for GI motility and gut symptoms. No interaction with HRT. Safe long-term given exceptional safety profile.',
'For menopausal tissue repair: BPC-157 (systemic) + TB-500 (systemic, loading phase) + Collagen Peptides + Vitamin C. BPC-157 drives angiogenesis and repair; TB-500 drives cell migration; collagen provides substrate. This stack addresses the connective tissue vulnerability of the post-menopausal state.',
'Joint pain is one of the most prevalent and undertreated menopausal symptoms, affecting approximately 50% of women in the menopausal transition. Estrogen has anti-inflammatory and connective tissue-protective effects that are lost at menopause, leaving joints and soft tissues more vulnerable to degeneration. BPC-157 provides a non-hormonal, non-NSAID approach to the inflammatory and tissue integrity component of menopausal musculoskeletal symptoms.');

