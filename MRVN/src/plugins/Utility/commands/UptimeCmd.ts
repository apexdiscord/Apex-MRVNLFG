import humanizeDuration from "humanize-duration";
import { utilityCommand } from "../types";
import { getUptime } from "../../../utils";
import { logger } from "../../../logger";

export const UptimeCmd = utilityCommand({
  trigger: "uptime",
  permission: "can_uptime",
  cooldown: 5 * 1000,

  async run({ message: msg, pluginData }) {
    msg.channel.createMessage(
      `**Current Uptime:** ${humanizeDuration(getUptime(), {
        largest: 2,
        round: true,
      })}`,
    );

    logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested bot uptime`);
  },
});
