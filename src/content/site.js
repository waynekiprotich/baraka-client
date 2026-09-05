/**
 * site.js — the single source of static site content.
 *
 * Everything here is transcribed from SPEC §2 ("Content — source of truth"). Nothing in this
 * file may be invented: no new statistics, awards, testimonials, staff names, fee figures,
 * dates or claims. If a page needs a fact that is not here, it is not a fact yet — flag it as
 * a placeholder instead.
 *
 * Values that the school must be able to change without a developer (phone, e-mail, address,
 * socials, hero copy) live in the CMS as SiteSetting rows and are read through
 * `useSettings()`. The `defaultSettings` export below is only the fallback used before that
 * request resolves — never render it as if it were authoritative for contact details.
 */

/* ------------------------------------------------------------------ identity */

/**
 * Fixed identity facts. These do not change and are not CMS-managed.
 * @type {{name: string, shortName: string, descriptor: string, curriculum: string,
 *         gradeRange: string, founded: number, motto: string, mottoMeaning: string,
 *         mission: string, vision: string, positioning: string, founding: string,
 *         runningHeartland: string}}
 */
export const school = {
  name: 'Baraka School Kapsabet',
  shortName: 'Baraka School',
  descriptor: 'premium private mixed day school',
  curriculum: 'CBC (Competency-Based Curriculum)',
  gradeRange: 'Playgroup → Grade 9',
  founded: 2011,
  motto: '“Baraka” — Blessing.',
  mottoMeaning:
    'Every learner who passes through our gates carries and gives forward a blessing to their community.',
  mission:
    'To nurture confident, principled learners equipped with the knowledge, skills and character to lead in their communities and beyond.',
  vision: "To be East Africa's benchmark for holistic, values-driven day-school education.",
  positioning: 'Nurturing Excellence, Character & Future Leaders',
  founding:
    'Baraka School opened in 2011 with two classrooms and forty pupils, founded by a group of Nandi County educators who wanted a local alternative to the boarding-school pipeline.',
  // Use this angle once, well — do not overplay it.
  runningHeartland:
    'Kapsabet is Kenya’s running heartland. Our learners train on the same soil that shaped Olympic champions.',
}

/* ------------------------------------------------------------------ navigation */

/**
 * Primary navigation (SPEC §4). The gold "Apply" button is rendered separately by the header
 * and is not part of this list.
 * @type {Array<{label: string, to: string}>}
 */
export const nav = [
  { label: 'About', to: '/about' },
  { label: 'Academics', to: '/academics' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'School Life', to: '/school-life' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'News', to: '/news' },
  { label: 'Contact', to: '/contact' },
]

/** The header/footer call to action. */
export const applyCta = { label: 'Apply', to: '/admissions#apply' }

/**
 * Footer link columns. Only routes that exist — no dead links, ever.
 * @type {Array<{title: string, links: Array<{label: string, to: string}>}>}
 */
export const footerNav = [
  {
    title: 'The school',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Academics', to: '/academics' },
      { label: 'School life', to: '/school-life' },
      { label: 'Gallery', to: '/gallery' },
    ],
  },
  {
    title: 'Admissions',
    links: [
      { label: 'How to apply', to: '/admissions#process' },
      { label: 'Fees', to: '/admissions#fees' },
      { label: 'Questions', to: '/admissions#faq' },
      { label: 'Enquire', to: '/admissions#apply' },
    ],
  },
  {
    title: 'Stay in touch',
    links: [
      { label: 'News & events', to: '/news' },
      { label: 'Contact us', to: '/contact' },
      { label: 'Visit the school', to: '/contact#visit' },
    ],
  },
]

/* ------------------------------------------------------------------ settings */

/**
 * Canonical SiteSetting keys read by the public site. The backend seeds these rows; the
 * frontend must never hard-code the values they hold.
 */
export const SETTINGS_KEYS = {
  schoolName: 'school_name',
  tagline: 'tagline',
  heroTitle: 'hero_title',
  heroSubtitle: 'hero_subtitle',
  heroImageUrl: 'hero_image_url',
  contactPhone: 'phone',
  contactEmail: 'email',
  admissionsEmail: 'admissions_email',
  addressStreet: 'address_line1',
  addressLocality: 'address_locality',
  addressRegion: 'address_region',
  officeHours: 'office_hours',
  geoLat: 'geo_lat',
  geoLng: 'geo_lng',
  mapEmbedUrl: 'map_embed_url',
  socialFacebook: 'facebook_url',
  socialInstagram: 'instagram_url',
  socialYoutube: 'youtube_url',
}

