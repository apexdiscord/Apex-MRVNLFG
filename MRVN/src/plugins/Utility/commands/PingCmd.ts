import { trimLines } from "../../../utils";
import { utilityCommand } from "../types";
import { Message } from "eris";
import { performance } from "perf_hooks";
import { noop } from "knub/dist/utils";
import { logger } from "../../../logger";

export const PingCmd = utilityCommand({
    trigger: "ping",
    permission: "can_ping",
    cooldown: 10 * 1000,

    async run({ message: msg, pluginData }) {
        const times: any = [];
        const messages: Message[] = [];
        let msgToMsgDelay: any = null;

        for (let i: any = 0; i < 4; i++) {
            const start: any = performance.now();
            const message: Message = await msg.channel.createMessage(`Calculating ping... ${i + 1}`);
            times.push(performance.now() - start);
            messages.push(message);

            if (msgToMsgDelay === null) {
                msgToMsgDelay = message.timestamp - msg.timestamp;
            }
        }

        const highest: any = Math.round(Math.max(...times));
        const lowest: any = Math.round(Math.min(...times));
        const mean: any = Math.round(times.reduce((t, v) => t + v, 0) / times.length);

        msg.channel.createMessage(
            trimLines(`
                **Ping:**
                Lowest: **${lowest}ms**
                Highest: **${highest}ms**
                Mean: **${mean}ms**
                Time between ping command and first reply: **${msgToMsgDelay}ms**
            `),
        );

        pluginData.client
            .deleteMessages(
                messages[0].channel.id,
                messages.map((m) => m.id),
            )
            .catch(noop);

        logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested bot ping`);
    }
});