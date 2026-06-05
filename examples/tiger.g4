grammar tiger;

/* ---------------------------------- *
 * PARSER RULES
 * ---------------------------------- */
tiger_program : 'main' 'let' declaration_segment 'in' 'begin' stat_seq 'end' ;

declaration_segment : var_declaration_list funct_declaration_list ;

var_declaration_list :  (var_declaration)* ;

var_declaration :  'var' id_list ':' type (optional_init)? ';' ;

funct_declaration_list : (funct_declaration)* ;

funct_declaration : 'function' ID '(' param_list ')' ret_type 'begin' stat_seq 'end' ;

type : type_id | 'array' '[' INTLIT ']' 'of' type_id ;

type_id : 'int' | 'float' ;

id_list : ID (',' ID)* ;

optional_init : ':=' const_t ;

param_list : param (',' param)* ;

// param_list_tail : ',' param (param_list_tail)? ;

ret_type : (':' type)? ;

param : ID ':' type ;

stat_seq : (stat)+ ;

// opt_prefix : (lvalue ':=')? ;

stat :  ID id_stat_suffix ';' 
        | 'if' expr 'then' stat_seq ('else' stat_seq)? 'endif' ';'
        | 'while' expr 'do' stat_seq 'enddo' ';'
        | 'for' ID ':=' expr 'to' expr 'do' stat_seq 'enddo' ';'
        | 'break' ';'
        | 'return' expr ';'
        | 'let' declaration_segment 'in' stat_seq 'end' ;

// ( ) * / + - = <> > < >= <= & |
expr : or ;
or  : and ('|' and)* ;
and : leq ('&' leq)* ;
leq : geq ('<=' geq)* ;
geq : lt  ('>=' lt )* ;
lt  : gt  ('<'  gt )* ;
gt  : neq ('>' neq)* ;
neq : eq  ('<>' eq)* ;
eq  : min ('=' min)* ;
min : add ('-' add)* ;
add : div ('+' div)* ;
div : mul ('/' mul)* ;
mul : atom ('*' atom)* ;


// this violates LL(1) because an RHS can be ID() or ID + 5 and you won't know until the next symbol
id_stat_suffix : '(' expr_list ')'
                 | ('[' expr ']')? ':=' expr ;

atom : const_t | lvalue | '(' expr ')' ;

const_t : INTLIT | FLOATLIT ;

lvalue : ID (lvalue_modifier)? ;

lvalue_modifier : '[' expr ']' | '(' expr_list ')' ;

binary_operator : '+' | '-' | '*' | '/' | '=' | '<>' 
                | '<' | '>' | '<=' | '>=' | '&' | '|' ;

expr_list : (expr (',' expr)*)? ;

// expr_list_tail : (',' expr expr_list_tail)? ;


/* ---------------------------------- *
 * LEXER RULES
 * ---------------------------------- */
ID: [A-Za-z][A-Za-z_0-9]* ;

INTLIT : [0-9]+ ; // match integers

FLOATLIT : [0-9]+[.][0-9]* ;

KEYWORD : 'main' | 'array' | 'break' | 'do' | 'if' | 'else' | 'for'
                | 'function' | 'let' | 'in' | 'of' | 'then' | 'to' | 'var'
                | 'while' | 'endif' | 'begin' | 'end' | 'enddo' | 'return'
                | 'int' | 'float' ;

COMMENT : '/*' .*? '*/' -> skip ;

BINARY_OPERATOR : '+' | '-' | '*' | '/' | '=' | '<>'
                | '<' | '>' | '<=' | '>=' | '&' | '|' ;

PUNCTUATION : ',' | ':' | ';' | '(' | ')' | '[' | ']' ;

ASSIGNMENT_OPERATOR : ':=' ;

// NEWLINE:'\r'? '\n';
WS : (' ' | '\t' | '\n' | '\r')+ -> skip ; // skip spaces, tabs, newlines