/**
 * Fallback values used only until `GET /settings` resolves (and if it fails).
 *
 * The keys here MUST match the `SiteSetting` keys the API serves — a name that does not
 * exist server-side can never be overridden, so the CMS would silently stop working.
 * Contact details are the SPEC §2 values; the phone number is a flagged placeholder, and
 * anything the school has not supplied (office hours) stays empty rather than invented.
 * @type {Object<string, string>}
 */
export const defaultSettings = {
  school_name: school.name,
  tagline: school.positioning,
  hero_title: school.name,
  hero_subtitle: school.positioning,
  hero_image_url: '',
  phone: '+254 700 123456',
  email: 'info@barakaschoolkapsabet.ac.ke',
  admissions_email: 'admissions@barakaschoolkapsabet.ac.ke',
  address_line1: 'Kapsabet–Eldoret Road',
  address_locality: 'Kapsabet',
  address_region: 'Nandi County',
  office_hours: '',
  geo_lat: '0.2017',
  geo_lng: '35.1053',
  map_embed_url: '',
  facebook_url: 'https://facebook.com/barakaschoolkapsabet',
  instagram_url: 'https://instagram.com/barakaschoolkapsabet',
}

/**
 * Social accounts. `settingsKey` names the SiteSetting row that holds the live URL.
 * @type {Array<{id: string, label: string, settingsKey: string}>}
 */
export const socials = [
  { id: 'facebook', label: 'Facebook', settingsKey: 'facebook_url' },
  { id: 'instagram', label: 'Instagram', settingsKey: 'instagram_url' },
  { id: 'youtube', label: 'YouTube', settingsKey: 'youtube_url' },
]

/* ------------------------------------------------------------------ academics */

/**
 * The four academic levels, in order.
 * @type {Array<{id: string, name: string, ages: string, summary: string, focus: string[],
 *               note: string|null}>}
 */
export const levels = [
  {
    id: 'early-years',
    name: 'Early Years',
    ages: 'Playgroup & Pre-Primary · ages 2–5',
    summary:
      'Play-based learning that builds social confidence and motor skills before formal schooling begins.',
    focus: ['Creative Arts', 'Nature & Play', 'Digital Explorers', 'Values & Character'],
    note: null,
  },
  {
    id: 'lower-primary',
    name: 'Lower Primary',
    ages: 'Grades 1–3',
    summary:
      'Play-anchored competency foundations in literacy, numeracy and creative arts.',
    focus: ['Language development', 'Environmental activities', 'Movement & music'],
    note: 'Class size capped at 24, with a class teacher and an aide.',
  },
  {
    id: 'upper-primary',
    name: 'Upper Primary',
    ages: 'Grades 4–6',
    summary:
      'Subject-based teaching with specialist teachers for sciences, maths and languages.',
    focus: ['Critical thinking', 'Project work', 'Introductory computer studies'],
    note: 'Continuous competency-based assessment aligned to national CBC standards.',
  },
  {
    id: 'junior-school',
    name: 'Junior School',
    ages: 'Grades 7–9',
    summary:
      'Pathway exploration across STEM, Social Sciences and Arts & Sports Science.',
    focus: ['Career guidance', 'Leadership programmes', 'Senior-school placement prep'],
    note: '98% transition to first-choice senior school.',
  },
]

/**
 * The eight teaching departments.
 * @type {Array<{name: string, description: string}>}
 */
export const departments = [
  { name: 'Mathematics', description: 'Numeracy built through reasoning, not memorisation.' },
  { name: 'Sciences', description: 'Hands-on labs from Grade 4 onward.' },
  { name: 'Languages', description: 'English, Kiswahili and communication skills.' },
  { name: 'Computer Studies', description: 'Coding, typing and digital citizenship.' },
  { name: 'Social Studies', description: 'Citizenship, geography and Kenyan history.' },
  { name: 'Creative Arts', description: 'Music, art and design across every grade.' },
  { name: 'Agriculture', description: 'Practical farming in our own school garden.' },
  {
    name: 'Religious Education',
    description: 'Christian values integrated with academic life.',
  },
]

/**
 * How teaching works here.
 * @type {{statement: string, practices: string[]}}
 */
export const teachingPhilosophy = {
  statement:
    'Children are taught to mastery, not to the calendar. Lessons move at the pace of understanding, and competency is tracked individually rather than against a class average.',
  practices: [
    'Inquiry-first lesson design',
    'Regular one-on-one learner check-ins',
    'Parents briefed each term with a written progress narrative',
  ],
}

