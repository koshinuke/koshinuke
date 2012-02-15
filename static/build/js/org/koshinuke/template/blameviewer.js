// This file was automatically generated from blameviewer.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.blameviewer');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.blameviewer.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<span class="commitdata"><span class="calendar">', soy.$$escapeHtml(opt_data.timestamp), '</span><span class="author"><img class="small ', soy.$$escapeHtml(opt_data.author), '"/>', soy.$$escapeHtml(opt_data.author), '</span></span><div class="message">', soy.$$escapeHtml(opt_data.message), '</div>');
  return opt_sb ? '' : output.toString();
};


org.koshinuke.template.blameviewer.token = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.style) ? '<span class="cm-' + soy.$$escapeHtml(opt_data.style) + '">' + soy.$$escapeHtml(opt_data.token) + '</span>' : soy.$$escapeHtml(opt_data.token));
  return opt_sb ? '' : output.toString();
};
