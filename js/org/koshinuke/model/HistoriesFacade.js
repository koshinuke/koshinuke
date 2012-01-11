goog.provide('org.koshinuke.model.HistoriesFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');
goog.require('goog.string');

goog.require('org.koshinuke');

/** @constructor */
org.koshinuke.model.HistoriesFacade = function(uri) {
	this.uri = uri;
};

org.koshinuke.model.HistoriesFacade.prototype.toRequestUri = function(model) {
	// TODO for mockup
	console.log('HistoriesFacade', model);
	//return this.uri.resolve(new goog.Uri('/koshinuke/stub/histories.json'));
	return this.uri.resolve(new goog.Uri("/" + model.path + "/history"));
};

org.koshinuke.model.HistoriesFacade.prototype.load = function(model, fn) {
	goog.net.XhrIo.send(this.toRequestUri(model), goog.partial(this.handleResponse_, model, fn));
};
/** @private */
org.koshinuke.model.HistoriesFacade.prototype.handleResponse_ = function(model, fn, e) {
	var raw = e.target.getResponseJson();
	var dtf = new goog.i18n.DateTimeFormat('MM/dd');
	var histories = goog.array.reduce(raw, function(r, v) {
		var m = {
			name : goog.string.urlDecode(v['name']),
			path : goog.string.urlDecode(v['path']),
			timestamp : org.koshinuke.toDateString(v['timestamp']),
			author : goog.string.urlDecode(v['author']),
			message : goog.string.urlDecode(v['message']),
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
		return goog.array.defaultCompare(l.timestamp, r.timestamp);
	});
	fn(histories);
};
