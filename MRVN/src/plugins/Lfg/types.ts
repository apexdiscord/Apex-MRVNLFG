import { TextChannel, VoiceChannel } from "discord.js";
import * as t from "io-ts";
import { BasePluginType, typedGuildCommand, typedGuildEventListener } from "knub";
import { GuildModbans } from "src/data/GuildModbans";
import { GuildActiveLFGs } from "../../data/GuildActiveLFGs";
import { GuildBlocks } from "../../data/GuildBlocks";
import { GuildKickBlockCounter } from "../../data/GuildKickBlockCounter";
import { tNullable } from "../../utils/utils";

export const ConfigSchema = t.type({
  hubVoice: tNullable(t.string),
  alertText: tNullable(t.string),
  logText: tNullable(t.string),
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface LfgPluginType extends BasePluginType {
  config: TConfigSchema;
  state: {
    hubVoice: VoiceChannel;
    alertText: TextChannel;
    logText: TextChannel;

    lfgCats: string[];
    lfgCatAmt: number[];
    lfgCatLimit: number;

    activeLfgs: GuildActiveLFGs;
    blocks: GuildBlocks;
    kickBlockCounter: GuildKickBlockCounter;
    modbans: GuildModbans;
  };
}

export const lfgCommand = typedGuildCommand<LfgPluginType>();
export const lfgEvent = typedGuildEventListener<LfgPluginType>();
