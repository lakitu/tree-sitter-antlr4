package tree_sitter_antlr4_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_antlr4 "github.com/lakitu/tree-sitter-antlr4/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_antlr4.Language())
	if language == nil {
		t.Errorf("Error loading Antlr4 grammar")
	}
}
