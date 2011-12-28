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
		PubSub.subscribe(PubSub.RESOURCE_SELECT, ru.setModel, ru);
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
		PubSub.subscribe(PubSub.RESOURCE_SELECT, function(m) {
			b.setModel(m.label);
		});
	});

	goog.array.forEach(goog.dom.query('.tab-container .goog-tab-bar'), function(root) {
		var tabbar = new org.koshinuke.ui.PaneTabBar(goog.dom.query('.tabpane')[0], uri);
		tabbar.decorate(root);
		PubSub.subscribe(PubSub.REPO_SELECT, tabbar.addTab, tabbar);
		PubSub.subscribe(PubSub.RESOURCE_SELECT, tabbar.addTab, tabbar);
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
	var json = {
		'color' : ["#CCC"],
		'values' : [{
			'label' : '11/16',
			'values' : 1
		}, {
			'label' : '11/17',
			'values' : 10
		}, {
			'label' : '11/18',
			'values' : 17
		}, {
			'label' : '11/19',
			'values' : 5
		}, {
			'label' : '11/20',
			'values' : 4
		}, {
			'label' : '11/21',
			'values' : 2
		}, {
			'label' : '11/22',
			'values' : 19
		}, {
			'label' : '11/23',
			'values' : 0
		}, {
			'label' : '11/24',
			'values' : 10
		}, {
			'label' : '11/25',
			'values' : 17
		}, {
			'label' : '11/26',
			'values' : 5
		}, {
			'label' : '11/27',
			'values' : 4
		}, {
			'label' : '11/28',
			'values' : 2
		}, {
			'label' : '11/29',
			'values' : 19
		}, {
			'label' : '11/30',
			'values' : 3
		}, {
			'label' : '12/01',
			'values' : 0
		}, {
			'label' : '12/02',
			'values' : 10
		}, {
			'label' : '12/03',
			'values' : 17
		}, {
			'label' : '12/04',
			'values' : 5
		}, {
			'label' : '12/05',
			'values' : 4
		}, {
			'label' : '12/06',
			'values' : 2
		}, {
			'label' : '12/07',
			'values' : 19
		}, {
			'label' : '12/08',
			'values' : 0
		}, {
			'label' : '12/09',
			'values' : 10
		}, {
			'label' : '12/10',
			'values' : 17
		}, {
			'label' : '12/11',
			'values' : 5
		}, {
			'label' : '12/05',
			'values' : 4
		}, {
			'label' : '12/06',
			'values' : 2
		}, {
			'label' : '12/07',
			'values' : 19
		}, {
			'label' : '12/08',
			'values' : 3
		}]

	};
	var vsm = new goog.dom.ViewportSizeMonitor();
	var idg = goog.ui.IdGenerator.getInstance();
	goog.array.forEach(goog.dom.query('.activity'), function(root) {
		if(goog.string.isEmptySafe(root.id)) {
			root.id = idg.getNextUniqueId();
		}

		var actHandle = renderBranchActivity(root, json);
		var action = function() {
			if(resizeGraph(actHandle, root.offsetWidth, root.offsetHeight) == false) {
				delay.start();
			}
		};
		var delay = new goog.async.Delay(action, 100);
		goog.events.listen(vsm, goog.events.EventType.RESIZE, action);
	});
});
