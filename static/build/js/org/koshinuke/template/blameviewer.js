// This file was automatically generated from blameviewer.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.blameviewer');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.blameviewer.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="blame metadata"><div class="commit">', soy.$$truncate(soy.$$escapeHtml(opt_data.commit), 10, false), '</div><div class="user">', soy.$$escapeHtml(opt_data.author), '</div><div class="calendar">', soy.$$escapeHtml(opt_data.timestamp), '</div><div class="comment">', soy.$$escapeHtml(opt_data.message), '</div></div>');
  return opt_sb ? '' : output.toString();
};
