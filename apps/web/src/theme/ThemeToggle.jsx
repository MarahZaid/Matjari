import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { normalizeTheme, saveTheme } from './model';
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => normalizeTheme(document.documentElement.dataset.theme));
  const [message, setMessage] = useState('');
  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#111c2e' : '#175CD3');
    setTheme(next);
    setMessage(saveTheme({ setItem: (key, value) => window.localStorage.setItem(key, value) }, next) ? '' : 'Theme changed for this visit. Browser storage is unavailable.');
  }
  return <><button className="theme-toggle" type="button" aria-label="Dark theme" aria-pressed={theme === 'dark'} onClick={toggle}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</span></button>{message && <span role="status">{message}</span>}</>;
}
