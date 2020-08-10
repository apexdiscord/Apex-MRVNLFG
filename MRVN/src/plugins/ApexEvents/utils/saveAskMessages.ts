import fs from "fs";
import { PluginData } from "knub";
import { logger } from "../../../logger";
import { ApexEventsPluginType } from "../types";

export function saveAskMessages(pluginData: PluginData<ApexEventsPluginType>) {
  if (!fs.existsSync("./events")) {
    fs.mkdirSync("./events");
  }

  fs.writeFile(`./events/${pluginData.guild.id}-asks.MRVN`, JSON.stringify(pluginData.state.asks), (err) => {
    if (err) {
      logger.info(err.name + "\n" + err.message);
    }
  });
}
