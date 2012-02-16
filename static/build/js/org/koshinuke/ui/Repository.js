goog.provide('org.koshinuke.ui.Repository');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.events');

goog.require('goog.ui.Tab');

goog.require('org.koshinuke.ui.TreeGrid');
goog.require('org.koshinuke.ui.TreeGrid.Node');
goog.require('org.koshinuke.ui.PaneTab.Factory');
goog.require('org.koshinuke.ui.RepositoryRenderer');

/** @constructor */
org.koshinuke.ui.Repository = function(opt_renderer, opt_domHelper) {
	goog.ui.Tab.call(this, null, opt_renderer || org.koshinuke.ui.RepositoryRenderer.getInstance(), opt_domHelper);
	this.tabbar = new goog.ui.TabBar(goog.ui.TabBar.Location.START);
};
goog.inherits(org.koshinuke.ui.Repository, goog.ui.Tab);

/** @enum {string} */
org.koshinuke.ui.Repository.EventType = {
	REPO_CONTEXT_SELECTED : "r.c.s"
};

org.koshinuke.ui.Repository.prototype.tabbar = false;
org.koshinuke.ui.Repository.prototype.host = "";
org.koshinuke.ui.Repository.prototype.path = "";
org.koshinuke.ui.Repository.prototype.name = "";

org.koshinuke.ui.Repository.prototype.setJson = function(json) {
	this.host = json['host'];
	this.path = json['path'];
	this.name = json['name'];
	var makeRoots = function(rawJson, type) {
		var roots = [];
		if(rawJson) {
			var set = new goog.structs.Set();
			var makePathArray = function(path) {
				var result = [];
				goog.array.reduce(path.split('/'), function(prev, now) {
					if(now) {
						if(prev) {
							prev = prev + '/' + now;
						} else {
							prev = now;
						}
						result.push({
							path: prev,
							name: now
						});
					}
					return prev;
				}, "");
				return result;
			};
			goog.array.forEach(rawJson, function(root) {
				goog.array.forEach(makePathArray(root['path']), function(a) {
					if(set.contains(a.path) == false) {
						set.add(a.path);
						var newone = goog.object.clone(root);
						newone['path'] = a.path;
						newone['name'] = a.name;
						newone['type'] = type;
						var n = org.koshinuke.ui.TreeGrid.Node.newFromJson(newone);
						n.icon = type;
						n.visible = true;
						roots.push(n);
					}
				});
			});
		}
		return roots;
	};
	this.branches = makeRoots(json['branches'], "branch");
	this.tags = makeRoots(json['tags'], "tag");
};
/** @override */
org.koshinuke.ui.Repository.prototype.enterDocument = function() {
	org.koshinuke.ui.Repository.superClass_.enterDocument.call(this);
	var element = goog.dom.query('.repo-context', this.getElement())[0];
	this.tabbar.decorate(element);
	var h = this.getHandler();
	h.listen(this.tabbar, goog.ui.Component.EventType.SELECT, function(e) {
		var el = e.target.getElement();
		var cls = goog.dom.classes.get(el);
		var ctx;
		if(goog.array.contains(cls, 'branches')) {
			ctx = org.koshinuke.ui.PaneTab.Factory.Branches;
		} else if(goog.array.contains(cls, 'tags')) {
			ctx = org.koshinuke.ui.PaneTab.Factory.Tags;
		} else if(goog.array.contains(cls, 'histories')) {
			ctx = org.koshinuke.ui.PaneTab.Factory.Histories;
		}
		this.dispatchEvent({
			type : org.koshinuke.ui.Repository.EventType.REPO_CONTEXT_SELECTED,
			context : ctx,
			label : goog.dom.getTextContent(el)
		});
	}, false, this);
};
/** @override */
org.koshinuke.ui.Repository.prototype.exitDocument = function() {
	org.koshinuke.ui.Repository.superClass_.exitDocument.call(this);
};
/** @override */
org.koshinuke.ui.Repository.prototype.disposeInternal = function() {
	org.koshinuke.ui.Repository.superClass_.disposeInternal.call(this);
	this.tabbar.dispose();
	this.tabbar = null;
};
org.koshinuke.ui.Repository.prototype.getSelectedTab = function() {
	return this.tabbar.getSelectedTab();
};
org.koshinuke.ui.Repository.prototype.setSelectedTabIndex = function(index) {
	this.tabbar.setSelectedTabIndex(index);
};
