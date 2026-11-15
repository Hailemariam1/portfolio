/**
 * Sample content for a fresh install. Everything here is editable from the
 * admin dashboard; replace the copy and links with your own before sharing the
 * site publicly.
 */

export const settings = {
  key: 'site',
  name: 'Hailemariam',
  role: 'Junior Full-Stack Web Developer | React, Node.js & MongoDB',
  headline: "Hi, I'm Hailemariam. I build web applications that solve real problems.",
  intro:
    "I'm a junior full-stack web developer with a background in Computer Science. I enjoy working across the frontend and backend, building practical applications, and turning ideas into functional digital products.",
  about: `I'm an early-career full-stack developer based in Addis Ababa. I studied Computer Science, but most of what I know about building software came from finishing projects: a registration portal for my department, a storefront for a coffee roaster, and a handful of smaller tools I use myself.

I like the middle of a project best — the part where a fuzzy requirement turns into a data model, an API, and a screen someone can actually use. I'm comfortable in React, Node.js and MongoDB, and I care about the unglamorous parts too: validation, error states, sensible indexes, and a README that lets someone else run the code.

I'm looking for a junior full-stack role on a team where I can review code with more experienced engineers and grow into owning larger features. I'm also open to small freelance builds where a clear, working product matters more than a big scope.`,
  location: 'Addis Ababa, Ethiopia',
  email: 'hello@example.com',
  githubUrl: 'https://github.com/hailemariam',
  linkedinUrl: 'https://www.linkedin.com/in/hailemariam',
  availabilityStatus: true,
  availabilityNote: 'Open to junior full-stack roles and freelance projects',
  footerText: 'Built and maintained by Hailemariam — React, Node.js and MongoDB.'
};

