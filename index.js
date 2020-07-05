/**
 * @fileOverview Main
 * @author Lemonaire 
 * @version 1.1
 * @requires node-telegram-bot-api
 * @requires request
 * @requires socks5-https-client/lib/Agent
 * @requires config
 * @requires Command
 * @requires AutoOP
 */
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const Agent = require('socks5-https-client/lib/Agent');
const config = require('./config.js');
const command = require('./Command.js');
const autoOP = require('./AutoOP.js');

// 创建 bot 实例，使用轮询，并配置代理
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

// 运行 bot
autoOP.executeAutoOP(bot);
command.dealWithCommand(bot);
