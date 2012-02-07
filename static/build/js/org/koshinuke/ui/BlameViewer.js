goog.provide('org.koshinuke.ui.BlameViewer');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.string');

goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.TabBar');

goog.require('org.koshinuke');
goog.require('org.koshinuke.template.blameviewer');

/** @constructor */
org.koshinuke.ui.BlameViewer = function(loader, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.loader = loader;
};
goog.inherits(org.koshinuke.ui.BlameViewer, goog.ui.Component);

/** @override */
org.koshinuke.ui.BlameViewer.prototype.createDom = function() {
	this.loading = goog.dom.createDom("div", {
		'class' : 'loading_large'
	});
	var element = goog.dom.createDom("div", {
		'class' : 'blame'
	}, this.loading);
	this.decorateInternal(element);
};
/** @override */
org.koshinuke.ui.BlameViewer.prototype.enterDocument = function() {
	org.koshinuke.ui.BlameViewer.superClass_.enterDocument.call(this);
	var parent = this.getElement();
	var model = this.getModel();
	var self = this;
	var h = this.getHandler();
	this.loader.load(model, function(blames) {
		self.cm = CodeMirror(function(elt) {
			var grid = self.makeBlameGrid_(blames, elt);
			parent.replaceChild(grid, self.loading);
		}, {
			'mode' : blames.contenttype,
			'value' : blames.content
		});
	});
};

org.koshinuke.ui.BlameViewer.prototype.makeBlameGrid_ = function(blames, elt) {
	var lines = goog.dom.query('.CodeMirror-lines div div pre', elt);
	var topOfCommit = null;
	// td for rowspan
	var rows = [];
	goog.array.forEach(blames.blames, function(a) {
		var r = {
			commit : goog.soy.renderAsElement(org.koshinuke.template.blameviewer.impl, a)
		};
		rows.push(r);
	});
	var table = goog.dom.createDom('table', {
		"class" : "blame"
	});
	var lineCounter = 0;
	goog.array.forEach(rows, function(a) {
		var commit = goog.dom.createDom('td', {
			'rowspan' : a.rowspan
		}, a.commit);
		var num = goog.dom.createDom('th', {
			'class' : 'number'
		}, goog.dom.createTextNode(++lineCounter));
		var line = goog.dom.createDom('td', {
			'rowspan' : a.rowspan
		}, a.line);

		var tr = goog.dom.createDom('tr', {
			"class" : "row"
		}, commit, num, line);
		goog.dom.appendChild(table, tr);
	});
	return null;
};
/** @override */
org.koshinuke.ui.BlameViewer.prototype.exitDocument = function() {
	org.koshinuke.ui.BlameViewer.superClass_.exitDocument.call(this);
	goog.dom.removeNode(this.getElement());
};
/** @override */
org.koshinuke.ui.BlameViewer.prototype.disposeInternal = function() {
	org.koshinuke.ui.BlameViewer.superClass_.disposeInternal.call(this);
	this.loading = null;
};
