import { logger } from "../../../logger";
import { sendSuccessMessage, sendErrorMessage } from "../../../pluginUtils";
import { scalingCommand } from "../types";
import { doAutomaticScaling } from "../utils/doAutomaticScaling";

export const RunScalingCmd = scalingCommand({
  trigger: ["scaling run", "scaling r"],
  permission: "can_unhide",

  async run({ message: msg, pluginData }) {
    doAutomaticScaling(pluginData);
    sendSuccessMessage(msg.channel, `Executed automatic scaling manually`);
    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} executed automatic scaling manually`,
    );
  },
});
