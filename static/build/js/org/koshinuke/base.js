goog.provide('org.koshinuke');

goog.require('goog.array');
goog.require('goog.crypt');
goog.require('goog.crypt.Md5');
goog.require('goog.dom.classes');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.pubsub.PubSub');
goog.require('goog.string');

org.koshinuke.activationHandler = function(item, isSelect) {
	var c = "active";
	if(isSelect) {
		goog.dom.classes.add(item, c);
	} else {
		goog.dom.classes.remove(item, c);
	}
};

org.koshinuke.PubSub = new goog.pubsub.PubSub();
org.koshinuke.PubSub.TAB_ADDED = "t.a";
org.koshinuke.PubSub.REPO_LIST_RECEIVED = "rep.l.r";
org.koshinuke.PubSub.REPO_INIT_RESULT = "rep.i.r";
org.koshinuke.PubSub.REPO_CLONE_RESULT ="rep.c.r";
org.koshinuke.PubSub.REPO_SELECT = "rep.s";
org.koshinuke.PubSub.RESOURCE_SELECT = "res.s";
org.koshinuke.PubSub.TAB_SELECT = "t.s";
org.koshinuke.PubSub.TAB_UNSELECT = "t.u";
org.koshinuke.PubSub.BRANCH_SELECT = "b.s";
org.koshinuke.PubSub.COMMIT_SELECT = "c.s";
org.koshinuke.PubSub.MODIFY_SUCCESS = "m.s";
org.koshinuke.PubSub.BLAME_EXECUTE = "b.e";

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
		md5.update(a.toString());
	});
	return goog.crypt.byteArrayToHex(md5.digest());
};
org.koshinuke.findParentByPredicate = function(el, pred) {
	var p;
	do {
		if( p = el.parentNode) {
			if(pred(p) || p.tagName == 'BODY') {
				return p;
			}
			el = p;
		}
	} while(p);
	return el;
};
org.koshinuke.findParent = function(el, findfor) {
	return org.koshinuke.findParentByPredicate(el, function(p) {
		return p.tagName == findfor;
	});
};

org.koshinuke.findParentByClass = function(el, findfor) {
	return org.koshinuke.findParentByPredicate(el, function(p) {
		return goog.dom.classes.has(p, findfor);
	});
};

org.koshinuke.toDate = function(unixTime) {
	var t = Number(unixTime);
	return new Date(t * 1000);
};

org.koshinuke.toDateString = function(unixTime) {
	return toRelativeTime(org.koshinuke.toDate(unixTime));
};

org.koshinuke.slideElements = function(outEl, inEl) {
	var iSize = goog.style.getSize(inEl);
	var imBox = goog.style.getMarginBox(inEl);
	var bottom = iSize.height + imBox.top + imBox.bottom;
	var vSize = goog.dom.getViewportSize();
	var oSize = goog.style.getSize(outEl);
	var oA = new goog.fx.dom.Slide(outEl, [0, 0], [0, vSize.height], 500, goog.fx.easing.easeOut);
	var toAbs = function(e) {
		goog.style.setStyle(e.target.element, {
			'display' : 'block',
			'position' : 'absolute'
		});
	}
	var toBlk = function(e) {
		e.target.element.style.cssText = '';
	}
	goog.events.listen(oA, goog.fx.Transition.EventType.BEGIN, toAbs)
	goog.events.listen(oA, goog.fx.Transition.EventType.END, function(e) {
		e.target.element.style.cssText = 'display: none;';
	});
	var iA = new goog.fx.dom.Slide(inEl, [0, vSize.height * -1], [0, 0], 500, goog.fx.easing.easeOut);
	goog.events.listen(iA, goog.fx.Transition.EventType.BEGIN, toAbs);
	goog.events.listen(iA, goog.fx.Transition.EventType.END, toBlk);
	oA.play();
	iA.play();
};
// for debug.
org.koshinuke.listenAll = function(src, types) {
	if(goog.DEBUG) {
		goog.object.forEach(types, function(type) {
			goog.events.listen(src, type, goog.bind(console.log, console, type));
		});
	}
};

org.koshinuke.cutoffMessage = function(maxbytes, msg) {
	var bytes = 0;
	var length = msg.length;
	var i = 0;
	for(; i < length; i++) {
		var c = goog.string.escapeChar(msg.charAt(i));
		bytes += c.length < 4 ? 1 : 2;
		if(maxbytes < bytes) {
			break;
		}
	}
	return msg.substring(0, i);
};
