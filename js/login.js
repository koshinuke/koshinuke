goog.provide('org.koshinuke.login');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.forms');
goog.require('goog.dom.query');
goog.require('goog.events');

goog.exportSymbol('login', function() {
	var form = goog.dom.query('.main .login.form')[0];
	goog.events.listen(form, goog.events.EventType.SUBMIT, function(e) {
		e.preventDefault();
		var un = goog.dom.forms.getValueByName(form, 'user-name');
		var up = goog.dom.forms.getValueByName(form, 'user-pass');
		var rm = goog.dom.forms.getValueByName(form, 'remember');
		console.log(un, up, rm);
		if(un && up) {
			window.location.href = 'repos.html';
		} else {
			goog.array.forEach(goog.dom.query('.input-pair', form), function(a) {
				goog.dom.classes.add(a, 'error');
			});
		}
	}, false);
});
