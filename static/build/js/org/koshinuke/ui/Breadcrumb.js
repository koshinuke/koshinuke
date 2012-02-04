goog.provide('org.koshinuke.ui.Breadcrumb');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.soy');

goog.require('goog.ui.Component');
goog.require('org.koshinuke.template.breadcrumb');

/** @constructor */
org.koshinuke.ui.Breadcrumb = function(fn, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.fn = fn;
};
goog.inherits(org.koshinuke.ui.Breadcrumb, goog.ui.Component);

/** @override */
org.koshinuke.ui.Breadcrumb.prototype.canDecorate = function(element) {
	return element.tagName == 'UL';
};
/** @override */
org.koshinuke.ui.Breadcrumb.prototype.decorateInternal = function(element) {
	org.koshinuke.ui.Breadcrumb.superClass_.decorateInternal.call(this, element);
	goog.events.listen(element, goog.events.EventType.CLICK, function(e) {
		var t = e.target;
		if(t.tagName == 'LI') {
			var ary = [];
			while(t) {
				ary.unshift(goog.dom.getTextContent(t).trim());
				t = goog.dom.getPreviousElementSibling(t);
			}
			this.fn(ary);
		}
	}, false, this);
};
/** @override */
org.koshinuke.ui.Breadcrumb.prototype.setModel = function(model) {
	org.koshinuke.ui.Breadcrumb.superClass_.setModel.call(this, model);
	var el = this.getElement();
	goog.dom.removeChildren(el);
	goog.soy.renderElement(el, org.koshinuke.template.breadcrumb.tmpl, {
		list : model
	});
};
/** @override */
org.koshinuke.ui.Breadcrumb.prototype.disposeInternal = function() {
	org.koshinuke.ui.Breadcrumb.superClass_.disposeInternal.call(this);
	this.fn = null;
};