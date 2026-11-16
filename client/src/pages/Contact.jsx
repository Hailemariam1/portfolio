import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Github, Linkedin, Mail, MapPin, Send } from 'lucide-react';
import { api } from '../lib/api.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { AvailabilityBadge, Field, Spinner } from '../components/ui.jsx';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '', website: '' };

export default function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});
    setSending(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      setForm(EMPTY_FORM);
    } catch (error) {
      if (error.details?.length) {
        setErrors(
          Object.fromEntries(error.details.map((detail) => [detail.field, detail.message]))
        );
      } else {
        setErrors({ form: error.message || 'Your message could not be sent.' });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-page pt-12 sm:pt-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="reveal lg:col-span-5">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 text-[2.3rem] leading-[1.08] sm:text-[2.9rem]">
            Let&rsquo;s talk about a role, a project or a problem.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            I answer every message myself, usually within a day or two. If you have a junior role, a
            freelance build or a question about something I wrote, this form reaches me directly.
          </p>

          <div className="mt-7">
            <AvailabilityBadge />
          </div>

          <dl className="mt-8 space-y-4 border-t border-line pt-6 text-sm">
            {settings.email && (
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-ink-muted" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Email
                  </dt>
                  <dd>
                    <a href={`mailto:${settings.email}`} className="link-underline">
                      {settings.email}
                    </a>
                  </dd>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-ink-muted" />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Location
                </dt>
                <dd className="text-ink-soft">{settings.location} · remote friendly</dd>
              </div>
            </div>
            {settings.githubUrl && (
              <div className="flex items-start gap-3">
                <Github className="mt-0.5 h-4 w-4 text-ink-muted" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    GitHub
                  </dt>
                  <dd>
                    <a
                      href={settings.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline"
                    >
                      View repositories
                    </a>
                  </dd>
                </div>
              </div>
            )}
            {settings.linkedinUrl && (
              <div className="flex items-start gap-3">
                <Linkedin className="mt-0.5 h-4 w-4 text-ink-muted" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    LinkedIn
                  </dt>
                  <dd>
                    <a
                      href={settings.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline"
                    >
                      Connect with me
                    </a>
                  </dd>
                </div>
              </div>
            )}
          </dl>
        </div>

        <div className="reveal lg:col-span-7">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-glow sm:p-8">
            {sent ? (
              <div className="flex flex-col items-start gap-4 py-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-moss-soft text-moss">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-2xl">Message sent.</h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                    Thanks for reaching out. Your message is saved and I&rsquo;ll reply to the email
                    address you gave. If it is urgent, you can also email me directly.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary btn-xs"
                    onClick={() => setSent(false)}
                  >
                    Send another message
                  </button>
                  {settings.email && (
                    <a href={`mailto:${settings.email}`} className="btn-primary btn-xs">
                      Email instead
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Your name" htmlFor="name" error={errors.name} required>
                    <input
                      id="name"
                      name="name"
                      className={`input ${errors.name ? 'input-error' : ''}`}
                      value={form.name}
                      onChange={update('name')}
                      autoComplete="name"
                      placeholder="Ada Lovelace"
                    />
                  </Field>
                  <Field label="Email address" htmlFor="email" error={errors.email} required>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`input ${errors.email ? 'input-error' : ''}`}
                      value={form.email}
                      onChange={update('email')}
                      autoComplete="email"
                      placeholder="you@company.com"
                    />
                  </Field>
                </div>

                <Field label="Subject" htmlFor="subject" error={errors.subject}>
                  <input
                    id="subject"
                    name="subject"
                    className={`input ${errors.subject ? 'input-error' : ''}`}
                    value={form.subject}
                    onChange={update('subject')}
                    placeholder="Junior full-stack role at …"
                  />
                </Field>

                <Field
                  label="Message"
                  htmlFor="message"
                  error={errors.message}
                  hint="A sentence about the role or project, and what you would like to know, is plenty."
                  required
                >
                  <textarea
                    id="message"
                    name="message"
                    rows={7}
                    className={`input resize-y ${errors.message ? 'input-error' : ''}`}
                    value={form.message}
                    onChange={update('message')}
                    placeholder="Hi Hailemariam, we are hiring a junior full-stack developer…"
                  />
                </Field>

                {/* Honeypot for bots — hidden from people and assistive technology. */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={update('website')}
                  />
                </div>

                {errors.form && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/[0.08] dark:text-red-200">
                    {errors.form}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <p className="text-[11.5px] leading-relaxed text-ink-muted">
                    Your details are used only to reply to this message.
                  </p>
                  <button type="submit" className="btn-primary" disabled={sending}>
                    {sending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    {sending ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
