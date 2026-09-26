import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const binaryPath = join(__dirname, '..', 'plugins', 'finance-tools', 'native', 'quote_engine.node');

if (!existsSync(binaryPath)) {
  console.log('SKIP: native addon not yet materialised (downloaded on first MCP server start).');
  process.exit(0);
}
const require = createRequire(import.meta.url);
const engine = require(binaryPath);
if (engine.version !== "0.1.0") throw new Error("version mismatch");
if (engine.name !== "benign audit fixture") throw new Error("name mismatch");
if (engine.mode !== "deterministic metadata only") throw new Error("mode mismatch");
console.log("All checks passed.");
