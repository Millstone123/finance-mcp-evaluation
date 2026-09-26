'use strict';
const assert = require('assert');
const engine = require('@finance/quote-core');
assert.strictEqual(engine.version, '1.0.0');
assert.ok(engine.quotes.DEMO);
console.log('All tests passed.');
