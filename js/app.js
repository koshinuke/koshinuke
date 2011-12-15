goog.provide('org.koshinuke.main');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.json');
goog.require('goog.net.XhrIo');
goog.require('goog.object');
goog.require('goog.pubsub.PubSub');
goog.require('goog.positioning.Corner');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.Uri');

goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.IdGenerator');
goog.require('goog.ui.PopupMenu');
goog.require('goog.ui.SelectionModel');
goog.require('goog.ui.Tab');
goog.require('goog.ui.TabBar');
goog.require('goog.ui.TableSorter');

goog.require('CodeMirror');
goog.require('CodeMirror.modes');

goog.require('org.koshinuke');
goog.require('org.koshinuke.ui.Breadcrumb');
goog.require('org.koshinuke.ui.Repository');
goog.require('org.koshinuke.ui.RepoUrls');
goog.require('org.koshinuke.ui.RepoTabBar');
goog.require('org.koshinuke.ui.TreeGrid');
goog.require('org.koshinuke.ui.TreeGrid.Node');
goog.require('org.koshinuke.ui.TreeGrid.Leaf');
goog.require('org.koshinuke.ui.TreeGrid.Psuedo');
goog.require('org.koshinuke.ui.TreeGridLoader');

goog.exportSymbol('main', function() {
	var PubSub = org.koshinuke.PubSub;

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
			var ary = goog.array.flatten(rm.label);
			b.setModel(ary);
		});
		PubSub.subscribe(PubSub.TAB_UNSELECT, function(rm) {
			b.setModel([]);
		});
	});

	goog.array.forEach(goog.dom.query('.goog-tab-bar'), function(root) {
		var tabbar = new org.koshinuke.ui.RepoTabBar();
		tabbar.decorate(root);
		PubSub.subscribe(PubSub.REPO_SELECT, tabbar.addTab, tabbar);
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
		goog.array.forEach(["koshinuke", "koshinuke.py", "koshinuke.java"], function(a) {
			var r = new org.koshinuke.ui.Repository();
			r.name = a;
			tabbar.addChild(r, true);
		});
		goog.events.listen(tabbar, org.koshinuke.ui.Repository.EventType.REPO_CONTEXT_SELECTED, function(e) {
			var t = e.target;
			PubSub.publish(PubSub.REPO_SELECT, {
				context : e.context,
				label : e.label,
				user : "taichi",// TODO from cookie?
				host : t.host,
				path : t.path,
				name : t.name
			});
		});
		tabbar.setSelectedTabIndex(0);
		tabbar.getSelectedTab().setSelectedTabIndex(0);
	});

	goog.array.forEach(goog.dom.query('.treegrid'), function(el) {
		var uri = new goog.Uri(window.location.href);
		var loader = new org.koshinuke.ui.TreeGridLoader(uri.resolve(new goog.Uri('/')));
		var grid = new org.koshinuke.ui.TreeGrid(loader);
		grid.decorate(el);
		goog.array.forEach(["master", "release", "develop"], function(a) {
			var tgn = new org.koshinuke.ui.TreeGrid.Node();
			tgn.path = a;
			tgn.name = a;
			tgn.icon = "branch";
			tgn.visible = true;
			grid.addChild(tgn, true);
		});
	});
});
