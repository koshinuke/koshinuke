// This file was automatically generated from commits.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.commits');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.commits.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="commit"><div class="author"><img class="thumb large ', soy.$$escapeHtml(opt_data.author), '"/></div><div class="metadata"><div class="message">', soy.$$escapeHtml(opt_data.message), '</div><div class="commitdata"><span class="name">', soy.$$escapeHtml(opt_data.author), '</span>authored<span class="timestamp">', soy.$$escapeHtml(opt_data.timestamp), '</span></div></div></div>');
  return opt_sb ? '' : output.toString();
};
