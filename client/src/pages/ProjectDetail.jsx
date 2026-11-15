import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Github,
  Images,
  Lightbulb,
  Target
} from 'lucide-react';
import { api } from '../lib/api.js';
import { CATEGORY_CONTEXT, CATEGORY_LABELS, formatDate } from '../lib/format.js';
import Markdown from '../components/Markdown.jsx';
import { CategoryBadge, ErrorBlock, LoadingBlock } from '../components/ui.jsx';

function Section({ eyebrow, title, children, className = '' }) {
  return (
    <section className={className}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-2.5 text-[1.6rem] leading-snug">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/projects/${slug}`)
      .then((data) => active && setProject(data.project))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page">
        <LoadingBlock label="Loading case study…" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container-page max-w-2xl pt-16">
        <ErrorBlock
          title="Project not found"
          message={error || 'This project does not exist or has not been published.'}
          action={
            <Link to="/projects" className="btn-secondary btn-xs">
              Back to projects
            </Link>
          }
        />
      </div>
    );
  }

  const hasChallenges = project.challenges?.length > 0;

  return (
    <article className="container-page pt-10 sm:pt-14">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All projects
      </Link>

      <header className="mt-6 border-b border-line pb-9">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={project.category} />
          {project.featured && (
            <span className="chip border-clay/20 bg-clay-soft text-clay-deep">Featured</span>
          )}
        </div>
        <h1 className="mt-5 max-w-4xl text-[2.2rem] leading-[1.07] sm:text-[3rem]">
          {project.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-soft">
          {project.shortDescription}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-xs"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub repository
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent btn-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Live demonstration
            </a>
          )}
          {!project.githubUrl && !project.liveUrl && (
            <span className="text-[12.5px] text-ink-muted">
              Links for this project are not public yet.
            </span>
          )}
        </div>
      </header>

      {project.thumbnail?.url && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-paper-2">
          <img
            src={project.thumbnail.url}
            alt={project.thumbnail.alt || `${project.title} preview`}
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-10 lg:col-span-8">
          {project.overview && (
            <Section eyebrow="Project overview" title="What it is">
              <p className="text-[15px] leading-relaxed text-ink-soft">{project.overview}</p>
            </Section>
          )}

          {project.problem && (
            <Section eyebrow="The problem" title="Why it needed to exist">
              <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex gap-3">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  <p className="text-[14.5px] leading-relaxed text-ink-soft">{project.problem}</p>
                </div>
              </div>
            </Section>
          )}

          {project.description && (
            <Section eyebrow="The build" title="How it works">
              <Markdown>{project.description}</Markdown>
            </Section>
          )}

          {project.responsibilities?.length > 0 && (
            <Section eyebrow="My specific responsibilities" title="What I personally built">
              <ul className="space-y-2.5">
                {project.responsibilities.map((item) => (
                  <li key={item} className="flex gap-3 text-[14.5px] leading-relaxed text-ink-soft">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {project.features?.length > 0 && (
            <Section eyebrow="Important features" title="What the app actually does">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {project.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-xl border border-line bg-surface px-4 py-3 text-[13.5px] leading-relaxed text-ink-soft"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {hasChallenges && (
            <Section eyebrow="Technical challenges" title="What went wrong, and what I did">
              <div className="space-y-4">
                {project.challenges.map((challenge, index) => (
                  <div key={`${challenge.problem}-${index}`} className="rounded-2xl border border-line bg-surface">
                    <div className="border-b border-line px-5 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                        Challenge {String(index + 1).padStart(2, '0')}
                      </p>
                      <p className="mt-1.5 text-[14.5px] font-medium leading-relaxed text-ink">
                        {challenge.problem}
                      </p>
                    </div>
                    <div className="flex gap-3 px-5 py-4">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-ochre" />
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                          How I approached it
                        </p>
                        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
                          {challenge.approach}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="eyebrow">Project type</p>
              <p className="mt-2 font-display text-[1.15rem]">
                {CATEGORY_LABELS[project.category] || project.category}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                {CATEGORY_CONTEXT[project.category]}
              </p>
            </div>

            {project.technologies?.length > 0 && (
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="eyebrow">Technologies used</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="chip">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-line bg-surface p-5 text-[12.5px] text-ink-soft">
              <p className="eyebrow">Details</p>
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Published</dt>
                  <dd>{formatDate(project.publishedAt || project.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Last updated</dt>
                  <dd>{formatDate(project.updatedAt)}</dd>
                </div>
                {project.liveUrl && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Live demo</dt>
                    <dd>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline"
                      >
                        Visit site
                      </a>
                    </dd>
                  </div>
                )}
                {project.githubUrl && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Repository</dt>
                    <dd>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline"
                      >
                        View code
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </aside>
      </div>

      {project.images?.length > 0 && (
        <section className="mt-14 border-t border-line pt-9">
          <div className="flex items-center gap-2">
            <Images className="h-4 w-4 text-ink-muted" />
            <h2 className="text-[1.5rem] leading-snug">Screenshots</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {project.images.map((image, index) => (
              <a
                key={`${image.url}-${index}`}
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-2xl border border-line bg-paper-2"
              >
                <img
                  src={image.url}
                  alt={image.alt || `${project.title} screenshot ${index + 1}`}
                  loading="lazy"
                  className="w-full object-cover transition duration-300 group-hover:opacity-95"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
        <Link to="/projects" className="btn-secondary btn-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          All projects
        </Link>
        <Link to="/contact" className="btn-primary btn-xs">
          Discuss this project
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
