import { lfgCommand } from "../types";
import { logger } from "../../../logger";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendErrorMessage, sendSuccessMessage } from "../../../pluginUtils";

export const RemoveCategoryCmd = lfgCommand({
  trigger: ["lfg category remove", "lfg category r", "lfg c r"],
  permission: "can_manage_categories",

  signature: {
    category: ct.categoryChannel(),
  },

  async run({ message: msg, args, pluginData }) {
    const isCategory = await pluginData.state.categories.getLfgCategory(args.category.id);
    if (isCategory == null) {
      sendErrorMessage(msg.channel, `Category \`${args.category.name}\` is not a LFG category`);
      return;
    }

    pluginData.state.categories.remove(args.category.id);
    sendSuccessMessage(msg.channel, `Category \`${args.category.name}\` removed from LFG categories`);
    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} removed Category ${args.category.id} from LFG Categories`,
    );
  },
});
