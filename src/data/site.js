// Content for the D-MOS group website.
// Source: "Dr. Akshay K. – Research information repository" (sources checked 2026-10-24).
// Only VERIFIED / OFFICIAL items are used. Items marked CONFIRM in that report (PCIM 2026 and
// IWPSD 2025 papers, NaMo Lab role, conflicting grant amounts, phone number) are left out
// until Dr. Akshay confirms them. Plain-language summaries written for the site are marked
// "editorial" below.

export const group = {
  name: 'D-MOS',
  fullName: 'D-MOS Research Group',
  institute: 'IIT Bhubaneswar',
  school: 'School of Electrical and Computer Sciences',
  email: 'akshay@iitbbs.ac.in',
  // IIT Bhubaneswar emblem recoloured for the dark theme (original colours: iitbbs-logo.svg)
  logo: '/images/iitbbs-logo-mono.svg',
  office: 'Room A-007, SECS, IIT Bhubaneswar',
  admissions: 'https://secs.iitbbs.ac.in/index.php/broad-research-areas-ph-d-and-ms-r-admission/',
}

export const navLinks = [
  { label: 'Research', href: '#research' },
  { label: 'People', href: '#people' },
  { label: 'Publications', href: '#publications' },
  { label: 'Collaborations', href: '#collaborations' },
  { label: 'News', href: '#news' },
  { label: 'Contact', href: '#contact' },
]

// Hero headline, split in two halves for the desktop join animation
export const hero = {
  left: 'Designing power',
  right: 'semiconductor devices',
  caption: 'D-MOS Research Group · School of Electrical and Computer Sciences · IIT Bhubaneswar',
}

// Who they are (from the official faculty-page biography) and why it matters (editorial)
export const intro = {
  lines: ['We design power semiconductor devices', 'in silicon and wide-bandgap materials,', 'from TCAD simulation to measurement.'],
  about:
    'The D-MOS research group at IIT Bhubaneswar, led by Dr. Akshay K., works on the design and development of power semiconductor devices based on silicon and wide / ultra-wide bandgap semiconductors. The group has TCAD-based process design and advanced characterisation capability for power devices and sensors, and works with leading power semiconductor companies on their research and development needs.',
  why: 'Power devices are the switches that convert electricity in electric vehicles, chargers and power electronics. Better devices waste less energy and last longer.',
}

export const stats = [
  { value: 16, label: 'Journal papers', note: 'IEEE TED, JEDS, Sensors Journal and more' },
  { value: 13, label: 'Conference papers', note: 'published; 4 more to appear' },
  { value: 4, label: 'Ph.D. scholars', note: 'plus masters & bachelors students' },
  { value: 3, label: 'Funded projects', note: 'ANRF · iVP Semiconductor · IIT BBS' },
]

// Department listing of the group's research area (verified)
export const researchIntro =
  'Two- and three-terminal power devices in silicon and silicon carbide, new device architectures in wide-bandgap semiconductors, edge termination, process-variation-aware design and reliability.'

// Themes grouped from his publications (editorial grouping; names pending Dr. Akshay's approval)
export const themes = [
  {
    id: 'cssj',
    code: '01',
    title: 'Superjunction devices',
    short: 'Superjunction',
    text: 'New drift-layer designs that let a power device block high voltage while conducting with low loss. Includes the charge sheet superjunction (CSSJ), proposed at IIT Madras by Prof. Shreepad Karmalkar, Dr. Akshay K. and S. Srikanth, and designs that tolerate manufacturing variations.',
    pattern: 'pillars',
  },
  {
    id: 'sic',
    code: '02',
    title: 'Silicon carbide MOSFETs',
    short: 'SiC MOSFETs',
    text: 'Making 0.6–1.7 kV silicon carbide transistors for electric vehicles and power electronics more robust: edge termination, JFET-width optimisation, short-circuit withstand time and gate-oxide reliability.',
    pattern: 'rings',
  },
  {
    id: 'dielectric',
    code: '03',
    title: 'Oxide interfaces',
    short: 'Interfaces',
    text: 'Fabricating and measuring Al₂O₃/SiO₂ layers on silicon and silicon carbide to understand interface charge and processing damage — the building block of CSSJ devices.',
    pattern: 'layers',
  },
  {
    id: 'sensors',
    code: '04',
    title: 'Chemical & gas sensors',
    short: 'Sensors',
    text: 'Transistor and nanoparticle sensors for trace-level SO₂ and isoprene in simulated diabetic breath, and conductance spectroscopy for highly selective detection, with Dr. Sayan Dey’s group.',
    pattern: 'lattice',
  },
  {
    id: 'memory',
    code: '05',
    title: 'Memory & other devices',
    short: '3D NAND',
    text: 'TCAD studies of string-current variability in 3D-NAND flash memory, low-loss silicon switches, and contacts on 2D MoS₂.',
    pattern: 'stack',
  },
]

