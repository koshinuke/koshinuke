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
	});
	var contextHandler = function(repo, li, is) {
		if(is) {
			org.koshinuke.PubSub.publish(org.koshinuke.PubSub.REPO_SELECTION, repo, li);
		}
	}
	org.koshinuke.PubSub.subscribe(org.koshinuke.PubSub.REPO_SELECTION, function(repo, li) {
		console.log(repo);
		console.log(li);
	});
	goog.array.forEach(goog.dom.query('.repo-list'), function(root) {
		var list = new org.koshinuke.ui.RepoList(contextHandler);
		list.decorate(root);
		list.setSelectedIndex(0, 0);
	});

});
