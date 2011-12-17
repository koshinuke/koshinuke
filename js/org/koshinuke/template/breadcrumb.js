// This file was automatically generated from breadcrumb.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.breadcrumb');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.breadcrumb.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var eList3 = opt_data.list;
  var eListLen3 = eList3.length;
  for (var eIndex3 = 0; eIndex3 < eListLen3; eIndex3++) {
    var eData3 = eList3[eIndex3];
    output.append('<li>', soy.$$escapeHtml(eData3), '</li>', (! (eIndex3 == eListLen3 - 1)) ? '<li class="sep"></li>' : '');
  }
  return opt_sb ? '' : output.toString();
};
