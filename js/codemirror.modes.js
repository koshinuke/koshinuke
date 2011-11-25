goog.provide('CodeMirror.modes');
goog.require('CodeMirror');

CodeMirror.defineMode("clike", function(config, parserConfig) {
  var indentUnit = config.indentUnit,
      keywords = parserConfig.keywords || {},
      blockKeywords = parserConfig.blockKeywords || {},
      atoms = parserConfig.atoms || {},
      hooks = parserConfig.hooks || {},
      multiLineStrings = parserConfig.multiLineStrings;
  var isOperatorChar = /[+\-*&%=<>!?|\/]/;

  var curPunc;

  function tokenBase(stream, state) {
    var ch = stream.next();
    if (hooks[ch]) {
      var result = hooks[ch](stream, state);
      if (result !== false) return result;
    }
    if (ch == '"' || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    }
    if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
      curPunc = ch;
      return null
    }
    if (/\d/.test(ch)) {
      stream.eatWhile(/[\w\.]/);
      return "number";
    }
    if (ch == "/") {
      if (stream.eat("*")) {
        state.tokenize = tokenComment;
        return tokenComment(stream, state);
      }
      if (stream.eat("/")) {
        stream.skipToEnd();
        return "comment";
      }
    }
    if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return "operator";
    }
    stream.eatWhile(/[\w\$_]/);
    var cur = stream.current();
    if (keywords.propertyIsEnumerable(cur)) {
      if (blockKeywords.propertyIsEnumerable(cur)) curPunc = "newstatement";
      return "keyword";
    }
    if (atoms.propertyIsEnumerable(cur)) return "atom";
    return "word";
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next, end = false;
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) {end = true; break;}
        escaped = !escaped && next == "\\";
      }
      if (end || !(escaped || multiLineStrings))
        state.tokenize = tokenBase;
      return "string";
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return "comment";
  }

  function Context(indented, column, type, align, prev) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.align = align;
    this.prev = prev;
  }
  function pushContext(state, col, type) {
    return state.context = new Context(state.indented, col, type, null, state.context);
  }
  function popContext(state) {
    var t = state.context.type;
    if (t == ")" || t == "]" || t == "}")
      state.indented = state.context.indented;
    return state.context = state.context.prev;
  }

  // Interface

  return {
    startState: function(basecolumn) {
      return {
        tokenize: null,
        context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
        indented: 0,
        startOfLine: true
      };
    },

    token: function(stream, state) {
      var ctx = state.context;
      if (stream.sol()) {
        if (ctx.align == null) ctx.align = false;
        state.indented = stream.indentation();
        state.startOfLine = true;
      }
      if (stream.eatSpace()) return null;
      curPunc = null;
      var style = (state.tokenize || tokenBase)(stream, state);
      if (style == "comment" || style == "meta") return style;
      if (ctx.align == null) ctx.align = true;

      if ((curPunc == ";" || curPunc == ":") && ctx.type == "statement") popContext(state);
      else if (curPunc == "{") pushContext(state, stream.column(), "}");
      else if (curPunc == "[") pushContext(state, stream.column(), "]");
      else if (curPunc == "(") pushContext(state, stream.column(), ")");
      else if (curPunc == "}") {
        while (ctx.type == "statement") ctx = popContext(state);
        if (ctx.type == "}") ctx = popContext(state);
        while (ctx.type == "statement") ctx = popContext(state);
      }
      else if (curPunc == ctx.type) popContext(state);
      else if (ctx.type == "}" || ctx.type == "top" || (ctx.type == "statement" && curPunc == "newstatement"))
        pushContext(state, stream.column(), "statement");
      state.startOfLine = false;
      return style;
    },

    indent: function(state, textAfter) {
      if (state.tokenize != tokenBase && state.tokenize != null) return 0;
      var firstChar = textAfter && textAfter.charAt(0), ctx = state.context, closing = firstChar == ctx.type;
      if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : indentUnit);
      else if (ctx.align) return ctx.column + (closing ? 0 : 1);
      else return ctx.indented + (closing ? 0 : indentUnit);
    },

    electricChars: "{}"
  };
});

(function() {
  function words(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }
  var cKeywords = "auto if break int case long char register continue return default short do sizeof " +
    "double static else struct entry switch extern typedef float union for unsigned " +
    "goto while enum void const signed volatile";

  function cppHook(stream, state) {
    if (!state.startOfLine) return false;
    stream.skipToEnd();
    return "meta";
  }

  // C#-style strings where "" escapes a quote.
  function tokenAtString(stream, state) {
    var next;
    while ((next = stream.next()) != null) {
      if (next == '"' && !stream.eat('"')) {
        state.tokenize = null;
        break;
      }
    }
    return "string";
  }

  CodeMirror.defineMIME("text/x-csrc", {
    name: "clike",
    keywords: words(cKeywords),
    blockKeywords: words("case do else for if switch while struct"),
    atoms: words("null"),
    hooks: {"#": cppHook}
  });
  CodeMirror.defineMIME("text/x-c++src", {
    name: "clike",
    keywords: words(cKeywords + " asm dynamic_cast namespace reinterpret_cast try bool explicit new " +
                    "static_cast typeid catch operator template typename class friend private " +
                    "this using const_cast inline public throw virtual delete mutable protected " +
                    "wchar_t"),
    blockKeywords: words("catch class do else finally for if struct switch try while"),
    atoms: words("true false null"),
    hooks: {"#": cppHook}
  });
  CodeMirror.defineMIME("text/x-java", {
    name: "clike",
    keywords: words("abstract assert boolean break byte case catch char class const continue default " + 
                    "do double else enum extends final finally float for goto if implements import " +
                    "instanceof int interface long native new package private protected public " +
                    "return short static strictfp super switch synchronized this throw throws transient " +
                    "try void volatile while"),
    blockKeywords: words("catch class do else finally for if switch try while"),
    atoms: words("true false null"),
    hooks: {
      "@": function(stream, state) {
        stream.eatWhile(/[\w\$_]/);
        return "meta";
      }
    }
  });
  CodeMirror.defineMIME("text/x-csharp", {
    name: "clike",
    keywords: words("abstract as base bool break byte case catch char checked class const continue decimal" + 
                    " default delegate do double else enum event explicit extern finally fixed float for" + 
                    " foreach goto if implicit in int interface internal is lock long namespace new object" + 
                    " operator out override params private protected public readonly ref return sbyte sealed short" + 
                    " sizeof stackalloc static string struct switch this throw try typeof uint ulong unchecked" + 
                    " unsafe ushort using virtual void volatile while add alias ascending descending dynamic from get" + 
                    " global group into join let orderby partial remove select set value var yield"),
    blockKeywords: words("catch class do else finally for foreach if struct switch try while"),
    atoms: words("true false null"),
    hooks: {
      "@": function(stream, state) {
        if (stream.eat('"')) {
          state.tokenize = tokenAtString;
          return tokenAtString(stream, state);
        }
        stream.eatWhile(/[\w\$_]/);
        return "meta";
      }
    }
  });
  CodeMirror.defineMIME("text/x-groovy", {
    name: "clike",
    keywords: words("abstract as assert boolean break byte case catch char class const continue def default " +
                    "do double else enum extends final finally float for goto if implements import " +
                    "in instanceof int interface long native new package property private protected public " +
                    "return short static strictfp super switch synchronized this throw throws transient " +
                    "try void volatile while"),
    atoms: words("true false null"),
    hooks: {
      "@": function(stream, state) {
        stream.eatWhile(/[\w\$_]/);
        return "meta";
      }
    }
  });
}());
/**
 * Author: Hans Engel
 * Branched from CodeMirror's Scheme mode (by Koh Zi Han, based on implementation by Koh Zi Chun)
 */
