goog.provide('org.koshinuke.ui.Popup');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.query');
goog.require('goog.soy');
goog.require('goog.ui.Popup');

goog.require('org.koshinuke.template.tooltip');

/** @constructor */
org.koshinuke.ui.Popup = function(pos, dir) {
	goog.ui.Popup.call(this, this.makeEl_(dir), pos);
};
goog.inherits(org.koshinuke.ui.Popup, goog.ui.Popup);

/** @private */
org.koshinuke.ui.Popup.prototype.makeEl_ = function(d) {
	var el = goog.soy.renderAsElement(org.koshinuke.template.tooltip.tmpl, {
		dir : d
	});
	return el;
};
org.koshinuke.ui.Popup.prototype.setText = function(txt) {
	goog.array.forEach(goog.dom.query('.tooltip-inner', this.getElement()), function(a) {
		goog.dom.setTextContent(a, txt);
	});
};
/** @override */
org.koshinuke.ui.Popup.prototype.setVisible = function(value) {
	if(value == true) {
		goog.dom.appendChild(document.body, this.getElement());
	} else {
		goog.dom.removeNode(this.getElement());
	}
	org.koshinuke.ui.Popup.superClass_.setVisible.call(this, value);
};
/** @override */
org.koshinuke.ui.Popup.prototype.disposeInternal = function() {
	org.koshinuke.ui.Popup.superClass_.disposeInternal.call(this);
	goog.dom.removeNode(this.getElement());
	var pos = this.getPosition();
	if(pos && pos.dispose) {
		pos.dispose();
	}
};
