goog.provide('org.koshinuke.ui.DiffViewer');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.soy');

goog.require('goog.ui.Component');

goog.require('CodeMirror');
goog.require('CodeMirror.modes');

goog.require('org.koshinuke');
goog.require('org.koshinuke.template.diffviewer');

/** @constructor */
org.koshinuke.ui.DiffViewer = function(loader, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.loader = loader;
	this.vsm = goog.dom.ViewportSizeMonitor.getInstanceForWindow();
};
goog.inherits(org.koshinuke.ui.DiffViewer, goog.ui.Component);

/** @override */
org.koshinuke.ui.DiffViewer.prototype.createDom = function() {
	this.loading = goog.dom.createDom("div", {
		'class' : 'loading_large'
	});
	var element = goog.dom.createDom("div", {
		'class' : 'diff'
	}, this.loading);
	this.decorateInternal(element);
};
/** @override */
org.koshinuke.ui.DiffViewer.prototype.enterDocument = function() {
	org.koshinuke.ui.DiffViewer.superClass_.enterDocument.call(this);
	var parent = this.getElement();
	var model = this.getModel();
	var self = this;
	this.loader.load(model, function(diff) {
		console.log(model);
		var commits = goog.soy.renderAsElement(org.koshinuke.template.diffviewer.commit, model.commit);
		parent.replaceChild(commits, self.loading);
		var files = goog.dom.createDom('div', {
			'class' : 'files'
		});
		parent.appendChild(files);
		goog.array.forEach(diff.diff, function(a) {
			var p = a.a_path;
			if(a.b_path != a.a_path) {
				p = a.b_path + ' → ' + a.a_path;
			}
			var f = goog.soy.renderAsElement(org.koshinuke.template.diffviewer.file, {
				operation : a.operation,
				path : p
			});
			files.appendChild(f);
		});
	});
};
/** @override */
org.koshinuke.ui.DiffViewer.prototype.exitDocument = function() {
	org.koshinuke.ui.DiffViewer.superClass_.exitDocument.call(this);
};

org.koshinuke.ui.DiffViewer.prototype.setVisible = function(state) {
	var el = this.getElement();
	if(el) {
		goog.style.showElement(el, state);
	}
};
/** @override */
org.koshinuke.ui.DiffViewer.prototype.disposeInternal = function() {
	org.koshinuke.ui.DiffViewer.superClass_.disposeInternal.call(this);
	this.loading = null;
	this.vsm = null;
	this.loader = null;
};
