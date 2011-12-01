goog.provide('org.koshinuke.ui.Breadcrumb');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.soy');

goog.require('goog.ui.Component');

/**
 * @constructor
 */
org.koshinuke.ui.Breadcrumb = function(el) {
	this.el = el;
	this.crumbs = [];
	this.listenEvents_();
}
goog.inherits(org.koshinuke.ui.Breadcrumb, goog.ui.Component);

/** @override */
org.koshinuke.ui.Breadcrumb.prototype.canDecorate = function(element) {
	return element.tagName == 'UL';
}
/** @override */
org.koshinuke.ui.Breadcrumb.prototype.decorateInternal = function(element) {
	// do nothing.
}
/**
 * @private
 */
org.koshinuke.ui.Breadcrumb.prototype.listenEvents_ = function() {
	var h = this.getHandler();
}
/**
 * @param ary ArrayLike object
 */
org.koshinuke.ui.Breadcrumb.prototype.setCrumbs = function(ary) {
	if(goog.isArrayLike(ary)) {
		this.crumbs = ary;
	}
}
/**
 * @private
 */
org.koshinuke.ui.Breadcrumb.prototype.remake_ = function() {
	goog.dom.removeChildren(this.el);

	goog.array.forEach(this.crumbs, function(a) {
		
	}, this);
}
/**
 * @private
 */
org.koshinuke.ui.Breadcrumb.prototype.li_ = function(args) {
	return goog.soy.renderAsElement(org.koshinuke.template.breadcrumb.tmpl, {
		view : args
	});
}
org.koshinuke.ui.Breadcrumb.prototype.receive = function(locationdata) {
	for(var key in locationdata) {
		var v = locationdata[key];
		if(v) {
			this[key] = v;
		}
	}
	this.remake();
}
org.koshinuke.ui.Breadcrumb.prototype.remake = function() {
	goog.dom.removeChildren(this.el);

	var ary = [this.root, this.name];
	if(this.path) {
		ary = goog.array.flatten(ary, path.split('/'));
	}
	goog.array.forEach(ary, function(p) {
		if(p) {
			this.el.appendChild(this.li_(p));
		}
	}, this);
};