export const projects = [
  {
    title: 'Campus Course Registration Portal',
    slug: 'campus-course-registration-portal',
    shortDescription:
      'A registration portal built with two classmates for our department’s course-selection week, with role-based access for students and staff.',
    overview:
      'A semester-long academic project: three students, eight weeks, and a real problem — replacing the spreadsheet our department used to register 90 students for elective courses.',
    problem:
      'Students queued outside the department office because seat capacity was tracked by hand. Nobody could tell whether a section was full until they reached the front of the queue, and staff had no reliable record of who was enrolled.',
    category: 'academic',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT', 'Tailwind CSS', 'Vite'],
    responsibilities: [
      'Designed the MongoDB schemas for students, courses, sections and registrations, including a compound unique index that prevents duplicate enrolment.',
      'Built the authentication and authorization layer: bcrypt password hashing, JWT session cookies, and role checks for student and staff routes.',
      'Implemented the registration endpoints, including atomic seat reservation and a waitlist when a section fills.',
      'Wrote the frontend API layer for the course catalogue and the registration flow.',
      'Deployed the API and the client, and wrote the setup guide the marker used to run the project.'
    ],
    features: [
      'Separate dashboards for students and department staff',
      'Live seat availability for every section',
      'Automatic waitlist once a section reaches capacity',
      'CSV export of enrolment lists for staff',
      'Search and filter by department, year and instructor'
    ],
    challenges: [
      {
        problem:
          'Two students clicking “register” for the last seat at the same moment were both accepted, and a 30-seat section showed 31 enrolments.',
        approach:
          'Moved the capacity check into a single atomic MongoDB update that only matches documents where seatsTaken is below capacity, then checked the modified count before responding. I wrote a small script that fires 50 parallel requests at one section to confirm it never overbooks.'
      },
      {
        problem:
          'The first version kept the JWT in localStorage, so any XSS bug would have handed over a session.',
        approach:
          'Moved the token into an httpOnly cookie, added a credentials-aware fetch wrapper, and documented the trade-offs (CSRF surface, logout behaviour) in the README instead of pretending it was free.'
      },
      {
        problem:
          'The course list made three API calls per row — instructor, department and seats — so the page took about four seconds to become usable.',
        approach:
          'Reshaped the endpoint to return a joined projection and folded seat counts into the same aggregation. The page now renders from one request, and I measured the improvement with the browser network panel rather than guessing.'
      }
    ],
    description: `## What it is

The registration portal replaced a spreadsheet-based process for a 90-student cohort. Students browse the term's offerings, see live seat counts and register in a few clicks. Department staff open and close sections, review the waitlist and export enrolment lists.

## How it fits together

A React client talks to an Express API. MongoDB stores students, courses, sections and registrations. Sessions are JWT cookies and the API re-checks the caller's role on every write.

I owned the data model, the auth layer, the registration endpoints and deployment. My two teammates built the staff dashboard and the visual design system, and we reviewed each other's pull requests.

## What I would do differently

The first schema stored an array of student ids inside each section, which made waitlist queries awkward. Normalising registrations into their own collection with a unique compound index was the right call, and I would start there next time.`,
    githubUrl: 'https://github.com/hailemariam/course-registration-portal',
    liveUrl: '',
    status: 'published',
    featured: true,
    publishedDaysAgo: 150
  },
  {
    title: 'Storefront for a Coffee Roaster',
    slug: 'coffee-roaster-storefront',
    shortDescription:
      'A freelance build for a small coffee roaster who was taking orders through Instagram DMs — catalogue, cart, orders and a dashboard they run themselves.',
    overview:
      'A five-week freelance engagement, scoped with the owner in a one-page brief. I built the storefront end to end, deployed it on a custom domain and handed over a written admin guide.',
    problem:
      'Orders arrived as Instagram messages. Prices were quoted by hand, stock was tracked in a notebook, and repeat customers were impossible to identify. The owner needed something they could update without calling a developer.',
    category: 'freelance',
    technologies: ['React', 'Vite', 'Node.js', 'Express', 'MongoDB Atlas', 'Cloudinary', 'Nodemailer', 'Tailwind CSS'],
    responsibilities: [
      'Scoped the work with the owner, wrote a one-page spec, and agreed a five-week timeline and fixed price.',
      'Built the storefront UI — catalogue, product detail, cart — from wireframes I drew with the owner.',
      'Implemented the order API with server-side price and stock validation, so a tampered cart cannot change the total.',
      'Set up the Cloudinary image pipeline and transactional emails to the owner and the customer.',
      'Configured MongoDB Atlas, environment variables, backups and deployment on a custom domain.',
      'Recorded a handover walkthrough and wrote a short admin guide for updating products and stock.'
    ],
    features: [
      'Product catalogue with size, roast level and stock',
      'Cart that survives a refresh, validated against server prices at checkout',
      'Order confirmation emails to the customer and the owner',
      'Private product management with image upload',
      'Mobile-first layout, because most of the owner’s traffic comes from Instagram'
    ],
    challenges: [
      {
        problem:
          'The cart lived in localStorage, so anyone could edit a price in dev tools before checkout.',
        approach:
          'Stopped trusting the client entirely: checkout now sends only product ids and quantities, and the server recalculates every line from the database before creating the order. I added a test case that posts a tampered cart and expects a rejected total.'
      },
      {
        problem:
          'Product photos were 4–6 MB each and the first version took nine seconds to load on a mobile connection.',
        approach:
          'Moved uploads to Cloudinary with automatic format and quality transformations, capped uploads at 5 MB on the server, and served responsive sizes. The catalogue now loads in under two seconds on a throttled connection.'
      },
      {
        problem:
          'The owner sometimes marked an item out of stock while a customer was mid-checkout.',
        approach:
          'Re-validated stock inside the order transaction, rejected the order with a clear message naming the item, and showed the available quantity so the customer could adjust instead of starting over.'
      }
    ],
    description: `## What it is

A small storefront for a coffee roaster: browse the roasts, add bags to a cart, check out, and receive an email confirmation. The owner gets the same notification plus a private area to add products, change prices and mark items out of stock.

## How it fits together

React on the front, an Express API and MongoDB Atlas behind it. Images live in Cloudinary and only their URLs and public ids are stored in MongoDB. Order emails go out through Nodemailer from a small SMTP account the owner already had.

## Working with the owner

We met twice a week over a call. I kept a shared document with decisions and open questions, and shipped a staging link every Friday so feedback was about the actual product rather than a description of it. The handover included a ten-minute screen recording and a one-page guide.`,
    githubUrl: 'https://github.com/hailemariam/coffee-roaster-storefront',
    liveUrl: '',
    status: 'published',
    featured: true,
    publishedDaysAgo: 90
  },
  {
    title: 'Recipe Box',
    slug: 'recipe-box',
    shortDescription:
      'A personal MERN app for saving my own recipes, built to practise text search, image handling and a small, honest feature set.',
    overview:
      'A solo project I use every week. The goal was not a big feature list but finishing something small properly: search that works, uploads that stay fast, and drafts that stay private.',
    problem:
      'The recipe apps I tried wanted a subscription and buried my own notes. I wanted a small tool I controlled, where my handwritten adjustments were the point.',
    category: 'personal',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'Cloudinary', 'Tailwind CSS'],
    responsibilities: [
      'Sole developer: data model, REST API, interface, deployment and documentation.',
      'Designed the search behaviour, including how ingredients and tags are normalised on write.',
      'Built the cook-mode view that keeps the screen awake and shows one step at a time.'
    ],
    features: [
      'Full-text search across titles, ingredients and tags',
      'Image upload with automatic resizing',
      'Step-by-step cook mode',
      'Private drafts for half-finished recipes',
      'Keyboard-friendly editing with a live preview'
    ],
    challenges: [
      {
        problem:
          'MongoDB’s text index ignored plural forms, so searching “tomato” missed recipes tagged “tomatoes”.',
        approach:
          'Combined the text index with a prefix regex on normalised ingredient names, and normalise tags on write. Documented the trade-off — a larger index in exchange for search that behaves the way people expect.'
      },
      {
        problem:
          'Every recipe edit rewrote the whole document, so two open tabs silently overwrote each other.',
        approach:
          'Sent only changed fields with a version check, and surfaced a “this recipe changed elsewhere, reload?” message instead of losing work.'
      }
    ],
    description: `## What it is

A recipe archive with search, tags, photos and a distraction-free cook mode. It is deliberately small: I would rather have five features that hold up than fifteen that half work.

## What it taught me

Search is a product decision, not an index setting. Most of the work here was deciding what a user means when they type “chicken rice” and testing that against my own recipes.`,
    githubUrl: 'https://github.com/hailemariam/recipe-box',
    liveUrl: '',
    status: 'published',
    featured: false,
    publishedDaysAgo: 60
  },
  {
    title: 'Tutoring Session Scheduler',
    slug: 'tutoring-session-scheduler',
    shortDescription:
      'A scheduling tool built by a team of four volunteers for a community tutoring programme, where I owned the backend API and the deployment pipeline.',
    overview:
      'A collaborative project with three other developers for a volunteer-run tutoring programme. We worked in two-week sprints with a shared backlog and code review on every pull request.',
    problem:
      'The programme matched tutors to students over a group chat. Sessions were double-booked, and nobody could tell which students had not been matched for a month.',
    category: 'collaborative',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'GitHub Actions', 'Railway', 'Tailwind CSS'],
    responsibilities: [
      'Built the backend API for tutors, students and sessions, including availability windows.',
      'Set up GitHub Actions to run linting and a smoke test suite on every pull request.',
      'Reviewed around twenty pull requests and kept the branching strategy and PR template tidy.',
      'Maintained separate staging and production deployments, with a seed script for staging data.'
    ],
    features: [
      'Tutor availability and session booking in UTC',
      'Automatic flag for students unmatched for more than 30 days',
      'Admin view of upcoming sessions and cancellations',
      'Seeded staging environment for testing'
    ],
    challenges: [
      {
        problem:
          'Two contributors edited the same Mongoose model in one week and broke staging twice.',
        approach:
          'Introduced a short schema review checklist in the PR template, required a note on data impact for model changes, and added a staging seed script so breakage showed up before merge.'
      },
      {
        problem:
          'Session times drifted by three hours for the volunteer coordinator.',
        approach:
          'Stored every timestamp in UTC, converted only at the edges, and added tests using the coordinator’s timezone. The bug turned out to be a date parsed on the server as local time — a good lesson in keeping time unambiguous.'
      },
      {
        problem:
          'Work stalled in the last two weeks because three features were nearly finished and none were merged.',
        approach:
          'Proposed a one-feature-at-a-time rule for the final sprint, split the largest branch into three reviewable pull requests, and we shipped on time.'
      }
    ],
    description: `## What it is

A scheduler for a volunteer tutoring programme. Tutors publish the hours they can cover, students get matched, and the coordinator can see which sessions are at risk.

## My part

Backend API, CI pipeline and review. I was not the team lead — we rotated facilitation weekly — but I ended up owning the deployment process because I was the one who had broken staging most often.

## What I learned about working in a team

Small pull requests get reviewed. Big ones get postponed. Most of our velocity problems disappeared once we agreed on that.`,
    githubUrl: 'https://github.com/hailemariam/tutoring-scheduler',
    liveUrl: '',
    status: 'published',
    featured: false,
    publishedDaysAgo: 35
  },
  {
    title: 'Portfolio & Content Management System',
    slug: 'portfolio-cms',
    shortDescription:
      'The site you are reading: a React frontend on an Express and MongoDB API, with an authenticated dashboard so every word is editable without touching code.',
    overview:
      'I rebuilt my portfolio as a real full-stack application rather than a static page, because I wanted to practise the parts of web development I had only read about: sessions, protected APIs, uploads and content modelling.',
    problem:
      'My previous portfolio was a single HTML file. Changing one sentence meant a commit and a redeploy, and nothing on it proved I could build anything beyond a static page.',
    category: 'personal',
    technologies: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Cloudinary', 'Nodemailer'],
    responsibilities: [
      'Designed and built the entire system: content models, public API, admin API, dashboard UI and the public site.',
      'Implemented JWT sessions in httpOnly cookies, bcrypt password hashing and login rate limiting.',
      'Built the image upload pipeline so MongoDB stores URLs only.',
      'Wrote the seed script that bootstraps the administrator account from environment variables.'
    ],
    features: [
      'Admin dashboard with project, skill, experience, blog and message management',
      'Draft and publish workflow for projects and articles',
      'Image and PDF uploads through Cloudinary',
      'Contact form that stores messages in MongoDB and emails a notification',
      'Public site that only ever reads published content'
    ],
    challenges: [
      {
        problem:
          'The same content API serves the public site and the dashboard, which risks leaking drafts.',
        approach:
          'Separated the public and admin route stacks. Every public query hard-codes status: published, and admin reads require a valid session before they reach a controller.'
      },
      {
        problem:
          'Storing image files inside MongoDB would have bloated the database and slowed every query.',
        approach:
          'Uploaded buffers to Cloudinary, validated MIME type and size on the server, and stored only the URL, public id and alt text in MongoDB.'
      },
      {
        problem:
          'I wanted editing to feel safe, so deleting a project needed a guard against a misplaced click.',
        approach:
          'Added a confirmation dialog that names the item, a toast for the outcome, and soft-ish ordering so the list does not jump after an action.'
      }
    ],
    description: `## What it is

A public portfolio and a private content management system in one application. The public side shows projects, skills, experience, writing and a contact form. The private side at /admin lets me edit all of it.

## Architecture

React and Vite on the front. Express and MongoDB behind it, with Mongoose models for projects, skills, experience, posts, messages and site settings. Authentication is a JWT in an httpOnly cookie, verified by middleware that every admin route sits behind. Uploads go to Cloudinary.

## Why it is worth reading

It shows the parts of my work a screenshot cannot: validation, authorization, error states and the decisions behind them.`,
    githubUrl: 'https://github.com/hailemariam/portfolio',
    liveUrl: '',
    status: 'published',
    featured: true,
    publishedDaysAgo: 10
  },
  {
    title: 'Pharmacy Stock Tracker',
    slug: 'pharmacy-stock-tracker',
    shortDescription:
      'A draft freelance project: a simple stock and expiry tracker for a neighbourhood pharmacy, currently in scoping with the owner.',
    overview:
      'In progress. Scoped in conversation with the owner, not yet built beyond the data model.',
    problem:
      'Expiring medication is discovered by physically checking shelves, which means write-offs and occasional stock-outs of common items.',
    category: 'freelance',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
    responsibilities: ['Requirements interviews with the owner (ongoing).'],
    features: ['Expiry alerts by batch', 'Low-stock list', 'Daily summary email'],
    challenges: [],
    description: `## Status

Draft. The owner and I are still agreeing what belongs in the first version — currently leaning towards expiry alerts and a low-stock list, with supplier ordering left out.`,
    githubUrl: '',
    liveUrl: '',
    status: 'draft',
    featured: false,
    publishedDaysAgo: null
  }
];

