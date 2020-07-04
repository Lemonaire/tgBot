const config = require('./config.js');

const lemonsterDiscussChatId = config.lemonsterDiscussChatId;
const testDiscussChatId = config.testDiscussChatId;
const lemonsterChannelId = config.lemonsterChannelId;
const testChannelId = config.testChannelId;

function executeAutoOP(bot){
	bot.on('channel_post', (chPost)=> {
		fwChPost(bot, chPost);
	});
}


function fwChPost(bot, chPost) {
	var chatId;
	switch(chPost.chat.id) {
		case testChannelId:
			chatId = testDiscussChatId;
			break;
		case lemonsterChannelId:
			chatId = lemonsterDiscussChatId;
			break;
		default:
			return;
	}
    bot.forwardMessage(chatId, chPost.chat.id, chPost.message_id);
}

module.exports = {
	executeAutoOP,
}

//get chatid
// bot.getChat('@username').then(function(chat) {
//   console.log(chat.id);
// })
