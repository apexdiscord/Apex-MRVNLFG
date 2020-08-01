import { WherePluginType } from "../types";
import { PluginData } from "knub";
import fs from "fs";
import { logger } from "../../../logger";

export function loadActiveNotifications(pluginData: PluginData<WherePluginType>) {
    if (!pluginData.config.get().persist_notifications) return;

    if (!fs.existsSync(`./notifications/${pluginData.guild.id}-normal.MRVN`)) return;
    if (!fs.existsSync(`./notifications/${pluginData.guild.id}-voice.MRVN`)) return;

    fs.readFile(
        `./notifications/${pluginData.guild.id}-normal.MRVN`,
        {},
        (err, data) => {
            if (err) {
                logger.info(err.name + "\n" + err.message);
            } else {
                pluginData.state.activeNotifications = JSON.parse(data.toString());
            }
        }
    );

    fs.readFile(
        `./notifications/${pluginData.guild.id}-voice.MRVN`,
        {},
        (err, data) => {
            if (err) {
                logger.info(err.name + "\n" + err.message);
            } else {
                pluginData.state.activeVCNotifications = JSON.parse(data.toString());
            }
        }
    );
}