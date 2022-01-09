# Stone-soup Integration Tests

This is a suite of integration tests for [Stone Soup](https://github.com/earthstar-project/stone-soup), an Earthstar library.

## How it works

Each top-level folder is one kind of test.  For example, `signing` has tests for the signature-related code.

Inside that is a subfolder for each scenario (`node`, `deno`, and/or `browser`).

Each subfolder has its own package.json and is meant to be run independently.

## Running tests

There are Github Actions set up (in `.github/workflows`) for each kind of test.

You can run node tests manually by going into each subfolder and running `npm run everything`.  We expect that you have your own control over what version of node is running, perhaps using `fnm` or `nvm` to switch manually and run on each version.

## Node tests

Node tests run in two modes:

* `tsc` - just compile the test file by itself using tsc.  This won't run on node 12 because of the use of newer kinds of syntax in Earthstar, like the existential operator (`foo?.bar`).

* `esbuild` - create a bundle that contains all dependencies.  This also transpiles the code downwards for node 12 compatability with the syntax.
