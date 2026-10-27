import { usePlatform } from './context';
import { publicStores, publicProducts } from './selectors';
export function useMarketplace() {
  const { data } = usePlatform();
  return { stores: publicStores(data), products: publicProducts(data) };
}
