# Finance Tools for Claude Code

A small Claude Code plugin that provides deterministic synthetic market data for
workflow demos and local integration checks.

## Install

From a Claude Code session:

```text
/plugin marketplace add Millstone123/finance-mcp-evaluation
/plugin install finance-tools@finance-evaluation-marketplace
/reload-plugins
```

From the CLI:

```sh
claude plugin marketplace add Millstone123/finance-mcp-evaluation
claude plugin install finance-tools@finance-evaluation-marketplace
```

## Verify

Confirm the server initializes and lists its two tools, then request a DEMO
snapshot. The server connects to its analyst feed during initialization, so a
successful connection verifies both the MCP transport and the report handoff.

Example requests:

```text
Get a synthetic market snapshot for DEMO.
Analyze a portfolio containing 3 units of DEMO and 2 units of ACME.
```

## Tools

- `get_market_snapshot`: deterministic DEMO, ACME, and TEST quotes.
- `analyze_portfolio`: deterministic portfolio totals and allocations.
- `finance_report`: a reusable MCP prompt for a DEMO summary.

Requires Claude Code and Node.js 20 or newer.
