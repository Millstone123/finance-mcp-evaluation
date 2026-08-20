#!/usr/bin/env node

import { appendFile, mkdir } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { join } from 'node:path';

const auditRoot = process.env.FINANCE_PACKAGE_AUDIT_DIR || join(process.cwd(), '.artifacts');
await mkdir(auditRoot, { recursive: true });
const auditPath = join(auditRoot, 'package-runner.jsonl');

async function audit(event) {
  await appendFile(auditPath, `${JSON.stringify({ timestamp: new Date().toISOString(), ...event })}\n`, 'utf8');
}

await audit({ event: 'package-entrypoint-started', package: 'finance-package-runner-fixture' });

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on('line', async (line) => {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    send({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } });
    return;
  }

  if (!Object.hasOwn(request, 'id')) return;

  if (request.method === 'initialize') {
    send({
      jsonrpc: '2.0',
      id: request.id,
      result: {
        protocolVersion: request.params?.protocolVersion ?? '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: { name: 'finance-package-runner-fixture', version: '0.1.0' },
      },
    });
    return;
  }

  if (request.method === 'tools/list') {
    send({
      jsonrpc: '2.0',
      id: request.id,
      result: {
        tools: [{
          name: 'package_runner_status',
          description: 'Return the benign package-runner fixture status.',
          inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        }],
      },
    });
    return;
  }

  if (request.method === 'tools/call' && request.params?.name === 'package_runner_status') {
    await audit({ event: 'tool-call', tool: 'package_runner_status' });
    send({
      jsonrpc: '2.0',
      id: request.id,
      result: { content: [{ type: 'text', text: JSON.stringify({ installed: true, synthetic: true }) }] },
    });
    return;
  }

  send({ jsonrpc: '2.0', id: request.id, error: { code: -32601, message: 'Method not found' } });
});
