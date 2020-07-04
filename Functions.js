//isset
function isset(a){
  if ('undefined' === typeof a ) return false;
  if (null === a ) return false;
  if ('' === a ) return false;
  return true;
}


function htmlEncode(str) {
  var s = "";
  if (str.length === 0) {
    return "";
  }
  s = str.replace(/&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  // s = s.replace(/ /g, "&nbsp;");
  s = s.replace(/\'/g, "&#39;");//IE下不支持实体名称
  s = s.replace(/\"/g, "&quot;");
  return s;
}
 
/**
 *  转义字符还原成html字符
 * @param str
 * @returns {string}
 * @constructor
 */
function htmlDecode(str) {
  var s = "";
  if (str.length === 0) {
    return "";
  }
  s = str.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  // s = s.replace(/&nbsp;/g, " ");
  s = s.replace(/&#39;/g, "\'");
  s = s.replace(/&quot;/g, "\"");
  return s;
}

module.exports = {
	isset,
	htmlDecode,
	htmlEncode,
}