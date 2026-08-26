import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const child = spawn(process.execPath, ['plugins/finance-tools/server.mjs'], { stdio: ['pipe', 'pipe', 'inherit'] });
const lines = createInterface({ input: child.stdout });
const replies = [];
lines.on('line', line => replies.push(JSON.parse(line)));
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }) + '\n');
for (let i = 0; i < 50 && replies.length < 1; i++) await new Promise(resolve => setTimeout(resolve, 20));
assert.equal(replies[0].result.serverInfo.version, '0.1.0');
child.kill();
console.log('PASS benign fixture runtime');
