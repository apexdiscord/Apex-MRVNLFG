import { decorators as d, IPluginOptions, Plugin } from "knub";
import { Message, Member } from "eris";
import { noop } from "knub/dist/utils";
import { trimLines } from "../utils";

const { performance } = require("perf_hooks");

interface IUtilityPluginConfig {
    can_ping: boolean;
    can_level: boolean;
}

export class UtilityPlugin extends Plugin<IUtilityPluginConfig> {
    public static pluginName = "utility";

    getDefaultOptions(): IPluginOptions<IUtilityPluginConfig> {
        return {
            config: {
                can_ping: false,
                can_level: true,
            },
            overrides: [
                {
                    level: ">=50",
                    config: {
                        can_ping: true,
                    },
                },
            ],
        };
    }

    //Shamelessly stolen from Dragory
    @d.command("ping")
    @d.permission("can_ping")
    async pingCmd(msg: Message) {
        const times = [];
        const messages: Message[] = [];
        let msgToMsgDelay = null;

        for (let i = 0; i < 4; i++) {
            const start = performance.now();
            const message = await msg.channel.createMessage(`Calculating ping... ${i + 1}`);
            times.push(performance.now() - start);
            messages.push(message);

            if (msgToMsgDelay === null) {
                msgToMsgDelay = message.timestamp - msg.timestamp;
            }
        }

        const highest = Math.round(Math.max(...times));
        const lowest = Math.round(Math.min(...times));
        const mean = Math.round(times.reduce((t, v) => t + v, 0) / times.length);

        const shard = this.bot.shards.get(this.bot.guildShardMap[this.guildId]);

        msg.channel.createMessage(
            trimLines(`
      **Ping:**
      Lowest: **${lowest}ms**
      Highest: **${highest}ms**
      Mean: **${mean}ms**
      Time between ping command and first reply: **${msgToMsgDelay}ms**
      Shard latency: **${shard.latency}ms**
    `),
        );

        // Clean up test messages
        this.bot.deleteMessages(messages[0].channel.id, messages.map(m => m.id)).catch(noop);
    }

    @d.command("level")
    @d.permission("can_level")
    async levelCmd(msg: Message) {
        const level = this.getMemberLevel(msg.member);
        msg.channel.createMessage(`The permission level of ${msg.member.username}#${msg.member.discriminator} is **${level}**`);
    }

}
