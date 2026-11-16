import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { CategoryBadge } from './ui.jsx';

function MediaFallback({ title }) {
  const word = title?.split(' ')[0] || 'Project';
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-paper-2">
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(var(--line-strong)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--line-strong)) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-clay/10 blur-2xl" />
      <span className="relative font-display text-[2.6rem] leading-none text-ink/25">{word}</span>
    </div>
  );
}

export default function ProjectCard({ project }) {
  const { title, slug, shortDescription, category, technologies = [], thumbnail } = project;

  return (
    <Link
      to={`/projects/${slug}`}
      className="reveal group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-200 hover:border-line-strong hover:shadow-glow"
    >
      <div className="relative aspect-[16/10] border-b border-line">
        {thumbnail?.url ? (
          <img
            src={thumbnail.url}
            alt={thumbnail.alt || `${title} screenshot`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <MediaFallback title={title} />
        )}
        <div className="absolute left-3 top-3">
          <CategoryBadge category={category} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.35rem] leading-snug text-ink transition group-hover:text-clay-deep">
            {title}
          </h3>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-clay" />
        </div>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-ink-soft">
          {shortDescription}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {technologies.slice(0, 3).map((tech) => (
            <span key={tech} className="chip">
              {tech}
            </span>
          ))}
          {technologies.length > 3 && (
            <span className="chip">+{technologies.length - 3}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
