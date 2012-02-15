// This file was automatically generated from breadcrumb.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.breadcrumb');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.breadcrumb.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var eList35 = opt_data.list;
  var eListLen35 = eList35.length;
  for (var eIndex35 = 0; eIndex35 < eListLen35; eIndex35++) {
    var eData35 = eList35[eIndex35];
    output.append('<li>', soy.$$escapeHtml(eData35), '</li>', (! (eIndex35 == eListLen35 - 1)) ? '<li class="sep"></li>' : '');
  }
  return opt_sb ? '' : output.toString();
};
