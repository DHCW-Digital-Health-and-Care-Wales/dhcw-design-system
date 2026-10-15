// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const load = (rel) => loadYaml(read(rel));

const release = load('.github/workflows/release.yml');
const ci = load('.github/workflows/ci.yml');
const steps = release.jobs.release.steps;
const step = (name) => steps.find((s) => s.name === name);

describe('Release workflow', () => {
  const inputs = release.on.workflow_dispatch.inputs;

  it('offers pre-release bumps as well as patch, minor and major', () => {
    expect(inputs.bump.options).toEqual(['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease']);
    expect(step('Bump version').run).toContain('--preid=rc');
  });

  it('does not publish to npm unless asked to: the choice defaults to none', () => {
    expect(inputs.publish_npm.options).toEqual(['none', 'dry-run', 'publish']);
    expect(inputs.publish_npm.default).toBe('none');
  });

  it('can request an id token for npm provenance, and writes to the repo for the tag', () => {
    expect(release.permissions).toEqual({ contents: 'write', 'id-token': 'write' });
  });

  it('points the Node setup at the npm registry', () => {
    expect(step('Setup Node').with['registry-url']).toBe('https://registry.npmjs.org');
  });

  it('builds the npm package files before the release, and publishes last', () => {
    const names = steps.map((s) => s.name);
    expect(names.indexOf('Prepare npm package files')).toBeGreaterThan(names.indexOf('Build JS'));
    expect(names.indexOf('Prepare npm package files')).toBeLessThan(names.indexOf('Commit version bump'));
    expect(names[names.length - 1]).toBe('Publish to npm');
  });

  it('marks a version with a hyphen as a GitHub pre-release', () => {
    expect(step('Create GitHub release').with.prerelease).toContain("contains(steps.version.outputs.version, '-')");
  });

  describe('Publish to npm step', () => {
    const publish = step('Publish to npm');

    it('only runs when publishing was chosen', () => {
      expect(publish.if).toContain("inputs.publish_npm != 'none'");
    });

    it('authenticates with the NPM_TOKEN secret', () => {
      expect(publish.env.NODE_AUTH_TOKEN).toBe('${{ secrets.NPM_TOKEN }}');
    });

    it('publishes pre-releases to the rc tag and everything else to latest, publicly', () => {
      expect(publish.run).toContain('TAG=rc');
      expect(publish.run).toContain('TAG=latest');
      expect(publish.run).toContain('--access public');
      expect(publish.run).toContain('npm publish');
    });

    it('adds provenance only for a public repository, and --dry-run for a dry run', () => {
      expect(publish.run).toMatch(/github\.event\.repository\.private[^\n]*false[^\n]*--provenance/);
      expect(publish.run).toMatch(/inputs\.publish_npm[^\n]*dry-run[^\n]*--dry-run/);
    });
  });

  it('has no comments, as the pipeline files are kept comment-free', () => {
    expect(read('.github/workflows/release.yml')).not.toMatch(/^\s*#/m);
  });
});

describe('CI workflow', () => {
  it('checks the npm package builds on every run', () => {
    const run = ci.jobs.test.steps.find((s) => s.name === 'Check npm package').run;
    expect(run).toContain('prepare-npm-package.js');
    expect(run).toContain('npm pack --dry-run');
  });

  it('runs all the tests through the report script, shows the report in the job summary and uploads it, even when tests fail', () => {
    const steps = ci.jobs.test.steps;
    expect(steps.find((s) => s.run === 'npm run report:tests')).toBeTruthy();
    const summary = steps.find((s) => s.name === 'Add report to job summary');
    expect(summary.if).toBe('always()');
    expect(summary.run).toContain('GITHUB_STEP_SUMMARY');
    const upload = steps.find((s) => s.uses && s.uses.startsWith('actions/upload-artifact'));
    expect(upload.if).toBe('always()');
    expect(upload.with.path).toBe('test-reports/');
  });

  it('never publishes to npm automatically on a push to main', () => {
    expect(read('.github/workflows/ci.yml')).not.toContain('npm publish');
  });
});