CodeMirror.defineMode("clojure", function (config, mode) {
    var BUILTIN = "builtin", COMMENT = "comment", STRING = "string", TAG = "tag",
        ATOM = "atom", NUMBER = "number", BRACKET = "bracket", KEYWORD="keyword";
    var INDENT_WORD_SKIP = 2, KEYWORDS_SKIP = 1;

    function makeKeywords(str) {
        var obj = {}, words = str.split(" ");
        for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
        return obj;
    }

    var atoms = makeKeywords("true false nil");

    var keywords = makeKeywords(
        // Control structures
        "defn defn- def def- defonce defmulti defmethod defmacro defstruct deftype defprotocol defrecord deftest slice defalias defhinted defmacro- defn-memo defnk defnk defonce- defunbound defunbound- defvar defvar- let letfn do case cond condp for loop recur when when-not when-let when-first if if-let if-not . .. -> ->> doto and or dosync doseq dotimes dorun doall load import unimport ns in-ns refer try catch finally throw with-open with-local-vars binding gen-class gen-and-load-class gen-and-save-class handler-case handle" +

        // Built-ins
        "* *1 *2 *3 *agent* *allow-unresolved-vars* *assert *clojure-version* *command-line-args* *compile-files* *compile-path* *e *err* *file* *flush-on-newline* *in* *macro-meta* *math-context* *ns* *out* *print-dup* *print-length* *print-level* *print-meta* *print-readably* *read-eval* *source-path* *use-context-classloader* *warn-on-reflection* + - / < <= = == > >= accessor aclone agent agent-errors aget alength alias all-ns alter alter-meta! alter-var-root amap ancestors and apply areduce array-map aset aset-boolean aset-byte aset-char aset-double aset-float aset-int aset-long aset-short assert assoc assoc! assoc-in associative? atom await await-for await1 bases bean bigdec bigint binding bit-and bit-and-not bit-clear bit-flip bit-not bit-or bit-set bit-shift-left bit-shift-right bit-test bit-xor boolean boolean-array booleans bound-fn bound-fn* butlast byte byte-array bytes case cast char char-array char-escape-string char-name-string char? chars chunk chunk-append chunk-buffer chunk-cons chunk-first chunk-next chunk-rest chunked-seq? class class? clear-agent-errors clojure-version coll? comment commute comp comparator compare compare-and-set! compile complement concat cond condp conj conj! cons constantly construct-proxy contains? count counted? create-ns create-struct cycle dec decimal? declare definline defmacro defmethod defmulti defn defn- defonce defstruct delay delay? deliver deref derive descendants destructure disj disj! dissoc dissoc! distinct distinct? doall doc dorun doseq dosync dotimes doto double double-array doubles drop drop-last drop-while empty empty? ensure enumeration-seq eval even? every? extend extend-protocol extend-type extends? extenders false? ffirst file-seq filter find find-doc find-ns find-var first float float-array float? floats flush fn fn? fnext for force format future future-call future-cancel future-cancelled? future-done? future? gen-class gen-interface gensym get get-in get-method get-proxy-class get-thread-bindings get-validator hash hash-map hash-set identical? identity if-let if-not ifn? import in-ns inc init-proxy instance? int int-array integer? interleave intern interpose into into-array ints io! isa? iterate iterator-seq juxt key keys keyword keyword? last lazy-cat lazy-seq let letfn line-seq list list* list? load load-file load-reader load-string loaded-libs locking long long-array longs loop macroexpand macroexpand-1 make-array make-hierarchy map map? mapcat max max-key memfn memoize merge merge-with meta method-sig methods min min-key mod name namespace neg? newline next nfirst nil? nnext not not-any? not-empty not-every? not= ns ns-aliases ns-imports ns-interns ns-map ns-name ns-publics ns-refers ns-resolve ns-unalias ns-unmap nth nthnext num number? odd? or parents partial partition pcalls peek persistent! pmap pop pop! pop-thread-bindings pos? pr pr-str prefer-method prefers primitives-classnames print print-ctor print-doc print-dup print-method print-namespace-doc print-simple print-special-doc print-str printf println println-str prn prn-str promise proxy proxy-call-with-super proxy-mappings proxy-name proxy-super push-thread-bindings pvalues quot rand rand-int range ratio? rational? rationalize re-find re-groups re-matcher re-matches re-pattern re-seq read read-line read-string reify reduce ref ref-history-count ref-max-history ref-min-history ref-set refer refer-clojure release-pending-sends rem remove remove-method remove-ns repeat repeatedly replace replicate require reset! reset-meta! resolve rest resultset-seq reverse reversible? rseq rsubseq satisfies? second select-keys send send-off seq seq? seque sequence sequential? set set-validator! set? short short-array shorts shutdown-agents slurp some sort sort-by sorted-map sorted-map-by sorted-set sorted-set-by sorted? special-form-anchor special-symbol? split-at split-with str stream? string? struct struct-map subs subseq subvec supers swap! symbol symbol? sync syntax-symbol-anchor take take-last take-nth take-while test the-ns time to-array to-array-2d trampoline transient tree-seq true? type unchecked-add unchecked-dec unchecked-divide unchecked-inc unchecked-multiply unchecked-negate unchecked-remainder unchecked-subtract underive unquote unquote-splicing update-in update-proxy use val vals var-get var-set var? vary-meta vec vector vector? when when-first when-let when-not while with-bindings with-bindings* with-in-str with-loading-context with-local-vars with-meta with-open with-out-str with-precision xml-seq");

    var indentKeys = makeKeywords(
        // Built-ins
        "ns fn def defn defmethod bound-fn if if-not case condp when while when-not when-first do future comment doto locking proxy with-open with-precision reify deftype defrecord defprotocol extend extend-protocol extend-type try catch" +

        // Binding forms
        "let letfn binding loop for doseq dotimes when-let if-let" +

        // Data structures
        "defstruct struct-map assoc" +

        // clojure.test
        "testing deftest" +

        // contrib
        "handler-case handle dotrace deftrace");

    var tests = {
        digit: /\d/,
        digit_or_colon: /[\d:]/,
        hex: /[0-9a-fA-F]/,
        sign: /[+-]/,
        exponent: /[eE]/,
        keyword_char: /[^\s\(\[\;\)\]]/,
        basic: /[\w\$_\-]/,
        lang_keyword: /[\w*+!\-_?:\/]/
    };

    function stateStack(indent, type, prev) { // represents a state stack object
        this.indent = indent;
        this.type = type;
        this.prev = prev;
    }

    function pushStack(state, indent, type) {
        state.indentStack = new stateStack(indent, type, state.indentStack);
    }

    function popStack(state) {
        state.indentStack = state.indentStack.prev;
    }

    function isNumber(ch, stream){
        // hex
        if ( ch === '0' && 'x' == stream.peek().toLowerCase() ) {
            stream.eat('x');
            stream.eatWhile(tests.hex);
            return true;
        }

        // leading sign
        if ( ch == '+' || ch == '-' ) {
          stream.eat(tests.sign);
          ch = stream.next();
        }

        if ( tests.digit.test(ch) ) {
            stream.eat(ch);
            stream.eatWhile(tests.digit);

            if ( '.' == stream.peek() ) {
                stream.eat('.');
                stream.eatWhile(tests.digit);
            }

            if ( 'e' == stream.peek().toLowerCase() ) {
                stream.eat(tests.exponent);
                stream.eat(tests.sign);
                stream.eatWhile(tests.digit);
            }

            return true;
        }

        return false;
    }

    return {
        startState: function () {
            return {
                indentStack: null,
                indentation: 0,
                mode: false
            };
        },

        token: function (stream, state) {
            if (state.indentStack == null && stream.sol()) {
                // update indentation, but only if indentStack is empty
                state.indentation = stream.indentation();
            }

            // skip spaces
            if (stream.eatSpace()) {
                return null;
            }
            var returnType = null;

            switch(state.mode){
                case "string": // multi-line string parsing mode
                    var next, escaped = false;
                    while ((next = stream.next()) != null) {
                        if (next == "\"" && !escaped) {

                            state.mode = false;
                            break;
                        }
                        escaped = !escaped && next == "\\";
                    }
                    returnType = STRING; // continue on in string mode
                    break;
                default: // default parsing mode
                    var ch = stream.next();

                    if (ch == "\"") {
                        state.mode = "string";
                        returnType = STRING;
                    } else if (ch == "'" && !( tests.digit_or_colon.test(stream.peek()) )) {
                        returnType = ATOM;
                    } else if (ch == ";") { // comment
                        stream.skipToEnd(); // rest of the line is a comment
                        returnType = COMMENT;
                    } else if (isNumber(ch,stream)){
                        returnType = NUMBER;
                    } else if (ch == "(" || ch == "[") {
                        var keyWord = ''; var indentTemp = stream.column();
                        /**
                        Either
                        (indent-word ..
                        (non-indent-word ..
                        (;something else, bracket, etc.
                        */

                        while ((letter = stream.eat(tests.keyword_char)) != null) {
                            keyWord += letter;
                        }

                        if (keyWord.length > 0 && indentKeys.propertyIsEnumerable(keyWord)) { // indent-word

                            pushStack(state, indentTemp + INDENT_WORD_SKIP, ch);
                        } else { // non-indent word
                            // we continue eating the spaces
                            stream.eatSpace();
                            if (stream.eol() || stream.peek() == ";") {
                                // nothing significant after
                                // we restart indentation 1 space after
                                pushStack(state, indentTemp + 1, ch);
                            } else {
                                pushStack(state, indentTemp + stream.current().length, ch); // else we match
                            }
                        }
                        stream.backUp(stream.current().length - 1); // undo all the eating

                        returnType = BRACKET;
                    } else if (ch == ")" || ch == "]") {
                        returnType = BRACKET;
                        if (state.indentStack != null && state.indentStack.type == (ch == ")" ? "(" : "[")) {
                            popStack(state);
                        }
                    } else if ( ch == ":" ) {
                        stream.eatWhile(tests.lang_keyword);
                        return TAG;
                    } else {
                        stream.eatWhile(tests.basic);

                        if (keywords && keywords.propertyIsEnumerable(stream.current())) {
                            returnType = BUILTIN;
                        } else if ( atoms && atoms.propertyIsEnumerable(stream.current()) ) {
                            returnType = ATOM;
                        } else returnType = null;
                    }
            }

            return returnType;
        },

        indent: function (state, textAfter) {
            if (state.indentStack == null) return state.indentation;
            return state.indentStack.indent;
        }
    };
});

CodeMirror.defineMIME("text/x-clojure", "clojure");
/**
 * Link to the project's GitHub page:
 * https://github.com/pickhardt/coffeescript-codemirror-mode
 */
