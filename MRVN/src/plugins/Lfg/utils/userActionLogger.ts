import { VoiceChannel } from "discord.js";
import { GuildPluginData } from "knub";
import { logger } from "../../../utils/logger";
import { LfgPluginType } from "../types";

export async function logBlock(initiatorId: string, targetId: string, pluginData: GuildPluginData<LfgPluginType>) {
  await pluginData.state.logText.send({
    content: `⛔ <@${initiatorId}> (${initiatorId}) blocked <@${targetId}> (${targetId})`,
    allowedMentions: { users: [] },
  });
  logger.info(`${initiatorId.slice(0, -3) + `XXX`} blocked ${targetId.slice(0, -3) + `XXX`}`);
}

export async function logUnblock(initiatorId: string, targetId: string, pluginData: GuildPluginData<LfgPluginType>) {
  await pluginData.state.logText.send({
    content: `✅ <@${initiatorId}> (${initiatorId}) unblocked <@${targetId}> (${targetId})`,
    allowedMentions: { users: [] },
  });
  logger.info(`${initiatorId.slice(0, -3) + `XXX`} unblocked ${targetId.slice(0, -3) + `XXX`}`);
}

export async function logBannedWord(initiatorId: string, message: string, filtered: string, pluginData: GuildPluginData<LfgPluginType>) {
  await pluginData.state.alertText.send({
    content: `⚠️ <@${initiatorId}> (${initiatorId}) tried to create LFG with a banned word \`${filtered}\`: \`${message}\``,
    allowedMentions: { users: [] },
  });
  logger.warn(`${initiatorId} tried to create LFG with a banned word: ${message}`);
}

export async function logKick(
  initiatorId: string,
  targetId: string,
  voice: VoiceChannel,
  pluginData: GuildPluginData<LfgPluginType>,
) {
  await pluginData.state.logText.send({
    content: `🥾 <@${initiatorId}> (${initiatorId}) kicked <@${targetId}> (${targetId}) out of their channel (${voice.id}, \`${voice.name}\`)`,
    allowedMentions: { users: [] },
  });
  logger.info(`${initiatorId.slice(0, -3) + `XXX`} kicked ${targetId.slice(0, -3) + `XXX`} out of channel ${voice.id}`);
}

export async function logBan(initiatorId: string, targetId: string, pluginData: GuildPluginData<LfgPluginType>) {
  await pluginData.state.logText.send({
    content: `🔨 <@${initiatorId}> (${initiatorId}) banned <@${targetId}> (${targetId}) from using LFG`,
    allowedMentions: { users: [] },
  });
  logger.info(`${initiatorId} banned ${targetId} from using LFG`);
}
