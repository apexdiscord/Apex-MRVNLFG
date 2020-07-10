import { whereCommand } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { VoiceChannel } from "eris";
import { sendErrorMessage } from "../../../pluginUtils";
import moment from "moment-timezone";
import { Notification } from "../utils/Notification";
import humanizeDuration from "humanize-duration";
import { logger } from "knub";

export const VcNotifyCmd = whereCommand({
    trigger: ["vcnotify", "v", "vc", "vcn"],
    permission: "can_notify",
    source: "guild",

    signature: {
        channelId: ct.string(),
        time: ct.delay({required: false}),
    },

    async run({ message: msg, args, pluginData }) {
        const cfg = pluginData.config.getForMember(msg.member);
        const timeout: any = args.time != null ? args.time : cfg.where_timeout;

        const channel: VoiceChannel = pluginData.client.getChannel(args.channelId) as VoiceChannel;
        if (channel == null) {
            sendErrorMessage(msg.channel, "Couldnt find channel");
            return;
        }

        const endTime: any = moment().add(timeout, "ms");
        pluginData.state.activeVCNotifications.push(
            new Notification(msg.author.id, args.channelId, msg.channel.id, endTime, false, false),
        );
        msg.channel.createMessage(
            `I will notify you of all changes in \`${channel.name}\` for the next ${humanizeDuration(timeout)}`,
        );

        logger.info(
            `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested notify for vc ${args.channelId}`,
        );
    }
});