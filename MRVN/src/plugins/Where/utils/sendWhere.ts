import { Guild, Member, TextableChannel, VoiceChannel } from "eris";
import { getInviteLink } from "knub/dist/helpers";
import { sendErrorMessage } from "../../../pluginUtils";
import { logger } from "../../../logger";
import { createOrReuseInvite } from "./createOrReuseInvite";

export async function sendWhere(
  guild: Guild,
  member: Member,
  channel: TextableChannel,
  prepend?: string,
): Promise<void> {
  let voice: VoiceChannel = null;
  try {
    voice = guild.channels.get(member.voiceState.channelID) as VoiceChannel;
  } catch (e) {
    sendErrorMessage(channel, "Could not retrieve information on that user!\nAre they on the server?");
    return;
  }

  if (voice == null) {
    channel.createMessage(prepend + "That user is not in a channel");
  } else {
    let invite = null;
    try {
      invite = await createOrReuseInvite(voice);
    } catch (e) {
      sendErrorMessage(channel, `Could not create an invite to that channel!\nReason: \`${e}\``);
      logger.info(`${e}\nGuild: ${guild.name}\nMember: ${member.id}\nPrepend: ${prepend}`);
      return;
    }
    channel.createMessage(
      `${prepend}<@!${member.id}> is in the following channel: \`${voice.name}\` ${getInviteLink(invite)}`,
    );
  }
}
