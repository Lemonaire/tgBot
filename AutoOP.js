/**
 * @fileOverview 触发式的自动操作 Automatic Operations
 * @author Lemonaire 
 * @version 1.2
 * @requires config
 * @requires Functions
 */
const config = require('./config.js');
const functions = require('./Functions.js');

// 配置授权的 Channel ID 和 Discuss ID
const lemonsterChannelId = config.lemonsterChannelId;
const testChannelId = config.testChannelId;
var canOrzLemon = true;

/**
 * @function executeAutoOP
 * @description 暴露给外部的 index.js 来执行所有的自动操作
 * @param {Object} bot
 */
function executeAutoOP(bot) {
    // 自动转发指定 Channel 的最新 Post
    bot.on('channel_post', (chPost)=> {
        fwChPost(bot, chPost);
    });

    // 自动对新入群用户进行验证
    bot.on('new_chat_members', (newMembers)=> {
        verify(bot, newMembers);
    });

    //控制出现 「膜了 Lemon」的频率
    bot.onText(/(膜[\s]*了[\s]*L[\s]*e[\s]*m[\s]*o[\s]*n)/im, (msg, match) => {
        limitOrzLemon(bot, msg);
    });
}

/**
 * @function fwChPost
 * @description 转发指定 Channel 的最新 Post
 * @param {Object} bot
 * @param {Object} chPost - Message 格式，收到的 Channel Post 消息
 */
function fwChPost(bot, chPost) {
    var chatId = functions.getDiscussId(chPost);    // 判断 Channel 是否已经授权，如果授权，返回对应的 Discuss ID
    if (functions.isset(chatId)) {
        bot.forwardMessage(chatId, chPost.chat.id, chPost.message_id);
    }
    else {
        return;
    }
}

/**
 * @function verify
 * @description 验证用户是否是 bot（其实只是刁难人……）
 * @param {Object} bot
 * @param {Object} newMembers - Message 格式，用户加群时生成的通知消息
 */
function verify(bot, newMembers) {
    /**
    * @todo 把所有的 Chat ID 重构成 dict，可能还要封装一下
    */
    // 判断 bot 所在群是否是已经授权的群
    var chatId = newMembers.chat.id;
    if (!functions.isVerifiedChat(chatId)) {
        return;
    }

    /**
    * @todo 设置 bot 白名单，通过申请的 bot 可以加群
    */
    //禁止其他 bot 进群
    if (newMembers.new_chat_member.is_bot === true && newMembers.new_chat_member.id !== config.testBotId && newMembers.new_chat_member.id !== config.lemonBotId) {
        banBotText = `为了防止调皮的群友做出奇奇怪怪的事情，所以本群不允许陌生的 bot 进群~（菜鸡柠檬正在努力加上白名单功能）`;
        bot.restrictChatMember(chatId, newMembers.new_chat_member.id);
        bot.kickChatMember(chatId, newMembers.new_chat_member.id);
        bot.sendMessage(chatId, banBotText);
        return;
    }

    // 获取验证问题的题面和答案，并赋值给 codon 和 answer
    var question = functions.getQuestion();
    var codon = question.codon;
    var answer = question.name;

    // 发送验证通知
    var verifyMsgText = `请在 90秒 内回复本条消息，内容为密码子 '${codon}' 所对应的氨基酸的中文名，回答正确则验证成功。`;
    var verifyForm = {
        'reply_to_message_id': newMembers.message_id,   // 设置发送消息的模式是回复，回复的消息为入群通知
    };
    // 由于 sendMessage 返回的是一个 Promise 对象，所以需要用 .then() 来获取真正的返回值
    bot.sendMessage(chatId, verifyMsgText, verifyForm).then(verifyMsg => {
        // 设置定时器，90秒 后验证超时，自动调用验证失败的函数
        const timeoutObj = setTimeout(() => {
            failToVerify(bot, newMembers);
            bot.deleteMessage(chatId, verifyMsg.message_id);
        }, 90000);

        // 验证通知被回复时的事件处理器
        bot.onReplyToMessage(chatId, verifyMsg.message_id, (msg)=>{
            // 判断回复是否来自需要验证的新用户
            if (newMembers.from.id !== msg.from.id) {
                return;
            }

            clearTimeout(timeoutObj);   // 取消定时器
            bot.deleteMessage(chatId, verifyMsg.message_id);    // 删除验证通知的消息

            // 判断回答是否正确
            if (answer === msg.text) {

                // 获取新用户的基本信息
                const orzToFirstName = functions.isset(newMembers.new_chat_member.first_name) ? functions.htmlEncode(newMembers.new_chat_member.first_name) : '';
                const orzToLastName = functions.isset(newMembers.new_chat_member.last_name) ? ' ' + functions.htmlEncode(newMembers.new_chat_member.last_name) : '';
                const orzToName = orzToFirstName + orzToLastName;
                const orzToId = newMembers.new_chat_member.id;

                // 发送验证成功的通知（包含入群又退群等意外情况）
                bot.getChatMember(chatId, orzToId).then(msg => {
                    if(`member` === msg.status) {
                        var welcomeMsgText = `验证成功，欢迎新大佬 <a href = 'tg://user?id=${orzToId}'>${orzToName}</a>`;
                    }
                    else {
                        var welcomeMsgText = `虽然验证成功了，但不知道为什么，大佬 <a href = 'tg://user?id=${orzToId}'>${orzToName}</a> 的状态不太对`;
                    }
                    var welcomeForm = {
                        'parse_mode': 'HTML',   // 设置消息的解析模式
                    }
                    bot.sendMessage(chatId, welcomeMsgText, welcomeForm);
                })

            }
            else {
                failToVerify(bot, newMembers);    // 验证失败
            }
        });
    });
}

