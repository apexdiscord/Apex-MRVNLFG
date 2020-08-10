import fs from "fs";
import { PluginData } from "knub";
import { ApexEventsPluginType, TEvent } from "../types";

export async function loadEventMessages(pluginData: PluginData<ApexEventsPluginType>) {
  if (!fs.existsSync(`./events/${pluginData.guild.id}-messages.MRVN`)) return;

  pluginData.state.events = JSON.parse(
    fs.readFileSync(`./events/${pluginData.guild.id}-messages.MRVN`).toString(),
  ) as TEvent[];
}
