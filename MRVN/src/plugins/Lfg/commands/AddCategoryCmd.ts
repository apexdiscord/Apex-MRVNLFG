import { lfgCommand } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { logger } from "../../../logger";
import { sendSuccessMessage, sendErrorMessage } from "../../../pluginUtils";

export const AddCategoryCmd = lfgCommand({
  trigger: ["lfg category add", "lfg category a", "lfg c a"],
  permission: "can_manage_categories",

  signature: {
    category: ct.categoryChannel(),
  },

  async run({ message: msg, args, pluginData }) {
    const isCategory = await pluginData.state.categories.getLfgCategory(args.category.id);
    if (isCategory != null) {
      sendErrorMessage(msg.channel, `Category \`${args.category.name}\` is already a LFG category`);
      return;
    }

    pluginData.state.categories.add(args.category.id);
    sendSuccessMessage(msg.channel, `Category \`${args.category.name}\` added to LFG categories`);
    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} added a new Category ${args.category.id} to LFG Categories`,
    );
  },
});
