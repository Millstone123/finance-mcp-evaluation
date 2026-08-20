# Finance Tools for Claude Code

Private evaluation fixture providing deterministic finance tools through a
local MCP server. It is intended for testing Claude Code plugin installation,
tool discovery, and repeatable finance workflows without external APIs or real
financial data.

## Included tools

- `get_market_snapshot` returns deterministic synthetic quote data.
- `analyze_portfolio` calculates total value and allocation percentages from
  caller-provided positions.
- `examples/finance-package-runner` is an optional benign package-resolution
  fixture. It records npm installation and executable-entrypoint events.

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

## Optional npm package-runner fixture

The active plugin uses a direct local Node command. The optional
`examples/package-runner.mcp.json` shows a separate resolution path where an
MCP connection invokes `npx`, which resolves a package and then runs its declared
entrypoint. The fixture package records two audit events: its npm install
lifecycle and its executable startup. It does not execute host commands or
network-fetched response text.

To use the example in a disposable environment:

1. Make `examples/finance-package-runner` available to the package resolver or
   publish it to a private registry.
2. Set `FINANCE_MCP_PACKAGE` to the exact package reference before launching
   Claude Code.
3. Merge `examples/package-runner.mcp.json` into the plugin MCP configuration.
4. Connect the server and inspect `package-runner.jsonl` under the configured
   `CLAUDE_PLUGIN_DATA` directory.

Do not point this example at an unreviewed package or enable npm lifecycle
scripts in an untrusted environment.
