import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'app-theme';

export const useTheme = () => {
  // Función para obtener el tema del sistema
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Función para obtener el tema guardado o por defecto
  const getStoredTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(THEME_KEY) as Theme;
    return stored || 'light';
  };

  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    const stored = getStoredTheme();
    return stored === 'system' ? getSystemTheme() : stored;
  });

  // Aplicar el tema al documento
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remover clases anteriores
    root.classList.remove('theme-light', 'theme-dark');
    body.classList.remove('theme-light', 'theme-dark');
    
    // Aplicar nueva clase
    const themeClass = `theme-${newTheme}`;
    root.classList.add(themeClass);
    body.classList.add(themeClass);
    
    // Actualizar variables CSS del body
    if (newTheme === 'dark') {
      body.style.setProperty('--bg', 'var(--dark-bg)');
      body.style.setProperty('--text-primary', 'var(--dark-text-primary)');
      body.style.setProperty('--text-secondary', 'var(--dark-text-secondary)');
      body.style.setProperty('--border', 'var(--dark-border)');
      body.style.setProperty('--accent', 'var(--dark-accent)');
      body.style.setProperty('--card-bg', 'var(--dark-card-bg)');
      body.style.setProperty('--shadow', 'var(--dark-shadow)');
      body.style.setProperty('--hover', 'var(--dark-hover)');
      body.style.setProperty('--success', 'var(--dark-success)');
      body.style.setProperty('--warning', 'var(--dark-warning)');
      body.style.setProperty('--error', 'var(--dark-error)');
      body.style.setProperty('--info', 'var(--dark-info)');
      body.style.setProperty('--sidebar-bg', 'var(--dark-sidebar)');
      body.style.setProperty('--sidebar-fg', 'var(--dark-sidebar-foreground)');
    } else {
      body.style.setProperty('--bg', 'var(--light-bg)');
      body.style.setProperty('--text-primary', 'var(--light-text-primary)');
      body.style.setProperty('--text-secondary', 'var(--light-text-secondary)');
      body.style.setProperty('--border', 'var(--light-border)');
      body.style.setProperty('--accent', 'var(--light-accent)');
      body.style.setProperty('--card-bg', 'var(--light-card-bg)');
      body.style.setProperty('--shadow', 'var(--light-shadow)');
      body.style.setProperty('--hover', 'var(--light-hover)');
      body.style.setProperty('--success', 'var(--light-success)');
      body.style.setProperty('--warning', 'var(--light-warning)');
      body.style.setProperty('--error', 'var(--light-error)');
      body.style.setProperty('--info', 'var(--light-info)');
      body.style.setProperty('--sidebar-bg', 'var(--light-sidebar)');
      body.style.setProperty('--sidebar-fg', 'var(--light-sidebar-foreground)');
    }
  };

  // Cambiar tema
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    
    const resolvedTheme = newTheme === 'system' ? getSystemTheme() : newTheme;
    setActualTheme(resolvedTheme);
    applyTheme(resolvedTheme);
  };

  // Alternar entre claro y oscuro
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };

  // Effect para escuchar cambios del sistema cuando está en modo 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setActualTheme(newSystemTheme);
      applyTheme(newSystemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Effect para aplicar el tema inicial
  useEffect(() => {
    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
    setActualTheme(resolvedTheme);
    applyTheme(resolvedTheme);
  }, []);

  return {
    theme,
    actualTheme,
    changeTheme,
    toggleTheme,
    isLight: actualTheme === 'light',
    isDark: actualTheme === 'dark',
  };
};