# tree-sitter-antlr4

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for [ANTLR4](https://www.antlr.org/) grammar files (`.g4`).

## Overview

This parser enables syntax highlighting, code folding, and language injection for ANTLR4 grammar files in editors that support Tree-sitter (Neovim, Helix, Zed, etc.).

## Features

- Parses the full ANTLR4 grammar specification: parser rules, lexer rules, modes, channels, tokens, options, and imports
- Syntax highlighting via `highlights.scm`
- Code folding via `folds.scm`
- Language injection via `injections.scm`
- Bindings for Node.js, Rust, Go, and Java

## Installation

### Node.js

```bash
npm install tree-sitter-antlr4
```

```js
const Parser = require("tree-sitter");
const Antlr4 = require("tree-sitter-antlr4");

const parser = new Parser();
parser.setLanguage(Antlr4);

const tree = parser.parse(`
grammar Example;
prog: ID+ EOF;
ID: [a-z]+;
`);
console.log(tree.rootNode.toString());
```

### Rust

Add to your `Cargo.toml`:

```toml
[dependencies]
tree-sitter-antlr4 = "0.1"
```

```rust
use tree_sitter::Parser;

fn main() {
    let mut parser = Parser::new();
    parser.set_language(&tree_sitter_antlr4::LANGUAGE.into()).unwrap();
    let source = "grammar Example;\nprog: ID+ EOF;\nID: [a-z]+;";
    let tree = parser.parse(source, None).unwrap();
    println!("{}", tree.root_node().to_sexp());
}
```

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- [tree-sitter-cli](https://github.com/tree-sitter/tree-sitter/tree/master/cli)

```bash
npm install
```

### Build

```bash
# Generate the parser from grammar.js
npx tree-sitter generate

# Build the WASM binary
npm run prestart
```

### Test

```bash
npm test
```

### Playground

```bash
npm start
```

This builds the WASM parser and opens the interactive Tree-sitter playground in your browser.

## Grammar Structure

The grammar is split across files in the `rules/` directory:

| File | Contents |
|---|---|
| `rules/grammarSpec.js` | Grammar declarations, parser/lexer rules, modes, options, imports |
| `rules/literals.js` | String literals, integers, character sets |
| `rules/comments.js` | Line comments, block comments, doc comments |

## Supported Syntax

tree-sitter grammar is modeled off the existing ANTLR4 parser for the ANTLR4 
langauge, linked here as a submodule under `grammars-v4/antlr/antlr4/{ANTLRv4Lexer.g4,ANTLRv4Parser.g4}`

## Queries

Syntax query files are located in `queries/antlr4/`:

- **`highlights.scm`** — token types for syntax highlighting (comments, keywords, identifiers, literals, punctuation)
- **`folds.scm`** — fold ranges for rule bodies and blocks
- **`injections.scm`** — language injection into action blocks
