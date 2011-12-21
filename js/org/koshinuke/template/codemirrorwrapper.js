// This file was automatically generated from codemirrorwrapper.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.codemirror');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.codemirror.tmpl = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="CodeMirror-toolbox"><div class="tool-buttons"><span class="clip-container"><span class="copy"></span></span><button class="edit">edit</button><button class="drop" style="display: none;">drop edit</button><button class="commit" style="display: none;">commit</button><button class="blame">blame</button><button class="history">history</button><span class="log username user">', soy.$$escapeHtml(opt_data.author), '</span><span class="log timestamp calendar">', soy.$$escapeHtml(opt_data.timestamp), '</span><span class="log message comment">', soy.$$escapeHtml(opt_data.message), '</span></div><div class="commit-form"><textarea></textarea><div class="commit-buttons"><button class="cancel">cancel</button><button class="confirm">commit</button></div></div></div>');
  return opt_sb ? '' : output.toString();
};