export const skills = [
  { name: 'React', category: 'Frontend', note: 'Hooks, routing, forms and data fetching', order: 1 },
  { name: 'JavaScript (ES2020+)', category: 'Frontend', note: 'Modern syntax, async/await, modules', order: 2 },
  { name: 'HTML5 & CSS3', category: 'Frontend', note: 'Semantic markup and responsive layouts', order: 3 },
  { name: 'Tailwind CSS', category: 'Frontend', note: 'Design systems built from utility classes', order: 4 },
  { name: 'React Router', category: 'Frontend', note: 'Nested routes, protected routes, URL state', order: 5 },
  { name: 'Accessible UI basics', category: 'Frontend', note: 'Labels, focus states, keyboard flows', order: 6 },
  { name: 'Node.js', category: 'Backend', note: 'ES modules, streams, environment config', order: 1 },
  { name: 'Express', category: 'Backend', note: 'REST APIs, middleware, error handling', order: 2 },
  { name: 'REST API design', category: 'Backend', note: 'Resource naming, status codes, pagination', order: 3 },
  { name: 'Authentication (JWT)', category: 'Backend', note: 'httpOnly sessions, role checks, rate limits', order: 4 },
  { name: 'Input validation (Zod)', category: 'Backend', note: 'Server-side schemas on every write', order: 5 },
  { name: 'File uploads', category: 'Backend', note: 'Cloudinary pipeline with type and size checks', order: 6 },
  { name: 'MongoDB', category: 'Database', note: 'Document modelling, indexes, aggregation', order: 1 },
  { name: 'Mongoose', category: 'Database', note: 'Schemas, validation, population, hooks', order: 2 },
  { name: 'MongoDB Atlas', category: 'Database', note: 'Clusters, users, backups and IP access', order: 3 },
  { name: 'Git & GitHub', category: 'Tools & Deployment', note: 'Branching, pull requests, code review', order: 1 },
  { name: 'Vite', category: 'Tools & Deployment', note: 'Dev server, environment variables, builds', order: 2 },
  { name: 'Postman', category: 'Tools & Deployment', note: 'API testing with saved collections', order: 3 },
  { name: 'Cloudinary', category: 'Tools & Deployment', note: 'Uploads, transformations, cleanup', order: 4 },
  { name: 'Render & Vercel', category: 'Tools & Deployment', note: 'Deploying APIs and static frontends', order: 5 },
  { name: 'Data structures', category: 'Foundations', note: 'Arrays, hash maps, trees and complexity', order: 1 },
  { name: 'Relational & NoSQL modelling', category: 'Foundations', note: 'Normalisation compared with embedding', order: 2 },
  { name: 'Debugging', category: 'Foundations', note: 'Browser dev tools, server logs, bisecting commits', order: 3 }
];

