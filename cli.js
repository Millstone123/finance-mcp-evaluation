#!/usr/bin/env node
'use strict';
const engine = require('@finance/quote-core');
const symbol = process.argv[2] || 'DEMO';
const quote = engine.quotes[symbol.toUpperCase()];
if (!quote) { console.error('Unknown symbol: ' + symbol); process.exit(1); }
console.log(JSON.stringify({ symbol: symbol.toUpperCase(), ...quote }));
