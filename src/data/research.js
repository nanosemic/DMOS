// Content for the Research page.
// Source: "Dr. Akshay K. – Research information repository" (sources checked 2026-10-24).
// Kept separate from site.js so the two pages can be edited independently.

export const researchHero = {
  title: 'Research',
  subtitle: 'D-MOS Research Group · IIT Bhubaneswar',
  eyebrow: 'Research focus',
  // two lines, revealed one after another; `accent` is set in the italic serif
  headline: [{ text: 'Power devices, from' }, { text: 'simulation to ', accent: 'measurement' }],
  // official faculty-page description of the group's work
  intro:
    'Design and development of power semiconductor devices in silicon and wide / ultra-wide bandgap semiconductors, with TCAD-based process design and advanced characterisation.',
  facts: [
    { label: 'Materials', value: 'Si · SiC · GaN · Diamond · Metal oxides' },
    { label: 'Devices', value: '0.6 – 1.7 kV SiC MOSFETs and superjunctions' },
    { label: 'Approach', value: 'TCAD design · fabrication · characterisation' },
  ],
  figure: 'Fig. 01 — Cut-away of a SiC trench MOSFET with a superjunction drift region (illustration)',
}

// Labels for the layers of the 3D device in the hero (standard device terminology).
// `side` puts the label left or right of the model; `dy` nudges it vertically to avoid overlaps.
export const deviceCallouts = [
  { id: 'source', layer: 'source', side: 1, dy: -26, label: 'Source metal', note: 'Top contact' },
  { id: 'gate', layer: 'gate', side: -1, dy: -22, label: 'Trench gate', note: 'Gate electrode in oxide' },
  { id: 'body', layer: 'body', side: 1, dy: 18, label: 'n⁺ source · p-body', note: 'Where the channel forms' },
  { id: 'drift', layer: 'drift', side: -1, dy: 0, label: 'Superjunction drift region', note: 'Alternating n / p pillars' },
  { id: 'substrate', layer: 'substrate', side: 1, dy: 6, label: '4H-SiC substrate', note: 'n⁺ silicon carbide' },
  { id: 'drain', layer: 'drain', side: -1, dy: 18, label: 'Drain', note: 'Bottom contact' },
]
