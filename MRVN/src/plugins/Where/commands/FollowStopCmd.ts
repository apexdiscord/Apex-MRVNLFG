import { whereCommand } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendSuccessMessage } from "../../../pluginUtils";
import { logger } from "../../../logger";
import { removeNotifyforUserId } from "../utils/removeNotifyForUserId";

export const FollowStopCmd = whereCommand({
  trigger: ["follow stop", "fs", "fd", "ns", "nd"],
  permission: "can_follow",
  source: "guild",

  signature: {
    user: ct.resolvedUserLoose(),
  },

  async run({ message: msg, args, pluginData }) {
    removeNotifyforUserId(pluginData, args.user.id);
    sendSuccessMessage(msg.channel, `Deleted all your follow and notify requests for <@!${args.user.id}>!`);
    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested notify/follow deletion for ${args.user.id}`,
    );
  },
});
