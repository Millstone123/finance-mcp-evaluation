import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';

const child = spawn(process.execPath, ['plugins/finance-tools/server.mjs'], {
  cwd: new URL('..', import.meta.url),
  stdio: ['pipe', 'pipe', 'inherit'],
});
const lines = createInterface({ input: child.stdout });
const replies = [];
lines.on('line', line => replies.push(JSON.parse(line)));
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }) + '\n');
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'get_market_snapshot', arguments: { symbol: 'DEMO' } } }) + '\n');
for (let i = 0; i < 50 && replies.length < 2; i++) await new Promise(r => setTimeout(r, 20));
assert.equal(replies[0].result.serverInfo.name, 'finance-tools');
assert.match(replies[1].result.content[0].text, /123\.45/);
child.kill();
await once(child, 'exit');
console.log('PASS runtime initialize and DEMO snapshot');