/**
 * @function failToVerify
 * @description 对验证失败的处理
 * @param {Object} bot
 * @param {Object} newMembers - Message 格式，用户加群时生成的通知消息
 */
function failToVerify(bot, newMembers) {
    var chatId = newMembers.chat.id;
    var userId = newMembers.new_chat_members[0].id;
    var msg = '验证失败，请联系管理员解封。'
    bot.restrictChatMember(chatId, userId);
    bot.sendMessage(chatId, msg);
}

/**
 * @function limitOrzLemon
 * @description 限制膜柠檬的频率
 * @param {Object} bot
 * @param {Object} newMembers - Message 格式，柠檬被膜的消息
 */
function limitOrzLemon(bot, msg) {
    /**
    * @todo 把所有的 Chat ID 重构成 dict，可能还要封装一下
    */
    // 判断 bot 所在群是否是已经授权的群
    const chatId = msg.chat.id;
    if (!functions.isVerifiedChat(chatId)) {
        return;
    }

    const msgId = msg.message_id;
    //让我看看是哪个调皮的群友又在膜柠檬了
    const orzFromFirstName = functions.isset(msg.from.first_name) ? functions.htmlEncode(msg.from.first_name) : '';
    const orzFromLastName = functions.isset(msg.from.last_name) ? ' ' + functions.htmlEncode(msg.from.last_name) : '';
    const orzFromName = orzFromFirstName + orzFromLastName;
    const orzFromId = msg.from.id;

    //设置定时器，判断距离上一次柠檬被膜有没有超过 24h
    if (canOrzLemon) {
        canOrzLemon = false;
        const timeoutObj = setTimeout(() => {
            canOrzLemon = true;
        }, 1000 * 60 * 60 * 24);

        var replyMsg = `哇！菜鸡柠檬被膜了！谢谢大佬 <a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a>`;
    }
    else {
        var replyMsg = `大家一天只能膜一次菜鸡柠檬啦！不然它会膨胀的 qwq`;
        bot.deleteMessage(chatId, msgId);
    }

    const form = {
        'parse_mode': 'HTML',   // 设置消息的解析模式
    };
    bot.sendMessage(chatId, replyMsg, form);
}

/**
 * @description 执行自动操作
 * @module AutoOP
 */
module.exports = {
    executeAutoOP,
}

// 一段我也不知道会不会有用的代码，所以先留着吧……
//get chatid
// bot.getChat('@username').then(function(chat) {
//   console.log(chat.id);
// })
