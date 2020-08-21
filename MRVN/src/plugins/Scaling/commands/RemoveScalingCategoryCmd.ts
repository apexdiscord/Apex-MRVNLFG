import { logger } from "../../../logger";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendErrorMessage, sendSuccessMessage } from "../../../pluginUtils";
import { scalingCommand } from "../types";

export const RemoveScalingCategoryCmd = scalingCommand({
  trigger: ["scaling category remove", "scaling category r", "scaling c r"],
  permission: "can_remove",

  signature: {
    category: ct.categoryChannel(),
  },

  async run({ message: msg, args, pluginData }) {
    const isCategory = await pluginData.state.scalingCategories.getScalingCategory(args.category.id);
    if (isCategory == null) {
      sendErrorMessage(msg.channel, `Category \`${args.category.name}\` is not a Scaling category`);
      return;
    }

    pluginData.state.scalingCategories.remove(args.category.id);
    sendSuccessMessage(msg.channel, `Category \`${args.category.name}\` removed from Scaling categories`);
    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} removed Category ${args.category.id} from Scaling Categories`,
    );
  },
});
