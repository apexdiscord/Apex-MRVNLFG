import { performance } from "perf_hooks";
import { TextChannel, VoiceChannel } from "eris";
import { lfgEvent } from "../types";
import { passesFilter } from "../../../blockedWords";
import { shrinkChannel } from "../utils/shrinkChannel";
import { handleMessageCreation } from "../utils/handleMessageCreation";
import { updateDelayTime } from "../utils/updateDelayTime";
import { logger } from "../../../logger";

export const LfgMessageCreateEvt = lfgEvent({
  event: "messageCreate",
  allowBots: false,
  allowOutsideOfGuild: false,

  async listener(meta) {
    const pluginData = meta.pluginData;
    const msg = meta.args.message;

    const cfg = meta.pluginData.config.getForMember(msg.member);
    const requestor = msg.member;
    const text = pluginData.client.getChannel(msg.channel.id) as TextChannel;
    const start: any = performance.now();

    // check if the text channel is a valid LFG text channel
    if (!text.name.toLowerCase().includes(cfg.lfg_text_ident.toLowerCase())) {
      return;
    }

    // why this weird german character: "ß"? Because [\s\S] didnt work
    let regex: RegExp = new RegExp("^" + cfg.lfg_command_ident + "([^ß]|[ß])*$", "i");
    // check if the message is an actual LFG request
    if (msg.content.match(regex) == null) {
      if (cfg.lfg_enable_shrink) {
        await unshrinkCommand(meta);
      }
      return;
    }

    logger.info(
      `${requestor.id}: ${requestor.username}#${requestor.discriminator} Started LFG request in ${text.name}`,
    );

    // make sure the text does not include a word blocked in blocked.yml
    if (!passesFilter(msg.cleanContent)) {
      logger.info(
        `${requestor.id}: ${requestor.username}#${requestor.discriminator} Stopped LFG request: triggered word filter`,
      );
      return;
    }

    let voice;
    try {
      voice = pluginData.client.getChannel(requestor.voiceState.channelID) as VoiceChannel;
    } catch {
      text.createMessage("Sorry, but you have to be in a lfg voice channel! " + requestor.mention);
      logger.info(
        `${requestor.id}: ${requestor.username}#${requestor.discriminator} Stopped LFG request: Not in channel`,
      );
      return;
    }

    regex = new RegExp("^([^ß]|[ß])*" + cfg.lfg_voice_ident + "([^ß]|[ß])*$", "i");

    // make sure the users voice channel is a valid lfg voice channel
    if (voice.name.match(regex) == null) {
      text.createMessage("Sorry, but you have to be in a lfg voice channel! " + requestor.mention);
      logger.info(
        `${requestor.id}: ${requestor.username}#${requestor.discriminator} Stopped LFG request: Not in channel`,
      );
      return;
    }

    const voiceLimit: any = voice.userLimit > 0 ? voice.userLimit : 999;
    if (voice.voiceMembers.size >= voiceLimit) {
      text.createMessage("Sorry, but that voice channel is full! " + requestor.mention);
      logger.info(
        `${requestor.id}: ${requestor.username}#${requestor.discriminator} Stopped LFG request: Channel full`,
      );
      return;
    }

    let userMessage: string = msg.content.substring(cfg.lfg_command_ident.length).trim();

    // todo: change to config option
    if (userMessage.length > 275) {
      text.createMessage("Sorry, but that message is too long! " + requestor.mention);
      logger.info(
        `${requestor.id}: ${requestor.username}#${requestor.discriminator} Stopped LFG request: Message length = ${userMessage.length}`,
      );
      return;
    }

    regex = new RegExp("`", "g");
    userMessage = userMessage.replace(regex, "");

    if (userMessage !== "") {
      userMessage = cfg.lfg_message_compact ? `\`${userMessage}\`` : `\`\`\`${userMessage}\`\`\``;
    }

    let emotes: boolean = false;
    if (cfg.lfg_enable_emotes) {
      emotes = text.name.includes(cfg.lfg_emotes_chan_ident);
    }

    try {
      await msg.channel.getMessage(msg.id);
    } catch (error) {
      logger.info(
        `${requestor.id}: ${requestor.username}#${requestor.discriminator} Stopped LFG request: Source message not found (${msg.id}). It was probably deleted. [${error}]`,
      );
      return;
    }

    await shrinkChannel(voice, userMessage, cfg);

    const toPost: any = await handleMessageCreation(pluginData, voice, requestor, userMessage, emotes);
    msg.channel.createMessage(toPost);

    logger.info(`${requestor.id}: ${requestor.username}#${requestor.discriminator} Succesfully completed LFG request`);

    // add time taken for this command to the delays array so the delay command has up-to-date info
    updateDelayTime(pluginData, start);
  },
});

