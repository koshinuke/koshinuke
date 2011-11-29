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
goog.require('org.koshinuke.ui.RepoUrls');

goog.exportSymbol('main', function() {
	goog.array.forEach(goog.dom.query('.repo-urls'), function(root) {
		var ru = new org.koshinuke.ui.RepoUrls();
		ru.decorate(root);
		ru.setSelectedIndex(0);
	});
});
