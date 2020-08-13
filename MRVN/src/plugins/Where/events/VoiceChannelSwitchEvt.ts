import { TextableChannel, Member } from "eris";
import { whereEvent } from "../types";
import { sendWhere } from "../utils/sendWhere";
import { sendErrorMessage } from "../../../pluginUtils";
import moment from "moment-timezone";
import { moveRequestor } from "../utils/moveRequestor";

export const VoiceChannelSwitchEvt = whereEvent({
  event: "voiceChannelSwitch",

  async listener(meta) {
    const pluginData = meta.pluginData;
    const newChannel = meta.args.newChannel;
    const member = meta.args.member;

    let obsolete = false;

    const notifies = await pluginData.state.notifyRequests.getAllForUserId(member.id);

    notifies.forEach(async (notif) => {
      if (moment(notif.endTime) >= moment()) {
        const channel: TextableChannel = pluginData.guild.channels.get(notif.channel_id) as TextableChannel;
        sendWhere(
          pluginData.guild,
          member,
          channel,
          "<@!" + notif.requestor_id + "> a notification requested by you has triggered:\n",
        );

        if (notif.active) {
          const modMember: Member = await pluginData.client.getRESTGuildMember(pluginData.guild.id, notif.requestor_id);
          moveRequestor(modMember, newChannel.id, channel);
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
