import { whereCommand } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { Member } from "eris";
import { UnknownUser, resolveMember } from "../../../utils";
import { sendErrorMessage } from "../../../pluginUtils";
import moment from "moment-timezone";
import { Notification } from "../utils/Notification";
import humanizeDuration from "humanize-duration";
import { logger } from "knub";

export const FollowCmd = whereCommand({
    trigger: ["follow", "f"],
    permission: "can_follow",
    source: "guild",

    signature: {
        user: ct.resolvedUserLoose(),
        time: ct.delay({required: false}),

        active: ct.bool({ required: false, option: true, isSwitch: true, shortcut: "a"}),
    },

    async run({ message: msg, args, pluginData }) {
        const cfg = pluginData.config.getForMember(msg.member);
        const timeout: any = args.time != null ? args.time : cfg.where_timeout;
        const active: boolean = args.active != null ? args.active : false;

        let member: Member;
        if (!(args.user instanceof UnknownUser)) {
            member = await resolveMember(pluginData.client, pluginData.guild, args.user.id);
        } else {
            sendErrorMessage(msg.channel, "Unknown user/member! Is the ID correct?");
            return;
        }

        const endTime: any = moment().add(timeout, "ms");
        pluginData.state.activeNotifications.push(new Notification(msg.author.id, member.id, msg.channel.id, endTime, true, active));

        if (!active) {
            msg.channel.createMessage(
                `I will let you know each time <@!${member.id}> switches channel in the next ${humanizeDuration(timeout)}`,
            );
        } else {
            msg.channel.createMessage(
                `I will let you know each time <@!${member.id}> switches channel in the next ${humanizeDuration(
                    timeout,
                )}.\nI will also move you to the users channel, please join a voice channel now so that i can move you!`,
            );
        }

        logger.info(
            `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested follow for ${member.id} - Active Follow: ${active}`,
        );
    }
});