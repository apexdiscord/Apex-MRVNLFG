import { TextableChannel, Member } from "eris";
import { whereEvent } from "../types";
import { sendWhere } from "../utils/sendWhere";
import { sendErrorMessage } from "../../../pluginUtils";

export const VoiceChannelJoinEvt = whereEvent({
  event: "voiceChannelJoin",

  async listener(meta) {
    const pluginData = meta.pluginData;

    const newChannel = meta.args.newChannel;
    const member = meta.args.member;
    let obsolete: boolean = false;

    const notifies = await pluginData.state.notifyRequests.getAllForUserId(member.id);

    notifies.forEach(async (notif) => {
      if (notif.endTime >= Date.now()) {
        const channel: TextableChannel = pluginData.client.getChannel(notif.channel_id) as TextableChannel;
        sendWhere(
          pluginData.guild,
          member,
          channel,
          "<@!" + notif.requestor_id + "> a notification requested by you has triggered:\n",
        );

        if (notif.active) {
          const modMember: Member = await pluginData.client.getRESTGuildMember(pluginData.guild.id, notif.requestor_id);
          if (modMember.voiceState.channelID != null) {
            try {
              await modMember.edit({
                channelID: newChannel.id,
              });
            } catch (e) {
              sendErrorMessage(channel, "Failed to move you. Are you in a voice channel?");
              return;
            }
          }
        }

        if (!notif.persist) {
          obsolete = true;
        }
      } else {
        obsolete = true;
      }
    });

    if (obsolete) {
      pluginData.state.notifyRequests.removeAllUserNotifiesForUserId(member.id);
    }
  },
});
