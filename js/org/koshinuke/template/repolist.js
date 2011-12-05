// This file was automatically generated from repolist.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.repolist');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.repolist.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var eList3 = opt_data.list;
  var eListLen3 = eList3.length;
  for (var eIndex3 = 0; eIndex3 < eListLen3; eIndex3++) {
    var eData3 = eList3[eIndex3];
    output.append('<div class="repository ', (eIndex3 == 0) ? 'top' : (eIndex3 == eListLen3 - 1) ? 'bottom' : '', '" host="', soy.$$escapeHtml(eData3.host), '" path="', soy.$$escapeHtml(eData3.path), '"><div class="repo-name">', soy.$$escapeHtml(eData3.name), '</div><ul class="repo-context"><li context="b">Branch</li><li context="t">Tags</li><li context="h">Histories</li><li context="g">Graph</li></ul></div>');
  }
  return opt_sb ? '' : output.toString();
};
