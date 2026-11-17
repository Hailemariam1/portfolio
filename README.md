# Hailemariam — Portfolio & Content Management System

A full-stack portfolio for a **Junior Full-Stack Web Developer**, with a private dashboard for
managing every piece of content. Built with React, Node.js, Express and MongoDB.

The public site positions the developer honestly as early-career: projects are labelled academic,
personal, collaborative or freelance, and each case study states what was built personally, which
technologies were used, and which challenges came up.

---

## Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Frontend   | React 18, Vite, React Router, Tailwind CSS, React Markdown                  |
| Backend    | Node.js, Express, Mongoose                                                  |
| Database   | MongoDB (local or Atlas)                                                    |
| Auth       | JWT in an httpOnly cookie, bcrypt password hashing, rate limiting           |
| Uploads    | Cloudinary (URLs only stored in MongoDB), local disk fallback for dev       |
| Email      | Nodemailer (optional — messages are always saved)                          |

## Project layout

```
.
├── client/                 React application (public site + /admin dashboard)
│   └── src/
│       ├── pages/          Public pages (home, projects, about, writing, contact)
│       ├── admin/          Dashboard screens and editor forms
│       ├── components/     Shared UI, layout, markdown editor, uploads
│       ├── context/        Auth, site settings and toast providers
│       └── lib/            API client and formatting helpers
└── server/                 Express API
    └── src/
        ├── models/         Admin, Project, Skill, Experience, Post, Message, Settings
        ├── controllers/    Request handling per resource
        ├── routes/         Public (/api) and protected (/api/admin) routers
        ├── schemas/        Zod validation schemas
        ├── middleware/     Auth, validation, rate limits, uploads, errors
        ├── config/         Environment, database, Cloudinary
        └── seed/           Administrator bootstrap + sample content
```

---

## Getting started

### 1. Requirements

- Node.js 20 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

### 2. Install dependencies

```bash
npm run setup
```

### 3. Configure the environment

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:

| Variable                | Purpose                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| `MONGO_URI`             | MongoDB connection string                                            |
| `CLIENT_URL`            | Public HTTPS origin allowed to call the API                           |
| `ADMIN_NAME`            | Name of the administrator account created by the seed script         |
| `ADMIN_EMAIL`           | Administrator email (used to sign in)                                |
| `ADMIN_PASSWORD`        | Administrator password, 10+ characters (change before deploying)     |
| `JWT_SECRET`            | Long random string used to sign session tokens                       |
| `CLOUDINARY_*`          | Cloudinary credentials; when empty, uploads go to `server/uploads`   |
| `SMTP_*`, `MAIL_FROM`   | Optional SMTP settings for contact-form email notifications          |
| `CONTACT_NOTIFY_EMAIL`  | Where contact notifications are sent                                 |

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

There is **no public registration**. The administrator account is created from these environment
variables by the seed script — credentials are never hardcoded in the source.

### 4. Seed the administrator and sample content

```bash
npm run seed          # creates the admin, site settings and sample content
npm run seed:reset    # replaces projects, skills, experience and posts with the sample set
```

> The seed content is sample copy so every page is populated. Replace the project descriptions,
> links, education entries and settings with your own from the dashboard before sharing the site.
> The seeded GitHub links (`github.com/hailemariam/...`) are placeholders.

### Lost access to the dashboard?

The seed script only *creates* the account. Changing `ADMIN_PASSWORD` in `server/.env` afterwards
does not change an existing password until you run:

```bash
npm run admin:password
```

That command re-hashes `ADMIN_PASSWORD` for `ADMIN_EMAIL`, clears any failed-attempt lock and signs the
account out of nothing else. Five wrong passwords lock the account for 15 minutes and the endpoint
allows five attempts per IP per 15 minutes, so a reset is the quickest way back in.

### 5. Run it

```bash
npm run dev
```

- Public site: <http://localhost:5173>
- Admin dashboard: <http://localhost:5173/admin>
- API: <http://localhost:5000/api>

Production build (Express serves the built React app from the same origin):

```bash
npm run build
NODE_ENV=production npm start
```

Production requires `CLIENT_URL`, `MONGO_URI` and a long random `JWT_SECRET`. The application
also protects administrative writes with a CSRF token and validates uploaded file signatures.
Run the checks before deploying:

```bash
npm test --prefix server
npm run build
npm audit --omit=dev --prefix client
npm audit --omit=dev --prefix server
```

Back up MongoDB regularly and define a retention policy for contact messages because they contain
personal information and request metadata. Never commit `server/.env`, uploaded files, or service
credentials.

---

## Public API

Only published content is returned. Drafts are invisible to these endpoints.

| Method | Endpoint              | Notes                                            |
| ------ | --------------------- | ------------------------------------------------ |
| GET    | `/api/projects`       | Paginated; `category`, `q`, `featured`, `sort`   |
| GET    | `/api/projects/:slug` | 404 for drafts                                   |
| GET    | `/api/skills`         | Flat list plus `grouped` by category             |
| GET    | `/api/experience`     | Flat list plus `grouped` by type                 |
| GET    | `/api/blog`           | Paginated; `category`, `q`                       |
| GET    | `/api/blog/categories`| Distinct published categories                    |
| GET    | `/api/blog/:slug`     | Full article                                     |
| GET    | `/api/settings`       | Site settings                                    |
| POST   | `/api/contact`        | Validated, rate limited, saved, email optional   |

Pagination responses look like:

