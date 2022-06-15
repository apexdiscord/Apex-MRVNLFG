import * as t from "io-ts";
import { BasePluginType, typedGuildCommand, typedGuildEventListener } from "knub";

export const ConfigSchema = t.type({});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface ModerationPluginType extends BasePluginType {
  config: TConfigSchema;
}

export const moderationCommand = typedGuildCommand<ModerationPluginType>();
export const moderationEvent = typedGuildEventListener<ModerationPluginType>();
