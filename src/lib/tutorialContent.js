// Single source of truth for tutorial + first-run overlay.
// Keep copy high-level (what/why) so it ages well; detail[] holds the steps.

export const TUTORIAL_SECTIONS = [
  {
    id:'welcome', icon:'⬡', color:'#2dd4bf', title:'Welcome to the Compendium',
    overview:'A research reference for peptides — what they are, how they are dosed, how they stack, plus tools to calculate reconstitution and track your own protocols.',
    detail:[
      'Browse compounds by category, condition, or stack.',
      'Use the Tools row for the reconstitution calculator and your tracking dashboard.',
      'Everything here is for educational and research purposes only — not medical advice. Consult a qualified provider before any use.',
    ],
  },
  {
    id:'browse', icon:'◇', color:'#60a5fa', title:'Browsing Peptides',
    overview:'The Browse row holds standard categories (GH, repair, fat loss, etc.). Each peptide has mechanism, dosing, timing, side effects, and stacking guidance.',
    detail:[
      'Tap a category tab to open its peptide list, then pick a compound.',
      'Use the search bar to jump straight to any peptide by name.',
      'Tap the ☆ star on any peptide to save it to Favorites; filter to favorites from the header.',
    ],
  },
  {
    id:'conditions', icon:'✦', color:'#f472b6', title:'Condition Protocols',
    overview:'Diabetes and Menopause are condition views — they reframe relevant peptides around that specific goal, with context on why each applies.',
    detail:[
      'Open a condition from the Browse row.',
      'Peptides are grouped into condition-specific subcategories.',
      'Each detail page adds “why this peptide for this condition,” condition-specific benefits, and dosing notes.',
    ],
  },
  {
    id:'stacks', icon:'⚗', color:'#a78bfa', title:'Stacks & Blends',
    overview:'Named multi-peptide protocols with synergy explanations, full dosing, and timing. Each peptide page also shows which stacks it appears in.',
    detail:[
      'Open Stacks & Blends from the Browse row to see all stacks by category.',
      'A stack page explains why the peptides work together and gives the full protocol.',
      'Use “Start all as cycles” on a stack to create one tracking cycle per peptide at once.',
    ],
  },
  {
    id:'reconstitution', icon:'🧪', color:'#2dd4bf', title:'Reconstitution Calculator',
    overview:'Turn a vial strength + BAC water volume + target dose into the exact syringe units to draw, on U-100, U-50, or U-40 syringes.',
    detail:[
      'Enter vial mg, the BAC water you will add, and your target dose.',
      'Pick your syringe type — the result shows units to draw plus a fill visual.',
      'The reference matrix below updates live for 1–10 mg vials at your settings.',
    ],
  },
  {
    id:'dashboard', icon:'◈', color:'#60a5fa', title:'Dashboard Overview',
    overview:'Four tabs: Today (log doses), Overview (cycle progress + 7-day activity), Analytics (trends + cost), and Cycles (manage protocols).',
    detail:[
      'Today: check off each scheduled dose as you take it.',
      'Overview: see progress bars, a dosing heatmap, and cycles ending soon.',
      'Analytics: 30-day dose trends, doses by peptide, and cost-per-dose once you log data.',
    ],
  },
  {
    id:'cycles', icon:'⟳', color:'#34d399', title:'Cycle Tracking & Dose Logging',
    overview:'A cycle tracks one peptide’s protocol over time. Add vial concentration so each logged dose auto-converts to syringe units.',
    detail:[
      'Dashboard → Cycles → “+ Start New Cycle.” Pick a peptide; dose/frequency auto-fill.',
      'Enter vial mg + BAC water + syringe type so doses convert to units automatically.',
      'Scheduled doses then appear in the Today tab — tap the checkbox to log each one.',
      'For a stack, use “Start all as cycles” on the stack page, then add concentration to each cycle.',
    ],
  },
]

export const TUTORIAL_VERSION = 1 // bump to re-show the first-run overlay after major changes
