import { CategoryChannel, TextChannel, VoiceChannel } from "discord.js";
import { PluginError, PluginOptions, typedGuildPlugin } from "knub";
import { GuildBlocks } from "../../data/GuildBlocks";
import { GuildActiveLFGs } from "../../data/GuildActiveLFGs";
import { logger } from "../../utils/logger";
import { GuildKickBlockCounter } from "../../data/GuildKickBlockCounter";
import { GuildModbans } from "../../data/GuildModbans";
import { lfgButtonJoinCommandListener } from "./otherInteractions/lfgJoin";
import { VoiceStateUpdateLFGEmptyEvt } from "./events/LFGVoiceEmpty";
import { VoiceStateUpdateLFGEvt } from "./events/LFGVoiceUpdate";
import { lfgCreateSlashCommandListener } from "./slashCommands/lfgCreate";
import { LfgPluginType } from "./types";
import { lfgCancelSlashCommandListener } from "./slashCommands/lfgCancel";
import { lfgBlockSlashCommandListener } from "./slashCommands/lfgBlock";
import { lfgUnblockSlashCommandListener } from "./slashCommands/lfgUnblock";
import { lfgBlocklistSlashCommandListener } from "./slashCommands/lfgBlocklist";
import { lfgKickSlashCommandListener } from "./slashCommands/lfgKick";
import { lfgKickSelectionCommandListener } from "./otherInteractions/lfgKickSelection";
import { runKickBlockCounterCleanupLoop } from "./utils/counterManager";
import { runLFGCleanupLoop } from "./utils/handleLfgRequest";
import { lfgModbanSlashCommandListener } from "./slashCommands/lfgModban";

const defaultOptions: PluginOptions<LfgPluginType> = {
  config: {
    hubVoice: null,
    alertText: null,
    logText: null,
  },
  overrides: [],
};

export const LfgPlugin = typedGuildPlugin<LfgPluginType>()({
  defaultOptions,
  name: "lfg",

  // prettier-ignore
  commands: [
  ],

  // prettier-ignore
  events: [
    lfgCreateSlashCommandListener,
    lfgCancelSlashCommandListener,
    lfgBlockSlashCommandListener,
    lfgUnblockSlashCommandListener,
    lfgBlocklistSlashCommandListener,
    lfgKickSlashCommandListener,
    lfgKickSelectionCommandListener,
    lfgButtonJoinCommandListener,
    lfgModbanSlashCommandListener,
    VoiceStateUpdateLFGEvt,
    VoiceStateUpdateLFGEmptyEvt,
  ],

  configPreprocessor: (options) => {
    if (options.config.hubVoice == null) {
      logger.error("hubVoice must be a valid voice channel ID");
    }

    return options;
  },

  afterLoad: async (pluginData) => {
    const config = await pluginData.config.get();

    const hubVoice = await pluginData.guild.channels.fetch(config.hubVoice!);
    if (hubVoice && hubVoice instanceof VoiceChannel) {
      pluginData.state.hubVoice = hubVoice;
    } else {
      logger.error("hubVoice is not a valid voice channel");
    }

    const alertText = await pluginData.guild.channels.fetch(pluginData.config.get().alertText!);
    if (alertText && alertText instanceof TextChannel) {
      pluginData.state.alertText = alertText;
    } else {
      logger.error("alertText is not a valid text channel");
    }

    const logText = await pluginData.guild.channels.fetch(pluginData.config.get().logText!);
    if (logText && logText instanceof TextChannel) {
      pluginData.state.logText = logText;
    } else {
      logger.error("logText is not a valid text channel");
    }

    pluginData.state.activeLfgs = new GuildActiveLFGs(pluginData.guild.id);
    pluginData.state.blocks = new GuildBlocks(pluginData.guild.id);
    pluginData.state.kickBlockCounter = new GuildKickBlockCounter(pluginData.guild.id);
    pluginData.state.modbans = new GuildModbans(pluginData.guild.id);

    pluginData.state.lfgCats = ["982695326873956362", "983129874963234816", "983129908769337444", "986352001770213406"];
    pluginData.state.lfgCatAmt = [];
    for (let i = 0; i < pluginData.state.lfgCats.length; i++) {
      pluginData.state.lfgCatAmt[i] = (
        (await pluginData.guild.channels.fetch(pluginData.state.lfgCats[i])) as CategoryChannel
      ).children.size;
    }
    pluginData.state.lfgCatLimit = 50 - 3; // -3 for safety

    await runKickBlockCounterCleanupLoop(pluginData);
    await runLFGCleanupLoop(pluginData);
  },
});
