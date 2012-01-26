goog.provide('org.koshinuke.ui.DiffViewer');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.soy');

goog.require('goog.ui.Button');
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

org.koshinuke.ui.DiffViewer.OperationToPath = {
	'add' : function(oldpath, newpath) {
		return newpath;
	},
	'modify' : function(oldpath, newpath) {
		if(oldpath != newpath) {
			return oldpath + ' → ' + newpath;
		}
		return newpath;
	},
	'delete' : function(oldpath, newpath) {
		return oldpath;
	},
	'rename' : function(oldpath, newpath) {
		return oldpath + ' → ' + newpath;
	},
	'copy' : function(oldpath, newpath) {
		return oldpath + ' → ' + newpath;
	}
};

/** @override */
org.koshinuke.ui.DiffViewer.prototype.enterDocument = function() {
	org.koshinuke.ui.DiffViewer.superClass_.enterDocument.call(this);
	var parent = this.getElement();
	var model = this.getModel();
	var self = this;
	var h = this.getHandler();
	this.loader.load(model, function(diff) {
		model.commit.commit = diff.commit;
		model.commit.parents = diff.parents;
		var commits = goog.soy.renderAsElement(org.koshinuke.template.diffviewer.commit, diff);
		parent.replaceChild(commits, self.loading);
		goog.array.forEach(goog.dom.query('button', commits), function(a) {
			var b = new goog.ui.Button();
			b.decorate(a);
			b.setParent(self);
		});
		var files = goog.dom.createDom('div', {
			'class' : 'files'
		});
		parent.appendChild(files);
		goog.array.forEach(diff.diff, function(a) {
			var pathconv = org.koshinuke.ui.DiffViewer.OperationToPath[a.operation];
			var p = a.newpath;
			if(pathconv) {
				p = pathconv(a.oldpath, a.newpath);				
			}
			var f = goog.soy.renderAsElement(org.koshinuke.template.diffviewer.file, {
				operation : a.operation,
				path : p
			});
			files.appendChild(f);
			h.listen(goog.dom.query('.meta',f)[0], goog.events.EventType.CLICK, function(e) {
				if(goog.dom.classes.has(f, 'collapse')) {
					goog.dom.classes.addRemove(f, 'collapse', 'expand');
					// TODO 理解不能だが、こうすると表示部分の高さが適切に設定される。
					goog.Timer.callOnce(function() {
						f.cm.refresh();
						goog.Timer.callOnce(f.cm.refresh, 0, f.cm);
					});
				} else if(goog.dom.classes.has(f, 'expand')) {
					goog.dom.classes.addRemove(f, 'expand', 'collapse');
				}
			}, false, self);
			f.cm = CodeMirror(function(elt) {
				var con = goog.dom.query('.content', f)[0];
				con.appendChild(elt);
			}, {
				mode : 'text/x-diff',
				value : a.patch,
				matchBrackets : false,
				lineNumbers : false,
				readOnly : true
			});
		});
	});
	h.listen(this, goog.ui.Component.EventType.ACTION, function(e) {
		// TODO view commit tree
		console.log('view commit tree.');
	});
	h.listen(parent, goog.events.EventType.CLICK, function(e) {
		var el = e.target;
		if(goog.dom.classes.has(el, 'parent')) {
			var m = goog.object.clone(this.getModel());
			var cid = m.commit.parents[0];
			var tid = goog.dom.getTextContent(el);
			goog.array.forEach(m.commit.parents, function(a) {
				if(goog.string.startsWith(a, tid)) {
					cid = a;
				}
			});
			m.commit = {
				commit : cid
			};
			m.label = [m.branch.name, cid];
			m.context = org.koshinuke.ui.PaneTab.Factory.Diff;
			org.koshinuke.PubSub.publish(org.koshinuke.PubSub.COMMIT_SELECT, m);
		}
	}, false, this);
};
/** @override */
org.koshinuke.ui.DiffViewer.prototype.exitDocument = function() {
	org.koshinuke.ui.DiffViewer.superClass_.exitDocument.call(this);
	goog.dom.removeNode(this.getElement());
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
