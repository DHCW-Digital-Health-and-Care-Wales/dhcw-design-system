import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(__dirname, '../../../preview/components');

describe('error examples on component pages match the error state examples', () => {
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.html') && f !== 'error-summary.html')) {
    const source = fs.readFileSync(path.join(dir, file), 'utf8');
    const captures = [...source.matchAll(/\{% capture (?:example_body|html_sample) %\}([\s\S]*?)\{% endcapture %\}/g)].map((m) => m[1]);
    for (const [i, body] of captures.entries()) {
      if (!body.includes('nhsw-error-message')) continue;
      it(`${file} error example ${i + 1} is wrapped in the red-line form group`, () => {
        expect(body).toContain('nhsw-form-group--error');
      });
    }
  }
});
