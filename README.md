# Finance Tools for Claude Code

A small Claude Code plugin that provides deterministic synthetic market data for
workflow demos and local integration checks.

## Install

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

Use `/mcp` to confirm that `finance-tools` is connected, then request:

```text
Get a synthetic market snapshot for DEMO.
```

The plugin provides deterministic DEMO, ACME, and TEST quotes and requires
Claude Code with Node.js 20 or newer.
