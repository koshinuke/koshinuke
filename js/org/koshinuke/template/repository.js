// This file was automatically generated from repository.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.repository');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.repository.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="repository"><div class="repo-name">', soy.$$escapeHtml(opt_data.name), '</div><div class="repo-context"><div context="$$b" class="branches">Branch</div><div context="$$t" class="tags">Tags</div><div context="$$h" class="histories">Histories</div><div context="$$g" class="graph">Graph</div></div></div>');
  return opt_sb ? '' : output.toString();
};
