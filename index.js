const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const Agent = require('socks5-https-client/lib/Agent');
const config = require('./config.js');
const command = require('./Command.js');
const functions = require('./Functions.js');
const autoOP = require('./AutoOP.js');


const bot = new TelegramBot(config.token, {
  polling: true,
  request: {
    agentClass: Agent,
    agentOptions: {
      // socksHost: 'hostAddress',
      // socksPort: port,
      // socksUsername: 'username'
      // socksPassword: 'pw',
    }
  }
});

autoOP.executeAutoOP(bot);
command.dealWithCommand(bot);
