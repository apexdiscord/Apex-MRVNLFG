import fs from "fs";
import { onlyDM } from "knub/dist/events/eventFilters";
import moment from "moment-timezone";
import { utilityEvent } from "../types";
import { logger } from "../../../logger";

export const DmMessageCreateEvt = utilityEvent({
  event: "messageCreate",
  allowBots: false,
  allowOutsideOfGuild: true,
  filters: [onlyDM()],

  async listener(meta) {
    const msg = meta.args.message;
    logger.log(`${msg.author.id} said the following in DMs: ${msg.cleanContent}`);

    const cfg = meta.pluginData.config.getForUser(msg.author);
    msg.channel.createMessage(cfg.dm_response);

    fs.appendFile(
      "DMMessages.txt",
      `\n${moment().toISOString()} | ${msg.author.id} | ${msg.author.username}#${msg.author.discriminator}: ${
        msg.cleanContent
      }`,
      (err) => {
        if (err) {
          logger.info(err.name + "\n" + err.message);
        }
      },
    );
  },
});