export const experience = [
  {
    type: 'education',
    title: 'BSc in Computer Science',
    organization: 'University',
    location: 'Addis Ababa, Ethiopia',
    startDate: 'Sep 2022',
    endDate: 'Jun 2026',
    current: true,
    description:
      'Coursework across programming, databases, operating systems and software engineering, with a final-year project that shipped to a real cohort of students.',
    highlights: [
      'Relevant coursework: data structures, database systems, web application development, software engineering',
      'Final-year project: campus course registration portal used during course-selection week',
      'Course representative for two semesters'
    ],
    order: 1
  },
  {
    type: 'volunteer',
    title: 'Peer coding mentor',
    organization: 'Computer Science student club',
    location: 'Addis Ababa, Ethiopia',
    startDate: 'Oct 2024',
    endDate: '',
    current: true,
    description:
      'Weekly sessions helping first-year students get unstuck with JavaScript and Git, plus review of their first pull requests.',
    highlights: [
      'Ran a four-week intro to Git and GitHub workshop for about 25 students',
      'Reviewed beginner pull requests with an emphasis on small, understandable commits'
    ],
    order: 2
  },
  {
    type: 'certification',
    title: 'Responsive Web Design',
    organization: 'freeCodeCamp',
    location: 'Online',
    startDate: '2024',
    endDate: '2024',
    current: false,
    description: 'Certification covering semantic HTML, CSS layout and accessibility fundamentals.',
    highlights: [],
    link: 'https://www.freecodecamp.org/',
    order: 3
  },
  {
    type: 'collaboration',
    title: 'Tutoring Session Scheduler',
    organization: 'Volunteer team of four developers',
    location: 'Remote',
    startDate: 'Jan 2026',
    endDate: 'May 2026',
    current: false,
    description:
      'Collaborative build for a community tutoring programme. I owned the backend API, CI pipeline and deployment process.',
    highlights: [
      'Reviewed around twenty pull requests',
      'Set up staging and production environments with seeded data'
    ],
    order: 4
  }
];

