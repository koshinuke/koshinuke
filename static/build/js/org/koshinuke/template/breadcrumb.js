// This file was automatically generated from breadcrumb.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.breadcrumb');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.breadcrumb.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var eList26 = opt_data.list;
  var eListLen26 = eList26.length;
  for (var eIndex26 = 0; eIndex26 < eListLen26; eIndex26++) {
    var eData26 = eList26[eIndex26];
    output.append('<li>', soy.$$escapeHtml(eData26), '</li>', (! (eIndex26 == eListLen26 - 1)) ? '<li class="sep"></li>' : '');
  }
  return opt_sb ? '' : output.toString();
};
