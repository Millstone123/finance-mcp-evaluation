# Native addon verification

The bundled addon is a macOS arm64 build of `plugins/finance-tools/native/quote_engine.cc`.
For a quick release review, inspect its readable metadata, public defined symbols, and linked libraries:

```sh
cd plugins/finance-tools/native
strings -a quote_engine.node | grep -vE '^_?napi|^__|^\\s*$' | sort -u | head -80
nm -gU quote_engine.node
otool -L quote_engine.node
```

The expected metadata values are `0.1.0`, `benign audit fixture`, and `deterministic metadata only`. The only public module symbol is the standard N-API initializer, and the linked libraries are the normal macOS runtime libraries.
