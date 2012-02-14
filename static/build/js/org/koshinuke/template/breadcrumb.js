// This file was automatically generated from breadcrumb.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.breadcrumb');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.breadcrumb.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var eList37 = opt_data.list;
  var eListLen37 = eList37.length;
  for (var eIndex37 = 0; eIndex37 < eListLen37; eIndex37++) {
    var eData37 = eList37[eIndex37];
    output.append('<li>', soy.$$escapeHtml(eData37), '</li>', (! (eIndex37 == eListLen37 - 1)) ? '<li class="sep"></li>' : '');
  }
  return opt_sb ? '' : output.toString();
};
