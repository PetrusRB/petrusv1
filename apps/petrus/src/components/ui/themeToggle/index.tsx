// ThemeToggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const handle = () => {
    if (!theme) return;
    setTheme(theme === "night" ? "light" : "night")
  }
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="btn-status">
      <input type="checkbox" onClick={handle} name="checkbox" id="checkbox" className="hidden" />
      <label
        htmlFor="checkbox"
        className="btn-change flex items-center p-1 rounded-lg w-12 h-6 cursor-pointer"
      ></label>
    </div>
  );
}