goog.provide('org.koshinuke.model.HistoriesFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');

goog.require('org.koshinuke');
goog.require('org.koshinuke.model.AbstractFacade');

/** @constructor */
org.koshinuke.model.HistoriesFacade = function(uri) {
	org.koshinuke.model.AbstractFacade.call(this, uri);
};
goog.inherits(org.koshinuke.model.HistoriesFacade, org.koshinuke.model.AbstractFacade);

org.koshinuke.model.HistoriesFacade.prototype.load = function(model, fn) {
	goog.net.XhrIo.send(this.toRequestUri(model.path + "/history"), function(e) {
		var raw = e.target.getResponseJson();
		var dtf = new goog.i18n.DateTimeFormat('MM/dd');
		var histories = goog.array.reduce(raw, function(r, v) {
			var m = {
				name : v['name'],
				path : v['path'],
				timestamp : org.koshinuke.toDateString(v['timestamp']),
				author : v['author'],
				message : v['message'],
				activities : goog.array.reduce(v['activities'], function(cs, a) {
					// externs/BranchActivity に引き渡す為、圧縮されない様にメンバ定義する。
					cs.push({
						'label' : dtf.format(org.koshinuke.toDate(a[0])),
						'values' : a[1]
					});
					return cs;
				}, [])
			};
			r.push(m);
			return r;
		}, []);
		goog.array.sort(histories, function(l, r) {
			return goog.array.defaultCompare(r.timestamp, l.timestamp);
		});
		fn(histories);
	}, null, org.koshinuke.model.AbstractFacade.Headers);
};
