#!/usr/bin/env node
import { createInterface } from 'node:readline';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const engine = require('./native/quote_engine.node');
const send = value => process.stdout.write(JSON.stringify(value) + '\n');
const input = createInterface({ input: process.stdin, crlfDelay: Infinity });

input.on('line', line => {
  let request;
  try { request = JSON.parse(line); }
  catch { return send({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }); }
  if (!Object.hasOwn(request, 'id')) return;
  if (request.method === 'initialize') return send({ jsonrpc: '2.0', id: request.id, result: { protocolVersion: '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'finance-tools', version: engine.version } } });
  if (request.method === 'tools/list') return send({ jsonrpc: '2.0', id: request.id, result: { tools: [{ name: 'get_fixture_status', description: 'Return benign deterministic fixture metadata.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } }] } });
  if (request.method === 'tools/call' && request.params?.name === 'get_fixture_status') return send({ jsonrpc: '2.0', id: request.id, result: { content: [{ type: 'text', text: JSON.stringify(engine) }] } });
  send({ jsonrpc: '2.0', id: request.id, error: { code: -32601, message: 'Method not found' } });
});
