;; none
; (actionBlock) @none

;; comments
(doc_comment) @comment.documentation
(block_comment) @comment
(line_comment) @comment

;; literals
(INT) @number
(STRING_LITERAL) @string
(DoubleQuoteLiteral) @string
(TripleQuoteLiteral) @string
(BacktickQuoteLiteral) @string

; (STRING_LITERAL "\\" @string.escape)

(LEXER_CHAR_SET) @string.regexp


;; keywords
(grammarType ["lexer" "parser" "grammar"] @keyword.type)
(optionsSpec "options" @keyword)
(delegateGrammars "import" @keyword.import)
(tokensSpec "tokens" @keyword)
(channelsSpec "channels" @keyword)
(ruleModifier
  ["public" "private" "protected" "fragment"] @keyword.modifier)
(lexerRuleSpec "fragment" @keyword.modifier)
;; line 81: action_ idk how to do this
(modeSpec "mode" @keyword)

(exceptionHandler "catch" @keyword.exception)
(finallyClause "finally" @keyword.exception)
(throwsSpec "throws" @keyword.exception)
(ruleReturns "returns" @keyword.return)

;; function
; ["popMode" "mode" "skip" "more" "type" "channel"] @function.builtin


;; identifiers
(TOKEN_REF) @type
(RULE_REF) @function


;; punctuation
[";" ":" "," "|"] @punctuation.delimiter
["{" "}" "[" "]" "(" ")" "<" ">"] @punctuation.bracket

;; operators
; [
;    "=" "+=" ".." "->" 
;    "*" "+" "?" "." "~"
;    "::" "$" "@" "#"
; ] @operator
