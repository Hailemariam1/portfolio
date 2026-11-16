import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, Wrench, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { SKILL_CATEGORIES, groupByCategory } from '../lib/format.js';
import { AdminCard, AdminPageHeader } from './AdminLayout.jsx';
import {
  ConfirmDialog,
  EmptyState,
  ErrorBlock,
  Field,
  LoadingBlock,
  Spinner
} from '../components/ui.jsx';
import { useToast } from '../context/ToastContext.jsx';

const EMPTY = { name: '', category: 'Frontend', note: '', order: '' };

export default function Skills() {
  const toast = useToast();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/skills');
      setSkills(data.items || []);
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

  const create = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/skills', {
        name: form.name,
        category: form.category,
        note: form.note,
        ...(form.order === '' ? {} : { order: Number(form.order) })
      });
      toast.success('Skill added.');
      setForm({ ...EMPTY, category: form.category });
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setPendingId(editing.id);
    try {
      await api.put(`/admin/skills/${editing.id}`, {
        name: editing.name,
        category: editing.category,
        note: editing.note,
        order: Number(editing.order) || 0
      });
      toast.success('Skill updated.');
      setEditing(null);
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setPendingId(null);
    }
  };

  const remove = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await api.del(`/admin/skills/${confirm.id}`);
      toast.success('Skill deleted.');
      setConfirm(null);
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  const move = async (skill, direction) => {
    const group = skills.filter((item) => item.category === skill.category);
    const index = group.findIndex((item) => item.id === skill.id);
    const target = index + direction;
    if (target < 0 || target >= group.length) return;

    const reordered = [...group];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    setPendingId(skill.id);
    try {
      await Promise.all(
        reordered
          .map((item, itemIndex) =>
            item.order === itemIndex
              ? null
              : api.put(`/admin/skills/${item.id}`, { order: itemIndex })
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

  const grouped = groupByCategory(skills, SKILL_CATEGORIES);

  return (
    <>
      <AdminPageHeader
        title="Skills"
        description="The public skills section reads from this list. Order controls position inside each category."
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {error ? (
            <ErrorBlock message={error} action={<button className="btn-secondary btn-xs" onClick={load}>Try again</button>} />
          ) : loading ? (
            <LoadingBlock label="Loading skills…" />
          ) : grouped.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No skills yet"
              description="Add the tools you have actually used in projects, grouped by Frontend, Backend and so on."
            />
          ) : (
            grouped.map((group) => (
              <section key={group.category} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="flex items-center justify-between border-b border-line px-5 py-3">
                  <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    {group.category}
                  </h2>
                  <span className="text-[11px] text-ink-muted">{group.items.length} skills</span>
                </div>
                <ul className="divide-y divide-line">
                  {group.items.map((skill) => (
                    <li key={skill.id} className="px-4 py-3">
                      {editing?.id === skill.id ? (
                        <div className="space-y-2.5">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              className="input py-2 text-[13px]"
                              value={editing.name}
                              onChange={(event) =>
                                setEditing((current) => ({ ...current, name: event.target.value }))
                              }
                              aria-label="Skill name"
                            />
                            <select
                              className="input py-2 text-[13px]"
                              value={editing.category}
                              onChange={(event) =>
                                setEditing((current) => ({ ...current, category: event.target.value }))
                              }
                              aria-label="Skill category"
                            >
                              {SKILL_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-[1fr_6rem]">
                            <input
                              className="input py-2 text-[13px]"
                              value={editing.note}
                              onChange={(event) =>
                                setEditing((current) => ({ ...current, note: event.target.value }))
                              }
                              placeholder="Short note"
                              aria-label="Skill note"
                            />
                            <input
                              type="number"
                              min="0"
                              className="input py-2 text-[13px]"
                              value={editing.order}
                              onChange={(event) =>
                                setEditing((current) => ({ ...current, order: event.target.value }))
                              }
                              aria-label="Display order"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={saveEdit}
                              className="btn-primary btn-xs"
                              disabled={pendingId === skill.id}
                            >
                              {pendingId === skill.id ? (
                                <Spinner className="h-3 w-3" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing(null)}
                              className="btn-secondary btn-xs"
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-medium text-ink">{skill.name}</p>
                            {skill.note && (
                              <p className="text-[11.5px] text-ink-muted">{skill.note}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => move(skill, -1)}
                              className="rounded-md p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink disabled:opacity-30"
                              aria-label={`Move ${skill.name} up`}
                              disabled={pendingId === skill.id}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(skill, 1)}
                              className="rounded-md p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink disabled:opacity-30"
                              aria-label={`Move ${skill.name} down`}
                              disabled={pendingId === skill.id}
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditing({
                                  id: skill.id,
                                  name: skill.name,
                                  category: skill.category,
                                  note: skill.note || '',
                                  order: skill.order ?? 0
                                })
                              }
                              className="rounded-md p-1.5 text-ink-muted transition hover:bg-paper-2 hover:text-ink"
                              aria-label={`Edit ${skill.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirm(skill)}
                              className="rounded-md p-1.5 text-ink-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                              aria-label={`Delete ${skill.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <div className="lg:col-span-4">
          <AdminCard title="Add a skill" description="New skills are appended to the chosen category.">
            <form onSubmit={create} className="space-y-4">
              <Field label="Skill name" htmlFor="skill-name" required>
                <input
                  id="skill-name"
                  className="input"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="React"
                  required
                />
              </Field>
              <Field label="Category" htmlFor="skill-category">
                <select
                  id="skill-category"
                  className="input"
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                >
                  {SKILL_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Note"
                htmlFor="skill-note"
                hint="Optional context, e.g. “Hooks, routing, forms”."
              >
                <input
                  id="skill-note"
                  className="input"
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Hooks, routing, forms"
                />
              </Field>
              <Field label="Display order" htmlFor="skill-order" hint="Leave blank to append.">
                <input
                  id="skill-order"
                  type="number"
                  min="0"
                  className="input"
                  value={form.order}
                  onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
                  placeholder="0"
                />
              </Field>
              <button type="submit" className="btn-primary w-full" disabled={saving}>
                {saving ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                Add skill
              </button>
            </form>
          </AdminCard>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={`Delete “${confirm?.name || 'this skill'}”?`}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        busy={deleting}
        confirmLabel="Delete skill"
      />
    </>
  );
}
