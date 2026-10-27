// Requires a running frontend and Playwright/Chrome; see README.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const base = process.env.WEB_URL || 'http://127.0.0.1:5180';
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
// External photography is not required for deterministic layout/interaction checks.
await page.route('https://images.unsplash.com/**', route => route.abort());
await page.route('https://fonts.googleapis.com/**', route => route.abort());
page.setDefaultTimeout(15000);
page.setDefaultNavigationTimeout(15000);
const errors = [], results = [];
page.on('pageerror', error => errors.push(error.message));
const check = text => { results.push(text); console.log('PASS ' + text); };
async function go(path) { if (process.env.TRACE_QA) console.log('GO ' + path); await page.goto(base + path, { waitUntil: 'domcontentloaded' }); await page.locator('h1, .empty-state h2').first().waitFor(); }
async function stored() { return page.evaluate(() => JSON.parse(localStorage.getItem('matjari-demo-v1')).data); }
async function login(id) {
  await go('/login');
  await page.getByLabel('Choose a demo account').selectOption(id);
  await page.getByRole('button', { name: 'Sign in to demo', exact: true }).click();
  await page.waitForURL(url => url.pathname !== '/login');
}
async function logout() { await page.getByRole('button', { name: 'Sign Out', exact: true }).click(); await page.waitForURL(url => url.pathname === '/login'); }
async function setTheme(theme) {
  const toggle = page.getByRole('button', { name: 'Dark theme', exact: true });
  if (await toggle.getAttribute('aria-pressed') !== String(theme === 'dark')) await toggle.click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
  const contrasts = await page.evaluate(() => {
    const probe = document.createElement('span'); document.body.append(probe);
    const luminance = name => {
      probe.style.color = `var(--${name})`;
      const rgb = getComputedStyle(probe).color.match(/[\d.]+/g).slice(0,3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
      return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    };
    const pairs = [['navy','surface'],['muted','surface'],['muted','page'],['primary','soft'],['on-primary','primary'],['success-text','success-bg'],['warning-text','warning-bg'],['error-text','error-bg']];
    const ratios = pairs.map(([a,b]) => { const x=luminance(a), y=luminance(b); return { pair: `${a}/${b}`, ratio: (Math.max(x,y)+.05)/(Math.min(x,y)+.05) }; });
    probe.remove(); return ratios;
  });
  assert.deepEqual(contrasts.filter(c => c.ratio < 4.5), [], `text token contrast ${theme}`);
}
async function layout(path, width, theme) {
  await go(path);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `page overflow: ${path} ${width} ${theme}`);
  const title = await page.title();
  assert.ok(title.endsWith('| Matjari Demo'), title);
  const offscreen = await page.locator('main button, main input:not([type=radio]):not([type=checkbox]), main select').evaluateAll(nodes => nodes.filter(node => {
    const rect = node.getBoundingClientRect();
    return rect.width && rect.height && !node.closest('.seller-table-wrap') && (rect.left < -1 || rect.right > innerWidth + 1);
  }).map(node => node.outerHTML.slice(0,160)));
  assert.deepEqual(offscreen, [], `clipped controls: ${path} ${width} ${theme}`);
}
try {
  await go('/');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await setTheme('dark'); await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(17, 28, 46)');
  check('first visit light; dark preference persists and renders after reload');
  await go('/products/p1');
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
  await page.waitForURL('**/login?**');
  assert.deepEqual((await stored()).cart, []);
  await page.getByLabel('Choose a demo account').selectOption('c1');
  await page.getByRole('button', { name: 'Sign in to demo', exact: true }).click();
  await page.waitForURL('**/products/p1');
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
  await go('/cart');
  assert.equal((await stored()).cart[0].quantity, 1);
  await go('/checkout');
  for (const [label, value] of [['Street address', '12 Demo Street'], ['City', 'Hebron'], ['Country', 'Palestine']]) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole('button', { name: 'Review order', exact: true }).click();
  assert.equal(await page.locator('.checkout-steps [aria-current]').textContent(), 'Review & place order');
  await page.getByRole('button', { name: 'Place demo order', exact: true }).click();
  await page.waitForURL('**/checkout/confirmation/**');
  const confirmation = new URL(page.url()).pathname;
  const order = (await stored()).orders.find(o => o.checkoutReference === confirmation.split('/').at(-1));
  assert.ok(order);
  await go('/account/orders');
  await page.getByRole('link', { name: 'View details', exact: true }).first().waitFor();
  await logout(); await login('seller-' + order.tenantId);
  await go('/seller/orders');
  await page.getByRole('textbox', { name: 'Search orders', exact: true }).fill(order.number);
  await page.getByRole('link', { name: 'View details', exact: true }).click();
  await page.getByRole('button', { name: 'Mark paid', exact: true }).click();
  await logout(); await login('c1');
  await go('/account/orders/' + order.id);
  assert.equal(await page.locator('.order-progress [aria-current]').textContent(), 'paid (current)');
  await logout(); await login('platform-admin');
  await go('/admin/dashboard');
  const store = (await stored()).stores.find(s => s.id === order.storeId);
  await go('/admin/stores');
  await page.getByLabel('Search stores by name').fill(store.name);
  await page.getByRole('button', { name: 'Suspend ' + store.name, exact: true }).click();
  await page.getByRole('button', { name: 'Confirm suspension', exact: true }).click();
  await go('/stores/' + store.slug);
  await page.getByRole('heading', { name: 'Store not found', exact: true }).waitFor();
  await go('/admin/stores');
  await page.getByLabel('Search stores by name').fill(store.name);
  await page.getByRole('button', { name: 'Activate ' + store.name, exact: true }).click();
  await page.getByRole('button', { name: 'Confirm activation', exact: true }).click();
  await page.reload();
  assert.equal((await stored()).stores.find(s => s.id === store.id).status, 'active');
  await go('/stores/' + store.slug);
  assert.equal(await page.locator('h1').textContent(), store.name);
  check('complete guest → checkout → seller update → customer status → admin suspension/restoration → reload workflow');
  await logout();
  let layouts = 0;
  for (const theme of ['light', 'dark']) {
    await setTheme(theme);
    for (const width of [320,375,430,768,1024,1440,1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/', '/stores', '/stores/' + store.slug, '/products', '/products/p1', '/login', '/register']) { await layout(path,width,theme); layouts++; }
      if (width < 768) {
        await go('/');
        await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
        await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('button', { name: 'Open navigation', exact: true }).getAttribute('aria-expanded'), 'false');
      }
      await login('c1');
      await go('/products/p1'); await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
      for (const path of ['/account', '/cart', '/checkout', '/account/orders', '/account/orders/' + order.id, confirmation]) { await layout(path,width,theme); layouts++; }
      await logout(); await login('seller-' + order.tenantId);
      for (const path of ['/seller/dashboard','/seller/stores','/seller/products','/seller/inventory','/seller/orders','/seller/orders/' + order.id]) { await layout(path,width,theme); layouts++; }
      await go('/seller/products'); await page.getByRole('button', { name: 'Add product', exact: true }).click();
      let dialog = page.getByRole('dialog');
      assert.equal(await dialog.evaluate(el => getComputedStyle(el).backgroundColor), theme === 'dark' ? 'rgb(25, 39, 60)' : 'rgb(255, 255, 255)');
      let bounds = await dialog.boundingBox(); assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
      await page.keyboard.press('Escape');
      if (width <= 768) {
        const open = page.getByRole('button', { name: 'Open navigation', exact: true });
        await open.click(); await page.keyboard.press('Escape');
        assert.equal(await open.evaluate(el => document.activeElement === el), true);
        assert.equal(await page.locator('.seller-sidebar').getAttribute('aria-modal'), null);
      }
      await logout(); await login('platform-admin');
      for (const path of ['/admin/dashboard','/admin/tenants','/admin/stores','/admin/analytics','/admin/monitoring']) { await layout(path,width,theme); layouts++; }
      await go('/admin/tenants');
      await page.getByRole('button', { name: 'View North Collective', exact: true }).click();
      dialog = page.getByRole('dialog'); bounds = await dialog.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
      await page.keyboard.press('Escape');
      if (process.env.SCREENSHOT_DIR && [375,1440].includes(width)) {
        await go('/admin/dashboard'); await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/admin-${theme}-${width}.png`, fullPage: true });
        await go('/'); await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/home-${theme}-${width}.png`, fullPage: true });
      }
      await logout();
      check(`${theme} ${width}px: 24 routes, populated shopping, seller/admin dialogs, navigation`);
    }
  }
  for (const [width,height] of [[768,1024],[1024,768]]) {
    await page.setViewportSize({ width,height });
    for (const theme of ['light','dark']) {
      await setTheme(theme); await login('seller-t1'); await layout('/seller/dashboard',width,theme); await logout();
      await login('platform-admin'); await layout('/admin/analytics',width,theme); await logout();
    }
  }
  check(`${layouts} route/theme/width checks plus portrait/landscape tablet dashboards`);
  await setTheme('dark');
  const before = await stored();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Reset Demo Data', exact: true }).click();
  assert.deepEqual(await stored(),before);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Reset Demo Data', exact: true }).click();
  await page.reload();
  assert.equal((await stored()).session,null);
  assert.ok(!(await stored()).orders.some(o => o.id === order.id));
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  check('reset cancellation preserves data; confirmed reset removes orders/session and retains theme');
  // A storage exception must still permit in-memory theme changes and demo browsing.
  await page.addInitScript(() => { Object.defineProperty(Storage.prototype, 'getItem', { value() { throw Error('storage blocked'); } }); Object.defineProperty(Storage.prototype, 'setItem', { value() { throw Error('storage blocked'); } }); });
  await go('/'); await setTheme('dark');
  await page.getByText('Theme changed for this visit. Browser storage is unavailable.', { exact: true }).waitFor();
  check('unavailable storage leaves theme and demo usable');
  assert.deepEqual(errors,[]);
  console.log(`${results.length} groups passed; no uncaught runtime exceptions`);
} finally { await browser.close(); }
