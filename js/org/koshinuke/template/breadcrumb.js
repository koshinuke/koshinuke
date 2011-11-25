// This file was automatically generated from breadcrumb.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.breadcrumb');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.breadcrumb.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li><a href="', soy.$$escapeHtml(opt_data.href), '">', soy.$$escapeHtml(opt_data.view), '</a></li>');
  return opt_sb ? '' : output.toString();
};
