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
		var un = goog.dom.forms.getValueByName(form, 'u');
		var up = goog.dom.forms.getValueByName(form, 'p');
		var rm = goog.dom.forms.getValueByName(form, 'r');
		if(un && up) {
			form.submit();
		} else {
			goog.array.forEach(goog.dom.query('.input-pair', form), function(a) {
				goog.dom.classes.add(a, 'error');
			});
		}
	}, false);
});
