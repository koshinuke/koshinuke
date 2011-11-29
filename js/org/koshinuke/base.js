goog.provide('org.koshinuke');


org.koshinuke.activationHandler = function(item, isSelect) {
	var c = "active";
	if(isSelect) {
		goog.dom.classes.add(item, c);
	} else {
		goog.dom.classes.remove(item, c);
	}
}