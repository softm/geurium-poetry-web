'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS ' + name); }

check('classic JavaScript syntax and deferred local entry points', () => {
  for (const file of fs.readdirSync(ROOT).filter(name => name.endsWith('.js'))) {
    new vm.Script(read(file), { filename: file });
  }
  const html = read('index.html');
  assert(!/<script\b[^>]*type=["']module/.test(html));
  assert(!fs.existsSync(path.join(ROOT, 'core.mjs')));
  for (const tag of html.match(/<script\b[^>]+>/g) || []) {
    assert(/\bdefer\b/.test(tag));
    const src = /src="([^"]+)"/.exec(tag)[1];
    assert(src.startsWith('./'));
    assert(fs.existsSync(path.join(ROOT, src)));
  }
  for (const match of html.matchAll(/href="(\.\/[^"#?]*)"/g)) {
    assert(fs.existsSync(path.join(ROOT, match[1])), match[1]);
  }
  assert(fs.existsSync(path.join(ROOT, '.nojekyll')));
});
check('manifest is portable under a repository subpath', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  for (const key of ['id', 'start_url', 'scope']) assert.equal(manifest[key], './');
  for (const icon of manifest.icons) {
    assert(icon.src.startsWith('./'));
    assert(fs.existsSync(path.join(ROOT, icon.src)));
  }
});
function workerAt(scope) {
  const sandbox = { URL, self: { location: { href: scope + 'sw.js' }, addEventListener() {} } };
  vm.runInNewContext(read('sw.js') + '\nthis.result={CACHE,URLS,SHELL};', sandbox);
  return sandbox.result;
}
check('offline cache contains only existing local app files and is scope-isolated', () => {
  const scope = 'https://example.test/repository/';
  const first = workerAt(scope);
  assert.equal(first.SHELL, scope + 'index.html');
  for (const url of first.URLS) {
    assert(url.startsWith(scope));
    assert(fs.existsSync(path.join(ROOT, url.slice(scope.length))));
    assert(!/README|scripts\/|\.github\//.test(url));
  }
  assert.notEqual(first.CACHE, workerAt('https://example.test/other-repository/').CACHE);
  assert(first.URLS.includes(scope + 'native-bridge.js'));
  assert(first.URLS.includes(scope + 'common-account.js'));
});
function nativeAt(url) {
  const sent = [], results = [];
  const sandbox = {
    location: new URL(url),
    window: { HannunNative: { postMessage: text => sent.push(JSON.parse(text)) }, dispatchEvent: event => results.push(event) },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } }
  };
  vm.runInNewContext(read('native-bridge.js'), sandbox);
  return { api: sandbox.window.HannunNativeWeb, host: sandbox.window.HannunNative, sent, results };
}
check('native file/share/print bridge only posts from the asset-loader origin', () => {
  const native = nativeAt('https://appassets.androidplatform.net/assets/index.html');
  const message = { type: 'downloadText', name: 'backup.json', mime: 'application/json', text: '{"시":"그리움\\n"}' };
  assert(native.api.available());
  assert(native.api.post(message));
  assert.deepEqual(native.sent[0], message);
  native.host.onmessage({ data: JSON.stringify({ type: 'downloadResult', ok: true }) });
  assert.equal(native.results[0].type, 'hannun-native-result');
  assert.equal(native.results[0].detail.ok, true);
  native.host.onmessage({ data: 'invalid json' });
  assert.equal(native.results.length, 1);
  for (const url of ['https://softm.github.io/app/', 'file:///app/index.html', 'https://untrusted.test/']) {
    const web = nativeAt(url);
    assert.equal(web.api.available(), false);
    assert.equal(web.api.post(message), false);
    assert.equal(web.sent.length, 0);
  }
});
function accountAt(url, ua = 'Mozilla/5.0') {
  const siteId = /data-hannun-site="([^"]+)"/.exec(read('index.html'))[1];
  const scripts = [], events = {}, fallback = { hidden: false }, scriptEvents = {};
  const sandbox = {
    location: new URL(url), navigator: { userAgent: ua },
    document: {
      documentElement: { dataset: { hannunSite: siteId } },
      getElementById: () => ({}), querySelector: () => fallback,
      createElement: () => ({ addEventListener: (type, fn) => { scriptEvents[type] = fn; } }),
      head: { appendChild: script => scripts.push(script) }
    },
    window: { addEventListener: (type, fn) => { events[type] = fn; } }
  };
  vm.runInNewContext(read('common-account.js'), sandbox);
  return { siteId, scripts, events, fallback, scriptEvents, policy: sandbox.window.HannunWebPolicy };
}
check('account boot sends no current URL or private share fragment and retains error fallback', () => {
  const account = accountAt('https://softm.github.io/app/#invite=private-answers');
  assert.equal(account.scripts.length, 1);
  const remote = new URL(account.scripts[0].src);
  assert.equal(remote.searchParams.get('site'), account.siteId);
  assert.equal(remote.hash, '');
  assert(!remote.href.includes('private-answers'));
  account.events['softm:account-ready']({ detail: { siteId: 'other' } });
  assert.equal(account.fallback.hidden, false);
  account.events['softm:account-ready']({ detail: { siteId: account.siteId } });
  assert.equal(account.fallback.hidden, true);
  account.scriptEvents.error();
  assert.equal(account.fallback.hidden, false);
  assert.equal(account.policy.webAdFitEnabled, false);
});
check('local preview, native app and AdMob user agent do not load account scripts or web AdFit', () => {
  for (const url of ['http://localhost:8080/', 'file:///app/index.html', 'https://appassets.androidplatform.net/assets/index.html']) {
    assert.equal(accountAt(url).scripts.length, 0);
  }
  const native = accountAt('https://softm.github.io/app/', 'Mozilla/5.0 AdMobNative/1');
  assert.equal(native.scripts.length, 0);
  assert.equal(native.policy.nativeAds, true);
  assert.equal(native.policy.webAdFitEnabled, false);
});
function appContext() {
  const saved = new Map();
  const node = { addEventListener() {}, classList: { add() {}, remove() {} }, focus() {}, setAttribute() {}, style: {} };
  const sandbox = {
    URL, Blob, btoa, atob, crypto: webcrypto, console,
    setTimeout: () => 0, clearTimeout() {},
    location: new URL('https://example.test/subpath/index.html'),
    navigator: { userAgent: 'test' },
    document: { addEventListener() {}, querySelector: selector => selector.startsWith('dialog[') ? null : node, querySelectorAll: () => [] },
    localStorage: { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) },
    addEventListener() {}, dispatchEvent() {},
    HannunNativeWeb: { available: () => false, post: () => false }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  return { sandbox, saved };
}
function instrumentApp(sandbox, exported) {
  // Test-only injection: production app state remains private inside the IIFE.
  const source = read('app.js').replace(/^loadState\(\);$/m, '').replace(/^render\(\);$/m, '');
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, 'window.__qa = ' + exported + ';\n})();'), sandbox);
  return sandbox.__qa;
}

