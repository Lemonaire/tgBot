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
3. limit orzing lemon.  

### Command.js  
Defined some bot commands.  
1. orz command.  Everyone except lemon could be orzed by using this command.  
2. ping command. Make sure that the bot is working.  
3. report_orz_lemon_text command. When the group members try to orz lemon, lemon could use this command to report the text. Then the text will be inserted into the database, so that it will be detected automatically next time.  

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

### Functions.js  
Defined some frequently-used or useful functions.  
1. getQuestion. To get a random question from the database, usually used to verify the new chat members.  
2. getDiscussId. To get the chat id of a discuss group which is linked to the specific channel.  
3. isAllowedId. To judge whether the chat id is allowed or not, so that others couldn't use this bot without permission.  
4. isOrzLemonText. To judge whether someone is trying to orz lemon, used in the command `report_orz_lemon_text`.  
5. isset. To judge whether a parameter has been set.  
6. filter. To filter the punctuation, usually used in the codes which involve sql statement.  
7. htmlEncode. To transfer meaning of some html characters so that the injection could be avoided, especially in the command `orz`.  
8. htmlDecode. This function is never used, just to make pairs of the function `htmlEncode`.  

### index.js
Create an instance of telegram bot and run it.  