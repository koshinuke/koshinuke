goog.provide('org.koshinuke.ui.CodeMirrorWrapper');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.soy');

goog.require('goog.ui.Component');

goog.require('CodeMirror');
goog.require('CodeMirror.modes');

// TODO module化によるmodeの遅延ローディング
/** @constructor */
org.koshinuke.ui.CodeMirrorWrapper = function(loader){
	this.loader = loader;
};
goog.inherits(org.koshinuke.ui.CodeMirrorWrapper, goog.ui.Component);

/** @override */
org.koshinuke.ui.CodeMirrorWrapper.prototype.createDom = function() {
	var element = goog.dom.createDom("div", {
		'class' : 'loading_large'
	});
	this.decorateInternal(element);
};

/** @override */
org.koshinuke.ui.CodeMirrorWrapper.prototype.enterDocument = function() {
	org.koshinuke.ui.CodeMirrorWrapper.superClass_.enterDocument.call(this);
	var parent = this.getElement().parentNode;
	// TODO loaderでリクエストを投げる。
	/* var codeview = goog.dom.getElement('code-viewer');
	var code = 'public static void main(String[] args) {\n\tSystem.out.println("Hello, World!!");\n}';
	var cm = CodeMirror(function(elt) {
		goog.dom.appendChild(codeview, elt);
	}, {
		mode : "text/x-java",
		matchBrackets : true,
		lineNumbers : true,
		readOnly : true,
		//lineWrapping : true,
		value : code
	});*/
};
/** @override */
org.koshinuke.ui.CodeMirrorWrapper.prototype.exitDocument = function() {
	org.koshinuke.ui.CodeMirrorWrapper.superClass_.exitDocument.call(this);
	// TODO codemirrorなnodeをremoveする。
};

/** @override */
org.koshinuke.ui.CodeMirrorWrapper.prototype.disposeInternal = function() {
	org.koshinuke.ui.CodeMirrorWrapper.superClass_.disposeInternal.call(this);
	this.loader = null;
};
