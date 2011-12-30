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
};

org.koshinuke.PubSub = new goog.pubsub.PubSub();
org.koshinuke.PubSub.REPO_SELECT = "rep.s";
org.koshinuke.PubSub.RESOURCE_SELECT = "res.s";
org.koshinuke.PubSub.TAB_SELECT = "t.s";
org.koshinuke.PubSub.TAB_UNSELECT = "t.u";
org.koshinuke.PubSub.BRANCH_SELECT = "b.s";

org.koshinuke.getExtension = function(path, nullvalue) {
	if(path) {
		var i = path.trim().lastIndexOf('.');
		if(0 < i) {
			return path.substr(i);
		}
	}
	return nullvalue;
}
org.koshinuke.findIcon = function(key) {
	return {
	".py"  : "python",
	".html" : "html",
	".css" : "css",
	".js" : "js",
	".ico" : "pic",
	".gif" : "pic",
	".jpg" : "pic",
	".png" : "pic",
	".java": "java"
	}[key] || "txt";
};

org.koshinuke.hash = function(var_args) {
	var md5 = new goog.crypt.Md5();
	goog.array.forEach(arguments, function(a) {
		md5.update(a);
	});
	return goog.crypt.byteArrayToHex(md5.digest());
};

org.koshinuke.findParent = function(el, findfor) {
	var p;
	do {
		if( p = el.parentNode) {
			if(p.tagName == findfor || p.tagName == 'BODY') {
				return p;
			}
			el = p;
		}
	} while(p);
	return el;
};

org.koshinuke.toDate = function(unixTime) {
	var t = Number(unixTime);
	return new Date(t * 1000);
};

org.koshinuke.toDateString = function(unixTime) {
	return new goog.i18n.DateTimeFormat('yyyy-MM-dd HH:mm:ss').format(org.koshinuke.toDate(unixTime));
};
