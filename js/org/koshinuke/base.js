goog.provide('org.koshinuke');

goog.require('goog.pubsub.PubSub');

org.koshinuke.activationHandler = function(item, isSelect) {
	var c = "active";
	if(isSelect) {
		goog.dom.classes.add(item, c);
	} else {
		goog.dom.classes.remove(item, c);
	}
}

org.koshinuke.PubSub = new goog.pubsub.PubSub();
org.koshinuke.PubSub.REPO_SELECTION = "r.s";
