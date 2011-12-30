goog.provide('org.koshinuke.main');

goog.require('goog.array');
goog.require('goog.async.Delay');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.dom.ViewportSizeMonitor');

goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.TabBar');
goog.require('goog.ui.IdGenerator');

goog.require('ZeroClipboard');

goog.require('org.koshinuke');
goog.require('org.koshinuke.model.RepositoryFacade');

goog.require('org.koshinuke.ui.Breadcrumb');
goog.require('org.koshinuke.ui.Repository');
goog.require('org.koshinuke.ui.RepoUrls');
goog.require('org.koshinuke.ui.PaneTabBar');

goog.exportSymbol('main', function() {
	var PubSub = org.koshinuke.PubSub;
	var uri = new goog.Uri(window.location.href);
	ZeroClipboard.setMoviePath('flash/ZeroClipboard.swf');

	goog.array.forEach(goog.dom.query('.nav'), function(root) {
		var tabbar = new goog.ui.TabBar();
		tabbar.decorate(root);
		tabbar.setSelectedTabIndex(0);
	});

	goog.array.forEach(goog.dom.query('.repo-urls'), function(root) {
		var ru = new org.koshinuke.ui.RepoUrls();
		ru.decorate(root);
		ru.setSelectedIndex(0);
		PubSub.subscribe(PubSub.REPO_SELECT, ru.setModel, ru);
		PubSub.subscribe(PubSub.TAB_SELECT, ru.setModel, ru);
	});

	goog.array.forEach(goog.dom.query('.breadcrumbs'), function(root) {
		var b = new org.koshinuke.ui.Breadcrumb(function(ary) {
			console.log(ary);
		});
		b.decorate(root);
		PubSub.subscribe(PubSub.TAB_SELECT, function(rm) {
			var ary = goog.array.flatten(rm.name, rm.label);
			b.setModel(ary);
		});
		PubSub.subscribe(PubSub.TAB_UNSELECT, function(rm) {
			b.setModel([]);
		});
	});

	goog.array.forEach(goog.dom.query('.tab-container .goog-tab-bar'), function(root) {
		var tabbar = new org.koshinuke.ui.PaneTabBar(goog.dom.query('.tabpane')[0], uri);
		tabbar.decorate(root);
		PubSub.subscribe(PubSub.REPO_SELECT, tabbar.addTab, tabbar);
		PubSub.subscribe(PubSub.RESOURCE_SELECT, tabbar.addTab, tabbar);
		PubSub.subscribe(PubSub.BRANCH_SELECT, tabbar.addTab, tabbar);
		goog.events.listen(tabbar, goog.ui.Component.EventType.SELECT, function(e) {
			PubSub.publish(PubSub.TAB_SELECT, e.target.getModel());
		});
		goog.events.listen(tabbar, goog.ui.Component.EventType.UNSELECT, function(e) {
			PubSub.publish(PubSub.TAB_UNSELECT, e.target.getModel());
		});
	});

	goog.array.forEach(goog.dom.query('.repo-list'), function(root) {
		var tabbar = new goog.ui.TabBar(goog.ui.TabBar.Location.START);
		tabbar.decorate(root);
		var rl = new org.koshinuke.model.RepositoryFacade(uri);
		rl.load(function(repo) {
			tabbar.addChild(repo, true);
		}, function() {
			tabbar.setSelectedTabIndex(0);
			tabbar.getSelectedTab().setSelectedTabIndex(0);
		});
		goog.events.listen(tabbar, org.koshinuke.ui.Repository.EventType.REPO_CONTEXT_SELECTED, function(e) {
			var t = e.target;
			PubSub.publish(PubSub.REPO_SELECT, {
				context : e.context,
				label : e.label,
				user : "taichi", // TODO from cookie?
				host : t.host,
				path : t.path,
				name : t.name,
				branches : t.branches,
				tags : t.tags
			});
		});
	});
});
