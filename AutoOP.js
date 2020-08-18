/**
 * @fileOverview 触发式的自动操作 Automatic Operations
 * @author Lemonaire 
 * @version 2.0
 * @requires config
 * @requires Functions
 * @todo 新成员进群时，自动加入数据库
 * @todo 同步频道内容的修改
 * @todo 把频道发的多张图片合并转发
 */
const config = require('./config.js');
const functions = require('./Functions.js');
const form = config.form;

// 现在可以膜柠檬了吗！
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

    // 控制出现「膜了 Lemon」的频率
    bot.on('text', (msg) => {
        limitOrzLemon(bot, msg);
    });
}

/**
 * @function fwChPost
 * @description 转发指定 Channel 的最新 Post
 * @param {Object} bot
 * @param {Object} chPost - Message 格式，收到的 Channel Post 消息
 */
async function fwChPost(bot, chPost) {
    var chatId = await functions.getDiscussId(chPost);    // 判断 Channel 是否已经授权，如果授权，返回对应的 Discuss ID
    if (functions.isset(chatId)) {
        bot.forwardMessage(chatId, chPost.chat.id, chPost.message_id);
    }
}

/**
 * @function verify
 * @description 验证用户是否是 bot（其实只是刁难人……）
 * @param {Object} bot
 * @param {Object} newMembers - Message 格式，用户加群时生成的通知消息
 */
async function verify(bot, newMembers) {
    // 判断 bot 所在群是否是已经授权的群
    var chatId = newMembers.chat.id;
    if (! await functions.isAllowedId(chatId)) {
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
        bot.sendMessage(chatId, banBotText, form);
        return;
    }

    // 获取验证问题的题面和答案，并赋值给 codon 和 answer
    var question = await functions.getQuestion();
    var codon = question.codon;
    var answer = question.name;

    // 发送验证通知
    var verifyMsgText = `请在 90秒 内回复本条消息，内容为密码子 '${codon}' 所对应的氨基酸的中文名，回答正确则验证成功。`;
    var verifyForm = {
        'reply_to_message_id': newMembers.message_id,   // 设置发送消息的模式是回复，回复的消息为入群通知
        'disable_notification': true,
    };
    // 由于 sendMessage 返回的是一个 Promise 对象，所以需要用 .then() 来获取真正的返回值
    var verifyMsg = await bot.sendMessage(chatId, verifyMsgText, verifyForm);
    // 设置定时器，90秒 后验证超时，自动调用验证失败的函数
    const timeoutObj = setTimeout(() => {
        failToVerify(bot, newMembers);
        bot.deleteMessage(chatId, verifyMsg.message_id);
    }, 90000);

    // 验证通知被回复时的事件处理器
    await bot.onReplyToMessage(chatId, verifyMsg.message_id, async (msg)=>{
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
            var replyMsg = await bot.getChatMember(chatId, orzToId);
            var welcomeMsgText;
            if(`member` === replyMsg.status) {
                welcomeMsgText = `验证成功，欢迎新大佬 <a href = 'tg://user?id=${orzToId}'>${orzToName}</a>`;
            }
            else {
                welcomeMsgText = `虽然验证成功了，但不知道为什么，大佬 <a href = 'tg://user?id=${orzToId}'>${orzToName}</a> 的状态不太对`;
            }
            bot.sendMessage(chatId, welcomeMsgText, form);
        }
        else {
            failToVerify(bot, newMembers);    // 验证失败
        }
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
    bot.sendMessage(chatId, msg, form);
}

/**
 * @function limitOrzLemon
 * @description 限制膜柠檬的频率
 * @param {Object} bot
 * @param {Object} msg - Message 格式，柠檬被膜的消息
 */
async function limitOrzLemon(bot, msg) {
    // 判断 bot 所在群是否是已经授权的群
    const chatId = msg.chat.id;
    if (! await functions.isAllowedId(chatId)) {
        return;
    }

    // 如果是柠檬自己发的消息就跳过
    // if(config.lemonId == msg.from.id) {
    //     return;
    // }

    // 检测是不是在膜柠檬
    var isOrzLemonText = await functions.isOrzLemonText(functions.filter(msg.text));
    if (isOrzLemonText === false) {
        return;
    }
    else if (isOrzLemonText === "alert") {
        const alertForm = {
            'parse_mode': 'HTML',   // 设置消息的解析模式
            'disable_notification': true,
            'reply_to_message_id': msg.message_id,
        };
        bot.sendMessage(chatId, "qwq 我好像不懂你在说什么", alertForm);
        return;
    }

    const msgId = msg.message_id;
    //让我看看是哪个调皮的群友又在膜柠檬了
    const orzFromFirstName = functions.isset(msg.from.first_name) ? functions.htmlEncode(msg.from.first_name) : '';
    const orzFromLastName = functions.isset(msg.from.last_name) ? ' ' + functions.htmlEncode(msg.from.last_name) : '';
    const orzFromName = orzFromFirstName + orzFromLastName;
    const orzFromId = msg.from.id;

    //设置定时器，判断距离上一次柠檬被膜有没有超过 24h
    var replyMsg;
    if (canOrzLemon) {
        canOrzLemon = false;
        const timeoutObj = setTimeout(() => {
            canOrzLemon = true;
        }, 1000 * 60 * 60 * 24);

        replyMsg = `哇！菜鸡柠檬被膜了！谢谢大佬 <a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a>`;
    }
    else {
        replyMsg = `大家一天只能膜一次菜鸡柠檬啦！不然它会膨胀的 qwq`;
        bot.deleteMessage(chatId, msgId);
    }

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

