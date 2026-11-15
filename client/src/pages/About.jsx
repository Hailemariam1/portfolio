import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Download, MapPin } from 'lucide-react';
import { api } from '../lib/api.js';
import { useSettings } from '../context/SettingsContext.jsx';
import {
  AvailabilityBadge,
  ErrorBlock,
  LoadingBlock,
  SectionHeading
} from '../components/ui.jsx';
import { EXP_TYPE_LABELS, EXP_TYPE_ORDER, formatRange, groupByCategory } from '../lib/format.js';

function TimelineEntry({ entry }) {
  return (
    <div className="relative border-l border-line pb-8 pl-6 last:pb-0">
      <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-clay/70 ring-4 ring-paper" />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {EXP_TYPE_LABELS[entry.type] || entry.type}
        </span>
        {entry.current && (
          <span className="rounded-full bg-moss-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-moss">
            Current
          </span>
        )}
      </div>
      <h3 className="mt-1.5 font-display text-[1.25rem] leading-snug">{entry.title}</h3>
      {(entry.organization || entry.location) && (
        <p className="mt-0.5 text-[13px] text-ink-soft">
          {[entry.organization, entry.location].filter(Boolean).join(' · ')}
        </p>
      )}
      {(entry.startDate || entry.endDate) && (
        <p className="mt-0.5 text-[12px] text-ink-muted">
          {formatRange(entry.startDate, entry.endDate, entry.current)}
        </p>
      )}
      {entry.description && (
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">{entry.description}</p>
      )}
      {entry.highlights?.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {entry.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
              <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-clay/60" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}
      {entry.link && (
        <a
          href={entry.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[12px] text-clay-deep link-underline"
        >
          View credential
          <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

export default function About() {
  const { settings } = useSettings();
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/skills'), api.get('/experience')])
      .then(([skillData, experienceData]) => {
        if (!active) return;
        setSkills(skillData.items || []);
        setExperience(experienceData.items || []);
      })
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const aboutParagraphs = (settings.about || settings.intro || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const skillGroups = groupByCategory(skills);
  const experienceGroups = EXP_TYPE_ORDER.map((type) => ({
    type,
    entries: experience.filter((entry) => entry.type === type)
  })).filter((group) => group.entries.length > 0);

  return (
    <>
      <section className="container-page pt-12 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">About</p>
            <h1 className="mt-3 text-[2.4rem] leading-[1.08] sm:text-[3rem]">
              A junior developer with a habit of finishing things.
            </h1>
            <div className="mt-6 space-y-4">
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-[15px] leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <AvailabilityBadge />
              {settings.resume?.url && (
                <a
                  href={settings.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Resume (PDF)
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              {settings.profilePhoto?.url ? (
                <img
                  src={settings.profilePhoto.url}
                  alt={`${settings.name} — profile photograph`}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-paper-2">
                  <span className="font-display text-[7rem] leading-none text-ink/15">
                    {settings.name?.[0] || 'H'}
                  </span>
                </div>
              )}
              <div className="space-y-3 p-5 text-[13px]">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-ink-muted">Based in</span>
                  <span className="text-right text-ink-soft">{settings.location}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-ink-muted">Focus</span>
                  <span className="text-right text-ink-soft">Full-stack web development</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-ink-muted">Stack</span>
                  <span className="text-right text-ink-soft">React · Node.js · MongoDB</span>
                </div>
                {settings.email && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-ink-muted">Email</span>
                    <a href={`mailto:${settings.email}`} className="text-right link-underline">
                      {settings.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="container-page">
          <LoadingBlock label="Loading background…" />
        </div>
      ) : error ? (
        <div className="container-page pt-16">
          <ErrorBlock message={error} />
        </div>
      ) : (
        <>
          <section className="container-page pt-16 sm:pt-24">
            <SectionHeading
              eyebrow="Skills"
              title="What I actually use."
              intro="Grouped by where each tool sits in a project. If it is listed here, it has been used to build something on this site."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skillGroups.map((group) => (
                <div key={group.category} className="rounded-2xl border border-line bg-surface p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    {group.category}
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {group.items.map((skill) => (
                      <li key={skill.id}>
                        <p className="text-[13.5px] font-medium leading-snug text-ink">{skill.name}</p>
                        {skill.note && (
                          <p className="text-[12px] leading-relaxed text-ink-muted">{skill.note}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="container-page pt-16 sm:pt-24">
            <SectionHeading
              eyebrow="Background"
              title="Education, certificates and the work around them."
              intro="Labelled honestly: these are academic, volunteer, collaborative and certification entries — not employment claims."
            />
            <div className="mt-9 grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                {experienceGroups.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-sm text-ink-muted">
                    Background entries will appear here once they are added in the dashboard.
                  </div>
                ) : (
                  experienceGroups.map((group) => (
                    <div key={group.type} className="mb-8 last:mb-0">
                      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                        {EXP_TYPE_LABELS[group.type]}
                      </h3>
                      {group.entries.map((entry) => (
                        <TimelineEntry key={entry.id} entry={entry} />
                      ))}
                    </div>
                  ))
                )}
              </div>

              <aside className="lg:col-span-4">
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <p className="eyebrow">Looking for</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                    A junior full-stack role where I can own small features end to end, or a freelance
                    build with a clear scope.
                  </p>
                  <Link to="/contact" className="btn-primary btn-xs mt-4">
                    Get in touch
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <p className="mt-4 flex items-center gap-1.5 text-[12px] text-ink-muted">
                    <MapPin className="h-3 w-3" />
                    {settings.location} · remote friendly
                  </p>
                </div>
              </aside>
            </div>
          </section>
        </>
      )}
    </>
  );
}
