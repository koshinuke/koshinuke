// This file was automatically generated from commits.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.commits');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.commits.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="commit"><div class="author"><img class="thumb large ', soy.$$escapeHtml(opt_data.author), '"/><span class="name">', soy.$$escapeHtml(opt_data.author), '</span></div><div class="message"><span>', soy.$$escapeHtml(opt_data.message), '</span></div><div class="meta"><span class="timestamp">', soy.$$escapeHtml(opt_data.timestamp), '</span><button class="commitid"><img class="', (opt_data.parent.length < 2) ? 'normal' : 'merge', '"/>', soy.$$truncate(soy.$$escapeHtml(opt_data.commit), 10, true), '</button></div></div>');
  return opt_sb ? '' : output.toString();
};
