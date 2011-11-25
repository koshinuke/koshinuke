goog.provide('org.koshinuke.positioning.GravityPosition');

goog.require('goog.positioning.AbstractPosition');


/**
 * @constructor
 * @extends {goog.positioning.AbstractPosition}
 */
org.koshinuke.positioning.GravityPosition = function(el, g, margin) {
	this.baseEl_ = el;
	this.gravity_ = g ? g : 'n';
	this.margin_ = margin ? margin : 0;
}

goog.inherits(org.koshinuke.positioning.GravityPosition, goog.positioning.AbstractPosition);

org.koshinuke.positioning.GravityPosition.prototype.reposition = function(element, popupCorner, opt_margin, opt_preferredSize) {
	var size = goog.style.getSize(this.baseEl_);
	var basePos = goog.style.getPosition(this.baseEl_);
	var pos = {
		left : basePos.x,
		top : basePos.y,
		height : size.height,
		width : size.width
	};
	var actualWidth = element.offsetWidth;
	actualHeight = element.offsetHeight;
	var gravity = this.gravity_;
	var tp;
	switch (gravity.charAt(0)) {
		case 'n':
			tp = {
				top : pos.top + pos.height + this.margin_,
				left : pos.left + pos.width / 2 - actualWidth / 2
			};
			break;
		case 's':
			tp = {
				top : pos.top - actualHeight - this.margin_,
				left : pos.left + pos.width / 2 - actualWidth / 2
			};
			break;
		case 'e':
			tp = {
				top : pos.top + pos.height / 2 - actualHeight / 2,
				left : pos.left - actualWidth - this.margin_
			};
			break;
		case 'w':
			tp = {
				top : pos.top + pos.height / 2 - actualHeight / 2,
				left : pos.left + pos.width + this.margin_
			};
			break;
	}
	goog.style.setPosition(element, tp.left, tp.top);
};
