// Run with PLAYWRIGHT_MODULE pointing to an installed playwright module if it is not locally installed.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const base = process.env.WEB_URL || 'http://127.0.0.1:5173';
const errors = [];
page.on('pageerror',e=>errors.push(e.message));
let checks = 0;
const check = name => { checks++; console.log('PASS ' + name); };
const go = async path => { await page.goto(base+path); await page.waitForTimeout(250); };
const stored = () => page.evaluate(()=>JSON.parse(localStorage.getItem('matjari-demo-v1')).data);
async function login(id='c1') {
  await page.getByLabel('Choose a demo account').selectOption(id);
  await page.getByRole('button',{name:'Sign in to demo',exact:true}).click();
  await page.waitForTimeout(300);
}
async function logout() {
  await page.getByRole('button',{name:'Sign Out',exact:true}).first().click();
  await page.waitForTimeout(200);
}
async function denied(path) {
  await go(path);
  await page.getByRole('heading',{name:'Access denied',exact:true}).waitFor();
}
try {
  for (const path of ['/cart','/checkout','/account/orders']) {
    await go(path);
    assert.equal(new URL(page.url()).pathname,'/login');
    assert.equal(new URL(page.url()).searchParams.get('next'),path);
    check('guest redirect '+path);
  }
  await go('/products/p1');
  await page.getByRole('button',{name:'Add to cart',exact:true}).click();
  await page.waitForURL('**/login?**');
  assert.deepEqual((await stored()).cart,[]);
  check('guest Add to Cart redirects without mutation');
  await login();
  assert.equal(new URL(page.url()).pathname,'/products/p1');
  assert.deepEqual((await stored()).cart,[]);
  check('correct login returns to product without automatic mutation');
  await page.getByRole('button',{name:'Add to cart',exact:true}).click();
  assert.equal((await stored()).cart.length,1);
  await go('/cart');
  assert.equal(new URL(page.url()).pathname,'/cart');
  check('customer can add and open cart');
  await page.reload(); await page.waitForTimeout(200);
  assert.equal(new URL(page.url()).pathname,'/cart');
  assert.equal((await stored()).session.userId,'c1');
  check('session and owned cart survive refresh');
  await denied('/seller/dashboard'); check('customer seller access denied');
  await denied('/admin/dashboard'); check('customer admin access denied');
  const foreign = (await stored()).orders.find(o=>o.customerId==='c2');
  await go('/account/orders/'+foreign.id);
  assert.equal(await page.getByText(foreign.number,{exact:true}).count(),0);
  check('customer foreign order URL reveals no order');
  await logout();
  await page.goBack(); await page.waitForTimeout(300);
  assert.equal(await page.getByText(foreign.number,{exact:true}).count(),0);
  assert.equal(new URL(page.url()).pathname,'/login');
  check('logout and browser back revoke access');
  await login('c2');
  assert.deepEqual((await stored()).cart,[]);
  check('another customer never receives previous cart');
  await logout(); await login('seller-t1');
  assert.equal(new URL(page.url()).pathname,'/seller/dashboard');
  check('seller own dashboard allowed');
  await denied('/admin/dashboard'); check('seller admin denied');
  await go('/seller/stores');
  const foreignStore = (await stored()).stores.find(s=>s.tenantId==='t2');
  assert.equal(await page.getByText(foreignStore.name,{exact:true}).count(),0);
  assert.equal(await page.getByLabel('Demo tenant',{exact:true}).count(),0);
  await go('/seller/orders/'+foreign.id);
  assert.equal(await page.getByText(foreign.number,{exact:true}).count(),0);
  check('seller cannot select or expose foreign tenant data');
  await logout(); await login('seller-t2');
  assert.equal((await stored()).session.tenantId,'t2');
  await go('/seller/stores');
  assert.ok(await page.getByText(foreignStore.name,{exact:true}).count());
  check('Tenant B session uses its own stores');
  await logout(); await login('platform-admin');
  assert.equal(new URL(page.url()).pathname,'/admin/dashboard');
  check('admin dashboard allowed');
  await denied('/cart'); check('admin customer cart denied');
  await go('/products/p1');
  await page.getByRole('button',{name:'Add to cart',exact:true}).click();
  await page.getByRole('heading',{name:'Access denied',exact:true}).waitFor();
  assert.deepEqual((await stored()).cart,[]);
  check('admin add cannot mutate customer cart');
  await logout();
  await go('/cart'); await login();
  assert.equal(new URL(page.url()).pathname,'/cart');
  check('intended cart restored');
  await logout();
  for (const target of ['https://example.com','//example.com','/admin/dashboard','/account/../admin/dashboard']) {
    await go('/login?next='+encodeURIComponent(target)); await login();
    assert.equal(new URL(page.url()).pathname,'/account');
    await logout();
  }
  check('external and unauthorized redirects rejected');
  await login();
  await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('matjari-demo-v1'));d.data.session.customerId='missing'; localStorage.setItem('matjari-demo-v1',JSON.stringify(d));});
  await go('/account');
  assert.equal(new URL(page.url()).pathname,'/login');
  assert.equal((await stored()).session,null);
  check('invalid persisted session restores guest');
  await go('/register');
  await page.getByLabel('Name',{exact:true}).fill('New Demo');
  await page.getByLabel('Email',{exact:true}).fill('new-demo@example.com');
  await page.getByRole('button',{name:'Create demo customer'}).click();
  await page.waitForTimeout(200);
  assert.equal((await stored()).session.role,'customer');
  await logout();
  await go('/register');
  await page.getByLabel('Name',{exact:true}).fill('Duplicate');
  await page.getByLabel('Email',{exact:true}).fill('new-demo@example.com');
  await page.getByRole('button',{name:'Create demo customer'}).click();
  await page.getByRole('alert').waitFor();
  check('registration creates customer and rejects duplicate');
  for (const width of [320,375,430,768,1024,1440,1920]) {
    await page.setViewportSize({width,height:900});
    for (const path of ['/login','/register','/products/p1']) {
      await go(path);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `overflow ${path} at ${width}`);
    }
    await go('/cart');
    assert.equal(new URL(page.url()).pathname,'/login');
    await login();
    for (const path of ['/account','/cart']) {
      await go(path);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`customer overflow ${path} ${width}`);
    }
    await logout(); await login('seller-t1'); await go('/seller/dashboard');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`seller overflow ${width}`);
    await logout(); await login('platform-admin'); await go('/admin/dashboard');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`admin overflow ${width}`);
    await logout();
    if ([375,1440].includes(width) && process.env.SCREENSHOT_DIR) await page.screenshot({path:`${process.env.SCREENSHOT_DIR}/matjari-login-${width}.png`,fullPage:true});
    check(`responsive guest/customer/seller/admin ${width}px`);
  }
  await go('/login');
  await page.getByLabel('Choose a demo account').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Sign in to demo');
  check('login keyboard focus order');
  assert.deepEqual(errors,[]);
  console.log(`${checks} browser checks passed; no runtime errors`);
} finally { await browser.close(); }
