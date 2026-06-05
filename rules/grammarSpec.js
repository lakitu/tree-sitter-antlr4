export default {
    grammarSpec: $ => seq(
        $.grammarDecl,
        repeat($.prequelConstruct),
        optional($.rules),
        repeat($.modeSpec),
    ),
    
    grammarDecl: $ => seq(
        $.grammarType,
        $.identifier,
        ';'
    ),

    grammarType: $ => choice(
        seq('lexer', 'grammar'),
        seq('parser', 'grammar'),
        'grammar'
    ),

    prequelConstruct: $ => choice(
        $.optionsSpec,
        $.delegateGrammars,
        $.tokensSpec,
        $.channelsSpec,
        $.action_
    ),

    // Options -------------
    optionsSpec: $ => seq(
        "options",
        "{",
        repeat(seq($.option, ";")),
        "}"
    ),

    option: $ => seq($.identifier, "=", $.optionValue),

    optionValue: $ => choice(
        seq($.identifier, repeat(seq(".", $.identifier))),
        $.STRING_LITERAL,
        $.ACTION,
        $.INT
    ),

    // Delegates ----------------
    delegateGrammars: $ => seq(
        "import",
        $.delegateGrammar,
        repeat(seq(",", $.delegateGrammar)),
        ";"
    ),

    delegateGrammar: $ => seq(
        $.identifier,
        optional(seq("=", $.identifier))
    ),

    // Tokens & Channels --------------
    tokensSpec: $ => seq(
        "tokens",
        "{",
        optional($.idList),
        "}"
    ),

    channelsSpec: $ => seq(
        "channels",
        "{",
        optional($.idList),
        "}"
    ),

    idList: $ => prec.right(seq(
        $.identifier,
        repeat(seq(",", $.identifier)),
        optional(",")
    )),

    // Match stuff like @parser::members {int i;}
    action_: $ => seq(
        "@",
        optional(seq($.actionScopeName, "::")),
        $.identifier,
        $.actionBlock
    ),

    actionScopeName: $ => choice(
        $.identifier,
        "lexer",
        "parser"
    ),

    // TODO: NESTED_ACTION needs to have an external scanner (look this up)
    // tree-sitter uses a DFA, so it can't recursivley find nested '{' (stuff)* '}'
    actionBlock: $ => $.ACTION,
    ACTION: $ => seq(
        "{",
        repeat(choice(
            $.ACTION,
            $.STRING_LITERAL,
            $.DoubleQuoteLiteral,
            $.TripleQuoteLiteral,
            $.BacktickQuoteLiteral,
            $.block_comment,
            $.line_comment,
            seq("\\", /./),
            /[^{\\]/
        )),
        "}"
    ),

    argActionBlock: $ => seq(
        "[",
        repeat($.ARGUMENT_CONTENT),
        "]"
    ),

    ARGUMENT_CONTENT: $ => choice(
        seq("\\", /./),
        $.DoubleQuoteLiteral,
        $.STRING_LITERAL,
        $.argActionBlock,
        /[^\[\]\\]/
    ),

    modeSpec: $ => seq(
        "mode",
        $.identifier,
        ";",
        repeat($.lexerRuleSpec)
    ),

    rules: $ => repeat1($.ruleSpec),
    ruleSpec:  $ => choice(
        $.parserRuleSpec,
        $.lexerRuleSpec
    ),

    parserRuleSpec: $ => seq(
        optional($.ruleModifiers),
        $.RULE_REF,
        optional($.argActionBlock),
        optional($.ruleReturns),
        optional($.throwsSpec),
        optional($.localsSpec),
        repeat($.rulePrequel),
        ":",
        optional($.ruleBlock),
        ";",
        repeat($.exceptionHandler), // $.exceptionGroup extracted
        optional($.finallyClause)   // here because it can be empty
    ),

    exceptionHandler: $ => seq(
        "catch",
        $.argActionBlock,
        $.actionBlock
    ),

    finallyClause: $ => seq(
        "finally",
        $.actionBlock
    ),

    rulePrequel: $ => choice(
        $.optionsSpec,
        $.ruleAction
    ),

    ruleReturns: $ => seq(
        "returns",
        $.argActionBlock
    ),

    // Exception spec ---------
    throwsSpec: $ => seq(
        "throws",
        $.qualifiedIdentifier,
        repeat(seq(
            ",",
            $.qualifiedIdentifier
        ))
    ),

    localsSpec: $ => seq(
        "locals",
        $.argActionBlock
    ),

    ruleAction: $ => seq(
        "@",
        $.identifier,
        $.actionBlock
    ),

    ruleModifiers: $ => repeat1($.ruleModifier),

    ruleModifier: $ => choice(
        "public",
        "private",
        "protected",
        "fragment",
    ),

    ruleBlock: $ => $.ruleAltList,

    ruleAltList: $ => choice(
      seq(
        $.labeledAlt,
        repeat(seq(
            "|",
            optional($.labeledAlt)
        ))),
        repeat1(seq(
          "|",
          optional($.labeledAlt)
        ))

    ),

    labeledAlt: $ => seq(
        $.alternative,
        optional(seq(
            "#",
            $.identifier
        ))
    ),

    // Lexer rules --------------------

    lexerRuleSpec: $ => seq(
        optional("fragment"),
        $.TOKEN_REF,
        optional($.optionsSpec),
        ":",
        optional($.lexerRuleBlock),
        ";"
    ),

    lexerRuleBlock: $ => $.lexerAltList,
    // lexerAltList: lexerAlt ("|" lexerAlt)?
    lexerAltList: $ => choice(
      seq(
            $.lexerAlt,
            repeat(seq("|", optional($.lexerAlt)))
      ),
      repeat1(seq("|", optional($.lexerAlt)))
    ),

    lexerAlt: $ => choice(
      seq(
        $.lexerElements,
        optional($.lexerCommands)
      ),
      seq(
        optional($.lexerElements),
        $.lexerCommands
      )
    ),

    lexerElements: $ => repeat1($.lexerElement),

    lexerElement: $ => choice(
        seq($.lexerAtom, optional($.ebnfSuffix)),
        seq($.lexerBlock, optional($.ebnfSuffix)),
        seq($.actionBlock, optional("?"))
    ),

    lexerBlock: $ => seq("(", $.lexerAltList, ")"),

    lexerCommands: $ => seq(
        "->", 
        $.lexerCommand,
        repeat(seq(",", $.lexerCommand))
    ),

    lexerCommand: $ => seq(
        $.lexerCommandName,
        optional(seq(
            "(",
            $.lexerCommandExpr,
            ")",
        ))
    ),

    lexerCommandName: $ => choice($.identifier, "mode"),

    lexerCommandExpr: $ => choice($.identifier, $.INT),

    // Rule Alts -----------------
    altList: $ => choice(
        seq(
            $.alternative,
            repeat(seq("|", optional($.alternative)))
        ),
        repeat1(seq("|", optional($.alternative))),
    ),

    alternative: $ => seq(
        optional($.elementOptions),
        repeat1($.element)
    ),

    element: $ => choice(
        seq($.labeledElement, optional($.ebnfSuffix)),
        seq($.atom, optional($.ebnfSuffix)),
        $.ebnf,
        seq($.actionBlock, optional("?"), optional($.predicateOptions))
    ),

    predicateOptions: $ => seq(
        "<",
        $.predicateOption,
        repeat(seq(",", $.predicateOption)),
        ">"
    ),

    predicateOption: $ => choice(
        $.elementOption,
        seq(
            $.identifier,
            "=",
            $.actionBlock
            // choice(
            //     $.actionBlock,
            //     $.INT,
            //     $.STRING_LITERAL
            // )
        )
    ),

    labeledElement: $ => seq(
        $.identifier,
        choice("=", "+="),
        choice($.atom, $.block)
    ),

    // EBNF and blocks -----------
    ebnf: $ => seq($.block, optional($.blockSuffix)),

    blockSuffix: $ => $.ebnfSuffix,
    ebnfSuffix: $ => seq(
        choice("?", "*", "+"),
        optional("?")
    ),

    lexerAtom: $ => choice(
        $.characterRange,
        $.terminalDef,
        $.notSet,
        $.LEXER_CHAR_SET,
        $.wildcard
    ),

    atom: $ => choice(
        $.terminalDef,
        $.ruleref,
        $.notSet,
        $.wildcard
    ),

    wildcard: $ => seq(".", optional($.elementOptions)),

    notSet: $ => seq("~", choice(
        $.setElement,
        $.blockSet
    )),

    blockSet: $ => seq(
        "(",
        $.setElement,
        repeat(seq("|", $.setElement)),
        ")"
    ),

    setElement: $ => choice(
        seq($.TOKEN_REF, optional($.elementOptions)),
        seq($.STRING_LITERAL, optional($.elementOptions)),
        $.characterRange,
        $.LEXER_CHAR_SET
    ),

    LEXER_CHAR_SET: $ => token(seq(
        '[',
        repeat(choice(
            /[^\]\\]/,      // no closing bracket or backslash
            /\\./,          // backslash and then anything
        )),
        ']'
    )),

    // Grammar Block -----
    block: $ => seq(
        "(",
        optional(seq(
            optional($.optionsSpec),
            repeat($.ruleAction),
            ":"
        )),
        optional($.altList),
        ")"
    ),

    ruleref: $ => seq(
        $.RULE_REF,
        optional($.argActionBlock),
        optional($.elementOptions)
    ),

    characterRange: $ => seq(
        $.STRING_LITERAL,
        "..",
        $.STRING_LITERAL
    ),

    terminalDef: $ => seq(
        choice(
            $.TOKEN_REF,
            $.STRING_LITERAL
        ),
        optional($.elementOptions)
    ),

    elementOptions: $ => seq(
        "<",
        $.elementOption,
        repeat(seq(",", $.elementOption)),
        ">"
    ),

    elementOption: $ => choice(
        $.qualifiedIdentifier,
        seq(
            $.identifier,
            "=",
            choice(
                $.qualifiedIdentifier,
                $.STRING_LITERAL,
                $.INT
            )
        )
    ),

    identifier: $ => choice(
        $.TOKEN_REF,
        $.RULE_REF
    ),
    TOKEN_REF: $ => token(/[A-Z][a-zA-Z0-9_]*/),
    RULE_REF:  $ => token(/[a-z][a-zA-Z0-9_]*/),

    qualifiedIdentifier: $ => seq(
        $.identifier,
        repeat(seq(
            ".",
            $.identifier
        ))
    ),
}
