goog.provide('org.koshinuke.ui.CodeMirrorWrapper');

goog.require('goog.array');
goog.require('goog.dom');

goog.require('goog.ui.Component');

goog.require('CodeMirror');
goog.require('CodeMirror.modes');

goog.require('org.koshinuke');

// TODO module化によるmodeの遅延ローディング
/** @constructor */
org.koshinuke.ui.CodeMirrorWrapper = function(loader) {
	this.loader = loader;
};
goog.inherits(org.koshinuke.ui.CodeMirrorWrapper, goog.ui.Component);

/** @override */
org.koshinuke.ui.CodeMirrorWrapper.prototype.createDom = function() {
	this.loading = goog.dom.createDom("div", {
		'class' : 'loading_large'
	});
	var element = goog.dom.createDom("div", null, this.loading);
	this.decorateInternal(element);
};
/** @override */
org.koshinuke.ui.CodeMirrorWrapper.prototype.enterDocument = function() {
	org.koshinuke.ui.CodeMirrorWrapper.superClass_.enterDocument.call(this);
	var parent = this.getElement();
	var model = this.getModel();
	var path = model.resourcePath;
	var self = this;
	if(path.match(/\.(jpe?g|gif|png|ico)$/i)) {
		this.img = goog.dom.createDom("img", {
			"src" : this.loader.toRequestUri(model)
		});
		parent.replaceChild(this.img, self.loading);
	} else {
		this.loader.load(model, function(contentType, resource) {
			self.cm = CodeMirror(function(elt) {
				parent.replaceChild(elt, self.loading);
			}, {
				mode : contentType,
				value : resource,
				matchBrackets : true,
				lineNumbers : true,
				readOnly : true
			});
		});
	}
};
/** @override */
org.koshinuke.ui.CodeMirrorWrapper.prototype.exitDocument = function() {
	org.koshinuke.ui.CodeMirrorWrapper.superClass_.exitDocument.call(this);
	if(this.img) {
		goog.dom.removeNode(this.img);
		this.img = null;
	}
	if(this.cm) {
		goog.dom.removeNode(this.cm.getWrapperElement());
		this.cm = null;
	}
};
org.koshinuke.ui.CodeMirrorWrapper.prototype.setVisible = function(state) {
	var el = this.getElement();
	if(el) {
		goog.style.showElement(el, state);
	}
};
/** @override */
org.koshinuke.ui.CodeMirrorWrapper.prototype.disposeInternal = function() {
	org.koshinuke.ui.CodeMirrorWrapper.superClass_.disposeInternal.call(this);
	this.loader = null;
};
