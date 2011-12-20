goog.provide('org.koshinuke.ui.Clipboard');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.soy');

goog.require('goog.ui.Component');
goog.require('goog.ui.Popup');

goog.require('ZeroClipboard');

goog.require('org.koshinuke.positioning.GravityPosition');
goog.require('org.koshinuke.template.tooltip');

/** @constructor */
org.koshinuke.ui.Clipboard = function(text, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	if(goog.isString(text)) {
		this.text = text;
	} else {
		this.text = text[0];
		this.setMessages(text[1], text[2]);
	}
};
goog.inherits(org.koshinuke.ui.Clipboard, goog.ui.Component);

org.koshinuke.ui.Clipboard.prototype.setCopyContents = function(text) {
	this.text = text;
};
org.koshinuke.ui.Clipboard.prototype.setMessages = function(desc, follow) {
	this.desc = desc;
	this.follow = follow;
};
org.koshinuke.ui.Clipboard.prototype.desc = "copy to clipboard";
org.koshinuke.ui.Clipboard.prototype.follow = "copied !!"

/** @constructor */
org.koshinuke.ui.Clipboard.Popup = function(pos) {
	goog.ui.Popup.call(this, this.makeEl_(), pos);
};
goog.inherits(org.koshinuke.ui.Clipboard.Popup, goog.ui.Popup);

/** @private */
org.koshinuke.ui.Clipboard.Popup.prototype.makeEl_ = function() {
	var el = goog.soy.renderAsElement(org.koshinuke.template.tooltip.tmpl, {
		dir : 'right'
	});
	goog.dom.appendChild(document.body, el);
	return el;
};
org.koshinuke.ui.Clipboard.Popup.prototype.setText = function(txt) {
	goog.array.forEach(goog.dom.query('.tooltip-inner', this.getElement()), function(a) {
		goog.dom.setTextContent(a, txt);
	});
};
/** @override */
org.koshinuke.ui.Clipboard.prototype.enterDocument = function() {
	org.koshinuke.ui.Clipboard.superClass_.enterDocument.call(this);
	var element = this.getElement();
	var clip = new ZeroClipboard.Client();
	var img = goog.dom.query('.clip-container .copy', element)[0];
	this.popup = new org.koshinuke.ui.Clipboard.Popup(new org.koshinuke.positioning.GravityPosition(img, 'w', 1));

	var self = this;
	var popup = self.popup;
	clip.addEventListener('onMouseOver', function(client) {
		popup.setText(self.desc);
		popup.setVisible(true);
	});
	clip.addEventListener('onMouseOut', function(client) {
		popup.setVisible(false);
	});
	clip.addEventListener('onMouseDown', function(client) {
		clip.setText(self.text);
	});
	clip.addEventListener('onComplete', function(client, text) {
		popup.setText(self.follow);
		popup.setVisible(true);
	});
	clip.glue(img, img.parentNode);
	this.clip = clip;
};
/** @override */
org.koshinuke.ui.Clipboard.prototype.exitDocument = function() {
	org.koshinuke.ui.Clipboard.superClass_.exitDocument.call(this);
	this.clip.destroy();
	this.clip = null;
	goog.dom.removeNode(this.popup.getElement());
	this.popup.dispose();
	this.popup = null;
};
/** @override */
org.koshinuke.ui.Clipboard.prototype.disposeInternal = function() {
	org.koshinuke.ui.Clipboard.superClass_.disposeInternal.call(this);
};
