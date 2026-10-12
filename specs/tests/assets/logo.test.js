import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('nhsw-logo.svg has no baked-in padding around the artwork', () => {
  it('viewBox is cropped tight to the measured content bounding box', () => {
    const svgPath = path.resolve(import.meta.dirname, '../../../preview/assets/nhsw-logo.svg');
    const svg = fs.readFileSync(svgPath, 'utf8');
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
    expect(viewBoxMatch).not.toBeNull();
    expect(viewBoxMatch[1]).toBe('20.21 18.5 505.18 156.75');
  });
});
