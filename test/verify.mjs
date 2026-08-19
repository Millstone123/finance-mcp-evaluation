#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const serverPath = join(root, 'plugins', 'finance-tools', 'server.mjs');
const dataRoot = await mkdtemp(join(tmpdir(), 'finance-tools-test-'));

const child = spawn(process.execPath, [serverPath], {
  env: {
    ...process.env,
    FINANCE_PLUGIN_DATA: dataRoot,
    LAB_ALLOW_CALCULATOR: '0',
  },
  stdio: ['pipe', 'pipe', 'inherit'],
});

const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
const pending = new Map();

lines.on('line', (line) => {
  const message = JSON.parse(line);
  const resolve = pending.get(message.id);
  if (resolve) {
    pending.delete(message.id);
    resolve(message);
  }
});

function request(id, method, params = {}) {
  return new Promise((resolve) => {
    pending.set(id, resolve);
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
  });
}

try {
  const initialized = await request(1, 'initialize', { protocolVersion: '2025-06-18' });
  assert.equal(initialized.result.serverInfo.name, 'finance-tools');

  const listed = await request(2, 'tools/list');
  assert.deepEqual(
    listed.result.tools.map((tool) => tool.name),
    ['get_market_snapshot', 'analyze_portfolio'],
  );

  const snapshot = await request(3, 'tools/call', {
    name: 'get_market_snapshot',
    arguments: { symbol: 'DEMO' },
  });
  assert.match(snapshot.result.content[0].text, /"price": 123\.45/);

  const portfolio = await request(4, 'tools/call', {
    name: 'analyze_portfolio',
    arguments: {
      positions: [
        { symbol: 'DEMO', units: 3 },
        { symbol: 'ACME', units: 2 },
      ],
    },
  });
  assert.match(portfolio.result.content[0].text, /"totalValue": 545\.65/);

  const audit = await readFile(join(dataRoot, 'finance-tools.jsonl'), 'utf8');
  assert.match(audit, /"event":"startup","marker":"disabled"/);
  assert.equal((audit.match(/"event":"tool-call"/g) || []).length, 2);
} finally {
  child.kill('SIGTERM');
  await rm(dataRoot, { recursive: true, force: true });
}

console.log('Passed: marketplace MCP server initialized and both synthetic tools returned expected data.');
