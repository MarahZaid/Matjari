import test from 'node:test';
import assert from 'node:assert/strict';
import { readTheme, saveTheme, THEME_KEY } from '../src/theme/model.js';
import { resetDemo, STORAGE_KEY } from '../src/platform/persistence.js';

test('theme defaults to light and tolerates missing, invalid and unavailable storage', () => {
  for (const value of [null, '', 'system', 'DARK', '{}']) assert.equal(readTheme({ getItem: () => value }), 'light');
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(readTheme(blocked), 'light');
  assert.equal(saveTheme(blocked, 'dark'), false);
});

test('theme round-trips independently of demo sessions and reset', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(saveTheme(storage, 'dark'), true);
  assert.equal(readTheme(storage), 'dark');
  const reset = resetDemo(storage);
  assert.equal(reset.saved, true);
  assert.equal(reset.data.session, null);
  assert.ok(values.has(STORAGE_KEY));
  assert.equal(values.get(THEME_KEY), 'dark');
  assert.equal(readTheme(storage), 'dark');
  saveTheme(storage, 'light');
  assert.equal(readTheme(storage), 'light');
});
