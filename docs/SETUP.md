# **Bot Setup** <img src="https://raw.githubusercontent.com/DarkView/JS-MRVNLFG/master/docs/MRVN.png" height="32">
*Note:* You need to host this bot yourself! To keep it online 24/7 you need to keep the process running

## First Steps
1. Create a bot account in the [Discord Developer Portal](https://discordapp.com/developers/)
2. Invite the created bot to your server with this [link](https://discordapp.com/oauth2/authorize?client_id=BOT_ID&scope=bot&permissions=11281). Replace BOT_ID in your browser with your bots UserID
3. Install Node.js from [here](https://nodejs.org/)
    - NodeJS version 12.4 and 10.16.3 are verified as working.
4. Get the latest bot version [here](https://github.com/DarkView/JS-MRVNLFG/releases) and extract it. The correct zip follows this namescheme: `NodeMRVN-version.zip`
5. In the extracted files, copy and rename the `bot.env.example` to `bot.env`. Open it and replace `REPLACE_WITH_YOUR_TOKEN` with your bot token (Not the UserID)
6. Run `npm ci` in the root directory of the bots folder to install all required packages

## Updating
Unzip the newest bot version zip file.
Since the bot stores no data, it is possible to simply overwrite all old files with the new ones!

*Note:* If you made changes to `blocked.yml` or `global.yml` in the config folder, do NOT overwrite these files but manually check for changes with the new version.

You can now stop the running bot, run `npm ci` again to ensure the installation of all required packages and restart it, the new version is installed.

## Configuration  
After you are done with the above steps, continue to [configuration](https://github.com/DarkView/JS-MRVNLFG/blob/master/docs/CONFIG.md)  

## Keeping the bot running
Once you have the bot configured the way you want, you need to figure out a way to keep the process running 24/7.  
On my Linux server i use [forever-service](https://github.com/zapty/forever-service) but you are free to use whatever you want.

## Have you encountered issues? Have any Feedback?
You can contact me in Discord with the username: **Dark#1010** or via the [Apex Legends Discord Server](https://discord.gg/apexlegends)
