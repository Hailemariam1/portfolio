export const CATEGORY_LABELS = {
  academic: 'Academic Project',
  personal: 'Personal Project',
  collaborative: 'Collaborative Project',
  freelance: 'Freelance Project'
};

export const CATEGORY_STYLES = {
  academic: 'border-moss/25 bg-moss-soft text-moss',
  personal: 'border-clay/25 bg-clay-soft text-clay-deep',
  collaborative: 'border-slateblue/25 bg-slateblue-soft text-slateblue',
  freelance: 'border-plum/25 bg-plum-soft text-plum'
};

export const CATEGORY_CONTEXT = {
  academic: 'Academic work built as coursework — not paid employment.',
  personal: 'Personal project, built on my own time.',
  collaborative: 'Built with a team — my specific contributions are listed below.',
  freelance: 'Freelance project delivered for a client under an agreed scope.'
};

export const EXP_TYPE_LABELS = {
  education: 'Education',
  internship: 'Internship',
  freelance: 'Freelance',
  collaboration: 'Collaboration',
  volunteer: 'Volunteer',
  certification: 'Certification'
};

export const EXP_TYPE_ORDER = [
  'education',
  'internship',
  'freelance',
  'collaboration',
  'volunteer',
  'certification'
];

export const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'Tools & Deployment',
  'Foundations'
];

export function formatDate(value, options) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', options || { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export function formatRange(startDate, endDate, current) {
  const start = startDate || '';
  const end = current ? 'Present' : endDate || '';
  if (!start && !end) return '';
  if (start && end) return `${start} — ${end}`;
  return start || end;
}

export function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function readingTime(minutes) {
  return `${minutes || 1} min read`;
}

export function groupByCategory(items = [], categories = SKILL_CATEGORIES) {
  return categories
    .map((category) => ({
      category,
      items: items.filter((item) => item.category === category)
    }))
    .filter((group) => group.items.length > 0);
}
