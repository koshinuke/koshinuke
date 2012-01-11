goog.provide('org.koshinuke.ui.RepoUrls');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.string.format');

goog.require('goog.ui.Component');
goog.require('goog.ui.SelectionModel');

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
};
goog.inherits(org.koshinuke.ui.RepoUrls, goog.ui.Component);

/** @private */
org.koshinuke.ui.RepoUrls.prototype.internalSelect_ = function(item) {
	var element = this.getElement();
	var desc = goog.dom.query('.desc-container span', element)[0];
	var urlbox = goog.dom.query('.url-box', element)[0];
	var value = item.getAttribute('href');
	urlbox.setAttribute('value', value);
	var newone = goog.dom.createTextNode(item.getAttribute('desc'));
	var oldone = desc.firstChild;
	desc.replaceChild(newone, oldone);
	this.clip.setCopyContents(value);
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
};

org.koshinuke.ui.RepoUrls.prototype.enterDocument = function() {
	org.koshinuke.ui.RepoUrls.superClass_.enterDocument.call(this);
	this.clip = new org.koshinuke.ui.Clipboard(["", 'copy url to clipboard', 'copied !!']);
	this.clip.decorate(this.getElement());
};
/** @override */
org.koshinuke.ui.RepoUrls.prototype.exitDocument = function() {
	org.koshinuke.ui.RepoUrls.superClass_.exitDocument.call(this);
	this.clip.exitDocument();
}
/** @override */
org.koshinuke.ui.RepoUrls.prototype.disposeInternal = function() {
	org.koshinuke.ui.RepoUrls.superClass_.disposeInternal.call(this);
	this.clip.dispose();
	this.clip = null;
	this.protocols.dispose();
	this.protocols = null;
};
/** @override */
org.koshinuke.ui.RepoUrls.prototype.setModel = function(model) {
	org.koshinuke.ui.RepoUrls.superClass_.setModel.call(this, model);
	var el = this.getElement();
	var f = function (fn, protocol) {
		var href = fn(model.user, model.host, model.path);
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
org.koshinuke.ui.RepoUrls.prototype.ssh_ = function(user, host, path) {
	return goog.string.format('%s@%s:%s.git', user, host, path);
};
/** @private */
org.koshinuke.ui.RepoUrls.prototype.https_ = function(user, host, path) {
	return goog.string.format('https://%s@%s/%s.git', user, host, path);
};
/** @private */
org.koshinuke.ui.RepoUrls.prototype.git_ = function(user, host, path) {
	return goog.string.format('git://%s/%s.git', host, path);
};
