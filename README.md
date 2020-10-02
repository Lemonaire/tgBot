## Lemon's bot  

### directory  
>/AutoOP.js  
>/Command.js  
>/config.js  
>/Functions.js  
>/index.js  

### AutoOP.js  
Defined some automatic operations.  
1. forward the specific channel's post to the discuss group.  
2. verify the new chat members, and restrict the bots to join the chat.  
3. ~~limit orzing lemon.~~  

### Command.js  
Defined some bot commands.  
1. orz command.  Everyone could be orzed by using this command.  
2. ping command. Make sure that the bot is working.  
3. ~~report_orz_lemon_text command. When the group members try to orz lemon, lemon could use this command to report the text. Then the text will be inserted into the database, so that it will be detected automatically next time.~~  
4. mute command. Lemon can use this command to mute one of the chat members for five minutes, though it seems to be useless.  
5. miss command. Lemon and mathlover can use this command to send miss messages to each other quickly and conveniently.  

### config.js  
Defined the configuration.  
It includes:  
>mysql - an instance of `mysql` package  
>token - lemon's bot token  
>lemonTestBotToken - lemon's test bot token  
>lemonId - lemon's telegram id  
>lemonBotId - lemon's bot id  
>testBotId - lemon's test bot id  
>lemonFirstName  
>lemonLastName  
>lemonName  
>mysqlConfig - the configuration used to connect to mysql  
>form - the universal query options when calling the function `sendMessage`  

### Functions.js  
Defined some frequently-used or useful functions.  
1. getQuestion. To get a random question from the database, usually used to verify the new chat members.  
2. getDiscussId. To get the chat id of a discuss group which is linked to the specific channel.  
3. getMissInfo. To get information of the `miss` command's sender and the receiver.  
4. isAllowedId. To judge whether the chat id is allowed or not, so that others couldn't use this bot without permission. Also used to judge whether a bot is allowed.  
5. connectMySql. To connect to the mysql conveniently.  
6. ~~isOrzLemonText. To judge whether someone is trying to orz lemon, used in the command `report_orz_lemon_text`.~~  
7. isset. To judge whether a parameter has been set.  
8. ~~filter. To filter all characters except letters, digits and Chinese characters.~~  
9. htmlEncode. To transfer meaning of some html characters so that the injection could be avoided, especially in the command `orz`.  
10. htmlDecode. This function is never used, just to make pairs of the function `htmlEncode`.  

### index.js  
Create an instance of telegram bot and run it.  

### coding standards  
1. Each function should have comments in the following format. Note that all the asterisks should align and there should be a space between the asterisk and the comments.  

		/**  
		 * @function function name  
		 * @description description to this function  
		 * @param {type} the name of the parameter - the description of the parameter  
		 * @returns {type} the name of the returned value - the description of the returned value  
		 */  

2. Eech file should have comments at the beginning of it in the following format.  

		/**  
		 * @fileOverview description of this file  
		 * @author author's name  
		 * @version 1.0, 1.1, 2.0, etc.  
		 * @requires the name of the packages or file which is required  
		 */  

3. Use `@todo` to mark the unfinished work.  
4. Other necessary comments, which explains what the following codes is doing or why you code it in this way. Note that there should be a space between `//` and the comments.  