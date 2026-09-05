/**
 * media.js — placeholder photography.
 *
 * ⚠️ EVERY IMAGE IN THIS FILE IS A PLACEHOLDER. They are curated Unsplash photographs
 * standing in for real Baraka School photography. When the school supplies its own images,
 * replace the `path`/`aspect` of each entry here — the rest of the site imports these by
 * name and needs no other change. Nothing outside this file may hard-code a photo URL.
 *
 * Each entry carries alt text that honestly describes the placeholder image that is actually
 * on screen. When a photo is swapped, its alt text must be rewritten to match.
 *
 * Real, CMS-managed photography (news covers, gallery images, the hero when the
 * `hero_image_url` setting is set) comes from the API and never from this file.
 */

/** Widths generated for every srcset. */
const WIDTHS = [480, 768, 1024, 1440, 1920]

const UNSPLASH = 'https://images.unsplash.com'

/**
 * Build one image descriptor.
 *
 * @param {object} spec
 * @param {string} spec.path      Unsplash photo path, e.g. 'photo-1509062522246-3755977927d7'
 * @param {string} spec.alt       descriptive alt text for the image as it actually looks
 * @param {[number, number]} [spec.aspect] intrinsic aspect ratio, defaults to 3:2
 * @param {number[]} [spec.widths]
 * @returns {{ src: string, srcSet: string, width: number, height: number,
 *             aspect: string, alt: string }}
 */
function photo({ path, alt, aspect = [3, 2], widths = WIDTHS }) {
  const ratio = aspect[0] / aspect[1]
  const url = (w) =>
    `${UNSPLASH}/${path}?auto=format&fit=crop&q=70&w=${w}&h=${Math.round(w / ratio)}`
  const largest = widths[widths.length - 1]

  return {
    src: url(largest),
    srcSet: widths.map((w) => `${url(w)} ${w}w`).join(', '),
    width: largest,
    height: Math.round(largest / ratio),
    aspect: `${aspect[0]} / ${aspect[1]}`,
    alt,
  }
}

/**
 * The placeholder library. Spread an entry straight into `<Img>`:
 *
 *   <Img {...media.hero} sizes="100vw" priority />
 *   <Img {...media.scienceGlassware} sizes="(min-width: 768px) 50vw, 100vw" />
 */
