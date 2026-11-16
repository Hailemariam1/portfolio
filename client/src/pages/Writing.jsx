import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, NotebookPen } from 'lucide-react';
import { api, toQuery } from '../lib/api.js';
import { formatDate, readingTime } from '../lib/format.js';
import { EmptyState, ErrorBlock, LoadingBlock } from '../components/ui.jsx';

export default function Writing() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/blog/categories')
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api
      .get(`/blog${toQuery({ limit: 24, category: category === 'all' ? undefined : category })}`)
      .then((data) => active && setPosts(data.items || []))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category]);

  return (
    <div className="container-page pt-12 sm:pt-16">
      <header className="reveal max-w-3xl">
        <p className="eyebrow">Writing</p>
        <h1 className="mt-3 text-[2.3rem] leading-[1.08] sm:text-[3rem]">
          Notes from building things.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          I write about the problems I actually ran into — validation, authentication, deployment
          mistakes — mostly so future me can find the answer faster. Articles are drafted and published
          from the dashboard.
        </p>
      </header>

      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-1.5 border-y border-line py-3">
          {['all', ...categories].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                category === item
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              {item === 'all' ? 'All writing' : item}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {error ? (
          <ErrorBlock message={error} />
        ) : loading ? (
          <LoadingBlock label="Loading articles…" />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="No articles published yet"
            description="Published articles appear here automatically. Drafts stay private inside the dashboard."
          />
        ) : (
          <div className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/writing/${post.slug}`}
                className="reveal group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-line-strong hover:shadow-glow"
              >
                <div className="relative aspect-[16/9] border-b border-line bg-paper-2">
                  {post.coverImage?.url ? (
                    <img
                      src={post.coverImage.url}
                      alt={post.coverImage.alt || post.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <NotebookPen className="h-6 w-6 text-ink/20" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3">
                    <span className="inline-flex rounded-full border border-line bg-surface/95 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                      {post.category}
                    </span>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[11.5px] uppercase tracking-[0.08em] text-ink-muted">
                    {formatDate(post.publishedAt)} · {readingTime(post.readingMinutes)}
                  </p>
                  <h2 className="mt-2 font-display text-[1.3rem] leading-snug transition group-hover:text-clay-deep">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-ink-soft">
                    {post.excerpt}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[12.5px] font-medium text-clay-deep">
                    Read article
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
