goog.provide('org.koshinuke.main');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.dom.ViewportSizeMonitor');

goog.require('goog.async.Delay');
goog.require('goog.fs.FileReader');
goog.require('goog.events.FileDropHandler');

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
	ZeroClipboard.setMoviePath('static/flash/ZeroClipboard.swf');

	goog.array.forEach(goog.dom.query('.nav'), function(root) {
		var tabbar = new goog.ui.TabBar();
		tabbar.decorate(root);
		tabbar.setSelectedTabIndex(0);
		var outer = goog.dom.query('.outer')[0];
		var admin = goog.dom.query('.admin')[0];
		var newrepo = goog.dom.query('.newrepo')[0];
		var f = goog.dom.query('footer')[0];
		goog.events.listen(tabbar, goog.ui.Component.EventType.SELECT, function(e) {
			var el = e.target.getElement();
			if(goog.dom.classes.has(el, 'admin-tab')) {
				var out;
				if(goog.style.isElementShown(outer)) {
					out = outer;
				} else {
					out = newrepo;
				}
				org.koshinuke.slideElements(out, admin, f);
			} else {
				if(goog.style.isElementShown(admin)) {
					org.koshinuke.slideElements(admin, outer, f);
				}
			}
		});
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
		PubSub.subscribe(PubSub.REPO_LIST_RECEIVED, function(json) {
			tabbar.removeChildren(true);
			goog.array.forEach(json, function(a) {
				var r = new org.koshinuke.ui.Repository();
				r.setJson(a);
				tabbar.addChild(r, true);
			});
			tabbar.setSelectedTabIndex(0);
			tabbar.getSelectedTab().setSelectedTabIndex(0);
		});
		var rl = new org.koshinuke.model.RepositoryFacade(uri);
		rl.load();
		goog.events.listen(tabbar, org.koshinuke.ui.Repository.EventType.REPO_CONTEXT_SELECTED, function(e) {
			var t = e.target;
			PubSub.publish(PubSub.REPO_SELECT, {
				context : e.context,
				label : e.label,
				user : goog.dom.forms.getValue(goog.dom.getElement('un')),
				host : t.host,
				path : t.path,
				name : t.name,
				branches : t.branches,
				tags : t.tags
			});
		});
	});
	var action = function(el, fn) {
		var b = new goog.ui.Button();
		b.decorate(el);
		goog.events.listen(b, goog.ui.Component.EventType.ACTION, function(e) {
			fn(e);
		});
		return b;
	};
	action(goog.dom.query('button.new-repo')[0], function(e) {
		org.koshinuke.slideElements(goog.dom.query('.outer')[0], goog.dom.query('.newrepo')[0], goog.dom.query('footer')[0]);
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

		goog.array.forEach(goog.dom.query('.newrepo form.main'), function(el) {
			goog.events.listen(el, goog.events.EventType.SUBMIT, function(e) {
				e.preventDefault();
			});
		});
		goog.array.forEach(goog.dom.query('.newrepo .cancel'), function(el) {
			action(el, function(e) {
				org.koshinuke.slideElements(goog.dom.query('.newrepo')[0], goog.dom.query('.outer')[0], goog.dom.query('footer')[0]);
			});
		});
		var initBtn = action(goog.dom.query('.newrepo .init')[0], function(e) {
			var c = e.target;
			if(c.isEnabled()) {
				c.setEnabled(false);
				var facade = new org.koshinuke.model.RepositoryFacade(uri);
				facade.init(goog.dom.query(".init-repo form.main")[0])
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
		var rr = goog.dom.getElement('repo-readme');
		goog.events.listen(new goog.events.FileDropHandler(rr, true), goog.events.FileDropHandler.EventType.DROP, function(e) {
			goog.array.forEach(e.getBrowserEvent().dataTransfer.files, function(f) {
				goog.fs.FileReader.readAsText(f, 'UTF-8').addCallback(function(txt) {
					var stb = new soy.StringBuilder();
					stb.append(goog.dom.forms.getValue(rr));
					stb.append('\n');
					stb.append(txt);
					goog.dom.forms.setValue(rr, stb.toString());
				});
			});
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
			// TODO SSHのURIは通らない。通った所で、通信の為の鍵どうする？
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
	goog.array.forEach(goog.dom.query('.admin .goog-tab-bar'), function(root) {
		var tabbar = new goog.ui.TabBar();
		tabbar.decorate(root);
		var con = goog.dom.query('.admin .img-container')[0];
		var filesfn = function(files) {
			goog.array.forEach(files, function(f) {
				goog.fs.FileReader.readAsDataUrl(f).addCallbacks(function(dataUrl) {
					var fc = con.firstChild;
					if(fc.nodeType == goog.dom.NodeType.TEXT) {
						goog.dom.removeNode(fc);
					}
					goog.dom.appendChild(con, goog.dom.createDom('div', 'img-radio-pair', goog.dom.createDom('input', {
						'type' : 'radio',
						'name' : 'uar',
						'value' : dataUrl
					}), goog.dom.createDom('img', {
						'class' : 'small',
						'title' : 'small icon',
						'src' : dataUrl
					}), goog.dom.createDom('img', {
						'class' : 'large',
						'title' : 'large icon',
						'src' : dataUrl
					})));
				}, function(error) {
					console.log("ERROR", error);
				});
			});
		};
		goog.events.listen(con, goog.events.EventType.CLICK, function(e) {
			var el = e.target;
			if(el.tagName == 'INPUT' && el['name'] == 'uar') {
				goog.array.forEach(goog.dom.query('.admin .img-container .img-radio-pair'), function(a) {
					goog.dom.classes.remove(a, 'active');
				});
				goog.dom.classes.add(el.parentNode, 'active');
			}
		});
		goog.events.listen(goog.dom.getElement('user-avatar'), goog.events.EventType.CHANGE, function(e) {
			filesfn(e.target.files);
		});
		var fdh = new goog.events.FileDropHandler(goog.dom.query('.input-images')[0], true);
		goog.events.listen(fdh, goog.events.FileDropHandler.EventType.DROP, function(e) {
			filesfn(e.getBrowserEvent().dataTransfer.files);
		});
		var updatep = action(goog.dom.query('.admin .updatep')[0], function(e) {
			var c = e.target;
			if(c.isEnabled()) {
				c.setEnabled(false);
				var un = goog.dom.forms.getValue(goog.dom.getElement('user-name'));
				var img;
				var rdo = goog.dom.query('.admin .img-container .img-radio-pair.active input[type="radio"]')[0];
				if(rdo) {
					img = goog.dom.forms.getValue(rdo);
				}
				var key = goog.dom.forms.getValue(goog.dom.getElement('ssh-key'));
				// TODO submit…
				console.log(un, img, key);
			}
		});
	});
});
