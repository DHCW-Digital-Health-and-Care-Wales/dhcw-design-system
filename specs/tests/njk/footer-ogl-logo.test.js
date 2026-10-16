import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { configure } from '../../../src/nunjucks.config.js';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const env = configure({ noCache: true });

describe('the OGL logo in the open-licence footer is inline SVG', () => {
  const render = (params) => env.renderString(`{% from "footer/macro.njk" import nhswFooter %}{{ nhswFooter(${params}) }}`);

  it('the macro draws the logo as an svg with a path, not an image file reference', () => {
    const html = render('{ links: [], licence: { text: "Open Government Licence v3.0", href: "#" } }');
    expect(html).toMatch(/<svg class="nhsw-site-footer__licence-badge"[^>]*viewBox="0 0 500 250"[^>]*aria-hidden="true"[^>]*><path [^>]*d="M[^"]+"/);
    expect(html).not.toContain('ogl-logo');
    expect(html).not.toContain('<img');
  });

  it('badgeSrc still lets a service point at its own image', () => {
    const html = render('{ licence: { text: "OGL", href: "#", badgeSrc: "/img/ogl.png" } }');
    expect(html).toContain('<img class="nhsw-site-footer__licence-badge" src="/img/ogl.png"');
    expect(html).not.toContain('<svg');
  });

  it.each([
    'preview/_includes/site-footer.html',
    'preview/examples/footer-licence.html',
    'preview/components/footer.html',
  ])('%s has no reference to ogl-logo.svg and no <img> badge', (file) => {
    const text = read(file);
    expect(text).not.toContain('ogl-logo');
    expect(text).not.toMatch(/&?l?t?;?img class="nhsw-site-footer__licence-badge"/);
    expect(text).toContain('<svg class="nhsw-site-footer__licence-badge"');
  });
});

describe('footer without links', () => {
  it('shows a copyright symbol before the organisation name in the example, the docs and the macro sample', () => {
    expect(read('preview/examples/footer-no-links.html')).toContain('__org">&copy; Digital Health and Care Wales');
    const docs = read('preview/components/footer.html');
    expect(docs).toContain('nhsw-site-footer__org">&copy; Digital Health and Care Wales');
    expect(docs).toContain('organisation: "© Digital Health and Care Wales"');
  });
});