export const posts = [
  {
    title: 'How I stopped shipping broken forms',
    slug: 'how-i-stopped-shipping-broken-forms',
    excerpt:
      'Client-side validation is a courtesy, not a guarantee. A short walkthrough of the two-layer validation setup I now reuse in every project.',
    category: 'Engineering notes',
    status: 'published',
    publishedDaysAgo: 18,
    content: `## The bug that started this

My first full-stack form accepted anything. The browser helped a little, but only while JavaScript was enabled, and only until someone opened dev tools. Then a request arrived with an empty email address and a three-character message, and my API happily wrote it to MongoDB.

The fix is boring and it works: validate on the client for speed, validate on the server for truth.

## One schema, two purposes

I define the rules once with [Zod](https://zod.dev) and reuse them on both sides. On the client they drive inline messages. On the server the same schema is a middleware that rejects bad input before a controller touches it.

\`\`\`js
export const contactPayload = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  message: z.string().trim().min(20).max(5000)
});
\`\`\`

The server middleware returns field-level details, which the form renders next to the relevant input:

\`\`\`json
{
  "error": "Please check the highlighted fields.",
  "details": [{ "field": "email", "message": "Enter a valid email address." }]
}
\`\`\`

## Three rules I keep

- **Never trust the client.** Every write validates on the server, even when the form looks safe.
- **Show the error where the fix happens.** A single toast at the top of a long form is a puzzle, not an error message.
- **Keep the user's input.** Losing what someone typed because validation failed is worse than the failure.

## What changed

Contact spam dropped to zero after I added validation plus a hidden honeypot field. More importantly, the inbox is now trustworthy: if a message is in MongoDB, it has a name, a real email address and something to read.`,
    published: true
  },
  {
    title: 'A JWT login flow I can explain line by line',
    slug: 'jwt-login-flow-explained',
    excerpt:
      'What actually happens between pressing “sign in” and a protected route returning data, written for people who have copied auth code without fully trusting it.',
    category: 'Engineering notes',
    status: 'published',
    publishedDaysAgo: 40,
    content: `## Why I rebuilt this from scratch

The first admin panel I made used a tutorial's auth setup. It worked, until I needed to know what happened when a token expired. Then I realised I had no idea what I had built.

So I wrote a small version myself. Here is the whole flow.

## 1. The password never leaves the server

On sign-in, the server looks up the account, compares the submitted password against a bcrypt hash, and never stores or logs the plain text. If the account does not exist, the response is still \`Invalid email or password\` — the same message, so nobody can enumerate valid emails.

\`\`\`js
const admin = await Admin.findOne({ email }).select('+passwordHash');
if (!admin) throw ApiError.unauthorized('Invalid email or password.');
const valid = await admin.verifyPassword(password);
\`\`\`

## 2. The token goes in an httpOnly cookie

\`\`\`js
res.cookie(cookieName, token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
\`\`\`

httpOnly means JavaScript cannot read it, so an XSS bug cannot quietly exfiltrate a session. \`sameSite\` limits cross-site sending, which covers most CSRF exposure for a same-origin app.

## 3. Middleware checks every protected route

The token is verified, the account is loaded, and only then does the request reach a controller. A missing or expired token gets a 401 — never a partial response.

## 4. Brute force is a separate problem

Passwords alone do not stop someone guessing. I limit sign-in attempts per IP and lock an account for fifteen minutes after five failures. Both layers are cheap, and together they make guessing impractical.

## What I would improve next

Refresh tokens with rotation, so a session can be revoked without waiting for expiry. That is the next thing on my list — writing it down here so I actually do it.`,
    published: true
  },
  {
    title: 'Notes from my first code review as a junior',
    slug: 'notes-from-my-first-code-review',
    excerpt:
      'A draft collection of things I got wrong in review, and the habits that made the next one easier.',
    category: 'Learning in public',
    status: 'draft',
    publishedDaysAgo: null,
    content: `## Draft

This one is still being written.

- Review the diff, not the person.
- Ask a question before making a suggestion.
- Small pull requests get real review.
- Say what you checked, so the author knows what is covered.

I want to add two examples where a reviewer's question changed my mind about an approach.`,
    published: false
  }
];
