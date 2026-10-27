import { createContext, useContext } from 'react';
export const PlatformContext = createContext(null);
export const usePlatform = () => useContext(PlatformContext);
