import { PluginOptions, guildPlugin } from "knub";
import { GuildScalingCategories } from "../../data/GuildScalingCategories";
import { GuildScalingUnhides } from "../../data/GuildScalingUnhides";
import { automaticScalingCheckLoop } from "./utils/automaticScalingCheckLoop";
import { ScalingPluginType } from "./types";
import { AddScalingCategoryCmd } from "./commands/AddScalingCategoryCmd";
import { RemoveScalingCategoryCmd } from "./commands/RemoveScalingCategoryCmd";
import { ListScalingCategoryCmd } from "./commands/ListScalingCategoryCmd";
import { HideScalingCategoryCmd } from "./commands/HideScalingCategoryCmd";
import { UnhideScalingCategoryCmd } from "./commands/UnhideScalingCategoryCmd";
import { RunScalingCmd } from "./commands/RunScalingCmd";

const defaultOptions: PluginOptions<ScalingPluginType> = {
  config: {
    automatic: true,
    automatic_unhide_percentage: 85,
    automatic_warning_channel: "",

    can_add: false,
    can_remove: false,
    can_hide: false,
    can_unhide: false,
  },
  overrides: [
    {
      level: ">=50",
      config: {
        can_hide: true,
        can_unhide: true,
      },
    },
    {
      level: ">=100",
      config: {
        can_add: true,
        can_remove: true,
      },
    },
  ],
};

export const ScalingPlugin = guildPlugin<ScalingPluginType>()("scaling", {
  defaultOptions,

  // prettier-ignore
  commands: [
    AddScalingCategoryCmd,
    RemoveScalingCategoryCmd,
    ListScalingCategoryCmd,
    HideScalingCategoryCmd,
    UnhideScalingCategoryCmd,
    RunScalingCmd,
  ],

  async onLoad(pluginData) {
    const { state, guild } = pluginData;

    state.scalingCategories = GuildScalingCategories.getGuildInstance(guild.id);
    state.scalingUnhides = GuildScalingUnhides.getGuildInstance(guild.id);
    state.hidePermission = 1024;

    state.autoScalingCheckTimeout = null;

    state.unloaded = false;
    automaticScalingCheckLoop(pluginData);
  },

  async onUnload(pluginData) {
    pluginData.state.unloaded = true;
    clearTimeout(pluginData.state.autoScalingCheckTimeout);
  },
});
