goog.provide('org.koshinuke.ui.Commits');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');

goog.require('goog.ui.Button');
goog.require('goog.ui.Component');

goog.require('org.koshinuke.template.commits');
goog.require('org.koshinuke.positioning.GravityPosition');
goog.require('org.koshinuke.ui.Popup');

/** @constructor */
org.koshinuke.ui.Commits = function(loader, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.loader = loader;
	this.nowloading = false;
};
goog.inherits(org.koshinuke.ui.Commits, goog.ui.Component);

/** @override */
org.koshinuke.ui.Commits.prototype.createDom = function() {
	this.loading = goog.dom.createDom("div", {
		'class' : 'loading_large'
	});
	var element = goog.dom.createDom("div", null, this.loading);
	this.decorateInternal(element);
};
/** @override */
org.koshinuke.ui.Commits.prototype.enterDocument = function() {
	org.koshinuke.ui.Commits.superClass_.enterDocument.call(this);
	var parent = this.getElement();
	var model = this.getModel();
	var self = this;
	this.loader.load(model, function(commits) {
		goog.dom.removeNode(self.loading);
		self.setUpRow_(parent, commits);
	});
	var h = this.getHandler();
	h.listen(goog.dom.getWindow(), goog.events.EventType.SCROLL, this.autoPaging_, false, this);
	h.listen(goog.dom.getWindow(), goog.events.EventType.RESIZE, this.autoPaging_, false, this);

	h.listen(parent, goog.events.EventType.CLICK, function(e) {
		var el = org.koshinuke.findParentByClass(e.target, 'commit');
		var m = goog.object.clone(this.getModel());
		m.label = ["Commit", m.branch.name, el.model.commit];
		m.context = org.koshinuke.ui.PaneTab.Factory.Diff;
		m.commit = el.model;
		org.koshinuke.PubSub.publish(org.koshinuke.PubSub.COMMIT_SELECT, m);
	}, false, self);
};
/** @private */
org.koshinuke.ui.Commits.prototype.autoPaging_ = function() {
	if(this.nowloading == false) {
		this.nowloading = true;
		var element = this.getElement();
		var last = goog.dom.getLastElementChild(element);
		if(goog.style.isElementShown(element) && last && last.model) {
			var current = last.model;
			if(0 < current.parents.length) {
				var prev = goog.dom.getPreviousElementSibling(last);
				var py = goog.style.getPosition(prev).y;
				var ey = goog.style.getPosition(element).y;
				var sy = goog.dom.getDocumentScroll().y;
				if((py - ey - sy) < 400) {
					this.fetchMorePage_(current);
					return;
				}
			}
		}
		this.nowloading = false;
	}
};
/** @private */
org.koshinuke.ui.Commits.prototype.setUpRow_ = function(parent, commits) {
	goog.array.forEach(commits, function(a) {
		var c = goog.soy.renderAsElement(org.koshinuke.template.commits.tmpl, a);
		c.model = a;
		if(this.striped) {
			goog.dom.classes.add(c, 'striped');
			this.striped = false;
		} else {
			this.striped = true;
		}
		parent.appendChild(c);
	}, this);
};
/** @private */
org.koshinuke.ui.Commits.prototype.fetchMorePage_ = function(current) {
	// TODO 出過ぎてる時に上の方にあるタグを消すべきか？
	var m = goog.object.clone(this.getModel());
	m.offset = current.commit;
	var parent = this.getElement()
	var self = this;
	parent.appendChild(this.loading);
	this.loader.load(m, function(commits) {
		goog.dom.removeNode(self.loading);
		self.setUpRow_(parent, commits);
		self.nowloading = false;
	});
};
/** @override */
org.koshinuke.ui.Commits.prototype.exitDocument = function() {
	org.koshinuke.ui.Commits.superClass_.exitDocument.call(this);
	goog.dom.removeChildren(this.getElement());
};

org.koshinuke.ui.Commits.prototype.setVisible = function(state) {
	var el = this.getElement();
	if(el) {
		goog.style.showElement(el, state);
	}
};
/** @override */
org.koshinuke.ui.Commits.prototype.disposeInternal = function() {
	org.koshinuke.ui.Commits.superClass_.disposeInternal.call(this);
	this.loader = null;
};
