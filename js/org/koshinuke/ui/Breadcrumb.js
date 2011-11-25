goog.provide('org.koshinuke.ui.Breadcrumb');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.soy');

/**
 * @constructor
 */
org.koshinuke.ui.Breadcrumb = function(el) {
	this.el = el;
	this.root = "Branches";
	this.name = "master";
	this.path = "";
}
/**
 * @private
 */
org.koshinuke.ui.Breadcrumb.prototype.li_ = function(args) {
	return goog.soy.renderAsElement(org.koshinuke.template.breadcrumb.tmpl, {
		href : "#", // TODO make url
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
