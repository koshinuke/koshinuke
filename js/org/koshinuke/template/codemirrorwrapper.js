// This file was automatically generated from codemirrorwrapper.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.codemirror');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.codemirror.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="CodeMirror-toolbox"><span class="clip-container"><span class="copy"></span></span><span class="log username">', soy.$$escapeHtml(opt_data.author), '</span><span class="log timestamp">', soy.$$escapeHtml(opt_data.timestamp), '</span><span class="log message">', soy.$$escapeHtml(opt_data.message), '</span><button class="history">history</button><button class="blame">blame</button><button class="edit">edit</button></div>');
  return opt_sb ? '' : output.toString();
};
