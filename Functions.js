/**
 * @fileOverview 定义一些底层方法
 * @author Lemonaire
 * @version 1.1
 * @requires verifyingQuestions
 * @requires config
 */
const questions = require('./verifyingQuestions.js');
const config = require('./config.js');

// 配置授权的 Channel ID 和 Discuss ID
const lemonsterDiscussChatId = config.lemonsterDiscussChatId;
const testDiscussChatId = config.testDiscussChatId;
const lemonsterChannelId = config.lemonsterChannelId;
const testChannelId = config.testChannelId;

/**
 * @function getQuestion
 * @description 从题库随机抽取一道题，并返回
 * @return {String} json 格式，包含题面和答案
 */
function getQuestion(){
    var qNum = Math.floor(Math.random() * 61);
    return questions.bioQuestions[qNum];
}

/**
 * @function getDiscussId
 * @description 从 Channel ID 获得对应的 Discuss ID
 * @param {Object} msg - Message 格式，收到的 Channel Post 消息
 * @return {Num} chatID - 对应的 Discuss ID
 */
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

/**
 * @function isset
 * @description判断变量是否被设置
 * @param a - 需要判断的变量
 * @returns {Boolean} 是否被设置
 */
function isset(a){
    if ('undefined' === typeof a ) return false;
    if (null === a ) return false;
    if ('' === a ) return false;
    return true;
}

/**
 * @function htmlEncode
 * @description html字符转义
 * @param str - 需要转义的字符串
 * @returns {string} s - 转义后的字符串
 */
function htmlEncode(str) {
    var s = "";
    if (str.length === 0) {
        return "";
    }
    s = str.replace(/&/g, "&amp;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    // s = s.replace(/ /g, "&nbsp;");
    s = s.replace(/\'/g, "&#39;");  // IE下不支持实体名称
    s = s.replace(/\"/g, "&quot;");
    return s;
}

/**
 * @function htmlDecode
 * @description 转义字符还原成html字符
 * @param str - 需要还原的字符串
 * @returns {string} s - 还原后的字符串
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

/**
 * @description 一些底层方法？大概吧
 * @module Functions
 */
module.exports = {
    getQuestion,
    getDiscussId,
    isset,
    htmlEncode,
    htmlDecode,
}