/** Digital learning position. */
export const digitalLearning =
  'Every classroom is equipped for supervised digital learning — from Grade 4 coding clubs through to Junior School research skills — paired with clear screen-time guidelines.'

/**
 * The school year.
 * @type {Array<{term: string, start: string, end: string, label: string}>}
 */
export const termDates = [
  { term: 'Term 1', start: '6 Jan', end: '4 Apr', label: 'Term 1 — 6 Jan to 4 Apr' },
  { term: 'Term 2', start: '28 Apr', end: '25 Jul', label: 'Term 2 — 28 Apr to 25 Jul' },
  { term: 'Term 3', start: '18 Aug', end: '14 Nov', label: 'Term 3 — 18 Aug to 14 Nov' },
]

/* ------------------------------------------------------------------ figures */

/**
 * School-supplied figures. Render as a thin lined band, never as stat tiles, and never
 * animate them on scroll (SPEC §3).
 * @type {Array<{value: string, label: string}>}
 */
export const figures = [
  { value: '640+', label: 'Learners' },
  { value: '58+', label: 'Teaching staff' },
  { value: '15+', label: 'Years running' },
  { value: '1:18', label: 'Teacher–learner ratio' },
]

/** The academic-results figures, kept separate so pages can choose which band to show. */
export const resultsFigures = [
  { value: '98%', label: 'KCPE mean transition' },
  { value: '72%', label: 'Distinction rate' },
  { value: '9', label: 'County top performers' },
  { value: '24', label: 'Lower Primary class cap' },
]

/* ------------------------------------------------------------------ story */

/**
 * Timeline of the school, oldest first.
 * @type {Array<{year: string, title: string, detail: string}>}
 */
export const milestones = [
  {
    year: '2011',
    title: 'Baraka School Kapsabet opens',
    detail: 'Two classrooms, forty pupils and a bold idea about a day school.',
  },
  {
    year: '2015',
    title: 'First KCPE candidates graduate',
    detail: "Founding cohort posts results in the county's top tier.",
  },
  {
    year: '2019',
    title: 'New science and ICT block opens',
    detail: 'Purpose-built labs double practical-learning capacity.',
  },
  {
    year: '2023',
    title: 'Full CBC transition completed',
    detail: 'Every grade fully aligned to the Competency-Based Curriculum.',
  },
  {
    year: '2026',
    title: '640+ learners, 58+ staff',
    detail: "One of Nandi County's most sought-after day schools.",
  },
]

/**
 * Named leadership, with their quotes exactly as supplied. Do not add people.
 * @type {Array<{name: string, role: string, quote: string}>}
 */
export const leadership = [
  {
    name: 'Mrs. Ruth Chepkoech',
    role: 'Founding Director',
    quote:
      'Every parent who walks through our gates is trusting us with something irreplaceable. We take that seriously — in the standard of our teaching, and in the warmth of how we treat every child who studies here.',
  },
  {
    name: 'Mr. Samuel Kiptoo',
    role: 'Headteacher',
    quote:
      "Academic results matter, and ours speak for themselves. But what I'm proudest of is watching a shy Grade 3 pupil become a confident Junior School debate captain. That transformation is the real Baraka story.",
  },
]

/* ------------------------------------------------------------------ school life */

/**
 * Sports on offer.
 * @type {Array<{name: string, detail: string}>}
 */
export const sports = [
  { name: 'Athletics', detail: 'Track and field.' },
  { name: 'Football', detail: 'Inter-house leagues and county tournaments.' },
  { name: 'Volleyball & Netball', detail: 'Upper Primary and Junior School teams.' },
  { name: 'Swimming basics', detail: 'Water-safety and beginner lessons each term.' },
]

/**
 * The six named clubs. Site copy elsewhere refers to twelve clubs in total; only these six
 * are named, so only these six may be listed.
 * @type {Array<{name: string}>}
 */
export const clubs = [
  { name: 'Little Explorers' },
  { name: 'Clay Modeling' },
  { name: 'Puppet Theatre' },
  { name: 'STEM & Coding' },
  { name: 'Scouts' },
  { name: 'Debate Society' },
]

/**
 * Arts programmes.
 * @type {Array<{name: string, detail: string}>}
 */
export const arts = [
  { name: 'Music & Choir', detail: 'Annual Music Festival.' },
  { name: 'Drama & Plays', detail: 'Termly learner-written productions.' },
  { name: 'Art Studio', detail: 'Open studio for painting, sculpture and design.' },
]

/**
 * Learner quotes, attributed exactly as supplied. No new ones may be added.
 * @type {Array<{name: string, grade: string, quote: string}>}
 */
