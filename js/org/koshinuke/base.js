goog.provide('org.koshinuke');

goog.require('goog.array');
goog.require('goog.crypt');
goog.require('goog.crypt.Md5');
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
org.koshinuke.PubSub.REPO_SELECT = "r.s";
org.koshinuke.PubSub.TAB_SELECT = "t.s";
org.koshinuke.PubSub.TAB_UNSELECT = "t.u";

org.koshinuke.findIcon = function(key) {
	return {
	$$b : 'branches',
	$$t : 'tags',
	$$h : 'histories',
	$$g : 'graph'
	}[key] || 'txt';
}

org.koshinuke.hash = function(var_args) {
	var md5 = new goog.crypt.Md5();
	goog.array.forEach(arguments, function(a) {
		md5.update(a);
	});
	return goog.crypt.byteArrayToHex(md5.digest());
}