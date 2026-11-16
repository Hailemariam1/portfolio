import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatDate, readingTime } from '../lib/format.js';
import Markdown from '../components/Markdown.jsx';
import { ErrorBlock, LoadingBlock } from '../components/ui.jsx';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/blog/${slug}`)
      .then((data) => active && setPost(data.post))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page">
        <LoadingBlock label="Loading article…" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container-page max-w-2xl pt-16">
        <ErrorBlock
          title="Article not found"
          message={error || 'This article does not exist or is still a draft.'}
          action={
            <Link to="/writing" className="btn-secondary btn-xs">
              Back to writing
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <article className="container-page max-w-3xl pt-10 sm:pt-14">
      <Link
        to="/writing"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All writing
      </Link>

      <header className="reveal mt-6 border-b border-line pb-8">
        <p className="eyebrow">{post.category}</p>
        <h1 className="mt-3 text-[2.1rem] leading-[1.1] sm:text-[2.7rem]">{post.title}</h1>
        <p className="mt-3 text-[14px] text-ink-muted">
          {formatDate(post.publishedAt)} · {readingTime(post.readingMinutes)}
        </p>
        {post.excerpt && (
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-soft">{post.excerpt}</p>
        )}
      </header>

      {post.coverImage?.url && (
        <div className="reveal reveal--scale mt-8 overflow-hidden rounded-2xl border border-line bg-paper-2">
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="reveal mt-9">
        <Markdown>{post.content}</Markdown>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
        <p className="text-[13px] text-ink-muted">Written by Hailemariam.</p>
        <div className="flex gap-2">
          <Link to="/writing" className="btn-secondary btn-xs">
            More writing
          </Link>
          <Link to="/contact" className="btn-primary btn-xs">
            Get in touch
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
