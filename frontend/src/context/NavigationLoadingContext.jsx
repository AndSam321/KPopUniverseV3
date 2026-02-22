import { createContext, useContext, useState, useCallback } from "react";

const NavigationLoadingContext = createContext();

export function NavigationLoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((c) => c + 1);
  }, []);

  const completeLoading = useCallback(() => {
    setLoadingCount((c) => Math.max(0, c - 1));
  }, []);

  const isLoading = loadingCount > 0;

  return (
    <NavigationLoadingContext.Provider value={{ isLoading, startLoading, completeLoading }}>
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext);
}
