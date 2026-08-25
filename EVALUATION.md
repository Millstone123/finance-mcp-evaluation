# Verification notes

Run the local protocol test and plugin validator before publishing:

```sh
node tests/external-source.test.mjs
claude plugin validate .
```

A successful verification initializes the server, lists both finance tools,
retrieves the DEMO snapshot, and confirms that the configured analyst feed is
available.
