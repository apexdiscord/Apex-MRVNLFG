import fs from "fs";
import { PluginData } from "knub";
import { WherePluginType } from "../types";
import { logger } from "../../../logger";

export function saveActiveNotifications(pluginData: PluginData<WherePluginType>) {
  if (!pluginData.config.get().persist_notifications) return;

  fs.writeFile(
    `./notifications/${pluginData.guild.id}-normal.MRVN`,
    JSON.stringify(pluginData.state.activeNotifications),
    (err) => {
      if (err) {
        logger.info(err.name + "\n" + err.message);
      }
    },
  );

  fs.writeFile(
    `./notifications/${pluginData.guild.id}-voice.MRVN`,
    JSON.stringify(pluginData.state.activeVCNotifications),
    (err) => {
      if (err) {
        logger.info(err.name + "\n" + err.message);
      }
    },
  );
}
