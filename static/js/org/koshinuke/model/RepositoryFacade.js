goog.provide('org.koshinuke.model.RepositoryFacade');

goog.require('org.koshinuke.model.AbstractFacade');

/** @constructor */
org.koshinuke.model.RepositoryFacade = function(uri) {
	org.koshinuke.model.AbstractFacade.call(this, uri);
};
goog.inherits(org.koshinuke.model.RepositoryFacade, org.koshinuke.model.AbstractFacade);

org.koshinuke.model.RepositoryFacade.prototype.load = function() {
	this.get("", org.koshinuke.PubSub.REPO_LIST_RECEIVED);
};

org.koshinuke.model.RepositoryFacade.prototype.init = function(formEl) {
	this.post("", org.koshinuke.PubSub.REPO_LIST_RECEIVED, formEl);
};
