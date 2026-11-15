import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { EXP_TYPE_LABELS, EXP_TYPE_ORDER, formatRange } from '../lib/format.js';
import { AdminPageHeader } from './AdminLayout.jsx';
import {
  ConfirmDialog,
  EmptyState,
  ErrorBlock,
  Field,
  LoadingBlock,
  Modal,
  Spinner
} from '../components/ui.jsx';
import { useToast } from '../context/ToastContext.jsx';

const EMPTY = {
  type: 'education',
  title: '',
  organization: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  highlightsText: '',
  link: '',
  order: ''
};

export default function Experience() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/experience');
      setItems(data.items || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      type: entry.type,
      title: entry.title,
      organization: entry.organization || '',
      location: entry.location || '',
      startDate: entry.startDate || '',
      endDate: entry.endDate || '',
      current: Boolean(entry.current),
      description: entry.description || '',
      highlightsText: (entry.highlights || []).join('\n'),
      link: entry.link || '',
      order: entry.order ?? 0
    });
    setModalOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      type: form.type,
      title: form.title,
      organization: form.organization,
      location: form.location,
      startDate: form.startDate,
      endDate: form.current ? '' : form.endDate,
      current: form.current,
      description: form.description,
      highlights: form.highlightsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      link: form.link,
      ...(form.order === '' ? {} : { order: Number(form.order) })
    };

    try {
      if (editingId) {
        await api.put(`/admin/experience/${editingId}`, payload);
        toast.success('Entry updated.');
      } else {
        await api.post('/admin/experience', payload);
        toast.success('Entry added.');
      }
      setModalOpen(false);
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await api.del(`/admin/experience/${confirm.id}`);
      toast.success('Entry deleted.');
      setConfirm(null);
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  const move = async (entry, direction) => {
    const index = items.findIndex((item) => item.id === entry.id);
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    setPendingId(entry.id);
    try {
      await Promise.all(
        reordered
          .map((item, itemIndex) =>
            item.order === itemIndex
              ? null
              : api.put(`/admin/experience/${item.id}`, { order: itemIndex })
          )
          .filter(Boolean)
      );
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setPendingId(null);
    }
  };

  const grouped = EXP_TYPE_ORDER.map((type) => ({
    type,
    entries: items.filter((entry) => entry.type === type)
  })).filter((group) => group.entries.length > 0);

  return (
    <>
      <AdminPageHeader
        title="Experience & education"
        description="Education, internships, freelance work, collaborations, volunteering and certifications. Each entry is labelled on the public About page."
        action={
          <button type="button" className="btn-primary btn-xs" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Add entry
          </button>
        }
      />

      {error ? (
        <ErrorBlock message={error} action={<button className="btn-secondary btn-xs" onClick={load}>Try again</button>} />
      ) : loading ? (
        <LoadingBlock label="Loading entries…" />
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nothing here yet"
          description="Add your degree, any internships or freelance work, collaborations, volunteering and certifications."
          action={
            <button type="button" className="btn-primary btn-xs" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add the first entry
            </button>
          }
        />
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <section key={group.type} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="border-b border-line px-5 py-3">
                <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  {EXP_TYPE_LABELS[group.type]}
                </h2>
              </div>
              <ul className="divide-y divide-line">
                {group.entries.map((entry) => (
                  <li key={entry.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-ink">
                        {entry.title}
                        {entry.current && (
                          <span className="ml-2 rounded-full bg-moss-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-moss">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-[12px] text-ink-soft">
                        {[entry.organization, entry.location].filter(Boolean).join(' · ')}
                      </p>
                      <p className="text-[11.5px] text-ink-muted">
                        {formatRange(entry.startDate, entry.endDate, entry.current)}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => move(entry, -1)}
                        className="rounded-md p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink disabled:opacity-30"
                        aria-label={`Move ${entry.title} up`}
                        disabled={pendingId === entry.id}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(entry, 1)}
                        className="rounded-md p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink disabled:opacity-30"
                        aria-label={`Move ${entry.title} down`}
                        disabled={pendingId === entry.id}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(entry)}
                        className="rounded-md p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink"
                        aria-label={`Edit ${entry.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirm(entry)}
                        className="rounded-md p-1.5 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${entry.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit entry' : 'Add entry'}
        description="Dates are free text so you can write “Sep 2022” or “2024”."
        footer={
          <>
            <button type="button" className="btn-secondary btn-xs" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="experience-form" className="btn-primary btn-xs" disabled={saving}>
              {saving && <Spinner className="h-3.5 w-3.5" />}
              {editingId ? 'Save changes' : 'Add entry'}
            </button>
          </>
        }
      >
        <form id="experience-form" onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="exp-type" required>
              <select
                id="exp-type"
                className="input"
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              >
                {EXP_TYPE_ORDER.map((type) => (
                  <option key={type} value={type}>
                    {EXP_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Display order" htmlFor="exp-order" hint="Lower numbers appear first.">
              <input
                id="exp-order"
                type="number"
                min="0"
                className="input"
                value={form.order}
                onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
              />
            </Field>
          </div>

          <Field label="Title" htmlFor="exp-title" required>
            <input
              id="exp-title"
              className="input"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="BSc in Computer Science"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Organisation" htmlFor="exp-organization">
              <input
                id="exp-organization"
                className="input"
                value={form.organization}
                onChange={(event) =>
                  setForm((current) => ({ ...current, organization: event.target.value }))
                }
              />
            </Field>
            <Field label="Location" htmlFor="exp-location">
              <input
                id="exp-location"
                className="input"
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Addis Ababa, Ethiopia"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date" htmlFor="exp-start">
              <input
                id="exp-start"
                className="input"
                value={form.startDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, startDate: event.target.value }))
                }
                placeholder="Sep 2022"
              />
            </Field>
            <Field label="End date" htmlFor="exp-end">
              <input
                id="exp-end"
                className="input"
                value={form.current ? '' : form.endDate}
                onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                placeholder="Jun 2026"
                disabled={form.current}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2.5 text-[13px] text-ink-soft">
            <input
              type="checkbox"
              checked={form.current}
              onChange={(event) =>
                setForm((current) => ({ ...current, current: event.target.checked }))
              }
              className="h-4 w-4 rounded border-line-strong text-clay focus:ring-clay"
            />
            Current / ongoing
          </label>

          <Field label="Description" htmlFor="exp-description">
            <textarea
              id="exp-description"
              rows={3}
              className="input resize-y"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </Field>

          <Field
            label="Highlights"
            htmlFor="exp-highlights"
            hint="One per line. Coursework, responsibilities or results."
          >
            <textarea
              id="exp-highlights"
              rows={4}
              className="input resize-y"
              value={form.highlightsText}
              onChange={(event) =>
                setForm((current) => ({ ...current, highlightsText: event.target.value }))
              }
            />
          </Field>

          <Field label="Link" htmlFor="exp-link" hint="Certificate URL, project or programme page.">
            <input
              id="exp-link"
              className="input"
              value={form.link}
              onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
              placeholder="https://…"
            />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={`Delete “${confirm?.title || 'this entry'}”?`}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        busy={deleting}
        confirmLabel="Delete entry"
      />
    </>
  );
}
