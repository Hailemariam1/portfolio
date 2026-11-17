import { useCallback, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { api, toQuery } from '../lib/api.js';
import { CATEGORY_LABELS } from '../lib/format.js';
import { EmptyState, ErrorBlock, LoadingBlock, Spinner } from '../components/ui.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { FolderOpen } from 'lucide-react';

const FILTERS = [
  { value: 'all', label: 'All projects' },
  { value: 'academic', label: CATEGORY_LABELS.academic },
  { value: 'personal', label: CATEGORY_LABELS.personal },
  { value: 'collaborative', label: CATEGORY_LABELS.collaborative },
  { value: 'freelance', label: CATEGORY_LABELS.freelance }
];

export default function Projects() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (targetPage, replace) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError('');
      try {
        const data = await api.get(
          `/projects${toQuery({
            page: targetPage,
            limit: 9,
            category: category === 'all' ? undefined : category,
            q: query || undefined
          })}`
        );
        const nextItems = Array.isArray(data?.items) ? data.items : [];
        setItems((current) => (replace ? nextItems : [...current, ...nextItems]));
        setPagination(data?.pagination || null);
        setPage(targetPage);
      } catch (requestError) {
        setError(requestError.message || 'Could not load projects.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, query]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => load(1, true), query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  return (
    <div className="container-page pt-12 sm:pt-16">
      <header className="reveal max-w-3xl">
        <p className="eyebrow">Portfolio</p>
        <h1 className="mt-3 text-[2.3rem] leading-[1.08] sm:text-[3rem]">
          Projects, with the work explained.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          Each entry includes the problem being solved, the part I personally built, the features that
          shipped and the technical challenges I ran into. Projects are labelled by type — academic,
          personal, collaborative or freelance — so it is clear what each one was.
        </p>
      </header>

      <div className="mt-9 flex flex-col gap-4 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setCategory(filter.value)}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                category === filter.value
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects or tech…"
            aria-label="Search projects"
            className="input py-2 pl-9 pr-8 text-[13px]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:text-ink"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <ErrorBlock message={error} action={<button className="btn-secondary btn-xs" onClick={() => load(1, true)}>Try again</button>} />
        ) : loading ? (
          <LoadingBlock label="Loading projects…" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects match that filter"
            description="Try a different category or clear the search. Every published project appears here automatically."
            action={
              <button
                type="button"
                className="btn-secondary btn-xs"
                onClick={() => {
                  setCategory('all');
                  setQuery('');
                }}
              >
                Reset filters
              </button>
            }
          />
        ) : (
          <>
            <p className="mb-5 text-[12px] uppercase tracking-[0.1em] text-ink-muted">
              {pagination?.total || items.length}{' '}
              {pagination?.total === 1 ? 'project' : 'projects'}
              {category !== 'all' && ` · ${CATEGORY_LABELS[category]}`}
            </p>
            <div className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {pagination?.hasNext && (
              <div className="mt-9 flex justify-center">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => load(page + 1, false)}
                  disabled={loadingMore}
                >
                  {loadingMore && <Spinner className="h-3.5 w-3.5" />}
                  Load more projects
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
