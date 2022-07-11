import { CategoryChannel, GuildMember, MessageActionRow, Snowflake, TextChannel, VoiceChannel } from "discord.js";
import { GuildPluginData } from "knub";
import { ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { DateTime } from "luxon";
import { noop } from "knub/dist/utils";
import { logger } from "../../../utils/logger";
import { passesFilter } from "../../../utils/blockedWords";
import { LfgPluginType } from "../types";
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
    return `You must be in a LFG voice channel to create LFG posts!`;
  }

  /* let claimVoice: string | null = null;
  if (member.voice?.channelId !== pluginData.state.hubVoice.id) {
    const activeLfg = await pluginData.state.activeLfgs.findForVoice(member.voice.channelId);
    if (activeLfg?.claimable) {
      // This is claimable - handle request w/o creating channel
      claimVoice = activeLfg.voice_channel_id;
    } else {
      logger.info(
        `${member.id.slice(0, -3) + `XXX`} failed to create a LFG post because they are not in a vc`,
      );
      return `You must be in <#${pluginData.state.hubVoice.id}> to create LFG posts!`;
    }
  } */

  const fetched = await pluginData.guild.channels.fetch(member.voice.channelId) as VoiceChannel;
  const activeLfg = await pluginData.state.activeLfgs.findForVoice(member.voice.channelId);

  if (activeLfg) {
    const lastEdited = DateTime.fromMillis(parseInt(activeLfg.created_at, 10));
    const secondDiff = DateTime.now().diff(lastEdited, "seconds").seconds;
    if (secondDiff < 30) {
      logger.info(`${member.id} failed to create a LFG post because the 30 second cooldown has not expired (${30 - secondDiff})`);
      return `You can only create one LFG post per 30 seconds per channel. Please wait ${(30 - secondDiff).toString().substring(0, 2)} seconds.`;
    }

    const oldMessageText = await pluginData.guild.channels.fetch(activeLfg.text_channel_id) as TextChannel;
    const oldMessage = await oldMessageText.messages.fetch(activeLfg.message_id).catch(noop);
    if (oldMessage) oldMessage.delete().catch(noop);
  }

  if (fetched.members.size >= limit) {
    return `You cannot create a LFG post because your channel is or would be full.`;
  }

  if (fetched.userLimit !== limit) {
    await fetched.edit( {userLimit: limit} );
  }
  
  const embed = new EmbedBuilder({
    title: `${member.displayName} is looking for a group!`,
    color: member.displayColor,
    thumbnail: { url: member.displayAvatarURL({ dynamic: true }) },
    timestamp: new Date().toUTCString(),
    fields: [{ name: "Message", value: message, inline: false }],
  });

  const invite = await createOrReuseInvite(fetched, pluginData);
  const button = new ButtonBuilder({
    style: ButtonStyle.Link,
    emoji: { name: "🔊" },
    label: `Join ${member.displayName}'s group`,
    url: invite.url,
  }).toJSON();

  const postedMsg = await ((await pluginData.guild.channels.fetch(channel, { cache: true })) as TextChannel).send({
    embeds: [embed.data],
    components: [new MessageActionRow().addComponents(button)],
  });

  await pluginData.state.activeLfgs.claim(fetched.id, postedMsg.channelId, postedMsg.id, member.id);
  logger.info(`${member.id.slice(0, -3) + `XXX`} successfully created a LFG post (vc claimed)`);

  return "Successfully created LFG post!";
}

const LFG_CLEANUP_LOOP_INTERVAL = 60 * 1000;

export async function runLFGCleanupLoop(pluginData: GuildPluginData<LfgPluginType>) {
  await pluginData.state.activeLfgs.deleteStale();

  setTimeout(() => runLFGCleanupLoop(pluginData), LFG_CLEANUP_LOOP_INTERVAL);
}
async function createOrReuseInvite(vChannel: VoiceChannel, pluginData: GuildPluginData<LfgPluginType>) {
  return vChannel.createInvite({ maxAge: 0, reason: "LFG Request" });
}

