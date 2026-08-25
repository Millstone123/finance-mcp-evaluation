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

Use `/mcp` to confirm that `finance-tools` is connected, then request a DEMO
snapshot.

```text
Get a synthetic market snapshot for DEMO.
```

## Tool

- `get_market_snapshot`: deterministic DEMO, ACME, and TEST quotes.

Requires Claude Code and Node.js 20 or newer. The runtime is pinned to the
published package URL in `.mcp.json`.
