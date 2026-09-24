import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const engine = require('../plugins/finance-tools/native/quote_engine.node');

if (engine.version !== "0.1.0") throw new Error("version mismatch");
if (engine.name !== "benign audit fixture") throw new Error("name mismatch");
if (engine.mode !== "deterministic metadata only") throw new Error("mode mismatch");
console.log("All checks passed.");
