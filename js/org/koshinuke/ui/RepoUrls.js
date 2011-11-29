goog.provide('org.koshinuke.ui.RepoUrls');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.soy');

goog.require('goog.ui.Component');
goog.require('goog.ui.SelectionModel');
goog.require('goog.ui.Popup');

goog.require('ZeroClipboard');

goog.require('org.koshinuke.positioning.GravityPosition');
goog.require('org.koshinuke.template.tooltip');

/**
 * @constructor
 */
org.koshinuke.ui.RepoUrls = function(opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.protocols = new goog.ui.SelectionModel();
	this.protocols.setSelectionHandler(org.koshinuke.activationHandler);
	this.clip = new ZeroClipboard.Client();
}
goog.inherits(org.koshinuke.ui.RepoUrls, goog.ui.Component);

org.koshinuke.ui.RepoUrls.prototype.setSelectedIndex = function(i) {
	this.protocols.setSelectedIndex(i);
}

org.koshinuke.ui.RepoUrls.prototype.getSelectedIndex = function() {
	return this.protocols.getSelectedIndex();
}
/** @override */
org.koshinuke.ui.RepoUrls.prototype.canDecorate = function(element) {
	return element.tagName == 'DIV';
}
/** @override */
org.koshinuke.ui.RepoUrls.prototype.decorateInternal = function(element) {
	var self = this;
	var desc = goog.dom.query('.desc-container span', element)[0];
	var urlbox = goog.dom.query('.url-box', element)[0];
	goog.events.listen(element, goog.events.EventType.CLICK, function(e) {
		var t = e.target;
		if(t.hasAttribute('href')) {
			urlbox.value = t.getAttribute('href');
			var newone = goog.dom.createTextNode(t.getAttribute('desc'));
			var oldone = desc.firstChild;
			desc.replaceChild(newone, oldone);
			self.protocols.setSelectedItem(t);
		} else if(goog.dom.classes.has(t, "url-box")) {
			t.select();
		}
	});

	goog.array.forEach(goog.dom.query('.protocols', element), function(el) {
		goog.array.forEach(goog.dom.getChildren(el), function(a) {
			self.protocols.addItem(a);
		});
	});

	ZeroClipboard.setMoviePath('flash/ZeroClipboard.swf');

	var img = goog.dom.query('.clip-container img')[0];

	var g = function() {
		return new org.koshinuke.positioning.GravityPosition(img, 'w', 1);
	}
	var copyTip = new goog.ui.Popup(self.tooltip_('copy to clipboard'), g());
	var compTip = new goog.ui.Popup(self.tooltip_('copied !!'), g());

	var clip = self.clip;
	clip.addEventListener('onMouseOver', function(client) {
		var el = client.domElement;
		el.setAttribute("src", "images/copy_button_over.png");
		copyTip.setVisible(true);
	});
	clip.addEventListener('onMouseOut', function(client) {
		client.domElement.setAttribute("src", "images/copy_button_up.png");
		copyTip.setVisible(false);
		compTip.setVisible(false);
	});
	clip.addEventListener('onMouseUp', function(client) {
		client.domElement.setAttribute("src", "images/copy_button_up.png");
	});
	clip.addEventListener('onMouseDown', function(client) {
		var el = client.domElement;
		el.setAttribute("src", "images/copy_button_down.png");
		clip.setText(urlbox.value);
	});
	clip.addEventListener('onComplete', function(client, text) {
		compTip.setVisible(true);
	});
	clip.glue(img, img.parentNode);
}
/**
 * @private
 */
org.koshinuke.ui.RepoUrls.prototype.tooltip_ = function(t) {
	var el = goog.soy.renderAsElement(org.koshinuke.template.tooltip.tmpl, {
		dir : 'right',
		txt : t
	});
	goog.dom.appendChild(document.body, el);
	return el;
}

org.koshinuke.ui.RepoUrls.prototype.reposition = function() {
	this.clip.reposition();
}