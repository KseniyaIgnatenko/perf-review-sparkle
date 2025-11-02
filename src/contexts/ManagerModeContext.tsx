import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type ManagerMode = 'manager' | 'employee';

interface ManagerModeContextType {
  mode: ManagerMode;
  setMode: (mode: ManagerMode) => void;
  toggleMode: () => void;
}

const ManagerModeContext = createContext<ManagerModeContextType | undefined>(undefined);

export function ManagerModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ManagerMode>(() => {
    const saved = localStorage.getItem('managerMode');
    return (saved as ManagerMode) || 'employee';
  });

  const setMode = (newMode: ManagerMode) => {
    setModeState(newMode);
    localStorage.setItem('managerMode', newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'manager' ? 'employee' : 'manager';
    setMode(newMode);
  };

  return (
    <ManagerModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ManagerModeContext.Provider>
  );
}

export function useManagerMode() {
  const context = useContext(ManagerModeContext);
  if (context === undefined) {
    throw new Error('useManagerMode must be used within a ManagerModeProvider');
  }
  return context;
}
