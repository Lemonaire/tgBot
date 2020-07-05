const config = require('./config.js');
const functions = require('./Functions.js');

const lemonsterDiscussChatId = config.lemonsterDiscussChatId;
const testDiscussChatId = config.testDiscussChatId;
const lemonsterChannelId = config.lemonsterChannelId;
const testChannelId = config.testChannelId;

var verifyMsg;

function executeAutoOP(bot){
	bot.on('channel_post', (chPost)=> {
		fwChPost(bot, chPost);
	});

	bot.on('new_chat_members', (newMembers)=>{
		verify(bot, newMembers);
	});
}


function fwChPost(bot, chPost) {
	var chatId = functions.getDiscussId(chPost);
	if (functions.isset(chatId)) {
	    bot.forwardMessage(chatId, chPost.chat.id, chPost.message_id);
	}
	else {
		return;
	}
}

function verify(bot, newMembers){

	var chatId = newMembers.chat.id;
	if (chatId !== lemonsterDiscussChatId && chatId !== testDiscussChatId) {
    return;
	}

	if (functions.isset(chatId)) {
		var question = functions.getQuestion();
		var codon = question.codon;
		var answer = question.name;
		var verifyMsgText = `请在 90秒 内回复本条消息，内容为密码子 '${codon}' 所对应的氨基酸的中文名，回答正确则验证成功。`;
		var verifyForm = {
			'reply_to_message_id': newMembers.message_id,
		};
		bot.sendMessage(chatId, verifyMsgText, verifyForm).then(verifyMsg => {

			const timeoutObj = setTimeout(() => {
				failToVerify(bot, newMembers, verifyMsg.message_id);
				bot.deleteMessage(chatId, verifyMsg.message_id);
			}, 90000);


			bot.onReplyToMessage(chatId, verifyMsg.message_id, (msg)=>{
				if (newMembers.from.id !== msg.from.id) {
					return;
				}

				clearTimeout(timeoutObj);
				bot.deleteMessage(chatId, verifyMsg.message_id);

				if (answer === msg.text) {

					const orzToFirstName = functions.isset(newMembers.new_chat_member.first_name) ? functions.htmlEncode(newMembers.new_chat_member.first_name) : '';
					const orzToLastName = functions.isset(newMembers.new_chat_member.last_name) ? ' ' + functions.htmlEncode(newMembers.new_chat_member.last_name) : '';
					const orzToName = orzToFirstName + orzToLastName;
					const orzToId = newMembers.new_chat_member.id;


					var welcomeMsgText = `验证成功，欢迎新大佬 <a href = 'tg://user?id=${orzToId}'>${orzToName}</a>`;
					var welcomeForm = {
					    'parse_mode': 'HTML',
					}
					bot.sendMessage(chatId, welcomeMsgText, welcomeForm);
				}
				else {
					failToVerify(bot, newMembers, verifyMsg.message_id);
				}
			})
		});


	}
	else {
		return;
	}


}

function failToVerify(bot, newMembers, msgId){
	var chatId = newMembers.chat.id;
	var userId = newMembers.new_chat_members[0].id;
	var msg = '验证失败，请联系管理员解封。'
	bot.restrictChatMember(chatId, userId);
	bot.sendMessage(chatId, msg);
}

module.exports = {
	executeAutoOP,
}

//get chatid
// bot.getChat('@username').then(function(chat) {
//   console.log(chat.id);
// })
