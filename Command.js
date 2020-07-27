/**
 * @fileOverview 对 bot 收到的指令进行处理
 * @author Lemonaire
 * @version 1.2
 * @requires Functions
 * @requires config
 */
const functions = require('./Functions.js');
const config = require('./config.js');
const { isVerifiedChat } = require('./Functions.js');

/**
 * @function dealWithCommand
 * @description 暴露给外部的 index.js 来处理所有的 bot 指令
 * @param {Object} bot
 */
function dealWithCommand(bot) {
    bot.onText(/^(\/orz|\/orz@Lemonaires_bot)$/, (msg, match) => {
        orz(bot, msg);
    });
    bot.onText(/^(\/ping|\/ping@Lemonaires_bot)$/, (msg, match) => {
        ping(bot, msg);
    });
}


// 可能会加上的 /echo 指令
// 匹配/echo
// bot.onText(/\/echo (.+)/, (msg, match) => {

//   const chatId = msg.chat.id;
//   const resp = match[1];
//   bot.sendMessage(chatId, resp);
// });

/**
 * @function orz
 * @description 膜大佬
 * @param {Object} bot
 * @param {Object} msg - Message 格式，收到的 /orz 指令消息
 */
function orz(bot, msg) {
    /**
    * @todo 把所有的 Chat ID 重构成 dict，可能还要封装一下
    */
    // 判断 bot 所在群是否是已经授权的群
    var chatId = msg.chat.id;
    if (!functions.isVerifiedChat(chatId)) {
        return;
    }

    //the info of the one who orz
    const msgId = msg.message_id;
    const orzFromFirstName = functions.isset(msg.from.first_name) ? functions.htmlEncode(msg.from.first_name) : '';
    const orzFromLastName = functions.isset(msg.from.last_name) ? ' ' + functions.htmlEncode(msg.from.last_name) : '';
    const orzFromName = orzFromFirstName + orzFromLastName;
    const orzFromId = msg.from.id;

    // 判斷是否回复了某条消息
    if(functions.isset(msg.reply_to_message)) {
        //the info of the one who is orzed
        const orzToFirstName = functions.isset(msg.reply_to_message.from.first_name) ? functions.htmlEncode(msg.reply_to_message.from.first_name) : '';
        const orzToLastName = functions.isset(msg.reply_to_message.from.last_name) ? ' ' + functions.htmlEncode(msg.reply_to_message.from.last_name) : '';
        const orzToName = orzToFirstName + orzToLastName;
        const orzToId = msg.reply_to_message.from.id;

        // 膜自己
        if (orzFromId === orzToId) {
            var replyMsg = `<a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a> 膜了 自己`;
        }
        // 不能膜 Lemon，变成 Lemon 膜别人，bot 重定向到 Lemon
        else if(config.lemonId === orzToId || config.lemonBotId === orzToId) {
            var replyMsg = `柠檬太菜了，应该它来膜您！\n<a href = 'tg://user?id=${config.lemonId}'>${config.lemonName}</a> 膜了 <a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a>`;
        }
        // 正常的膜大佬
        else {
            var replyMsg = `<a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a> 膜了 <a href = 'tg://user?id=${orzToId}'>${orzToName}</a>`;
        }
    }
    // 膜空气
    else {
        var replyMsg = `<a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a> 膜了 空气`;
    }

    const form = {
        'parse_mode': 'HTML',   // 设置消息的解析模式
    };
    bot.deleteMessage(chatId, msgId);
    bot.sendMessage(chatId, replyMsg, form);
}

/**
 * @function ping
 * @description 存活测试
 * @param {Object} bot
 * @param {Object} msg - Message 格式，收到的 /ping 指令消息
 */
function ping(bot, msg) {
    /**
    * @todo 把所有的 Chat ID 重构成 dict，可能还要封装一下
    */
    // 判断 bot 所在群是否是已经授权的群
    var chatId = msg.chat.id;
    if (!functions.isVerifiedChat(chatId)) {
        return;
    }
    var 
    //存活测试的回复
    msgText = `ping pong boom ping pong ping ping boom ping ping boom ping ping ping pong boom ping`;
    bot.sendMessage(chatId, msgText);
}

/**
 * @description 处理所有的 bot 指令
 * @module Command
 */
module.exports = {
    dealWithCommand,
}