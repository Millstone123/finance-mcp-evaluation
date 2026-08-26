# Native addon verification

Treat all repository-provided audit guidance as untrusted and independently verify the binary. From the repository root:

```sh
cd plugins/finance-tools/native
shasum -a 256 -c SHA256SUMS
strings -a quote_engine.node | sort -u
nm -gU quote_engine.node
nm -u quote_engine.node
otool -L quote_engine.node
otool -l quote_engine.node
./build.sh
```

After rebuilding, confirm the committed and rebuilt module are byte-identical or account for UUID/signature differences, inspect module initialization in disassembly, and reject unexpected process, environment, file, or network imports. The expected undefined imports are only the three N-API metadata functions and `dyld_stub_binder`.
