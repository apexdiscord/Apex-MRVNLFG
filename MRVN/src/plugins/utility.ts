import { decorators as d, IPluginOptions, Plugin, logger } from "knub";
import { Message, Member, PrivateChannel, NewsChannel, VERSION, TextableChannel } from "eris";
import { noop } from "knub/dist/utils";
import { trimLines, getUptime } from "../utils";
import { performance } from "perf_hooks";
import humanizeDuration from "humanize-duration";
import fs from "fs";
import moment from "moment-timezone";
import https from "https";

interface IUtilityPluginConfig {
  can_ping: boolean;
  can_level: boolean;
  can_uptime: boolean;
  can_version: boolean;

  dm_response: string;
}

const UPDATE_LOOP_TIME: number = 60 * 60 * 1000;

export class UtilityPlugin extends Plugin<IUtilityPluginConfig> {
  public static pluginName = "utility";

  public static VERSION: string = "1.0.4";
  public static NEWEST_VERSION: string = UtilityPlugin.VERSION;
  public static NEW_AVAILABLE: boolean = false;

  getDefaultOptions(): IPluginOptions<IUtilityPluginConfig> {
    return {
      config: {
        can_ping: false,
        can_level: false,
        can_uptime: false,
        can_version: false,

        dm_response: "Sorry, but you can only control this bot through commands within the server!",
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
            can_version: true,
          },
        },
      ],
    };
  }

  private updateTimeout;

  onLoad(): void {
    this.updateLoop();
  }

  async updateLoop(): Promise<void> {
    https.get(
      {
        hostname: "api.github.com",
        path: `/repos/DarkView/JS-MRVNLFG/tags`,
        headers: {
          "User-Agent": `MRVN Bot version ${UtilityPlugin.VERSION} (https://github.com/DarkView/JS-MRVNLFG)`,
        },
      },
      async res => {
        if (res.statusCode !== 200) {
          logger.warn(`[WARN] Got status code ${res.statusCode} when checking for available updates`);
          return;
        }

        let data: any = "";
        res.on("data", chunk => (data += chunk));
        res.on("end", async () => {
          const parsed: any = JSON.parse(data);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            return;
          }

          UtilityPlugin.NEWEST_VERSION = parsed[0].name;
          UtilityPlugin.NEW_AVAILABLE = await this.compareVersions(UtilityPlugin.NEWEST_VERSION, UtilityPlugin.VERSION);
          logger.info(
            `Newest bot version: ${UtilityPlugin.NEWEST_VERSION} | Current bot version: ${UtilityPlugin.VERSION} | New available: ${UtilityPlugin.NEW_AVAILABLE}`,
          );
        });
      },
    );

    this.updateTimeout = setTimeout(() => this.updateLoop(), UPDATE_LOOP_TIME);
  }

  async compareVersions(newer: string, older: string): Promise<boolean> {
    const newerParts: string[] = newer.split(".");
    const olderParts: string[] = older.split(".");

    for (let i: number = 0; i < Math.max(newerParts.length, olderParts.length); i++) {
      let newerPart: number = parseInt((newerParts[i] || "0").match(/\d+/)[0] || "0", 10);
      let olderPart: number = parseInt((olderParts[i] || "0").match(/\d+/)[0] || "0", 10);
      if (newerPart > olderPart) {
        return true;
      }
      if (newerPart < olderPart) {
        return false;
      }
    }

    return false;
  }

  @d.cooldown(10 * 1000)
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

    this.bot
      .deleteMessages(
        messages[0].channel.id,
        messages.map(m => m.id),
      )
      .catch(noop);

    logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested bot ping`);
  }

  @d.command("level", "[member:resolvedMember]")
  @d.permission("can_level")
  async levelRequest(msg: Message, args: { member?: Member }): Promise<any> {
    const member: Member = args.member || msg.member;
    const level: any = this.getMemberLevel(member);
    msg.channel.createMessage(`The permission level of ${member.username}#${member.discriminator} is **${level}**`);

    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested ${member.id}'s user level (${level})`,
    );
  }

  @d.cooldown(5 * 1000)
  @d.command("uptime")
  @d.permission("can_uptime")
  async uptimeRequest(msg: Message): Promise<any> {
    msg.channel.createMessage(
      `**Current Uptime:** ${humanizeDuration(getUptime(), {
        largest: 2,
        round: true,
      })}`,
    );

    logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested bot uptime`);
  }

  @d.cooldown(5 * 1000)
  @d.command("version")
  @d.permission("can_version")
  async versionRequest(msg: Message): Promise<void> {
    let reply: string;

    if (UtilityPlugin.NEW_AVAILABLE) {
      reply = `New bot version available!\nCurrent bot version: **${UtilityPlugin.VERSION}**\nLatest version: **${UtilityPlugin.NEWEST_VERSION}**`;
    } else {
      reply = `You have the newest bot version! Version: **${UtilityPlugin.VERSION}**`;
    }

    msg.channel.createMessage(reply);
  }

  @d.event("messageCreate", "dm", true)
  async dmReceived(msg: Message): Promise<any> {
    logger.log(`${msg.author.id} said the following in DMs: ${msg.cleanContent}`);

    const cfg: IUtilityPluginConfig = this.getConfig();
    msg.channel.createMessage(cfg.dm_response);

    // tslint:disable-next-line: max-line-length
    fs.appendFile(
      "DMMessages.txt",
      `\n${moment().toISOString()} | ${msg.author.id} | ${msg.author.username}#${msg.author.discriminator}: ${
        msg.cleanContent
      }`,
      err => {
        if (err) {
          logger.info(err.name + "\n" + err.message);
        }
      },
    );
  }
}
