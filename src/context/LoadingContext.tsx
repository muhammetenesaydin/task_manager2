import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);
  
  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);
  
  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        setLoading, 
        startLoading, 
        stopLoading 
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingContext; 