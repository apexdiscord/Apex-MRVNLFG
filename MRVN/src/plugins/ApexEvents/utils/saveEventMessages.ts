import fs from "fs";
import { PluginData } from "knub";
import { logger } from "../../../logger";
import { ApexEventsPluginType } from "../types";

export function saveEventMessages(pluginData: PluginData<ApexEventsPluginType>) {
  if (!fs.existsSync("./events")) {
    fs.mkdirSync("./events");
  }

  fs.writeFile(`./events/${pluginData.guild.id}-messages.MRVN`, JSON.stringify(pluginData.state.events), (err) => {
    if (err) {
      logger.info(err.name + "\n" + err.message);
    }
  });
}
