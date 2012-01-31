goog.provide('org.koshinuke.ui.ResourceEditor');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.style');

goog.require('goog.ui.Button');
goog.require('goog.ui.Component');

goog.require('soy');

goog.require('CodeMirror');
goog.require('CodeMirror.modes');

goog.require('org.koshinuke');
goog.require('org.koshinuke.template.resourceeditor');

goog.require('org.koshinuke.ui.Clipboard');

// TODO module化によるmodeの遅延ローディング
/** @constructor */
org.koshinuke.ui.ResourceEditor = function(loader, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.loader = loader;
};
goog.inherits(org.koshinuke.ui.ResourceEditor, goog.ui.Component);

/** @override */
org.koshinuke.ui.ResourceEditor.prototype.createDom = function() {
	this.loading = goog.dom.createDom("div", {
		'class' : 'loading_large'
	});
	var element = goog.dom.createDom("div", null, this.loading);
	this.decorateInternal(element);
};
// git note
/** @override */
org.koshinuke.ui.ResourceEditor.prototype.enterDocument = function() {
	org.koshinuke.ui.ResourceEditor.superClass_.enterDocument.call(this);
	var parent = this.getElement();
	var model = this.getModel();
	var self = this;
	this.loader.load(model, function(rm) {
		model.node.objectid = rm.objectid;
		if(rm.contenttype && goog.string.startsWith(rm.contenttype, 'image')) {
			// data schemeでサーバからリソースが返ってくる事を期待する。
			// http://tools.ietf.org/html/rfc2397
			self.img = goog.dom.createDom("img", {
				"src" : rm.content
			});
			parent.replaceChild(self.img, self.loading);
		} else {
			var toolsEl = goog.soy.renderAsElement(org.koshinuke.template.resourceeditor.tmpl, rm);
			self.getElement().insertBefore(toolsEl, self.loading);
			self.clip = new org.koshinuke.ui.Clipboard([rm.content, 'copy contents to clipboard', 'copied !!']);
			self.clip.decorate(toolsEl);
			self.cmOption = {
				mode : rm.contenttype,
				value : rm.content,
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
org.koshinuke.ui.ResourceEditor.prototype.setUpCMTools_ = function(element) {
	goog.array.forEach(goog.dom.query('button', element), function(a) {
		var b = new goog.ui.Button();
		b.decorate(a);
		b.setParent(this);
	}, this);
	var commitBtn = goog.dom.query('button.commit', element)[0];
	var commitMsg = goog.dom.query('.commit-message textarea', element)[0];
	var h = this.getHandler();
	h.listen(commitMsg, goog.events.EventType.KEYUP, function(e) {
		var val = goog.dom.forms.getValue(e.target);
		goog.dom.forms.setDisabled(commitBtn, !val || goog.string.trim(val).length < 1);
		this.clip.setCopyContents(this.cm.getValue());
	}, false, this);
	var value = this.cm.getValue();
	h.listen(this, goog.ui.Component.EventType.ACTION, function(e) {
		var el = e.target.getElement();
		if(goog.dom.classes.has(el, 'edit')) {
			value = this.cm.getValue();
			this.toggleEdit_(element, true);
		}
		if(goog.dom.classes.has(el, 'drop')) {
			this.cm.setValue(value);
			goog.dom.forms.setValue(commitMsg, '');
			goog.dom.forms.setDisabled(commitBtn, true);
			this.toggleEdit_(element, false);
		}
		if(goog.dom.classes.has(el, 'commit')) {
			goog.dom.forms.setDisabled(commitBtn, true);
			goog.dom.forms.setDisabled(commitMsg, true);
			this.loader.send({
				path : this.getModel().path,
				objectid : this.getModel().node.objectid,
				message : goog.dom.forms.getValue(commitMsg),
				content : this.cm.getValue(),
				node : {
					path : this.getModel().node.path
				}
			});
		}
	}, false, this);
	this.psKey = org.koshinuke.PubSub.subscribe(org.koshinuke.PubSub.MODIFY_SUCCESS, function(send, rm) {
		if(send.path == this.getModel().path && send.node.path == this.getModel().node.path) {
			goog.dom.forms.setValue(commitMsg, '');
			this.toggleEdit_(element, false);
			goog.dom.setTextContent(goog.dom.query(".log.username", element)[0], soy.$$escapeHtml(rm.author));
			goog.dom.setTextContent(goog.dom.query(".log.timestamp", element)[0], rm.timestamp);
			goog.dom.setTextContent(goog.dom.query(".log.comment", element)[0], soy.$$escapeHtml(rm.message));
		}
	}, this);
};
org.koshinuke.ui.ResourceEditor.prototype.toggleEdit_ = function(element, editable) {
	this.cmOption.readOnly = editable == false;
	this.cm.setOption("readOnly", this.cmOption.readOnly);
	if(editable) {
		goog.dom.classes.remove(this.cm.getWrapperElement(), "readonly");
	} else {
		goog.dom.classes.add(this.cm.getWrapperElement(), "readonly");
	}
	goog.array.forEach(goog.dom.query('.drop, .commit, .commit-message', element), function(dc) {
		goog.style.showElement(dc, editable);
	}, this);
	goog.array.forEach(goog.dom.query('.edit', element), function(dc) {
		goog.style.showElement(dc, editable == false);
	}, this);
};
/** @override */
org.koshinuke.ui.ResourceEditor.prototype.exitDocument = function() {
	org.koshinuke.ui.ResourceEditor.superClass_.exitDocument.call(this);
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
	if(this.psKey) {
		org.koshinuke.PubSub.unsubscribeByKey(this.psKey);
		this.psKey = null;
	}
};
org.koshinuke.ui.ResourceEditor.prototype.setVisible = function(state) {
	var el = this.getElement();
	if(el) {
		goog.style.showElement(el, state);
	}
};
/** @override */
org.koshinuke.ui.ResourceEditor.prototype.disposeInternal = function() {
	org.koshinuke.ui.ResourceEditor.superClass_.disposeInternal.call(this);
	this.loader = null;
};
