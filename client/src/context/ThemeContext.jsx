import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'portfolio-theme';

function readTheme() {
  return document.documentElement.classList.contains('dark') ? 'night' : 'day';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const night = theme === 'night';
    document.documentElement.classList.toggle('dark', night);
    document.documentElement.style.colorScheme = night ? 'dark' : 'light';

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private browsing or storage disabled: the class still applies.
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', night ? '#070D18' : '#FAF7F1');
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'night' ? 'day' : 'night'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
