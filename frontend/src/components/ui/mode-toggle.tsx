import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ModeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span>{dark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
