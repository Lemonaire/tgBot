/**
 * @fileOverview 对 bot 收到的指令进行处理
 * @author Lemonaire
 * @version 2.0
 * @requires Functions
 * @requires config
 * @todo 被膜排行榜
 * @todo 可以进群的 bot list
 * @todo 可以使用 bot 的 chat id
 */
const functions = require('./Functions.js');
const config = require('./config.js');
const form = config.form;
/**
 * @function dealWithCommand
 * @description 暴露给外部的 index.js 来处理所有的 bot 指令
 * @param {Object} bot
 */
function dealWithCommand(bot) {
    // /orz
    bot.onText(/^(\/orz|\/orz@Lemonaires_bot)$/, (msg, match) => {
        orz(bot, msg);
    });
    // /ping
    bot.onText(/^(\/ping|\/ping@Lemonaires_bot)$/, (msg, match) => {
        ping(bot, msg);
    });
    // /reportOrzLemonText
    bot.onText(/^(\/report_orz_lemon_text|\/report_orz_lemon_text@Lemonaires_bot)$/, (msg,match) => {
        reportOrzLemonText(bot, msg);
    });

    // /mute
    bot.onText(/^(\/mute|\/mute@Lemonaires_bot)$/, (msg,match) => {
        mute(bot, msg);
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
async function orz(bot, msg) {
    // 判断 bot 所在群是否是已经授权的群
    var chatId = msg.chat.id;
    if (! await functions.isAllowedId(chatId)) {
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

        var replyMsg;
        // 膜自己
        if (orzFromId === orzToId) {
            replyMsg = `<a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a> 膜了 自己`;
        }
        // 不能膜 Lemon，变成 Lemon 膜别人，bot 重定向到 Lemon
        else if(config.lemonId === orzToId || config.lemonBotId === orzToId) {
            replyMsg = `柠檬太菜了，应该它来膜您！\n<a href = 'tg://user?id=${config.lemonId}'>${config.lemonName}</a> 膜了 <a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a>`;
        }
        // 正常的膜大佬
        else {
            replyMsg = `<a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a> 膜了 <a href = 'tg://user?id=${orzToId}'>${orzToName}</a>`;
        }
    }
    // 膜全体群友
    else {
        replyMsg = `<a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a> 膜了 全体群友`;
    }

    bot.deleteMessage(chatId, msgId);
    bot.sendMessage(chatId, replyMsg, form);
}

/**
 * @function ping
 * @description 存活测试
 * @param {Object} bot
 * @param {Object} msg - Message 格式，收到的 /ping 指令消息
 */
async function ping(bot, msg) {
    // 判断 bot 所在群是否是已经授权的群
    var chatId = msg.chat.id;
    if (! await functions.isAllowedId(chatId)) {
        return;
    }

    bot.deleteMessage(chatId, msg.message_id);
    //存活测试的回复
    msgText = `ping pong boom ping pong ping ping boom ping ping boom ping ping ping pong boom ping`;
    bot.sendMessage(chatId, msgText, form);
}

/**
 * @function reportOrzLemonText
 * @description 报告膜柠檬的消息文本，将这段文本加入数据库中
 * @param {Object} bot
 * @param {Object} msg - Message 格式，收到的 /reportOrzLemonText 指令消息
 */
function reportOrzLemonText(bot, msg) {
    var chatId = msg.chat.id;

    // 这个指令只能柠檬自己用，所以要判断是不是柠檬本萌（逃）。如果不是，则禁言两分钟
    if(msg.from.id != config.lemonId) {
        // until_date 的参数是 unix time，精确到 s，Date.now() 返回的时间戳精确到毫秒，所以要 / 1000，计算得到的是浮点数，要取整
        bot.restrictChatMember(chatId, msg.from.id, {'until_date': Math.floor((Date.now() + 120000) / 1000)});
        bot.sendMessage(chatId, "report_orz_lemon_text 这条指令只能柠檬用哦~乱用的小可爱会被禁言两分钟嘻嘻~", form);
        return;
    }

    if(functions.isset(msg.reply_to_message)) {
        // 向数据库加入消息文本
        var sql = 'insert into orz_lemon_text(text) values(?)';
        var parameter = [functions.filter(msg.reply_to_message.text)];
        var connection = functions.connectMySql();
        connection.query(sql, parameter, function(err, result, callback) {
            connection.end();
        });

        bot.sendMessage(chatId, "done!", form);
    }
    else {
        bot.sendMessage(chatId, "需要回复一条消息来 report", form);
    }

    bot.deleteMessage(chatId, msg.message_id);
}

function mute(bot, msg) {
    var chatId = msg.chat.id;

    // 这个指令只能柠檬自己用，所以要判断是不是柠檬本萌（逃）。如果不是，则禁言一分钟
    if(msg.from.id != config.lemonId) {
        // until_date 的参数是 unix time，精确到 s，Date.now() 返回的时间戳精确到毫秒，所以要 / 1000，计算得到的是浮点数，要取整
        bot.restrictChatMember(chatId, msg.from.id, {'until_date': Math.floor((Date.now() + 60000) / 1000)});
        bot.sendMessage(chatId, "report_orz_lemon_text 这条指令只能柠檬用哦~乱用的小可爱会被禁言一分钟嘻嘻~", form);
        return;
    }

    if(functions.isset(msg.reply_to_message)) {
        var muteId = msg.reply_to_message.from.id;
        bot.restrictChatMember(chatId, muteId, {'until_date': Math.floor((Date.now() + 300000) / 1000)});
        bot.sendMessage(chatId, "禁言 5 分钟已到账~", form);
    }
    else {
        bot.sendMessage(chatId, "需要回复一条消息来 mute", form);
    }
}


/**
 * @description 处理所有的 bot 指令
 * @module Command
 */
module.exports = {
    dealWithCommand,
}