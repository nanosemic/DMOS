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

// Pinned scroll sequence: the device comes apart while four stages explain the work.
// Each stage lights up one layer of the model. Facts from the report (official / verified).
export const researchSequence = {
  intro: {
    label: 'Inside the device',
    title: 'Engineered layer by layer',
    text: 'Scroll to take a power transistor apart, and see where the group’s research fits in.',
  },
  stages: [
    {
      layer: 'drift',
      label: 'Superjunction drift region',
      title: 'Blocking high voltage with low loss',
      text: 'Alternating n and p pillars let the drift region hold high voltage while still conducting with little resistance. The group designs superjunctions that tolerate manufacturing variations, including the charge sheet superjunction (CSSJ), proposed at IIT Madras by Prof. Shreepad Karmalkar, Dr. Akshay K. and S. Srikanth.',
      stat: '1.2 kV',
      statLabel: 'SiC charge sheet superjunction trench MOSFET (2025)',
    },
    {
      layer: 'gate',
      label: 'Gate and oxide',
      title: 'Reliable gates for silicon carbide',
      text: 'The gate sits in a trench lined with oxide, where reliability problems start. The group studies gate-oxide reliability, and fabricates and measures Al₂O₃/SiO₂ layers whose interface charge is the building block of CSSJ devices.',
      stat: 'Al₂O₃ / SiO₂',
      statLabel: 'Oxide interfaces studied on silicon and silicon carbide',
    },
    {
      layer: 'body',
      label: 'Switching robustness',
      title: 'Surviving short circuits',
      text: 'In an electric vehicle a power transistor has to survive faults. The group designs silicon carbide MOSFETs with higher breakdown voltage and a longer short-circuit withstand time.',
      stat: '0.6 – 1.7 kV',
      statLabel: 'SiC MOSFET drift-layer designs',
    },
    {
      layer: 'substrate',
      label: 'Simulation to measurement',
      title: 'TCAD first, then the lab',
      text: 'Each design is built and tuned in TCAD process and device simulation before it is characterised on power-device test equipment.',
      stat: 'TCAD',
      statLabel: 'Silvaco · Synopsys Sentaurus · Keithley ACS',
    },
  ],
  totals: [
    { value: '16', label: 'Journal papers' },
    { value: '13', label: 'Conference papers' },
    { value: '3', label: 'Funded projects' },
    { value: '4', label: 'Ph.D. scholars' },
  ],
}

// The five research themes. Grouping and names are editorial (grouped from his publications;
// pending Dr. Akshay's approval). Papers are verified by DOI; people are only those the report
// links to each area (co-authors whose role is unconfirmed are left out).
// Images are AI-generated illustrations (labelled as such on the page), in public/images/themes;
// `mode` 'key' cuts the object out of its plain background, 'print' keeps the whole image.
const IMG = `${import.meta.env.BASE_URL}images/themes/`

