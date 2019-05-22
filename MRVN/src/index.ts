import { yaml } from "js-yaml";
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

const botClient = new Client(`Bot `, {
    getAllUsers: true,
    restMode: true,
});

const bot = new Knub(botClient, {
    plugins: [UtilityPlugin, LfgPlugin, WherePlugin],

    globalPlugins: [],

    options: {
        sendSuccessMessageFn(channel, body) {
            channel.createMessage(successMessage(body));
        },

        sendErrorMessageFn(channel, body) {
            channel.createMessage(errorMessage(body));
        },

        async getConfig(id) {
            const configFile = id ? `${id}.yml` : "global.yml";
            const configPath = path.join("config", configFile);

            try {
                await fsp.access(configPath);
            } catch (e) {
                return {};
            }

            const yamlString = await fsp.readFile(configPath, { encoding: "utf8" });
            return yaml.safeLoad(yamlString);
        },

        logFn: (level, msg) => {
            if (level === "debug") return;
            // tslint:disable-next-line
            console.log(`[${level.toUpperCase()}] ${msg}`);
        },

        customArgumentTypes,

    },
});

logger.info("Starting the bot");
bot.run();
startUptimeCount();