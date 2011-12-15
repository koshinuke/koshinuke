goog.provide('org.koshinuke.ui.RepoUrls');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.soy');
goog.require('goog.string.format');

goog.require('goog.ui.Component');
goog.require('goog.ui.SelectionModel');
goog.require('goog.ui.Popup');

goog.require('ZeroClipboard');

goog.require('org.koshinuke.positioning.GravityPosition');
goog.require('org.koshinuke.template.tooltip');

/** @constructor */
org.koshinuke.ui.RepoUrls = function(opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.protocols = new goog.ui.SelectionModel();
	var self = this;
	this.protocols.setSelectionHandler(function(item, isSelect) {
		org.koshinuke.activationHandler(item, isSelect);
		if(isSelect) {
			self.internalSelect_(item);
		}
	});
	this.clip = new ZeroClipboard.Client();
};
goog.inherits(org.koshinuke.ui.RepoUrls, goog.ui.Component);

/** @private */
org.koshinuke.ui.RepoUrls.prototype.internalSelect_ = function(item) {
	var element = this.getElement();
	var desc = goog.dom.query('.desc-container span', element)[0];
	var urlbox = goog.dom.query('.url-box', element)[0];
	urlbox.setAttribute('value', item.getAttribute('href'));
	var newone = goog.dom.createTextNode(item.getAttribute('desc'));
	var oldone = desc.firstChild;
	desc.replaceChild(newone, oldone);
};

org.koshinuke.ui.RepoUrls.prototype.setSelectedIndex = function(i) {
	this.protocols.setSelectedIndex(i);
};

org.koshinuke.ui.RepoUrls.prototype.getSelectedIndex = function() {
	return this.protocols.getSelectedIndex();
};
/** @override */
org.koshinuke.ui.RepoUrls.prototype.canDecorate = function(element) {
	return element.tagName == 'DIV';
};
/** @override */
org.koshinuke.ui.RepoUrls.prototype.decorateInternal = function(element) {
	org.koshinuke.ui.RepoUrls.superClass_.decorateInternal.call(this, element);
	goog.events.listen(element, goog.events.EventType.CLICK, function(e) {
		var t = e.target;
		if(t.hasAttribute('href')) {
			this.protocols.setSelectedItem(t);
		} else if(goog.dom.classes.has(t, "url-box")) {
			t.select();
		}
	}, false, this);

	goog.array.forEach(goog.dom.query('.protocols', element), function(el) {
		goog.array.forEach(goog.dom.getChildren(el), function(a) {
			this.protocols.addItem(a);
		}, this);
	}, this);

	ZeroClipboard.setMoviePath('flash/ZeroClipboard.swf');

	var img = goog.dom.query('.clip-container img')[0];

	var g = function() {
		return new org.koshinuke.positioning.GravityPosition(img, 'w', 1);
	}
	var copyTip = new goog.ui.Popup(this.tooltip_('copy to clipboard'), g());
	var compTip = new goog.ui.Popup(this.tooltip_('copied !!'), g());

	var clip = this.clip;
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
};
/** @private */
org.koshinuke.ui.RepoUrls.prototype.tooltip_ = function(t) {
	var el = goog.soy.renderAsElement(org.koshinuke.template.tooltip.tmpl, {
		dir : 'right',
		txt : t
	});
	goog.dom.appendChild(document.body, el);
	return el;
};
/** @private */
org.koshinuke.ui.RepoUrls.prototype.listenEvents_ = function() {
	var h = this.getHandler();
	h.listen(this, goog.ui.Component.EventType.SHOW, this.handleShow_);
	h.listen(this, goog.ui.Component.EventType.HIDE, this.handleHide_);
	h.listen(this, goog.events.EventType.RESIZE, this.handleShow_);
	h.listen(this, goog.events.EventType.PAGESHOW, this.handleShow_);
	h.listen(this, goog.events.EventType.PAGEHIDE, this.handleHide_);
};
/** @private */
org.koshinuke.ui.RepoUrls.prototype.handleShow_ = function() {
	this.clip.show();
};
/** @private */
org.koshinuke.ui.RepoUrls.prototype.handleHide_ = function() {
	this.clip.hide();
};

org.koshinuke.ui.RepoUrls.prototype.reposition = function() {
	this.clip.reposition();
};
/** @override */
org.koshinuke.ui.RepoUrls.prototype.disposeInternal = function() {
	org.koshinuke.ui.RepoUrls.superClass_.disposeInternal.call(this);
	this.clip.destroy();
	this.clip = null;
	this.protocols = null;
};
/** @override */
org.koshinuke.ui.RepoUrls.prototype.setModel = function(model) {
	org.koshinuke.ui.RepoUrls.superClass_.setModel.call(this, model);
	var el = this.getElement();

	function f(fn, protocol) {
		var href = fn(model.user, model.host, model.path, model.name);
		goog.array.forEach(goog.dom.query('.protocols .' + protocol, el), function(a) {
			a.setAttribute('href', href);
		});
	}

	f(this.ssh_, 'ssh');
	f(this.https_, 'https');
	f(this.git_, 'git');
	this.internalSelect_(this.protocols.getSelectedItem());
};
/** @private */
org.koshinuke.ui.RepoUrls.prototype.ssh_ = function(user, host, path, name) {
	return goog.string.format('%s@%s:%s/%s.git', user, host, path, name);
};
/** @private */
org.koshinuke.ui.RepoUrls.prototype.https_ = function(user, host, path, name) {
	return goog.string.format('https://%s@%s/%s/%s.git', user, host, path, name);
};
/** @private */
org.koshinuke.ui.RepoUrls.prototype.git_ = function(user, host, path, name) {
	return goog.string.format('git://%s/%s/%s.git', host, path, name);
};
