import { useRef, useState } from 'react';
import {
  Bold,
  Code2,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Eye,
  PenLine
} from 'lucide-react';
import Markdown from './Markdown.jsx';

const TOOLS = [
  { label: 'Bold', icon: Bold, before: '**', after: '**', placeholder: 'bold text' },
  { label: 'Italic', icon: Italic, before: '_', after: '_', placeholder: 'italic text' },
  { label: 'Heading', icon: Heading2, before: '\n## ', after: '', placeholder: 'Section heading' },
  { label: 'Link', icon: Link2, before: '[', after: '](https://example.com)', placeholder: 'link text' },
  { label: 'Bulleted list', icon: List, before: '\n- ', after: '', placeholder: 'list item' },
  { label: 'Numbered list', icon: ListOrdered, before: '\n1. ', after: '', placeholder: 'list item' },
  { label: 'Quote', icon: Quote, before: '\n> ', after: '', placeholder: 'quoted text' },
  {
    label: 'Code block',
    icon: Code2,
    before: '\n```js\n',
    after: '\n```\n',
    placeholder: 'const answer = 42;'
  }
];

export default function MarkdownEditor({
  value = '',
  onChange,
  label = 'Content',
  hint = 'Markdown: headings, bold, links, lists and fenced code blocks.',
  rows = 16,
  error
}) {
  const textareaRef = useRef(null);
  const [tab, setTab] = useState('write');

  const insert = (tool) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || tool.placeholder;
    const next = `${value.slice(0, start)}${tool.before}${selected}${tool.after}${value.slice(end)}`;
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + tool.before.length + selected.length;
      textarea.setSelectionRange(caret, caret);
    });
  };

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      insert(TOOLS[0]);
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="label mb-0">{label}</span>
        <div className="flex rounded-lg border border-line bg-paper-2/60 p-0.5">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
              tab === 'write' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <PenLine className="h-3 w-3" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
              tab === 'preview' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Eye className="h-3 w-3" />
            Preview
          </button>
        </div>
      </div>

      {tab === 'write' ? (
        <div className="overflow-hidden rounded-xl border border-line bg-surface focus-within:border-clay focus-within:ring-2 focus-within:ring-clay/15">
          <div className="flex flex-wrap gap-0.5 border-b border-line bg-paper-2/40 px-2 py-1.5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.label}
                  type="button"
                  title={tool.label}
                  aria-label={tool.label}
                  onClick={() => insert(tool)}
                  className="rounded-md p-1.5 text-ink-muted transition hover:bg-surface hover:text-ink"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
          <textarea
            ref={textareaRef}
            id="markdown-editor"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={rows}
            spellCheck="true"
            placeholder="Write the long-form version here. Use ## for headings, - for lists and ``` for code."
            className="w-full resize-y border-0 bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-0"
          />
        </div>
      ) : (
        <div className="min-h-[12rem] rounded-xl border border-line bg-surface px-5 py-4">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-ink-muted">Nothing to preview yet.</p>
          )}
        </div>
      )}

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : (
        <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
}
