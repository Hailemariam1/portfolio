import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

export const DEFAULT_SETTINGS = {
  name: 'Hailemariam',
  role: 'Junior Full-Stack Web Developer | React, Node.js & MongoDB',
  headline: "Hi, I'm Hailemariam. I build web applications that solve real problems.",
  intro:
    "I'm a junior full-stack web developer with a background in Computer Science. I enjoy working across the frontend and backend, building practical applications, and turning ideas into functional digital products.",
  about: '',
  location: 'Addis Ababa, Ethiopia',
  email: '',
  githubUrl: '',
  linkedinUrl: '',
  availabilityStatus: true,
  availabilityNote: 'Open to junior full-stack roles and freelance projects',
  footerText: '',
  profilePhoto: null,
  resume: null
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.get('/settings');
      if (data?.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    } catch {
      // The public site still renders sensible defaults if the API is down.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({ settings, loading, reload: load, setSettings }),
    [settings, loading, load]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside SettingsProvider');
  return context;
}
