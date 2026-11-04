const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function firstNpmRecord(value) {
  return Array.isArray(value) ? value[0] : value.filename ? value : Object.values(value)[0];
}

const root = path.resolve(__dirname, '..');
const directory = fs.mkdtempSync(path.join(root, '.package-test-'));
const run = (command, args) => execFileSync(command, args, { cwd: directory, stdio: 'pipe' });
try {
  const npm = process.env.npm_execpath || fs.realpathSync(execFileSync('which', ['npm'], { encoding: 'utf8' }).trim());
  assert.ok(npm, 'Run this check with npm run test:package');
  const packed = JSON.parse(run(process.execPath, [npm, 'pack', process.env.PACKAGE_TEST_SPEC || root, '--ignore-scripts', '--json']));
  const packageDirectory = path.join(directory, 'node_modules/@tjsr/mysql-pool-utils');
  fs.mkdirSync(packageDirectory, { recursive: true });
  run('tar', ['-xzf', firstNpmRecord(packed).filename, '-C', packageDirectory, '--strip-components=1']);
  const manifest = JSON.parse(fs.readFileSync(path.join(packageDirectory, 'package.json'), 'utf8'));
  for (const condition of ['import', 'require']) {
    for (const field of ['types', 'default']) {
      assert.ok(fs.existsSync(path.join(packageDirectory, manifest.exports['.'][condition][field])), `${condition}.${field} is missing from the packed distribution`);
    }
  }
  const fixture = `import { safeReleaseConnection, getConnection, type PoolConnection } from '@tjsr/mysql-pool-utils';
const released: boolean = safeReleaseConnection(undefined);
const connection: Promise<PoolConnection> = getConnection('package-test');
// @ts-expect-error The exported function must retain its PoolConnection argument type.
safeReleaseConnection(123);
export { released, connection };
`;
  for (const extension of ['mts', 'cts']) {
    fs.writeFileSync(path.join(directory, `consumer.${extension}`), fixture);
    run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--ignoreConfig', '--noEmit', '--strict', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', '--lib', 'ES2022', '--types', 'node', `consumer.${extension}`]);
  }
  const assertion = `if (utils.safeReleaseConnection(undefined) !== false || typeof utils.getConnection !== 'function') throw new Error('Missing runtime export');`;
  fs.writeFileSync(path.join(directory, 'runtime.mjs'), `import * as utils from '@tjsr/mysql-pool-utils';\n${assertion}\n`);
  fs.writeFileSync(path.join(directory, 'runtime.cjs'), `const utils = require('@tjsr/mysql-pool-utils');\n${assertion}\n`);
  run(process.execPath, ['runtime.mjs']);
  run(process.execPath, ['runtime.cjs']);
  console.log('Packed ESM/CommonJS declarations and runtime exports passed.');
} catch (error) {
  if (error.stdout) process.stderr.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  throw error;
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