// Ongoing projects led by Dr. Akshay as PI (official; amounts omitted where sources disagree)
export const projects = [
  {
    funder: 'ANRF',
    title: 'Design and characterisation of SiC trench MOSFETs for next-generation power electronics',
    period: '2025 – 2028',
  },
  {
    funder: 'iVP Semiconductor',
    title: 'Design and development of silicon MOSFETs for electric-vehicle applications',
    period: '2025 – 2027',
    note: 'Under the SemiX–IIT Bombay, IIT Bhubaneswar and iVP Semiconductor MoU',
  },
  {
    funder: 'IIT Bhubaneswar',
    title: 'Simulation, design and feasibility of superjunction power devices in 4H-SiC',
    period: '2025 – 2027',
  },
]

export const pi = {
  name: 'Dr. Akshay K.',
  photo: '/images/akshay-k.jpg',
  role: 'Assistant Professor (Grade I)',
  dept: 'Electronics & Communication Engineering, SECS, IIT Bhubaneswar',
  bio: 'Dr. Akshay K. is an Assistant Professor in the School of Electrical and Computer Sciences at IIT Bhubaneswar, where he leads the D-MOS research group. Before joining IIT Bhubaneswar he worked on next-generation 3D-NAND flash memory as a Senior Engineer at Micron Technology. He is also co-founder and Director of Nano Semic, a semiconductor startup at the IIT BBS Research Park.',
  facts: [
    { label: 'Education', value: 'Ph.D. with M.S., IIT Madras (2022) · B.Tech, NIT Calicut (2017)' },
    { label: 'Industry', value: 'Senior Engineer, Micron Technology (2022–23)' },
    { label: 'Startup', value: 'Co-founder & Director, Nano Semic (2024–)' },
    { label: 'Awards', value: 'Prime Minister’s Research Fellowship · Institute Research Award, IIT Madras · AWSAR Award, DST' },
  ],
  links: [
    { label: 'Google Scholar', href: 'https://scholar.google.co.in/citations?user=Eg-jYTgAAAAJ' ,src:"" },
    { label: 'ORCID', href: 'https://orcid.org/0000-0002-4339-9766' },
    { label: 'Faculty page', href: 'https://secs.iitbbs.ac.in/index.php/akshay/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/akshay-k-ak-8129066062/' },
  ],
}

export const scholars = [
  {
    name: 'Rachita Mohapatra',
    role: 'Ph.D. Scholar',
    department: 'ECE',
    college: "IIT Bhubaneswar",
    since: '2023',
    topic: 'SiC superjunction devices',
    scholar: 'https://scholar.google.com/citations?user=reX88yQAAAAJ',
  },
  {
    name: 'Wakar Hasan Kazi',
    role: 'Ph.D. Scholar',
    department: 'ECE',
    college: "IIT Bhubaneswar",
    since: '2024',
    topic: 'SiC superjunction devices',
    scholar: 'https://scholar.google.com/citations?user=sWqsa-sAAAAJ',
  },
  {
    name: 'Mohith Sai Bathina',
    role: 'Ph.D. Scholar',
    department: 'ECE',
    college: "IIT Bhubaneswar",
    since: '2025',
    topic: 'SiC MOSFET reliability',
    badge: 'Winner, IEEE EDS TCAD Hackathon 2026',
  },
  {
    name: 'Swadhin Kumar Jena',
    role: 'Ph.D. Scholar (Co-supervised)',
    department: 'Physics',
    college: "IIT Bhubaneswar",
    since: '2023',
    topic: 'Al₂O₃/SiO₂ layers on Si & SiC for power devices',
    scholar: 'https://scholar.google.com/citations?user=rFWsqNQAAAAJ',
  },
]

