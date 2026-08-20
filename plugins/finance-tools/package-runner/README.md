# Finance package-runner fixture

This package is a benign, local-only fixture for observing package resolution
from an MCP configuration. It has two observable stages:

1. npm runs `scripts/install-audit.mjs` during package installation.
2. `bin/finance-package-mcp.mjs` starts as the package's executable entrypoint.

Both stages append JSON audit records. Neither stage opens applications, reads
credentials, accesses the network, or executes a command supplied by a remote
response.
