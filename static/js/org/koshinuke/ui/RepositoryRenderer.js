goog.provide('org.koshinuke.ui.RepositoryRenderer');

goog.require('goog.dom.query');
goog.require('goog.dom.a11y.Role');
goog.require('goog.soy');
goog.require('goog.ui.Component.State');
goog.require('goog.ui.TabRenderer');

goog.require('org.koshinuke.template.repository');

/** @constructor */
org.koshinuke.ui.RepositoryRenderer = function() {
	goog.ui.TabRenderer.call(this);
};
goog.inherits(org.koshinuke.ui.RepositoryRenderer, goog.ui.TabRenderer);
goog.addSingletonGetter(org.koshinuke.ui.RepositoryRenderer);

org.koshinuke.ui.RepositoryRenderer.CSS_CLASS = goog.getCssName('repository');

org.koshinuke.ui.RepositoryRenderer.prototype.getCssClass = function() {
	return org.koshinuke.ui.RepositoryRenderer.CSS_CLASS;
};

org.koshinuke.ui.RepositoryRenderer.prototype.getAriaRole = function() {
	return goog.dom.a11y.Role.TAB;
};

org.koshinuke.ui.RepositoryRenderer.prototype.createDom = function(repo) {
	var element = goog.soy.renderAsElement(org.koshinuke.template.repository.tmpl, repo);
	this.setAriaStates(repo, element);
	return element;
};

org.koshinuke.ui.RepositoryRenderer.prototype.decorate = function(repo, element) {
	element = org.koshinuke.ui.RepositoryRenderer.superClass_.decorate.call(this, repo, element);
	return element;
};
