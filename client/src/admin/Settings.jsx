import { useEffect, useState } from 'react';
import { ArrowUpRight, Mail, Save } from 'lucide-react';
import { api } from '../lib/api.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { AdminCard, AdminPageHeader } from './AdminLayout.jsx';
import { Field, LoadingBlock, Spinner } from '../components/ui.jsx';
import { ImageUpload, ResumeUpload } from '../components/Uploads.jsx';
import { DEFAULT_HOME } from '../lib/homeDefaults.js';

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

const SECTION_GROUPS = [
  {
    prefix: 'capabilities',
    title: 'Capability cards heading',
    hint: 'Sits above the capability cards.'
  },
  {
    prefix: 'work',
    title: 'Selected work heading',
    hint: 'Sits above the featured projects.'
  },
  {
    prefix: 'skills',
    title: 'Skills heading',
    hint: 'Sits beside the skills groups.'
  },
  {
    prefix: 'writing',
    title: 'Writing heading',
    hint: 'Sits above the latest posts.'
  }
];

function SectionCopyGroup({ group, home, errors, onChange }) {
  const key = (suffix) => `${group.prefix}${suffix}`;

  return (
    <div className="rounded-xl border border-line bg-paper-2/40 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {group.title}
      </p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{group.hint}</p>
      <div className="mt-3 grid gap-3">
        <Field label="Eyebrow" htmlFor={key('Eyebrow')} error={errors[`home.${key('Eyebrow')}`]}>
          <input
            id={key('Eyebrow')}
            maxLength={80}
            className="input"
            value={home[key('Eyebrow')] || ''}
            onChange={(event) => onChange(key('Eyebrow'), event.target.value)}
          />
        </Field>
        <Field label="Heading" htmlFor={key('Title')} error={errors[`home.${key('Title')}`]}>
          <input
            id={key('Title')}
            maxLength={200}
            className="input"
            value={home[key('Title')] || ''}
            onChange={(event) => onChange(key('Title'), event.target.value)}
          />
        </Field>
        <Field
          label="Supporting text"
          htmlFor={key('Intro')}
          error={errors[`home.${key('Intro')}`]}
        >
          <textarea
            id={key('Intro')}
            rows={2}
            maxLength={600}
            className="input resize-y"
            value={home[key('Intro')] || ''}
            onChange={(event) => onChange(key('Intro'), event.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { reload } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

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
        next.home = { ...DEFAULT_HOME, ...(settings.home || {}) };
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

  const setHome = (field, value) => {
    setForm((current) => ({ ...current, home: { ...current.home, [field]: value } }));
    setErrors((current) => ({ ...current, [`home.${field}`]: '' }));
  };

  const setCapability = (index, field, value) => {
    setForm((current) => ({
      ...current,
      home: {
        ...current.home,
        capabilities: current.home.capabilities.map((card, position) =>
          position === index ? { ...card, [field]: value } : card
        )
      }
    }));
  };

  const addCapability = () => {
    setForm((current) => ({
      ...current,
      home: {
        ...current.home,
        capabilities: [...current.home.capabilities, { title: '', body: '' }]
      }
    }));
  };

  const removeCapability = (index) => {
    setForm((current) => ({
      ...current,
      home: {
        ...current.home,
        capabilities: current.home.capabilities.filter((_, position) => position !== index)
      }
    }));
  };

  const setTestimonial = (index, field, value) => {
    setForm((current) => ({
      ...current,
      home: {
        ...current.home,
        testimonials: current.home.testimonials.map((item, position) =>
          position === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const addTestimonial = () => {
    setForm((current) => ({
      ...current,
      home: {
        ...current.home,
        testimonials: [
          ...current.home.testimonials,
          { quote: '', name: '', role: '', company: '' }
        ]
      }
    }));
  };

  const removeTestimonial = (index) => {
    setForm((current) => ({
      ...current,
      home: {
        ...current.home,
        testimonials: current.home.testimonials.filter((_, position) => position !== index)
      }
    }));
  };

  const setFocusRow = (index, field, value) => {
    setForm((current) => ({
      ...current,
      home: {
        ...current.home,
        focusRows: current.home.focusRows.map((row, position) =>
          position === index ? { ...row, [field]: value } : row
        )
      }
    }));
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

  const testEmail = async () => {
    setTestingEmail(true);
    try {
      const { recipient } = await api.post('/admin/settings/test-email');
      toast.success(`Test email sent to ${recipient}. Check that inbox and spam folder.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading || !form) return <LoadingBlock label="Loading settings…" />;

  return (
    <>
      <AdminPageHeader
        title="Site settings"
        description="Everything here appears on the public site: the landing page copy, headline, introduction, availability indicator, contact links and footer."
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

          <AdminCard title="Landing page hero">
            <Field
              label="Line beside your location"
              htmlFor="heroNote"
              error={errors['home.heroNote']}
              hint="Shown under the hero buttons, next to your location. Leave it empty to hide the line."
            >
              <input
                id="heroNote"
                maxLength={160}
                className="input"
                value={form.home.heroNote || ''}
                onChange={(event) => setHome('heroNote', event.target.value)}
              />
            </Field>
          </AdminCard>

          <AdminCard title="Capability cards">
            <p className="mb-4 text-[12px] leading-relaxed text-ink-muted">
              The cards under the capability heading. Their icons follow the order of the cards.
            </p>
            <div className="space-y-3">
              {form.home.capabilities.map((card, index) => (
                <div key={index} className="rounded-xl border border-line bg-paper-2/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      Card {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeCapability(index)}
                      className="text-[11px] font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3">
                    <Field label="Title" htmlFor={`capability-${index}-title`}>
                      <input
                        id={`capability-${index}-title`}
                        maxLength={120}
                        className="input"
                        value={card.title || ''}
                        onChange={(event) => setCapability(index, 'title', event.target.value)}
                      />
                    </Field>
                    <Field label="Description" htmlFor={`capability-${index}-body`}>
                      <textarea
                        id={`capability-${index}-body`}
                        rows={3}
                        maxLength={400}
                        className="input resize-y"
                        value={card.body || ''}
                        onChange={(event) => setCapability(index, 'body', event.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            {form.home.capabilities.length < 8 && (
              <button type="button" onClick={addCapability} className="btn-secondary btn-xs mt-3">
                Add a card
              </button>
            )}
          </AdminCard>

          <AdminCard title="Section headings">
            <div className="grid gap-3 sm:grid-cols-2">
              {SECTION_GROUPS.map((group) => (
                <SectionCopyGroup
                  key={group.prefix}
                  group={group}
                  home={form.home}
                  errors={errors}
                  onChange={setHome}
                />
              ))}
            </div>
          </AdminCard>

          <AdminCard title="Testimonials">
            <p className="mb-4 text-[12px] leading-relaxed text-ink-muted">
              Add testimonials here when you have permission to publish them. The section stays hidden
              until at least one testimonial is added.
            </p>
            <div className="space-y-3">
              {form.home.testimonials.map((testimonial, index) => (
                <div key={index} className="rounded-xl border border-line bg-paper-2/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      Testimonial {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeTestimonial(index)}
                      className="text-[11px] font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3">
                    <Field label="Quote" htmlFor={`testimonial-${index}-quote`}>
                      <textarea
                        id={`testimonial-${index}-quote`}
                        rows={3}
                        maxLength={800}
                        className="input resize-y"
                        value={testimonial.quote || ''}
                        onChange={(event) => setTestimonial(index, 'quote', event.target.value)}
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Name" htmlFor={`testimonial-${index}-name`}>
                        <input
                          id={`testimonial-${index}-name`}
                          maxLength={120}
                          className="input"
                          value={testimonial.name || ''}
                          onChange={(event) => setTestimonial(index, 'name', event.target.value)}
                        />
                      </Field>
                      <Field label="Role" htmlFor={`testimonial-${index}-role`}>
                        <input
                          id={`testimonial-${index}-role`}
                          maxLength={160}
                          className="input"
                          value={testimonial.role || ''}
                          onChange={(event) => setTestimonial(index, 'role', event.target.value)}
                        />
                      </Field>
                      <Field label="Company" htmlFor={`testimonial-${index}-company`}>
                        <input
                          id={`testimonial-${index}-company`}
                          maxLength={160}
                          className="input"
                          value={testimonial.company || ''}
                          onChange={(event) => setTestimonial(index, 'company', event.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {form.home.testimonials.length < 12 && (
              <button type="button" onClick={addTestimonial} className="btn-secondary btn-xs mt-3">
                Add testimonial
              </button>
            )}
          </AdminCard>

          <AdminCard title="Closing call to action">
            <div className="grid gap-4">
              <Field label="Eyebrow" htmlFor="ctaEyebrow" error={errors['home.ctaEyebrow']}>
                <input
                  id="ctaEyebrow"
                  maxLength={80}
                  className="input"
                  value={form.home.ctaEyebrow || ''}
                  onChange={(event) => setHome('ctaEyebrow', event.target.value)}
                />
              </Field>
              <Field label="Heading" htmlFor="ctaTitle" error={errors['home.ctaTitle']}>
                <input
                  id="ctaTitle"
                  maxLength={200}
                  className="input"
                  value={form.home.ctaTitle || ''}
                  onChange={(event) => setHome('ctaTitle', event.target.value)}
                />
              </Field>
              <Field label="Body" htmlFor="ctaBody" error={errors['home.ctaBody']}>
                <textarea
                  id="ctaBody"
                  rows={3}
                  maxLength={600}
                  className="input resize-y"
                  value={form.home.ctaBody || ''}
                  onChange={(event) => setHome('ctaBody', event.target.value)}
                />
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="“Where I work” panel">
            <p className="mb-4 text-[12px] leading-relaxed text-ink-muted">
              Shown beside the hero while no profile photograph is uploaded.
            </p>
            <Field label="Panel heading" htmlFor="focusTitle" error={errors['home.focusTitle']}>
              <input
                id="focusTitle"
                maxLength={80}
                className="input"
                value={form.home.focusTitle || ''}
                onChange={(event) => setHome('focusTitle', event.target.value)}
              />
            </Field>
            <div className="mt-4 space-y-3">
              {form.home.focusRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border border-line bg-paper-2/40 p-4 sm:grid-cols-[minmax(0,10rem)_1fr]"
                >
                  <Field label={`Row ${index + 1} label`} htmlFor={`focus-${index}-label`}>
                    <input
                      id={`focus-${index}-label`}
                      maxLength={40}
                      className="input"
                      value={row.label || ''}
                      onChange={(event) => setFocusRow(index, 'label', event.target.value)}
                    />
                  </Field>
                  <Field label="Text" htmlFor={`focus-${index}-text`}>
                    <input
                      id={`focus-${index}-text`}
                      maxLength={240}
                      className="input"
                      value={row.text || ''}
                      onChange={(event) => setFocusRow(index, 'text', event.target.value)}
                    />
                  </Field>
                </div>
              ))}
            </div>
            <Field label="“Right now” note" htmlFor="focusNote" error={errors['home.focusNote']} className="mt-4">
              <textarea
                id="focusNote"
                rows={3}
                maxLength={600}
                className="input resize-y"
                value={form.home.focusNote || ''}
                onChange={(event) => setHome('focusNote', event.target.value)}
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
            <button
              type="button"
              onClick={testEmail}
              className="btn-secondary btn-xs mt-4"
              disabled={testingEmail}
            >
              <Mail className="h-3.5 w-3.5" />
              {testingEmail ? 'Sending test…' : 'Send test email'}
            </button>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
              Uses the configured SMTP settings and sends to CONTACT_NOTIFY_EMAIL, or this site email.
            </p>
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
