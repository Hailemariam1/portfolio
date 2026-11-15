import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api.js';
import { toInputDate } from '../lib/format.js';
import { AdminCard, AdminPageHeader } from './AdminLayout.jsx';
import { Field, LoadingBlock, Spinner } from '../components/ui.jsx';
import MarkdownEditor from '../components/MarkdownEditor.jsx';
import { ImageUpload } from '../components/Uploads.jsx';
import { useToast } from '../context/ToastContext.jsx';

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  category: 'Engineering notes',
  content: '',
  coverImage: null,
  status: 'draft',
  publishedAt: ''
};

export default function BlogForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    api
      .get(`/admin/blog/${id}`)
      .then(({ post }) => {
        if (!active) return;
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          category: post.category || 'Notes',
          content: post.content || '',
          coverImage: post.coverImage || null,
          status: post.status,
          publishedAt: toInputDate(post.publishedAt)
        });
      })
      .catch((error) => toast.error(error.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isEdit, toast]);

  const set = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      category: form.category,
      content: form.content,
      coverImage: form.coverImage || null,
      status: form.status,
      publishedAt: form.publishedAt || null
    };

    try {
      if (isEdit) {
        await api.put(`/admin/blog/${id}`, payload);
        toast.success('Article updated.');
      } else {
        await api.post('/admin/blog', payload);
        toast.success(payload.status === 'published' ? 'Article published.' : 'Draft saved.');
      }
      navigate('/admin/blog');
    } catch (error) {
      if (error.details?.length) {
        setErrors(Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])));
      }
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading article…" />;

  return (
    <>
      <AdminPageHeader
        title={isEdit ? 'Edit article' : 'New article'}
        description="Write in Markdown. Headings, links, lists and fenced code blocks render on the public page."
        action={
          <>
            <Link to="/admin/blog" className="btn-secondary btn-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            {isEdit && form.status === 'published' && (
              <a
                href={`/writing/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-xs"
              >
                View live
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </>
        }
      />

      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <AdminCard title="Article">
            <Field label="Title" htmlFor="post-title" error={errors.title} required>
              <input
                id="post-title"
                className={`input ${errors.title ? 'input-error' : ''}`}
                value={form.title}
                onChange={set('title')}
                placeholder="How I stopped shipping broken forms"
              />
            </Field>

            <Field label="Slug" htmlFor="post-slug" error={errors.slug} hint="Leave blank to generate.">
              <input
                id="post-slug"
                className={`input ${errors.slug ? 'input-error' : ''}`}
                value={form.slug}
                onChange={set('slug')}
                placeholder="how-i-stopped-shipping-broken-forms"
              />
            </Field>

            <Field
              label="Excerpt"
              htmlFor="post-excerpt"
              error={errors.excerpt}
              hint="Shown on cards and in search results. One or two sentences."
            >
              <textarea
                id="post-excerpt"
                rows={3}
                className={`input resize-y ${errors.excerpt ? 'input-error' : ''}`}
                value={form.excerpt}
                onChange={set('excerpt')}
              />
            </Field>

            <MarkdownEditor
              value={form.content}
              onChange={(value) => setForm((current) => ({ ...current, content: value }))}
              label="Article content"
              rows={22}
              error={errors.content}
            />
          </AdminCard>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <AdminCard title="Publishing">
            <Field label="Status" htmlFor="post-status">
              <select id="post-status" className="input" value={form.status} onChange={set('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field
              label="Publication date"
              htmlFor="post-date"
              hint="Leave blank to use the moment you publish."
            >
              <input
                id="post-date"
                type="date"
                className="input"
                value={form.publishedAt}
                onChange={set('publishedAt')}
              />
            </Field>
            <Field label="Category" htmlFor="post-category" hint="e.g. Engineering notes, Learning in public.">
              <input
                id="post-category"
                className="input"
                value={form.category}
                onChange={set('category')}
              />
            </Field>
          </AdminCard>

          <AdminCard title="Cover image">
            <ImageUpload
              value={form.coverImage}
              onChange={(coverImage) => setForm((current) => ({ ...current, coverImage }))}
              label="Cover"
            />
          </AdminCard>

          <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save article'}
            </button>
            <Link to="/admin/blog" className="btn-ghost w-full text-center text-[13px]">
              Cancel
            </Link>
            <p className="text-center text-[11px] leading-relaxed text-ink-muted">
              {form.status === 'published'
                ? 'Published articles appear in the writing section immediately.'
                : 'Drafts are only visible in this dashboard.'}
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