const { sandbox, saved } = appContext();
const qa = instrumentApp(sandbox, `{ validateRecordData, mergeRecords, filteredLetters, persist,
  set(next, raw = null, kind = 'all', status = 'all', query = '') { state=next; lastStorageRaw=raw; tabConflict=false; storageBlocked=false; kindFilter=kind; letterFilter=status; searchText=query; },
  get() { return state; } }`);
const timestamp = '2026-11-21T00:00:00.000Z';
const oldLetter = {id:'letter-1',recipient:'나에게',title:'오래된 편지',body:'첫 줄\n\n마지막 줄\n',color:'cream',status:'complete',createdAt:timestamp,updatedAt:timestamp};
const poem = {...oldLetter,id:'poem-1',kind:'poem',title:'그리움',recipient:'ignored',status:'draft'};
const record = (letters = [], moods = [], composer = null) => ({version:1,letters,moods,composer});
check('legacy letters migrate and poem line breaks stay intact', () => {
  const result = qa.validateRecordData(record([oldLetter,poem]));
  assert.equal(result.letters[0].kind, 'letter');
  assert.equal(result.letters[1].kind, 'poem');
  assert.equal(result.letters[1].recipient, '');
  assert.equal(result.letters[1].body, poem.body);
  assert(read('app.js').includes("'geurium-records-v1'"));
});
check('invalid kind, duplicate record IDs and impossible dates are rejected', () => {
  assert.throws(() => qa.validateRecordData(record([{...poem,kind:'unsupported'}])));
  assert.throws(() => qa.validateRecordData(record([oldLetter,oldLetter])));
  assert.throws(() => qa.validateRecordData(record([],[{id:'mood-1',emotion:'miss',note:'',date:'2026-02-30',createdAt:timestamp,updatedAt:timestamp}])));
});
check('kind, status and text filters intersect', () => {
  const data = qa.validateRecordData(record([oldLetter,poem,{...poem,id:'poem-2',status:'complete',title:'다른 시'}]));
  qa.set(data,null,'poem','draft','그리움');
  assert.deepEqual(plain(qa.filteredLetters().map(item => item.id)), ['poem-1']);
  qa.set(data,null,'letter','complete','나에게');
  assert.deepEqual(plain(qa.filteredLetters().map(item => item.id)), ['letter-1']);
});
check('repeated backup restores deduplicate while ID conflicts preserve both versions', () => {
  const first = qa.validateRecordData(record([oldLetter])).letters;
  assert.equal(qa.mergeRecords(first, first).length, 1);
  const incoming = [{...first[0],body:'새 내용'}];
  const merged = qa.mergeRecords(first, incoming);
  assert.equal(merged.length, 2);
  assert.notEqual(merged[0].id, merged[1].id);
  assert.equal(qa.mergeRecords(merged, incoming).length, 2);
});
check('storage failure and stale tabs do not overwrite successful records', () => {
  const before = qa.validateRecordData(record([oldLetter]));
  qa.set(before);
  assert.equal(qa.persist(before,{quiet:true}), true);
  const raw = saved.get('geurium-records-v1');
  const next = qa.validateRecordData(record([oldLetter,poem]));
  const setItem = sandbox.localStorage.setItem;
  sandbox.localStorage.setItem = () => {throw Error('quota');};
  assert.equal(qa.persist(next,{quiet:true}), false);
  assert.equal(qa.get(), before);
  assert.equal(saved.get('geurium-records-v1'), raw);
  sandbox.localStorage.setItem = setItem;
  saved.set('geurium-records-v1', JSON.stringify(next));
  assert.equal(qa.persist(before,{quiet:true}), false);
  assert.equal(saved.get('geurium-records-v1'), JSON.stringify(next));
});
check('UTF-8 backup capacity is checked before writing', () => {
  const before = qa.validateRecordData(record());
  saved.clear(); qa.set(before);
  const letters = Array.from({length:36},(_,i)=>({...oldLetter,id:'large-'+i,body:'가'.repeat(50000)}));
  assert.equal(qa.persist(qa.validateRecordData(record(letters)),{quiet:true}), false);
  assert.equal(qa.get(), before);
  assert.equal(saved.size, 0);
});
console.log(`\n${checks} verification groups passed. No external packages or build required.`);