export const studentVoices = [
  {
    name: 'Faith',
    grade: 'Grade 8',
    quote: 'Debate club taught me to disagree without being disagreeable.',
  },
  {
    name: 'Brian',
    grade: 'Grade 6',
    quote: 'I built my first working robot in the STEM club this year.',
  },
  {
    name: 'Naomi',
    grade: 'Grade 9',
    quote: "Running here feels different — like we're part of something bigger.",
  },
]

/* ------------------------------------------------------------------ admissions */

/** The intake currently open. Not a CMS setting — update it here each admissions cycle. */
export const intakeYear = '2027'

/**
 * The three-step admissions process.
 * @type {Array<{step: number, title: string, detail: string}>}
 */
export const admissionsSteps = [
  {
    step: 1,
    title: 'Submit an enquiry',
    detail: 'Use the form on this page or speak to the admissions office directly.',
  },
  {
    step: 2,
    title: 'Assessment & interview',
    detail: 'A short, friendly placement assessment for the learner and a conversation with parents.',
  },
  {
    step: 3,
    title: 'Offer & enrolment',
    detail: 'An offer letter, a deposit, and the place is confirmed.',
  },
]

/**
 * What a family needs to bring.
 * @type {string[]}
 */
export const admissionsRequirements = [
  'Completed application form',
  "Copy of the learner's birth certificate",
  'Most recent school report or transfer letter',
  'Immunisation record (Playgroup & Lower Primary)',
  'Two passport photographs',
]

/**
 * Indicative termly fees. A full itemised structure is shared at offer stage — say so
 * wherever this table is rendered.
 * @type {{note: string, columns: string[], rows: Array<{level: string, tuition: number,
 *          meals: number, transport: number}>}}
 */
export const fees = {
  note: 'Indicative termly fees. A full itemised structure is shared at offer stage.',
  columns: ['Level', 'Tuition (termly)', 'Meals', 'Transport (optional)'],
  rows: [
    { level: 'Playgroup — PP2', tuition: 28000, meals: 6000, transport: 4500 },
    { level: 'Lower Primary (Gr 1–3)', tuition: 34000, meals: 6500, transport: 4500 },
    { level: 'Upper Primary (Gr 4–6)', tuition: 38000, meals: 7000, transport: 5000 },
    { level: 'Junior School (Gr 7–9)', tuition: 44000, meals: 7500, transport: 5000 },
  ],
}

/**
 * Admissions FAQs.
 * @type {Array<{id: string, question: string, answer: string}>}
 */
export const faqs = [
  {
    id: 'waiting-list',
    question: 'Is there a waiting list?',
    answer:
      'Popular entry grades — Playgroup, Grade 1 and Grade 7 — do run waiting lists most years. Apply at least one term ahead.',
  },
  {
    id: 'bursaries',
    question: 'Do you offer bursaries or sibling discounts?',
    answer:
      'Yes. A 10% sibling discount applies from the second child enrolled, and a limited number of merit bursaries are awarded each year.',
  },
  {
    id: 'mid-year',
    question: 'Can my child join mid-year?',
    answer:
      'Mid-year transfers are welcome, subject to space and a short placement assessment.',
  },
  {
    id: 'transport',
    question: 'Is transport available from my area?',
    answer:
      'School buses cover most routes within Kapsabet town and the surrounding trading centres. Contact admissions to confirm your route.',
  },
]

/**
 * The grades a parent can apply for, for the enquiry form's select.
 * @type {string[]}
 */
export const gradeOptions = [
  'Playgroup',
  'PP1',
  'PP2',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
]

/* ------------------------------------------------------------------ honesty */

/**
 * Things the old site implied but that do not exist yet. Each must render as an honest
 * disabled/"coming soon" state or be wired to a real CMS value — never a dead `href="#"`.
 * @type {Array<{id: string, label: string, note: string}>}
 */
export const pendingItems = [
  {
    id: 'phone',
    label: 'Telephone number',
    note: 'The published number +254 700 123456 is a placeholder awaiting the school’s real line.',
  },
  {
    id: 'downloads',
    label: 'Downloadable PDFs',
    note: 'Application form, fee structure and academic calendar are not yet available to download.',
  },
  {
    id: 'video',
    label: 'School video',
    note: 'No school film has been produced yet.',
  },
  {
    id: 'virtual-tour',
    label: '360° virtual tour',
    note: 'Not yet produced.',
  },
  {
    id: 'map',
    label: 'Map embed',
    note: 'Rendered only when the `map_embed_url` setting holds a real URL.',
  },
]
