const questions = require('./verifyingQuestions.js');
const config = require('./config.js');

const lemonsterDiscussChatId = config.lemonsterDiscussChatId;
const testDiscussChatId = config.testDiscussChatId;
const lemonsterChannelId = config.lemonsterChannelId;
const testChannelId = config.testChannelId;


//select biology questions
function getQuestion(){
	var qNum = Math.round(Math.random() * 61);
	return questions.bioQuestions[qNum];
}

function getDiscussId(msg){
	var chatId;
	switch(msg.chat.id) {
	case testChannelId:
		chatId = testDiscussChatId;
		break;
	case lemonsterChannelId:
		chatId = lemonsterDiscussChatId;
		break;
	default:
		chatId = null;
		break;
	}
	return chatId;
}
	




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
	getQuestion,
	getDiscussId,
}