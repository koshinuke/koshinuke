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
goog.require('org.koshinuke.ui.RepoList');
goog.require('org.koshinuke.ui.RepoUrls');

goog.exportSymbol('main', function() {
	goog.array.forEach(goog.dom.query('.repo-urls'), function(root) {
		var ru = new org.koshinuke.ui.RepoUrls();
		ru.decorate(root);
		ru.setSelectedIndex(0);
		var f = function(repomodel) {
			ru.setModel(repomodel);
		};
		org.koshinuke.PubSub.subscribe(org.koshinuke.PubSub.REPO_SELECTION, f);
		org.koshinuke.PubSub.subscribe(org.koshinuke.PubSub.TAB_SELECTION, f);
	});

	goog.array.forEach(goog.dom.query('.breadcrumbs'), function(root) {
		var b = new org.koshinuke.ui.Breadcrumb(function(ary) {
			console.log(ary);
		});
		b.decorate(root);
		org.koshinuke.PubSub.subscribe(org.koshinuke.PubSub.TAB_SELECTION, function(repomodel) {
			var ary = [repomodel.label];
			b.setModel(ary);
		});
	});
	function findTabIcon(key) {
		return {
		$$b : 'branches',
		$$t : 'tags',
		$$h : 'histories',
		$$g : 'graph'
		}[key] || 'txt';
	}


	goog.array.forEach(goog.dom.query('.goog-tab-bar'), function(root) {
		var tabbar = new goog.ui.TabBar();
		tabbar.decorate(root);
		tabbar.tabmap = {};
		org.koshinuke.PubSub.subscribe(org.koshinuke.PubSub.REPO_SELECTION, function(repomodel) {
			var rm = repomodel;
			var label = " " + rm.name;
			var hash = org.koshinuke.hash(rm.host, rm.path, rm.name, rm.context);
			var tab = tabbar.tabmap[hash];
			if(!tab) {
				tab = new goog.ui.Tab(label);
				tab.rm = rm;
				tabbar.addChild(tab, true);
				tabbar.tabmap[hash] = tab;
				var el = tab.getElement();
				goog.dom.classes.add(el, findTabIcon(rm.context));
			}
			tabbar.setSelectedTab(tab);
		});
		goog.events.listen(tabbar, goog.ui.Component.EventType.SELECT, function(e) {
			var el = e.target.getElement();
			var next = el.getAttribute('for');
			org.koshinuke.PubSub.publish(org.koshinuke.PubSub.TAB_SELECTION, e.target.rm);
		});
	});

	goog.array.forEach(goog.dom.query('.repo-list'), function(root) {
		var list = new org.koshinuke.ui.RepoList(function(repo, li, is) {
			if(is) {
				org.koshinuke.PubSub.publish(org.koshinuke.PubSub.REPO_SELECTION, (function() {
					var name = goog.dom.query('.repo-name', repo)[0];
					return {
						user : 'taichi', // from cookie ?
						host : repo.getAttribute('host'),
						path : repo.getAttribute('path'),
						name : goog.dom.getTextContent(name).trim(),
						context : li.getAttribute('context'),
						label : goog.dom.getTextContent(li)
					};
				})());
			}
		});
		list.decorate(root);
		list.setSelectedIndex(0, 0);
	});
});
