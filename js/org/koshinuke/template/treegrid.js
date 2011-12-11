// This file was automatically generated from treegrid.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.treegrid');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.treegrid.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var eList3 = opt_data.list;
  var eListLen3 = eList3.length;
  for (var eIndex3 = 0; eIndex3 < eListLen3; eIndex3++) {
    var eData3 = eList3[eIndex3];
    org.koshinuke.template.treegrid.row(eData3, output);
  }
  return opt_sb ? '' : output.toString();
};


org.koshinuke.template.treegrid.row = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<tr path="', soy.$$escapeHtml(opt_data.path), '"><td', (0 < opt_data.indent) ? ' style="padding-left: ' + opt_data.indent + 'px;"' : '', '><span class="collapse"></span><span class="', soy.$$escapeHtml(opt_data.icon), '">', soy.$$escapeHtml(opt_data.name), '</span></td><td>', soy.$$escapeHtml(opt_data.timestamp), '</td><td><span>', soy.$$escapeHtml(opt_data.message), '</span></td><td><span>', soy.$$escapeHtml(opt_data.auther), '</span></td></tr>');
  return opt_sb ? '' : output.toString();
};
