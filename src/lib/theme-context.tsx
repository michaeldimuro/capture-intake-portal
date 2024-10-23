import { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeConfig } from './types';

const defaultTheme: ThemeConfig = {
  primaryColor: 'hsl(var(--primary))',
  secondaryColor: 'hsl(var(--secondary))',
  accentColor: 'hsl(var(--accent))',
  fontFamily: 'Inter, sans-serif',
};

const ThemeContext = createContext<{
  theme: ThemeConfig;
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
}>({
  theme: defaultTheme,
  updateTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...newTheme }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);