// This file was automatically generated from breadcrumb.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.breadcrumb');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.breadcrumb.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var eList41 = opt_data.list;
  var eListLen41 = eList41.length;
  for (var eIndex41 = 0; eIndex41 < eListLen41; eIndex41++) {
    var eData41 = eList41[eIndex41];
    output.append('<li>', soy.$$escapeHtml(eData41), '</li>', (! (eIndex41 == eListLen41 - 1)) ? '<li class="sep"></li>' : '');
  }
  return opt_sb ? '' : output.toString();
};
