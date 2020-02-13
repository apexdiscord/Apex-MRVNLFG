# **Configuration** ⚙️
This bot supports running it on multiple servers at once, so be sure to read the information below carefully

## The different files explained

### Blocked
This file only contains an array of [regex](https://www.regular-expressions.info/).  
Every time someone uses the specified LFG command the message gets checked against the contents of this array. Should any of the words contained be found in the message, the LFG post will not be created.  
There is a high likelyhood this will be changed in the future!

### Global
This file contains general definitions that will be used on any server that does *not* have its own config.
You can generally delete all of the plugins in the `plugins` section.

### Server id
These files are the most important configuration files. If you want the bot to work on a specific server,  you will need to copy the `exampleconfig.yml` and rename it as such: `<server-id>.yml`.  
Example: `541484311354933258.yml`

The contents of this file will then be used for all commands and channel options on the server.
Lets go over all of the options for these files with the example config serving as an explanation:

<details>
<summary>Example Config - Click to expand</summary>
<p>

This config is based on the config used on the [Apex Legends Discord server](discord.gg/apexlegends)
```yml
# Apex Server

prefix: '+'

levels:
  # Dark
  "108552944961454080": 100
  
  # Admin
  "542068272007217193": 100

  # Mod
  "542793364722941972": 50

plugins:

  where: {}
  utility: {}
  
  lfg:
    config:
        lfg_command_ident: "!lfg"
        lfg_voice_ident: "team"
        lfg_text_ident: "lfg"
        lfg_message_compact: true
        lfg_list_others: true
        
        lfg_enable_emotes: true
        lfg_emotes_chan_ident: "ranked"
        lfg_emotes_idents: ["bronze", "silver", "gold", "plat", "diamond", "predator"]
        lfg_emotes_names: ["<:bronze:594109269524086794>", "<:silver:594109269805367297>", "<:gold:594109269528412161>", "<:platinum:594109270585507846>", "<:diamond:594109386276995072>", "<:predator:594109270509748224>"]
        lfg_emotes_found_append: "\n**Ranks in this message: **"
        lfg_emotes_notfound_append: "\n**No ranks in this message**"
        
        lfg_enable_shrink: true
        lfg_shrink_text_idents: ["duo", "1v1"]
        lfg_shrink_normal_amt: 3
        lfg_shrink_shrunk_amt: 2
```
</p>
</details>

- **prefix: '+'**
  - This is the string that defines what needs to be in front of *all* commands (except the lfg command). In this case all commands like where need to start with a +
  
- **levels:**
  - This <string, int> Map lets you define which role or user can access which commands
  - "userid" *or* "roleid": level
  - By default all commands have a required level of 50 (except the lfg command)

- **plugins:**
  - This is where all of the options for the different plugins need to be placed
  - The three different plugins currently available are: `where` `utility` `lfg`
  - **Important:** You need at least `pluginname: {}` in the config for the plugin to be enabled. Omitting this will not load the plugin!

## The different plugins and their options

- **where:**
  - This plugin allows moderators to use commands that locate a user in voice channels.  
  
  - **config:**
    - where_timeout: int
      - This defines the default amount of time a +f and +n command shall be active for
      - The default for this option is 600000

- **utility:**
  - This plugin allows moderators to get the bots Ping to Discord, the delay for the last 5 LFG requests and their level. It also captures all messages sent to the bot in DMs.  
  
  - **config:**
    - dm_response: "string"
      - This defines the message sent to any user that sends the Bot a DM
      - The default for this option is "Sorry, but you can only control this bot through commands within the server!"
    
- **lfg:**
  - This plugin has a lot of different options and is the main purpose of this bot. It includes everything needed to make LFG requests.  
  
  - **config:**
    - lfg_command_ident: "string"
      - The string that needs to be at the front of lfg messages. Only messages with this identifier at the beginning will trigger lfg requests. It is important to include the prefix you want the command to have!
      - The default for this option is "!lfg"
    - lfg_voice_ident: "string"
      - The string that needs to be included in the users voice channel for the LFG request to be permitted. For example, all LFG voice channels on Apex follow the scheme: `[Region] Team #`, thus the identifier is team.
      - The default for this option is "lfg"
    - lfg_text_ident: "string"
      - Same as lfg_voice_ident but used to test if the text channel the lfg request is started is a valid lfg channel. For example, all LFG text channels on Apex follow the scheme: `region-lfg-platform-casual/ranked`, thus the identifier is lfg.
      - The default for this option is "lfg"
    - lfg_message_compact: boolean
      - This specifies whether or not the LFG posts should be in a more compact format. You should test both true and false to see which one you like more.
      - The default for this option is true
    - lfg_list_others: boolean
      - This specifies whether or not to list the names of other users in the voice channel in the LFG post
      - The default for this option is true  
      
    - lfg_enable_emotes: boolean
      - Enable this if you want specific (or all) LFG posts to include emotes at the end of the message depending on the content of the request
      - The default for this option is false
    - lfg_emotes_chan_ident: "string"
      - This defines the identifier the lfg channels that should have this option enabled need to have in their name. For example, we want emoji of the different ranks to be displayed in ranked lfg channels on Apex. All ranked LFG text channels include `ranked`, thus the identifier is ranked.
      - The default for this option is ranked 
    - lfg_emotes_idents: ["string", ...]
      - This array defines the string that needs to be included in the lfg request to trigger the emote at the same position in the `lfg_emotes_names` array.
      - The default for this option is ["examplename1", "examplename2"]
    - lfg_emotes_names: ["string", ...]
      - This array defines the emotes (in `<:name:id>` format) that correspond to the identifiers above
      - The default for this option is ["<:test2:671473369891340293>", "<:testEmoji:608348601575407661>"]
    - lfg_emotes_found_append: "string"
      - This defines the message to be appended to the LFG post if emote identifiers are found, followed by the emotes themselves.
      - The default for this option is "\n\*\*Ranks in this message: **"
    - lfg_emotes_notfound_append: "string"
      - This defines the message to be appended to the LFG post if *no* emote identifiers are found.
      - The default for this option is "\n\*\*No ranks in this message**"  
      
    - lfg_enable_shrink: boolean
      - This defines whether or not we want voice channels to be shrinkable via specific identifiers
      - The default for this option is false
    - lfg_shrink_text_idents: ["string", ...]
      - This defines the identifier that needs to be included in the request message for the voice channel to be shrunk
      - The default for this option is ["duo", "1v1"]
    - lfg_shrink_normal_amt: int
      - The default size voice channels usually have. Needed to resize the channels back to normal once everyone left
      - The default for this option is 3
    - lfg_shrink_shrunk_amt: int
      - The size voice channels shall be shrunk to if the identifier is found in the message.
      - The default for this option is 2  
      
**These are all of the plugins and config options currently available**  

If you came here from the [Setup page](https://github.com/DarkView/JS-MRVNLFG/blob/master/docs/SETUP.md#keeping-the-bot-running), you can return there now once you set all of this up the way you want it!
