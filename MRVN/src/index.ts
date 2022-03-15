import path from "path";
import fs from "fs";
import yaml from "js-yaml";

const fsp = fs.promises;

import { Knub } from "knub";
import { DateTime, Settings } from "luxon";
import { Client } from "discord.js";
import { loadRegex } from "./utils/blockedWords";
import { LfgPlugin } from "./plugins/Lfg/LfgPlugin";
import { startUptimeCount } from "./utils/utils";
import { logger } from "./utils/logger";
import { ModerationPlugin } from "./plugins/Moderation/ModerationPlugin";
import { connect } from "./data/db";

require("dotenv").config({ path: path.resolve(process.cwd(), "bot.env") });

// set TZ to UTC
Settings.defaultZone = "utc";

connect().then(async () => {
  const botClient = new Client({
    allowedMentions: { repliedUser: true, parse: ["roles", "users"] },
    partials: ["CHANNEL", "GUILD_MEMBER", "GUILD_SCHEDULED_EVENT", "MESSAGE", "REACTION", "USER"],
    presence: { status: "online", activities: [{ type: "WATCHING", name: "for LFG requests" }] },
    intents: ["GUILDS", "GUILD_BANS", "GUILD_VOICE_STATES", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
  });

  botClient.on("debug", (message) => {
    if (message.includes(" 429 ")) {
      logger.info(`[429] [${DateTime.now().toISOTime()}] ${message}`);
    }
  });

  const bot: Knub = new Knub(botClient, {
    guildPlugins: [LfgPlugin, ModerationPlugin],

    globalPlugins: [],

    options: {
      async getConfig(id: any): Promise<any> {
        const configFile: any = id ? `${id}.yml` : "global.yml";
        const configPath: any = path.join("config", configFile);

        try {
          await fsp.access(configPath);
        } catch (e) {
          return {};
        }

        const yamlString: any = await fsp.readFile(configPath, {
          encoding: "utf8",
        });
        return yaml.load(yamlString);
      },

      logFn: (level, msg) => {
        if (level === "debug") return;
        // eslint-disable-next-line no-console
        console.log(`[KNB] [${DateTime.now().toISOTime()}] ${msg}`);
      },
    },
  });

  bot.initialize();
  logger.info("Bot Initialized");
  logger.info("Logging in...");
  await botClient.login(process.env.TOKEN);

  loadRegex();
  startUptimeCount();
});
