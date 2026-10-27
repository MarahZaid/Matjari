export const publicStores = data => data.stores.filter(s => s.status === 'active' && data.tenants.some(t => t.id === s.tenantId && t.status === 'active'));
export const publicProducts = data => {
  const stores = new Set(publicStores(data).map(s => s.id));
  return data.products.filter(p => p.active && stores.has(p.storeId));
};
export const customerOrders = (data, customerId) => data.orders.filter(o => o.customerId === customerId);
