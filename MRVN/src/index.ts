import yaml from "js-yaml";
import path from "path";

import fs from "fs";
const fsp = fs.promises;

import { Client } from "eris";
import { Knub, logger } from "knub";
import { LfgPlugin } from "./plugins/lfg";
import { WherePlugin } from "./plugins/where";
import { UtilityPlugin } from "./plugins/utility";
import { successMessage, errorMessage, startUptimeCount } from "./utils";
import { customArgumentTypes } from "./customArgumentTypes";
import { loadRegex } from "./blockedWords";

require("dotenv").config({ path: path.resolve(process.cwd(), "bot.env") });

const botClient: Client = new Client(`Bot ${process.env.TOKEN}`, {
  restMode: true,
});

import moment from "moment-timezone";
// set TZ to UTC
moment.tz.setDefault("Etc/UTC");

const bot: Knub = new Knub(botClient, {
  plugins: [UtilityPlugin, LfgPlugin, WherePlugin],

  globalPlugins: [],

  options: {
    sendSuccessMessageFn(channel: any, body: any): void {
      channel.createMessage(successMessage(body));
    },

    sendErrorMessageFn(channel: any, body: any): void {
      channel.createMessage(errorMessage(body));
    },

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
      return yaml.safeLoad(yamlString);
    },

    logFn: (level, msg) => {
      // tslint:disable-next-line
      if (level === "debug") return;
      console.log(`[${level.toUpperCase()}] [${moment().toISOString()}] ${msg}`);
    },

    customArgumentTypes,
  },
});

logger.info("Starting the bot");
bot.run();
loadRegex();
startUptimeCount();
