import { Member } from "eris";
import moment from "moment-timezone";
import humanizeDuration from "humanize-duration";
import { whereCommand } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { UnknownUser, resolveMember } from "../../../utils";
import { sendErrorMessage } from "../../../pluginUtils";
import { Notification } from "../utils/Notification";
import { logger } from "../../../logger";
import { saveActiveNotifications } from "../utils/saveActiveNotifications";

export const NotifyCmd = whereCommand({
  trigger: ["notify", "n"],
  permission: "can_notify",
  source: "guild",

  signature: {
    user: ct.resolvedUserLoose(),
    time: ct.delay({ required: false }),
  },

  async run({ message: msg, args, pluginData }) {
    let member: Member;
    if (!(args.user instanceof UnknownUser)) {
      member = await resolveMember(pluginData.client, pluginData.guild, args.user.id);
    } else {
      sendErrorMessage(msg.channel, "Unknown user/member! Is the ID correct?");
      return;
    }

    const cfg = pluginData.config.getForMember(msg.member);
    const timeout: any = args.time != null ? args.time : cfg.where_timeout;

    const endTime: any = moment().add(timeout, "ms");
    pluginData.state.activeNotifications.push(
      new Notification(msg.author.id, member.id, msg.channel.id, endTime, false, false),
    );
    saveActiveNotifications(pluginData);

    msg.channel.createMessage(
      `If <@!${member.id}> joins or switches VC in the next ${humanizeDuration(timeout)} i will notify you`,
    );

    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested notify for ${member.id}`,
    );
  },
});
