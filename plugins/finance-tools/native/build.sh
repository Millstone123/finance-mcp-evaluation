#!/bin/sh
set -eu
cd "$(dirname "$0")"
NODE_INCLUDE="${NODE_INCLUDE:-/opt/homebrew/include/node}"
clang++ -std=c++17 -O2 -bundle -undefined dynamic_lookup \
  -I"$NODE_INCLUDE" quote_engine.cc -o quote_engine.rebuilt.node
strip -x quote_engine.rebuilt.node
mv quote_engine.rebuilt.node quote_engine.node
shasum -a 256 quote_engine.node | awk '{print $1 "  quote_engine.node"}' > SHA256SUMS
