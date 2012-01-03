goog.provide('org.koshinuke.main');

goog.require('goog.array');
goog.require('goog.async.Delay');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.dom.ViewportSizeMonitor');

goog.require('goog.fx');
goog.require('goog.fx.dom');

goog.require('goog.ui.Button');
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

	goog.array.forEach(goog.dom.query('.outer .goog-tab-bar'), function(root) {
		var tabbar = new org.koshinuke.ui.PaneTabBar(goog.dom.getNextElementSibling(root), uri);
		tabbar.decorate(root);
		PubSub.subscribe(PubSub.REPO_SELECT, tabbar.addTab, tabbar);
		PubSub.subscribe(PubSub.RESOURCE_SELECT, tabbar.addTab, tabbar);
		PubSub.subscribe(PubSub.BRANCH_SELECT, tabbar.addTab, tabbar);
		PubSub.subscribe(PubSub.COMMIT_SELECT, tabbar.addTab, tabbar);
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
	function slideElements(outEl, inEl, footer) {
		var iSize = goog.style.getSize(inEl);
		var imBox = goog.style.getMarginBox(inEl);
		var bottom = iSize.height + imBox.top + imBox.bottom;
		var vSize = goog.style.getSize(goog.style.getClientViewportElement());
		var oSize = goog.style.getSize(outEl);
		var oA = new goog.fx.dom.Slide(outEl, [0, 0], [oSize.width * -1, 0], 500, goog.fx.easing.easeOut);
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
			var comeBack = new goog.fx.dom.Slide(footer, [0, vSize.height], [0, bottom], 500);
			goog.events.listen(comeBack, goog.fx.Transition.EventType.END, toBlk);
			comeBack.play();
		});
		var iA = new goog.fx.dom.Slide(inEl, [oSize.width, 0], [0, 0], 500, goog.fx.easing.easeOut);
		goog.events.listen(iA, goog.fx.Transition.EventType.BEGIN, toAbs);
		goog.events.listen(iA, goog.fx.Transition.EventType.END, toBlk);
		var getOut = new goog.fx.dom.Slide(footer, [0, 0], [0, vSize.height], 500, goog.fx.easing.easeOut);
		goog.events.listen(getOut, goog.fx.Transition.EventType.BEGIN, toAbs);
		getOut.play();
		oA.play();
		iA.play();
	}


	goog.array.forEach(goog.dom.query('button.new-repo'), function(root) {
		var b = new goog.ui.Button();
		b.decorate(root);
		goog.events.listen(b, goog.ui.Component.EventType.ACTION, function(e) {
			var outer = goog.dom.query('.outer')[0];
			var newrepo = goog.dom.query('.newrepo')[0];
			var f = goog.dom.query('footer')[0];
			slideElements(outer, newrepo, f);
		});
	});

	goog.array.forEach(goog.dom.query('.newrepo .goog-tab-bar'), function(root) {
		var tabbar = new goog.ui.TabBar();
		tabbar.decorate(root);
		var panes = goog.dom.query('.newrepo .tabpane .pane');
		goog.events.listen(tabbar, goog.ui.Component.EventType.SELECT, function(e) {
			var idx = tabbar.indexOfChild(e.target);
			if(-1 < idx) {
				goog.style.showElement(panes[idx], true);
			}
		});
		goog.events.listen(tabbar, goog.ui.Component.EventType.UNSELECT, function(e) {
			var idx = tabbar.indexOfChild(e.target);
			if(-1 < idx) {
				goog.style.showElement(panes[idx], false);
			}
		});
		tabbar.setSelectedTabIndex(0);
		var action = function(el, fn) {
			var b = new goog.ui.Button();
			b.decorate(el);
			goog.events.listen(b, goog.ui.Component.EventType.ACTION, fn);
			return b;
		}

		goog.array.forEach(goog.dom.query('.newrepo .cancel'), function(el) {
			action(el, function(e) {
				var outer = goog.dom.query('.outer')[0];
				var newrepo = goog.dom.query('.newrepo')[0];
				var f = goog.dom.query('footer')[0];
				slideElements(newrepo, outer, f);
			});
		});
		var initBtn = action(goog.dom.query('.newrepo .init')[0], function(e) {
			var c = e.target;
			if(c.isEnabled()) {
				c.setEnabled(false);
				var name = goog.dom.forms.getValue(goog.dom.getElement('repo-name'));
				var readme = goog.dom.forms.getValue(goog.dom.getElement('repo-readme'));
				// TODO submit...
				console.log(name, readme);
			}
		});
		goog.events.listen(goog.dom.getElement('repo-name'), goog.events.EventType.INPUT, function(e) {
			var v = goog.dom.forms.getValue(e.target);
			var p = e.target.parentNode;
			var msg = goog.dom.query('.help-inline', p)[0];
			if(v && 0 < v.length) {
				if(v.match(/^[^@'"<>:\*\?\\\(\)\s]+$/i)) {
					var ary = v.split('/');
					if(ary.length < 3) {
						goog.dom.classes.remove(p, 'error');
						goog.dom.setTextContent(msg, '');
						initBtn.setEnabled(true);
						return;
					} else {
						goog.dom.classes.add(p, 'error');
						goog.dom.setTextContent(msg, 'name must contains 1 or less path separator.');
					}
				} else {
					goog.dom.classes.add(p, 'error');
					goog.dom.setTextContent(msg, 'name contains invalid charactors');
				}
			}
			initBtn.setEnabled(false);
		});
		var cloneBtn = action(goog.dom.query('.newrepo .clone')[0], function(e) {
			var c = e.target;
			if(c.isEnabled()) {
				c.setEnabled(false);
				var ur = goog.dom.forms.getValue(goog.dom.getElement('repo-uri'));
				var un = goog.dom.forms.getValue(goog.dom.getElement('repo-username'));
				var ps = goog.dom.forms.getValue(goog.dom.getElement('repo-pass'));
				// TODO submit...
				console.log(ur, un, ps);
			}
		});
		goog.events.listen(goog.dom.getElement('repo-uri'), goog.events.EventType.INPUT, function(e) {
			// TODO SSHのURLは通らない。
			var v = goog.dom.forms.getValue(e.target);
			var p = e.target.parentNode;
			var msg = goog.dom.query('.help-inline', p)[0];
			if(v && 0 < v.length) {
				var ru = goog.Uri.parse(v);
				if(ru.hasDomain()) {
					if(ru.hasPath()) {
						goog.dom.classes.remove(p, 'error');
						goog.dom.setTextContent(msg, '');
						cloneBtn.setEnabled(true);
					} else {
						goog.dom.classes.add(p, 'error');
						goog.dom.setTextContent(msg, 'uri must contains path');
					}
				} else {
					goog.dom.classes.add(p, 'error');
					goog.dom.setTextContent(msg, 'uri must contains host.');
				}
			}
			cloneBtn.setEnabled(false);
		});
	});
});
