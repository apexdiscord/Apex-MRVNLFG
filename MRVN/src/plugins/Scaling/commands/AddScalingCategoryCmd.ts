import { commandTypeHelpers as ct } from "../../../commandTypes";
import { logger } from "../../../logger";
import { sendSuccessMessage, sendErrorMessage } from "../../../pluginUtils";
import { scalingCommand } from "../types";

export const AddScalingCategoryCmd = scalingCommand({
  trigger: ["scaling category add", "scaling category a", "scaling c a"],
  permission: "can_add",

  signature: {
    category: ct.categoryChannel(),
  },

  async run({ message: msg, args, pluginData }) {
    const isCategory = await pluginData.state.scalingCategories.getScalingCategory(args.category.id);
    if (isCategory != null) {
      sendErrorMessage(msg.channel, `Category \`${args.category.name}\` is already a Scaling category`);
      return;
    }

    pluginData.state.scalingCategories.add(args.category.id);
    sendSuccessMessage(msg.channel, `Category \`${args.category.name}\` added to Scaling categories`);
    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} added a new Category ${args.category.id} to Scaling Categories`,
    );
  },
});
