import { commandTypeHelpers as ct } from "../../../commandTypes";
import { logger } from "../../../logger";
import { sendSuccessMessage, sendErrorMessage } from "../../../pluginUtils";
import { scalingCommand } from "../types";

export const HideScalingCategoryCmd = scalingCommand({
  trigger: ["scaling hide", "scaling h"],
  permission: "can_hide",

  signature: {
    category: ct.categoryChannel(),
  },

  async run({ message: msg, args, pluginData }) {
    let isCategory = await pluginData.state.scalingCategories.getScalingCategory(args.category.id);
    if (isCategory == null) {
      sendErrorMessage(msg.channel, `Category \`${args.category.name}\` is not a Scaling category`);
      return;
    }

    const everyonePerm = args.category.permissionOverwrites.find(x => x.id === pluginData.guild.id);
    if ((everyonePerm.deny & pluginData.state.hidePermission) > 0) {
      sendErrorMessage(msg.channel, `Category \`${args.category.name}\` is already hidden`);
      return;
    } else {
      if ((everyonePerm.allow & pluginData.state.hidePermission) > 0) {
        await args.category.editPermission(pluginData.guild.id, everyonePerm.allow - pluginData.state.hidePermission, everyonePerm.deny + pluginData.state.hidePermission, "role");
      } else {
        await args.category.editPermission(pluginData.guild.id, everyonePerm.allow, everyonePerm.deny + pluginData.state.hidePermission, "role");
      }
    }

    isCategory = await pluginData.state.scalingUnhides.getForCategoryId(args.category.id);
    if (isCategory != null) {
      pluginData.state.scalingUnhides.remove(isCategory.id);
    }
    
    sendSuccessMessage(msg.channel, `Category \`${args.category.name}\` hidden`);
    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} hid Category ${args.category.id}`,
    );
  },
});