export const media = {
  /* ---------------------------------------------------------- hero & campus */

  hero: photo({
    path: 'photo-1509062522246-3755977927d7',
    aspect: [16, 9],
    alt: 'A teacher standing at a whiteboard in front of a class of learners seated at their desks.',
  }),

  campusBuilding: photo({
    path: 'photo-1562774053-701939374585',
    aspect: [16, 9],
    alt: 'A large school building set back behind a wide, well-kept green lawn.',
  }),

  schoolGrounds: photo({
    path: 'photo-1541675154750-0444c7d51e8e',
    aspect: [3, 4],
    alt: 'A paved path with shallow steps rising between trees on a misty morning.',
  }),

  signLoveToLearn: photo({
    path: 'photo-1546410531-bb4caa6b424d',
    aspect: [3, 2],
    alt: 'A pencil-shaped sign reading “Love to learn” mounted on a low wall outside a school.',
  }),

  /* ---------------------------------------------------------- classrooms */

  classroomHands: photo({
    path: 'photo-1577896851231-70ef18881754',
    aspect: [3, 2],
    alt: 'A teacher at a blackboard while a pupil in a full classroom raises a hand to answer.',
  }),

  classroomStudents: photo({
    path: 'photo-1571260899304-425eee4c7efc',
    aspect: [3, 2],
    alt: 'Learners working at their desks in a bright classroom, one standing with books under her arm.',
  }),

  classroomEmpty: photo({
    path: 'photo-1580582932707-520aed937b7b',
    aspect: [16, 9],
    alt: 'An empty classroom with rows of wooden desks facing a green chalkboard.',
  }),

  teacherWhiteboard: photo({
    path: 'photo-1580894732444-8ecded7900cd',
    aspect: [3, 2],
    alt: 'A smiling teacher standing beside a whiteboard mid-lesson.',
  }),

  lectureRoom: photo({
    path: 'photo-1524178232363-1fb2b075b655',
    aspect: [3, 2],
    alt: 'A speaker addressing a seated audience in a panelled meeting room.',
  }),

  hallSeats: photo({
    path: 'photo-1519452575417-564c1401ecc0',
    aspect: [3, 2],
    alt: 'Rows of empty wooden seats in a large, light-filled hall.',
  }),

  /* ---------------------------------------------------------- early years */

  earlyYearsTable: photo({
    path: 'photo-1588072432836-e10032774350',
    aspect: [3, 2],
    alt: 'Young children colouring and writing together at a shared classroom table.',
  }),

  earlyYearsDrawing: photo({
    path: 'photo-1511949860663-92c5c57d48a7',
    aspect: [3, 2],
    alt: "A child's hands colouring in drawings with pencil crayons spread across a wooden table.",
  }),

  learnerWriting: photo({
    path: 'photo-1560785496-3c9d27877182',
    aspect: [3, 2],
    alt: 'A young boy writing in an exercise book at a wooden table.',
  }),

  learnerReadingOutdoors: photo({
    path: 'photo-1472162072942-cd5147eb3902',
    aspect: [3, 2],
    alt: 'A laughing young boy sitting on an outdoor bench with an open book on his lap.',
  }),

  deskStillLife: photo({
    path: 'photo-1503676260728-1c00da094a0b',
    aspect: [3, 2],
    alt: 'An apple resting on a stack of books beside coloured pencils and alphabet blocks.',
  }),

  /* ---------------------------------------------------------- academics */

  studentsCollaborating: photo({
    path: 'photo-1522202176988-66273c2fd55f',
    aspect: [3, 2],
    alt: 'Three students laughing together around a table spread with laptops and notebooks.',
  }),

  scienceGlassware: photo({
    path: 'photo-1532094349884-543bc11b234d',
    aspect: [3, 2],
    alt: 'Laboratory beakers and conical flasks arranged on a clean white bench.',
  }),

  mathsWhiteboard: photo({
    path: 'photo-1596495577886-d920f1fb7238',
    aspect: [3, 2],
    alt: 'A hand writing a mathematical equation on a whiteboard in black marker.',
  }),

  mathsTextbook: photo({
    path: 'photo-1509228468518-180dd4864904',
    aspect: [3, 2],
    alt: 'A printed page of simultaneous equations in a mathematics textbook.',
  }),

  craftMaterials: photo({
    path: 'photo-1452860606245-08befc0ff44b',
    aspect: [3, 2],
    alt: 'Craft materials — tape, scissors, a cutting mat and sticky notes — laid out on a blue desk.',
  }),

  /* ---------------------------------------------------------- library */

  libraryAisle: photo({
    path: 'photo-1427504494785-3a9ca7044f45',
    aspect: [3, 2],
    alt: 'A student carrying a backpack walking between tall library shelves.',
  }),

  libraryShelves: photo({
    path: 'photo-1524995997946-a1c2e315a42f',
    aspect: [3, 2],
    alt: 'Curved wooden library shelves packed with brightly bound books.',
  }),

  bookStack: photo({
    path: 'photo-1497633762265-9d179a990aa6',
    aspect: [3, 2],
    alt: 'A close-up of a neat stack of hardback books with colourful spines.',
  }),

  bookShelfHand: photo({
    path: 'photo-1513475382585-d06e58bcb0e0',
    aspect: [3, 2],
    alt: 'A hand reaching up to pull a book from a shelf of colourful spines.',
  }),

  /* ---------------------------------------------------------- sport & occasions */

  athleticsStart: photo({
    path: 'photo-1461896836934-ffe607ba8211',
    aspect: [3, 2],
    alt: 'A sprinter crouched in the starting blocks of a red running track holding a relay baton.',
  }),

  runnersDawn: photo({
    path: 'photo-1552674605-db6ffd4facb5',
    aspect: [3, 2],
    alt: 'Three runners silhouetted against a deep blue dawn sky as they run along a road.',
  }),

  graduation: photo({
    path: 'photo-1541339907198-e08756dedf3f',
    aspect: [3, 2],
    alt: 'Graduates in gowns throwing their mortarboards into the air at sunset.',
  }),
}

/**
 * A convenient ordered subset for the homepage photo strip and any gallery teaser that has
 * to render before real images exist.
 * @type {Array<{ src: string, srcSet: string, width: number, height: number, aspect: string, alt: string }>}
 */
export const strip = [
  media.earlyYearsTable,
  media.classroomHands,
  media.scienceGlassware,
  media.athleticsStart,
  media.libraryShelves,
  media.craftMaterials,
]

export default media
