import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = process.cwd();
const navSource = readFileSync(join(root, 'js', 'nav-shared.js'), 'utf8');
const breadcrumbSource = readFileSync(join(root, 'js', 'breadcrumbs.js'), 'utf8');
const agroScriptSource = readFileSync(join(root, 'js', 'agrosamas-2026.js'), 'utf8');
const agroStyleSource = readFileSync(join(root, 'css', 'agrosamas-2026.css'), 'utf8');

const breadcrumbPages = execFileSync('git', ['grep', '-l', 'js/breadcrumbs.js', '--', '*.html'], {
  cwd: root,
  encoding: 'utf8',
})
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);

test('shared header exposes one explicit wrapper around every global navigation surface', () => {
  const wrapperStart = navSource.indexOf('<header id="sms-global-header"');
  const mainNav = navSource.indexOf('<nav class="nav" id="mainNav">');
  const mobileShortcuts = navSource.indexOf('<nav class="nav-mobile-shortcuts"');
  const searchModal = navSource.indexOf('<div class="search-modal"');
  const wrapperEnd = navSource.indexOf('</header>`;');

  assert.ok(wrapperStart >= 0, 'explicit shared-header wrapper must exist');
  assert.ok(wrapperStart < mainNav, 'wrapper must begin before the main navigation');
  assert.ok(mainNav < mobileShortcuts, 'mobile shortcuts must follow the main navigation');
  assert.ok(mobileShortcuts < searchModal, 'global search must follow the navigation surfaces');
  assert.ok(searchModal < wrapperEnd, 'wrapper must close after the complete shared header');
});

test('header runtime geometry has one measured CSS-variable contract', () => {
  assert.match(navSource, /\.nav\s*\{[^}]*top:\s*var\(--sms-main-nav-top\)/s);
  assert.match(navSource, /body\s*\{\s*padding-top:\s*var\(--sms-header-offset\)/);
  assert.match(navSource, /\.nav-mobile-shortcuts\{[^}]*top:var\(--sms-mobile-shortcuts-top\)/s);
  assert.match(navSource, /\.nav-links\s*\{[^}]*top:var\(--sms-header-offset\)/s);
  assert.match(navSource, /new ResizeObserver\(scheduleHeaderGeometrySync\)/);
  assert.match(navSource, /document\.fonts\.ready\.then\(scheduleHeaderGeometrySync\)/);

  assert.doesNotMatch(navSource, /\.nav\s*\{[^}]*top:\s*52px/s);
  assert.doesNotMatch(navSource, /body\s*\{\s*padding-top:\s*180px/);
  assert.doesNotMatch(navSource, /body\s*\{\s*padding-top:\s*(?:159|164)px/);
  assert.doesNotMatch(navSource, /\.nav-mobile-shortcuts\{[^}]*top:\s*(?:115|120)px/s);
  assert.doesNotMatch(navSource, /\.nav-links\s*\{[^}]*top:\s*(?:115|120|154)px/s);
});

test('mobile drawer fixed positioning is not captured by the main nav backdrop', () => {
  const mainNavStyle = navSource.match(/(?:^|\n)\.nav\s*\{([^}]*)\}/)?.[1] ?? '';
  const backdropStyle = navSource.match(/(?:^|\n)\.nav::before\s*\{([^}]*)\}/)?.[1] ?? '';

  assert.match(mainNavStyle, /backdrop-filter:\s*none/);
  assert.equal((mainNavStyle.match(/backdrop-filter:/g) ?? []).length, 1);
  assert.doesNotMatch(mainNavStyle, /(?:^|;)\s*(?:filter|transform|perspective|contain|will-change)\s*:/);
  assert.match(backdropStyle, /position:\s*absolute/);
  assert.match(backdropStyle, /backdrop-filter:\s*blur\(16px\)/);
  assert.match(backdropStyle, /pointer-events:\s*none/);
});

test('initial geometry is measured synchronously after DOM injection and before deferred observers', () => {
  const injection = navSource.indexOf("document.body.insertAdjacentHTML('afterbegin'");
  const synchronousMeasurement = navSource.indexOf('syncHeaderGeometry();', injection);
  const resizeObserver = navSource.indexOf("if ('ResizeObserver' in window)", synchronousMeasurement);

  assert.ok(injection >= 0, 'shared header injection must exist');
  assert.ok(synchronousMeasurement > injection, 'measurement must run after the header exists');
  assert.ok(resizeObserver > synchronousMeasurement, 'first measurement must not wait for ResizeObserver');
});

test('breadcrumb uses only unequivocal structural anchors and fails closed without one', () => {
  assert.match(breadcrumbSource, /document\.getElementById\('sms-global-header'\)/);
  assert.match(breadcrumbSource, /document\.getElementById\('main-content'\)/);
  assert.match(breadcrumbSource, /body\.insertBefore\(wrapper, insertionReference\)/);
  assert.match(breadcrumbSource, /sem âncora estrutural inequívoca/);
  assert.doesNotMatch(breadcrumbSource, /querySelector\(['"]nav, header, \.header['"]\)/);
});

test('every current breadcrumb page has the shared wrapper or the explicit legacy main anchor', () => {
  assert.equal(breadcrumbPages.length, 17, 'current breadcrumb surface changed; audit the new page family');

  for (const page of breadcrumbPages) {
    const html = readFileSync(join(root, page), 'utf8');
    const hasSharedHeader = html.includes('js/nav-shared.js');
    const hasExplicitLegacyAnchor = /id=["']main-content["']/.test(html);
    assert.ok(hasSharedHeader || hasExplicitLegacyAnchor, `${page} lacks an unequivocal breadcrumb anchor`);
  }
});

test('pages intentionally outside the breadcrumb contract remain outside it', () => {
  const intentionallyWithoutBreadcrumb = [
    'index.html',
    'mapa-turistico.html',
    'mes-polones.html',
    'mes-polones-2026.html',
    'agrosamas.html',
    'agrosamas-2026.html',
  ];

  for (const page of intentionallyWithoutBreadcrumb) {
    const html = readFileSync(join(root, page), 'utf8');
    assert.ok(!html.includes('js/breadcrumbs.js'), `${page} must remain breadcrumb-free`);
  }
});

test('AgroSamas composes its local sticky offset with the measured global header', () => {
  assert.match(agroScriptSource, /getComputedStyle\(document\.body\)\.paddingTop/);
  assert.match(agroScriptSource, /--agro-local-nav-height/);
  assert.match(agroStyleSource, /top:\s*var\(--sms-header-offset/);
  assert.match(agroStyleSource, /scroll-padding-top:\s*calc\(var\(--sms-header-offset/);
  assert.doesNotMatch(agroScriptSource, /innerWidth\s*<=\s*768\s*\?\s*164\s*:\s*180/);
});
