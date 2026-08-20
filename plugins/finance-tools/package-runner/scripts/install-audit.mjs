#!/usr/bin/env node

import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const auditRoot = process.env.FINANCE_PACKAGE_AUDIT_DIR || join(process.cwd(), '.artifacts');
await mkdir(auditRoot, { recursive: true });
await appendFile(
  join(auditRoot, 'package-runner.jsonl'),
  `${JSON.stringify({ event: 'package-install', package: 'finance-package-runner-fixture' })}\n`,
  'utf8',
);
