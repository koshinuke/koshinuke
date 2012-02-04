// This file was automatically generated from branchactivity.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.branchactivity');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.branchactivity.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="branch-container"><div class="metadata"><div class="branch">', soy.$$escapeHtml(opt_data.name), '</div><div class="user">', soy.$$escapeHtml(opt_data.author), '</div><div class="calendar">', soy.$$escapeHtml(opt_data.timestamp), '</div><div class="comment">', soy.$$escapeHtml(opt_data.message), '</div></div></div>');
  return opt_sb ? '' : output.toString();
};
