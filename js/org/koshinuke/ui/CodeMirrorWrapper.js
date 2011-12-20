goog.provide('org.koshinuke.ui.CodeMirrorWrapper');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.style');

goog.require('goog.ui.Button');
goog.require('goog.ui.Component');

goog.require('CodeMirror');
goog.require('CodeMirror.modes');

goog.require('org.koshinuke');
goog.require('org.koshinuke.template.codemirror');

goog.require('org.koshinuke.ui.Clipboard');

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
// git note
/** @override */
org.koshinuke.ui.CodeMirrorWrapper.prototype.enterDocument = function() {
	org.koshinuke.ui.CodeMirrorWrapper.superClass_.enterDocument.call(this);
	var parent = this.getElement();
	var model = this.getModel();
	var self = this;
	this.loader.load(model, function(contentType, resource) {
		if(contentType && goog.string.startsWith(contentType, 'image')) {
			// data schemeでサーバからリソースが返ってくる事を期待する。
			// http://tools.ietf.org/html/rfc2397
			self.img = goog.dom.createDom("img", {
				"src" : resource
			});
			parent.replaceChild(self.img, self.loading);
		} else {
			var toolsEl = goog.soy.renderAsElement(org.koshinuke.template.codemirror.tmpl, model.node);
			self.getElement().insertBefore(toolsEl, self.loading);
			self.clip = new org.koshinuke.ui.Clipboard([resource, 'copy contents to clipboard', 'copied !!']);
			self.clip.decorate(toolsEl);
			self.cmOption = {
				mode : contentType,
				value : resource,
				matchBrackets : true,
				lineNumbers : true,
				readOnly : true,
				onCursorActivity : function() {
					self.cm.setLineClass(lineH, null);
					lineH = self.cm.setLineClass(self.cm.getCursor().line, "activeline");
				}
			};
			self.cm = CodeMirror(function(elt) {
				goog.dom.classes.add(elt, "readonly");
				parent.replaceChild(elt, self.loading);
			}, self.cmOption);
			var lineH = self.cm.getLineHandle(0);
			self.setUpCMTools_(toolsEl);
		}
	});
};
/** @private */
org.koshinuke.ui.CodeMirrorWrapper.prototype.setUpCMTools_ = function(element) {
	goog.array.forEach(goog.dom.query('button', element), function(a) {
		var b = new goog.ui.Button();
		b.decorate(a);
		b.setParent(this);
	}, this);
	var value = this.cm.getValue();
	goog.events.listen(this, goog.ui.Component.EventType.ACTION, function(e) {
		var el = e.target.getElement();
		if(goog.dom.classes.has(el, 'edit')) {
			value = this.cm.getValue();
			this.toggleEdit_(element, true);
		}
		if(goog.dom.classes.has(el, 'drop')) {
			this.cm.setValue(value);
			this.toggleEdit_(element, false);
		}
		if(goog.dom.classes.has(el, 'commit')) {
			// TODO commit current contents and message.
			this.toggleEdit_(element, false);
			// TODO reget some of resource metadatas.
		}
		
	}, false, this);
};
org.koshinuke.ui.CodeMirrorWrapper.prototype.toggleEdit_ = function(element, editable) {
	this.cmOption.readOnly = editable == false;
	this.cm.setOption("readOnly", this.cmOption.readOnly);
	if(editable) {
		goog.dom.classes.remove(this.cm.getWrapperElement(), "readonly");
	} else {
		goog.dom.classes.add(this.cm.getWrapperElement(), "readonly");
	}
	goog.array.forEach(goog.dom.query('.drop, .commit', element), function(dc) {
		goog.style.showElement(dc, editable);
	}, this);
	goog.array.forEach(goog.dom.query('.edit', element), function(dc) {
		goog.style.showElement(dc, editable == false);
	}, this);
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
	if(this.clip) {
		this.clip.exitDocument();
		this.clip.dispose();
		this.clip = null;
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
