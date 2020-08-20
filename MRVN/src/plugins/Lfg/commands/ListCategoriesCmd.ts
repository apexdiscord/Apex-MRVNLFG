import { lfgCommand } from "../types";
import { createChunkedMessage } from "knub/dist/helpers";
import { sendErrorMessage } from "../../../pluginUtils";

export const ListCategoryCmd = lfgCommand({
  trigger: ["lfg category list", "lfg category l", "lfg c l"],
  permission: "can_manage_categories",

  async run({ message: msg, pluginData }) {
    const allCategories = await pluginData.state.categories.getAllLfgCategories();
    if (allCategories == null || allCategories.length === 0) {
      sendErrorMessage(msg.channel, `No LFG categories registered`);
      return;
    }

    let all = "The following channels are valid LFG categories:\n";
    allCategories.forEach(cat => {
      all += cat.category_id;
    });
    createChunkedMessage(msg.channel, all);
  },
});
