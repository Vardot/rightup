'use strict';

// Static check of the recipe's own files: content may only use component versions the recipe ships.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { Then } = require('@cucumber/cucumber');

const root = path.join(__dirname, '..', '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8').split('\n');
const ymlFiles = (dir) => fs.readdirSync(path.join(root, dir), { recursive: true })
  .filter((f) => f.endsWith('.yml')).map((f) => path.join(dir, f));

/**
 * The versions each shipped component config holds: its active version and the
 * keys under versioned_properties.
 */
function shippedVersions() {
  const shipped = {};
  for (const file of ymlFiles('config').filter((f) => path.basename(f).startsWith('canvas.component.'))) {
    let id = '';
    let inVersions = false;
    const versions = new Set();
    for (const line of read(file)) {
      if (/^\S/.test(line)) inVersions = line.startsWith('versioned_properties:');
      const top = line.match(/^(id|active_version): (\S+)$/);
      if (top && top[1] === 'id') id = top[2];
      if (top && top[1] === 'active_version') versions.add(top[2]);
      const key = inVersions && line.match(/^ {2}([0-9a-f]+):$/);
      if (key) versions.add(key[1]);
    }
    shipped[id] = versions;
  }
  return shipped;
}

/**
 * Assert every component instance in the content templates, patterns, page regions
 * and default content names a version that its component config ships. Canvas can
 * only render a shipped version; any other fails with an OutOfRangeException.
 *
 * Example #1: Then the recipe should ship every component version its content uses
 */
Then(/^the recipe should ship every component version its content uses$/, function () {
  const shipped = shippedVersions();
  const missing = [];
  for (const file of [...ymlFiles('config'), ...ymlFiles('content')]) {
    if (path.basename(file).startsWith('canvas.component.')) continue;
    let id = '';
    for (const line of read(file)) {
      const component = line.match(/component_id: ['"]?([^'"\s]+)/);
      if (component) id = component[1];
      const version = line.match(/component_version: ['"]?([^'"\s]+)/);
      if (version && id && shipped[id] && !shipped[id].has(version[1])) missing.push(`${file}: ${id} uses ${version[1]}`);
      if (version) id = '';
    }
  }
  assert.deepStrictEqual(missing, [], `The content uses component versions the recipe does not ship:\n${missing.join('\n')}`);
});
