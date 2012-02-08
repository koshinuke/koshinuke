// This file was automatically generated from breadcrumb.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.breadcrumb');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.breadcrumb.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var eList38 = opt_data.list;
  var eListLen38 = eList38.length;
  for (var eIndex38 = 0; eIndex38 < eListLen38; eIndex38++) {
    var eData38 = eList38[eIndex38];
    output.append('<li>', soy.$$escapeHtml(eData38), '</li>', (! (eIndex38 == eListLen38 - 1)) ? '<li class="sep"></li>' : '');
  }
  return opt_sb ? '' : output.toString();
};
