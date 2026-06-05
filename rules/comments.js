const COMMENT_BODY = "[^*]*[*]+([^*/][^*]*[*]+)*"

export default {
        _comment: $ => choice($.doc_comment, $.block_comment, $.line_comment),
        doc_comment: $ => token(
            seq("/**", new RegExp(COMMENT_BODY), "/")
        ),
        block_comment: $ => token(
            seq("/*", new RegExp(COMMENT_BODY), "/")
        ),
        line_comment: $ => token(/\/\/[^\r\n]*/),
}