export const researchThemes = {
  eyebrow: 'Research themes',
  title: 'Five research',
  accent: 'themes',
  intro: 'Grouped from Dr. Akshay K.’s publications: what each line of work is, why it matters, and who works on it.',
  themes: [
    {
      id: 'cssj',
      heading: ['Superjunction', 'devices'], // second part is set in italic
      icon: 'layers',
      callouts: [['4H-SiC CSSJ', 'trench MOSFET · 1.2 kV'], ['Charge balance', 'tolerant to process variation']], // two labels beside the image
      image: { src: `${IMG}theme-01-superjunction.webp`, mode: 'key', alt: 'Silicon carbide wafer patterned with power-device chips' },
      pattern: 'pillars',
      title: 'Superjunction devices',
      text: 'New drift-layer designs that let a power device block high voltage while conducting with low loss, including the charge sheet superjunction (CSSJ), proposed at IIT Madras by Prof. Shreepad Karmalkar, Dr. Akshay K. and S. Srikanth, and designs that tolerate manufacturing variations.',
      why: 'Higher-voltage devices that waste less power in electric vehicles and the grid.',
      papers: [
        { title: 'Quick design of a superjunction considering charge imbalance due to process variations', venue: 'IEEE Transactions on Electron Devices', year: 2020, doi: '10.1109/TED.2020.2998443' },
        { title: 'Charge sheet super junction in 4H-silicon carbide: practicability, modeling and design', venue: 'IEEE Journal of the Electron Devices Society', year: 2020, doi: '10.1109/JEDS.2020.3021827' },
        { title: 'A novel 1.2 kV 4H-SiC charge sheet superjunction trench MOSFET', venue: 'Semiconductor Science and Technology', year: 2025, doi: '10.1088/1361-6641/ae2867' },
      ],
      people: ['Rachita Mohapatra', 'Wakar Hasan Kazi', 'Prof. Shreepad Karmalkar'],
    },
    {
      id: 'sic',
      heading: ['Silicon carbide', 'MOSFETs'],
      icon: 'chip',
      callouts: [['0.6 – 1.7 kV', 'SiC power MOSFETs'], ['Floating field rings', 'edge termination']],
      image: { src: `${IMG}theme-02-sic-mosfet.webp`, mode: 'key', alt: 'Silicon carbide power module for an EV inverter' },
      pattern: 'rings',
      title: 'Silicon carbide MOSFETs',
      text: 'Making 0.6–1.7 kV silicon carbide transistors more robust: edge termination with floating field rings, JFET-width optimisation, short-circuit withstand time and gate-oxide reliability.',
      why: 'Silicon carbide is replacing silicon in EV inverters and fast chargers, where devices must survive real-world faults.',
      papers: [
        { title: 'An algorithm to design floating field rings in SiC and Si power diodes and MOSFETs', venue: 'Solid-State Electronics', year: 2019, doi: '10.1016/j.sse.2019.03.025' },
        { title: 'Humidity and ring spacing variation tolerant design of a SiC power MOSFET using mirrored floating field rings', venue: 'Microelectronics Journal', year: 2025, doi: '10.1016/j.mejo.2025.106611' },
        { title: 'An analytical approach for optimizing the JFET width of a 1.2 kV 4H-SiC DMOSFET', venue: 'Physica Scripta', year: 2026, doi: '10.1088/1402-4896/ae5aec' },
      ],
      people: ['Mohith Sai Bathina', 'Wakar Hasan Kazi', 'Prof. Anant Agarwal'],
    },
    {
      id: 'dielectric',
      heading: ['Oxide', 'interfaces'],
      icon: 'layers',
      callouts: [['Al₂O₃ / SiO₂', 'interface charge'], ['Gate oxide', 'reliability']],
      image: { src: `${IMG}theme-03-oxide.png`, mode: 'key', alt: 'Oxide-coated test sample with an array of MOS capacitor contacts' },
      pattern: 'layers',
      title: 'Oxide interfaces',
      text: 'Fabricating and measuring Al₂O₃/SiO₂ layers on silicon and silicon carbide to understand interface charge and processing damage, the building block of CSSJ devices.',
      why: 'The gate oxide is a weak point of SiC transistors; understanding it makes devices last longer.',
      papers: [
        { title: 'Investigation of Al₂O₃/SiO₂ interface charge for the feasibility study of charge sheet super junction', venue: 'IEEE EDTM', year: 2025, doi: '10.1109/EDTM61175.2025.11040520' },
        { title: 'Gate oxide reliability enhancement of 4H-SiC trench MOSFETs using charge sheet super junction', venue: 'IEEE MIEL', year: 2025, doi: '10.1109/MIEL66332.2025.11261201' },
      ],
      people: ['Swadhin Kumar Jena', 'Prof. P. V. Satyam'],
    },
    {
      id: 'sensors',
      heading: ['Chemical and', 'gas sensors'],
      icon: 'sensor',
      callouts: [['Trace-level SO₂', '2D-MoS₂ thin-film transistor'], ['Isoprene', 'simulated diabetic breath']],
      image: { src: `${IMG}theme-04-gas-sensor.webp`, mode: 'key', alt: 'Semiconductor gas-sensor chip on a TO header' },
      pattern: 'lattice',
      title: 'Chemical and gas sensors',
      text: 'Transistor and nanoparticle sensors for trace-level SO₂ and isoprene in simulated diabetic breath, and conductance spectroscopy for highly selective chemical detection.',
      why: 'Detecting gases at trace levels matters for air-quality and medical monitoring.',
      papers: [
        { title: 'A 2D-MoS₂-based thin-film transistor for trace-level SO₂ monitoring', venue: 'IEEE Transactions on Electron Devices', year: 2025, doi: '10.1109/TED.2024.3492155' },
        { title: 'In₂O₃ nanoparticles for trace-level isoprene detection in simulated diabetic breath', venue: 'IEEE Sensors Journal', year: 2025, doi: '10.1109/JSEN.2025.3601813' },
        { title: 'Conductance spectroscopy: a novel technique for ultra-selective chemical detection', venue: 'IEEE Sensors Journal', year: 2024, doi: '10.1109/JSEN.2024.3488531' },
      ],
      people: ['Dr. Sayan Dey’s group'],
    },
    {
      id: 'memory',
      heading: ['Memory and', 'other devices'],
      icon: 'chip',
      callouts: [['3D NAND', 'flash memory'], ['Ultra-low', 'conduction loss']],
      image: { src: `${IMG}theme-05-memory.webp`, mode: 'key', alt: 'NAND flash memory chip in a BGA package' },
      pattern: 'stack',
      title: 'Memory and other devices',
      text: 'TCAD studies of string-current variability in 3D-NAND flash memory, and silicon switches with ultra-low conduction loss.',
      why: 'Memory chips and efficient switches are inside everyday electronics.',
      papers: [
        { title: 'TCAD based study of string current variability in 3D NAND flash memory', venue: 'VLSID', year: 2025, doi: '10.1109/VLSID64188.2025.00057' },
        { title: 'String current variability in 3D-NAND flash memory: a TCAD simulation study', venue: 'ECAI', year: 2025, doi: '10.1109/ECAI65401.2025.11095610' },
        { title: 'Silicon switches with ultra-low conduction loss for low frequency switching applications', venue: 'PECTEA', year: 2025, doi: '10.1109/PECTEA61788.2025.11076547' },
      ],
      people: ['Wakar Hasan Kazi'],
    },
  ],
}

