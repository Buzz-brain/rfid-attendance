import { createContext, useContext, useEffect } from 'react';
import useStore from '../store/useStore';

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const theme = useStore(state => state.theme);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // Accessibility: set color-scheme for system support
    root.style.colorScheme = theme;
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
