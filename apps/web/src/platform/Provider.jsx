import { useEffect, useState } from 'react';
import { PlatformContext } from './context';
import { loadDemo, saveDemo, resetDemo, browserStorage } from './persistence';
export default function PlatformProvider({ children }) {
  const [initial] = useState(() => loadDemo(browserStorage));
  const [data, setData] = useState(initial.data);
  const [writable, setWritable] = useState(initial.writable);
  const [message, setMessage] = useState(initial.message);
  useEffect(() => {
    if (!writable) return;
    const saved = saveDemo(browserStorage, data);
    const timer = !saved ? setTimeout(() => setMessage('Browser storage is unavailable. Changes remain in memory until this page closes.'), 0) : null;
    return () => clearTimeout(timer);
  }, [data, writable]);
  function reset() {
    if (!window.confirm('Reset all demo products, stores, orders, selections, and cart to the seed?')) return;
    const result = resetDemo(browserStorage);
    setData(result.data);
    setWritable(true);
    setMessage(result.saved ? 'Demo data reset.' : 'Demo reset in memory. Browser storage is unavailable.');
  }
  return <PlatformContext.Provider value={{ data, setData, reset, message }}>{children}</PlatformContext.Provider>;
}
