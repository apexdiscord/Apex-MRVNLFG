import { createChunkedMessage } from "knub/dist/helpers";
import { sendErrorMessage } from "../../../pluginUtils";
import { scalingCommand } from "../types";

export const ListScalingCategoryCmd = scalingCommand({
  trigger: ["scaling category list", "scaling category l", "scaling c l"],
  permission: "can_add",

  async run({ message: msg, pluginData }) {
    const allCategories = await pluginData.state.scalingCategories.getAllScalingCategories();
    if (allCategories == null || allCategories.length === 0) {
      sendErrorMessage(msg.channel, `No Scaling categories registered`);
      return;
    }

    let all = "The following channels are valid Scaling categories:\n";
    allCategories.forEach((cat) => {
      all += cat.category_id + "\n";
    });
    createChunkedMessage(msg.channel, all.trim());
  },
});