// Two latest papers and the two most cited (citation counts: Google Scholar, 24 Oct 2026)
export const publications = [
  {
    tag: 'Latest',
    year: 2026,
    title: 'An analytical approach for optimizing the JFET width of a 1.2 kV 4H-SiC DMOSFET',
    authors: 'P. Singh, R. V. Mylarisetty, W. H. Kazi, S. Karmalkar, Akshay K',
    venue: 'Physica Scripta',
    doi: '10.1088/1402-4896/ae5aec',
  },
  {
    tag: 'Latest',
    year: 2025,
    title: 'A novel 1.2 kV 4H-SiC charge sheet superjunction trench MOSFET: modeling, process design, and practicability',
    authors: 'R. Mohapatra, M. S. Bathina, S. K. Jena, G. P. Sushrutha, S. Dey, Akshay K',
    venue: 'Semiconductor Science and Technology',
    doi: '10.1088/1361-6641/ae2867',
  },
  {
    tag: 'Most cited · 26 citations',
    year: 2020,
    title: 'Quick design of a superjunction considering charge imbalance due to process variations',
    authors: 'K. Akshay, S. Karmalkar',
    venue: 'IEEE Transactions on Electron Devices',
    doi: '10.1109/TED.2020.2998443',
  },
  {
    tag: 'Most cited · 16 citations',
    year: 2021,
    title: 'Improved theoretical minimum of the specific on-resistance of a superjunction',
    authors: 'K. Akshay, S. Karmalkar',
    venue: 'Semiconductor Science and Technology',
    doi: '10.1088/1361-6641/abc921',
  },
]

export const collaborators = [
  { name: 'Prof. Shreepad Karmalkar', org: 'IIT Madras; now Director, IIT Bhubaneswar', note: 'Ph.D. advisor · superjunction & SiC design' ,src:"Collaborations/Shreepad Karmalkar.png"},
  { name: 'Prof. Anant Agarwal', org: 'The Ohio State University', note: 'SiC MOSFET drift-layer design', src:"Collaborations/Anant Agarwal.jfif" },
  { name: 'Dr. Sayan Dey', org: 'IIT Bhubaneswar · Nano Semic', note: 'Chemical & gas sensors' ,src:"Collaborations/Sayan Dey.png"},
  { name: 'Prof. P. V. Satyam', org: 'School of Basic Sciences, IIT Bhubaneswar', note: 'Al₂O₃/SiO₂ oxide interfaces' ,src:"Collaborations/P. V. Satyam.png" },
  { name: 'Dr. Abhinav Arya', org: 'IIT Bhubaneswar', note: 'Power devices industry centre proposal',src:"Collaborations/Abhinav Arya.png" },
]

// Funders, industry and academic partners (Micron is his former employer, not a partner)
export const partners = [
  'ANRF',
  'iVP Semiconductor',
  'SemiX · IIT Bombay',
  'INUP-i2i · IIT Bombay',
  'Nano Semic',
  'IIT Madras',
  'The Ohio State University',
]

// Newest first; the home page shows the first three
export const news = [
  {
    date: 'Jul 2026',
    title: 'Ph.D. scholar Mohith Sai Bathina is one of the three winners of the IEEE EDS TCAD Hackathon 2026',
    href: 'https://eds.ieee.org/education/competitions',
  },
  {
    date: 'Jun 2026',
    title: 'ArsenSafe, a hand-held arsenic detector, developed through Nano Semic, led by Dr. Sayan Dey and Dr. Akshay K.',
  },
  {
    date: 'Apr 2026',
    title: 'New paper in Physica Scripta on optimising the JFET width of a 1.2 kV SiC MOSFET',
    href: 'https://doi.org/10.1088/1402-4896/ae5aec',
  },
  {
    date: 'Dec 2025',
    title: 'New paper in Semiconductor Science and Technology on a 1.2 kV SiC charge sheet superjunction trench MOSFET',
    href: 'https://doi.org/10.1088/1361-6641/ae2867',
  },
  {
    date: 'Feb 2025',
    title: 'Proposal for an Industry Co-development Centre on Power Devices presented at IIT Bhubaneswar',
  },
  {
    date: 'Jan 2025',
    title: 'Tripartite MoU between SemiX-IIT Bombay, IIT Bhubaneswar and iVP Semiconductor to develop silicon power MOSFETs for EVs',
  },
]
