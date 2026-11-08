import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
async function readModule(path) {
  const source = await fs.readFile(new URL(path, import.meta.url), 'utf8');
  return import('data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
}
const {refreshCopy} = await readModule('../src/refreshCopy.ts');
const {previousContent} = await readModule('../src/previous-content.ts');
const {defaultContent} = await readModule('../src/data.ts');
const {previousReleaseContent} = await readModule('../src/previous-release-content.ts');
const {validateContent} = await readModule('../src/lib.ts');
test('an existing site can adopt new copy without losing client edits, uploaded images or actual events', () => {
  const saved = structuredClone(previousContent);
  saved.settings.email = 'client@example.test';
  saved.settings.logo = '/images/client-logo.png';
  saved.home.title = 'A client-written welcome';
  saved.home.heroImage = 'https://cdn.example.test/approved.webp';
  saved.stories[0].body = 'A guide approved by our team.';
  saved.stories.pop(); // An intentionally deleted article must stay deleted.
  saved.gatherings[0].date = '2027-12-12'; saved.gatherings[0].sample = false;
  saved.copy['spirituality.title'] = 'Our own introduction';
  const refreshed = refreshCopy(saved, previousContent, defaultContent);
  validateContent(refreshed);
  assert.deepEqual(refreshed.settings, {...saved.settings, footerText:defaultContent.settings.footerText});
  assert.deepEqual(refreshed.media,saved.media);
  assert.deepEqual(refreshed.gatherings,saved.gatherings);
  assert.equal(refreshed.home.title,saved.home.title);
  assert.equal(refreshed.home.heroImage,saved.home.heroImage);
  assert.equal(refreshed.home.intro,defaultContent.home.intro);
  assert.equal(refreshed.stories[0].body,saved.stories[0].body);
  assert.equal(refreshed.stories.length,saved.stories.length);
  assert.equal(refreshed.copy['spirituality.title'],'Our own introduction');
  assert.equal(refreshed.copy['spirituality.0.title'],defaultContent.copy['spirituality.0.title']);
  assert.deepEqual(refreshCopy(refreshed,previousContent,defaultContent),refreshed);
  assert.equal(saved.home.intro,previousContent.home.intro);
});
test('the mistaken content release can return to the established section titles while retaining client overrides', () => {
  const installed = structuredClone(previousReleaseContent);
  installed.home.intro = 'An introduction written by the client.';
  installed.settings.email = 'client@example.test';
  installed.copy['custom.editor-text'] = 'Keep this custom wording.';
  const refreshed = refreshCopy(refreshCopy(installed, previousReleaseContent, defaultContent), previousContent, defaultContent);
  validateContent(refreshed);
  assert.equal(refreshed.home.title, previousContent.home.title);
  assert.equal(refreshed.home.intro, installed.home.intro);
  assert.equal(refreshed.settings.email, installed.settings.email);
  assert.deepEqual(refreshed.programmes.map(p=>p.title),previousContent.programmes.map(p=>p.title));
  assert.deepEqual(refreshed.stories.map(p=>p.title),previousContent.stories.map(p=>p.title));
  assert.equal(refreshed.copy['custom.editor-text'],'Keep this custom wording.');
  assert.equal(refreshed.copy['spirituality.title'],undefined);
});
