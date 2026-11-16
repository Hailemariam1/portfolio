import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Database,
  Download,
  MapPin,
  Rocket,
  Server,
  ShieldCheck
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { AvailabilityBadge, LoadingBlock, SectionHeading } from '../components/ui.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { formatDate } from '../lib/format.js';

const CAPABILITIES = [
  {
    icon: ShieldCheck,
    title: 'Applications with real accounts',
    body: 'Sign-in, protected routes and role checks, with hashed passwords and JWT sessions stored in httpOnly cookies.'
  },
  {
    icon: Server,
    title: 'APIs that hold up',
    body: 'Express endpoints with server-side validation, pagination, filtering and error responses a frontend can act on.'
  },
  {
    icon: Database,
    title: 'Data models that fit the product',
    body: 'MongoDB schemas with relationships and indexes chosen around the queries the app actually runs.'
  },
  {
    icon: Rocket,
    title: 'Shipped, not just local',
    body: 'Deployments to Render and Vercel, environment configuration, Cloudinary uploads and email notifications.'
  }
];

export default function Home() {
  const { settings } = useSettings();
  const [projects, setProjects] = useState([]);
  const [skillGroups, setSkillGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/projects?featured=true&limit=3'),
      api.get('/skills'),
      api.get('/blog?limit=3')
    ])
      .then(([projectData, skillData, postData]) => {
        if (!active) return;
        setProjects(projectData.items || []);
        setSkillGroups(skillData.grouped || []);
        setPosts(postData.items || []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="relative border-b border-line">
        <div className="container-page grid gap-12 pb-16 pt-12 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-20">
          <div className="reveal lg:col-span-7">
            <AvailabilityBadge />
            <p className="eyebrow mt-7">{settings.role}</p>
            <h1 className="mt-4 text-[2.5rem] leading-[1.05] sm:text-[3.3rem] lg:text-[3.7rem]">
              {settings.headline}
            </h1>
            <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-ink-soft sm:text-[16.5px]">
              {settings.intro}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/projects" className="btn-primary">
                View My Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contact Me
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {settings.location}
              </span>
              <span className="hidden h-3 w-px bg-line-strong sm:block" />
              <span>Early career · open to junior full-stack roles</span>
            </div>
          </div>

          <div className="reveal lg:col-span-5 lg:pt-4">
            {settings.profilePhoto?.url ? (
              <div className="overflow-hidden rounded-2xl border border-line bg-paper-2">
                <img
                  src={settings.profilePhoto.url}
                  alt={`${settings.name} — profile photograph`}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-glow">
                <p className="eyebrow">Where I work</p>
                <ul className="mt-4 divide-y divide-line">
                  {[
                    { label: 'Frontend', text: 'React, responsive layouts, accessible forms' },
                    { label: 'Backend', text: 'Express REST APIs, JWT sessions, validation' },
                    { label: 'Data', text: 'MongoDB schemas, indexes, aggregation' }
                  ].map((row) => (
                    <li key={row.label} className="flex gap-4 py-3.5">
                      <span className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        {row.label}
                      </span>
                      <span className="text-[13.5px] leading-relaxed text-ink-soft">{row.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl border border-line/70 bg-paper-2/70 p-4">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    Right now
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                    Finishing a Computer Science degree while building full-stack projects and writing
                    about what I learn.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-page pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="What I can build"
          title="Tools and evidence, not a list of languages."
          intro="These are the things I can take from an idea to a working deployment. Every one of them appears in a project case study below."
          className="reveal"
        />
        <div className="reveal-stagger mt-9 grid gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="reveal rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line-strong"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper-2 text-clay">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 font-display text-[1.2rem] leading-snug">{item.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-page pt-16 sm:pt-24">
        <SectionHeading
          eyebrow="Selected work"
          title="Case studies, not screenshots."
          intro="Each project explains the problem, what I personally built, and what went wrong along the way. Projects are labelled academic, personal, collaborative or freelance."
          className="reveal"
          action={
            <Link to="/projects" className="btn-secondary btn-xs shrink-0">
              All projects
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="mt-9">
          {loading ? (
            <LoadingBlock label="Loading projects…" />
          ) : projects.length ? (
            <div className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line-strong bg-surface/60 p-10 text-center text-sm text-ink-muted">
              Projects will appear here once they are published from the dashboard.
            </div>
          )}
        </div>
      </section>

      <section className="container-page pt-16 sm:pt-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Skills"
              title="Grouped by where they sit in the stack."
              intro="Nothing here is a logo I have not used in a project. Categories, notes and ordering are managed from the dashboard."
              className="reveal"
            />
          </div>
          <div className="lg:col-span-8">
            {loading ? (
              <LoadingBlock label="Loading skills…" />
            ) : (
              <div className="reveal-stagger grid gap-4 sm:grid-cols-2">
                {skillGroups.map((group) => (
                  <div
                    key={group.category}
                    className="reveal rounded-2xl border border-line bg-surface p-5"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      {group.category}
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {group.skills.map((skill) => (
                        <li key={skill.id} className="text-[13.5px] leading-snug">
                          <span className="font-medium text-ink">{skill.name}</span>
                          {skill.note && (
                            <span className="block text-[12px] leading-relaxed text-ink-muted">
                              {skill.note}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="container-page pt-16 sm:pt-24">
          <SectionHeading
            eyebrow="Writing"
            title="Notes from building things."
            intro="Short, specific write-ups about problems I hit and how I solved them."
            className="reveal"
            action={
              <Link to="/writing" className="btn-secondary btn-xs shrink-0">
                All writing
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="mt-8 divide-y divide-line border-y border-line">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/writing/${post.slug}`}
                className="reveal group flex flex-col gap-2 py-5 transition sm:flex-row sm:items-center sm:gap-6"
              >
                <span className="w-28 shrink-0 text-[12px] uppercase tracking-[0.08em] text-ink-muted">
                  {formatDate(post.publishedAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <div className="flex-1">
                  <p className="font-display text-[1.15rem] leading-snug transition group-hover:text-clay">
                    {post.title}
                  </p>
                  <p className="mt-1 line-clamp-1 text-[13px] text-ink-soft">{post.excerpt}</p>
                </div>
                <ArrowRight className="hidden h-4 w-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-clay sm:block" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page pt-16 sm:pt-24">
        <div className="reveal relative overflow-hidden rounded-3xl border border-line bg-surface px-7 py-12 shadow-glow sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-moss/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-slateblue/10 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Next step
            </p>
            <h2 className="mt-3 max-w-2xl text-[1.9rem] leading-tight text-ink sm:text-[2.4rem]">
              Looking for a junior developer who finishes what they start?
            </h2>
            <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-ink-soft">
              I&rsquo;m available for junior full-stack roles and small freelance builds. If you want to
              talk about a role, a project or a problem, send me a message — I reply within a day or two.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/contact" className="btn-primary">
                Contact me
                <ArrowRight className="h-4 w-4" />
              </Link>
              {settings.resume?.url && (
                <a
                  href={settings.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <Download className="h-4 w-4" />
                  Download resume
                </a>
              )}
            </div>
            <div className="mt-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-2/60 px-3 py-1.5 text-[12px] text-ink-soft">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    settings.availabilityStatus ? 'bg-moss' : 'bg-ink-muted'
                  }`}
                />
                {settings.availabilityStatus
                  ? settings.availabilityNote
                  : 'Not currently available for new work'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
