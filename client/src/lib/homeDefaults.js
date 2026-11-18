/**
 * Default landing-page copy. The API returns the same text from the Settings
 * model; these values keep the page and the admin form complete when a field
 * has never been saved.
 */
export const DEFAULT_HOME = {
  heroNote: 'Early career · open to junior full-stack roles',
  capabilitiesEyebrow: 'What I can build',
  capabilitiesTitle: 'Tools and evidence, not a list of languages.',
  capabilitiesIntro:
    'These are the things I can take from an idea to a working deployment. Every one of them appears in a project case study below.',
  capabilities: [
    {
      title: 'Applications with real accounts',
      body: 'Sign-in, protected routes and role checks, with hashed passwords and JWT sessions stored in httpOnly cookies.'
    },
    {
      title: 'APIs that hold up',
      body: 'Express endpoints with server-side validation, pagination, filtering and error responses a frontend can act on.'
    },
    {
      title: 'Data models that fit the product',
      body: 'MongoDB schemas with relationships and indexes chosen around the queries the app actually runs.'
    },
    {
      title: 'Shipped, not just local',
      body: 'Deployments to Render and Vercel, environment configuration, Cloudinary uploads and email notifications.'
    }
  ],
  workEyebrow: 'Selected work',
  workTitle: 'Case studies, not screenshots.',
  workIntro:
    'Each project explains the problem, what I personally built, and what went wrong along the way. Projects are labelled academic, personal, collaborative or freelance.',
  skillsEyebrow: 'Skills',
  skillsTitle: 'Grouped by where they sit in the stack.',
  skillsIntro:
    'Nothing here is a logo I have not used in a project. Categories, notes and ordering are managed from the dashboard.',
  writingEyebrow: 'Writing',
  writingTitle: 'Notes from building things.',
  writingIntro: 'Short, specific write-ups about problems I hit and how I solved them.',
  ctaEyebrow: 'Next step',
  ctaTitle: 'Looking for a junior developer who finishes what they start?',
  ctaBody:
    'I’m available for junior full-stack roles and small freelance builds. If you want to talk about a role, a project or a problem, send me a message — I reply within a day or two.',
  focusTitle: 'Where I work',
  focusRows: [
    { label: 'Frontend', text: 'React, responsive layouts, accessible forms' },
    { label: 'Backend', text: 'Express REST APIs, JWT sessions, validation' },
    { label: 'Data', text: 'MongoDB schemas, indexes, aggregation' }
  ],
  focusNote:
    'Finishing a Computer Science degree while building full-stack projects and writing about what I learn.',
  testimonials: []
};
