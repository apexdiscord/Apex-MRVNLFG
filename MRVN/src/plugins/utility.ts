import { decorators as d, IPluginOptions, Plugin, logger } from "knub";
import { Message, Member, PrivateChannel } from "eris";
import { noop } from "knub/dist/utils";
import { trimLines, getUptime } from "../utils";
import { performance } from "perf_hooks";
import humanizeDuration from "humanize-duration";
import fs from "fs";
import moment from "moment-timezone";

interface IUtilityPluginConfig {
    can_ping: boolean;
    can_level: boolean;
    can_uptime: boolean;

    dm_response: string;
}

export class UtilityPlugin extends Plugin<IUtilityPluginConfig> {
    public static pluginName = "utility";

    getDefaultOptions(): IPluginOptions<IUtilityPluginConfig> {
        return {
            config: {
                can_ping: false,
                can_level: false,
                can_uptime: false,

                dm_response: "Sorry, but you can only control this bot through commands within the server!"
            },
            overrides: [
                {
                    level: ">=1",
                    config: {
                        can_level: true,
                    },
                },
                {
                    level: ">=50",
                    config: {
                        can_ping: true,
                        can_uptime: true,
                    },
                },
            ],
        };
    }

    @d.command("ping")
    @d.permission("can_ping")
    async pingRequest(msg: Message): Promise<any> {
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

        this.bot.deleteMessages(messages[0].channel.id, messages.map(m => m.id)).catch(noop);

        logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested bot ping`);
    }

    @d.command("level", "[member:resolvedMember]")
    @d.permission("can_level")
    async levelRequest(msg: Message, args: { member?: Member }): Promise<any> {
        const member: Member = args.member || msg.member;
        const level: any = this.getMemberLevel(member);
        msg.channel.createMessage(`The permission level of ${member.username}#${member.discriminator} is **${level}**`);

        logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested ${member.id}'s user level (${level})`);
    }

    @d.command("uptime")
    @d.permission("can_uptime")
    async uptimeRequest(msg: Message): Promise<any> {
        msg.channel.createMessage(`**Current Uptime:** ${humanizeDuration(getUptime(), { largest: 2, round: true })}`);

        logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested bot uptime`);
    }

    @d.event("messageCreate", "dm", true)
    async dmReceived(msg: Message): Promise<any> {
        logger.log(`${msg.author.id} said the following in DMs: ${msg.cleanContent}`);

        const cfg: IUtilityPluginConfig = this.getConfig();
        msg.channel.createMessage(cfg.dm_response);

        // tslint:disable-next-line: max-line-length
        fs.appendFile("DMMessages.txt", `\n${moment().toISOString()} | ${msg.author.id} | ${msg.author.username}#${msg.author.discriminator}: ${msg.cleanContent}`, (err) => {
            if (err) {
                logger.info(err.name + "\n" + err.message);
            }
        });
    }

}