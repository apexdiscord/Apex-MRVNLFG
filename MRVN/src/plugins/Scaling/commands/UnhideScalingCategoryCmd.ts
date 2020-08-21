import { commandTypeHelpers as ct } from "../../../commandTypes";
import { logger } from "../../../logger";
import { sendSuccessMessage, sendErrorMessage } from "../../../pluginUtils";
import { scalingCommand } from "../types";
import moment from "moment-timezone";
import humanizeDuration from "humanize-duration";

export const UnhideScalingCategoryCmd = scalingCommand({
  trigger: ["scaling unhide", "scaling u"],
  permission: "can_unhide",

  signature: {
    category: ct.categoryChannel(),
    for: ct.delay({required: false}),
  },

  async run({ message: msg, args, pluginData }) {
    const isCategory = await pluginData.state.scalingCategories.getScalingCategory(args.category.id);
    if (isCategory == null) {
      sendErrorMessage(msg.channel, `Category \`${args.category.name}\` is not a Scaling category`);
      return;
    }

    const everyonePerm = args.category.permissionOverwrites.find(x => x.id === pluginData.guild.id);
    if ((everyonePerm.allow & pluginData.state.hidePermission) > 0) {
      sendErrorMessage(msg.channel, `Category \`${args.category.name}\` is already unhidden`);
      return;
    } else {
      if ((everyonePerm.deny & pluginData.state.hidePermission) > 0) {
        await args.category.editPermission(pluginData.guild.id, everyonePerm.allow + pluginData.state.hidePermission, everyonePerm.deny - pluginData.state.hidePermission, "role");
      } else {
        await args.category.editPermission(pluginData.guild.id, everyonePerm.allow + pluginData.state.hidePermission, everyonePerm.deny, "role");
      }
    }

    args.for = args.for ? args.for : 60 * 60 * 1000
    const forTime = moment().add(args.for, "ms").valueOf();
    await pluginData.state.scalingUnhides.add(args.category.id, msg.author.id, forTime);

    sendSuccessMessage(msg.channel, `Category \`${args.category.name}\` unhidden for at least ${humanizeDuration(args.for)}`);
    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} unhid Category ${args.category.id} for at least ${humanizeDuration(args.for)}`,
    );
  },
});
