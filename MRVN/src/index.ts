import path from "path";
import fs from "fs";
import yaml from "js-yaml";

const fsp = fs.promises;

import { Client } from "eris";
import { Knub } from "knub";
import moment from "moment-timezone";
import { loadRegex } from "./blockedWords";
import { LfgPlugin } from "./plugins/Lfg/LfgPlugin";
import { startUptimeCount } from "./utils";
import { UtilityPlugin } from "./plugins/Utility/UtilityPlugin";
import { WherePlugin } from "./plugins/Where/WherePlugin";
import { logger } from "./logger";

require("dotenv").config({ path: path.resolve(process.cwd(), "bot.env") });

const botClient: Client = new Client(`Bot ${process.env.TOKEN}`, {
  restMode: true,
});

// set TZ to UTC
moment.tz.setDefault("Etc/UTC");

const bot: Knub = new Knub(botClient, {
  guildPlugins: [LfgPlugin, UtilityPlugin, WherePlugin],

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
      return yaml.safeLoad(yamlString);
    },

    logFn: (level, msg) => {
      if (level === "debug") return;
      // eslint-disable-next-line no-console
      console.log(`[${level.toUpperCase()}] [${moment().toISOString()}] ${msg}`);
    },
  },
});

if (!fs.existsSync("./notifications")) {
  fs.mkdirSync("./notifications");
}

logger.info("Starting the bot");

bot.run();

loadRegex();
startUptimeCount();