CodeMirror.defineMode('coffeescript', function(conf) {
    var ERRORCLASS = 'error';
    
    function wordRegexp(words) {
        return new RegExp("^((" + words.join(")|(") + "))\\b");
    }
    
    var singleOperators = new RegExp("^[\\+\\-\\*/%&|\\^~<>!\?]");
    var singleDelimiters = new RegExp('^[\\(\\)\\[\\]\\{\\}@,:`=;\\.]');
    var doubleOperators = new RegExp("^((\->)|(\=>)|(\\+\\+)|(\\+\\=)|(\\-\\-)|(\\-\\=)|(\\*\\*)|(\\*\\=)|(\\/\\/)|(\\/\\=)|(==)|(!=)|(<=)|(>=)|(<>)|(<<)|(>>)|(//))");
    var doubleDelimiters = new RegExp("^((\\.\\.)|(\\+=)|(\\-=)|(\\*=)|(%=)|(/=)|(&=)|(\\|=)|(\\^=))");
    var tripleDelimiters = new RegExp("^((\\.\\.\\.)|(//=)|(>>=)|(<<=)|(\\*\\*=))");
    var identifiers = new RegExp("^[_A-Za-z][_A-Za-z0-9]*");

    var wordOperators = wordRegexp(['and', 'or', 'not',
                                    'is', 'isnt', 'in',
                                    'instanceof', 'typeof']);
    var indentKeywords = ['for', 'while', 'loop', 'if', 'unless', 'else',
                          'switch', 'try', 'catch', 'finally', 'class'];
    var commonKeywords = ['break', 'by', 'continue', 'debugger', 'delete',
                          'do', 'in', 'of', 'new', 'return', 'then',
                          'this', 'throw', 'when', 'until'];

    var keywords = wordRegexp(indentKeywords.concat(commonKeywords));

    indentKeywords = wordRegexp(indentKeywords);


    var stringPrefixes = new RegExp("^('{3}|\"{3}|['\"])");
    var regexPrefixes = new RegExp("^(/{3}|/)");
    var commonConstants = ['Infinity', 'NaN', 'undefined', 'null', 'true', 'false', 'on', 'off', 'yes', 'no'];
    var constants = wordRegexp(commonConstants);

    // Tokenizers
    function tokenBase(stream, state) {
        // Handle scope changes
        if (stream.sol()) {
            var scopeOffset = state.scopes[0].offset;
            if (stream.eatSpace()) {
                var lineOffset = stream.indentation();
                if (lineOffset > scopeOffset) {
                    return 'indent';
                } else if (lineOffset < scopeOffset) {
                    return 'dedent';
                }
                return null;
            } else {
                if (scopeOffset > 0) {
                    dedent(stream, state);
                }
            }
        }
        if (stream.eatSpace()) {
            return null;
        }
        
        var ch = stream.peek();
        
        // Handle comments
        if (ch === '#') {
            stream.skipToEnd();
            return 'comment';
        }
        
        // Handle number literals
        if (stream.match(/^-?[0-9\.]/, false)) {
            var floatLiteral = false;
            // Floats
            if (stream.match(/^-?\d*\.\d+(e[\+\-]?\d+)?/i)) {
              floatLiteral = true;
            }
            if (stream.match(/^-?\d+\.\d*/)) {
              floatLiteral = true;
            }
            if (stream.match(/^-?\.\d+/)) {
              floatLiteral = true;
            }
            if (floatLiteral) {
                return 'number';
            }
            // Integers
            var intLiteral = false;
            // Hex
            if (stream.match(/^-?0x[0-9a-f]+/i)) {
              intLiteral = true;
            }
            // Decimal
            if (stream.match(/^-?[1-9]\d*(e[\+\-]?\d+)?/)) {
                intLiteral = true;
            }
            // Zero by itself with no other piece of number.
            if (stream.match(/^-?0(?![\dx])/i)) {
              intLiteral = true;
            }
            if (intLiteral) {
                return 'number';
            }
        }
        
        // Handle strings
        if (stream.match(stringPrefixes)) {
            state.tokenize = tokenFactory(stream.current(), 'string');
            return state.tokenize(stream, state);
        }
        // Handle regex literals
        if (stream.match(regexPrefixes)) {
            if (stream.current() != '/' || stream.match(/^.*\//, false)) { // prevent highlight of division
                state.tokenize = tokenFactory(stream.current(), 'string-2');
                return state.tokenize(stream, state);
            } else {
                stream.backUp(1);
            }
        }
        
        // Handle operators and delimiters
        if (stream.match(tripleDelimiters) || stream.match(doubleDelimiters)) {
            return 'punctuation';
        }
        if (stream.match(doubleOperators)
            || stream.match(singleOperators)
            || stream.match(wordOperators)) {
            return 'operator';
        }
        if (stream.match(singleDelimiters)) {
            return 'punctuation';
        }
        
        if (stream.match(constants)) {
            return 'atom';
        }
        
        if (stream.match(keywords)) {
            return 'keyword';
        }
        
        if (stream.match(identifiers)) {
            return 'variable';
        }
        
        // Handle non-detected items
        stream.next();
        return ERRORCLASS;
    }
    
    function tokenFactory(delimiter, outclass) {
        var delim_re = new RegExp(delimiter);
        var singleline = delimiter.length == 1;
        
        return function tokenString(stream, state) {
            while (!stream.eol()) {
                stream.eatWhile(/[^'"\/\\]/);
                if (stream.eat('\\')) {
                    stream.next();
                    if (singleline && stream.eol()) {
                        return outclass;
                    }
                } else if (stream.match(delim_re)) {
                    state.tokenize = tokenBase;
                    return outclass;
                } else {
                    stream.eat(/['"\/]/);
                }
            }
            if (singleline) {
                if (conf.mode.singleLineStringErrors) {
                    outclass = ERRORCLASS
                } else {
                    state.tokenize = tokenBase;
                }
            }
            return outclass;
        };
    }
    
    function indent(stream, state, type) {
        type = type || 'coffee';
        var indentUnit = 0;
        if (type === 'coffee') {
            for (var i = 0; i < state.scopes.length; i++) {
                if (state.scopes[i].type === 'coffee') {
                    indentUnit = state.scopes[i].offset + conf.indentUnit;
                    break;
                }
            }
        } else {
            indentUnit = stream.column() + stream.current().length;
        }
        state.scopes.unshift({
            offset: indentUnit,
            type: type
        });
    }
    
    function dedent(stream, state) {
        if (state.scopes.length == 1) return;
        if (state.scopes[0].type === 'coffee') {
            var _indent = stream.indentation();
            var _indent_index = -1;
            for (var i = 0; i < state.scopes.length; ++i) {
                if (_indent === state.scopes[i].offset) {
                    _indent_index = i;
                    break;
                }
            }
            if (_indent_index === -1) {
                return true;
            }
            while (state.scopes[0].offset !== _indent) {
                state.scopes.shift();
            }
            return false
        } else {
            state.scopes.shift();
            return false;
        }
    }

    function tokenLexer(stream, state) {
        var style = state.tokenize(stream, state);
        var current = stream.current();

        // Handle '.' connected identifiers
        if (current === '.') {
            style = state.tokenize(stream, state);
            current = stream.current();
            if (style === 'variable') {
                return 'variable';
            } else {
                return ERRORCLASS;
            }
        }
        
        // Handle properties
        if (current === '@') {
            style = state.tokenize(stream, state);
            current = stream.current();
            if (style === 'variable') {
                return 'variable-2';
            } else {
                return ERRORCLASS;
            }
        }
        
        // Handle scope changes.
        if (current === 'return') {
            state.dedent += 1;
        }
        if (((current === '->' || current === '=>') &&
                  !state.lambda &&
                  state.scopes[0].type == 'coffee' &&
                  stream.peek() === '')
               || style === 'indent') {
            indent(stream, state);
        }
        var delimiter_index = '[({'.indexOf(current);
        if (delimiter_index !== -1) {
            indent(stream, state, '])}'.slice(delimiter_index, delimiter_index+1));
        }
        if (indentKeywords.exec(current)){
            indent(stream, state);
        }
        if (current == 'then'){
            dedent(stream, state);
        }
        

        if (style === 'dedent') {
            if (dedent(stream, state)) {
                return ERRORCLASS;
            }
        }
        delimiter_index = '])}'.indexOf(current);
        if (delimiter_index !== -1) {
            if (dedent(stream, state)) {
                return ERRORCLASS;
            }
        }
        if (state.dedent > 0 && stream.eol() && state.scopes[0].type == 'coffee') {
            if (state.scopes.length > 1) state.scopes.shift();
            state.dedent -= 1;
        }
        
        return style;
    }

    var external = {
        startState: function(basecolumn) {
            return {
              tokenize: tokenBase,
              scopes: [{offset:basecolumn || 0, type:'coffee'}],
              lastToken: null,
              lambda: false,
              dedent: 0
          };
        },
        
        token: function(stream, state) {
            var style = tokenLexer(stream, state);
            
            state.lastToken = {style:style, content: stream.current()};
            
            if (stream.eol() && stream.lambda) {
                state.lambda = false;
            }
            
            return style;
        },
        
        indent: function(state, textAfter) {
            if (state.tokenize != tokenBase) {
                return 0;
            }
            
            return state.scopes[0].offset;
        }
        
    };
    return external;
});

CodeMirror.defineMIME('text/x-coffeescript', 'coffeescript');
CodeMirror.defineMode("css", function(config) {
  var indentUnit = config.indentUnit, type;
  function ret(style, tp) {type = tp; return style;}

  function tokenBase(stream, state) {
    var ch = stream.next();
    if (ch == "@") {stream.eatWhile(/[\w\\\-]/); return ret("meta", stream.current());}
    else if (ch == "/" && stream.eat("*")) {
      state.tokenize = tokenCComment;
      return tokenCComment(stream, state);
    }
    else if (ch == "<" && stream.eat("!")) {
      state.tokenize = tokenSGMLComment;
      return tokenSGMLComment(stream, state);
    }
    else if (ch == "=") ret(null, "compare");
    else if ((ch == "~" || ch == "|") && stream.eat("=")) return ret(null, "compare");
    else if (ch == "\"" || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    }
    else if (ch == "#") {
      stream.eatWhile(/[\w\\\-]/);
      return ret("atom", "hash");
    }
    else if (ch == "!") {
      stream.match(/^\s*\w*/);
      return ret("keyword", "important");
    }
    else if (/\d/.test(ch)) {
      stream.eatWhile(/[\w.%]/);
      return ret("number", "unit");
    }
    else if (/[,.+>*\/]/.test(ch)) {
      return ret(null, "select-op");
    }
    else if (/[;{}:\[\]]/.test(ch)) {
      return ret(null, ch);
    }
    else {
      stream.eatWhile(/[\w\\\-]/);
      return ret("variable", "variable");
    }
  }

  function tokenCComment(stream, state) {
    var maybeEnd = false, ch;
    while ((ch = stream.next()) != null) {
      if (maybeEnd && ch == "/") {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ret("comment", "comment");
  }

  function tokenSGMLComment(stream, state) {
    var dashes = 0, ch;
    while ((ch = stream.next()) != null) {
      if (dashes >= 2 && ch == ">") {
        state.tokenize = tokenBase;
        break;
      }
      dashes = (ch == "-") ? dashes + 1 : 0;
    }
    return ret("comment", "comment");
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote && !escaped)
          break;
        escaped = !escaped && ch == "\\";
      }
      if (!escaped) state.tokenize = tokenBase;
      return ret("string", "string");
    };
  }

  return {
    startState: function(base) {
      return {tokenize: tokenBase,
              baseIndent: base || 0,
              stack: []};
    },

    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);

      var context = state.stack[state.stack.length-1];
      if (type == "hash" && context == "rule") style = "atom";
      else if (style == "variable") {
        if (context == "rule") style = "number";
        else if (!context || context == "@media{") style = "tag";
      }

      if (context == "rule" && /^[\{\};]$/.test(type))
        state.stack.pop();
      if (type == "{") {
        if (context == "@media") state.stack[state.stack.length-1] = "@media{";
        else state.stack.push("{");
      }
      else if (type == "}") state.stack.pop();
      else if (type == "@media") state.stack.push("@media");
      else if (context == "{" && type != "comment") state.stack.push("rule");
      return style;
    },

    indent: function(state, textAfter) {
      var n = state.stack.length;
      if (/^\}/.test(textAfter))
        n -= state.stack[state.stack.length-1] == "rule" ? 2 : 1;
      return state.baseIndent + n * indentUnit;
    },

    electricChars: "}"
  };
});

CodeMirror.defineMIME("text/css", "css");
CodeMirror.defineMode("diff", function() {
  return {
    token: function(stream) {
      var ch = stream.next();
      stream.skipToEnd();
      if (ch == "+") return "plus";
      if (ch == "-") return "minus";
      if (ch == "@") return "rangeinfo";
    }
  };
});

CodeMirror.defineMIME("text/x-diff", "diff");
CodeMirror.defineMode("javascript", function(config, parserConfig) {
  var indentUnit = config.indentUnit;
  var jsonMode = parserConfig.json;

  // Tokenizer

  var keywords = function(){
    function kw(type) {return {type: type, style: "keyword"};}
    var A = kw("keyword a"), B = kw("keyword b"), C = kw("keyword c");
    var operator = kw("operator"), atom = {type: "atom", style: "atom"};
    return {
      "if": A, "while": A, "with": A, "else": B, "do": B, "try": B, "finally": B,
      "return": C, "break": C, "continue": C, "new": C, "delete": C, "throw": C,
      "var": kw("var"), "function": kw("function"), "catch": kw("catch"),
      "for": kw("for"), "switch": kw("switch"), "case": kw("case"), "default": kw("default"),
      "in": operator, "typeof": operator, "instanceof": operator,
      "true": atom, "false": atom, "null": atom, "undefined": atom, "NaN": atom, "Infinity": atom
    };
  }();

  var isOperatorChar = /[+\-*&%=<>!?|]/;

  function chain(stream, state, f) {
    state.tokenize = f;
    return f(stream, state);
  }

  function nextUntilUnescaped(stream, end) {
    var escaped = false, next;
    while ((next = stream.next()) != null) {
      if (next == end && !escaped)
        return false;
      escaped = !escaped && next == "\\";
    }
    return escaped;
  }

  // Used as scratch variables to communicate multiple values without
  // consing up tons of objects.
  var type, content;
  function ret(tp, style, cont) {
    type = tp; content = cont;
    return style;
  }

  function jsTokenBase(stream, state) {
    var ch = stream.next();
    if (ch == '"' || ch == "'")
      return chain(stream, state, jsTokenString(ch));
    else if (/[\[\]{}\(\),;\:\.]/.test(ch))
      return ret(ch);
    else if (ch == "0" && stream.eat(/x/i)) {
      stream.eatWhile(/[\da-f]/i);
      return ret("number", "number");
    }      
    else if (/\d/.test(ch)) {
      stream.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/);
      return ret("number", "number");
    }
    else if (ch == "/") {
      if (stream.eat("*")) {
        return chain(stream, state, jsTokenComment);
      }
      else if (stream.eat("/")) {
        stream.skipToEnd();
        return ret("comment", "comment");
      }
      else if (state.reAllowed) {
        nextUntilUnescaped(stream, "/");
        stream.eatWhile(/[gimy]/); // 'y' is "sticky" option in Mozilla
        return ret("regexp", "string");
      }
      else {
        stream.eatWhile(isOperatorChar);
        return ret("operator", null, stream.current());
      }
    }
    else if (ch == "#") {
        stream.skipToEnd();
        return ret("error", "error");
    }
    else if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return ret("operator", null, stream.current());
    }
    else {
      stream.eatWhile(/[\w\$_]/);
      var word = stream.current(), known = keywords.propertyIsEnumerable(word) && keywords[word];
      return known ? ret(known.type, known.style, word) :
                     ret("variable", "variable", word);
    }
  }

  function jsTokenString(quote) {
    return function(stream, state) {
      if (!nextUntilUnescaped(stream, quote))
        state.tokenize = jsTokenBase;
      return ret("string", "string");
    };
  }

  function jsTokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = jsTokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ret("comment", "comment");
  }

  // Parser

  var atomicTypes = {"atom": true, "number": true, "variable": true, "string": true, "regexp": true};

  function JSLexical(indented, column, type, align, prev, info) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.prev = prev;
    this.info = info;
    if (align != null) this.align = align;
  }

  function inScope(state, varname) {
    for (var v = state.localVars; v; v = v.next)
      if (v.name == varname) return true;
  }

  function parseJS(state, style, type, content, stream) {
    var cc = state.cc;
    // Communicate our context to the combinators.
    // (Less wasteful than consing up a hundred closures on every call.)
    cx.state = state; cx.stream = stream; cx.marked = null, cx.cc = cc;
  
    if (!state.lexical.hasOwnProperty("align"))
      state.lexical.align = true;

    while(true) {
      var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
      if (combinator(type, content)) {
        while(cc.length && cc[cc.length - 1].lex)
          cc.pop()();
        if (cx.marked) return cx.marked;
        if (type == "variable" && inScope(state, content)) return "variable-2";
        return style;
      }
    }
  }

  // Combinator utils

  var cx = {state: null, column: null, marked: null, cc: null};
  function pass() {
    for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
  }
  function cont() {
    pass.apply(null, arguments);
    return true;
  }
  function register(varname) {
    var state = cx.state;
    if (state.context) {
      cx.marked = "def";
      for (var v = state.localVars; v; v = v.next)
        if (v.name == varname) return;
      state.localVars = {name: varname, next: state.localVars};
    }
  }

  // Combinators

  var defaultVars = {name: "this", next: {name: "arguments"}};
  function pushcontext() {
    if (!cx.state.context) cx.state.localVars = defaultVars;
    cx.state.context = {prev: cx.state.context, vars: cx.state.localVars};
  }
  function popcontext() {
    cx.state.localVars = cx.state.context.vars;
    cx.state.context = cx.state.context.prev;
  }
  function pushlex(type, info) {
    var result = function() {
      var state = cx.state;
      state.lexical = new JSLexical(state.indented, cx.stream.column(), type, null, state.lexical, info)
    };
    result.lex = true;
    return result;
  }
  function poplex() {
    var state = cx.state;
    if (state.lexical.prev) {
      if (state.lexical.type == ")")
        state.indented = state.lexical.indented;
      state.lexical = state.lexical.prev;
    }
  }
  poplex.lex = true;

  function expect(wanted) {
    return function expecting(type) {
      if (type == wanted) return cont();
      else if (wanted == ";") return pass();
      else return cont(arguments.callee);
    };
  }

  function statement(type) {
    if (type == "var") return cont(pushlex("vardef"), vardef1, expect(";"), poplex);
    if (type == "keyword a") return cont(pushlex("form"), expression, statement, poplex);
    if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
    if (type == "{") return cont(pushlex("}"), block, poplex);
    if (type == ";") return cont();
    if (type == "function") return cont(functiondef);
    if (type == "for") return cont(pushlex("form"), expect("("), pushlex(")"), forspec1, expect(")"),
                                      poplex, statement, poplex);
    if (type == "variable") return cont(pushlex("stat"), maybelabel);
    if (type == "switch") return cont(pushlex("form"), expression, pushlex("}", "switch"), expect("{"),
                                         block, poplex, poplex);
    if (type == "case") return cont(expression, expect(":"));
    if (type == "default") return cont(expect(":"));
    if (type == "catch") return cont(pushlex("form"), pushcontext, expect("("), funarg, expect(")"),
                                        statement, poplex, popcontext);
    return pass(pushlex("stat"), expression, expect(";"), poplex);
  }
  function expression(type) {
    if (atomicTypes.hasOwnProperty(type)) return cont(maybeoperator);
    if (type == "function") return cont(functiondef);
    if (type == "keyword c") return cont(maybeexpression);
    if (type == "(") return cont(pushlex(")"), expression, expect(")"), poplex, maybeoperator);
    if (type == "operator") return cont(expression);
    if (type == "[") return cont(pushlex("]"), commasep(expression, "]"), poplex, maybeoperator);
    if (type == "{") return cont(pushlex("}"), commasep(objprop, "}"), poplex, maybeoperator);
    return cont();
  }
  function maybeexpression(type) {
    if (type.match(/[;\}\)\],]/)) return pass();
    return pass(expression);
  }
    
  function maybeoperator(type, value) {
    if (type == "operator" && /\+\+|--/.test(value)) return cont(maybeoperator);
    if (type == "operator") return cont(expression);
    if (type == ";") return;
    if (type == "(") return cont(pushlex(")"), commasep(expression, ")"), poplex, maybeoperator);
    if (type == ".") return cont(property, maybeoperator);
    if (type == "[") return cont(pushlex("]"), expression, expect("]"), poplex, maybeoperator);
  }
  function maybelabel(type) {
    if (type == ":") return cont(poplex, statement);
    return pass(maybeoperator, expect(";"), poplex);
  }
  function property(type) {
    if (type == "variable") {cx.marked = "property"; return cont();}
  }
  function objprop(type) {
    if (type == "variable") cx.marked = "property";
    if (atomicTypes.hasOwnProperty(type)) return cont(expect(":"), expression);
  }
  function commasep(what, end) {
    function proceed(type) {
      if (type == ",") return cont(what, proceed);
      if (type == end) return cont();
      return cont(expect(end));
    }
    return function commaSeparated(type) {
      if (type == end) return cont();
      else return pass(what, proceed);
    };
  }
  function block(type) {
    if (type == "}") return cont();
    return pass(statement, block);
  }
  function vardef1(type, value) {
    if (type == "variable"){register(value); return cont(vardef2);}
    return cont();
  }
  function vardef2(type, value) {
    if (value == "=") return cont(expression, vardef2);
    if (type == ",") return cont(vardef1);
  }
  function forspec1(type) {
    if (type == "var") return cont(vardef1, forspec2);
    if (type == ";") return pass(forspec2);
    if (type == "variable") return cont(formaybein);
    return pass(forspec2);
  }
  function formaybein(type, value) {
    if (value == "in") return cont(expression);
    return cont(maybeoperator, forspec2);
  }
  function forspec2(type, value) {
    if (type == ";") return cont(forspec3);
    if (value == "in") return cont(expression);
    return cont(expression, expect(";"), forspec3);
  }
  function forspec3(type) {
    if (type != ")") cont(expression);
  }
  function functiondef(type, value) {
    if (type == "variable") {register(value); return cont(functiondef);}
    if (type == "(") return cont(pushlex(")"), pushcontext, commasep(funarg, ")"), poplex, statement, popcontext);
  }
  function funarg(type, value) {
    if (type == "variable") {register(value); return cont();}
  }

  // Interface

  return {
    startState: function(basecolumn) {
      return {
        tokenize: jsTokenBase,
        reAllowed: true,
        cc: [],
        lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
        localVars: null,
        context: null,
        indented: 0
      };
    },

    token: function(stream, state) {
      if (stream.sol()) {
        if (!state.lexical.hasOwnProperty("align"))
          state.lexical.align = false;
        state.indented = stream.indentation();
      }
      if (stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);
      if (type == "comment") return style;
      state.reAllowed = type == "operator" || type == "keyword c" || type.match(/^[\[{}\(,;:]$/);
      return parseJS(state, style, type, content, stream);
    },

    indent: function(state, textAfter) {
      if (state.tokenize != jsTokenBase) return 0;
      var firstChar = textAfter && textAfter.charAt(0), lexical = state.lexical,
          type = lexical.type, closing = firstChar == type;
      if (type == "vardef") return lexical.indented + 4;
      else if (type == "form" && firstChar == "{") return lexical.indented;
      else if (type == "stat" || type == "form") return lexical.indented + indentUnit;
      else if (lexical.info == "switch" && !closing)
        return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
      else if (lexical.align) return lexical.column + (closing ? 0 : 1);
      else return lexical.indented + (closing ? 0 : indentUnit);
    },

    electricChars: ":{}"
  };
});

