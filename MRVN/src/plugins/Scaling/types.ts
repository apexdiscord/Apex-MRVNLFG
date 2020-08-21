import * as t from "io-ts";
import { BasePluginType, command, eventListener } from "knub";
import { GuildScalingCategories } from "../../data/GuildScalingCategories";
import { GuildScalingUnhides } from "../../data/GuildScalingUnhides";

export const ConfigSchema = t.type({
  automatic: t.boolean,
  automatic_unhide_percentage: t.number,
  automatic_warning_channel: t.string,

  can_add: t.boolean,
  can_remove: t.boolean,
  can_hide: t.boolean,
  can_unhide: t.boolean,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface ScalingPluginType extends BasePluginType {
  config: TConfigSchema;
  state: {
    scalingCategories: GuildScalingCategories;
    scalingUnhides: GuildScalingUnhides;
    hidePermission: number;

    unloaded: boolean;
    autoScalingCheckTimeout: NodeJS.Timeout;
  };
}

export const scalingCommand = command<ScalingPluginType>();
export const scalingEvent = eventListener<ScalingPluginType>();
