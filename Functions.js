/**
 * @fileOverview 定义一些底层方法
 * @author Lemonaire
 * @version 2.2
 * @requires config
 */
const config = require('./config.js');

/**
 * @function getQuestion
 * @description 生成一个随机数，从数据库抽取数字对应题目，并返回
 * @return {Promise} 数据库的结果集，内含 json 格式的题面和答案
 */
function getQuestion() {
    var qid = Math.floor(Math.random() * 61);
    var sql = 'select * from verifying_questions where qid = ?';
    var parameter = [qid];
    var connection = connectMySql();
    // 由于 nodejs 的异步处理操作，只能通过 Promise 对象把 sql 结果集或经过处理以后的结果返回出去
    return new Promise((resolve,reject)=>{
        connection.query(sql, parameter, function(err, result, callback) {
            connection.end();
            var question = {'codon': result[0].question, 'name': result[0].answer};
            resolve(question);
        });
    });
}

/**
 * @function getDiscussId
 * @description 查询数据库，从 Channel ID 获得对应的 Discuss ID
 * @param {Object} msg - Message 格式，收到的 Channel Post 消息
 * @return {Promise} chatID - 对应的 Discuss ID
 */
function getDiscussId(msg) {
    var sql = 'select discussId from channel_and_discuss where channelId = "?"';
    var parameter = [msg.chat.id];
    var connection = connectMySql();
    // 由于 nodejs 的异步处理操作，只能通过 Promise 对象把 sql 结果集或经过处理以后的结果返回出去
    return new Promise((resolve,reject)=>{
        connection.query(sql, parameter, function(err, result) {
            connection.end();
            if (isset(result[0])) {
                var chatId = result[0].discussId;
            }
            resolve(chatId);
        });
    });
}

/**
 * @function isAllowedId
 * @description 查询数据库，判断是否是被授权的 id（包括 user id 和 chat id 两种）
 * @param {Number} chatId - 需要判断的 id
 * @return {Promise} - boolean 是否被授权
 */
function isAllowedId(chatId) {
    var sql = 'select chatId from allowed_id';
    var connection = connectMySql();
    // 由于 nodejs 的异步处理操作，只能通过 Promise 对象把 sql 结果集或经过处理以后的结果返回出去
    return new Promise((resolve,reject)=>{
        connection.query(sql, function(err, result) {
            connection.end();
            for(var i = 0; i < result.length; ++i) {
                if(result[i].chatId == chatId) {
                    resolve(true); 
                    return;
                }
            }
            resolve(false);
        });
    });
}

/**
 * @function isOrzLemonText
 * @description 查询数据库，判断消息内容是否是膜柠檬的文本
 * @param {String} text - 需要判断的消息内容
 * @return {Promise} - 是否是膜柠檬的文本，如果经过过滤之后得到了空字符串，则返回 "alert"
 */
function isOrzLemonText(text) {
    var sql = 'select text from orz_lemon_text';
    var connection = connectMySql();

    // 如果传入的参数为空，则发出警报
    if(!isset(text)) {
        return new Promise((resolve,reject)=>{
            resolve("alert");
        });
    }

    // 处理英文符号
    text = text.replace(/[ ~`!@#$%^&*()-_+=|\[\]{};:"',<.>\/?\\]/g,"");
    // 处理中文符号
    text = text.replace(/[！￥·…（）—《》？。，；“”‘’：]/g,"");

    // 由于 nodejs 的异步处理操作，只能通过 Promise 对象把 sql 结果集或经过处理以后的结果返回出去
    return new Promise((resolve,reject)=>{
        connection.query(sql, function(err, result) {
            connection.end();
            for(var i = 0; i < result.length; ++i) {
                if(text.includes(result[i].text)) {
                    resolve(true);
                    return;
                }
            }
            resolve(false);
        });
    });
}

/**
 * @function connectMySql
 * @description 创建一个数据库连接。由于 mysql 连接数据库的代码有点长（？），所以写了一个函数来简化一下
 * @return {Object} connection - 数据库的一个连接
 */
function connectMySql(){
    var connection = (config.mysql).createConnection(config.mysqlConfig);
    connection.connect();
    return connection;
}

/**
 * @function isset
 * @description 判断变量是否被设置
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
 * @function filter
 * @description 过滤字符串，删除其中的中英文符号，并将所有字母改成小写
 * @param {String} str - 需要过滤的字符串
 * @returns {String} str - 过滤处理后的字符串
 */
function filter(str) {
    // 只保留大小写字母、数字、中英文常用符号和非扩展的中文字符
    str = str.replace(/[^！￥·…（）—《》？。，；“”‘’： ~`!@#$%^&*()-_+=|\[\]{};:"',<.>\/?\\a-zA-Z0-9\u4e00-\u9fa5]/g,"");
    str = str.toLowerCase();    // 转小写
    return str;
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
    s = s.replace(/'/g, "&#39;");  // IE下不支持实体名称
    s = s.replace(/"/g, "&quot;");
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
    isAllowedId,
    isOrzLemonText,
    connectMySql,
    isset,
    filter,
    htmlEncode,
    htmlDecode,
}