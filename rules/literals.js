const HEX_DIGIT = "[0-9a-fA-F]"
const UNICODE_ESC = `u${HEX_DIGIT}{0,4}`;
const BTNFR = "[btnfr\"'\\\\]";
const ESC_SEQUENCE = `\\\\(${BTNFR}|${UNICODE_ESC}|.)`;

export default {
    INT: $ => choice(
        token('0'), 
        token(/[1-9][0-9]*/)
    ),
    STRING_LITERAL: $ => token(seq(
        "'", 
        repeat(choice(
            new RegExp(ESC_SEQUENCE),
            /[^\'\r\n\\]/,
        )),
        "'")),
    DoubleQuoteLiteral: $ => token(seq('"', 
        repeat(choice(
            new RegExp(ESC_SEQUENCE),
            /[^"\r\n\\]/,
        )),
        '"')),
    // TODO: actually implement TripleQuoteLiteral with lookaheads
    TripleQuoteLiteral: $ => token(seq(
        '"""', /[^"]*/, '"""'
    )),
    BacktickQuoteLiteral: $ => token(seq('`', 
        repeat(choice(
            new RegExp(ESC_SEQUENCE),
            /[^`\r\n\\]/
        )),
        '`')),

}
