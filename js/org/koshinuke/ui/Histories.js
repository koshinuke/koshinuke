goog.provide('org.koshinuke.ui.Histories');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.soy');

goog.require('goog.ui.Component');
goog.require('goog.ui.IdGenerator');

goog.require('org.koshinuke.template.branchactivity');

/** @constructor */
org.koshinuke.ui.Histories = function(loader, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.loader = loader;
	this.vsm = goog.dom.ViewportSizeMonitor.getInstanceForWindow();
	this.charts = [];
};
goog.inherits(org.koshinuke.ui.Histories, goog.ui.Component);

/** @override */
org.koshinuke.ui.Histories.prototype.createDom = function() {
	this.loading = goog.dom.createDom("div", {
		'class' : 'loading_large'
	});
	var element = goog.dom.createDom("div", null, this.loading);
	this.decorateInternal(element);
};
/** @override */
org.koshinuke.ui.Histories.prototype.enterDocument = function() {
	org.koshinuke.ui.Histories.superClass_.enterDocument.call(this);
	var parent = this.getElement();
	var model = this.getModel();
	var self = this;
	this.loader.load(model, function(histories) {
		var list = goog.dom.createDom('div', {
			'class' : 'branchlist'
		});
		parent.replaceChild(list, self.loading);
		goog.array.forEach(histories, function(h) {
			var con = goog.soy.renderAsElement(org.koshinuke.template.branchactivity.tmpl, h);
			var ael = goog.dom.createDom("div", {
				'id' : goog.ui.IdGenerator.getInstance().getNextUniqueId(),
				'class' : 'activity'
			});
			con.appendChild(ael);
			list.appendChild(con);
			self.charts.push(renderBranchActivity(ael, {
				'color' : ["#CCC"],
				'values' : h.activities
			}));
			con.model = h;
		});
		self.delay = new goog.async.Delay(self.resizeChart_, 100, self);
		self.getHandler().listen(self.vsm, goog.events.EventType.RESIZE, self.resizeChart_, false, self);
		self.getHandler().listen(list, goog.events.EventType.CLICK, self.handleClick_, false, self);
	});
};
/** @private */
org.koshinuke.ui.Histories.prototype.resizeChart_ = function() {
	goog.array.forEach(this.charts, function(a) {
		if(resizeGraph(a) == false) {
			this.delay.start();
		}
	}, this);
};
/** @private */
org.koshinuke.ui.Histories.prototype.handleClick_ = function(e) {
	var element = e.target;
	var md = 'metadata';
	if(element.tagName != 'CANVAS') {
		var branch;
		if(goog.dom.classes.has(element.parentNode, md)) {
			branch = element.parentNode.parentNode.model;
		}
		if(goog.dom.classes.has(element, md)) {
			branch = element.parentNode.model;
		}
		if(branch) {
			var m = goog.object.clone(this.getModel());
			m.label = goog.array.flatten(m.label, branch.name);
			m.context = org.koshinuke.ui.PaneTab.Factory.Commits;
			m.branch = branch;
			org.koshinuke.PubSub.publish(org.koshinuke.PubSub.BRANCH_SELECT, m);
		}
	}
};
/** @override */
org.koshinuke.ui.Histories.prototype.exitDocument = function() {
	org.koshinuke.ui.Histories.superClass_.exitDocument.call(this);

	goog.array.forEach(this.charts, function(a) {
		disposeGraph(a);
	});
	goog.array.clear(this.charts);
	if(this.delay) {
		this.delay.dispose();
		this.delay = null;
	}
};

org.koshinuke.ui.Histories.prototype.setVisible = function(state) {
	var el = this.getElement();
	if(el) {
		goog.style.showElement(el, state);
	}
	if(state) {
		this.resizeChart_();
	}
};
/** @override */
org.koshinuke.ui.Histories.prototype.disposeInternal = function() {
	org.koshinuke.ui.Histories.superClass_.disposeInternal.call(this);
	this.loading = null;
	this.loader = null;
	this.vsm = null;
};
