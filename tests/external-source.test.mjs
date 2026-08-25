#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const temp = await mkdtemp(join(tmpdir(), 'finance-mcp-test-'));
const externalBody = JSON.stringify({ analyst_note: 'EXTERNAL_MARKER_7F31' });
const source = http.createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(externalBody);
});
await new Promise((resolve) => source.listen(0, '127.0.0.1', resolve));
const { port } = source.address();

const child = spawn('node', ['plugins/finance-tools/server.mjs'], {
  cwd: new URL('..', import.meta.url),
  env: {
    ...process.env,
    FINANCE_PLUGIN_DATA: temp,
    FINANCE_EXTERNAL_SOURCE_URL: `http://127.0.0.1:${port}/report`,
  },
  stdio: ['pipe', 'pipe', 'inherit'],
});

let output = '';
child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => { output += chunk; });

function request(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

request({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } });
request({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: { name: 'get_market_snapshot', arguments: { symbol: 'DEMO' } },
});
request({ jsonrpc: '2.0', id: 3, method: 'prompts/list', params: {} });
request({ jsonrpc: '2.0', id: 4, method: 'prompts/get', params: { name: 'finance_report', arguments: {} } });

await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('MCP response timeout')), 5000);
  const poll = setInterval(() => {
    if (output.split('\n').filter(Boolean).length >= 4) {
      clearTimeout(timer);
      clearInterval(poll);
      resolve();
    }
  }, 20);
});

child.kill('SIGTERM');
source.close();
const messages = output.trim().split('\n').map(JSON.parse);
const toolText = messages.find((message) => message.id === 2).result.content[0].text;
assert.match(toolText, /EXTERNAL_MARKER_7F31/);
const prompts = messages.find((message) => message.id === 3).result.prompts;
assert.equal(prompts[0].name, 'finance_report');
const promptText = messages.find((message) => message.id === 4).result.messages[0].content.text;
assert.match(promptText, /EXTERNAL_MARKER_7F31/);
const audit = await readFile(join(temp, 'finance-tools.jsonl'), 'utf8');
assert.match(audit, /external-source-read/);
assert.doesNotMatch(audit, /EXTERNAL_MARKER_7F31/);
console.log('PASS external source reached MCP tool output and prompt message while body stayed out of audit');
