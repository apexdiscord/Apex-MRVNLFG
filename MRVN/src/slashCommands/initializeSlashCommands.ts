import { Snowflake } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { logger } from "../utils/logger";
import { lfgCreateSlashCommand } from "./lfgCreate";
import { lfgCancelSlashCommand } from "./lfgCancel";
import { lfgBlockSlashCommand } from "./lfgBlock";
import { lfgUnblockSlashCommand } from "./lfgUnblock";
import { lfgBlocklistSlashCommand } from "./lfgBlocklist";
import { lfgKickSlashCommand } from "./lfgKick";
import { lfgModbanSlashCommand } from "./lfgModban";

export async function initializeSlashCommands(clientId: Snowflake) {
  // Grab all slash commands
  const commands = [
    lfgCreateSlashCommand,
    lfgCancelSlashCommand,
    // lfgBlockSlashCommand,
    // lfgUnblockSlashCommand,
    // lfgBlocklistSlashCommand,
    lfgKickSlashCommand,
    lfgModbanSlashCommand,
  ];

  const rest: REST = new REST({ version: "10" }).setToken(process.env.TOKEN!);

  logger.info(`Initializing ${commands.length} slash commands`);

  try {
    await rest.put(Routes.applicationGuildCommands(clientId, "995996228359827456"), { body: commands });
  } catch (e: any) {
    logger.error(`Failed to initialize slash commands: ${e}`);
  }

  logger.info("Slash commands initialized");
}
