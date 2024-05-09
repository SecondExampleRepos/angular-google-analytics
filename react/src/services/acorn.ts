// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and returns
// an abstract syntax tree as specified by the [ESTree spec][estree].
//
// [estree]: https://github.com/estree/estree

function parse(input, options) {
    return Parser.parse(input, options)
}

// This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.

function parseExpressionAt(input, pos, options) {
    return Parser.parseExpressionAt(input, pos, options)
}

// Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenizer` export provides an interface to the tokenizer.

function tokenizer(input, options) {
    return Parser.tokenizer(input, options)
}

exports.Node = Node;
exports.Parser = Parser;
exports.Position = Position;
exports.SourceLocation = SourceLocation;
exports.TokContext = TokContext;
exports.Token = Token;
exports.TokenType = TokenType;
exports.defaultOptions = defaultOptions;
exports.getLineInfo = getLineInfo;
exports.isIdentifierChar = isIdentifierChar;
exports.isIdentifierStart = isIdentifierStart;
exports.isNewLine = isNewLine;
exports.keywordTypes = keywords;
exports.lineBreak = lineBreak;
exports.lineBreakG = lineBreakG;
exports.nonASCIIwhitespace = nonASCIIwhitespace;
exports.parse = parse;
exports.parseExpressionAt = parseExpressionAt;
exports.tokContexts = types;
exports.tokTypes = types$1;
exports.tokenizer = tokenizer;
exports.version = version;