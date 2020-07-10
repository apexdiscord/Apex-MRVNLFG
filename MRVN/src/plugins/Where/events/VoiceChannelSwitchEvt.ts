import { whereEvent } from "../types";
import { TextableChannel, Member, VoiceChannel } from "eris";
import { sendWhere } from "../utils/sendWhere";
import { sendErrorMessage } from "../../../pluginUtils";
import { removeNotifyforUserId } from "../utils/removeNotifyForUserId";
import { removeVCNotifyforChannelId } from "../utils/removeNotifyForChannelId";


export const VoiceChannelSwitchEvt = whereEvent({
    event: "voiceChannelSwitch",

    async listener(meta) {
        const pluginData = meta.pluginData;
        const newChannel = meta.args.newChannel;
        const oldChannel = meta.args.oldChannel;
        const member = meta.args.member;

        let obsolete = false;
        const newVoice = pluginData.client.getChannel(newChannel.id) as VoiceChannel;
        const oldVoice = pluginData.client.getChannel(oldChannel.id) as VoiceChannel;

        pluginData.state.activeNotifications.forEach(async (notif) => {
            if (notif.subjectId === member.id) {
                if (notif.endTime >= Date.now()) {
                    const channel = pluginData.client.getChannel(notif.channelId) as TextableChannel;
                    sendWhere(
                        pluginData.guild,
                        member,
                        channel,
                        "<@!" + notif.modId + "> a notification requested by you has triggered:\n",
                    );

                    if (notif.activeFollow) {
                        const modMember: Member = await pluginData.client.getRESTGuildMember(pluginData.guild.id, notif.modId);
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
            }
        });

        if (obsolete) {
            removeNotifyforUserId(pluginData, member.id);
        }

        obsolete = false;
        pluginData.state.activeVCNotifications.forEach((notif) => {
            if (notif.subjectId === newChannel.id) {
                if (Date.now() >= notif.endTime) {
                    obsolete = true;
                } else {
                    const text = pluginData.client.getChannel(notif.channelId) as TextableChannel;
                    text.createMessage(
                        `🔵 <@!${notif.modId}> The user <@!${member.id}> switched to the channel \`${newVoice.name}\` from \`${oldVoice.name}\``,
                    );
                }
            }
        });

        pluginData.state.activeVCNotifications.forEach((notif) => {
            if (notif.subjectId === oldChannel.id) {
                if (Date.now() >= notif.endTime) {
                    obsolete = true;
                } else {
                    const text = pluginData.client.getChannel(notif.channelId) as TextableChannel;
                    text.createMessage(
                        `🔴 <@!${notif.modId}> The user <@!${member.id}> switched out of the channel \`${oldVoice.name}\` and joined \`${newVoice.name}\``,
                    );
                }
            }
        });

        if (obsolete) {
            removeVCNotifyforChannelId(pluginData, member.id);
        }
    },
});