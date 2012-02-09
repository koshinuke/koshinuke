goog.provide('org.koshinuke.ui.BlameViewer');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');
goog.require('goog.style');

goog.require('goog.ui.Component');

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
		var grid = self.makeBlameGrid_(blames);
		parent.replaceChild(grid, self.loading);
	});
};

org.koshinuke.ui.BlameViewer.prototype.makeBlameGrid_ = function(blames, elt) {
	var topOfCommit = null;
	var rows = [];
	var current = null;
	var mode = CodeMirror.getMode({
		indentUnit : 2
	}, blames.contenttype);
	var state = CodeMirror.startState(mode);
	goog.array.forEach(blames.blames, function(a) {
		var r = {
			rowspan : 1
		};
		if(current && current.commit == a.commit) {
			current.rowspan++;
		} else {
			current = r;
			r.commit = a.commit;
			r.commitStr = org.koshinuke.template.blameviewer.tmpl(a);
		}
		var line = new goog.string.StringBuffer();
		var stream = new CodeMirror.StringStream(a.content);
		line.append("<pre>");
		while(!stream.eol()) {
			org.koshinuke.template.blameviewer.token({
				style : mode.token(stream, state),
				token : stream.current()
			}, line);
			stream.start = stream.pos;
		}
		line.append("</pre>");
		r.line = line.toString();
		rows.push(r);
	});
	var result = goog.dom.createDom('table', {
		"class" : "cm-s-default blame-grid"
	});
	var lineCounter = 0;
	goog.array.forEach(rows, function(a) {
		var commitEl = null;
		if(a.commitStr) {
			var commitopt = {
				'class' : 'metadata',
			};
			if(1 < a.rowspan) {
				commitopt['rowspan'] = a.rowspan;
			}
			commitEl = goog.dom.createDom('td', commitopt);
			commitEl.innerHTML = a.commitStr;
		}
		var num = goog.dom.createDom('th', {
			'class' : 'line-number'
		}, goog.dom.createTextNode(++lineCounter));
		var line = goog.dom.createDom('td', {
			'class' : 'content'
		});
		line.innerHTML = a.line;

		var tr = goog.dom.createDom('tr', a.commitStr ? {
			"class" : "section-begin"
		} : null, commitEl, num, line);
		goog.dom.appendChild(result, tr);
	});
	return result;
};

org.koshinuke.ui.BlameViewer.prototype.setVisible = function(state) {
	var el = this.getElement();
	if(el) {
		goog.style.showElement(el, state);
	}
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