CodeMirror.defineMIME("text/javascript", "javascript");
CodeMirror.defineMIME("application/json", {name: "javascript", json: true});
CodeMirror.defineMode("markdown", function(cmCfg, modeCfg) {

  var htmlMode = CodeMirror.getMode(cmCfg, { name: 'xml', htmlMode: true });

  var header   = 'header'
  ,   code     = 'code'
  ,   quote    = 'quote'
  ,   list     = 'list'
  ,   hr       = 'hr'
  ,   linktext = 'linktext'
  ,   linkhref = 'linkhref'
  ,   em       = 'em'
  ,   strong   = 'strong'
  ,   emstrong = 'emstrong';

  var hrRE = /^[*-=_]/
  ,   ulRE = /^[*-+]\s+/
  ,   olRE = /^[0-9]\.\s+/
  ,   headerRE = /^(?:\={3,}|-{3,})$/
  ,   codeRE = /^(k:\t|\s{4,})/
  ,   textRE = /^[^\[*_\\<>`]+/;

  function switchInline(stream, state, f) {
    state.f = state.inline = f;
    return f(stream, state);
  }

  function switchBlock(stream, state, f) {
    state.f = state.block = f;
    return f(stream, state);
  }


  // Blocks

  function blockNormal(stream, state) {
    if (stream.match(codeRE)) {
      stream.skipToEnd();
      return code;
    }
    
    if (stream.eatSpace()) {
      return null;
    }
    
    if (stream.peek() === '#' || stream.match(headerRE)) {
      stream.skipToEnd();
      return header;
    }
    if (stream.eat('>')) {
      state.indentation++;
      return quote;
    }
    if (stream.peek() === '<') {
      return switchBlock(stream, state, htmlBlock);
    }
    if (stream.peek() === '[') {
      return switchInline(stream, state, footnoteLink);
    }
    if (hrRE.test(stream.peek())) {
      var re = new RegExp('(?:\s*['+stream.peek()+']){3,}$');
      if (stream.match(re, true)) {
        return hr;
      }
    }
    
    var match;
    if (match = stream.match(ulRE, true) || stream.match(olRE, true)) {
      state.indentation += match[0].length;
      return list;
    }
    
    return switchInline(stream, state, state.inline);
  }

  function htmlBlock(stream, state) {
    var type = htmlMode.token(stream, state.htmlState);
    if (stream.eol() && !state.htmlState.context) {
      state.block = blockNormal;
    }
    return type;
  }


  // Inline

  function inlineNormal(stream, state) {
    function getType() {
      return state.strong ? (state.em ? emstrong : strong)
                          : (state.em ? em       : null);
    }
    
    if (stream.match(textRE, true)) {
      return getType();
    }
    
    var ch = stream.next();
    
    if (ch === '\\') {
      stream.next();
      return getType();
    }
    if (ch === '`') {
      return switchInline(stream, state, inlineElement(code, '`'));
    }
    if (ch === '<') {
      return switchInline(stream, state, inlineElement(linktext, '>'));
    }
    if (ch === '[') {
      return switchInline(stream, state, linkText);
    }
    
    var t = getType();
    if (ch === '*' || ch === '_') {
      if (stream.eat(ch)) {
        return (state.strong = !state.strong) ? getType() : t;
      }
      return (state.em = !state.em) ? getType() : t;
    }
    
    return getType();
  }

  function linkText(stream, state) {
    while (!stream.eol()) {
      var ch = stream.next();
      if (ch === '\\') stream.next();
      if (ch === ']') {
        state.inline = state.f = linkHref;
        return linktext;
      }
    }
    return linktext;
  }

  function linkHref(stream, state) {
    stream.eatSpace();
    var ch = stream.next();
    if (ch === '(' || ch === '[') {
      return switchInline(stream, state, inlineElement(linkhref, ch === '(' ? ')' : ']'));
    }
    return 'error';
  }

  function footnoteLink(stream, state) {
    if (stream.match(/^[^\]]*\]:/, true)) {
      state.f = footnoteUrl;
      return linktext;
    }
    return switchInline(stream, state, inlineNormal);
  }

  function footnoteUrl(stream, state) {
    stream.eatSpace();
    stream.match(/^[^\s]+/, true);
    state.f = state.inline = inlineNormal;
    return linkhref;
  }

  function inlineElement(type, endChar, next) {
    next = next || inlineNormal;
    return function(stream, state) {
      while (!stream.eol()) {
        var ch = stream.next();
        if (ch === '\\') stream.next();
        if (ch === endChar) {
          state.inline = state.f = next;
          return type;
        }
      }
      return type;
    };
  }

  return {
    startState: function() {
      return {
        f: blockNormal,
        
        block: blockNormal,
        htmlState: htmlMode.startState(),
        indentation: 0,
        
        inline: inlineNormal,
        em: false,
        strong: false
      };
    },

    copyState: function(s) {
      return {
        f: s.f,
        
        block: s.block,
        htmlState: CodeMirror.copyState(htmlMode, s.htmlState),
        indentation: s.indentation,
        
        inline: s.inline,
        em: s.em,
        strong: s.strong
      };
    },

    token: function(stream, state) {
      if (stream.sol()) {
        state.f = state.block;
        var previousIndentation = state.indentation
        ,   currentIndentation = 0;
        while (previousIndentation > 0) {
          if (stream.eat(' ')) {
            previousIndentation--;
            currentIndentation++;
          } else if (previousIndentation >= 4 && stream.eat('\t')) {
            previousIndentation -= 4;
            currentIndentation += 4;
          } else {
            break;
          }
        }
        state.indentation = currentIndentation;
        
        if (currentIndentation > 0) return null;
      }
      return state.f(stream, state);
    }
  };

});

