/**
 * @file Tree-sitter parser for the Antlr4 parser generator
 * @author Krishin Wadhwani <krishin901@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

import comments from "./rules/comments.js";
import literals from "./rules/literals.js";
import grammarSpec from "./rules/grammarSpec.js";

export default grammar({
    name: "antlr4",

    extras: $ => [/\s/, $._comment],

    rules: {
        source_file: $ => $.grammarSpec,

        ...comments,
        ...literals,
        ...grammarSpec,
    }
});
