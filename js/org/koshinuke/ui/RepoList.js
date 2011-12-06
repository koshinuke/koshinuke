goog.provide('org.koshinuke.ui.RepoList');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');

goog.require('goog.ui.Component');
goog.require('goog.ui.SelectionModel');

goog.require('org.koshinuke.template.repolist');

/**
 * @constructor
 */
org.koshinuke.ui.RepoList = function(fn, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.contextHandler = fn;
	this.repositories = new goog.ui.SelectionModel();
	this.repositories.setSelectionHandler(org.koshinuke.activationHandler);
};
goog.inherits(org.koshinuke.ui.RepoList, goog.ui.Component);

org.koshinuke.ui.RepoList.prototype.setSelectedIndex = function(i, c) {
	this.repositories.setSelectedIndex(i);
	if(goog.isNumber(c) && -1 < c) {
		var s = this.repositories.getSelectedItem();
		s.child.setSelectedIndex(c);
	}
};

org.koshinuke.ui.RepoList.prototype.getSelectedIndex = function() {
	return this.repositories.getSelectedIndex();
};
/** @override */
org.koshinuke.ui.RepoList.prototype.canDecorate = function(element) {
	return element.tagName == 'DIV';
};
/** @override */
org.koshinuke.ui.RepoList.prototype.decorateInternal = function(element) {
	org.koshinuke.ui.RepoList.superClass_.decorateInternal.call(this, element);
	var self = this;
	goog.array.forEach(goog.dom.query('.repository', element), function(repo) {
		this.repositories.addItem(repo);
		var ctx_sm = new goog.ui.SelectionModel();
		ctx_sm.setSelectionHandler(function(item, is) {
			org.koshinuke.activationHandler(item, is);
			self.contextHandler(repo, item, is);
		});
		goog.array.forEach(goog.dom.query('li', repo), function(li) {
			ctx_sm.addItem(li);
			li.ctx_sm = ctx_sm;
		});
		repo.child = ctx_sm;
	}, this);
	goog.events.listen(element, goog.events.EventType.CLICK, function(e) {
		var t = e.target;
		if(goog.dom.classes.has(t, 'repo-name')) {
			this.repositories.setSelectedItem(t.parentNode);
		} else if(t.tagName == 'LI') {
			t.ctx_sm.setSelectedItem(t);
		}
	}, false, this);
};
org.koshinuke.ui.RepoList.prototype.makeModel = function(repo, li) {
	var name = goog.dom.query('.repo-name', repo)[0];
	return {
		user : 'taichi', // from cookie ?
		host : repo.getAttribute('host'),
		path : repo.getAttribute('path'),
		name : goog.dom.getTextContent(name).trim(),
		context : li.getAttribute('context'),
		label : goog.dom.getTextContent(li)
	};
};
/** @override */
org.koshinuke.ui.RepoList.prototype.setModel = function(model) {
	org.koshinuke.ui.RepoList.superClass_.setModel.call(this, model);
	this.repositories.clear();
	var root = this.getElement();
	goog.dom.removeChildren(root);
	goog.soy.renderElement(root, org.koshinuke.template.repolist.tmpl, {
		list : model
	});
	this.decorateInternal(root);
};
/** @override */
org.koshinuke.ui.RepoList.prototype.disposeInternal = function() {
	org.koshinuke.ui.RepoList.superClass_.disposeInternal.call(this);
	this.contextHandler = null;
	this.repositories = null;
};