CodeMirror.defineMIME("text/x-markdown", "markdown");
(function() {
  function keywords(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }
  function heredoc(delim) {
    return function(stream, state) {
      if (stream.match(delim)) state.tokenize = null;
      else stream.skipToEnd();
      return "string";
    }
  }
  var phpConfig = {
    name: "clike",
    keywords: keywords("abstract and array as break case catch cfunction class clone const continue declare " +
                       "default do else elseif enddeclare endfor endforeach endif endswitch endwhile extends " +
                       "final for foreach function global goto if implements interface instanceof namespace " +
                       "new or private protected public static switch throw try use var while xor return" +
                       "die echo empty exit eval include include_once isset list require require_once print unset"),
    blockKeywords: keywords("catch do else elseif for foreach if switch try while"),
    atoms: keywords("true false null TRUE FALSE NULL"),
    multiLineStrings: true,
    hooks: {
      "$": function(stream, state) {
        stream.eatWhile(/[\w\$_]/);
        return "variable-2";
      },
      "<": function(stream, state) {
        if (stream.match(/<</)) {
          stream.eatWhile(/[\w\.]/);
          state.tokenize = heredoc(stream.current().slice(3));
          return state.tokenize(stream, state);
        }
        return false;
      },
      "#": function(stream, state) {
        stream.skipToEnd();
        return "comment";
      }
    }
  };

  CodeMirror.defineMode("php", function(config, parserConfig) {
    var htmlMode = CodeMirror.getMode(config, "text/html");
    var jsMode = CodeMirror.getMode(config, "text/javascript");
    var cssMode = CodeMirror.getMode(config, "text/css");
    var phpMode = CodeMirror.getMode(config, phpConfig);

    function dispatch(stream, state) { // TODO open PHP inside text/css
      if (state.curMode == htmlMode) {
        var style = htmlMode.token(stream, state.curState);
        if (style == "meta" && /^<\?/.test(stream.current())) {
          state.curMode = phpMode;
          state.curState = state.php;
          state.curClose = /^\?>/;
		  state.mode =  'php';
        }
        else if (style == "tag" && stream.current() == ">" && state.curState.context) {
          if (/^script$/i.test(state.curState.context.tagName)) {
            state.curMode = jsMode;
            state.curState = jsMode.startState(htmlMode.indent(state.curState, ""));
            state.curClose = /^<\/\s*script\s*>/i;
			state.mode =  'javascript';
          }
          else if (/^style$/i.test(state.curState.context.tagName)) {
            state.curMode = cssMode;
            state.curState = cssMode.startState(htmlMode.indent(state.curState, ""));
            state.curClose =  /^<\/\s*style\s*>/i;
            state.mode =  'css';
          }
        }
        return style;
      }
      else if (stream.match(state.curClose, false)) {
        state.curMode = htmlMode;
        state.curState = state.html;
        state.curClose = null;
		state.mode =  'html';
        return dispatch(stream, state);
      }
      else return state.curMode.token(stream, state.curState);
    }

    return {
      startState: function() {
        var html = htmlMode.startState();
        return {html: html,
                php: phpMode.startState(),
                curMode:	parserConfig.startOpen ? phpMode : htmlMode,
                curState:	parserConfig.startOpen ? phpMode.startState() : html,
                curClose:	parserConfig.startOpen ? /^\?>/ : null,
				mode:		parserConfig.startOpen ? 'php' : 'html'}
      },

      copyState: function(state) {
        var html = state.html, htmlNew = CodeMirror.copyState(htmlMode, html),
            php = state.php, phpNew = CodeMirror.copyState(phpMode, php), cur;
        if (state.curState == html) cur = htmlNew;
        else if (state.curState == php) cur = phpNew;
        else cur = CodeMirror.copyState(state.curMode, state.curState);
        return {html: htmlNew, php: phpNew, curMode: state.curMode, curState: cur, curClose: state.curClose};
      },

      token: dispatch,

      indent: function(state, textAfter) {
        if ((state.curMode != phpMode && /^\s*<\//.test(textAfter)) ||
            (state.curMode == phpMode && /^\?>/.test(textAfter)))
          return htmlMode.indent(state.html, textAfter);
        return state.curMode.indent(state.curState, textAfter);
      },

      electricChars: "/{}:"
    }
  });
  CodeMirror.defineMIME("application/x-httpd-php", "php");
  CodeMirror.defineMIME("application/x-httpd-php-open", {name: "php", startOpen: true});
  CodeMirror.defineMIME("text/x-php", phpConfig);
})();
CodeMirror.defineMode("python", function(conf, parserConf) {
    var ERRORCLASS = 'error';
    
    function wordRegexp(words) {
        return new RegExp("^((" + words.join(")|(") + "))\\b");
    }
    
    var singleOperators = new RegExp("^[\\+\\-\\*/%&|\\^~<>!]");
    var singleDelimiters = new RegExp('^[\\(\\)\\[\\]\\{\\}@,:`=;\\.]');
    var doubleOperators = new RegExp("^((==)|(!=)|(<=)|(>=)|(<>)|(<<)|(>>)|(//)|(\\*\\*))");
    var doubleDelimiters = new RegExp("^((\\+=)|(\\-=)|(\\*=)|(%=)|(/=)|(&=)|(\\|=)|(\\^=))");
    var tripleDelimiters = new RegExp("^((//=)|(>>=)|(<<=)|(\\*\\*=))");
    var identifiers = new RegExp("^[_A-Za-z][_A-Za-z0-9]*");

    var wordOperators = wordRegexp(['and', 'or', 'not', 'is', 'in']);
    var commonkeywords = ['as', 'assert', 'break', 'class', 'continue',
                          'def', 'del', 'elif', 'else', 'except', 'finally',
                          'for', 'from', 'global', 'if', 'import',
                          'lambda', 'pass', 'raise', 'return',
                          'try', 'while', 'with', 'yield'];
    var commontypes = ['bool', 'classmethod', 'complex', 'dict', 'enumerate',
                       'float', 'frozenset', 'int', 'list', 'object',
                       'property', 'reversed', 'set', 'slice', 'staticmethod',
                       'str', 'super', 'tuple', 'type'];
    var py2 = {'types': ['basestring', 'buffer', 'file', 'long', 'unicode',
                         'xrange'],
               'keywords': ['exec', 'print']};
    var py3 = {'types': ['bytearray', 'bytes', 'filter', 'map', 'memoryview',
                         'open', 'range', 'zip'],
               'keywords': ['nonlocal']};

    if (!!parserConf.version && parseInt(parserConf.version, 10) === 3) {
        commonkeywords = commonkeywords.concat(py3.keywords);
        commontypes = commontypes.concat(py3.types);
        var stringPrefixes = new RegExp("^(([rb]|(br))?('{3}|\"{3}|['\"]))", "i");
    } else {
        commonkeywords = commonkeywords.concat(py2.keywords);
        commontypes = commontypes.concat(py2.types);
        var stringPrefixes = new RegExp("^(([rub]|(ur)|(br))?('{3}|\"{3}|['\"]))", "i");
    }
    var keywords = wordRegexp(commonkeywords);
    var types = wordRegexp(commontypes);

    var indentInfo = null;

    // tokenizers
    function tokenBase(stream, state) {
        // Handle scope changes
        if (stream.sol()) {
            var scopeOffset = state.scopes[0].offset;
            if (stream.eatSpace()) {
                var lineOffset = stream.indentation();
                if (lineOffset > scopeOffset) {
                    indentInfo = 'indent';
                } else if (lineOffset < scopeOffset) {
                    indentInfo = 'dedent';
                }
                return null;
            } else {
                if (scopeOffset > 0) {
                    dedent(stream, state);
                }
            }
        }
        if (stream.eatSpace()) {
            return null;
        }
        
        var ch = stream.peek();
        
        // Handle Comments
        if (ch === '#') {
            stream.skipToEnd();
            return 'comment';
        }
        
        // Handle Number Literals
        if (stream.match(/^[0-9\.]/, false)) {
            var floatLiteral = false;
            // Floats
            if (stream.match(/^\d*\.\d+(e[\+\-]?\d+)?/i)) { floatLiteral = true; }
            if (stream.match(/^\d+\.\d*/)) { floatLiteral = true; }
            if (stream.match(/^\.\d+/)) { floatLiteral = true; }
            if (floatLiteral) {
                // Float literals may be "imaginary"
                stream.eat(/J/i);
                return 'number';
            }
            // Integers
            var intLiteral = false;
            // Hex
            if (stream.match(/^0x[0-9a-f]+/i)) { intLiteral = true; }
            // Binary
            if (stream.match(/^0b[01]+/i)) { intLiteral = true; }
            // Octal
            if (stream.match(/^0o[0-7]+/i)) { intLiteral = true; }
            // Decimal
            if (stream.match(/^[1-9]\d*(e[\+\-]?\d+)?/)) {
                // Decimal literals may be "imaginary"
                stream.eat(/J/i);
                // TODO - Can you have imaginary longs?
                intLiteral = true;
            }
            // Zero by itself with no other piece of number.
            if (stream.match(/^0(?![\dx])/i)) { intLiteral = true; }
            if (intLiteral) {
                // Integer literals may be "long"
                stream.eat(/L/i);
                return 'number';
            }
        }
        
        // Handle Strings
        if (stream.match(stringPrefixes)) {
            state.tokenize = tokenStringFactory(stream.current());
            return state.tokenize(stream, state);
        }
        
        // Handle operators and Delimiters
        if (stream.match(tripleDelimiters) || stream.match(doubleDelimiters)) {
            return null;
        }
        if (stream.match(doubleOperators)
            || stream.match(singleOperators)
            || stream.match(wordOperators)) {
            return 'operator';
        }
        if (stream.match(singleDelimiters)) {
            return null;
        }
        
        if (stream.match(types)) {
            return 'builtin';
        }
        
        if (stream.match(keywords)) {
            return 'keyword';
        }
        
        if (stream.match(identifiers)) {
            return 'variable';
        }
        
        // Handle non-detected items
        stream.next();
        return ERRORCLASS;
    }
    
    function tokenStringFactory(delimiter) {
        while ('rub'.indexOf(delimiter.charAt(0).toLowerCase()) >= 0) {
            delimiter = delimiter.substr(1);
        }
        var singleline = delimiter.length == 1;
        var OUTCLASS = 'string';
        
        return function tokenString(stream, state) {
            while (!stream.eol()) {
                stream.eatWhile(/[^'"\\]/);
                if (stream.eat('\\')) {
                    stream.next();
                    if (singleline && stream.eol()) {
                        return OUTCLASS;
                    }
                } else if (stream.match(delimiter)) {
                    state.tokenize = tokenBase;
                    return OUTCLASS;
                } else {
                    stream.eat(/['"]/);
                }
            }
            if (singleline) {
                if (parserConf.singleLineStringErrors) {
                    return ERRORCLASS;
                } else {
                    state.tokenize = tokenBase;
                }
            }
            return OUTCLASS;
        };
    }
    
    function indent(stream, state, type) {
        type = type || 'py';
        var indentUnit = 0;
        if (type === 'py') {
            for (var i = 0; i < state.scopes.length; ++i) {
                if (state.scopes[i].type === 'py') {
                    indentUnit = state.scopes[i].offset + conf.indentUnit;
                    break;
                }
            }
        } else {
            indentUnit = stream.column() + stream.current().length;
        }
        state.scopes.unshift({
            offset: indentUnit,
            type: type
        });
    }
    
    function dedent(stream, state) {
        if (state.scopes.length == 1) return;
        if (state.scopes[0].type === 'py') {
            var _indent = stream.indentation();
            var _indent_index = -1;
            for (var i = 0; i < state.scopes.length; ++i) {
                if (_indent === state.scopes[i].offset) {
                    _indent_index = i;
                    break;
                }
            }
            if (_indent_index === -1) {
                return true;
            }
            while (state.scopes[0].offset !== _indent) {
                state.scopes.shift();
            }
            return false
        } else {
            state.scopes.shift();
            return false;
        }
    }

    function tokenLexer(stream, state) {
        indentInfo = null;
        var style = state.tokenize(stream, state);
        var current = stream.current();

        // Handle '.' connected identifiers
        if (current === '.') {
            style = state.tokenize(stream, state);
            current = stream.current();
            if (style === 'variable') {
                return 'variable';
            } else {
                return ERRORCLASS;
            }
        }
        
        // Handle decorators
        if (current === '@') {
            style = state.tokenize(stream, state);
            current = stream.current();
            if (style === 'variable'
                || current === '@staticmethod'
                || current === '@classmethod') {
                return 'meta';
            } else {
                return ERRORCLASS;
            }
        }
        
        // Handle scope changes.
        if (current === 'pass' || current === 'return') {
            state.dedent += 1;
        }
        if ((current === ':' && !state.lambda && state.scopes[0].type == 'py')
            || indentInfo === 'indent') {
            indent(stream, state);
        }
        var delimiter_index = '[({'.indexOf(current);
        if (delimiter_index !== -1) {
            indent(stream, state, '])}'.slice(delimiter_index, delimiter_index+1));
        }
        if (indentInfo === 'dedent') {
            if (dedent(stream, state)) {
                return ERRORCLASS;
            }
        }
        delimiter_index = '])}'.indexOf(current);
        if (delimiter_index !== -1) {
            if (dedent(stream, state)) {
                return ERRORCLASS;
            }
        }
        if (state.dedent > 0 && stream.eol() && state.scopes[0].type == 'py') {
            if (state.scopes.length > 1) state.scopes.shift();
            state.dedent -= 1;
        }
        
        return style;
    }

    var external = {
        startState: function(basecolumn) {
            return {
              tokenize: tokenBase,
              scopes: [{offset:basecolumn || 0, type:'py'}],
              lastToken: null,
              lambda: false,
              dedent: 0
          };
        },
        
        token: function(stream, state) {
            var style = tokenLexer(stream, state);
            
            state.lastToken = {style:style, content: stream.current()};
            
            if (stream.eol() && stream.lambda) {
                state.lambda = false;
            }
            
            return style;
        },
        
        indent: function(state, textAfter) {
            if (state.tokenize != tokenBase) {
                return 0;
            }
            
            return state.scopes[0].offset;
        }
        
    };
    return external;
});

CodeMirror.defineMIME("text/x-python", "python");
CodeMirror.defineMode('rst', function(config, options) {
    function setState(state, fn, ctx) {
        state.fn = fn;
        setCtx(state, ctx);
    }

    function setCtx(state, ctx) {
        state.ctx = ctx || {};
    }

    function setNormal(state, ch) {
        if (ch && (typeof ch !== 'string')) {
            var str = ch.current();
            ch = str[str.length-1];
        }

        setState(state, normal, {back: ch});
    }

    function hasMode(mode) {
        if (mode) {
            var modes = CodeMirror.listModes();

            for (var i in modes) {
                if (modes[i] == mode) {
                    return true;
                }
            }
        }

        return false;
    }

    function getMode(mode) {
        if (hasMode(mode)) {
            return CodeMirror.getMode(config, mode);
        } else {
            return null;
        }
    }

    var verbatimMode = getMode(options.verbatim);
    var pythonMode = getMode('python');

    var reSection = /^[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/;
    var reDirective = /^\s*\w([-:.\w]*\w)?::(\s|$)/;
    var reHyperlink = /^\s*_[\w-]+:(\s|$)/;
    var reFootnote = /^\s*\[(\d+|#)\](\s|$)/;
    var reCitation = /^\s*\[[A-Za-z][\w-]*\](\s|$)/;
    var reFootnoteRef = /^\[(\d+|#)\]_/;
    var reCitationRef = /^\[[A-Za-z][\w-]*\]_/;
    var reDirectiveMarker = /^\.\.(\s|$)/;
    var reVerbatimMarker = /^::\s*$/;
    var rePreInline = /^[-\s"([{</:]/;
    var rePostInline = /^[-\s`'")\]}>/:.,;!?\\_]/;
    var reEnumeratedList = /^\s*((\d+|[A-Za-z#])[.)]|\((\d+|[A-Z-a-z#])\))\s/;
    var reBulletedList = /^\s*[-\+\*]\s/;
    var reExamples = /^\s+(>>>|In \[\d+\]:)\s/;

    function normal(stream, state) {
        var ch, sol, i;

        if (stream.eat(/\\/)) {
            ch = stream.next();
            setNormal(state, ch);
            return null;
        }

        sol = stream.sol();

        if (sol && (ch = stream.eat(reSection))) {
            for (i = 0; stream.eat(ch); i++){};

            if (i >= 3 && stream.match(/^\s*$/)) {
                setNormal(state, null);
                return 'section';
            } else {
                stream.backUp(i + 1);
            }
        }

        if (sol && stream.match(reDirectiveMarker)) {
            if (!stream.eol()) {
                setState(state, directive);
            }

            return 'directive-marker';
        }

        if (stream.match(reVerbatimMarker)) {
            if (!verbatimMode) {
                setState(state, verbatim);
            } else {
                var mode = verbatimMode;

                setState(state, verbatim, {
                    mode: mode,
                    local: mode.startState()
                });
            }

            return 'verbatim-marker';
        }

        if (sol && stream.match(reExamples, false)) {
            if (!pythonMode) {
                setState(state, verbatim);
                return 'verbatim-marker';
            } else {
                var mode = pythonMode;

                setState(state, verbatim, {
                    mode: mode,
                    local: mode.startState()
                });

                return null;
            }
        }

        if (sol && (stream.match(reEnumeratedList) ||
                    stream.match(reBulletedList))) {
            setNormal(state, stream);
            return 'list';
        }

        function testBackward(re) {
            return sol || !state.ctx.back || re.test(state.ctx.back);
        }

        function testForward(re) {
            return stream.eol() || stream.match(re, false);
        }

        function testInline(re) {
            return stream.match(re) && testBackward(/\W/) && testForward(/\W/);
        }

        if (testInline(reFootnoteRef)) {
            setNormal(state, stream);
            return 'footnote';
        }

        if (testInline(reCitationRef)) {
            setNormal(state, stream);
            return 'citation';
        }

        ch = stream.next();

        if (testBackward(rePreInline)) {
            if ((ch === ':' || ch === '|') && stream.eat(/\S/)) {
                var token;

                if (ch === ':') {
                    token = 'role';
                } else {
                    token = 'replacement';
                }

                setState(state, inline, {
                    ch: ch,
                    wide: false,
                    prev: null,
                    token: token
                });

                return token;
            }

            if (ch === '*' || ch === '`') {
                var orig = ch,
                    wide = false;

                ch = stream.next();

                if (ch == orig) {
                    wide = true;
                    ch = stream.next();
                }

                if (ch && !/\s/.test(ch)) {
                    var token;

                    if (orig === '*') {
                        token = wide ? 'strong' : 'emphasis';
                    } else {
                        token = wide ? 'inline' : 'interpreted';
                    }

                    setState(state, inline, {
                        ch: orig,               // inline() has to know what to search for
                        wide: wide,             // are we looking for `ch` or `chch`
                        prev: null,             // terminator must not be preceeded with whitespace
                        token: token            // I don't want to recompute this all the time
                    });

                    return token;
                }
            }
        }

        setNormal(state, ch);
        return null;
    }

    function inline(stream, state) {
        var ch = stream.next(),
            token = state.ctx.token;

        function finish(ch) {
            state.ctx.prev = ch;
            return token;
        }

        if (ch != state.ctx.ch) {
            return finish(ch);
        }

        if (/\s/.test(state.ctx.prev)) {
            return finish(ch);
        }

        if (state.ctx.wide) {
            ch = stream.next();

            if (ch != state.ctx.ch) {
                return finish(ch);
            }
        }

        if (!stream.eol() && !rePostInline.test(stream.peek())) {
            if (state.ctx.wide) {
                stream.backUp(1);
            }

            return finish(ch);
        }

        setState(state, normal);
        setNormal(state, ch);

        return token;
    }

    function directive(stream, state) {
        var token = null;

        if (stream.match(reDirective)) {
            token = 'directive';
        } else if (stream.match(reHyperlink)) {
            token = 'hyperlink';
        } else if (stream.match(reFootnote)) {
            token = 'footnote';
        } else if (stream.match(reCitation)) {
            token = 'citation';
        } else {
            stream.eatSpace();

            if (stream.eol()) {
                setNormal(state, stream);
                return null;
            } else {
                stream.skipToEnd();
                setState(state, comment);
                return 'comment';
            }
        }

        setState(state, body, {start: true});
        return token;
    }

    function body(stream, state) {
        var token = 'body';

        if (!state.ctx.start || stream.sol()) {
            return block(stream, state, token);
        }

        stream.skipToEnd();
        setCtx(state);

        return token;
    }

    function comment(stream, state) {
        return block(stream, state, 'comment');
    }

    function verbatim(stream, state) {
        if (!verbatimMode) {
            return block(stream, state, 'verbatim');
        } else {
            if (stream.sol()) {
                if (!stream.eatSpace()) {
                    setNormal(state, stream);
                }

                return null;
            }

            return verbatimMode.token(stream, state.ctx.local);
        }
    }

    function block(stream, state, token) {
        if (stream.eol() || stream.eatSpace()) {
            stream.skipToEnd();
            return token;
        } else {
            setNormal(state, stream);
            return null;
        }
    }

    return {
        startState: function() {
            return {fn: normal, ctx: {}};
        },

        copyState: function(state) {
            return {fn: state.fn, ctx: state.ctx};
        },

        token: function(stream, state) {
            var token = state.fn(stream, state);
            return token;
        }
    };
});

CodeMirror.defineMIME("text/x-rst", "rst");
CodeMirror.defineMode("ruby", function(config, parserConfig) {
  function wordObj(words) {
    var o = {};
    for (var i = 0, e = words.length; i < e; ++i) o[words[i]] = true;
    return o;
  }
  var keywords = wordObj([
    "alias", "and", "BEGIN", "begin", "break", "case", "class", "def", "defined?", "do", "else",
    "elsif", "END", "end", "ensure", "false", "for", "if", "in", "module", "next", "not", "or",
    "redo", "rescue", "retry", "return", "self", "super", "then", "true", "undef", "unless",
    "until", "when", "while", "yield", "nil", "raise", "throw", "catch", "fail", "loop", "callcc",
    "caller", "lambda", "proc", "public", "protected", "private", "require", "load",
    "require_relative", "extend", "autoload"
  ]);
  var indentWords = wordObj(["def", "class", "case", "for", "while", "do", "module", "then",
                             "unless", "catch", "loop", "proc"]);
  var dedentWords = wordObj(["end", "until"]);
  var matching = {"[": "]", "{": "}", "(": ")"};
  var curPunc;

  function chain(newtok, stream, state) {
    state.tokenize.push(newtok);
    return newtok(stream, state);
  }

  function tokenBase(stream, state) {
    curPunc = null;
    if (stream.sol() && stream.match("=begin") && stream.eol()) {
      state.tokenize.push(readBlockComment);
      return "comment";
    }
    if (stream.eatSpace()) return null;
    var ch = stream.next();
    if (ch == "`" || ch == "'" || ch == '"' || ch == "/") {
      return chain(readQuoted(ch, "string", ch == '"'), stream, state);
    } else if (ch == "%") {
      var style, embed = false;
      if (stream.eat("s")) style = "atom";
      else if (stream.eat(/[WQ]/)) { style = "string"; embed = true; }
      else if (stream.eat(/[wxqr]/)) style = "string";
      var delim = stream.eat(/[^\w\s]/);
      if (!delim) return "operator";
      if (matching.propertyIsEnumerable(delim)) delim = matching[delim];
      return chain(readQuoted(delim, style, embed, true), stream, state);
    } else if (ch == "#") {
      stream.skipToEnd();
      return "comment";
    } else if (ch == "<" && stream.eat("<")) {
      stream.eat("-");
      stream.eat(/[\'\"\`]/);
      var match = stream.match(/^\w+/);
      stream.eat(/[\'\"\`]/);
      if (match) return chain(readHereDoc(match[0]), stream, state);
      return null;
    } else if (ch == "0") {
      if (stream.eat("x")) stream.eatWhile(/[\da-fA-F]/);
      else if (stream.eat("b")) stream.eatWhile(/[01]/);
      else stream.eatWhile(/[0-7]/);
      return "number";
    } else if (/\d/.test(ch)) {
      stream.match(/^[\d_]*(?:\.[\d_]+)?(?:[eE][+\-]?[\d_]+)?/);
      return "number";
    } else if (ch == "?") {
      while (stream.match(/^\\[CM]-/)) {}
      if (stream.eat("\\")) stream.eatWhile(/\w/);
      else stream.next();
      return "string";
    } else if (ch == ":") {
      if (stream.eat("'")) return chain(readQuoted("'", "atom", false), stream, state);
      if (stream.eat('"')) return chain(readQuoted('"', "atom", true), stream, state);
      stream.eatWhile(/[\w\?]/);
      return "atom";
    } else if (ch == "@") {
      stream.eat("@");
      stream.eatWhile(/[\w\?]/);
      return "variable-2";
    } else if (ch == "$") {
      stream.next();
      stream.eatWhile(/[\w\?]/);
      return "variable-3";
    } else if (/\w/.test(ch)) {
      stream.eatWhile(/[\w\?]/);
      if (stream.eat(":")) return "atom";
      return "ident";
    } else if (ch == "|" && (state.varList || state.lastTok == "{" || state.lastTok == "do")) {
      curPunc = "|";
      return null;
    } else if (/[\(\)\[\]{}\\;]/.test(ch)) {
      curPunc = ch;
      return null;
    } else if (ch == "-" && stream.eat(">")) {
      return "arrow";
    } else if (/[=+\-\/*:\.^%<>~|]/.test(ch)) {
      stream.eatWhile(/[=+\-\/*:\.^%<>~|]/);
      return "operator";
    } else {
      return null;
    }
  }

  function tokenBaseUntilBrace() {
    var depth = 1;
    return function(stream, state) {
      if (stream.peek() == "}") {
        depth--;
        if (depth == 0) {
          state.tokenize.pop();
          return state.tokenize[state.tokenize.length-1](stream, state);
        }
      } else if (stream.peek() == "{") {
        depth++;
      }
      return tokenBase(stream, state);
    };
  }
  function readQuoted(quote, style, embed, unescaped) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote && (unescaped || !escaped)) {
          state.tokenize.pop();
          break;
        }
        if (embed && ch == "#" && !escaped && stream.eat("{")) {
          state.tokenize.push(tokenBaseUntilBrace(arguments.callee));
          break;
        }
        escaped = !escaped && ch == "\\";
      }
      return style;
    };
  }
  function readHereDoc(phrase) {
    return function(stream, state) {
      if (stream.match(phrase)) state.tokenize.pop();
      else stream.skipToEnd();
      return "string";
    };
  }
  function readBlockComment(stream, state) {
    if (stream.sol() && stream.match("=end") && stream.eol())
      state.tokenize.pop();
    stream.skipToEnd();
    return "comment";
  }

  return {
    startState: function() {
      return {tokenize: [tokenBase],
              indented: 0,
              context: {type: "top", indented: -config.indentUnit},
              continuedLine: false,
              lastTok: null,
              varList: false};
    },

    token: function(stream, state) {
      if (stream.sol()) state.indented = stream.indentation();
      var style = state.tokenize[state.tokenize.length-1](stream, state), kwtype;
      if (style == "ident") {
        var word = stream.current();
        style = keywords.propertyIsEnumerable(stream.current()) ? "keyword"
          : /^[A-Z]/.test(word) ? "tag"
          : (state.lastTok == "def" || state.lastTok == "class" || state.varList) ? "def"
          : "variable";
        if (indentWords.propertyIsEnumerable(word)) kwtype = "indent";
        else if (dedentWords.propertyIsEnumerable(word)) kwtype = "dedent";
        else if (word == "if" && stream.column() == stream.indentation()) kwtype = "indent";
      }
      if (curPunc || (style && style != "comment")) state.lastTok = word || curPunc || style;
      if (curPunc == "|") state.varList = !state.varList;

      if (kwtype == "indent" || /[\(\[\{]/.test(curPunc))
        state.context = {prev: state.context, type: curPunc || style, indented: state.indented};
      else if ((kwtype == "dedent" || /[\)\]\}]/.test(curPunc)) && state.context.prev)
        state.context = state.context.prev;

      if (stream.eol())
        state.continuedLine = (curPunc == "\\" || style == "operator");
      return style;
    },

    indent: function(state, textAfter) {
      if (state.tokenize[state.tokenize.length-1] != tokenBase) return 0;
      var firstChar = textAfter && textAfter.charAt(0);
      var ct = state.context;
      var closing = ct.type == matching[firstChar] ||
        ct.type == "keyword" && /^(?:end|until|else|elsif|when)\b/.test(textAfter);
      return ct.indented + (closing ? 0 : config.indentUnit) +
        (state.continuedLine ? config.indentUnit : 0);
    }
  };
});

CodeMirror.defineMIME("text/x-ruby", "ruby");
CodeMirror.runMode = function(string, modespec, callback) {
  var mode = CodeMirror.getMode({indentUnit: 2}, modespec);
  var isNode = callback.nodeType == 1;
  if (isNode) {
    var node = callback, accum = [];
    callback = function(string, style) {
      if (string == "\n")
        accum.push("<br>");
      else if (style)
        accum.push("<span class=\"cm-" + CodeMirror.htmlEscape(style) + "\">" + CodeMirror.htmlEscape(string) + "</span>");
      else
        accum.push(CodeMirror.htmlEscape(string));
    }
  }
  var lines = CodeMirror.splitLines(string), state = CodeMirror.startState(mode);
  for (var i = 0, e = lines.length; i < e; ++i) {
    if (i) callback("\n");
    var stream = new CodeMirror.StringStream(lines[i]);
    while (!stream.eol()) {
      var style = mode.token(stream, state);
      callback(stream.current(), style, i, stream.start);
      stream.start = stream.pos;
    }
  }
  if (isNode)
    node.innerHTML = accum.join("");
};
CodeMirror.defineMode("xml", function(config, parserConfig) {
  var indentUnit = config.indentUnit;
  var Kludges = parserConfig.htmlMode ? {
    autoSelfClosers: {"br": true, "img": true, "hr": true, "link": true, "input": true,
                      "meta": true, "col": true, "frame": true, "base": true, "area": true},
    doNotIndent: {"pre": true, "!cdata": true},
    allowUnquoted: true
  } : {autoSelfClosers: {}, doNotIndent: {"!cdata": true}, allowUnquoted: false};
  var alignCDATA = parserConfig.alignCDATA;

  // Return variables for tokenizers
  var tagName, type;

  function inText(stream, state) {
    function chain(parser) {
      state.tokenize = parser;
      return parser(stream, state);
    }

    var ch = stream.next();
    if (ch == "<") {
      if (stream.eat("!")) {
        if (stream.eat("[")) {
          if (stream.match("CDATA[")) return chain(inBlock("atom", "]]>"));
          else return null;
        }
        else if (stream.match("--")) return chain(inBlock("comment", "-->"));
        else if (stream.match("DOCTYPE", true, true)) {
          stream.eatWhile(/[\w\._\-]/);
          return chain(inBlock("meta", ">"));
        }
        else return null;
      }
      else if (stream.eat("?")) {
        stream.eatWhile(/[\w\._\-]/);
        state.tokenize = inBlock("meta", "?>");
        return "meta";
      }
      else {
        type = stream.eat("/") ? "closeTag" : "openTag";
        stream.eatSpace();
        tagName = "";
        var c;
        while ((c = stream.eat(/[^\s\u00a0=<>\"\'\/?]/))) tagName += c;
        state.tokenize = inTag;
        return "tag";
      }
    }
    else if (ch == "&") {
      stream.eatWhile(/[^;]/);
      stream.eat(";");
      return "atom";
    }
    else {
      stream.eatWhile(/[^&<]/);
      return null;
    }
  }

  function inTag(stream, state) {
    var ch = stream.next();
    if (ch == ">" || (ch == "/" && stream.eat(">"))) {
      state.tokenize = inText;
      type = ch == ">" ? "endTag" : "selfcloseTag";
      return "tag";
    }
    else if (ch == "=") {
      type = "equals";
      return null;
    }
    else if (/[\'\"]/.test(ch)) {
      state.tokenize = inAttribute(ch);
      return state.tokenize(stream, state);
    }
    else {
      stream.eatWhile(/[^\s\u00a0=<>\"\'\/?]/);
      return "word";
    }
  }

  function inAttribute(quote) {
    return function(stream, state) {
      while (!stream.eol()) {
        if (stream.next() == quote) {
          state.tokenize = inTag;
          break;
        }
      }
      return "string";
    };
  }

  function inBlock(style, terminator) {
    return function(stream, state) {
      while (!stream.eol()) {
        if (stream.match(terminator)) {
          state.tokenize = inText;
          break;
        }
        stream.next();
      }
      return style;
    };
  }

  var curState, setStyle;
  function pass() {
    for (var i = arguments.length - 1; i >= 0; i--) curState.cc.push(arguments[i]);
  }
  function cont() {
    pass.apply(null, arguments);
    return true;
  }

  function pushContext(tagName, startOfLine) {
    var noIndent = Kludges.doNotIndent.hasOwnProperty(tagName) || (curState.context && curState.context.noIndent);
    curState.context = {
      prev: curState.context,
      tagName: tagName,
      indent: curState.indented,
      startOfLine: startOfLine,
      noIndent: noIndent
    };
  }
  function popContext() {
    if (curState.context) curState.context = curState.context.prev;
  }

  function element(type) {
    if (type == "openTag") {curState.tagName = tagName; return cont(attributes, endtag(curState.startOfLine));}
    else if (type == "closeTag") {
      var err = false;
      if (curState.context) {
        err = curState.context.tagName != tagName;
      } else {
        err = true;
      }
      if (err) setStyle = "error";
      return cont(endclosetag(err));
    }
    else if (type == "string") {
      if (!curState.context || curState.context.name != "!cdata") pushContext("!cdata");
      if (curState.tokenize == inText) popContext();
      return cont();
    }
    else return cont();
  }
  function endtag(startOfLine) {
    return function(type) {
      if (type == "selfcloseTag" ||
          (type == "endTag" && Kludges.autoSelfClosers.hasOwnProperty(curState.tagName.toLowerCase())))
        return cont();
      if (type == "endTag") {pushContext(curState.tagName, startOfLine); return cont();}
      return cont();
    };
  }
  function endclosetag(err) {
    return function(type) {
      if (err) setStyle = "error";
      if (type == "endTag") { popContext(); return cont(); }
      setStyle = "error";
      return cont(arguments.callee);
    }
  }

  function attributes(type) {
    if (type == "word") {setStyle = "attribute"; return cont(attributes);}
    if (type == "equals") return cont(attvalue, attributes);
    return pass();
  }
  function attvalue(type) {
    if (type == "word" && Kludges.allowUnquoted) {setStyle = "string"; return cont();}
    if (type == "string") return cont(attvaluemaybe);
    return pass();
  }
  function attvaluemaybe(type) {
    if (type == "string") return cont(attvaluemaybe);
    else return pass();
  }

  return {
    startState: function() {
      return {tokenize: inText, cc: [], indented: 0, startOfLine: true, tagName: null, context: null};
    },

    token: function(stream, state) {
      if (stream.sol()) {
        state.startOfLine = true;
        state.indented = stream.indentation();
      }
      if (stream.eatSpace()) return null;

      setStyle = type = tagName = null;
      var style = state.tokenize(stream, state);
      if ((style || type) && style != "comment") {
        curState = state;
        while (true) {
          var comb = state.cc.pop() || element;
          if (comb(type || style)) break;
        }
      }
      state.startOfLine = false;
      return setStyle || style;
    },

    indent: function(state, textAfter) {
      var context = state.context;
      if (context && context.noIndent) return 0;
      if (alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
      if (context && /^<\//.test(textAfter))
        context = context.prev;
      while (context && !context.startOfLine)
        context = context.prev;
      if (context) return context.indent + indentUnit;
      else return 0;
    },

    compareStates: function(a, b) {
      if (a.indented != b.indented) return false;
      for (var ca = a.context, cb = b.context; ; ca = ca.prev, cb = cb.prev) {
        if (!ca || !cb) return ca == cb;
        if (ca.tagName != cb.tagName) return false;
      }
    },

    electricChars: "/"
  };
});

CodeMirror.defineMIME("application/xml", "xml");
CodeMirror.defineMIME("text/html", {name: "xml", htmlMode: true});
CodeMirror.defineMode("yaml", function() {
	
	var cons = ['true', 'false', 'on', 'off', 'yes', 'no'];
	var keywordRegex = new RegExp("\\b(("+cons.join(")|(")+"))$", 'i');
	
	return {
		token: function(stream, state) {
			var ch = stream.peek();
			var esc = state.escaped;
			state.escaped = false;
			/* comments */
			if (ch == "#") { stream.skipToEnd(); return "comment"; }
			if (state.literal && stream.indentation() > state.keyCol) {
				stream.skipToEnd(); return "string";
			} else if (state.literal) { state.literal = false; }
			if (stream.sol()) {
				state.keyCol = 0;
				state.pair = false;
				state.pairStart = false;
				/* document start */
				if(stream.match(/---/)) { return "def"; }
				/* document end */
				if (stream.match(/\.\.\./)) { return "def"; }
				/* array list item */
				if (stream.match(/\s*-\s+/)) { return 'meta'; }
			}
			/* pairs (associative arrays) -> key */
			if (!state.pair && stream.match(/^\s*([a-z0-9\._-])+(?=\s*:)/i)) {
				state.pair = true;
				state.keyCol = stream.indentation();
				return "atom";
			}
			if (state.pair && stream.match(/^:\s*/)) { state.pairStart = true; return 'meta'; }
			
			/* inline pairs/lists */
			if (stream.match(/^(\{|\}|\[|\])/)) {
				if (ch == '{')
					state.inlinePairs++;
				else if (ch == '}')
					state.inlinePairs--;
				else if (ch == '[')
					state.inlineList++;
				else
					state.inlineList--;
				return 'meta';
			}
			
			/* list seperator */
			if (state.inlineList > 0 && !esc && ch == ',') {
				stream.next();
				return 'meta';
			}
			/* pairs seperator */
			if (state.inlinePairs > 0 && !esc && ch == ',') {
				state.keyCol = 0;
				state.pair = false;
				state.pairStart = false;
				stream.next();
				return 'meta';
			}
			
			/* start of value of a pair */
			if (state.pairStart) {
				/* block literals */
				if (stream.match(/^\s*(\||\>)\s*/)) { state.literal = true; return 'meta'; };
				/* references */
				if (stream.match(/^\s*(\&|\*)[a-z0-9\._-]+\b/i)) { return 'variable-2'; }
				/* numbers */
				if (state.inlinePairs == 0 && stream.match(/^\s*-?[0-9\.\,]+\s?$/)) { return 'number'; }
				if (state.inlinePairs > 0 && stream.match(/^\s*-?[0-9\.\,]+\s?(?=(,|}))/)) { return 'number'; }
				/* keywords */
				if (stream.match(keywordRegex)) { return 'keyword'; }
			}

			/* nothing found, continue */
			state.pairStart = false;
			state.escaped = (ch == '\\');
			stream.next();
			return null;
		},
		startState: function() {
			return {
				pair: false,
				pairStart: false,
				keyCol: 0,
				inlinePairs: 0,
				inlineList: 0,
				literal: false,
				escaped: false
			};
		}
	};
});

CodeMirror.defineMIME("text/x-yaml", "yaml");