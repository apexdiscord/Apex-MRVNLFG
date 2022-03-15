import * as t from "io-ts";
import { BasePluginType, typedGuildCommand, typedGuildEventListener } from "knub";

export const ConfigSchema = t.type({});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface LfgPluginType extends BasePluginType {
  config: TConfigSchema;
}

export const lfgCommand = typedGuildCommand<LfgPluginType>();
export const lfgEvent = typedGuildEventListener<LfgPluginType>();