// Capabilities: tools and facilities. From the CV and faculty page (official); tool purposes are
// the standard use of each tool. The NaMo Lab role and INUP-i2i dates are unconfirmed, so left out.
export const researchCapabilities = {
  eyebrow: 'Capabilities',
  title: ['From simulation', 'to the ', 'lab'], // last part is set in italic
  intro: 'The tools and facilities behind each design: process and device simulation, layout, fabrication and power-device characterisation.',
  stat: { value: '₹1.5 Cr+', label: 'Research grants and consultancy secured as Professor-in-Charge of the IDEA Lab' },
  // the same tools, grouped by where they sit in the work, from first idea to measured device
  stages: [
    {
      name: 'Model',
      text: 'Analytical models and quick circuit checks before any detailed simulation.',
      tools: [
        { name: 'MATLAB', tag: 'Models' },
        { name: 'LTSpice', tag: 'Circuits' },
      ],
      where: 'IDEA Lab workstations',
    },
    {
      name: 'Simulate',
      text: 'Process and device simulation (TCAD) of each design before it is built.',
      tools: [
        { name: 'Silvaco Atlas', tag: 'Device' },
        { name: 'Silvaco Athena', tag: 'Process' },
        { name: 'Synopsys Sentaurus', tag: 'Process · device' },
      ],
      where: 'IDEA Lab workstations',
    },
    {
      name: 'Lay out and build',
      text: 'Circuit and mask layout, then fabrication of test devices.',
      tools: [
        { name: 'Cadence Virtuoso', tag: 'Layout' },
        { name: 'KLayout', tag: 'Masks' },
      ],
      where: 'Micro Fabrication and Characterization Lab · IIT Bombay Nanofabrication Facility',
    },
    {
      name: 'Measure',
      text: 'Electrical characterisation of devices, then statistics and analysis of the data.',
      tools: [
        { name: 'Keithley ACS Suite', tag: 'Characterisation' },
        { name: 'Power-device test equipment', tag: 'Characterisation' },
        { name: 'JMP · Origin', tag: 'Analysis' },
      ],
      where: 'IDEA Lab',
    },
  ],
  labs: [
    { name: 'IDEA Lab', place: 'IIT Bhubaneswar', role: 'Professor-in-Charge since Jul 2024', text: 'High-end workstations and power-device characterisation equipment.' },
    { name: 'Micro Fabrication and Characterization Lab', place: 'IIT Bhubaneswar', role: 'Professor-in-Charge since May 2024', text: 'Device fabrication and characterisation on campus.' },
    { name: 'IIT Bombay Nanofabrication Facility', place: 'Through INUP-i2i', role: 'Principal Investigator', text: 'Facilities and consumables to study Al₂O₃/SiO₂ interfaces on silicon carbide.' },
  ],
}

