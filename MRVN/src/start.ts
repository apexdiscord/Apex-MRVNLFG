import path from "path";
import yaml from "js-yaml";

import fs from "fs";
const fsp = fs.promises;

import { Client } from "eris";
import { Knub, logger } from "knub";
import { LfgPlugin } from "./plugins/lfg";
import { WherePlugin } from "./plugins/where";
import { UtilityPlugin } from "./plugins/utility";
import { successMessage, errorMessage } from "./utils";

const botClient = new Client(`Bot `, {
    getAllUsers: false,
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

        async getConfig() {
            const configFile = "config.yml";

            try {
                await fsp.access(configFile);
            } catch (e) {
                return {};
            }

            const yamlString = await fsp.readFile(configFile, { encoding: "utf8" });
            return yaml.safeLoad(yamlString);
        },
    },
});

logger.info("Starting the bot");
bot.run();