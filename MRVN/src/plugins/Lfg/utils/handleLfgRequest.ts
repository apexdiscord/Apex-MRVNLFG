import { GuildMember, MessageActionRow, MessagePayload, Snowflake, TextChannel, VoiceChannel } from "discord.js";
import { GuildPluginData } from "knub";
import { ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { logger } from "../../../utils/logger";
import { passesFilter } from "../../../utils/blockedWords";
import { LfgPluginType } from "../types";
import { getRandomChannelName } from "./getChannelName";
import { logBannedWord } from "./userActionLogger";

export async function handleLfgRequest(
  member: GuildMember | Snowflake,
  message: string,
  channel: string,
  limit: number,
  pluginData: GuildPluginData<LfgPluginType>,
): Promise<string> {
  if (member instanceof GuildMember) {
    // Do nothing
  } else {
    member = await pluginData.guild.members.fetch({ force: true, withPresences: false, user: member });
  }

  if (!passesFilter(message)) {
    await logBannedWord(member.id, message, pluginData);
    return "Your message contains a banned word. This incident will be reported.";
  }

  if (message.length > 250) {
    return `Your message is too long. The character limit is 250 characters, your message is ${message.length} characters long.`;
  }

  if (await pluginData.state.modbans.isBanned(member.id)) {
    logger.info(`${member.id} failed to create a LFG post because they are banned from LFG`);
    return "You are banned from using LFG. Please contact ModMail if you believe this is an error.";
  }

  if (!member.voice.channelId) {
    logger.info(
      `${member.id.slice(0, -3) + `XXX`} failed to create a LFG post because they are not in any voice channel`,
    );
    return `You must be in <#${pluginData.state.hubVoice.id}> to create LFG posts!`;
  }

  let claimVoice: string | null = null;
  if (member.voice?.channelId !== pluginData.state.hubVoice.id) {
    const activeLfg = await pluginData.state.activeLfgs.findForVoice(member.voice.channelId);
    if (activeLfg?.claimable) {
      // This is claimable - handle request w/o creating channel
      claimVoice = activeLfg.voice_channel_id;
    } else {
      logger.info(
        `${member.id.slice(0, -3) + `XXX`} failed to create a LFG post because they are not in the hub voice channel`,
      );
      return `You must be in <#${pluginData.state.hubVoice.id}> to create LFG posts!`;
    }
  }

  let created: VoiceChannel | null = null;
  try {
    if (claimVoice == null) {
      for (let i = 0; i < pluginData.state.lfgCats.length; i++) {
        const amt = pluginData.state.lfgCatAmt[i];
        if (amt >= pluginData.state.lfgCatLimit) {
          continue;
        }

        created = await pluginData.guild.channels.create(getRandomChannelName(), {
          parent: pluginData.state.lfgCats[i],
          type: "GUILD_VOICE",
          userLimit: limit,
          reason: "LFG request",
        });
        pluginData.state.lfgCatAmt[i] = pluginData.state.lfgCatAmt[i] + 1;
        await member.edit({ channel: created.id }, "LFG Request");
        break;
      }

      if (!created) {
        logger.warn(`${member.id.slice(0, -3) + `XXX`} failed to create a LFG post because all categories are full`);
        return "Sorry, all LFG categories are currently full.\nPlease message ModMail.";
      }
    } else {
      created = (await pluginData.guild.channels.fetch(claimVoice)) as VoiceChannel;
      if (created == null) {
        logger.error("Failed to fetch voice channel for LFG claim request, ID: " + claimVoice);
        return "Unspecified error claiming LFG channel.\nPlease message ModMail.";
      }
    }
  } catch (e) {
    logger.error(e);
    return `Failed to create LFG channel or move you: \`${e}\`.\nPlease message ModMail.`;
  }

  const embed = new EmbedBuilder({
    title: `${member.displayName} is looking for a group!`,
    color: member.displayColor,
    thumbnail: { url: member.displayAvatarURL({ dynamic: true }) },
    timestamp: new Date().toUTCString(),
    fields: [{ name: "Message", value: message, inline: false }],
  });

  const button = new ButtonBuilder({
    style: ButtonStyle.Success,
    emoji: { name: "🔊" },
    label: `Join ${member.displayName}'s group`,
    custom_id: `lfg::join::${member.id}::${created.id}`,
    type: ComponentType.Button,
    disabled: false,
  }).toJSON();

  const postedMsg = await ((await pluginData.guild.channels.fetch(channel, { cache: true })) as TextChannel).send({
    embeds: [embed.data],
    components: [new MessageActionRow().addComponents(button)],
  });

  if (claimVoice == null) {
    await pluginData.state.activeLfgs.add(created.id, postedMsg.channelId, postedMsg.id, member.id);
    logger.info(`${member.id.slice(0, -3) + `XXX`} successfully created a LFG post (new vc created)`);
  } else {
    await pluginData.state.activeLfgs.claim(created.id, postedMsg.channelId, postedMsg.id, member.id);
    logger.info(`${member.id.slice(0, -3) + `XXX`} successfully created a LFG post (old vc claimed)`);
  }

  return "Successfully created LFG post!";
}

const LFG_CLEANUP_LOOP_INTERVAL = 60 * 1000;

export async function runLFGCleanupLoop(pluginData: GuildPluginData<LfgPluginType>) {
  await pluginData.state.activeLfgs.deleteStale();

  setTimeout(() => runLFGCleanupLoop(pluginData), LFG_CLEANUP_LOOP_INTERVAL);
}
