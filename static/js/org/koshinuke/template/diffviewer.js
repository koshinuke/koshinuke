// This file was automatically generated from diffviewer.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.diffviewer');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.diffviewer.commit = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="commit"><div class="author"><img class="thumb large ', soy.$$escapeHtml(opt_data.author), '"/><span class="name">', soy.$$escapeHtml(opt_data.author), '</span></div><div class="message"><span>', soy.$$escapeHtml(opt_data.message), '</span></div><div class="meta"><span class="timestamp">', soy.$$escapeHtml(opt_data.timestamp), '</span><span class="label">parents :</span><span class="parents">');
  var pList12 = opt_data.parents;
  var pListLen12 = pList12.length;
  for (var pIndex12 = 0; pIndex12 < pListLen12; pIndex12++) {
    var pData12 = pList12[pIndex12];
    output.append((! (pIndex12 == 0)) ? '<span> + </span>' : '', '<span class="parent">', soy.$$truncate(soy.$$escapeHtml(pData12), 7, false), '</span>');
  }
  output.append('</span><span class="label">commit :</span><span class="commitid">', soy.$$escapeHtml(opt_data.commit), '</span><button>Browse Code</button></div></div>');
  return opt_sb ? '' : output.toString();
};


org.koshinuke.template.diffviewer.file = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="file collapse"><div class="meta"><img class="status"/><img class="op ', soy.$$escapeHtml(opt_data.operation), '" /><span class="path">', soy.$$escapeHtml(opt_data.path), '</span></div><div class="content"></div></div>');
  return opt_sb ? '' : output.toString();
};
