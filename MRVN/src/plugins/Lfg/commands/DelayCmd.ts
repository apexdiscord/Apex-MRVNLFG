import { lfgCommand } from "../types";
import { trimLines } from "../../../utils";
import { sendErrorMessage } from "../../../pluginUtils";
import { logger } from "../../../logger";

export const DelayCmd = lfgCommand({
    trigger: "delay",
    permission: "can_delay",

    async run({message: msg, pluginData}) {
        if (pluginData.state.delay.length > 1) {
            const highest: any = Math.round(Math.max(...pluginData.state.delay));
            const lowest: any = Math.round(Math.min(...pluginData.state.delay));
            const mean: any = Math.round(pluginData.state.delay.reduce((t, v) => t + v, 0) / pluginData.state.delay.length);

            msg.channel.createMessage(
                trimLines(`
                    **LFG Delay:**
                    Lowest: **${lowest}ms**
                    Highest: **${highest}ms**
                    Mean: **${mean}ms**
                    `),
            );

        } else {
            sendErrorMessage(msg.channel, "No LFG requests yet, cannot display delays!");
        }

        logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested lfg delays`);
    }
});