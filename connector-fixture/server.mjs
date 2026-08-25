#!/usr/bin/env node

import { appendFile } from 'node:fs/promises';
import http from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const auditPath = join(root, 'connector-audit.jsonl');
const port = Number.parseInt(process.env.CONNECTOR_PORT || '8787', 10);
const externalSourceUrl = process.env.FINANCE_EXTERNAL_SOURCE_URL || '';

async function audit(event) {
  await appendFile(
    auditPath,
    `${JSON.stringify({ timestamp: new Date().toISOString(), ...event })}\n`,
    'utf8',
  );
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(value));
}

function jsonRpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

async function externalContext() {
  if (!externalSourceUrl) return null;
  const parsed = new URL(externalSourceUrl);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('FINANCE_EXTERNAL_SOURCE_URL must use http or https');
  }
  const response = await fetch(parsed, {
    headers: { accept: 'application/json, text/plain;q=0.9' },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`External source returned HTTP ${response.status}`);
  const body = await response.text();
  await audit({ event: 'external-source-read', origin: parsed.origin, bytes: Buffer.byteLength(body) });
  return body;
}

const tools = [
  {
    name: 'get_connector_report',
    description: 'Return a synthetic finance report from the connector fixture.',
    inputSchema: {
      type: 'object',
      properties: { account: { type: 'string' } },
      required: ['account'],
      additionalProperties: false,
    },
  },
  {
    name: 'record_connector_action',
    description: 'Record a synthetic action in the local audit file.',
    inputSchema: {
      type: 'object',
      properties: { action: { type: 'string' }, marker: { type: 'string' } },
      required: ['action', 'marker'],
      additionalProperties: false,
    },
  },
];

const server = http.createServer(async (request, response) => {
  if (request.method !== 'POST' || request.url !== '/mcp') {
    sendJson(response, 404, { error: 'POST /mcp only' });
    return;
  }

  let body = '';
  request.setEncoding('utf8');
  for await (const chunk of request) body += chunk;

  let message;
  try {
    message = JSON.parse(body);
  } catch {
    sendJson(response, 400, { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } });
    return;
  }

  if (message.method === 'initialize') {
    sendJson(response, 200, jsonRpcResult(message.id, {
      protocolVersion: message.params?.protocolVersion ?? '2025-06-18',
      capabilities: { tools: {} },
      serverInfo: { name: 'finance-connector-fixture', version: '1.0.0' },
    }));
    return;
  }

  if (message.method === 'tools/list') {
    sendJson(response, 200, jsonRpcResult(message.id, { tools }));
    return;
  }

  if (message.method === 'tools/call' && message.params?.name === 'get_connector_report') {
    await audit({ event: 'report-read', account: message.params.arguments?.account ?? 'unknown' });
    const report = {
      account: message.params.arguments?.account ?? 'synthetic-account',
      holdings: [{ symbol: 'DEMO', units: 3, value: 370.35 }],
      currency: 'USD',
      synthetic: true,
    };
    try {
      const context = await externalContext();
      if (context !== null) report.external_context = context;
    } catch (sourceError) {
      sendJson(response, 200, jsonRpcResult(message.id, {
        isError: true,
        content: [{ type: 'text', text: sourceError.message }],
      }));
      return;
    }
    sendJson(response, 200, jsonRpcResult(message.id, {
      content: [{ type: 'text', text: JSON.stringify(report, null, 2) }],
    }));
    return;
  }

  if (message.method === 'tools/call' && message.params?.name === 'record_connector_action') {
    const args = message.params.arguments ?? {};
    await audit({ event: 'action-recorded', action: args.action, marker: args.marker });
    sendJson(response, 200, jsonRpcResult(message.id, {
      content: [{ type: 'text', text: JSON.stringify({ recorded: true, synthetic: true }) }],
    }));
    return;
  }

  sendJson(response, 200, { jsonrpc: '2.0', id: message.id, error: { code: -32601, message: 'Method not found' } });
});

server.listen(port, '127.0.0.1', async () => {
  await audit({ event: 'connector-started', address: `127.0.0.1:${port}` });
  console.error(`[finance-connector-fixture] listening on http://127.0.0.1:${port}/mcp`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
