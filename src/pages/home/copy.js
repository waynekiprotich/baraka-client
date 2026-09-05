/**
 * copy.js — homepage-only editorial copy.
 *
 * Section headings, eyebrows and standfirsts for the ten homepage bands. Every factual
 * claim made here is traceable to SPEC §2 ("Content — source of truth") or to a value in
 * `content/site.js`; nothing in this file may assert a statistic, award, facility, date or
 * promise the school has not supplied.
 *
 * Where a fact already exists as a `site.js` export (the mission, the levels, the motto,
 * the teaching philosophy, the sports list) the band imports it directly rather than
 * restating it here — one wording, one place to correct it.
 *
 * This file is owned by the homepage. Shared copy belongs in `content/site.js`.
 */

/** Band 2 — the asymmetric introduction. */
export const intro = {
  eyebrow: 'Welcome',
  heading: 'A day school built around the child',
  statsLabel: 'Baraka School at a glance',
}

/** Band 3 — why parents choose Baraka. Bodies are assembled in the band from site.js facts. */
export const why = {
  eyebrow: 'Why Baraka',
  heading: 'Three things a parent notices first',
  reasons: [
    { id: 'mastery', icon: 'compass', title: 'Taught to mastery, not to the calendar' },
    { id: 'class-size', icon: 'users', title: 'Small classes, specialist teaching' },
    { id: 'character', icon: 'heart', title: 'Character carried forward' },
  ],
}

/** Band 4 — the academic split. */
export const academics = {
  eyebrow: 'Academics',
  heading: 'Four levels, one continuous path',
  lead: 'From a first day in Playgroup to a senior-school place, every stage is built on the one before it.',
  action: 'Explore academics',
}

/** Band 5 — school life. */
export const schoolLife = {
  eyebrow: 'School life',
  heading: 'The hours either side of the lesson',
  action: 'Inside school life',
}

/** Band 6 — facilities. Only spaces and programmes named in SPEC §2 appear here. */
export const facilities = {
  eyebrow: 'Facilities',
  heading: 'Rooms that teach as much as the timetable',
  lead: 'The school has grown its grounds deliberately, one purpose-built space at a time.',
}

/** Band 7 — the gallery teaser. */
export const photography = {
  eyebrow: 'Photography',
  heading: 'A term at Baraka, in pictures',
  action: 'View the gallery',
  emptyTitle: 'No photographs published yet',
  emptyDescription:
    'The school has not added images to the gallery yet. They will appear here as soon as it does.',
}

/** Band 8 — news and events. */
export const newsroom = {
  eyebrow: 'Noticeboard',
  heading: 'Latest news & upcoming events',
  newsHeading: 'From the newsroom',
  eventsHeading: 'Upcoming events',
  action: 'All news & events',
  newsEmptyTitle: 'No news published yet',
  newsEmptyDescription: 'School announcements will be posted here as they are published.',
  eventsEmptyTitle: 'Nothing in the diary yet',
  eventsEmptyDescription:
    'There are no upcoming events on the calendar right now. Past events are listed on the news page.',
}

/** Band 9 — the closing admissions call to action. */
export const admissionsCta = {
  heading: 'Come and see the school for yourself',
  primary: 'Apply now',
  secondary: 'Book a visit',
}
