// This file was automatically generated from treegrid.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.treegrid');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.treegrid.table = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table class="treegrid"><thead><tr><th class="name">name</th><th class="user">author</th><th class="pasttime">past time</th><th class="message">message</th></tr></thead></table>');
  return opt_sb ? '' : output.toString();
};


org.koshinuke.template.treegrid.row = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<tr class="row"', (opt_data.visible == false) ? ' style="display: none;"' : '', '><td class="name" ', (0 < opt_data.indent) ? ' style="padding-left: ' + opt_data.indent + 'px;"' : '', '><span', (0 < opt_data.hasChild) ? ' class="' + soy.$$escapeHtml(opt_data.state) + '"' : '', '></span><span class="', soy.$$escapeHtml(opt_data.icon), ' path">', soy.$$escapeHtml(opt_data.name), '</span></td><td class="user"><img class="small ', soy.$$escapeHtml(opt_data.author), '"/><span class="author">', soy.$$escapeHtml(opt_data.author), '</span></td><td class="pasttime"><span class="calendar">', soy.$$escapeHtml(opt_data.timestamp), '<span></td><td class="message"><span class="comment"', (opt_data.message != opt_data.shortmessage) ? ' title="' + soy.$$escapeHtml(opt_data.message) + '"' : '', '>', soy.$$escapeHtml(opt_data.shortmessage), '</span></td></tr>');
  return opt_sb ? '' : output.toString();
};


org.koshinuke.template.treegrid.psuedo = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<tr path="', soy.$$escapeHtml(opt_data.path), '"><td', (0 < opt_data.indent) ? ' style="padding-left: ' + opt_data.indent + 'px;"' : '', ' colspan="4"></div><span class=""></span><span class="loading">Loading ...</span></td></tr>');
  return opt_sb ? '' : output.toString();
};
