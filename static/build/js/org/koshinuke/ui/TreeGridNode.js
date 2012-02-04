goog.provide('org.koshinuke.ui.TreeGrid.Node');
goog.provide('org.koshinuke.ui.TreeGrid.Node.State');
goog.provide('org.koshinuke.ui.TreeGrid.Leaf');
goog.provide('org.koshinuke.ui.TreeGrid.Psuedo');

goog.require('goog.dom.classes');
goog.require('goog.dom.query');

goog.require('goog.ui.Component');

goog.require('org.koshinuke');
goog.require('org.koshinuke.template.treegrid');

// TODO 汎用的に使える形に丸めるのは後で。
/** @constructor */
org.koshinuke.ui.TreeGrid.Node = function(opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
};
goog.inherits(org.koshinuke.ui.TreeGrid.Node, goog.ui.Component);

/** @constructor */
org.koshinuke.ui.TreeGrid.Leaf = function(opt_domHelper) {
	org.koshinuke.ui.TreeGrid.Node.call(this, opt_domHelper);
};
goog.inherits(org.koshinuke.ui.TreeGrid.Leaf, org.koshinuke.ui.TreeGrid.Node);

/** @constructor */
org.koshinuke.ui.TreeGrid.Psuedo = function(parentPath, opt_domHelper) {
	org.koshinuke.ui.TreeGrid.Leaf.call(this, opt_domHelper);
	this.path = parentPath + '/psuedo';
	this.setUpForSort();
};
goog.inherits(org.koshinuke.ui.TreeGrid.Psuedo, org.koshinuke.ui.TreeGrid.Leaf);

/** @enum {string} */
org.koshinuke.ui.TreeGrid.Node.State = {
	EXPAND : "expand",
	COLLAPSE : "collapse"
};
org.koshinuke.ui.TreeGrid.Node.newFromJson = function(json) {
	var m;
	var type = json['type'];
	if(type == 'tree') {
		m = new org.koshinuke.ui.TreeGrid.Node();
	} else if(type == 'branch' || type == 'tag') {
		m = new org.koshinuke.ui.TreeGrid.Node();
		m.hasChild = true;
		m.setJsonDetail_(json);
	} else {
		m = new org.koshinuke.ui.TreeGrid.Leaf();
	}
	m.setJsonShared_(json);
	m.setJson(json);
	m.setUpForSort();
	return m;
};
org.koshinuke.ui.TreeGrid.Node.prototype.setJsonShared_ = function(json) {
	// TODO more abstraction
	this.type = json['type'];
	this.path = json['path'];
	this.name = json['name'];
};
org.koshinuke.ui.TreeGrid.Node.prototype.setJson = function(json) {
	this.children = json['children'];
};
org.koshinuke.ui.TreeGrid.Node.prototype.setUpForSort = function() {
	this.ary = this.path.split('/');
	this.level = this.ary.length - 1;
};
org.koshinuke.ui.TreeGrid.Node.prototype.tearDownForSort = function() {
	delete this.ary;
};
org.koshinuke.ui.TreeGrid.Node.prototype.setJsonDetail_ = function(json) {
	this.rawtimestamp = Number(json['timestamp']);
	this.timestamp = org.koshinuke.toDateString(json['timestamp']);
	this.message = json['message'];
	this.author = json['author'];
};
org.koshinuke.ui.TreeGrid.Leaf.prototype.setJson = function(json) {
	var ext = org.koshinuke.getExtension(json['path'], this.icon);
	this.icon = org.koshinuke.findIcon(ext);
	this.setJsonDetail_(json);
};

org.koshinuke.ui.TreeGrid.Node.prototype.indent = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.type = "";
org.koshinuke.ui.TreeGrid.Node.prototype.path = "";
org.koshinuke.ui.TreeGrid.Node.prototype.level = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.name = "";
org.koshinuke.ui.TreeGrid.Node.prototype.visible = false;
org.koshinuke.ui.TreeGrid.Node.prototype.setVisible = function(state) {
	this.visible = state;
	var el = this.getElement();
	if(el) {
		goog.style.showElement(el, state);
	}
};

org.koshinuke.ui.TreeGrid.Node.prototype.state = org.koshinuke.ui.TreeGrid.Node.State.COLLAPSE;
org.koshinuke.ui.TreeGrid.Node.prototype.children = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.hasChild = true;
org.koshinuke.ui.TreeGrid.Leaf.prototype.hasChild = false;
org.koshinuke.ui.TreeGrid.Node.prototype.isLoaded = false;
org.koshinuke.ui.TreeGrid.Node.prototype.loadedOffset = 0;

org.koshinuke.ui.TreeGrid.Node.prototype.icon = "folder";
org.koshinuke.ui.TreeGrid.Leaf.prototype.icon = "txt";
org.koshinuke.ui.TreeGrid.Node.prototype.rawtimestamp = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.timestamp = "";
org.koshinuke.ui.TreeGrid.Node.prototype.message = "";
org.koshinuke.ui.TreeGrid.Node.prototype.author = "";

/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.createDom = function() {
	this.internalCreateDom_(org.koshinuke.template.treegrid.row);
};
org.koshinuke.ui.TreeGrid.Node.prototype.internalCreateDom_ = function(tmpl) {
	this.emitIndent();
	var wrapper = this.getDomHelper().createElement('TBODY');
	wrapper.innerHTML = tmpl(this);
	this.decorateInternal(wrapper.firstChild);
};
/** @override */
org.koshinuke.ui.TreeGrid.Psuedo.prototype.createDom = function() {
	this.internalCreateDom_(org.koshinuke.template.treegrid.psuedo);
};
/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.enterDocument = function() {
	org.koshinuke.ui.TreeGrid.Node.superClass_.enterDocument.call(this);
	var el = this.getElement();
	if(el) {
		el.model = this;
	}
};
org.koshinuke.ui.TreeGrid.Node.prototype.updateElement = function() {
	var oldEl = this.getElement();
	this.createDom();
	var newEl = this.getElement();
	newEl.model = this;
	goog.dom.replaceNode(newEl, oldEl);
};
/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.exitDocument = function() {
	var el = this.getElement();
	if(el) {
		el.model = null;
	}
	org.koshinuke.ui.TreeGrid.Node.superClass_.exitDocument.call(this);
};
/** @protected */
org.koshinuke.ui.TreeGrid.Node.prototype.emitIndent = function() {
	this.indent = this.level * 18;
};
/** @override */
org.koshinuke.ui.TreeGrid.Leaf.prototype.emitIndent = function() {
	this.indent = (this.level + 1) * 18;
};