```json
{ "items": [], "pagination": { "page": 1, "limit": 9, "total": 5, "pages": 1, "hasNext": false, "hasPrev": false } }
```

## Admin API

Every route below `/api/admin` (except `POST /login` and `POST /logout`) requires a valid session
cookie and is rejected with `401` otherwise.

```
POST   /api/admin/login              email + password, 5 attempts / 15 min, account lockout
POST   /api/admin/logout
GET    /api/admin/me
GET    /api/admin/stats              dashboard counts

GET    /api/admin/projects           drafts included, filter by status/category/q
POST   /api/admin/projects
GET    /api/admin/projects/:id
PUT    /api/admin/projects/:id
PATCH  /api/admin/projects/:id       publish / unpublish / feature
DELETE /api/admin/projects/:id

POST   /api/admin/skills             also PUT and DELETE /api/admin/skills/:id
POST   /api/admin/experience         also PUT and DELETE /api/admin/experience/:id

GET    /api/admin/blog
POST   /api/admin/blog
GET    /api/admin/blog/:id
PUT    /api/admin/blog/:id
DELETE /api/admin/blog/:id

GET    /api/admin/messages           filter by status, search
GET    /api/admin/messages/:id       marks the message as read
PATCH  /api/admin/messages/:id       { "status": "read" | "unread" }
DELETE /api/admin/messages/:id

PUT    /api/admin/settings
POST   /api/admin/uploads            multipart `file` + `kind=image|resume`
```

Errors are JSON: `{ "error": "message", "details": [{ "field": "", "message": "" }] }`.

---

## Security notes

- **Passwords** are hashed with bcrypt (cost 12) and never returned by the API.
- **Sessions** are JWTs delivered in an `httpOnly` cookie (not readable by JavaScript), with
  `sameSite=lax` and `secure` in production. Changing the password invalidates tokens issued
  before the change.
- **Brute force**: login is limited to 5 attempts per IP per 15 minutes, and an account locks for
  15 minutes after 5 consecutive failures. Errors never reveal whether an email exists.
- **Authorization**: `requireAuth` is mounted on the admin router, so new admin routes are
  protected by default. Public handlers hard-code `status: 'published'`.
- **Input**: every write is validated with Zod on the server; Mongoose adds a second layer.
- **Uploads**: MIME type and size are checked (images ≤ 5 MB, PDF ≤ 10 MB) before storage.
- **Contact inbox** has no public read endpoint.
- **Honeypot** field plus rate limiting on the contact form.

For a split deployment, prefer the same-origin Vercel proxy described below. If you call the API
directly across origins instead, set `CLIENT_URL`/`CLIENT_URLS` to the exact frontend origin and
change the cookie `sameSite` policy in `server/src/utils/tokens.js` and `csrf.js` to `none` (HTTPS
required). Browsers that block third-party cookies can still prevent admin sign-in that way.

## Deployment

1. Create a MongoDB Atlas cluster and set `MONGO_URI` plus network access for your host.
2. Create a Cloudinary account and set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`.
3. Set production variables: `NODE_ENV=production`, a strong `JWT_SECRET`, `CLIENT_URL` (your
   public origin) and administrator credentials.
4. `npm run build` then `npm start` on a Node host (Render, Railway, Fly.io, a VPS). Express serves
   the API and the built frontend from one origin, so cookies work without CORS configuration.
5. Run `npm run seed` once against the production database to create the administrator and set up
   site settings.
6. Configure SMTP if you want email notifications for contact messages.

### Split deployment: Vercel frontend + Render API

Use this when the React app is on Vercel and the API is on Render. The included
`client/vercel.json` proxies `/api` and `/uploads` to the Render service, so the browser only talks
to the Vercel origin. That avoids CORS and third-party cookie restrictions for admin sign-in.

1. **Render**: set `CLIENT_URL` to the frontend’s exact public origin, with no trailing slash (for
example `https://your-project.vercel.app`). Keep `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`
and the admin credentials set, then redeploy. Add extra origins (such as preview URLs) as a
comma-separated `CLIENT_URLS` value only when needed.
2. **Vercel**: set the project Root Directory to `client`, build with `npm run build`, output `dist`.
Leave `VITE_API_URL` **unset** (or set it to `/api`) so requests use the proxy. If it points at the
Render URL, the browser calls Render directly and the fix is bypassed. Redeploy after changing it.
3. **Vercel Deployment Protection**: disable Vercel Authentication for the public/production
deployment. A protected deployment redirects every path — including `/api/*` — to Vercel SSO, which
the app reports as “Could not reach the server”.
4. Open the public production domain rather than a protected preview deployment URL.
5. If uploads use the local-disk fallback, note that Render’s filesystem is ephemeral; configure
   Cloudinary for durable images and resumes.

## Managing content

Sign in at `/admin`:

- **Dashboard** — totals for projects, published/draft projects, messages and blog posts.
- **Projects** — full case studies with overview, problem, responsibilities, features, challenges,
  screenshots, GitHub and live links, draft/publish and featured flags.
- **Skills** — grouped by category, reorderable.
- **Experience & education** — education, internships, freelance, collaborations, volunteering and
  certifications, each labelled on the public page.
- **Writing** — Markdown articles with cover images, drafts and publication dates.
- **Inbox** — read/unread messages, reply via your email client, delete.
- **Settings** — name, headline, introduction, location, photo, email, GitHub, LinkedIn, resume PDF,
  availability indicator and footer text.