async function unshrinkCommand(meta) {
  const pluginData = meta.pluginData;
  const msg = meta.args.message;
  const cfg = meta.pluginData.config.getForMember(msg.member);
  const requestor = msg.member;
  const text = pluginData.client.getChannel(msg.channel.id) as TextChannel;

  let regex = new RegExp("^" + cfg.lfg_shrink_ident + "([^ß]|[ß])*$", "i");
  const msgText = msg.content.split(" ");
  if (msgText[0].match(regex) != null) {
    let shrinkTo = cfg.lfg_shrink_default;

    if (msgText.length > 1) {
      const sizeArg = Number(msgText[1]);
      shrinkTo = cfg.lfg_shrink_shrunk_amts.includes(sizeArg) ? sizeArg : shrinkTo;
    }

    const voice = pluginData.client.getChannel(requestor.voiceState.channelID) as VoiceChannel;
    regex = new RegExp("^([^ß]|[ß])*" + cfg.lfg_voice_ident + "([^ß]|[ß])*$", "i");
    // make sure the users voice channel is a valid lfg voice channel
    if (voice.name.match(regex) != null) {
      try {
        voice.edit({ userLimit: shrinkTo });
        text.createMessage(
          `I have shrunk the channel to ${shrinkTo}!\nIf this was not the specified size, it might not be allowed ${requestor.mention}`,
        );
        logger.info(
          `${requestor.id}: ${requestor.username}#${requestor.discriminator} Shrunk channel ${voice.name} | ${voice.id} to ${shrinkTo}`,
        );
      } catch (error) {
        logger.error(`Ran into an error trying to unshrink channel (${voice.id}). Are we missing a permission?`);
        logger.error(error);
      }
    } else {
      text.createMessage("Sorry, but you have to be in a LFG voice channel to shrink! " + requestor.mention);
    }

    try {
      await msg.delete("Shrink Request");
    } catch (error) {
      logger.error(`Failed to delete source message (${msg.id}). It was probably deleted already or we had a timeout`);
      logger.error(error);
    }
  } else {
    regex = new RegExp("^" + cfg.lfg_unshrink_ident + "([^ß]|[ß])*$", "i");
    if (msg.content.match(regex) != null) {
      const voice: VoiceChannel = pluginData.client.getChannel(requestor.voiceState.channelID) as VoiceChannel;
      regex = new RegExp("^([^ß]|[ß])*" + cfg.lfg_voice_ident + "([^ß]|[ß])*$", "i");
      if (voice.name.match(regex) != null) {
        if (voice.userLimit !== cfg.lfg_shrink_normal_amt) {
          try {
            voice.edit({ userLimit: cfg.lfg_shrink_normal_amt });
            text.createMessage("I have returned the channel to its normal capacity! " + requestor.mention);
            logger.info(
              `${requestor.id}: ${requestor.username}#${requestor.discriminator} Unshrunk channel ${voice.name} | ${voice.id} to ${cfg.lfg_shrink_normal_amt}`,
            );
          } catch (error) {
            logger.error(`Ran into an error trying to unshrink channel (${voice.id}). Are we missing a permission?`);
            logger.error(error);
          }
        } else {
          text.createMessage("Sorry, but that voice channel is already at normal capacity! " + requestor.mention);
        }
      } else {
        text.createMessage("Sorry, but you have to be in a LFG voice channel to unshrink! " + requestor.mention);
      }

      try {
        await msg.delete("Unshrink Request");
      } catch (error) {
        logger.error(
          `Failed to delete source message (${msg.id}). It was probably deleted already or we had a timeout`,
        );
        logger.error(error);
      }
    }
  }
}
