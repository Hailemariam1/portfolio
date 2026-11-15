import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { CATEGORY_LABELS } from '../lib/format.js';
import { AdminCard, AdminPageHeader } from './AdminLayout.jsx';
import { Field, LoadingBlock, Spinner } from '../components/ui.jsx';
import MarkdownEditor from '../components/MarkdownEditor.jsx';
import { GalleryUpload, ImageUpload } from '../components/Uploads.jsx';
import { useToast } from '../context/ToastContext.jsx';

const EMPTY_FORM = {
  title: '',
  slug: '',
  shortDescription: '',
  overview: '',
  description: '',
  problem: '',
  category: 'academic',
  technologiesText: '',
  responsibilitiesText: '',
  featuresText: '',
  challenges: [],
  thumbnail: null,
  images: [],
  githubUrl: '',
  liveUrl: '',
  status: 'draft',
  featured: false
};

const splitLines = (value = '') =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const splitTech = (value = '') =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function ProjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    api
      .get(`/admin/projects/${id}`)
      .then(({ project }) => {
        if (!active) return;
        setForm({
          ...EMPTY_FORM,
          ...project,
          technologiesText: (project.technologies || []).join(', '),
          responsibilitiesText: (project.responsibilities || []).join('\n'),
          featuresText: (project.features || []).join('\n'),
          challenges: project.challenges || [],
          thumbnail: project.thumbnail || null,
          images: project.images || []
        });
      })
      .catch((error) => toast.error(error.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isEdit, toast]);

  const set = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const updateChallenge = (index, field, value) => {
    setForm((current) => ({
      ...current,
      challenges: current.challenges.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {
      title: form.title,
      slug: form.slug,
      shortDescription: form.shortDescription,
      overview: form.overview,
      description: form.description,
      problem: form.problem,
      category: form.category,
      technologies: splitTech(form.technologiesText),
      responsibilities: splitLines(form.responsibilitiesText),
      features: splitLines(form.featuresText),
      challenges: form.challenges
        .map((challenge) => ({
          problem: (challenge.problem || '').trim(),
          approach: (challenge.approach || '').trim()
        }))
        .filter((challenge) => challenge.problem && challenge.approach),
      thumbnail: form.thumbnail || null,
      images: form.images || [],
      githubUrl: form.githubUrl,
      liveUrl: form.liveUrl,
      status: form.status,
      featured: Boolean(form.featured)
    };

    try {
      if (isEdit) {
        await api.put(`/admin/projects/${id}`, payload);
        toast.success('Project updated.');
      } else {
        await api.post('/admin/projects', payload);
        toast.success(
          payload.status === 'published' ? 'Project created and published.' : 'Draft created.'
        );
      }
      navigate('/admin/projects');
    } catch (error) {
      if (error.details?.length) {
        setErrors(Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])));
      }
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading project…" />;

  return (
    <>
      <AdminPageHeader
        title={isEdit ? 'Edit project' : 'New project'}
        description="The public case study is built from these fields: overview, problem, your responsibilities, features and challenges."
        action={
          <>
            <Link to="/admin/projects" className="btn-secondary btn-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            {isEdit && form.status === 'published' && (
              <a
                href={`/projects/${form.slug}`}
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
          <AdminCard title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project title" htmlFor="title" error={errors.title} required>
                <input
                  id="title"
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  value={form.title}
                  onChange={set('title')}
                  placeholder="Campus Course Registration Portal"
                />
              </Field>
              <Field
                label="Slug"
                htmlFor="slug"
                error={errors.slug}
                hint="Leave blank to generate from the title."
              >
                <input
                  id="slug"
                  className={`input ${errors.slug ? 'input-error' : ''}`}
                  value={form.slug}
                  onChange={set('slug')}
                  placeholder="campus-course-registration-portal"
                />
              </Field>
            </div>

            <Field
              label="Short description"
              htmlFor="shortDescription"
              error={errors.shortDescription}
              hint="One or two sentences shown on cards and in search results. Maximum 320 characters."
              required
            >
              <textarea
                id="shortDescription"
                rows={3}
                className={`input resize-y ${errors.shortDescription ? 'input-error' : ''}`}
                value={form.shortDescription}
                onChange={set('shortDescription')}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project category" htmlFor="category" error={errors.category} required>
                <select
                  id="category"
                  className="input"
                  value={form.category}
                  onChange={set('category')}
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status" htmlFor="status" hint="Drafts are never returned by the public API.">
                <select id="status" className="input" value={form.status} onChange={set('status')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>

            <label className="flex items-start gap-2.5 rounded-xl border border-line bg-paper-2/40 px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(form.featured)}
                onChange={set('featured')}
                className="mt-0.5 h-4 w-4 rounded border-line-strong text-clay focus:ring-clay"
              />
              <span>
                <span className="block text-[13px] font-medium text-ink">Feature on the homepage</span>
                <span className="block text-[11.5px] text-ink-muted">
                  Featured projects appear first on the projects page.
                </span>
              </span>
            </label>
          </AdminCard>

          <AdminCard
            title="Case study"
            description="Give the problem and the build in your own words."
          >
            <Field
              label="Project overview"
              htmlFor="overview"
              hint="Two or three sentences: what it is and who it was for."
            >
              <textarea
                id="overview"
                rows={3}
                className="input resize-y"
                value={form.overview}
                onChange={set('overview')}
              />
            </Field>

            <Field
              label="Problem being solved"
              htmlFor="problem"
              hint="What was broken, slow or missing before this project?"
            >
              <textarea
                id="problem"
                rows={3}
                className="input resize-y"
                value={form.problem}
                onChange={set('problem')}
              />
            </Field>

            <MarkdownEditor
              value={form.description}
              onChange={(value) => {
                setForm((current) => ({ ...current, description: value }));
                setErrors((current) => ({ ...current, description: '' }));
              }}
              label="Full write-up (Markdown)"
              error={errors.description}
            />
          </AdminCard>

          <AdminCard
            title="Your contribution"
            description="One item per line. This is what separates a case study from a screenshot."
          >
            <Field
              label="My specific responsibilities"
              htmlFor="responsibilities"
              hint="What you personally built, decided or deployed."
            >
              <textarea
                id="responsibilities"
                rows={5}
                className="input resize-y"
                value={form.responsibilitiesText}
                onChange={set('responsibilitiesText')}
                placeholder={'Designed the MongoDB schemas\nBuilt the authentication layer\nDeployed the API'}
              />
            </Field>

            <Field label="Important features implemented" htmlFor="features" hint="One per line.">
              <textarea
                id="features"
                rows={5}
                className="input resize-y"
                value={form.featuresText}
                onChange={set('featuresText')}
              />
            </Field>
          </AdminCard>

          <AdminCard
            title="Technical challenges"
            description="Describe the problem, then how you actually approached it."
          >
            {form.challenges.length === 0 && (
              <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-[12.5px] text-ink-muted">
                No challenges added yet. A specific one is more convincing than “I learned a lot”.
              </p>
            )}

            {form.challenges.map((challenge, index) => (
              <div key={index} className="rounded-xl border border-line bg-paper-2/30 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Challenge {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        challenges: current.challenges.filter((_, itemIndex) => itemIndex !== index)
                      }))
                    }
                    className="rounded-md p-1 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove challenge ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    className="input resize-y text-[13px]"
                    placeholder="The problem: what went wrong?"
                    value={challenge.problem}
                    onChange={(event) => updateChallenge(index, 'problem', event.target.value)}
                  />
                  <textarea
                    rows={3}
                    className="input resize-y text-[13px]"
                    placeholder="How I approached it: the fix and how you verified it."
                    value={challenge.approach}
                    onChange={(event) => updateChallenge(index, 'approach', event.target.value)}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  challenges: [...current.challenges, { problem: '', approach: '' }]
                }))
              }
              className="btn-secondary btn-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add challenge
            </button>
          </AdminCard>

          <AdminCard title="Screenshots" description="Stored in Cloudinary; only URLs are saved in MongoDB.">
            <GalleryUpload
              images={form.images}
              onChange={(images) => setForm((current) => ({ ...current, images }))}
            />
          </AdminCard>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <AdminCard title="Thumbnail">
            <ImageUpload
              value={form.thumbnail}
              onChange={(thumbnail) => setForm((current) => ({ ...current, thumbnail }))}
              label="Card image"
            />
          </AdminCard>

          <AdminCard title="Technologies used">
            <Field
              label="Stack"
              htmlFor="technologies"
              error={errors.technologies}
              hint="Comma separated: React, Node.js, MongoDB."
            >
              <input
                id="technologies"
                className="input"
                value={form.technologiesText}
                onChange={set('technologiesText')}
                placeholder="React, Node.js, MongoDB"
              />
            </Field>
            {splitTech(form.technologiesText).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {splitTech(form.technologiesText).map((tech) => (
                  <span key={tech} className="chip">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard title="Links">
            <Field label="GitHub repository" htmlFor="githubUrl" error={errors.githubUrl}>
              <input
                id="githubUrl"
                className={`input ${errors.githubUrl ? 'input-error' : ''}`}
                value={form.githubUrl}
                onChange={set('githubUrl')}
                placeholder="https://github.com/you/project"
              />
            </Field>
            <Field
              label="Live demonstration"
              htmlFor="liveUrl"
              error={errors.liveUrl}
              hint="Leave empty if there is no public deployment."
            >
              <input
                id="liveUrl"
                className={`input ${errors.liveUrl ? 'input-error' : ''}`}
                value={form.liveUrl}
                onChange={set('liveUrl')}
                placeholder="https://project.example.com"
              />
            </Field>
          </AdminCard>

          <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
            </button>
            <Link to="/admin/projects" className="btn-ghost w-full text-center text-[13px]">
              Cancel
            </Link>
            <p className="text-center text-[11px] leading-relaxed text-ink-muted">
              {form.status === 'published'
                ? 'Published changes appear on the public site immediately.'
                : 'Saved as a draft — visible only in this dashboard.'}
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
