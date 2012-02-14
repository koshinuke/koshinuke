// This file was automatically generated from diffviewer.soy.
// Please don't edit this file by hand.

goog.provide('org.koshinuke.template.diffviewer');

goog.require('soy');
goog.require('soy.StringBuilder');


org.koshinuke.template.diffviewer.commit = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="commit"><div class="author"><img class="thumb large ', soy.$$escapeHtml(opt_data.author), '"/><span class="name">', soy.$$escapeHtml(opt_data.author), '</span></div><div class="message"><span>', soy.$$escapeHtml(opt_data.message), '</span></div><div class="meta"><span class="timestamp">', soy.$$escapeHtml(opt_data.timestamp), '</span><span class="label">parents :</span><span class="parents">');
  var pList76 = opt_data.parents;
  var pListLen76 = pList76.length;
  for (var pIndex76 = 0; pIndex76 < pListLen76; pIndex76++) {
    var pData76 = pList76[pIndex76];
    output.append((! (pIndex76 == 0)) ? '<span> + </span>' : '', '<span class="parent">', soy.$$truncate(soy.$$escapeHtml(pData76), 7, false), '</span>');
  }
  output.append('</span><span class="label">commit :</span><span class="commitid">', soy.$$escapeHtml(opt_data.commit), '</span><button>Browse Code</button></div></div>');
  return opt_sb ? '' : output.toString();
};


org.koshinuke.template.diffviewer.file = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="file collapse"><div class="meta"><img class="status"/><span class="path">', soy.$$escapeHtml(opt_data.path), '</span><div class="diffstat">');
  org.koshinuke.template.diffviewer.renderStat({times: opt_data.stat.addtimes, stat: 'add'}, output);
  org.koshinuke.template.diffviewer.renderStat({times: opt_data.stat.deltimes, stat: 'del'}, output);
  org.koshinuke.template.diffviewer.renderStat({times: opt_data.stat.nontimes, stat: 'non'}, output);
  output.append('</div><img class="op ', soy.$$escapeHtml(opt_data.operation), '" title="', soy.$$escapeHtml(opt_data.operation), '" /></div><div class="diffs"><div class="diffmodes goog-tab-bar"><div class="patch goog-tab">patch</div><div class="inline goog-tab">inline</div><div class="sbs goog-tab">side by side</div></div><div class="content"><div class="patch"></div><div class="inline" style="display: none;"></div><div class="sbs" style="display: none;"></div></div></div></div>');
  return opt_sb ? '' : output.toString();
};


org.koshinuke.template.diffviewer.renderStat = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var iLimit107 = opt_data.times;
  for (var i107 = 0; i107 < iLimit107; i107++) {
    output.append('<span class="stat ', soy.$$escapeHtml(opt_data.stat), '"></span>');
  }
  return opt_sb ? '' : output.toString();
};
