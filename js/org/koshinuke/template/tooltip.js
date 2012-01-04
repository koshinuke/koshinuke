// This file was automatically generated from tooltip.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.tooltip');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.tooltip.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="tooltip ', soy.$$escapeHtml(opt_data.dir), '" style="display: none;"><div class="tooltip-arrow"></div><div class="tooltip-inner">', soy.$$escapeHtml(opt_data.txt), '</div></div>');
  return opt_sb ? '' : output.toString();
};
