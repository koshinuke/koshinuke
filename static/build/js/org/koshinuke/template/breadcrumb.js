// This file was automatically generated from breadcrumb.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.breadcrumb');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.breadcrumb.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var eList14 = opt_data.list;
  var eListLen14 = eList14.length;
  for (var eIndex14 = 0; eIndex14 < eListLen14; eIndex14++) {
    var eData14 = eList14[eIndex14];
    output.append('<li>', soy.$$escapeHtml(eData14), '</li>', (! (eIndex14 == eListLen14 - 1)) ? '<li class="sep"></li>' : '');
  }
  return opt_sb ? '' : output.toString();
};
