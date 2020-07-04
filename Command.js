const functions = require('./Functions.js');
const config = require('./config.js');

const lemonsterDiscussChatId = config.lemonsterDiscussChatId; //lemonster discuss
const testDiscussChatId = config.testDiscussChatId; //test discuss


function dealWithCommand(bot) {
  //orz
  bot.onText(/^(\/orz|\/orz@Lemonaires_bot)$/, (msg, match) => {
    orz(bot,msg);
  });
}



// 匹配/echo
// bot.onText(/\/echo (.+)/, (msg, match) => {

//   const chatId = msg.chat.id;
//   const resp = match[1];
//   bot.sendMessage(chatId, resp);
// });

//orz command
function orz(bot,msg){
  var chatId = msg.chat.id;
  if (chatId !== lemonsterDiscussChatId && chatId !== testDiscussChatId) {
    return;
  }

  //the info of the one who orz
  const msgId = msg.message_id;
  const orzFromFirstName = functions.isset(msg.from.first_name) ? functions.htmlEncode(msg.from.first_name) : '';
  const orzFromLastName = functions.isset(msg.from.last_name) ? ' ' + functions.htmlEncode(msg.from.last_name) : '';
  const orzFromName = orzFromFirstName + orzFromLastName;
  const orzFromId = msg.from.id;

  if(functions.isset(msg.reply_to_message)) {
    //the info of the one who is orzed
    const orzToFirstName = functions.isset(msg.reply_to_message.from.first_name) ? functions.htmlEncode(msg.reply_to_message.from.first_name) : '';
    const orzToLastName = functions.isset(msg.reply_to_message.from.last_name) ? ' ' + functions.htmlEncode(msg.reply_to_message.from.last_name) : '';
    const orzToName = orzToFirstName + orzToLastName;
    const orzToId = msg.reply_to_message.from.id;

    var replyMsg = `<a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a> 膜了 <a href = 'tg://user?id=${orzToId}'>${orzToName}</a>`;
  }
  else {
    var replyMsg = `<a href = 'tg://user?id=${orzFromId}'>${orzFromName}</a> 膜了 空气`;
  }

  const form = {
    'parse_mode': 'HTML',
  };
  bot.deleteMessage(chatId, msgId);
  bot.sendMessage(chatId, replyMsg, form);

}

module.exports = {
  dealWithCommand,
}