// Ongoing funded projects, all with Dr. Akshay as PI (faculty page, CV, department projects page).
// The iVP amount differs between sources, so none is shown. INUP-i2i (dates conflict) and the
// NaMo Lab (role unconfirmed) are left out. Dates are 'YYYY-MM'.
export const researchProjects = {
  eyebrow: 'Current projects',
  title: ['Funded research,', 'in progress'], // second line is set in italic
  intro: 'Three ongoing projects, each led by Dr. Akshay K. as Principal Investigator, from power-device design to devices for electric vehicles.',
  axis: ['2025-01', '2029-01'], // span of the timeline
  projects: [
    {
      funder: 'ANRF',
      kind: 'Research grant',
      title: 'Design and Characterization of SiC Trench MOSFETs for Next Generation Power Electronic Applications',
      amount: '₹72 lakh',
      start: '2025-03',
      end: '2028-03',
    },
    {
      funder: 'iVP Semiconductor',
      kind: 'Consultancy project',
      title: 'Design and Development of Si MOSFETs for EV Application',
      amount: null,
      start: '2025-04',
      end: '2027-04',
      note: 'Linked to the SemiX-IIT Bombay, IIT Bhubaneswar and iVP Semiconductor MoU signed in January 2025.',
    },
    {
      funder: 'IIT Bhubaneswar',
      kind: 'Institute grant',
      title: 'Simulation, Design and Feasibility Investigation of Superjunction based Power Devices in 4H-SiC Material',
      amount: '₹20 lakh',
      start: '2025-10',
      end: '2027-10',
    },
  ],
}

// Closing call to action. Paths and topics come from the official Ph.D./MS(R) admissions listing
// (Power Semiconductor Devices) and the faculty-page biography.
export const researchJoin = {
  eyebrow: 'Work with us',
  title: ['Build the next', 'power device', ' with us'], // middle part is set in italic
  // the italic words take turns in the heading, starting with title[1]; all are the group's themes
  words: ['power device', 'SiC MOSFET', 'superjunction', 'gas sensor', 'memory device'],
  intro: 'The D-MOS group at IIT Bhubaneswar works with Ph.D. scholars, students and industry on power semiconductor devices, from TCAD to the lab.',
  paths: [
    {
      id: 'phd',
      title: 'Ph.D. and MS (Research)',
      lead: 'Apply through IIT Bhubaneswar’s Ph.D. and MS (Research) admissions. Dr. Akshay K. is listed under Power Semiconductor Devices.',
      label: 'Listed research topics',
      points: [
        'Two- and three-terminal power devices in silicon and silicon carbide',
        'Novel device architectures in wide bandgap semiconductors',
        'Active area and edge termination design',
        'Process-variation-aware and reliability-aware design',
        'Process deck creation and layout of power devices',
      ],
      cta: { label: 'Admissions: research areas', href: 'https://secs.iitbbs.ac.in/index.php/broad-research-areas-ph-d-and-ms-r-admission/' },
    },
    {
      id: 'students',
      title: 'Masters and bachelors students',
      lead: 'Besides its four Ph.D. scholars, the group works with several masters and bachelors students at IIT Bhubaneswar.',
      label: 'Where students work',
      points: ['TCAD process and device simulation', 'Power-device and sensor characterisation', 'Projects within the five research themes'],
      cta: { label: 'Write to Dr. Akshay K.', href: 'mailto:akshay@iitbbs.ac.in' },
    },
    {
      id: 'industry',
      title: 'Industry and collaborators',
      lead: 'The group actively engages with leading power semiconductor companies for their research and development requirements.',
      label: 'What the group offers',
      points: ['TCAD-based process design', 'Advanced characterisation of power semiconductor devices and sensors', 'Consultancy, as with iVP Semiconductor'],
      cta: { label: 'Start a conversation', href: 'mailto:akshay@iitbbs.ac.in' },
    },
  ],
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
