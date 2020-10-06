import * as t from "io-ts";
import { BasePluginType, guildCommand, guildEventListener } from "knub";

export const ConfigSchema = t.type({
  can_ping: t.boolean,
  can_level: t.boolean,
  can_uptime: t.boolean,
  can_version: t.boolean,

  dm_response: t.string,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface UtilityPluginType extends BasePluginType {
  config: TConfigSchema;
}

export const utilityCommand = guildCommand<UtilityPluginType>();
export const utilityEvent = guildEventListener<UtilityPluginType>();
