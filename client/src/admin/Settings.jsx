import { useEffect, useState } from 'react';
import { ArrowUpRight, Save } from 'lucide-react';
import { api } from '../lib/api.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { AdminCard, AdminPageHeader } from './AdminLayout.jsx';
import { Field, LoadingBlock, Spinner } from '../components/ui.jsx';
import { ImageUpload, ResumeUpload } from '../components/Uploads.jsx';

const FIELDS = [
  'name',
  'role',
  'headline',
  'intro',
  'about',
  'location',
  'email',
  'githubUrl',
  'linkedinUrl',
  'availabilityStatus',
  'availabilityNote',
  'footerText'
];

export default function SettingsPage() {
  const { reload } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get('/settings')
      .then(({ settings }) => {
        if (!active) return;
        const next = {};
        FIELDS.forEach((field) => {
          next[field] = settings[field] ?? '';
        });
        next.profilePhoto = settings.profilePhoto || null;
        next.resume = settings.resume || null;
        setForm(next);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [toast]);

  const set = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api.put('/admin/settings', {
        ...form,
        profilePhoto: form.profilePhoto || null,
        resume: form.resume || null
      });
      await reload();
      toast.success('Site settings saved. The public site is updated.');
    } catch (error) {
      if (error.details?.length) {
        setErrors(Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])));
      }
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <LoadingBlock label="Loading settings…" />;

  return (
    <>
      <AdminPageHeader
        title="Site settings"
        description="Everything here appears on the public site: the homepage headline, introduction, availability indicator, contact links and footer."
        action={
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary btn-xs">
            Preview site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        }
      />

      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <AdminCard title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="name" error={errors.name}>
                <input id="name" className="input" value={form.name} onChange={set('name')} />
              </Field>
              <Field
                label="Professional headline"
                htmlFor="role"
                error={errors.role}
                hint="Shown under your name and in the hero section."
              >
                <input id="role" className="input" value={form.role} onChange={set('role')} />
              </Field>
            </div>

            <Field
              label="Homepage headline"
              htmlFor="headline"
              error={errors.headline}
              hint="The large sentence at the top of the homepage."
            >
              <textarea
                id="headline"
                rows={2}
                className="input resize-y"
                value={form.headline}
                onChange={set('headline')}
              />
            </Field>

            <Field
              label="Introduction"
              htmlFor="intro"
              error={errors.intro}
              hint="The supporting paragraph under the headline."
            >
              <textarea
                id="intro"
                rows={4}
                className="input resize-y"
                value={form.intro}
                onChange={set('intro')}
              />
            </Field>

            <Field
              label="About page text"
              htmlFor="about"
              error={errors.about}
              hint="Separate paragraphs with a blank line."
            >
              <textarea
                id="about"
                rows={8}
                className="input resize-y"
                value={form.about}
                onChange={set('about')}
              />
            </Field>
          </AdminCard>

          <AdminCard title="Contact and links">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email address" htmlFor="email" error={errors.email}>
                <input id="email" type="email" className="input" value={form.email} onChange={set('email')} />
              </Field>
              <Field label="Location" htmlFor="location" error={errors.location}>
                <input
                  id="location"
                  className="input"
                  value={form.location}
                  onChange={set('location')}
                />
              </Field>
              <Field label="GitHub profile" htmlFor="githubUrl" error={errors.githubUrl}>
                <input
                  id="githubUrl"
                  className="input"
                  value={form.githubUrl}
                  onChange={set('githubUrl')}
                  placeholder="https://github.com/…"
                />
              </Field>
              <Field label="LinkedIn profile" htmlFor="linkedinUrl" error={errors.linkedinUrl}>
                <input
                  id="linkedinUrl"
                  className="input"
                  value={form.linkedinUrl}
                  onChange={set('linkedinUrl')}
                  placeholder="https://www.linkedin.com/in/…"
                />
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="Availability">
            <label className="flex items-start gap-2.5 rounded-xl border border-line bg-paper-2/40 px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(form.availabilityStatus)}
                onChange={set('availabilityStatus')}
                className="mt-0.5 h-4 w-4 rounded border-line-strong text-clay focus:ring-clay"
              />
              <span>
                <span className="block text-[13px] font-medium text-ink">
                  Available for work
                </span>
                <span className="block text-[11.5px] text-ink-muted">
                  Shows the green indicator in the header, hero and footer.
                </span>
              </span>
            </label>
            <Field
              label="Availability note"
              htmlFor="availabilityNote"
              hint="Short status line, e.g. “Open to junior full-stack roles and freelance projects”."
            >
              <input
                id="availabilityNote"
                className="input"
                value={form.availabilityNote}
                onChange={set('availabilityNote')}
              />
            </Field>
          </AdminCard>

          <AdminCard title="Footer">
            <Field label="Footer text" htmlFor="footerText" error={errors.footerText}>
              <textarea
                id="footerText"
                rows={2}
                className="input resize-y"
                value={form.footerText}
                onChange={set('footerText')}
              />
            </Field>
          </AdminCard>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <AdminCard title="Profile photograph">
            <ImageUpload
              value={form.profilePhoto}
              onChange={(profilePhoto) => setForm((current) => ({ ...current, profilePhoto }))}
              label="Photo"
              hint="A portrait works best (4:5). JPG, PNG or WebP up to 5 MB."
            />
          </AdminCard>

          <AdminCard title="Resume">
            <ResumeUpload
              value={form.resume}
              onChange={(resume) => setForm((current) => ({ ...current, resume }))}
            />
          </AdminCard>

          <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save settings'}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-ink-muted">
              Changes are applied to the public site immediately.
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
