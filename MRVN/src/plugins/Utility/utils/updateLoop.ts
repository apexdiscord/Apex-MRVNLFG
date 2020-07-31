import { PluginData } from "knub";
import https from "https";
import { UtilityPluginType } from "../types";
import { compareVersions } from "./compareVersions";
import { logger } from "../../../logger";

const UPDATE_LOOP_TIME: number = 60 * 60 * 1000;

export async function updateLoop(pluginData: PluginData<UtilityPluginType>): Promise <void> {
    https.get(
        {
            hostname: "api.github.com",
            path: `/repos/DarkView/JS-MRVNLFG/tags`,
            headers: {
                "User-Agent": `MRVN Bot version ${pluginData.state.VERSION} (https://github.com/DarkView/JS-MRVNLFG)`,
            },
        },
        async (res) => {
            if (res.statusCode !== 200) {
                logger.warn(`Got status code ${res.statusCode} when checking for available updates`);
                return;
            }

            let data: any = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", async () => {
                const parsed: any = JSON.parse(data);
                if (!Array.isArray(parsed) || parsed.length === 0) {
                    return;
                }

                pluginData.state.NEWEST_VERSION = parsed[0].name;
                pluginData.state.NEW_AVAILABLE = await compareVersions(pluginData.state.NEWEST_VERSION, pluginData.state.VERSION);
                logger.info(
                    `Newest bot version: ${pluginData.state.NEWEST_VERSION} | Current bot version: ${pluginData.state.VERSION} | New available: ${pluginData.state.NEW_AVAILABLE}`,
                );
            });
        },
    );

    if (pluginData.state.unloaded) { return; }
    pluginData.state.updateTimeout = setTimeout(() => updateLoop(pluginData), UPDATE_LOOP_TIME);
}