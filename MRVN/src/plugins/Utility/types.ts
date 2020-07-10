import * as t from "io-ts";
import { BasePluginType, command, eventListener } from "knub";

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

export const utilityCommand = command<UtilityPluginType>();
export const utilityEvent = eventListener<UtilityPluginType>();