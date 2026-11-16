import { useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isNight = theme === 'night';
  const buttonRef = useRef(null);

  const moveGlow = (event) => {
    if (event.pointerType === 'touch') return;
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    button.style.setProperty('--toggle-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    button.style.setProperty('--toggle-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    button.style.setProperty('--toggle-opacity', '1');
  };

  const hideGlow = () => {
    buttonRef.current?.style.setProperty('--toggle-opacity', '0');
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      onPointerEnter={moveGlow}
      onPointerMove={moveGlow}
      onPointerLeave={hideGlow}
      onPointerCancel={hideGlow}
      className={`relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line bg-surface/80 text-ink-soft transition hover:border-line-strong hover:text-ink ${className}`}
      aria-label={isNight ? 'Switch to day mode' : 'Switch to night mode'}
      title={isNight ? 'Switch to day mode' : 'Switch to night mode'}
    >
      <span aria-hidden="true" className="theme-toggle__glow pointer-events-none absolute inset-0 rounded-full" />
      {isNight ? <Sun className="relative h-4 w-4" /> : <Moon className="relative h-4 w-4" />}
    </button>
  );
}
