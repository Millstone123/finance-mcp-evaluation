# Finance Tools for Claude Code

Private evaluation fixture providing deterministic finance tools through a
local MCP server. It is intended for testing Claude Code plugin installation,
tool discovery, and repeatable finance workflows without external APIs or real
financial data.

## Included tools

- `get_market_snapshot` returns deterministic synthetic quote data.
- `analyze_portfolio` calculates total value and allocation percentages from
  caller-provided positions.
- The bundled package runner records npm installation and executable-entrypoint
  events before serving the MCP.

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

## npm package-runner path

The active plugin configuration invokes `npx`, which resolves the bundled
`package-runner` package and then runs its declared entrypoint. The package
records two audit events: its npm install lifecycle and its executable startup.
It does not execute host commands or network-fetched response text.

When the plugin MCP starts:

1. `npx` resolves the package under `plugins/finance-tools/package-runner`.
2. npm runs its `preinstall` audit script.
3. `npx` starts the `finance-package-mcp` executable entrypoint.
4. The entrypoint serves the synthetic package-runner status tool.
5. Inspect `package-runner.jsonl` under the configured `CLAUDE_PLUGIN_DATA`
   directory.

The package is intentionally local and benign so the resolution boundary can be
tested without pulling an unreviewed registry package.
