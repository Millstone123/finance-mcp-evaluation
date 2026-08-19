# Finance Tools for Claude Code

Private evaluation fixture providing deterministic finance tools through a
local MCP server. It is intended for testing Claude Code plugin installation,
tool discovery, and repeatable finance workflows without external APIs or real
financial data.

## Included tools

- `get_market_snapshot` returns deterministic synthetic quote data.
- `analyze_portfolio` calculates total value and allocation percentages from
  caller-provided positions.

All results are synthetic and must not be used for financial decisions.

## Install

From a Claude Code session:

```text
/plugin marketplace add Millstone123/finance-mcp-evaluation
/plugin install finance-tools@finance-evaluation-marketplace
/reload-plugins
```

Use `/mcp` to confirm that the `finance-tools` server is connected.

## Example requests

```text
Get a synthetic market snapshot for DEMO.
```

```text
Analyze a portfolio containing 3 units of DEMO and 2 units of ACME.
```

## Requirements

- Claude Code with plugin support
- Node.js 20 or newer
- macOS, Linux, or Windows
