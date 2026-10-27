import { useState } from 'react';
import { PlatformContext } from './context';
import { adminSeed } from '../admin/data';
export default function PlatformProvider({ children }) {
  const [data, setData] = useState(adminSeed);
  return <PlatformContext.Provider value={{ data, setData }}>{children}</PlatformContext.Provider>;
}
