import { createContext, useContext } from 'react';
export const SellerContext = createContext(null);
export const useSeller = () => useContext(SellerContext);
