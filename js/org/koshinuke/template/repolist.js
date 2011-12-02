// This file was automatically generated from repolist.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.repolist');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.repolist.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t');
  var eList4 = opt_data.list;
  var eListLen4 = eList4.length;
  for (var eIndex4 = 0; eIndex4 < eListLen4; eIndex4++) {
    var eData4 = eList4[eIndex4];
    output.append('<div class="repository ', (eIndex4 == 0) ? 'top' : (eIndex4 == eListLen4 - 1) ? 'bottom' : '', '"><div class="repo-name">', soy.$$escapeHtml(eData4), '</div><ul class="repo-context"><li context="b">Branch</li><li context="t">Tags</li><li context="h">Histories</li><li context="g">Graph</li></ul></div>');
  }
  return opt_sb ? '' : output.toString();
};
